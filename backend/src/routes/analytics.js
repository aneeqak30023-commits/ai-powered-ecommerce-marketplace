import express from 'express'
import { PrismaClient } from '@prisma/client'
import { authMiddleware, adminMiddleware } from '../middleware/admin.js'
import { safeError } from '../utils/errors.js'

const router = express.Router()
const prisma = new PrismaClient()

function getRangeDates(range) {
  const now = new Date()
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999)
  let start

  switch (range) {
    case '7d':
      start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      break
    case '30d':
      start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      break
    case '90d':
      start = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
      break
    case 'all':
      start = new Date('2000-01-01')
      break
    default:
      start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  }

  start.setHours(0, 0, 0, 0)
  return { start, end }
}

function formatDateKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

router.get('/overview', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { range = '30d' } = req.query
    const { start, end } = getRangeDates(range)

    const [
      totalRevenue,
      totalOrders,
      totalCustomers,
      totalProducts,
      avgOrderValue,
      pendingOrders,
      completedOrders,
      cancelledOrders,
    ] = await Promise.all([
      prisma.payment.aggregate({
        _sum: { amount: true },
        where: {
          status: 'paid',
          createdAt: { gte: start, lte: end },
        },
      }),
      prisma.order.count({
        where: { createdAt: { gte: start, lte: end } },
      }),
      prisma.user.count({
        where: { createdAt: { gte: start, lte: end } },
      }),
      prisma.product.count(),
      prisma.order.aggregate({
        _avg: { total: true },
        where: {
          status: { not: 'cancelled' },
          createdAt: { gte: start, lte: end },
        },
      }),
      prisma.order.count({
        where: { status: 'pending', createdAt: { gte: start, lte: end } },
      }),
      prisma.order.count({
        where: { status: 'delivered', createdAt: { gte: start, lte: end } },
      }),
      prisma.order.count({
        where: { status: 'cancelled', createdAt: { gte: start, lte: end } },
      }),
    ])

    res.json({
      totalRevenue: totalRevenue._sum.amount || 0,
      totalOrders,
      totalCustomers,
      totalProducts,
      averageOrderValue: avgOrderValue._avg.total || 0,
      pendingOrders,
      completedOrders,
      cancelledOrders,
    })
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch analytics overview', message: safeError(error) })
  }
})

router.get('/sales', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { range = '30d', granularity } = req.query
    const { start, end } = getRangeDates(range)

    const orders = await prisma.order.findMany({
      where: {
        status: { not: 'cancelled' },
        createdAt: { gte: start, lte: end },
      },
      select: {
        createdAt: true,
        total: true,
        status: true,
      },
    })

    const dataMap = new Map()

    for (const order of orders) {
      const date = new Date(order.createdAt)
      let key
      if (granularity === 'month') {
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      } else if (granularity === 'week') {
        const weekStart = new Date(date)
        weekStart.setDate(date.getDate() - date.getDay())
        key = formatDateKey(weekStart)
      } else {
        key = formatDateKey(date)
      }

      const existing = dataMap.get(key) || { revenue: 0, orders: 0 }
      existing.revenue += Number(order.total) || 0
      existing.orders += 1
      dataMap.set(key, existing)
    }

    const data = Array.from(dataMap.entries())
      .map(([date, values]) => ({
        date,
        revenue: values.revenue,
        orders: values.orders,
        averageOrderValue: values.orders > 0 ? values.revenue / values.orders : 0,
      }))
      .sort((a, b) => a.date.localeCompare(b.date))

    res.json({ data, range })
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch sales analytics', message: safeError(error) })
  }
})

router.get('/products', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const [topProducts, categoryPerformance, lowStock, outOfStock] = await Promise.all([
      prisma.orderItem.groupBy({
        by: ['productId'],
        _sum: { quantity: true, price: true },
        orderBy: { _sum: { quantity: 'desc' } },
        take: 10,
      }),
      prisma.product.findMany({
        select: {
          id: true,
          name: true,
          categoryId: true,
          category: { select: { id: true, name: true } },
          orderItems: {
            select: {
              quantity: true,
              price: true,
            },
          },
        },
      }),
      prisma.inventory.findMany({
        where: { stock: { lte: 5, gt: 0 } },
        include: {
          product: {
            select: {
              id: true,
              name: true,
              price: true,
              category: { select: { name: true } },
            },
          },
        },
        orderBy: { stock: 'asc' },
      }),
      prisma.inventory.findMany({
        where: { stock: 0 },
        include: {
          product: {
            select: {
              id: true,
              name: true,
              price: true,
              category: { select: { name: true } },
            },
          },
        },
      }),
    ])

    const topProductsWithDetails = await Promise.all(
      topProducts.map(async (item) => {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
          select: { id: true, name: true, image: true, category: { select: { name: true } } },
        })
        return {
          productId: item.productId,
          name: product?.name || 'Unknown',
          image: product?.image || null,
          category: product?.category?.name || null,
          totalQuantity: item._sum.quantity || 0,
          totalRevenue: (item._sum.price || 0) * (item._sum.quantity || 0),
        }
      })
    )

    const categoryMap = new Map()
    for (const product of categoryPerformance) {
      const catName = product.category?.name || 'Uncategorized'
      const existing = categoryMap.get(catName) || { revenue: 0, quantity: 0, productCount: 0 }
      for (const item of product.orderItems) {
        existing.revenue += (Number(item.price) || 0) * (Number(item.quantity) || 0)
        existing.quantity += Number(item.quantity) || 0
      }
      existing.productCount += 1
      categoryMap.set(catName, existing)
    }

    const categoryData = Array.from(categoryMap.entries())
      .map(([name, values]) => ({ name, ...values }))
      .sort((a, b) => b.revenue - a.revenue)

    res.json({
      topProducts: topProductsWithDetails,
      categories: categoryData,
      lowStock: lowStock.map(inv => ({
        productId: inv.productId,
        name: inv.product?.name || 'Unknown',
        price: inv.product?.price || 0,
        category: inv.product?.category?.name || null,
        stock: inv.stock,
        threshold: inv.lowStockThreshold,
      })),
      outOfStock: outOfStock.map(inv => ({
        productId: inv.productId,
        name: inv.product?.name || 'Unknown',
        price: inv.product?.price || 0,
        category: inv.product?.category?.name || null,
      })),
    })
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch product analytics', message: safeError(error) })
  }
})

router.get('/customers', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { range = '30d' } = req.query
    const { start, end } = getRangeDates(range)

    const [totalCustomers, newCustomersOverTime, customersWithOrders] = await Promise.all([
      prisma.user.count(),
      prisma.user.findMany({
        where: { createdAt: { gte: start, lte: end } },
        select: { createdAt: true },
      }),
      prisma.user.findMany({
        where: {
          orders: { some: {} },
        },
        select: {
          id: true,
          name: true,
          email: true,
          _count: { select: { orders: true } },
          orders: {
            select: { total: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 20,
      }),
    ])

    const customerMap = new Map()
    for (const customer of newCustomersOverTime) {
      const key = formatDateKey(new Date(customer.createdAt))
      customerMap.set(key, (customerMap.get(key) || 0) + 1)
    }

    const newCustomersData = Array.from(customerMap.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date))

    const topCustomers = customersWithOrders
      .map(customer => ({
        id: customer.id,
        name: customer.name,
        email: customer.email,
        orderCount: customer._count.orders,
        totalSpent: customer.orders.reduce((sum, order) => sum + (Number(order.total) || 0), 0),
      }))
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 10)

    res.json({
      totalCustomers,
      newCustomersOverTime: newCustomersData,
      customersWithOrders,
      topCustomers,
    })
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch customer analytics', message: safeError(error) })
  }
})

router.get('/orders', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { range = '30d' } = req.query
    const { start, end } = getRangeDates(range)

    const [
      ordersByStatus,
      ordersByPaymentMethod,
      ordersOverTime,
      cancelledOrders,
    ] = await Promise.all([
      prisma.order.groupBy({
        by: ['status'],
        where: { createdAt: { gte: start, lte: end } },
        _count: { id: true },
      }),
      prisma.order.findMany({
        where: {
          createdAt: { gte: start, lte: end },
          payment: { isNot: null },
        },
        select: {
          status: true,
          payment: { select: { paymentMethod: true } },
        },
      }),
      prisma.order.findMany({
        where: { createdAt: { gte: start, lte: end } },
        select: { createdAt: true },
      }),
      prisma.order.count({
        where: { status: 'cancelled', createdAt: { gte: start, lte: end } },
      }),
    ])

    const paymentMethodMap = new Map()
    for (const order of ordersByPaymentMethod) {
      const method = order.payment?.paymentMethod || 'unknown'
      paymentMethodMap.set(method, (paymentMethodMap.get(method) || 0) + 1)
    }

    const dateMap = new Map()
    for (const order of ordersOverTime) {
      const key = formatDateKey(new Date(order.createdAt))
      dateMap.set(key, (dateMap.get(key) || 0) + 1)
    }

    const ordersOverTimeData = Array.from(dateMap.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date))

    res.json({
      byStatus: ordersByStatus.map(item => ({ status: item.status, count: item._count.id })),
      byPaymentMethod: Array.from(paymentMethodMap.entries()).map(([method, count]) => ({ method, count })),
      overTime: ordersOverTimeData,
      cancelledOrders,
    })
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch order analytics', message: safeError(error) })
  }
})

router.get('/payments', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { range = '30d' } = req.query
    const { start, end } = getRangeDates(range)

    const [
      paymentsByStatus,
      paymentsByMethod,
      paymentsByCurrency,
      totalAmount,
    ] = await Promise.all([
      prisma.payment.groupBy({
        by: ['status'],
        where: { createdAt: { gte: start, lte: end } },
        _sum: { amount: true },
        _count: { id: true },
      }),
      prisma.payment.groupBy({
        by: ['paymentMethod'],
        where: { createdAt: { gte: start, lte: end } },
        _sum: { amount: true },
        _count: { id: true },
      }),
      prisma.payment.groupBy({
        by: ['currency'],
        where: { createdAt: { gte: start, lte: end } },
        _sum: { amount: true },
        _count: { id: true },
      }),
      prisma.payment.aggregate({
        _sum: { amount: true },
        where: { createdAt: { gte: start, lte: end } },
      }),
    ])

    res.json({
      totalAmount: totalAmount._sum.amount || 0,
      byStatus: paymentsByStatus.map(item => ({
        status: item.status,
        count: item._count.id,
        amount: item._sum.amount || 0,
      })),
      byMethod: paymentsByMethod.map(item => ({
        method: item.paymentMethod,
        count: item._count.id,
        amount: item._sum.amount || 0,
      })),
      byCurrency: paymentsByCurrency.map(item => ({
        currency: item.currency,
        count: item._count.id,
        amount: item._sum.amount || 0,
      })),
    })
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch payment analytics', message: safeError(error) })
  }
})

router.get('/support', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { range = '30d' } = req.query
    const { start, end } = getRangeDates(range)

    const [
      totalTickets,
      openTickets,
      resolvedTickets,
      ticketsByCategory,
      ticketsOverTime,
    ] = await Promise.all([
      prisma.supportTicket.count({
        where: { createdAt: { gte: start, lte: end } },
      }),
      prisma.supportTicket.count({
        where: { status: 'open', createdAt: { gte: start, lte: end } },
      }),
      prisma.supportTicket.count({
        where: { status: 'resolved', createdAt: { gte: start, lte: end } },
      }),
      prisma.supportTicket.groupBy({
        by: ['category'],
        where: { createdAt: { gte: start, lte: end } },
        _count: { id: true },
      }),
      prisma.supportTicket.findMany({
        where: { createdAt: { gte: start, lte: end } },
        select: { createdAt: true },
      }),
    ])

    const dateMap = new Map()
    for (const ticket of ticketsOverTime) {
      const key = formatDateKey(new Date(ticket.createdAt))
      dateMap.set(key, (dateMap.get(key) || 0) + 1)
    }

    const ticketsOverTimeData = Array.from(dateMap.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date))

    res.json({
      totalTickets,
      openTickets,
      resolvedTickets,
      byCategory: ticketsByCategory.map(item => ({ category: item.category, count: item._count.id })),
      overTime: ticketsOverTimeData,
    })
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch support analytics', message: safeError(error) })
  }
})

router.get('/returns', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { range = '30d' } = req.query
    const { start, end } = getRangeDates(range)

    const [returnsByStatus, returnsOverTime, totalRefundAmount, totalReturns] = await Promise.all([
      prisma.return.groupBy({
        by: ['status'],
        where: { createdAt: { gte: start, lte: end } },
        _count: { id: true },
        _sum: { totalAmount: true },
      }),
      prisma.return.findMany({
        where: { createdAt: { gte: start, lte: end } },
        select: { createdAt: true },
      }),
      prisma.refund.aggregate({
        _sum: { amount: true },
        where: { createdAt: { gte: start, lte: end } },
      }),
      prisma.return.count({ where: { createdAt: { gte: start, lte: end } } }),
    ])

    const dateMap = new Map()
    for (const ret of returnsOverTime) {
      const key = formatDateKey(new Date(ret.createdAt))
      dateMap.set(key, (dateMap.get(key) || 0) + 1)
    }

    const returnsOverTimeData = Array.from(dateMap.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date))

    res.json({
      totalReturns,
      totalRefundAmount: totalRefundAmount._sum.amount || 0,
      byStatus: returnsByStatus.map(item => ({
        status: item.status,
        count: item._count.id,
        amount: item._sum.totalAmount || 0,
      })),
      overTime: returnsOverTimeData,
    })
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch returns analytics', message: safeError(error) })
  }
})

router.get('/refunds', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { range = '30d' } = req.query
    const { start, end } = getRangeDates(range)

    const [refundsByStatus, refundsByMethod, refundsOverTime, totalAmount, totalRefunds] = await Promise.all([
      prisma.refund.groupBy({
        by: ['status'],
        where: { createdAt: { gte: start, lte: end } },
        _count: { id: true },
        _sum: { amount: true },
      }),
      prisma.refund.groupBy({
        by: ['method'],
        where: { createdAt: { gte: start, lte: end } },
        _count: { id: true },
        _sum: { amount: true },
      }),
      prisma.refund.findMany({
        where: { createdAt: { gte: start, lte: end } },
        select: { createdAt: true },
      }),
      prisma.refund.aggregate({
        _sum: { amount: true },
        where: { createdAt: { gte: start, lte: end } },
      }),
      prisma.refund.count({ where: { createdAt: { gte: start, lte: end } } }),
    ])

    const dateMap = new Map()
    for (const refund of refundsOverTime) {
      const key = formatDateKey(new Date(refund.createdAt))
      dateMap.set(key, (dateMap.get(key) || 0) + 1)
    }

    const refundsOverTimeData = Array.from(dateMap.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date))

    res.json({
      totalRefunds,
      totalAmount: totalAmount._sum.amount || 0,
      byStatus: refundsByStatus.map(item => ({
        status: item.status,
        count: item._count.id,
        amount: item._sum.amount || 0,
      })),
      byMethod: refundsByMethod.map(item => ({
        method: item.method,
        count: item._count.id,
        amount: item._sum.amount || 0,
      })),
      overTime: refundsOverTimeData,
    })
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch refund analytics', message: safeError(error) })
  }
})

export default router