import express from 'express'
import { PrismaClient } from '@prisma/client'
import { authMiddleware } from '../middleware/auth.js'
import { safeError } from '../utils/errors.js'

const router = express.Router()
const prisma = new PrismaClient()

function parseJsonField(value) {
  if (!value) return null
  if (Array.isArray(value)) return value
  try {
    return JSON.parse(value)
  } catch {
    return value
  }
}

function serializeCartItem(cartItem) {
  return {
    id: cartItem.id,
    productId: cartItem.productId,
    quantity: cartItem.quantity,
    createdAt: cartItem.createdAt,
    updatedAt: cartItem.updatedAt,
    product: cartItem.product ? {
      id: cartItem.product.id,
      name: cartItem.product.name,
      price: cartItem.product.price,
      image: cartItem.product.image,
      images: parseJsonField(cartItem.product.images),
      stock: cartItem.product.stock,
    } : null,
  }
}

async function getProductStock(productId) {
  const inventory = await prisma.inventory.findUnique({
    where: { productId },
  })
  return inventory?.stock ?? null
}

router.get('/', authMiddleware, async (req, res) => {
  try {
    const cartItems = await prisma.cartItem.findMany({
      where: { userId: req.userId },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            price: true,
            image: true,
            images: true,
            stock: true,
          }
        }
      },
      orderBy: { createdAt: 'asc' },
    })

    res.json(cartItems.map(serializeCartItem))
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch cart', message: safeError(error) })
  }
})

router.post('/', authMiddleware, async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body

    if (!productId) {
      return res.status(400).json({ error: 'Product ID is required' })
    }

    const numProductId = Number(productId)
    if (Number.isNaN(numProductId)) {
      return res.status(400).json({ error: 'Invalid product ID' })
    }

    const qty = Number(quantity)
    if (!Number.isInteger(qty) || qty <= 0) {
      return res.status(400).json({ error: 'Quantity must be a positive integer' })
    }

    if (qty > 100) {
      return res.status(400).json({ error: 'Quantity cannot exceed 100' })
    }

    const product = await prisma.product.findUnique({
      where: { id: numProductId },
    })

    if (!product) {
      return res.status(404).json({ error: 'Product not found' })
    }

    const availableStock = await getProductStock(numProductId)
    if (availableStock === null) {
      return res.status(400).json({ error: 'Product inventory not available' })
    }

    const existing = await prisma.cartItem.findUnique({
      where: {
        userId_productId: {
          userId: req.userId,
          productId: numProductId,
        }
      },
    })

    let newQuantity = qty
    if (existing) {
      newQuantity = existing.quantity + qty
    }

    if (newQuantity > availableStock) {
      return res.status(400).json({
        error: 'Requested quantity exceeds available stock',
        available: availableStock,
        requested: newQuantity,
      })
    }

    const cartItem = await prisma.cartItem.upsert({
      where: {
        userId_productId: {
          userId: req.userId,
          productId: numProductId,
        }
      },
      update: {
        quantity: newQuantity,
        updatedAt: new Date(),
      },
      create: {
        userId: req.userId,
        productId: numProductId,
        quantity: qty,
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            price: true,
            image: true,
            images: true,
            stock: true,
          }
        }
      }
    })

    res.status(existing ? 200 : 201).json(serializeCartItem(cartItem))
  } catch (error) {
    res.status(500).json({ error: 'Failed to update cart', message: safeError(error) })
  }
})

router.patch('/:productId', authMiddleware, async (req, res) => {
  try {
    const productId = Number(req.params.productId)
    if (Number.isNaN(productId)) {
      return res.status(404).json({ error: 'Product not found' })
    }

    const { quantity } = req.body

    if (quantity === undefined || quantity === null) {
      return res.status(400).json({ error: 'Quantity is required' })
    }

    const qty = Number(quantity)
    if (!Number.isInteger(qty) || qty <= 0) {
      return res.status(400).json({ error: 'Quantity must be a positive integer' })
    }

    if (qty > 100) {
      return res.status(400).json({ error: 'Quantity cannot exceed 100' })
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
    })

    if (!product) {
      return res.status(404).json({ error: 'Product not found' })
    }

    const availableStock = await getProductStock(productId)
    if (availableStock === null) {
      return res.status(400).json({ error: 'Product inventory not available' })
    }

    if (qty > availableStock) {
      return res.status(400).json({
        error: 'Requested quantity exceeds available stock',
        available: availableStock,
        requested: qty,
      })
    }

    const cartItem = await prisma.cartItem.findUnique({
      where: {
        userId_productId: {
          userId: req.userId,
          productId,
        }
      },
    })

    if (!cartItem) {
      return res.status(404).json({ error: 'Item not in cart' })
    }

    const updated = await prisma.cartItem.update({
      where: { id: cartItem.id },
      data: { quantity: qty },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            price: true,
            image: true,
            images: true,
            stock: true,
          }
        }
      }
    })

    res.json(serializeCartItem(updated))
  } catch (error) {
    res.status(500).json({ error: 'Failed to update cart item', message: safeError(error) })
  }
})

router.delete('/:productId', authMiddleware, async (req, res) => {
  try {
    const productId = Number(req.params.productId)
    if (Number.isNaN(productId)) {
      return res.status(404).json({ error: 'Product not found' })
    }

    const cartItem = await prisma.cartItem.findUnique({
      where: {
        userId_productId: {
          userId: req.userId,
          productId,
        }
      },
    })

    if (!cartItem) {
      return res.status(404).json({ error: 'Item not in cart' })
    }

    await prisma.cartItem.delete({
      where: { id: cartItem.id },
    })

    res.status(204).send()
  } catch (error) {
    res.status(500).json({ error: 'Failed to remove cart item', message: safeError(error) })
  }
})

router.delete('/', authMiddleware, async (req, res) => {
  try {
    await prisma.cartItem.deleteMany({
      where: { userId: req.userId },
    })

    res.status(204).send()
  } catch (error) {
    res.status(500).json({ error: 'Failed to clear cart', message: safeError(error) })
  }
})

export default router