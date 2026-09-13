import express from 'express'
import { PrismaClient } from '@prisma/client'
import { authMiddleware, adminMiddleware } from '../middleware/admin.js'
import { safeError } from '../utils/errors.js'

const router = express.Router()
const prisma = new PrismaClient()

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
    images: product.images ? JSON.parse(product.images) : null,
    tags: product.tags ? JSON.parse(product.tags) : null,
    specifications: product.specifications ? JSON.parse(product.specifications) : null,
    stock: product.stock,
    subcategory: product.subcategory,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  }
}

router.get('/products', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { search, category, lowStock } = req.query

    const where = {}
    if (search) {
      const term = String(search).toLowerCase().slice(0, 100)
      where.OR = [
        { name: { contains: term } },
        { description: { contains: term } },
      ]
    }
    if (category) {
      where.categoryId = String(category)
    }
    if (lowStock === 'true') {
      const inventories = await prisma.inventory.findMany({
        where: { stock: { lte: 5 } },
        select: { productId: true },
      })
      where.id = { in: inventories.map(inv => inv.productId) }
    }

    const products = await prisma.product.findMany({
      where,
      include: { category: true, inventory: true },
      orderBy: { id: 'asc' },
    })

    res.json(products.map(serializeProduct))
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch products', message: safeError(error) })
  }
})

router.post('/products', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { name, description, price, originalPrice, categoryId, brand, image, images, tags, specifications, stock, subcategory } = req.body

    if (!name || !description || price == null || !categoryId || stock == null) {
      return res.status(400).json({ error: 'Name, description, price, category, and stock are required' })
    }

    const numPrice = Number(price)
    if (Number.isNaN(numPrice) || numPrice < 0) {
      return res.status(400).json({ error: 'Price must be a non-negative number' })
    }

    const numStock = Number(stock)
    if (Number.isNaN(numStock) || numStock < 0) {
      return res.status(400).json({ error: 'Stock must be a non-negative integer' })
    }

    const maxId = await prisma.product.findFirst({
      orderBy: { id: 'desc' },
      select: { id: true },
    })

    const nextId = maxId ? maxId.id + 1 : 1

    const product = await prisma.product.create({
      data: {
        id: nextId,
        name,
        description,
        price: numPrice,
        originalPrice: originalPrice ? Number(originalPrice) : null,
        categoryId,
        brand: brand || null,
        image: image || null,
        images: images ? JSON.stringify(images) : null,
        tags: tags ? JSON.stringify(tags) : null,
        specifications: specifications ? JSON.stringify(specifications) : null,
        stock: numStock,
        subcategory: subcategory || null,
      },
      include: { category: true, inventory: true },
    })

    await prisma.inventory.create({
      data: {
        productId: product.id,
        stock: numStock,
        lowStockThreshold: 5,
      },
    })

    res.status(201).json(serializeProduct(product))
  } catch (error) {
    res.status(500).json({ error: 'Failed to create product', message: safeError(error) })
  }
})

router.patch('/products/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const id = Number(req.params.id)
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: 'Invalid product ID' })
    }

    const { name, description, price, originalPrice, categoryId, brand, image, images, tags, specifications, stock, subcategory } = req.body

    const product = await prisma.product.findUnique({ where: { id } })
    if (!product) {
      return res.status(404).json({ error: 'Product not found' })
    }

    const updateData = {}

    if (name !== undefined) updateData.name = name
    if (description !== undefined) updateData.description = description
    if (price !== undefined) {
      const numPrice = Number(price)
      if (Number.isNaN(numPrice) || numPrice < 0) {
        return res.status(400).json({ error: 'Price must be a non-negative number' })
      }
      updateData.price = numPrice
    }
    if (originalPrice !== undefined) updateData.originalPrice = originalPrice ? Number(originalPrice) : null
    if (categoryId !== undefined) updateData.categoryId = categoryId
    if (brand !== undefined) updateData.brand = brand
    if (image !== undefined) updateData.image = image
    if (images !== undefined) updateData.images = images ? JSON.stringify(images) : null
    if (tags !== undefined) updateData.tags = tags ? JSON.stringify(tags) : null
    if (specifications !== undefined) updateData.specifications = specifications ? JSON.stringify(specifications) : null
    if (subcategory !== undefined) updateData.subcategory = subcategory

    if (stock !== undefined) {
      const numStock = Number(stock)
      if (Number.isNaN(numStock) || numStock < 0) {
        return res.status(400).json({ error: 'Stock must be a non-negative integer' })
      }
      updateData.stock = numStock
    }

    const updated = await prisma.product.update({
      where: { id },
      data: updateData,
      include: { category: true, inventory: true },
    })

    if (stock !== undefined) {
      const numStock = Number(stock)
      await prisma.inventory.upsert({
        where: { productId: id },
        update: { stock: numStock },
        create: { productId: id, stock: numStock, lowStockThreshold: 5 },
      })
    }

    res.json(serializeProduct(updated))
  } catch (error) {
    res.status(500).json({ error: 'Failed to update product', message: safeError(error) })
  }
})

router.delete('/products/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const id = Number(req.params.id)
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: 'Invalid product ID' })
    }

    const product = await prisma.product.findUnique({ where: { id } })
    if (!product) {
      return res.status(404).json({ error: 'Product not found' })
    }

    await prisma.inventory.deleteMany({ where: { productId: id } })
    await prisma.product.delete({ where: { id } })

    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete product', message: safeError(error) })
  }
})

router.get('/orders', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { search, status, page = '1', limit = '20' } = req.query
    const pageNum = Math.max(1, Number(page))
    const limitNum = Math.min(100, Math.max(1, Number(limit)))
    const skip = (pageNum - 1) * limitNum

    const where = {}
    if (search) {
      const term = String(search).toLowerCase().slice(0, 100)
      where.OR = [
        { orderNumber: { contains: term } },
        { customerName: { contains: term } },
        { customerEmail: { contains: term } },
      ]
    }
    if (status) {
      where.status = String(status)
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          user: { select: { id: true, email: true, name: true } },
          items: { include: { product: { select: { id: true, name: true, price: true, image: true } } } },
          payment: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum,
      }),
      prisma.order.count({ where }),
    ])

    res.json({
      orders: orders.map(order => ({
        id: order.orderNumber,
        orderId: order.id,
        userId: order.userId,
        user: order.user,
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
        payment: order.payment,
      })),
      pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) },
    })
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch orders', message: safeError(error) })
  }
})

router.patch('/orders/:orderId/status', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const orderId = req.params.orderId
    const { status } = req.body

    const validStatuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled']
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ error: `Status must be one of: ${validStatuses.join(', ')}` })
    }

    const order = await prisma.order.findFirst({
      where: { orderNumber: orderId },
      include: { items: true },
    })

    if (!order) {
      return res.status(404).json({ error: 'Order not found' })
    }

    const updated = await prisma.order.update({
      where: { id: order.id },
      data: { status },
      include: { items: true, payment: true, user: { select: { id: true, email: true, name: true } } },
    })

    res.json({
      id: updated.orderNumber,
      orderId: updated.id,
      userId: updated.userId,
      user: updated.user,
      status: updated.status,
      customer: {
        name: updated.customerName,
        email: updated.customerEmail,
        phone: updated.customerPhone,
      },
      shippingAddress: updated.shippingAddress ? JSON.parse(updated.shippingAddress) : null,
      subtotal: updated.subtotal,
      shipping: updated.shipping,
      tax: updated.tax,
      total: updated.total,
      date: updated.createdAt,
      items: updated.items.map(item => ({
        id: item.productId,
        productId: item.productId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
        subtotal: item.price * item.quantity,
      })),
      payment: updated.payment,
    })
  } catch (error) {
    res.status(500).json({ error: 'Failed to update order status', message: safeError(error) })
  }
})

router.get('/customers', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { search, page = '1', limit = '20' } = req.query
    const pageNum = Math.max(1, Number(page))
    const limitNum = Math.min(100, Math.max(1, Number(limit)))
    const skip = (pageNum - 1) * limitNum

    const where = {}
    if (search) {
      const term = String(search).toLowerCase().slice(0, 100)
      where.OR = [
        { name: { contains: term } },
        { email: { contains: term } },
      ]
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
          updatedAt: true,
          _count: { select: { orders: true, reviews: true, supportTickets: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum,
      }),
      prisma.user.count({ where }),
    ])

    res.json({
      customers: users.map(user => ({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        orderCount: user._count.orders,
        reviewCount: user._count.reviews,
        ticketCount: user._count.supportTickets,
      })),
      pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) },
    })
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch customers', message: safeError(error) })
  }
})

router.get('/reviews', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { search, page = '1', limit = '20' } = req.query
    const pageNum = Math.max(1, Number(page))
    const limitNum = Math.min(100, Math.max(1, Number(limit)))
    const skip = (pageNum - 1) * limitNum

    const where = {}
    if (search) {
      const term = String(search).toLowerCase().slice(0, 100)
      where.comment = { contains: term }
    }

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where,
        include: {
          user: { select: { id: true, email: true, name: true } },
          product: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum,
      }),
      prisma.review.count({ where }),
    ])

    res.json({
      reviews: reviews.map(review => ({
        id: review.id,
        productId: review.productId,
        productName: review.product?.name || null,
        userId: review.userId,
        userName: review.user?.name || review.reviewerName || 'Anonymous',
        userEmail: review.user?.email || null,
        rating: review.rating,
        comment: review.comment,
        date: review.createdAt,
        editedAt: review.updatedAt,
      })),
      pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) },
    })
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch reviews', message: safeError(error) })
  }
})

router.delete('/reviews/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const id = req.params.id

    const review = await prisma.review.findUnique({ where: { id } })
    if (!review) {
      return res.status(404).json({ error: 'Review not found' })
    }

    await prisma.review.delete({ where: { id } })
    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete review', message: safeError(error) })
  }
})

router.get('/support-tickets', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { status, category, page = '1', limit = '20' } = req.query
    const pageNum = Math.max(1, Number(page))
    const limitNum = Math.min(100, Math.max(1, Number(limit)))
    const skip = (pageNum - 1) * limitNum

    const where = {}
    if (status && typeof status === 'string' && ['open', 'in_progress', 'resolved', 'closed'].includes(status)) {
      where.status = status
    }
    if (category && typeof category === 'string') {
      where.category = category
    }

    const [tickets, total] = await Promise.all([
      prisma.supportTicket.findMany({
        where,
        include: {
          user: { select: { id: true, email: true, name: true } },
          messages: { orderBy: { createdAt: 'asc' } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum,
      }),
      prisma.supportTicket.count({ where }),
    ])

    res.json({
      tickets: tickets.map(ticket => ({
        id: ticket.id,
        userId: ticket.userId,
        userName: ticket.user?.name || 'Unknown',
        userEmail: ticket.user?.email || null,
        subject: ticket.subject,
        message: ticket.message,
        category: ticket.category,
        status: ticket.status,
        priority: ticket.priority,
        orderId: ticket.orderId,
        productId: ticket.productId,
        createdAt: ticket.createdAt,
        updatedAt: ticket.updatedAt,
        messages: ticket.messages,
      })),
      pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) },
    })
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch support tickets', message: safeError(error) })
  }
})

router.patch('/support-tickets/:ticketId/status', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const ticketId = req.params.ticketId
    const { status, priority } = req.body

    const ticket = await prisma.supportTicket.findUnique({ where: { id: ticketId } })
    if (!ticket) {
      return res.status(404).json({ error: 'Support ticket not found' })
    }

    const data = {}
    if (status && ['open', 'in_progress', 'resolved', 'closed'].includes(status)) {
      data.status = status
    }
    if (priority && ['low', 'medium', 'high', 'urgent'].includes(priority)) {
      data.priority = priority
    }

    const updated = await prisma.supportTicket.update({
      where: { id: ticketId },
      data,
      include: { user: { select: { id: true, email: true, name: true } }, messages: true },
    })

    res.json({
      id: updated.id,
      userId: updated.userId,
      userName: updated.user?.name || 'Unknown',
      userEmail: updated.user?.email || null,
      subject: updated.subject,
      message: updated.message,
      category: updated.category,
      status: updated.status,
      priority: updated.priority,
      orderId: updated.orderId,
      productId: updated.productId,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
      messages: updated.messages,
    })
  } catch (error) {
    res.status(500).json({ error: 'Failed to update support ticket', message: safeError(error) })
  }
})

router.get('/inventory', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const inventories = await prisma.inventory.findMany({
      include: {
        product: {
          select: {
            id: true,
            name: true,
            price: true,
            categoryId: true,
            category: { select: { id: true, name: true } },
          },
        },
      },
      orderBy: { productId: 'asc' },
    })

    res.json(inventories.map(inv => ({
      productId: inv.productId,
      productName: inv.product?.name || 'Unknown',
      categoryName: inv.product?.category?.name || null,
      stock: inv.stock,
      lowStockThreshold: inv.lowStockThreshold,
      isLowStock: inv.stock <= inv.lowStockThreshold,
      updatedAt: inv.updatedAt,
    })))
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch inventory', message: safeError(error) })
  }
})

router.get('/payments', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { status, method, page = '1', limit = '20' } = req.query
    const pageNum = Math.max(1, Number(page))
    const limitNum = Math.min(100, Math.max(1, Number(limit)))
    const skip = (pageNum - 1) * limitNum

    const where = {}
    if (status && typeof status === 'string') {
      where.status = status
    }
    if (method && typeof method === 'string') {
      where.paymentMethod = method
    }

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        include: {
          user: { select: { id: true, email: true, name: true } },
          order: { select: { id: true, orderNumber: true, total: true, status: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum,
      }),
      prisma.payment.count({ where }),
    ])

    res.json({
      payments: payments.map(payment => ({
        id: payment.id,
        orderId: payment.orderId,
        orderNumber: payment.order?.orderNumber || null,
        orderTotal: payment.order?.total || null,
        orderStatus: payment.order?.status || null,
        userId: payment.userId,
        userName: payment.user?.name || 'Unknown',
        userEmail: payment.user?.email || null,
        paymentMethod: payment.paymentMethod,
        status: payment.status,
        amount: payment.amount,
        currency: payment.currency,
        provider: payment.provider,
        providerReference: payment.providerReference,
        createdAt: payment.createdAt,
        updatedAt: payment.updatedAt,
      })),
      pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) },
    })
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch payments', message: safeError(error) })
  }
})

router.get('/dashboard', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const [
      totalOrders,
      totalCustomers,
      totalProducts,
      totalRevenue,
      pendingOrders,
      lowStockCount,
      openTickets,
      recentOrders,
    ] = await Promise.all([
      prisma.order.count(),
      prisma.user.count(),
      prisma.product.count(),
      prisma.payment.aggregate({ _sum: { amount: true }, where: { status: 'paid' } }),
      prisma.order.count({ where: { status: 'pending' } }),
      prisma.inventory.count({ where: { stock: { lte: 5 } } }),
      prisma.supportTicket.count({ where: { status: 'open' } }),
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, email: true, name: true } },
          items: { include: { product: { select: { id: true, name: true, price: true, image: true } } } },
          payment: true,
        },
      }),
    ])

    res.json({
      stats: {
        totalOrders,
        totalCustomers,
        totalProducts,
        totalRevenue: totalRevenue._sum.amount || 0,
        pendingOrders,
        lowStockCount,
        openTickets,
      },
      recentOrders: recentOrders.map(order => ({
        id: order.orderNumber,
        orderId: order.id,
        userId: order.userId,
        user: order.user,
        status: order.status,
        customer: {
          name: order.customerName,
          email: order.customerEmail,
          phone: order.customerPhone,
        },
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
        payment: order.payment,
      })),
    })
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch dashboard data', message: safeError(error) })
  }
})

router.patch('/inventory/:productId', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const productId = Number(req.params.productId)
    if (Number.isNaN(productId)) {
      return res.status(404).json({ error: 'Inventory not found' })
    }

    const { stock, lowStockThreshold } = req.body

    if (stock !== undefined && typeof stock !== 'number') {
      return res.status(400).json({ error: 'Stock must be a number' })
    }

    if (stock !== undefined && stock < 0) {
      return res.status(400).json({ error: 'Stock cannot be negative' })
    }

    if (lowStockThreshold !== undefined && typeof lowStockThreshold !== 'number') {
      return res.status(400).json({ error: 'Low stock threshold must be a number' })
    }

    if (lowStockThreshold !== undefined && lowStockThreshold < 0) {
      return res.status(400).json({ error: 'Low stock threshold cannot be negative' })
    }

    const existing = await prisma.inventory.findUnique({
      where: { productId },
    })

    if (!existing) {
      return res.status(404).json({ error: 'Inventory not found' })
    }

    const updated = await prisma.inventory.update({
      where: { productId },
      data: {
        stock: stock ?? existing.stock,
        lowStockThreshold: lowStockThreshold ?? existing.lowStockThreshold,
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            categoryId: true,
          }
        }
      },
    })

    res.json({
      productId: updated.productId,
      stock: updated.stock,
      lowStockThreshold: updated.lowStockThreshold,
      updatedAt: updated.updatedAt,
      product: updated.product,
    })
  } catch (error) {
    res.status(500).json({ error: 'Failed to update inventory', message: safeError(error) })
  }
})

export default router