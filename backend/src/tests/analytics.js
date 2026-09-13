import { describe, it, before, after } from 'node:test'
import assert from 'node:assert'
import http from 'http'
import { PrismaClient } from '@prisma/client'
import { seedDatabase } from '../_seed-helper.js'

const prisma = new PrismaClient()

function request(url, options = {}) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url)
    const req = http.request(parsedUrl, options, (res) => {
      let data = ''
      res.on('data', (chunk) => { data += chunk })
      res.on('end', () => {
        let body
        try { body = JSON.parse(data) } catch { body = data }
        resolve({ status: res.statusCode, headers: res.headers, body })
      })
    })
    req.on('error', reject)
    if (options.body) req.write(options.body)
    req.end()
  })
}

async function getAuthToken(app, email, password) {
  const server = app.listen(0)
  const port = server.address().port
  const base = `http://localhost:${port}`

  try {
    const response = await request(`${base}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name: 'Test User' }),
    })
    return { token: response.body.session.token, base, server }
  } catch (error) {
    server.close()
    server.unref()
    throw error
  }
}

async function getAdminToken(app) {
  const server = app.listen(0)
  const port = server.address().port
  const base = `http://localhost:${port}`
  const email = `analytics-admin-${Date.now()}@nexmart.example.com`

  try {
    const response = await request(`${base}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: 'admin123', name: 'Analytics Admin' }),
    })

    await prisma.user.update({
      where: { email },
      data: { role: 'admin' },
    })

    return { token: response.body.session.token, base, server }
  } catch (error) {
    server.close()
    server.unref()
    throw error
  }
}

describe('Analytics API', () => {
  before(async () => {
    await seedDatabase()
    await prisma.payment.deleteMany()
    await prisma.review.deleteMany()
    await prisma.supportTicketMessage.deleteMany()
    await prisma.supportTicket.deleteMany()
    await prisma.orderItem.deleteMany()
    await prisma.order.deleteMany()
    await prisma.cartItem.deleteMany()
    await prisma.wishlist.deleteMany()
    await prisma.user.deleteMany()
  })

  after(async () => {
    await prisma.payment.deleteMany()
    await prisma.review.deleteMany()
    await prisma.supportTicketMessage.deleteMany()
    await prisma.supportTicket.deleteMany()
    await prisma.orderItem.deleteMany()
    await prisma.order.deleteMany()
    await prisma.cartItem.deleteMany()
    await prisma.wishlist.deleteMany()
    await prisma.user.deleteMany()
    await prisma.$disconnect()
  })

  it('GET /api/admin/analytics/overview requires admin auth', async () => {
    const { app } = await import('../../src/index.js')
    const { token, base, server } = await getAuthToken(app, 'analytics1@example.com', 'password123')

    try {
      const response = await request(`${base}/api/admin/analytics/overview`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      assert.strictEqual(response.status, 403)
    } finally {
      server.close()
      server.unref()
    }
  })

  it('GET /api/admin/analytics/overview returns stats for admin', async () => {
    const { app } = await import('../../src/index.js')
    const { token, base, server } = await getAdminToken(app)

    try {
      const response = await request(`${base}/api/admin/analytics/overview?range=30d`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      assert.strictEqual(response.status, 200)
      assert.ok(typeof response.body.totalRevenue === 'number')
      assert.ok(typeof response.body.totalOrders === 'number')
      assert.ok(typeof response.body.totalCustomers === 'number')
      assert.ok(typeof response.body.averageOrderValue === 'number')
      assert.ok(typeof response.body.pendingOrders === 'number')
      assert.ok(typeof response.body.completedOrders === 'number')
      assert.ok(typeof response.body.cancelledOrders === 'number')
    } finally {
      server.close()
      server.unref()
    }
  })

  it('GET /api/admin/analytics/sales returns time-series data', async () => {
    const { app } = await import('../../src/index.js')
    const { token, base, server } = await getAdminToken(app)

    try {
      const response = await request(`${base}/api/admin/analytics/sales?range=30d`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      assert.strictEqual(response.status, 200)
      assert.ok(Array.isArray(response.body.data))
      assert.strictEqual(response.body.range, '30d')
    } finally {
      server.close()
      server.unref()
    }
  })

  it('GET /api/admin/analytics/products returns product analytics', async () => {
    const { app } = await import('../../src/index.js')
    const { token, base, server } = await getAdminToken(app)

    try {
      const response = await request(`${base}/api/admin/analytics/products`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      assert.strictEqual(response.status, 200)
      assert.ok(Array.isArray(response.body.topProducts))
      assert.ok(Array.isArray(response.body.categories))
      assert.ok(Array.isArray(response.body.lowStock))
      assert.ok(Array.isArray(response.body.outOfStock))
    } finally {
      server.close()
      server.unref()
    }
  })

  it('GET /api/admin/analytics/customers returns customer analytics', async () => {
    const { app } = await import('../../src/index.js')
    const { token, base, server } = await getAdminToken(app)

    try {
      const response = await request(`${base}/api/admin/analytics/customers?range=30d`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      assert.strictEqual(response.status, 200)
      assert.ok(typeof response.body.totalCustomers === 'number')
      assert.ok(Array.isArray(response.body.newCustomersOverTime))
      assert.ok(Array.isArray(response.body.topCustomers))
    } finally {
      server.close()
      server.unref()
    }
  })

  it('GET /api/admin/analytics/orders returns order analytics', async () => {
    const { app } = await import('../../src/index.js')
    const { token, base, server } = await getAdminToken(app)

    try {
      const response = await request(`${base}/api/admin/analytics/orders?range=30d`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      assert.strictEqual(response.status, 200)
      assert.ok(Array.isArray(response.body.byStatus))
      assert.ok(Array.isArray(response.body.byPaymentMethod))
      assert.ok(Array.isArray(response.body.overTime))
      assert.ok(typeof response.body.cancelledOrders === 'number')
    } finally {
      server.close()
      server.unref()
    }
  })

  it('GET /api/admin/analytics/payments returns payment analytics', async () => {
    const { app } = await import('../../src/index.js')
    const { token, base, server } = await getAdminToken(app)

    try {
      const response = await request(`${base}/api/admin/analytics/payments?range=30d`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      assert.strictEqual(response.status, 200)
      assert.ok(typeof response.body.totalAmount === 'number')
      assert.ok(Array.isArray(response.body.byStatus))
      assert.ok(Array.isArray(response.body.byMethod))
      assert.ok(Array.isArray(response.body.byCurrency))
    } finally {
      server.close()
      server.unref()
    }
  })

  it('GET /api/admin/analytics/support returns support analytics', async () => {
    const { app } = await import('../../src/index.js')
    const { token, base, server } = await getAdminToken(app)

    try {
      const response = await request(`${base}/api/admin/analytics/support?range=30d`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      assert.strictEqual(response.status, 200)
      assert.ok(typeof response.body.totalTickets === 'number')
      assert.ok(typeof response.body.openTickets === 'number')
      assert.ok(typeof response.body.resolvedTickets === 'number')
      assert.ok(Array.isArray(response.body.byCategory))
      assert.ok(Array.isArray(response.body.overTime))
    } finally {
      server.close()
      server.unref()
    }
  })
})
