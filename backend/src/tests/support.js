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

describe('Knowledge Base API', () => {
  before(async () => {
    await seedDatabase()
  })

  after(async () => {
    await prisma.$disconnect()
  })

  it('GET /api/knowledge-base returns items', async () => {
    const { app } = await import('../../src/index.js')
    const server = app.listen(0)
    const port = server.address().port
    const base = `http://localhost:${port}`

    try {
      const response = await request(`${base}/api/knowledge-base`)

      assert.strictEqual(response.status, 200)
      assert.ok(Array.isArray(response.body))
      assert.ok(response.body.length > 0)
    } finally {
      server.close()
      server.unref()
    }
  })

  it('GET /api/knowledge-base filters by category', async () => {
    const { app } = await import('../../src/index.js')
    const server = app.listen(0)
    const port = server.address().port
    const base = `http://localhost:${port}`

    try {
      const response = await request(`${base}/api/knowledge-base?category=shipping`)

      assert.strictEqual(response.status, 200)
      assert.ok(Array.isArray(response.body))
      response.body.forEach(item => {
        assert.strictEqual(item.category, 'shipping')
      })
    } finally {
      server.close()
      server.unref()
    }
  })

  it('GET /api/knowledge-base searches items', async () => {
    const { app } = await import('../../src/index.js')
    const server = app.listen(0)
    const port = server.address().port
    const base = `http://localhost:${port}`

    try {
      const response = await request(`${base}/api/knowledge-base?search=shipping`)

      assert.strictEqual(response.status, 200)
      assert.ok(Array.isArray(response.body))
      assert.ok(response.body.length > 0)
    } finally {
      server.close()
      server.unref()
    }
  })

  it('GET /api/knowledge-base/categories returns unique categories', async () => {
    const { app } = await import('../../src/index.js')
    const server = app.listen(0)
    const port = server.address().port
    const base = `http://localhost:${port}`

    try {
      const response = await request(`${base}/api/knowledge-base/categories`)

      assert.strictEqual(response.status, 200)
      assert.ok(Array.isArray(response.body))
      assert.ok(response.body.length > 0)
    } finally {
      server.close()
      server.unref()
    }
  })

  it('GET /api/knowledge-base/:id returns item', async () => {
    const { app } = await import('../../src/index.js')
    const server = app.listen(0)
    const port = server.address().port
    const base = `http://localhost:${port}`

    try {
      const listResponse = await request(`${base}/api/knowledge-base`)
      const firstItem = listResponse.body[0]

      const response = await request(`${base}/api/knowledge-base/${encodeURIComponent(firstItem.id)}`)

      assert.strictEqual(response.status, 200)
      assert.strictEqual(response.body.id, firstItem.id)
      assert.strictEqual(response.body.question, firstItem.question)
    } finally {
      server.close()
      server.unref()
    }
  })

  it('GET /api/knowledge-base/:id returns 404 for missing item', async () => {
    const { app } = await import('../../src/index.js')
    const server = app.listen(0)
    const port = server.address().port
    const base = `http://localhost:${port}`

    try {
      const response = await request(`${base}/api/knowledge-base/non-existent-id`)

      assert.strictEqual(response.status, 404)
    } finally {
      server.close()
      server.unref()
    }
  })
})

describe('Support Tickets API', () => {
  before(async () => {
    await seedDatabase()
    await prisma.supportTicketMessage.deleteMany()
    await prisma.supportTicket.deleteMany()
    await prisma.review.deleteMany()
    await prisma.user.deleteMany()
  })

  after(async () => {
    await prisma.supportTicketMessage.deleteMany()
    await prisma.supportTicket.deleteMany()
    await prisma.review.deleteMany()
    await prisma.user.deleteMany()
    await prisma.$disconnect()
  })

  it('requires authentication for all support endpoints', async () => {
    const { app } = await import('../../src/index.js')
    const server = app.listen(0)
    const port = server.address().port
    const base = `http://localhost:${port}`

    try {
      const response = await request(`${base}/api/support/tickets`)
      assert.strictEqual(response.status, 401)
    } finally {
      server.close()
      server.unref()
    }
  })

  it('POST /api/support/tickets creates a ticket for authenticated user', async () => {
    const { app } = await import('../../src/index.js')
    const { token, base, server } = await getAuthToken(app, 'support1@example.com', 'password123')

    try {
      const response = await request(`${base}/api/support/tickets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          subject: 'Test ticket',
          message: 'This is a test support ticket with enough characters.',
          category: 'other',
        }),
      })

      assert.strictEqual(response.status, 201)
      assert.ok(response.body.id)
      assert.strictEqual(response.body.subject, 'Test ticket')
      assert.strictEqual(response.body.status, 'open')
      assert.ok(response.body.userId)
    } finally {
      server.close()
      server.unref()
    }
  })

  it('POST /api/support/tickets validates required fields', async () => {
    const { app } = await import('../../src/index.js')
    const { token, base, server } = await getAuthToken(app, 'support2@example.com', 'password123')

    try {
      const response = await request(`${base}/api/support/tickets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          subject: 'Test',
        }),
      })

      assert.strictEqual(response.status, 400)
    } finally {
      server.close()
      server.unref()
    }
  })

  it('GET /api/support/tickets returns only authenticated users tickets', async () => {
    const { app } = await import('../../src/index.js')
    const { token: token1, base, server: server1 } = await getAuthToken(app, 'support3a@example.com', 'password123')

    try {
      await request(`${base}/api/support/tickets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token1}`,
        },
        body: JSON.stringify({
          subject: 'User 1 ticket',
          message: 'This is a test support ticket with enough characters.',
          category: 'other',
        }),
      })

      const { token: token2, server: server2 } = await getAuthToken(app, 'support3b@example.com', 'password123')

      try {
        const response = await request(`${base}/api/support/tickets`, {
          headers: { Authorization: `Bearer ${token2}` },
        })

        assert.strictEqual(response.status, 200)
        assert.strictEqual(response.body.tickets.length, 0)
      } finally {
        server2.close()
        server2.unref()
      }
    } finally {
      server1.close()
      server1.unref()
    }
  })

  it('POST /api/support/tickets/:ticketId/messages adds a message', async () => {
    const { app } = await import('../../src/index.js')
    const { token, base, server } = await getAuthToken(app, 'support4@example.com', 'password123')

    try {
      const createResponse = await request(`${base}/api/support/tickets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          subject: 'Ticket with message',
          message: 'This is a test support ticket with enough characters.',
          category: 'other',
        }),
      })

      const ticketId = createResponse.body.id

      const response = await request(`${base}/api/support/tickets/${encodeURIComponent(ticketId)}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message: 'Follow-up message' }),
      })

      assert.strictEqual(response.status, 201)
      assert.strictEqual(response.body.message, 'Follow-up message')
    } finally {
      server.close()
      server.unref()
    }
  })
})

