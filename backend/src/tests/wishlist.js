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

describe('Wishlist API', () => {
  before(async () => {
    await seedDatabase()
    await prisma.review.deleteMany()
    await prisma.user.deleteMany()
    await prisma.wishlist.deleteMany()
    await prisma.cartItem.deleteMany()
  })

  after(async () => {
    await prisma.wishlist.deleteMany()
    await prisma.cartItem.deleteMany()
    await prisma.review.deleteMany()
    await prisma.user.deleteMany()
    await prisma.$disconnect()
  })

  it('GET /api/wishlist returns empty wishlist for new user', async () => {
    const { app } = await import('../../src/index.js')
    const { token, base, server } = await getAuthToken(app, 'wish1@example.com', 'password123')

    try {
      const response = await request(`${base}/api/wishlist`, {
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

  it('POST /api/wishlist/:productId adds item', async () => {
    const { app } = await import('../../src/index.js')
    const { token, base, server } = await getAuthToken(app, 'wish2@example.com', 'password123')

    try {
      const response = await request(`${base}/api/wishlist/1`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      })

      assert.strictEqual(response.status, 201)
      assert.strictEqual(response.body.productId, 1)
    } finally {
      server.close()
      server.unref()
    }
  })

  it('POST /api/wishlist/:productId rejects duplicate', async () => {
    const { app } = await import('../../src/index.js')
    const { token, base, server } = await getAuthToken(app, 'wish3@example.com', 'password123')

    try {
      await request(`${base}/api/wishlist/1`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      })

      const response = await request(`${base}/api/wishlist/1`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      })

      assert.strictEqual(response.status, 409)
      assert.strictEqual(response.body.error, 'Item already in wishlist')
    } finally {
      server.close()
      server.unref()
    }
  })

  it('DELETE /api/wishlist/:productId removes item', async () => {
    const { app } = await import('../../src/index.js')
    const { token, base, server } = await getAuthToken(app, 'wish4@example.com', 'password123')

    try {
      await request(`${base}/api/wishlist/1`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      })

      const response = await request(`${base}/api/wishlist/1`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })

      assert.strictEqual(response.status, 204)

      const getResponse = await request(`${base}/api/wishlist`, {
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
      const response = await request(`${base}/api/wishlist`)
      assert.strictEqual(response.status, 401)
    } finally {
      server.close()
      server.unref()
    }
  })

  it('returns 404 for missing product', async () => {
    const { app } = await import('../../src/index.js')
    const { token, base, server } = await getAuthToken(app, 'wish5@example.com', 'password123')

    try {
      const response = await request(`${base}/api/wishlist/999999`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      })

      assert.strictEqual(response.status, 404)
      assert.strictEqual(response.body.error, 'Product not found')
    } finally {
      server.close()
      server.unref()
    }
  })

  it('returns 404 for removing non-existent wishlist item', async () => {
    const { app } = await import('../../src/index.js')
    const { token, base, server } = await getAuthToken(app, 'wish6@example.com', 'password123')

    try {
      const response = await request(`${base}/api/wishlist/999999`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })

      assert.strictEqual(response.status, 404)
      assert.strictEqual(response.body.error, 'Item not in wishlist')
    } finally {
      server.close()
      server.unref()
    }
  })

  it('isolates wishlist between users', async () => {
    const { app } = await import('../../src/index.js')
    const { token: token1, base, server: server1 } = await getAuthToken(app, 'wish7a@example.com', 'password123')

    try {
      await request(`${base}/api/wishlist/1`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token1}` },
      })

      const { token: token2, server: server2 } = await getAuthToken(app, 'wish7b@example.com', 'password123')

      try {
        const response = await request(`${base}/api/wishlist`, {
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
