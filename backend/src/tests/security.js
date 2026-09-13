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
  const email = `security-admin-${Date.now()}@nexmart.example.com`

  try {
    const response = await request(`${base}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: 'admin123', name: 'Security Admin' }),
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

describe('Security API', () => {
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

  it('rejects request without authorization header', async () => {
    const { app } = await import('../../src/index.js')
    const { base, server } = await getAuthToken(app, 'security1@example.com', 'password123')

    try {
      const response = await request(`${base}/api/orders`, {
        headers: { 'Content-Type': 'application/json' },
      })

      assert.strictEqual(response.status, 401)
    } finally {
      server.close()
      server.unref()
    }
  })

  it('rejects request with invalid token', async () => {
    const { app } = await import('../../src/index.js')
    const { base, server } = await getAuthToken(app, 'security2@example.com', 'password123')

    try {
      const response = await request(`${base}/api/orders`, {
        headers: { Authorization: 'Bearer invalid-token' },
      })

      assert.strictEqual(response.status, 401)
    } finally {
      server.close()
      server.unref()
    }
  })

  it('prevents normal user from accessing admin endpoints', async () => {
    const { app } = await import('../../src/index.js')
    const { token, base, server } = await getAuthToken(app, 'security3@example.com', 'password123')

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

  it('prevents user from accessing another users order', async () => {
    const { app } = await import('../../src/index.js')
    const { token: user1Token, base: user1Base, server: user1Server } = await getAuthToken(app, 'security-user1@example.com', 'password123')
    const { token: user2Token, base: user2Base, server: user2Server } = await getAuthToken(app, 'security-user2@example.com', 'password123')

    try {
      const orderResponse = await request(`${user1Base}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user1Token}`,
        },
        body: JSON.stringify({
          items: [{ id: 1, quantity: 1, price: 10 }],
          customer: { name: 'User1', email: 'security-user1@example.com', phone: '123' },
          shippingAddress: { address: '123 St', city: 'City', state: 'ST', zip: '12345' },
          subtotal: 10,
          shipping: 0,
          tax: 0.8,
          total: 10.8,
        }),
      })

      assert.strictEqual(orderResponse.status, 201)
      const orderId = orderResponse.body.id

      const crossUserResponse = await request(`${user2Base}/api/orders/${encodeURIComponent(orderId)}`, {
        headers: { Authorization: `Bearer ${user2Token}` },
      })

      assert.strictEqual(crossUserResponse.status, 404)
    } finally {
      user1Server.close()
      user1Server.unref()
      user2Server.close()
      user2Server.unref()
    }
  })

  it('does not expose password hash in user serialization', async () => {
    const { app } = await import('../../src/index.js')
    const { token, base, server } = await getAuthToken(app, 'security4@example.com', 'password123')

    try {
      const response = await request(`${base}/api/auth/session`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      assert.strictEqual(response.status, 200)
      assert.ok(!response.body.user.passwordHash)
      assert.ok(!response.body.user.salt)
      assert.ok(!response.body.user.password)
    } finally {
      server.close()
      server.unref()
    }
  })

  it('rejects invalid product IDs', async () => {
    const { app } = await import('../../src/index.js')
    const { token, base, server } = await getAuthToken(app, 'security5@example.com', 'password123')

    try {
      const response = await request(`${base}/api/cart/invalid-id`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ quantity: 1 }),
      })

      assert.strictEqual(response.status, 404)
    } finally {
      server.close()
      server.unref()
    }
  })

  it('rejects negative quantity for cart', async () => {
    const { app } = await import('../../src/index.js')
    const { token, base, server } = await getAuthToken(app, 'security6@example.com', 'password123')

    try {
      const response = await request(`${base}/api/cart/1`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ quantity: -1 }),
      })

      assert.strictEqual(response.status, 400)
    } finally {
      server.close()
      server.unref()
    }
  })

  it('rejects order creation with missing fields', async () => {
    const { app } = await import('../../src/index.js')
    const { token, base, server } = await getAuthToken(app, 'security7@example.com', 'password123')

    try {
      const response = await request(`${base}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({}),
      })

      assert.strictEqual(response.status, 400)
    } finally {
      server.close()
      server.unref()
    }
  })

  it('rejects review with invalid rating', async () => {
    const { app } = await import('../../src/index.js')
    const { token, base, server } = await getAuthToken(app, 'security8@example.com', 'password123')

    try {
      const existingProduct = await prisma.product.findFirst()
      const productId = existingProduct ? existingProduct.id : 1
      console.log('Security test: using product ID', productId, 'exists:', !!existingProduct)

      const response = await request(`${base}/api/reviews/products/${productId}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ rating: 10, text: 'Great product!' }),
      })

      console.log('Security test: review response status', response.status, 'body', JSON.stringify(response.body))

      assert.strictEqual(response.status, 400)
    } finally {
      server.close()
      server.unref()
    }
  })

  it('rejects support ticket with invalid category', async () => {
    const { app } = await import('../../src/index.js')
    const { token, base, server } = await getAuthToken(app, 'security9@example.com', 'password123')

    try {
      const response = await request(`${base}/api/support/tickets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ subject: 'Test', message: 'This is a test message', category: 'invalid-category' }),
      })

      assert.strictEqual(response.status, 400)
    } finally {
      server.close()
      server.unref()
    }
  })

  it('rejects inventory update with negative stock', async () => {
    const { app } = await import('../../src/index.js')
    const { token, base, server } = await getAuthToken(app, 'security10@example.com', 'password123')

    try {
      const response = await request(`${base}/api/admin/inventory/1`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ stock: -5 }),
      })

      assert.strictEqual(response.status, 403)
    } finally {
      server.close()
      server.unref()
    }
  })
})
