import express from 'express'
import { PrismaClient } from '@prisma/client'
import { safeError } from '../utils/errors.js'

const router = express.Router()
const prisma = new PrismaClient()

router.get('/', async (req, res) => {
  try {
    const { category, search } = req.query
    const where = { isActive: true }

    if (category && typeof category === 'string') {
      where.category = category
    }

    let items = await prisma.knowledgeBase.findMany({
      where,
      orderBy: { priority: 'desc' },
    })

    if (search && typeof search === 'string') {
      const lowerSearch = search.toLowerCase().slice(0, 100)
      items = items.filter(item => {
        const question = item.question.toLowerCase()
        const answer = item.answer.toLowerCase()
        const keywords = item.keywords ? JSON.parse(item.keywords) : []
        const keywordMatch = keywords.some(k => k.toLowerCase().includes(lowerSearch))
        return question.includes(lowerSearch) || answer.includes(lowerSearch) || keywordMatch
      })
    }

    const serialized = items.map(item => ({
      id: item.id,
      category: item.category,
      question: item.question,
      answer: item.answer,
      keywords: item.keywords ? JSON.parse(item.keywords) : [],
      priority: item.priority,
    }))

    res.json(serialized)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch knowledge base', message: safeError(error) })
  }
})

router.get('/categories', async (req, res) => {
  try {
    const categories = await prisma.knowledgeBase.findMany({
      where: { isActive: true },
      select: { category: true },
    })

    const uniqueCategories = [...new Set(categories.map(c => c.category))]
    res.json(uniqueCategories)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch categories', message: safeError(error) })
  }
})

router.get('/:id', async (req, res) => {
  try {
    const item = await prisma.knowledgeBase.findUnique({
      where: { id: req.params.id },
    })

    if (!item) {
      return res.status(404).json({ error: 'Knowledge base item not found' })
    }

    res.json({
      id: item.id,
      category: item.category,
      question: item.question,
      answer: item.answer,
      keywords: item.keywords ? JSON.parse(item.keywords) : [],
      priority: item.priority,
    })
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch knowledge base item', message: safeError(error) })
  }
})

export default router