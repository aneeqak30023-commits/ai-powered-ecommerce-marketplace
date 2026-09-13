import express from 'express'
import { PrismaClient } from '@prisma/client'
import { authMiddleware } from '../middleware/auth.js'
import { safeError } from '../utils/errors.js'

const router = express.Router()
const prisma = new PrismaClient()

function serializeWishlistItem(wishlistItem) {
  return {
    id: wishlistItem.id,
    productId: wishlistItem.productId,
    createdAt: wishlistItem.createdAt,
    product: wishlistItem.product ? {
      id: wishlistItem.product.id,
      name: wishlistItem.product.name,
      price: wishlistItem.product.price,
      originalPrice: wishlistItem.product.originalPrice,
      image: wishlistItem.product.image,
      images: wishlistItem.product.images,
      rating: wishlistItem.product.rating,
      reviewCount: wishlistItem.product.reviewCount,
      stock: wishlistItem.product.stock,
      categoryId: wishlistItem.product.categoryId,
    } : null,
  }
}

router.get('/', authMiddleware, async (req, res) => {
  try {
    const wishlistItems = await prisma.wishlist.findMany({
      where: { userId: req.userId },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            price: true,
            originalPrice: true,
            image: true,
            images: true,
            rating: true,
            reviewCount: true,
            stock: true,
            categoryId: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' },
    })

    res.json(wishlistItems.map(serializeWishlistItem))
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch wishlist', message: safeError(error) })
  }
})

router.post('/:productId', authMiddleware, async (req, res) => {
  try {
    const productId = Number(req.params.productId)
    if (Number.isNaN(productId)) {
      return res.status(404).json({ error: 'Product not found' })
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
    })

    if (!product) {
      return res.status(404).json({ error: 'Product not found' })
    }

    const existing = await prisma.wishlist.findUnique({
      where: {
        userId_productId: {
          userId: req.userId,
          productId,
        }
      },
    })

    if (existing) {
      return res.status(409).json({ error: 'Item already in wishlist' })
    }

    const wishlistItem = await prisma.wishlist.create({
      data: {
        userId: req.userId,
        productId,
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            price: true,
            originalPrice: true,
            image: true,
            images: true,
            rating: true,
            reviewCount: true,
            stock: true,
            categoryId: true,
          }
        }
      }
    })

    res.status(201).json(serializeWishlistItem(wishlistItem))
  } catch (error) {
    res.status(500).json({ error: 'Failed to add to wishlist', message: safeError(error) })
  }
})

router.delete('/:productId', authMiddleware, async (req, res) => {
  try {
    const productId = Number(req.params.productId)
    if (Number.isNaN(productId)) {
      return res.status(404).json({ error: 'Product not found' })
    }

    const wishlistItem = await prisma.wishlist.findUnique({
      where: {
        userId_productId: {
          userId: req.userId,
          productId,
        }
      },
    })

    if (!wishlistItem) {
      return res.status(404).json({ error: 'Item not in wishlist' })
    }

    await prisma.wishlist.delete({
      where: { id: wishlistItem.id },
    })

    res.status(204).send()
  } catch (error) {
    res.status(500).json({ error: 'Failed to remove from wishlist', message: safeError(error) })
  }
})

export default router