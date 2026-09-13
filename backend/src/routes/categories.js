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

function serializeCategory(category) {
  return {
    id: category.id,
    name: category.name,
    slug: category.slug,
    description: category.description,
    icon: category.icon,
    productCount: category.productCount,
    subcategories: parseJsonField(category.subcategories),
    createdAt: category.createdAt,
    updatedAt: category.updatedAt,
  }
}

router.get('/', async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
    })
    res.json(categories.map(serializeCategory))
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch categories', message: safeError(error) })
  }
})

router.get('/:id', async (req, res) => {
  try {
    const category = await prisma.category.findUnique({
      where: { id: req.params.id },
    })

    if (!category) {
      return res.status(404).json({ error: 'Category not found' })
    }

    res.json(serializeCategory(category))
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch category', message: safeError(error) })
  }
})

export default router