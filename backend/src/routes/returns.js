import express from 'express'
import { PrismaClient } from '@prisma/client'
import { authMiddleware } from '../middleware/auth.js'
import { safeError } from '../utils/errors.js'

const router = express.Router()
const prisma = new PrismaClient()

const VALID_RETURN_STATUSES = ['requested', 'approved', 'rejected', 'returned', 'refunded', 'cancelled']
const VALID_RETURN_REASONS = ['defective', 'wrong_item', 'not_as_described', 'changed_mind', 'damaged_in_shipping', 'other']
const VALID_ITEM_CONDITIONS = ['new_with_tags', 'like_new', 'good', 'fair', 'damaged', 'defective']
const ELIGIBLE_ORDER_STATUSES = ['shipped', 'delivered']
const RETURN_WINDOW_DAYS = 30
const ACTIVE_RETURN_STATUSES = ['requested', 'approved', 'returned']

function serializeReturn(returnRecord) {
  return {
    id: returnRecord.id,
    orderId: returnRecord.orderId,
    orderNumber: returnRecord.order?.orderNumber || null,
    status: returnRecord.status,
    reason: returnRecord.reason,
    description: returnRecord.description,
    totalAmount: returnRecord.totalAmount,
    currency: returnRecord.currency,
    returnShippingCost: returnRecord.returnShippingCost,
    approvedAt: returnRecord.approvedAt,
    rejectedAt: returnRecord.rejectedAt,
    receivedAt: returnRecord.receivedAt,
    createdAt: returnRecord.createdAt,
    updatedAt: returnRecord.updatedAt,
    items: (returnRecord.items || []).map(serializeReturnItem),
    refunds: (returnRecord.refunds || []).map(serializeRefund),
  }
}

function serializeReturnItem(item) {
  return {
    id: item.id,
    returnId: item.returnId,
    orderItemId: item.orderItemId,
    productId: item.productId,
    name: item.name,
    price: item.price,
    quantity: item.quantity,
    condition: item.condition,
    reason: item.reason,
    createdAt: item.createdAt,
  }
}

function serializeRefund(refund) {
  return {
    id: refund.id,
    paymentId: refund.paymentId,
    returnId: refund.returnId,
    orderId: refund.orderId,
    amount: refund.amount,
    currency: refund.currency,
    status: refund.status,
    method: refund.method,
    notes: refund.notes,
    processedBy: refund.processedBy,
    processedAt: refund.processedAt,
    createdAt: refund.createdAt,
    updatedAt: refund.updatedAt,
  }
}

router.get('/eligibility/:orderNumber', authMiddleware, async (req, res) => {
  try {
    const { orderNumber } = req.params

    const order = await prisma.order.findFirst({
      where: { orderNumber, userId: req.userId },
      include: { items: true, payment: true },
    })

    if (!order) {
      return res.status(404).json({ error: 'Order not found' })
    }

    const isEligible = checkReturnEligibility(order)
    if (!isEligible.eligible) {
      return res.json({ eligible: false, reason: isEligible.reason })
    }

    const existingActiveReturn = await prisma.return.findFirst({
      where: {
        orderId: order.id,
        status: { in: ACTIVE_RETURN_STATUSES },
      },
    })

    if (existingActiveReturn) {
      return res.json({
        eligible: false,
        reason: 'A return is already in progress for this order.',
        returnId: existingActiveReturn.id,
        status: existingActiveReturn.status,
      })
    }

    const returnableItems = await getReturnableItems(order)

    return res.json({
      eligible: true,
      orderNumber: order.orderNumber,
      orderStatus: order.status,
      deliveredAt: order.deliveredAt,
      totalAmount: order.total,
      currency: order.payment?.currency || 'USD',
      returnableItems,
    })
  } catch (error) {
    res.status(500).json({ error: 'Failed to check eligibility', message: safeError(error) })
  }
})

function checkReturnEligibility(order) {
  if (!ELIGIBLE_ORDER_STATUSES.includes(order.status)) {
    return { eligible: false, reason: `Order status (${order.status}) is not eligible for return.` }
  }

  if (!order.deliveredAt) {
    return { eligible: false, reason: 'Order has not been delivered yet.' }
  }

  const daysSinceDelivery = (Date.now() - new Date(order.deliveredAt).getTime()) / (1000 * 60 * 60 * 24)
  if (daysSinceDelivery > RETURN_WINDOW_DAYS) {
    return { eligible: false, reason: `Return window of ${RETURN_WINDOW_DAYS} days has expired.` }
  }

  if (order.status === 'cancelled') {
    return { eligible: false, reason: 'Cancelled orders cannot be returned.' }
  }

  return { eligible: true }
}

async function getReturnableItems(order) {
  const [items, existingReturns] = await Promise.all([
    prisma.orderItem.findMany({
      where: { orderId: order.id },
      include: { product: { select: { id: true, name: true, image: true, price: true } } },
    }),
    prisma.return.findMany({
      where: { orderId: order.id },
      include: { items: { select: { orderItemId: true, quantity: true } } },
    }),
  ])

  const returnedQuantities = {}
  for (const ret of existingReturns) {
    for (const item of ret.items) {
      if (item.orderItemId) {
        const key = item.orderItemId
        returnedQuantities[key] = (returnedQuantities[key] || 0) + item.quantity
      }
    }
  }

  return items.map((item) => {
    const returned = returnedQuantities[item.id] || 0
    const remaining = item.quantity - returned
    return {
      orderItemId: item.id,
      productId: item.product?.id || null,
      productName: item.product?.name || item.name,
      productImage: item.product?.image || item.image,
      orderedQuantity: item.quantity,
      unitPrice: item.price,
      alreadyReturned: returned,
      returnableQuantity: remaining,
    }
  })
}

router.get('/', authMiddleware, async (req, res) => {
  try {
    const returns = await prisma.return.findMany({
      where: { userId: req.userId },
      include: { items: true, refunds: true, order: true },
      orderBy: { createdAt: 'desc' },
    })

    res.json(returns.map(serializeReturn))
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch returns', message: safeError(error) })
  }
})

router.post('/', authMiddleware, async (req, res) => {
  try {
    const { orderNumber, items, reason, description } = req.body

    if (!orderNumber || !items || !Array.isArray(items) || items.length === 0 || !reason) {
      return res.status(400).json({ error: 'Order number, items, and reason are required' })
    }

    if (!VALID_RETURN_REASONS.includes(reason)) {
      return res.status(400).json({ error: `Reason must be one of: ${VALID_RETURN_REASONS.join(', ')}` })
    }

    const order = await prisma.order.findFirst({
      where: { orderNumber, userId: req.userId },
      include: { items: true, payment: true },
    })

    if (!order) {
      return res.status(404).json({ error: 'Order not found or does not belong to you.' })
    }

    const eligibility = checkReturnEligibility(order)
    if (!eligibility.eligible) {
      return res.status(400).json({ error: eligibility.reason })
    }

    const existingActiveReturn = await prisma.return.findFirst({
      where: {
        orderId: order.id,
        status: { in: ACTIVE_RETURN_STATUSES },
      },
    })
    if (existingActiveReturn) {
      return res.status(409).json({
        error: 'A return is already in progress for this order.',
        returnId: existingActiveReturn.id,
      })
    }

    const orderItems = order.items
    const returnItemsData = []
    let totalAmount = 0

    const createdReturn = await prisma.$transaction(async (tx) => {
      for (const item of items) {
        const { orderItemId, quantity, condition } = item

        if (!orderItemId) {
          throw new Error('orderItemId is required for each return item')
        }

        if (!VALID_ITEM_CONDITIONS.includes(condition)) {
          throw new Error(`Invalid item condition: ${condition}`)
        }

        if (!Number.isInteger(quantity) || quantity <= 0) {
          throw new Error(`Invalid quantity for order item ${orderItemId}`)
        }

        const orderItem = orderItems.find((oi) => oi.id === orderItemId)
        if (!orderItem) {
          throw new Error(`Order item ${orderItemId} does not belong to this order`)
        }

        const returnedResult = await tx.returnItem.aggregate({
          where: { orderItemId },
          _sum: { quantity: true },
        })
        const alreadyReturned = returnedResult._sum.quantity || 0
        const remaining = orderItem.quantity - alreadyReturned

        if (quantity > remaining) {
          throw new Error(
            `Requested ${quantity} exceeds remaining returnable quantity (${remaining}) for item ${orderItem.name}`
          )
        }

        const itemAmount = Number(orderItem.price) * quantity
        totalAmount += itemAmount

        returnItemsData.push({
          orderItemId: orderItem.id,
          productId: orderItem.productId,
          name: orderItem.name,
          price: orderItem.price,
          quantity,
          condition,
          reason: item.reason || reason,
        })
      }

      const newReturn = await tx.return.create({
        data: {
          orderId: order.id,
          userId: req.userId,
          status: 'requested',
          reason,
          description: description || null,
          totalAmount,
          currency: order.payment?.currency || 'USD',
          returnShippingCost: null,
          items: {
            create: returnItemsData,
          },
        },
        include: { items: true, order: true, user: true },
      })

      await tx.returnAuditLog.create({
        data: {
          returnId: newReturn.id,
          toStatus: 'requested',
          changedBy: req.userId,
        },
      })

      return newReturn
    })

    res.status(201).json(serializeReturn(createdReturn))
  } catch (error) {
    if (error.code !== 'P2002') {
      console.error('Return creation error:', error.message)
    }
    res.status(error.message?.includes('does not belong') || error.message?.includes('exceeds') || error.message?.includes('Invalid') ? 400 : 500).json({
      error: error.message?.includes('does not belong') || error.message?.includes('exceeds') || error.message?.includes('Invalid')
        ? error.message
        : 'Failed to create return',
      message: safeError(error),
    })
  }
})

router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params

    const returnRecord = await prisma.return.findUnique({
      where: { id },
      include: {
        items: true,
        refunds: { include: { payment: true } },
        order: { select: { orderNumber: true, customerName: true, customerEmail: true, total: true } },
        auditLogs: true,
      },
    })

    if (!returnRecord) {
      return res.status(404).json({ error: 'Return not found' })
    }

    if (returnRecord.userId !== req.userId) {
      return res.status(403).json({ error: 'Access denied' })
    }

    res.json(serializeReturn(returnRecord))
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch return', message: safeError(error) })
  }
})

router.get('/order/:orderNumber', authMiddleware, async (req, res) => {
  try {
    const { orderNumber } = req.params

    const order = await prisma.order.findFirst({
      where: { orderNumber, userId: req.userId },
    })

    if (!order) {
      return res.status(404).json({ error: 'Order not found' })
    }

    const returnRecord = await prisma.return.findUnique({
      where: { orderId: order.id },
      include: { items: true, refunds: true, auditLogs: true },
    })

    if (!returnRecord) {
      return res.json({ exists: false, return: null })
    }

    res.json({ exists: true, return: serializeReturn(returnRecord) })
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch return', message: safeError(error) })
  }
})

export default router
