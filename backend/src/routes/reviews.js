import express from 'express'
import { PrismaClient } from '@prisma/client'
import { authMiddleware } from '../middleware/auth.js'
import { safeError } from '../utils/errors.js'

const router = express.Router()
const prisma = new PrismaClient()

function serializeReview(review) {
  return {
    id: review.id,
    productId: review.productId,
    userId: review.userId,
    reviewerName: review.reviewerName || review.user?.name || 'Anonymous',
    rating: review.rating,
    text: review.comment,
    date: review.createdAt,
    editedAt: review.updatedAt,
  }
}

async function getRatingStats(productId) {
  const reviews = await prisma.review.findMany({
    where: { productId },
    select: { rating: true },
  })

  const count = reviews.length
  if (count === 0) {
    return { averageRating: 0, reviewCount: 0, breakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } }
  }

  const sum = reviews.reduce((acc, r) => acc + r.rating, 0)
  const breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  for (const r of reviews) {
    breakdown[r.rating] = (breakdown[r.rating] || 0) + 1
  }

  return {
    averageRating: sum / count,
    reviewCount: count,
    breakdown,
  }
}

router.get('/products/:productId/reviews', async (req, res) => {
  try {
    const productId = Number(req.params.productId)
    if (Number.isNaN(productId)) {
      return res.status(400).json({ error: 'Invalid product ID' })
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
    })

    if (!product) {
      return res.status(404).json({ error: 'Product not found' })
    }

    const reviews = await prisma.review.findMany({
      where: { productId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    const serialized = reviews.map(serializeReview)

    const stats = await getRatingStats(productId)

    res.json({
      reviews: serialized,
      ...stats,
    })
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch reviews', message: safeError(error) })
  }
})

router.post('/products/:productId/reviews', authMiddleware, async (req, res) => {
  try {
    const productId = Number(req.params.productId)
    if (Number.isNaN(productId)) {
      return res.status(400).json({ error: 'Invalid product ID' })
    }

    const { rating, text } = req.body

    if (rating === undefined || rating === null || text === undefined || text === null) {
      return res.status(400).json({ error: 'Rating and review text are required' })
    }

    const numRating = Number(rating)
    if (!Number.isInteger(numRating) || numRating < 1 || numRating > 5) {
      return res.status(400).json({ error: 'Rating must be an integer between 1 and 5' })
    }

    const trimmedText = typeof text === 'string' ? text.trim() : ''
    if (trimmedText.length < 3) {
      return res.status(400).json({ error: 'Review must be at least 3 characters' })
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
    })

    if (!product) {
      return res.status(404).json({ error: 'Product not found' })
    }

    const existing = await prisma.review.findUnique({
      where: {
        productId_userId: {
          userId: req.userId,
          productId,
        }
      },
    })

    if (existing) {
      return res.status(409).json({ error: 'You have already reviewed this product' })
    }

    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { name: true },
    })

    const review = await prisma.review.create({
      data: {
        productId,
        userId: req.userId,
        reviewerName: user?.name || 'Anonymous',
        rating: numRating,
        comment: trimmedText,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    const stats = await getRatingStats(productId)

    await prisma.product.update({
      where: { id: productId },
      data: {
        rating: stats.averageRating,
        reviewCount: stats.reviewCount,
      },
    })

    res.status(201).json(serializeReview(review))
  } catch (error) {
    res.status(500).json({ error: 'Failed to create review', message: safeError(error) })
  }
})

router.patch('/:reviewId', authMiddleware, async (req, res) => {
  try {
    const { reviewId } = req.params
    const { rating, text } = req.body

    if (!rating && rating !== 0 && !text) {
      return res.status(400).json({ error: 'Rating or review text is required' })
    }

    const existing = await prisma.review.findUnique({
      where: { id: reviewId },
    })

    if (!existing) {
      return res.status(404).json({ error: 'Review not found' })
    }

    if (existing.userId !== req.userId) {
      return res.status(403).json({ error: 'You can only edit your own reviews' })
    }

    const updateData = {}

    if (rating !== undefined) {
      const numRating = Number(rating)
      if (!Number.isInteger(numRating) || numRating < 1 || numRating > 5) {
        return res.status(400).json({ error: 'Rating must be an integer between 1 and 5' })
      }
      updateData.rating = numRating
    }

    if (text !== undefined) {
      const trimmedText = typeof text === 'string' ? text.trim() : ''
      if (trimmedText.length < 3) {
        return res.status(400).json({ error: 'Review must be at least 3 characters' })
      }
      updateData.comment = trimmedText
    }

    const updated = await prisma.review.update({
      where: { id: reviewId },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    const stats = await getRatingStats(existing.productId)

    await prisma.product.update({
      where: { id: existing.productId },
      data: {
        rating: stats.averageRating,
        reviewCount: stats.reviewCount,
      },
    })

    res.json(serializeReview(updated))
  } catch (error) {
    res.status(500).json({ error: 'Failed to update review', message: safeError(error) })
  }
})

router.delete('/:reviewId', authMiddleware, async (req, res) => {
  try {
    const { reviewId } = req.params

    const existing = await prisma.review.findUnique({
      where: { id: reviewId },
    })

    if (!existing) {
      return res.status(404).json({ error: 'Review not found' })
    }

    if (existing.userId !== req.userId) {
      return res.status(403).json({ error: 'You can only delete your own reviews' })
    }

    const productId = existing.productId

    await prisma.review.delete({
      where: { id: reviewId },
    })

    const stats = await getRatingStats(productId)

    await prisma.product.update({
      where: { id: productId },
      data: {
        rating: stats.averageRating,
        reviewCount: stats.reviewCount,
      },
    })

    res.status(204).send()
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete review', message: safeError(error) })
  }
})

export default router