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

describe('Cart API', () => {
  before(async () => {
    await seedDatabase()
    await prisma.review.deleteMany()
    await prisma.user.deleteMany()
    await prisma.cartItem.deleteMany()
    await prisma.wishlist.deleteMany()
  })

  after(async () => {
    await prisma.cartItem.deleteMany()
    await prisma.wishlist.deleteMany()
    await prisma.review.deleteMany()
    await prisma.user.deleteMany()
    await prisma.$disconnect()
  })

  it('GET /api/cart returns empty cart for new user', async () => {
    const { app } = await import('../../src/index.js')
    const { token, base, server } = await getAuthToken(app, 'cart1@example.com', 'password123')

    try {
      const response = await request(`${base}/api/cart`, {
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

  it('POST /api/cart adds item', async () => {
    const { app } = await import('../../src/index.js')
    const { token, base, server } = await getAuthToken(app, 'cart2@example.com', 'password123')

    try {
      const response = await request(`${base}/api/cart`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productId: 1, quantity: 2 }),
      })

      assert.strictEqual(response.status, 201)
      assert.strictEqual(response.body.productId, 1)
      assert.strictEqual(response.body.quantity, 2)
    } finally {
      server.close()
      server.unref()
    }
  })

  it('POST /api/cart increases quantity for existing item', async () => {
    const { app } = await import('../../src/index.js')
    const { token, base, server } = await getAuthToken(app, 'cart3@example.com', 'password123')

    try {
      await request(`${base}/api/cart`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productId: 1, quantity: 2 }),
      })

      const response = await request(`${base}/api/cart`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productId: 1, quantity: 3 }),
      })

      assert.strictEqual(response.status, 200)
      assert.strictEqual(response.body.quantity, 5)
    } finally {
      server.close()
      server.unref()
    }
  })

  it('PATCH /api/cart/:productId updates quantity', async () => {
    const { app } = await import('../../src/index.js')
    const { token, base, server } = await getAuthToken(app, 'cart4@example.com', 'password123')

    try {
      await request(`${base}/api/cart`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productId: 1, quantity: 1 }),
      })

      const response = await request(`${base}/api/cart/1`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ quantity: 5 }),
      })

      assert.strictEqual(response.status, 200)
      assert.strictEqual(response.body.quantity, 5)
    } finally {
      server.close()
      server.unref()
    }
  })

  it('DELETE /api/cart/:productId removes item', async () => {
    const { app } = await import('../../src/index.js')
    const { token, base, server } = await getAuthToken(app, 'cart5@example.com', 'password123')

    try {
      await request(`${base}/api/cart`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productId: 1, quantity: 1 }),
      })

      const response = await request(`${base}/api/cart/1`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })

      assert.strictEqual(response.status, 204)

      const getResponse = await request(`${base}/api/cart`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      assert.strictEqual(getResponse.body.length, 0)
    } finally {
      server.close()
      server.unref()
    }
  })

  it('DELETE /api/cart clears all items', async () => {
    const { app } = await import('../../src/index.js')
    const { token, base, server } = await getAuthToken(app, 'cart6@example.com', 'password123')

    try {
      await request(`${base}/api/cart`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productId: 1, quantity: 1 }),
      })

      await request(`${base}/api/cart`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productId: 2, quantity: 1 }),
      })

      const response = await request(`${base}/api/cart`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })

      assert.strictEqual(response.status, 204)

      const getResponse = await request(`${base}/api/cart`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      assert.strictEqual(getResponse.body.length, 0)
    } finally {
      server.close()
      server.unref()
    }
  })

  it('requires authentication', async () => {
    const { app } = await import('../../src/index.js')
    const server = app.listen(0)
    const port = server.address().port
    const base = `http://localhost:${port}`

    try {
      const response = await request(`${base}/api/cart`)
      assert.strictEqual(response.status, 401)
    } finally {
      server.close()
      server.unref()
    }
  })

  it('rejects invalid product ID', async () => {
    const { app } = await import('../../src/index.js')
    const { token, base, server } = await getAuthToken(app, 'cart7@example.com', 'password123')

    try {
      const response = await request(`${base}/api/cart`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productId: 'invalid' }),
      })

      assert.strictEqual(response.status, 400)
    } finally {
      server.close()
      server.unref()
    }
  })

  it('rejects quantity exceeding stock', async () => {
    const { app } = await import('../../src/index.js')
    const { token, base, server } = await getAuthToken(app, 'cart8@example.com', 'password123')

    try {
      const response = await request(`${base}/api/cart`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productId: 1, quantity: 20 }),
      })

      assert.strictEqual(response.status, 400)
      assert.ok(response.body.error.includes('stock') || response.body.error.includes('available'))
    } finally {
      server.close()
      server.unref()
    }
  })

  it('isolates cart between users', async () => {
    const { app } = await import('../../src/index.js')
    const { token: token1, base, server: server1 } = await getAuthToken(app, 'cart9a@example.com', 'password123')

    try {
      await request(`${base}/api/cart`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token1}`,
        },
        body: JSON.stringify({ productId: 1, quantity: 2 }),
      })

      const { token: token2, server: server2 } = await getAuthToken(app, 'cart9b@example.com', 'password123')

      try {
        const response = await request(`${base}/api/cart`, {
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
})
