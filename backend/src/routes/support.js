import express from 'express'
import { PrismaClient } from '@prisma/client'
import { authMiddleware } from '../middleware/auth.js'
import { safeError } from '../utils/errors.js'

const router = express.Router()
const prisma = new PrismaClient()

const VALID_STATUSES = ['open', 'in_progress', 'resolved', 'closed']
const VALID_PRIORITIES = ['low', 'medium', 'high', 'urgent']
const VALID_CATEGORIES = ['product', 'order', 'payment', 'shipping', 'return', 'refund', 'complaint', 'technical', 'other']

function serializeTicket(ticket) {
  return {
    id: ticket.id,
    userId: ticket.userId,
    subject: ticket.subject,
    message: ticket.message,
    category: ticket.category,
    status: ticket.status,
    priority: ticket.priority,
    orderId: ticket.orderId,
    productId: ticket.productId,
    createdAt: ticket.createdAt,
    updatedAt: ticket.updatedAt,
    messages: (ticket.messages || []).map(msg => ({
      id: msg.id,
      sender: msg.sender,
      message: msg.message,
      createdAt: msg.createdAt,
    })),
  }
}

router.get('/tickets', authMiddleware, async (req, res) => {
  try {
    const { status, category, page = '1', limit = '20' } = req.query
    const pageNum = Math.max(1, Number(page))
    const limitNum = Math.min(100, Math.max(1, Number(limit)))
    const skip = (pageNum - 1) * limitNum

    const where = { userId: req.userId }
    if (status && typeof status === 'string' && VALID_STATUSES.includes(status)) {
      where.status = status
    }
    if (category && typeof category === 'string' && VALID_CATEGORIES.includes(category)) {
      where.category = category
    }

    const [tickets, total] = await Promise.all([
      prisma.supportTicket.findMany({
        where,
        include: { messages: { orderBy: { createdAt: 'asc' } } },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum,
      }),
      prisma.supportTicket.count({ where }),
    ])

    res.json({
      tickets: tickets.map(serializeTicket),
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    })
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch support tickets', message: safeError(error) })
  }
})

router.get('/tickets/:ticketId', authMiddleware, async (req, res) => {
  try {
    const { ticketId } = req.params

    const ticket = await prisma.supportTicket.findFirst({
      where: { id: ticketId, userId: req.userId },
      include: { messages: { orderBy: { createdAt: 'asc' } } },
    })

    if (!ticket) {
      return res.status(404).json({ error: 'Support ticket not found' })
    }

    res.json(serializeTicket(ticket))
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch support ticket', message: safeError(error) })
  }
})

router.post('/tickets', authMiddleware, async (req, res) => {
  try {
    const { subject, message, category, priority, orderId, productId } = req.body

    if (!subject || !message || !category) {
      return res.status(400).json({ error: 'Subject, message, and category are required' })
    }

    const trimmedSubject = String(subject).trim().slice(0, 200)
    const trimmedMessage = String(message).trim().slice(0, 5000)
    const trimmedCategory = String(category).trim().toLowerCase()

    if (trimmedSubject.length < 3) {
      return res.status(400).json({ error: 'Subject must be at least 3 characters' })
    }
    if (trimmedMessage.length < 10) {
      return res.status(400).json({ error: 'Message must be at least 10 characters' })
    }

    if (!VALID_CATEGORIES.includes(trimmedCategory)) {
      return res.status(400).json({ error: `Category must be one of: ${VALID_CATEGORIES.join(', ')}` })
    }

    const ticketPriority = priority && typeof priority === 'string' && VALID_PRIORITIES.includes(priority.toLowerCase())
      ? priority.toLowerCase()
      : 'medium'

    const ticket = await prisma.supportTicket.create({
      data: {
        userId: req.userId,
        subject: trimmedSubject,
        message: trimmedMessage,
        category: trimmedCategory,
        priority: ticketPriority,
        orderId: orderId ? String(orderId) : null,
        productId: productId ? Number(productId) : null,
        messages: {
          create: {
            sender: 'customer',
            message: trimmedMessage,
          },
        },
      },
      include: { messages: true },
    })

    res.status(201).json(serializeTicket(ticket))
  } catch (error) {
    res.status(500).json({ error: 'Failed to create support ticket', message: safeError(error) })
  }
})

router.post('/tickets/:ticketId/messages', authMiddleware, async (req, res) => {
  try {
    const { ticketId } = req.params
    const { message, sender } = req.body

    if (!message || !String(message).trim()) {
      return res.status(400).json({ error: 'Message is required' })
    }

    const trimmedMessage = String(message).trim().slice(0, 5000)
    if (trimmedMessage.length < 1) {
      return res.status(400).json({ error: 'Message cannot be empty' })
    }

    const ticket = await prisma.supportTicket.findFirst({
      where: { id: ticketId, userId: req.userId },
    })

    if (!ticket) {
      return res.status(404).json({ error: 'Support ticket not found' })
    }

    const messageSender = sender === 'agent' ? 'agent' : 'customer'

    const newMessage = await prisma.supportTicketMessage.create({
      data: {
        ticketId,
        sender: messageSender,
        message: trimmedMessage,
      },
    })

    await prisma.supportTicket.update({
      where: { id: ticketId },
      data: { updatedAt: new Date() },
    })

    res.status(201).json({
      id: newMessage.id,
      sender: newMessage.sender,
      message: newMessage.message,
      createdAt: newMessage.createdAt,
    })
  } catch (error) {
    res.status(500).json({ error: 'Failed to add message', message: safeError(error) })
  }
})

export default router