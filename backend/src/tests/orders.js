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

describe('Orders API', () => {
  before(async () => {
    await seedDatabase()
    await prisma.review.deleteMany()
    await prisma.user.deleteMany()
    await prisma.order.deleteMany()
    await prisma.orderItem.deleteMany()
    await prisma.cartItem.deleteMany()
    await prisma.wishlist.deleteMany()
  })

  after(async () => {
    await prisma.review.deleteMany()
    await prisma.orderItem.deleteMany()
    await prisma.order.deleteMany()
    await prisma.cartItem.deleteMany()
    await prisma.wishlist.deleteMany()
    await prisma.user.deleteMany()
    await prisma.$disconnect()
  })

  it('GET /api/orders returns empty array for new user', async () => {
    const { app } = await import('../../src/index.js')
    const { token, base, server } = await getAuthToken(app, 'order1@example.com', 'password123')

    try {
      const response = await request(`${base}/api/orders`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      assert.strictEqual(response.status, 200)
      assert.ok(Array.isArray(response.body))
      assert.strictEqual(response.body.length, 0)
    } finally {
      server.close()
      server.unref()
    }
  })

  it('POST /api/orders creates a new order', async () => {
    const { app } = await import('../../src/index.js')
    const { token, base, server } = await getAuthToken(app, 'order2@example.com', 'password123')

    try {
      const response = await request(`${base}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          items: [{ id: 1, quantity: 2, price: 10 }],
          customer: { name: 'Test', email: 'test@example.com', phone: '123' },
          shippingAddress: { address: '123 St', city: 'City', state: 'ST', zip: '12345' },
          subtotal: 20,
          shipping: 0,
          tax: 1.6,
          total: 21.6,
        }),
      })

      assert.strictEqual(response.status, 201)
      assert.ok(response.body.id.startsWith('ORD-'))
      assert.strictEqual(response.body.status, 'confirmed')
      assert.strictEqual(response.body.items.length, 1)
      assert.strictEqual(response.body.items[0].quantity, 2)
    } finally {
      server.close()
      server.unref()
    }
  })

  it('POST /api/orders deducts inventory atomically', async () => {
    const { app } = await import('../../src/index.js')
    const { token, base, server } = await getAuthToken(app, 'order3@example.com', 'password123')

    try {
      const inventoryBefore = await request(`${base}/api/inventory/1`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const stockBefore = inventoryBefore.body.stock

      await request(`${base}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          items: [{ id: 1, quantity: 3, price: 10 }],
          customer: { name: 'Test', email: 'test@example.com', phone: '123' },
          shippingAddress: { address: '123 St', city: 'City', state: 'ST', zip: '12345' },
          subtotal: 30,
          shipping: 0,
          tax: 2.4,
          total: 32.4,
        }),
      })

      const inventoryAfter = await request(`${base}/api/inventory/1`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      assert.strictEqual(inventoryAfter.body.stock, stockBefore - 3)
    } finally {
      server.close()
      server.unref()
    }
  })

  it('GET /api/orders returns only authenticated users orders', async () => {
    const { app } = await import('../../src/index.js')
    const { token: token1, base, server: server1 } = await getAuthToken(app, 'order4a@example.com', 'password123')

    try {
      await request(`${base}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token1}`,
        },
        body: JSON.stringify({
          items: [{ id: 1, quantity: 1, price: 10 }],
          customer: { name: 'User 1', email: 'u1@test.com', phone: '111' },
          shippingAddress: { address: '111 St', city: 'City', state: 'ST', zip: '11111' },
          subtotal: 10,
          shipping: 0,
          tax: 0.8,
          total: 10.8,
        }),
      })

      const { token: token2, server: server2 } = await getAuthToken(app, 'order4b@example.com', 'password123')

      try {
        const response = await request(`${base}/api/orders`, {
          headers: { Authorization: `Bearer ${token2}` },
        })

        assert.strictEqual(response.status, 200)
        assert.strictEqual(response.body.length, 0)
      } finally {
        server2.close()
        server2.unref()
      }
    } finally {
      server1.close()
      server1.unref()
    }
  })

  it('GET /api/orders/:orderId returns order for authenticated user', async () => {
    const { app } = await import('../../src/index.js')
    const { token, base, server } = await getAuthToken(app, 'order5@example.com', 'password123')

    try {
      const createResponse = await request(`${base}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          items: [{ id: 1, quantity: 1, price: 10 }],
          customer: { name: 'Test', email: 'test@example.com', phone: '123' },
          shippingAddress: { address: '123 St', city: 'City', state: 'ST', zip: '12345' },
          subtotal: 10,
          shipping: 0,
          tax: 0.8,
          total: 10.8,
        }),
      })

      const orderId = createResponse.body.id

      const response = await request(`${base}/api/orders/${encodeURIComponent(orderId)}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      assert.strictEqual(response.status, 200)
      assert.strictEqual(response.body.id, orderId)
    } finally {
      server.close()
      server.unref()
    }
  })

  it('GET /api/orders/:orderId returns 404 for another user', async () => {
    const { app } = await import('../../src/index.js')
    const { token: token1, base, server: server1 } = await getAuthToken(app, 'order6a@example.com', 'password123')

    try {
      const createResponse = await request(`${base}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token1}`,
        },
        body: JSON.stringify({
          items: [{ id: 1, quantity: 1, price: 10 }],
          customer: { name: 'User 1', email: 'u1@test.com', phone: '111' },
          shippingAddress: { address: '111 St', city: 'City', state: 'ST', zip: '11111' },
          subtotal: 10,
          shipping: 0,
          tax: 0.8,
          total: 10.8,
        }),
      })

      const orderId = createResponse.body.id

      const { token: token2, server: server2 } = await getAuthToken(app, 'order6b@example.com', 'password123')

      try {
        const response = await request(`${base}/api/orders/${encodeURIComponent(orderId)}`, {
          headers: { Authorization: `Bearer ${token2}` },
        })

        assert.strictEqual(response.status, 404)
      } finally {
        server2.close()
        server2.unref()
      }
    } finally {
      server1.close()
      server1.unref()
    }
  })

  it('requires authentication for all order endpoints', async () => {
    const { app } = await import('../../src/index.js')
    const server = app.listen(0)
    const port = server.address().port
    const base = `http://localhost:${port}`

    try {
      const response = await request(`${base}/api/orders`)
      assert.strictEqual(response.status, 401)
    } finally {
      server.close()
      server.unref()
    }
  })

  it('rejects invalid product IDs', async () => {
    const { app } = await import('../../src/index.js')
    const { token, base, server } = await getAuthToken(app, 'order7@example.com', 'password123')

    try {
      const response = await request(`${base}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          items: [{ id: 'invalid', quantity: 1, price: 10 }],
          customer: { name: 'Test', email: 'test@example.com', phone: '123' },
          shippingAddress: { address: '123 St', city: 'City', state: 'ST', zip: '12345' },
          subtotal: 10,
          shipping: 0,
          tax: 0.8,
          total: 10.8,
        }),
      })

      assert.strictEqual(response.status, 400)
    } finally {
      server.close()
      server.unref()
    }
  })

  it('rejects insufficient inventory', async () => {
    const { app } = await import('../../src/index.js')
    const { token, base, server } = await getAuthToken(app, 'order8@example.com', 'password123')

    try {
      const response = await request(`${base}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          items: [{ id: 1, quantity: 9999, price: 10 }],
          customer: { name: 'Test', email: 'test@example.com', phone: '123' },
          shippingAddress: { address: '123 St', city: 'City', state: 'ST', zip: '12345' },
          subtotal: 99990,
          shipping: 0,
          tax: 7999.2,
          total: 107989.2,
        }),
      })

      assert.strictEqual(response.status, 400)
      assert.ok(response.body.error.includes('stock') || response.body.error.includes('Insufficient'))
    } finally {
      server.close()
      server.unref()
    }
  })

  it('cancels eligible order and restores inventory', async () => {
    const { app } = await import('../../src/index.js')
    const { token, base, server } = await getAuthToken(app, 'order9@example.com', 'password123')

    try {
      const createResponse = await request(`${base}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          items: [{ id: 1, quantity: 2, price: 10 }],
          customer: { name: 'Test', email: 'test@example.com', phone: '123' },
          shippingAddress: { address: '123 St', city: 'City', state: 'ST', zip: '12345' },
          subtotal: 20,
          shipping: 0,
          tax: 1.6,
          total: 21.6,
        }),
      })

      const orderId = createResponse.body.id

      const inventoryAfterCreate = await request(`${base}/api/inventory/1`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const stockAfterCreate = inventoryAfterCreate.body.stock

      const cancelResponse = await request(`${base}/api/orders/${encodeURIComponent(orderId)}/cancel`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      })

      assert.strictEqual(cancelResponse.status, 200)
      assert.strictEqual(cancelResponse.body.status, 'cancelled')

      const inventoryAfterCancel = await request(`${base}/api/inventory/1`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      assert.strictEqual(inventoryAfterCancel.body.stock, stockAfterCreate + 2)
    } finally {
      server.close()
      server.unref()
    }
  })

  it('prevents cancelling non-cancellable orders', async () => {
    const { app } = await import('../../src/index.js')
    const { token, base, server } = await getAuthToken(app, 'order10@example.com', 'password123')

    try {
      const createResponse = await request(`${base}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          items: [{ id: 1, quantity: 1, price: 10 }],
          customer: { name: 'Test', email: 'test@example.com', phone: '123' },
          shippingAddress: { address: '123 St', city: 'City', state: 'ST', zip: '12345' },
          subtotal: 10,
          shipping: 0,
          tax: 0.8,
          total: 10.8,
        }),
      })

      const orderId = createResponse.body.id

      await prisma.order.update({
        where: { id: createResponse.body.orderId },
        data: { status: 'shipped' },
      })

      const response = await request(`${base}/api/orders/${encodeURIComponent(orderId)}/cancel`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      })

      assert.strictEqual(response.status, 400)
      assert.strictEqual(response.body.error, 'Order cannot be cancelled')
    } finally {
      server.close()
      server.unref()
    }
  })

  it('generates unique order numbers', async () => {
    const { app } = await import('../../src/index.js')
    const { token, base, server } = await getAuthToken(app, 'order11@example.com', 'password123')

    try {
      const response1 = await request(`${base}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          items: [{ id: 1, quantity: 1, price: 10 }],
          customer: { name: 'Test', email: 'test@example.com', phone: '123' },
          shippingAddress: { address: '123 St', city: 'City', state: 'ST', zip: '12345' },
          subtotal: 10,
          shipping: 0,
          tax: 0.8,
          total: 10.8,
        }),
      })

      const response2 = await request(`${base}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          items: [{ id: 2, quantity: 1, price: 20 }],
          customer: { name: 'Test', email: 'test@example.com', phone: '123' },
          shippingAddress: { address: '123 St', city: 'City', state: 'ST', zip: '12345' },
          subtotal: 20,
          shipping: 0,
          tax: 1.6,
          total: 21.6,
        }),
      })

      assert.notStrictEqual(response1.body.id, response2.body.id)
      assert.ok(response1.body.id.startsWith('ORD-'))
      assert.ok(response2.body.id.startsWith('ORD-'))
    } finally {
      server.close()
      server.unref()
    }
  })
})
