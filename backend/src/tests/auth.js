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

describe('Auth API', () => {
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

  it('POST /api/auth/register creates a new user', async () => {
    const { app } = await import('../../src/index.js')
    const server = app.listen(0)
    const port = server.address().port
    const base = `http://localhost:${port}`

    try {
      const response = await request(`${base}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'password123',
          name: 'Test User',
        }),
      })

      assert.strictEqual(response.status, 201)
      assert.strictEqual(response.body.success, true)
      assert.strictEqual(response.body.user.email, 'test@example.com')
      assert.ok(response.body.session.token)
      assert.ok(response.body.session.userId)
    } finally {
      server.close()
    }
  })

  it('POST /api/auth/register rejects duplicate email', async () => {
    const { app } = await import('../../src/index.js')
    const server = app.listen(0)
    const port = server.address().port
    const base = `http://localhost:${port}`

    try {
      await request(`${base}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'duplicate@example.com',
          password: 'password123',
          name: 'First User',
        }),
      })

      const response = await request(`${base}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'duplicate@example.com',
          password: 'password456',
          name: 'Second User',
        }),
      })

      assert.strictEqual(response.status, 409)
      assert.strictEqual(response.body.error, 'An account with this email already exists')
    } finally {
      server.close()
    }
  })

  it('POST /api/auth/register validates email format', async () => {
    const { app } = await import('../../src/index.js')
    const server = app.listen(0)
    const port = server.address().port
    const base = `http://localhost:${port}`

    try {
      const response = await request(`${base}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'invalid-email',
          password: 'password123',
          name: 'Test User',
        }),
      })

      assert.strictEqual(response.status, 400)
      assert.strictEqual(response.body.error, 'Invalid email format')
    } finally {
      server.close()
    }
  })

  it('POST /api/auth/register enforces minimum password length', async () => {
    const { app } = await import('../../src/index.js')
    const server = app.listen(0)
    const port = server.address().port
    const base = `http://localhost:${port}`

    try {
      const response = await request(`${base}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'short',
          name: 'Test User',
        }),
      })

      assert.strictEqual(response.status, 400)
      assert.strictEqual(response.body.error, 'Password must be at least 8 characters')
    } finally {
      server.close()
    }
  })

  it('POST /api/auth/register requires all fields', async () => {
    const { app } = await import('../../src/index.js')
    const server = app.listen(0)
    const port = server.address().port
    const base = `http://localhost:${port}`

    try {
      const response = await request(`${base}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })

      assert.strictEqual(response.status, 400)
      assert.strictEqual(response.body.error, 'All fields are required')
    } finally {
      server.close()
    }
  })

  it('POST /api/auth/login succeeds with valid credentials', async () => {
    const { app } = await import('../../src/index.js')
    const server = app.listen(0)
    const port = server.address().port
    const base = `http://localhost:${port}`

    try {
      await request(`${base}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'login@example.com',
          password: 'password123',
          name: 'Login User',
        }),
      })

      const response = await request(`${base}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'login@example.com',
          password: 'password123',
        }),
      })

      assert.strictEqual(response.status, 200)
      assert.strictEqual(response.body.success, true)
      assert.strictEqual(response.body.user.email, 'login@example.com')
      assert.ok(response.body.session.token)
    } finally {
      server.close()
    }
  })

  it('POST /api/auth/login rejects invalid credentials', async () => {
    const { app } = await import('../../src/index.js')
    const server = app.listen(0)
    const port = server.address().port
    const base = `http://localhost:${port}`

    try {
      const response = await request(`${base}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'nonexistent@example.com',
          password: 'password123',
        }),
      })

      assert.strictEqual(response.status, 401)
      assert.strictEqual(response.body.error, 'Invalid email or password')
    } finally {
      server.close()
    }
  })

  it('POST /api/auth/login rejects wrong password', async () => {
    const { app } = await import('../../src/index.js')
    const server = app.listen(0)
    const port = server.address().port
    const base = `http://localhost:${port}`

    try {
      await request(`${base}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'auth@example.com',
          password: 'password123',
          name: 'Auth User',
        }),
      })

      const response = await request(`${base}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'auth@example.com',
          password: 'wrongpassword',
        }),
      })

      assert.strictEqual(response.status, 401)
      assert.strictEqual(response.body.error, 'Invalid email or password')
    } finally {
      server.close()
    }
  })

  it('POST /api/auth/login requires email and password', async () => {
    const { app } = await import('../../src/index.js')
    const server = app.listen(0)
    const port = server.address().port
    const base = `http://localhost:${port}`

    try {
      const response = await request(`${base}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })

      assert.strictEqual(response.status, 400)
      assert.strictEqual(response.body.error, 'Email and password are required')
    } finally {
      server.close()
    }
  })

  it('GET /api/auth/session validates a valid token', async () => {
    const { app } = await import('../../src/index.js')
    const server = app.listen(0)
    const port = server.address().port
    const base = `http://localhost:${port}`

    try {
      const registerResponse = await request(`${base}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'session@example.com',
          password: 'password123',
          name: 'Session User',
        }),
      })

      const token = registerResponse.body.session.token

      const response = await request(`${base}/api/auth/session`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      assert.strictEqual(response.status, 200)
      assert.strictEqual(response.body.success, true)
      assert.strictEqual(response.body.user.id, registerResponse.body.user.id)
    } finally {
      server.close()
    }
  })

  it('GET /api/auth/session returns 401 for missing token', async () => {
    const { app } = await import('../../src/index.js')
    const server = app.listen(0)
    const port = server.address().port
    const base = `http://localhost:${port}`

    try {
      const response = await request(`${base}/api/auth/session`)
      assert.strictEqual(response.status, 401)
      assert.strictEqual(response.body.error, 'No session provided')
    } finally {
      server.close()
    }
  })

  it('GET /api/auth/session returns 401 for invalid token', async () => {
    const { app } = await import('../../src/index.js')
    const server = app.listen(0)
    const port = server.address().port
    const base = `http://localhost:${port}`

    try {
      const response = await request(`${base}/api/auth/session`, {
        headers: {
          Authorization: 'Bearer invalid-token',
        },
      })

      assert.strictEqual(response.status, 401)
      assert.strictEqual(response.body.error, 'Invalid or expired session')
    } finally {
      server.close()
    }
  })

  it('POST /api/auth/logout succeeds', async () => {
    const { app } = await import('../../src/index.js')
    const server = app.listen(0)
    const port = server.address().port
    const base = `http://localhost:${port}`

    try {
      const response = await request(`${base}/api/auth/logout`, {
        method: 'POST',
      })

      assert.strictEqual(response.status, 200)
      assert.strictEqual(response.body.success, true)
    } finally {
      server.close()
    }
  })

  it('never exposes passwordHash or salt in responses', async () => {
    const { app } = await import('../../src/index.js')
    const server = app.listen(0)
    const port = server.address().port
    const base = `http://localhost:${port}`

    try {
      const registerResponse = await request(`${base}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'secure@example.com',
          password: 'password123',
          name: 'Secure User',
        }),
      })

      const user = registerResponse.body.user
      assert.ok(!user.hasOwnProperty('passwordHash'))
      assert.ok(!user.hasOwnProperty('salt'))

      const loginResponse = await request(`${base}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'secure@example.com',
          password: 'password123',
        }),
      })

      const loginUser = loginResponse.body.user
      assert.ok(!loginUser.hasOwnProperty('passwordHash'))
      assert.ok(!loginUser.hasOwnProperty('salt'))
    } finally {
      server.close()
    }
  })
})
