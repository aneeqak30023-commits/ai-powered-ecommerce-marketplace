import express from 'express'
import { PrismaClient } from '@prisma/client'
import { authMiddleware } from '../middleware/auth.js'
import { safeError } from '../utils/errors.js'

const router = express.Router()
const prisma = new PrismaClient()

function generateOrderNumber() {
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).slice(2, 8).toUpperCase()
  return `ORD-${timestamp}-${random}`
}

function serializeOrder(order) {
  return {
    id: order.orderNumber,
    orderId: order.id,
    userId: order.userId,
    status: order.status,
    customer: {
      name: order.customerName,
      email: order.customerEmail,
      phone: order.customerPhone,
    },
    shippingAddress: order.shippingAddress ? JSON.parse(order.shippingAddress) : null,
    subtotal: order.subtotal,
    shipping: order.shipping,
    tax: order.tax,
    total: order.total,
    date: order.createdAt,
    items: order.items.map(item => ({
      id: item.productId,
      productId: item.productId,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      image: item.image,
      subtotal: item.price * item.quantity,
    })),
  }
}

router.get('/', authMiddleware, async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.userId },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                price: true,
                image: true,
                images: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    res.json(orders.map(serializeOrder))
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch orders', message: safeError(error) })
  }
})

router.get('/:orderId', authMiddleware, async (req, res) => {
  try {
    const orderId = req.params.orderId
    const order = await prisma.order.findFirst({
      where: {
        orderNumber: orderId,
        userId: req.userId,
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                price: true,
                image: true,
                images: true,
              },
            },
          },
        },
      },
    })

    if (!order) {
      return res.status(404).json({ error: 'Order not found' })
    }

    res.json(serializeOrder(order))
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch order', message: safeError(error) })
  }
})

router.post('/', authMiddleware, async (req, res) => {
  try {
    const { items, customer, shippingAddress, subtotal, shipping, tax, total } = req.body

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Order must contain at least one item' })
    }

    if (!customer?.name || !customer?.email || !customer?.phone) {
      return res.status(400).json({ error: 'Customer information is required' })
    }

    if (!shippingAddress?.address || !shippingAddress?.city || !shippingAddress?.state || !shippingAddress?.zip) {
      return res.status(400).json({ error: 'Shipping address is required' })
    }

    const productIds = items.map(i => Number(i.id)).filter(id => !Number.isNaN(id))
    if (productIds.length === 0) {
      return res.status(400).json({ error: 'Invalid product IDs' })
    }

    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      include: { inventory: true },
    })

    if (products.length !== productIds.length) {
      return res.status(400).json({ error: 'One or more products not found' })
    }

    const productMap = new Map(products.map(p => [p.id, p]))

    for (const item of items) {
      const productId = Number(item.id)
      if (Number.isNaN(productId)) {
        return res.status(400).json({ error: `Invalid product ID: ${item.id}` })
      }

      const qty = Number(item.quantity)
      if (!Number.isInteger(qty) || qty <= 0) {
        return res.status(400).json({ error: `Invalid quantity for product ${productId}` })
      }

      const product = productMap.get(productId)
      if (!product) {
        return res.status(400).json({ error: `Product ${productId} not found` })
      }

      const availableStock = product.inventory?.stock ?? 0
      if (availableStock < qty) {
        return res.status(400).json({
          error: `Insufficient stock for ${product.name}`,
          productId,
          available: availableStock,
          requested: qty,
        })
      }
    }

    const orderNumber = generateOrderNumber()

    const order = await prisma.$transaction(async (tx) => {
      const createdOrder = await tx.order.create({
        data: {
          orderNumber,
          userId: req.userId,
          status: 'confirmed',
          customerName: customer.name,
          customerEmail: customer.email,
          customerPhone: customer.phone,
          shippingAddress: JSON.stringify(shippingAddress),
          subtotal: Number(subtotal) || 0,
          shipping: Number(shipping) || 0,
          tax: Number(tax) || 0,
          total: Number(total) || 0,
          items: {
            create: items.map(item => {
              const product = productMap.get(Number(item.id))
              return {
                productId: Number(item.id),
                name: product?.name || item.name,
                image: product?.image || product?.images?.split(',')[0] || item.image,
                quantity: Number(item.quantity),
                price: Number(item.price),
              }
            }),
          },
        },
        include: {
          items: true,
        },
      })

      for (const item of items) {
        const productId = Number(item.id)
        const qty = Number(item.quantity)
        const product = productMap.get(productId)

        if (product && product.inventory) {
          await tx.inventory.update({
            where: { productId },
            data: { stock: { decrement: qty } },
          })
        }
      }

      return createdOrder
    })

    const fullOrder = await prisma.order.findUnique({
      where: { id: order.id },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                price: true,
                image: true,
                images: true,
              },
            },
          },
        },
      },
    })

    res.status(201).json(serializeOrder(fullOrder))
  } catch (error) {
    res.status(500).json({ error: 'Failed to create order', message: safeError(error) })
  }
})

router.patch('/:orderId/cancel', authMiddleware, async (req, res) => {
  try {
    const orderId = req.params.orderId

    const existingOrder = await prisma.order.findFirst({
      where: {
        orderNumber: orderId,
        userId: req.userId,
      },
      include: {
        items: true,
      },
    })

    if (!existingOrder) {
      return res.status(404).json({ error: 'Order not found' })
    }

    if (!['pending', 'confirmed'].includes(existingOrder.status.toLowerCase())) {
      return res.status(400).json({ error: 'Order cannot be cancelled' })
    }

    const updatedOrder = await prisma.$transaction(async (tx) => {
      const cancelled = await tx.order.update({
        where: { id: existingOrder.id },
        data: { status: 'cancelled' },
        include: {
          items: true,
        },
      })

      for (const item of existingOrder.items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
          include: { inventory: true },
        })

        if (product && product.inventory) {
          await tx.inventory.update({
            where: { productId: item.productId },
            data: { stock: { increment: item.quantity } },
          })
        }
      }

      return cancelled
    })

    res.json(serializeOrder(updatedOrder))
  } catch (error) {
    res.status(500).json({ error: 'Failed to cancel order', message: safeError(error) })
  }
})

export default router