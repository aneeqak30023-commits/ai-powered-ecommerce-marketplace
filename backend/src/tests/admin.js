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

let adminCounter = 0
async function getAdminToken(app) {
  const server = app.listen(0)
  const port = server.address().port
  const base = `http://localhost:${port}`
  const email = `admin-${++adminCounter}@nexmart.example.com`

  try {
    const response = await request(`${base}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: 'admin123', name: 'Admin User' }),
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

describe('Admin API', () => {
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

  it('GET /api/admin/dashboard requires admin auth', async () => {
    const { app } = await import('../../src/index.js')
    const { token, base, server } = await getAuthToken(app, 'admin1@example.com', 'password123')

    try {
      const response = await request(`${base}/api/admin/dashboard`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      assert.strictEqual(response.status, 403)
    } finally {
      server.close()
      server.unref()
    }
  })

  it('GET /api/admin/dashboard returns stats for admin', async () => {
    const { app } = await import('../../src/index.js')
    const { token, base, server } = await getAdminToken(app)

    try {
      const response = await request(`${base}/api/admin/dashboard`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      assert.strictEqual(response.status, 200)
      assert.ok(response.body.stats)
      assert.ok(typeof response.body.stats.totalOrders === 'number')
      assert.ok(typeof response.body.stats.totalCustomers === 'number')
      assert.ok(typeof response.body.stats.totalProducts === 'number')
      assert.ok(Array.isArray(response.body.recentOrders))
    } finally {
      server.close()
      server.unref()
    }
  })

  it('GET /api/admin/products returns products for admin', async () => {
    const { app } = await import('../../src/index.js')
    const { token, base, server } = await getAdminToken(app)

    try {
      const response = await request(`${base}/api/admin/products`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      assert.strictEqual(response.status, 200)
      assert.ok(Array.isArray(response.body))
    } finally {
      server.close()
      server.unref()
    }
  })

  it('GET /api/admin/orders returns orders for admin', async () => {
    const { app } = await import('../../src/index.js')
    const { token, base, server } = await getAdminToken(app)

    try {
      const response = await request(`${base}/api/admin/orders`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      assert.strictEqual(response.status, 200)
      assert.ok(Array.isArray(response.body.orders))
      assert.ok(typeof response.body.pagination.total === 'number')
    } finally {
      server.close()
      server.unref()
    }
  })

  it('GET /api/admin/customers returns customers for admin', async () => {
    const { app } = await import('../../src/index.js')
    const { token, base, server } = await getAdminToken(app)

    try {
      const response = await request(`${base}/api/admin/customers`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      assert.strictEqual(response.status, 200)
      assert.ok(Array.isArray(response.body.customers))
      assert.ok(typeof response.body.pagination.total === 'number')
    } finally {
      server.close()
      server.unref()
    }
  })

  it('GET /api/admin/reviews returns reviews for admin', async () => {
    const { app } = await import('../../src/index.js')
    const { token, base, server } = await getAdminToken(app)

    try {
      const response = await request(`${base}/api/admin/reviews`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      assert.strictEqual(response.status, 200)
      assert.ok(Array.isArray(response.body.reviews))
    } finally {
      server.close()
      server.unref()
    }
  })

  it('GET /api/admin/support-tickets returns tickets for admin', async () => {
    const { app } = await import('../../src/index.js')
    const { token, base, server } = await getAdminToken(app)

    try {
      const response = await request(`${base}/api/admin/support-tickets`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      assert.strictEqual(response.status, 200)
      assert.ok(Array.isArray(response.body.tickets))
    } finally {
      server.close()
      server.unref()
    }
  })

  it('GET /api/admin/inventory returns inventory for admin', async () => {
    const { app } = await import('../../src/index.js')
    const { token, base, server } = await getAdminToken(app)

    try {
      const response = await request(`${base}/api/admin/inventory`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      assert.strictEqual(response.status, 200)
      assert.ok(Array.isArray(response.body))
    } finally {
      server.close()
      server.unref()
    }
  })

  it('GET /api/admin/payments returns payments for admin', async () => {
    const { app } = await import('../../src/index.js')
    const { token, base, server } = await getAdminToken(app)

    try {
      const response = await request(`${base}/api/admin/payments`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      assert.strictEqual(response.status, 200)
      assert.ok(Array.isArray(response.body.payments))
    } finally {
      server.close()
      server.unref()
    }
  })

  it('POST /api/admin/products creates product for admin', async () => {
    const { app } = await import('../../src/index.js')
    const { token, base, server } = await getAdminToken(app)

    try {
      const response = await request(`${base}/api/admin/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: 'Admin Test Product',
          description: 'Test description',
          price: 19.99,
          categoryId: 'electronics',
          stock: 10,
        }),
      })

      assert.strictEqual(response.status, 201)
      assert.strictEqual(response.body.name, 'Admin Test Product')
      assert.strictEqual(response.body.price, 19.99)
    } finally {
      server.close()
      server.unref()
    }
  })

  it('PATCH /api/admin/orders/:orderId/status updates order status for admin', async () => {
    const { app } = await import('../../src/index.js')
    const { token: adminToken, base: adminBase, server: adminServer } = await getAdminToken(app)

    try {
      const orderResponse = await request(`${adminBase}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          items: [{ id: 1, quantity: 1, price: 10 }],
          customer: { name: 'Admin Test', email: 'admin.test@example.com', phone: '123' },
          shippingAddress: { address: '123 St', city: 'City', state: 'ST', zip: '12345' },
          subtotal: 10,
          shipping: 0,
          tax: 0.8,
          total: 10.8,
        }),
      })

      assert.strictEqual(orderResponse.status, 201)
      const orderId = orderResponse.body.id

      const statusResponse = await request(`${adminBase}/api/admin/orders/${encodeURIComponent(orderId)}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ status: 'shipped' }),
      })

      assert.strictEqual(statusResponse.status, 200)
      assert.strictEqual(statusResponse.body.status, 'shipped')
    } finally {
      adminServer.close()
      adminServer.unref()
    }
  })
})
