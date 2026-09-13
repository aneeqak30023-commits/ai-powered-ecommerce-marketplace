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

describe('Reviews API', () => {
  before(async () => {
    await seedDatabase()
    await prisma.review.deleteMany()
    await prisma.user.deleteMany()
  })

  after(async () => {
    await prisma.review.deleteMany()
    await prisma.user.deleteMany()
    await prisma.$disconnect()
  })

  it('GET /api/reviews/products/:productId/reviews returns reviews for a product', async () => {
    const { app } = await import('../../src/index.js')
    const server = app.listen(0)
    const port = server.address().port
    const base = `http://localhost:${port}`

    try {
      const response = await request(`${base}/api/reviews/products/1/reviews`)

      assert.strictEqual(response.status, 200)
      assert.ok(Array.isArray(response.body.reviews))
      assert.ok(response.body.reviewCount >= 0)
      assert.ok(typeof response.body.averageRating === 'number')
      assert.ok(typeof response.body.breakdown === 'object')
    } finally {
      server.close()
      server.unref()
    }
  })

  it('GET /api/reviews/products/:productId/reviews returns 404 for nonexistent product', async () => {
    const { app } = await import('../../src/index.js')
    const server = app.listen(0)
    const port = server.address().port
    const base = `http://localhost:${port}`

    try {
      const response = await request(`${base}/api/reviews/products/99999/reviews`)

      assert.strictEqual(response.status, 404)
    } finally {
      server.close()
      server.unref()
    }
  })

  it('requires authentication for POST /api/reviews/products/:productId/reviews', async () => {
    const { app } = await import('../../src/index.js')
    const server = app.listen(0)
    const port = server.address().port
    const base = `http://localhost:${port}`

    try {
      const response = await request(`${base}/api/reviews/products/1/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating: 5, text: 'Great product' }),
      })

      assert.strictEqual(response.status, 401)
    } finally {
      server.close()
      server.unref()
    }
  })

  it('POST /api/reviews/products/:productId/reviews creates a review', async () => {
    const { app } = await import('../../src/index.js')
    const { token, base, server } = await getAuthToken(app, 'review1@example.com', 'password123')

    try {
      const response = await request(`${base}/api/reviews/products/1/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ rating: 5, text: 'Amazing product!' }),
      })

      assert.strictEqual(response.status, 201)
      assert.ok(response.body.id)
      assert.strictEqual(response.body.rating, 5)
      assert.strictEqual(response.body.text, 'Amazing product!')
      assert.strictEqual(response.body.productId, 1)
    } finally {
      server.close()
      server.unref()
    }
  })

  it('POST /api/reviews/products/:productId/reviews prevents duplicate reviews', async () => {
    const { app } = await import('../../src/index.js')
    const { token, base, server } = await getAuthToken(app, 'review2@example.com', 'password123')

    try {
      await request(`${base}/api/reviews/products/1/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ rating: 5, text: 'First review' }),
      })

      const response = await request(`${base}/api/reviews/products/1/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ rating: 4, text: 'Second review' }),
      })

      assert.strictEqual(response.status, 409)
      assert.ok(response.body.error.includes('already reviewed'))
    } finally {
      server.close()
      server.unref()
    }
  })

  it('POST /api/reviews/products/:productId/reviews validates rating range', async () => {
    const { app } = await import('../../src/index.js')
    const { token, base, server } = await getAuthToken(app, 'review3@example.com', 'password123')

    try {
      const response = await request(`${base}/api/reviews/products/1/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ rating: 10, text: 'Invalid rating' }),
      })

      assert.strictEqual(response.status, 400)
      assert.ok(response.body.error.includes('between 1 and 5'))
    } finally {
      server.close()
      server.unref()
    }
  })

  it('POST /api/reviews/products/:productId/reviews validates minimum text length', async () => {
    const { app } = await import('../../src/index.js')
    const { token, base, server } = await getAuthToken(app, 'review4@example.com', 'password123')

    try {
      const response = await request(`${base}/api/reviews/products/1/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ rating: 5, text: 'ab' }),
      })

      assert.strictEqual(response.status, 400)
      assert.ok(response.body.error.includes('at least 3 characters'))
    } finally {
      server.close()
      server.unref()
    }
  })

  it('POST /api/reviews/products/:productId/reviews returns 404 for nonexistent product', async () => {
    const { app } = await import('../../src/index.js')
    const { token, base, server } = await getAuthToken(app, 'review5@example.com', 'password123')

    try {
      const response = await request(`${base}/api/reviews/products/99999/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ rating: 5, text: 'Great product' }),
      })

      assert.strictEqual(response.status, 404)
    } finally {
      server.close()
      server.unref()
    }
  })

  it('PATCH /api/reviews/:reviewId updates own review', async () => {
    const { app } = await import('../../src/index.js')
    const { token, base, server } = await getAuthToken(app, 'review6@example.com', 'password123')

    try {
      const createResponse = await request(`${base}/api/reviews/products/1/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ rating: 3, text: 'Original review' }),
      })

      const reviewId = createResponse.body.id

      const response = await request(`${base}/api/reviews/${encodeURIComponent(reviewId)}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ rating: 5, text: 'Updated review' }),
      })

      assert.strictEqual(response.status, 200)
      assert.strictEqual(response.body.rating, 5)
      assert.strictEqual(response.body.text, 'Updated review')
    } finally {
      server.close()
      server.unref()
    }
  })

  it('PATCH /api/reviews/:reviewId prevents editing another users review', async () => {
    const { app } = await import('../../src/index.js')
    const { token: token1, base, server: server1 } = await getAuthToken(app, 'review7a@example.com', 'password123')

    try {
      const createResponse = await request(`${base}/api/reviews/products/1/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token1}`,
        },
        body: JSON.stringify({ rating: 5, text: 'User 1 review' }),
      })

      const reviewId = createResponse.body.id

      const { token: token2, server: server2 } = await getAuthToken(app, 'review7b@example.com', 'password123')

      try {
        const response = await request(`${base}/api/reviews/${encodeURIComponent(reviewId)}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token2}`,
          },
          body: JSON.stringify({ rating: 4, text: 'Hacked' }),
        })

        assert.strictEqual(response.status, 403)
      } finally {
        server2.close()
        server2.unref()
      }
    } finally {
      server1.close()
      server1.unref()
    }
  })

  it('DELETE /api/reviews/:reviewId deletes own review', async () => {
    const { app } = await import('../../src/index.js')
    const { token, base, server } = await getAuthToken(app, 'review8@example.com', 'password123')

    try {
      const createResponse = await request(`${base}/api/reviews/products/1/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ rating: 4, text: 'To be deleted' }),
      })

      const reviewId = createResponse.body.id

      const response = await request(`${base}/api/reviews/${encodeURIComponent(reviewId)}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })

      assert.strictEqual(response.status, 204)
    } finally {
      server.close()
      server.unref()
    }
  })

  it('DELETE /api/reviews/:reviewId prevents deleting another users review', async () => {
    const { app } = await import('../../src/index.js')
    const { token: token1, base, server: server1 } = await getAuthToken(app, 'review9a@example.com', 'password123')

    try {
      const createResponse = await request(`${base}/api/reviews/products/1/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token1}`,
        },
        body: JSON.stringify({ rating: 5, text: 'User 1 review' }),
      })

      const reviewId = createResponse.body.id

      const { token: token2, server: server2 } = await getAuthToken(app, 'review9b@example.com', 'password123')

      try {
        const response = await request(`${base}/api/reviews/${encodeURIComponent(reviewId)}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token2}` },
        })

        assert.strictEqual(response.status, 403)
      } finally {
        server2.close()
        server2.unref()
      }
    } finally {
      server1.close()
      server1.unref()
    }
  })

  it('requires authentication for PATCH /api/reviews/:reviewId', async () => {
    const { app } = await import('../../src/index.js')
    const server = app.listen(0)
    const port = server.address().port
    const base = `http://localhost:${port}`

    try {
      const response = await request(`${base}/api/reviews/some-review-id`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating: 5 }),
      })

      assert.strictEqual(response.status, 401)
    } finally {
      server.close()
      server.unref()
    }
  })

  it('requires authentication for DELETE /api/reviews/:reviewId', async () => {
    const { app } = await import('../../src/index.js')
    const server = app.listen(0)
    const port = server.address().port
    const base = `http://localhost:${port}`

    try {
      const response = await request(`${base}/api/reviews/some-review-id`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      })

      assert.strictEqual(response.status, 401)
    } finally {
      server.close()
      server.unref()
    }
  })

  it('recalculates average rating after creating a review', async () => {
    const { app } = await import('../../src/index.js')
    const { token, base, server } = await getAuthToken(app, 'review10@example.com', 'password123')

    try {
      const beforeResponse = await request(`${base}/api/reviews/products/2/reviews`)
      const beforeAvg = beforeResponse.body.averageRating
      const beforeCount = beforeResponse.body.reviewCount

      await request(`${base}/api/reviews/products/2/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ rating: 5, text: 'New review' }),
      })

      const afterResponse = await request(`${base}/api/reviews/products/2/reviews`)
      const afterAvg = afterResponse.body.averageRating
      const afterCount = afterResponse.body.reviewCount

      assert.ok(afterCount > 0)
      if (beforeCount > 0) {
        assert.notStrictEqual(afterAvg, beforeAvg)
      }
    } finally {
      server.close()
      server.unref()
    }
  })

  it('recalculates rating breakdown after deleting a review', async () => {
    const { app } = await import('../../src/index.js')
    const { token, base, server } = await getAuthToken(app, 'review11@example.com', 'password123')

    try {
      const createResponse = await request(`${base}/api/reviews/products/3/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ rating: 5, text: 'To delete' }),
      })

      const reviewId = createResponse.body.id

      const beforeResponse = await request(`${base}/api/reviews/products/3/reviews`)
      const beforeBreakdown = beforeResponse.body.breakdown

      await request(`${base}/api/reviews/${encodeURIComponent(reviewId)}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })

      const afterResponse = await request(`${base}/api/reviews/products/3/reviews`)
      const afterBreakdown = afterResponse.body.breakdown

      assert.strictEqual(afterBreakdown[5], beforeBreakdown[5] - 1)
    } finally {
      server.close()
      server.unref()
    }
  })
})
