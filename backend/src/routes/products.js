import express from 'express'
import { PrismaClient } from '@prisma/client'
import { safeError } from '../utils/errors.js'

const router = express.Router()
const prisma = new PrismaClient()

function parseJsonField(value) {
  if (!value) return null
  try {
    return JSON.parse(value)
  } catch {
    return value
  }
}

function serializeProduct(product) {
  return {
    id: product.id,
    name: product.name,
    description: product.description,
    price: product.price,
    originalPrice: product.originalPrice,
    categoryId: product.categoryId,
    categoryName: product.category?.name || null,
    brand: product.brand,
    rating: product.rating,
    reviewCount: product.reviewCount,
    image: product.image,
    images: parseJsonField(product.images),
    tags: parseJsonField(product.tags),
    specifications: parseJsonField(product.specifications),
    stock: product.stock,
    subcategory: product.subcategory,
  }
}

router.get('/', async (req, res) => {
  try {
    const { category, search } = req.query

    const where = {}

    if (category) {
      where.categoryId = String(category)
    }

    if (search) {
      const term = String(search).toLowerCase().slice(0, 100)
      where.OR = [
        { name: { contains: term } },
        { description: { contains: term } },
      ]
    }

    const products = await prisma.product.findMany({
      where,
      include: { category: true },
      orderBy: { id: 'asc' },
    })

    res.json(products.map(serializeProduct))
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch products', message: safeError(error) })
  }
})

router.get('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id)
    if (Number.isNaN(id)) {
      return res.status(404).json({ error: 'Product not found' })
    }

    const product = await prisma.product.findUnique({
      where: { id },
      include: { category: true },
    })

    if (!product) {
      return res.status(404).json({ error: 'Product not found' })
    }

    res.json(serializeProduct(product))
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch product', message: safeError(error) })
  }
})

export default router
