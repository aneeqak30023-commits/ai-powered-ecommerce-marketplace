import express from 'express'
import { PrismaClient } from '@prisma/client'
import { authMiddleware } from '../middleware/auth.js'
import { createSafepayPayment, createSafepayAuthToken, buildSafepayCheckoutUrl, fetchSafepayPaymentStatus, isSafepayConfigured, verifySafepayWebhookSignature, mapSafepayStateToStatus } from '../services/safepay.js'
import { safeError } from '../utils/errors.js'

const router = express.Router()
const prisma = new PrismaClient()

const VALID_PAYMENT_METHODS = ['cash_on_delivery', 'online']
const VALID_PAYMENT_STATUSES = ['pending', 'processing', 'paid', 'failed', 'cancelled', 'refunded']

function serializePayment(payment) {
  return {
    id: payment.id,
    orderId: payment.orderId,
    userId: payment.userId,
    paymentMethod: payment.paymentMethod,
    status: payment.status,
    amount: payment.amount,
    currency: payment.currency,
    provider: payment.provider,
    providerReference: payment.providerReference,
    createdAt: payment.createdAt,
    updatedAt: payment.updatedAt,
  }
}

function coerceNumber(value) {
  const n = Number(value)
  return Number.isFinite(n) ? n : null
}

router.get('/:orderNumber', authMiddleware, async (req, res) => {
  try {
    const { orderNumber } = req.params
    const tracker = req.query.tracker

    const order = await prisma.order.findFirst({
      where: {
        orderNumber,
        userId: req.userId,
      },
      include: {
        payment: true,
      },
    })

    if (!order) {
      return res.status(404).json({ error: 'Order not found' })
    }

    if (!order.payment) {
      return res.status(404).json({ error: 'Payment not found for this order' })
    }

    let payment = order.payment

    if (tracker && ['pending', 'processing'].includes(payment.status) && isSafepayConfigured()) {
      try {
        const safepayTracker = await fetchSafepayPaymentStatus(tracker)
        if (safepayTracker) {
          const newStatus = mapSafepayStateToStatus(safepayTracker.state)
          if (newStatus && newStatus !== payment.status) {
            payment = await prisma.payment.update({
              where: { id: payment.id },
              data: {
                status: newStatus,
                providerReference: tracker,
              },
            })
          }
        }
      } catch (safepayError) {
        console.error('Failed to fetch Safepay payment status:', safepayError.message)
      }
    }

    res.json(serializePayment(payment))
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch payment', message: safeError(error) })
  }
})

router.post('/', authMiddleware, async (req, res) => {
  try {
    const { orderNumber, paymentMethod } = req.body

    if (!orderNumber || !paymentMethod) {
      return res.status(400).json({ error: 'Order number and payment method are required' })
    }

    const trimmedPaymentMethod = String(paymentMethod).trim().toLowerCase()
    if (!VALID_PAYMENT_METHODS.includes(trimmedPaymentMethod)) {
      return res.status(400).json({ error: `Payment method must be one of: ${VALID_PAYMENT_METHODS.join(', ')}` })
    }

    const order = await prisma.order.findFirst({
      where: {
        orderNumber,
        userId: req.userId,
      },
      include: {
        payment: true,
      },
    })

    if (!order) {
      return res.status(404).json({ error: 'Order not found' })
    }

    if (order.payment) {
      return res.status(409).json({ error: 'Payment already exists for this order' })
    }

    const status = trimmedPaymentMethod === 'cash_on_delivery' ? 'pending' : 'pending'

    const payment = await prisma.payment.create({
      data: {
        orderId: order.id,
        userId: req.userId,
        paymentMethod: trimmedPaymentMethod,
        status,
        amount: Number(order.total) || 0,
        currency: 'USD',
        provider: trimmedPaymentMethod === 'online' ? 'safepay' : null,
      },
      include: {
        order: {
          select: {
            orderNumber: true,
            status: true,
            total: true,
          },
        },
      },
    })

    if (trimmedPaymentMethod === 'online') {
      if (!isSafepayConfigured()) {
        return res.status(201).json({
          ...serializePayment(payment),
          checkoutUrl: null,
          message: 'Safepay is not configured. Payment record created but checkout is unavailable.',
        })
      }

      try {
        const amountInLowestDenomination = Math.round(Number(order.total) * 100)
        const { token } = await createSafepayPayment(amountInLowestDenomination, 'USD', order.orderNumber)

        const { token: authToken } = await createSafepayAuthToken()

        const checkoutUrl = await buildSafepayCheckoutUrl(
          token,
          authToken,
          order.orderNumber,
          `${req.protocol}://${req.get('host')}/payment/return?orderNumber=${encodeURIComponent(order.orderNumber)}&tracker=${encodeURIComponent(token)}`,
          `${req.protocol}://${req.get('host')}/payment/return?orderNumber=${encodeURIComponent(order.orderNumber)}`
        )

        await prisma.payment.update({
          where: { id: payment.id },
          data: { providerReference: token, status: 'processing' },
        })

        const updatedPayment = await prisma.payment.findUnique({
          where: { id: payment.id },
          include: {
            order: {
              select: {
                orderNumber: true,
                status: true,
                total: true,
              },
            },
          },
        })

        return res.status(201).json({
          ...serializePayment(updatedPayment),
          checkoutUrl,
        })
      } catch (safepayError) {
        console.error('Safepay checkout creation failed:', safepayError.constructor.name, '-', safepayError.message)
        if (safepayError.response) {
          console.error('Safepay API error status:', safepayError.response.status)
        }
        console.error(safepayError.stack)
        return res.status(201).json({
          ...serializePayment(payment),
          checkoutUrl: null,
          message: 'Payment record created but Safepay checkout could not be initialized.',
        })
      }
    }

    res.status(201).json(serializePayment(payment))
  } catch (error) {
    res.status(500).json({ error: 'Failed to create payment', message: safeError(error) })
  }
})

router.post('/webhook', async (req, res) => {
  try {
    if (!isSafepayConfigured()) {
      return res.status(400).json({ error: 'Safepay is not configured' })
    }

    const payloadData = req.body?.data
    const signature = req.headers['x-sfpy-signature']

    if (!payloadData || !verifySafepayWebhookSignature(payloadData, signature)) {
      return res.status(401).json({ error: 'Invalid webhook signature' })
    }

    const notification = payloadData.notification || {}
    const tracker = notification.tracker
    const state = notification.state
    const amount = notification.amount
    const currency = notification.currency

    if (!tracker) {
      return res.status(400).json({ error: 'Missing tracker in webhook' })
    }

    const newStatus = mapSafepayStateToStatus(state)
    if (!newStatus) {
      return res.status(200).json({ message: `Unhandled payment state: ${state}` })
    }

    const existingPayment = await prisma.payment.findFirst({
      where: { providerReference: tracker },
      include: { order: true },
    })

    if (!existingPayment) {
      return res.status(404).json({ error: 'Payment not found for tracker' })
    }

    if (existingPayment.status === 'paid' && newStatus === 'paid') {
      return res.status(200).json({ message: 'Payment already marked as paid' })
    }

    if (existingPayment.status === 'cancelled' && newStatus === 'paid') {
      return res.status(200).json({ message: 'Cannot mark cancelled payment as paid' })
    }

    const updatedPayment = await prisma.payment.update({
      where: { id: existingPayment.id },
      data: {
        status: newStatus,
        amount: amount ? Number(amount) : existingPayment.amount,
        currency: currency || existingPayment.currency,
        providerReference: tracker,
      },
    })

    res.status(200).json({
      message: 'Payment updated',
      payment: serializePayment(updatedPayment),
    })
  } catch (error) {
    console.error('Webhook processing error:', error.message)
    res.status(500).json({ error: 'Webhook processing failed' })
  }
})

export default router