import { describe, it, before, after } from 'node:test'
import assert from 'node:assert'
import http from 'http'
import crypto from 'node:crypto'
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

function buildWebhookPayload(notification) {
  return {
    data: {
      client_id: 'sec_test_client',
      created_at: new Date().toISOString(),
      endpoint: 'http://localhost/webhook',
      notification: {
        ...notification,
        intent: 'CYBERSOURCE',
        user: 'test@example.com',
      },
      token: 'TEST_TOKEN_' + Date.now(),
      type: 'payment:created',
      updated_at: new Date().toISOString(),
    },
  }
}

function signWebhook(payload, secret) {
  const data = Buffer.from(JSON.stringify(payload.data))
  return crypto.createHmac('sha512', secret).update(data).digest('hex')
}

describe('Payments API', () => {
  before(async () => {
    process.env.SAFEPAY_PUBLIC_KEY = 'test_public_key'
    process.env.SAFEPAY_SECRET_KEY = 'test_secret_key'
    process.env.SAFEPAY_WEBHOOK_SECRET = 'test_webhook_secret'
    process.env.SAFEPAY_API_BASE_URL = 'https://sandbox.api.getsafepay.com'

    await seedDatabase()
    await prisma.payment.deleteMany()
    await prisma.review.deleteMany()
    await prisma.user.deleteMany()
    await prisma.order.deleteMany()
    await prisma.orderItem.deleteMany()
    await prisma.cartItem.deleteMany()
    await prisma.wishlist.deleteMany()
  })

  after(async () => {
    await prisma.payment.deleteMany()
    await prisma.review.deleteMany()
    await prisma.orderItem.deleteMany()
    await prisma.order.deleteMany()
    await prisma.user.deleteMany()
    await prisma.cartItem.deleteMany()
    await prisma.wishlist.deleteMany()
    await prisma.$disconnect()
  })

  it('POST /api/payments creates cash on delivery payment', async () => {
    const { app } = await import('../../src/index.js')
    const { token, base, server } = await getAuthToken(app, 'pay1@example.com', 'password123')

    try {
      const orderResponse = await request(`${base}/api/orders`, {
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

      assert.strictEqual(orderResponse.status, 201)
      const orderNumber = orderResponse.body.id

      const paymentResponse = await request(`${base}/api/payments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          orderNumber,
          paymentMethod: 'cash_on_delivery',
        }),
      })

      assert.strictEqual(paymentResponse.status, 201)
      assert.strictEqual(paymentResponse.body.paymentMethod, 'cash_on_delivery')
      assert.strictEqual(paymentResponse.body.status, 'pending')
      assert.strictEqual(paymentResponse.body.amount, 10.8)
      assert.strictEqual(paymentResponse.body.currency, 'USD')
      assert.strictEqual(paymentResponse.body.userId, orderResponse.body.userId)
    } finally {
      server.close()
      server.unref()
    }
  })

  it('POST /api/payments creates online payment without safepay configured', async () => {
    const { app } = await import('../../src/index.js')
    const { token, base, server } = await getAuthToken(app, 'pay2@example.com', 'password123')

    try {
      const orderResponse = await request(`${base}/api/orders`, {
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

      assert.strictEqual(orderResponse.status, 201)
      const orderNumber = orderResponse.body.id

      const paymentResponse = await request(`${base}/api/payments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          orderNumber,
          paymentMethod: 'online',
        }),
      })

      assert.strictEqual(paymentResponse.status, 201)
      assert.strictEqual(paymentResponse.body.paymentMethod, 'online')
      assert.strictEqual(paymentResponse.body.status, 'pending')
      assert.strictEqual(paymentResponse.body.amount, 10.8)
      assert.strictEqual(paymentResponse.body.provider, 'safepay')
      assert.strictEqual(paymentResponse.body.checkoutUrl, null)
    } finally {
      server.close()
      server.unref()
    }
  })

  it('GET /api/payments/:orderNumber returns payment for authenticated user', async () => {
    const { app } = await import('../../src/index.js')
    const { token, base, server } = await getAuthToken(app, 'pay3@example.com', 'password123')

    try {
      const orderResponse = await request(`${base}/api/orders`, {
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

      assert.strictEqual(orderResponse.status, 201)
      const orderNumber = orderResponse.body.id

      await request(`${base}/api/payments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          orderNumber,
          paymentMethod: 'cash_on_delivery',
        }),
      })

      const paymentResponse = await request(`${base}/api/payments/${encodeURIComponent(orderNumber)}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      assert.strictEqual(paymentResponse.status, 200)
      assert.strictEqual(paymentResponse.body.paymentMethod, 'cash_on_delivery')
      assert.strictEqual(paymentResponse.body.status, 'pending')
    } finally {
      server.close()
      server.unref()
    }
  })

  it('GET /api/payments/:orderNumber returns 404 for another user', async () => {
    const { app } = await import('../../src/index.js')
    const { token: token1, base, server: server1 } = await getAuthToken(app, 'pay4a@example.com', 'password123')

    try {
      const orderResponse = await request(`${base}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token1}`,
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

      assert.strictEqual(orderResponse.status, 201)
      const orderNumber = orderResponse.body.id

      await request(`${base}/api/payments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token1}`,
        },
        body: JSON.stringify({
          orderNumber,
          paymentMethod: 'cash_on_delivery',
        }),
      })

      const { token: token2, server: server2 } = await getAuthToken(app, 'pay4b@example.com', 'password123')

      try {
        const response = await request(`${base}/api/payments/${encodeURIComponent(orderNumber)}`, {
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

  it('POST /api/payments returns 404 for nonexistent order', async () => {
    const { app } = await import('../../src/index.js')
    const { token, base, server } = await getAuthToken(app, 'pay5@example.com', 'password123')

    try {
      const response = await request(`${base}/api/payments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          orderNumber: 'ORD-NONEXISTENT',
          paymentMethod: 'cash_on_delivery',
        }),
      })

      assert.strictEqual(response.status, 404)
    } finally {
      server.close()
      server.unref()
    }
  })

  it('POST /api/payments prevents duplicate payment records', async () => {
    const { app } = await import('../../src/index.js')
    const { token, base, server } = await getAuthToken(app, 'pay6@example.com', 'password123')

    try {
      const orderResponse = await request(`${base}/api/orders`, {
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

      assert.strictEqual(orderResponse.status, 201)
      const orderNumber = orderResponse.body.id

      const firstResponse = await request(`${base}/api/payments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          orderNumber,
          paymentMethod: 'cash_on_delivery',
        }),
      })

      assert.strictEqual(firstResponse.status, 201)

      const secondResponse = await request(`${base}/api/payments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          orderNumber,
          paymentMethod: 'online',
        }),
      })

      assert.strictEqual(secondResponse.status, 409)
    } finally {
      server.close()
      server.unref()
    }
  })

  it('POST /api/payments uses backend order total for amount', async () => {
    const { app } = await import('../../src/index.js')
    const { token, base, server } = await getAuthToken(app, 'pay7@example.com', 'password123')

    try {
      const orderResponse = await request(`${base}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          items: [{ id: 1, quantity: 2, price: 25 }],
          customer: { name: 'Test', email: 'test@example.com', phone: '123' },
          shippingAddress: { address: '123 St', city: 'City', state: 'ST', zip: '12345' },
          subtotal: 50,
          shipping: 5.99,
          tax: 4.48,
          total: 60.47,
        }),
      })

      assert.strictEqual(orderResponse.status, 201)
      const orderNumber = orderResponse.body.id

      const paymentResponse = await request(`${base}/api/payments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          orderNumber,
          paymentMethod: 'online',
        }),
      })

      assert.strictEqual(paymentResponse.status, 201)
      assert.strictEqual(paymentResponse.body.amount, 60.47)
    } finally {
      server.close()
      server.unref()
    }
  })

  it('POST /api/payments requires authentication', async () => {
    const { app } = await import('../../src/index.js')
    const server = app.listen(0)
    const port = server.address().port
    const base = `http://localhost:${port}`

    try {
      const response = await request(`${base}/api/payments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderNumber: 'ORD-TEST',
          paymentMethod: 'cash_on_delivery',
        }),
      })

      assert.strictEqual(response.status, 401)
    } finally {
      server.close()
      server.unref()
    }
  })

  it('GET /api/payments/:orderNumber returns 404 when no payment exists', async () => {
    const { app } = await import('../../src/index.js')
    const { token, base, server } = await getAuthToken(app, 'pay8@example.com', 'password123')

    try {
      const orderResponse = await request(`${base}/api/orders`, {
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

      assert.strictEqual(orderResponse.status, 201)
      const orderNumber = orderResponse.body.id

      const response = await request(`${base}/api/payments/${encodeURIComponent(orderNumber)}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      assert.strictEqual(response.status, 404)
    } finally {
      server.close()
      server.unref()
    }
  })

  it('POST /api/payments/webhook rejects invalid signature', async () => {
    const { app } = await import('../../src/index.js')
    const server = app.listen(0)
    const port = server.address().port
    const base = `http://localhost:${port}`

    try {
      const payload = buildWebhookPayload({
        tracker: 'track_invalid',
        state: 'PAID',
        amount: '1000',
        currency: 'USD',
      })

      const response = await request(`${base}/api/payments/webhook`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-SFPY-SIGNATURE': 'invalid_signature',
        },
        body: JSON.stringify(payload),
      })

      assert.strictEqual(response.status, 401)
    } finally {
      server.close()
      server.unref()
    }
  })

  it('POST /api/payments/webhook marks payment paid on valid verified webhook', async () => {
    const { app } = await import('../../src/index.js')
    const { token, base, server } = await getAuthToken(app, 'pay9@example.com', 'password123')

    try {
      const orderResponse = await request(`${base}/api/orders`, {
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

      assert.strictEqual(orderResponse.status, 201)
      const orderNumber = orderResponse.body.id

      const paymentResponse = await request(`${base}/api/payments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          orderNumber,
          paymentMethod: 'online',
        }),
      })

      assert.strictEqual(paymentResponse.status, 201)
      const tracker = paymentResponse.body.providerReference || 'track_test_' + Date.now()

      await prisma.payment.update({
        where: { id: paymentResponse.body.id },
        data: { providerReference: tracker },
      })

      const webhookPayload = buildWebhookPayload({
        tracker,
        state: 'PAID',
        amount: '10.80',
        currency: 'USD',
      })

      const secret = process.env.SAFEPAY_WEBHOOK_SECRET || 'test_webhook_secret'
      const signature = signWebhook(webhookPayload, secret)

      const webhookResponse = await request(`${base}/api/payments/webhook`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-SFPY-SIGNATURE': signature,
        },
        body: JSON.stringify(webhookPayload),
      })

      assert.strictEqual(webhookResponse.status, 200)

      const paymentStatusResponse = await request(`${base}/api/payments/${encodeURIComponent(orderNumber)}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      assert.strictEqual(paymentStatusResponse.status, 200)
      assert.strictEqual(paymentStatusResponse.body.status, 'paid')
    } finally {
      server.close()
      server.unref()
    }
  })

  it('POST /api/payments/webhook is idempotent for repeated paid events', async () => {
    const { app } = await import('../../src/index.js')
    const { token, base, server } = await getAuthToken(app, 'pay10@example.com', 'password123')

    try {
      const orderResponse = await request(`${base}/api/orders`, {
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

      assert.strictEqual(orderResponse.status, 201)
      const orderNumber = orderResponse.body.id

      const paymentResponse = await request(`${base}/api/payments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          orderNumber,
          paymentMethod: 'online',
        }),
      })

      assert.strictEqual(paymentResponse.status, 201)
      const tracker = paymentResponse.body.providerReference || 'track_test_idempotent_' + Date.now()

      await prisma.payment.update({
        where: { id: paymentResponse.body.id },
        data: { providerReference: tracker, status: 'paid' },
      })

      const webhookPayload = buildWebhookPayload({
        tracker,
        state: 'PAID',
        amount: '10.80',
        currency: 'USD',
      })

      const secret = process.env.SAFEPAY_WEBHOOK_SECRET || 'test_webhook_secret'
      const signature = signWebhook(webhookPayload, secret)

      const firstResponse = await request(`${base}/api/payments/webhook`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-SFPY-SIGNATURE': signature,
        },
        body: JSON.stringify(webhookPayload),
      })

      assert.strictEqual(firstResponse.status, 200)

      const secondResponse = await request(`${base}/api/payments/webhook`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-SFPY-SIGNATURE': signature,
        },
        body: JSON.stringify(webhookPayload),
      })

      assert.strictEqual(secondResponse.status, 200)
      assert.strictEqual(secondResponse.body.message, 'Payment already marked as paid')
    } finally {
      server.close()
      server.unref()
    }
  })

  it('POST /api/payments/webhook updates payment to failed on verified failed event', async () => {
    const { app } = await import('../../src/index.js')
    const { token, base, server } = await getAuthToken(app, 'pay11@example.com', 'password123')

    try {
      const orderResponse = await request(`${base}/api/orders`, {
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

      assert.strictEqual(orderResponse.status, 201)
      const orderNumber = orderResponse.body.id

      const paymentResponse = await request(`${base}/api/payments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          orderNumber,
          paymentMethod: 'online',
        }),
      })

      assert.strictEqual(paymentResponse.status, 201)
      const tracker = paymentResponse.body.providerReference || 'track_test_failed_' + Date.now()

      await prisma.payment.update({
        where: { id: paymentResponse.body.id },
        data: { providerReference: tracker },
      })

      const webhookPayload = buildWebhookPayload({
        tracker,
        state: 'FAILED',
        amount: '10.80',
        currency: 'USD',
      })

      const secret = process.env.SAFEPAY_WEBHOOK_SECRET || 'test_webhook_secret'
      const signature = signWebhook(webhookPayload, secret)

      const webhookResponse = await request(`${base}/api/payments/webhook`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-SFPY-SIGNATURE': signature,
        },
        body: JSON.stringify(webhookPayload),
      })

      assert.strictEqual(webhookResponse.status, 200)

      const paymentStatusResponse = await request(`${base}/api/payments/${encodeURIComponent(orderNumber)}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      assert.strictEqual(paymentStatusResponse.status, 200)
      assert.strictEqual(paymentStatusResponse.body.status, 'failed')
    } finally {
      server.close()
      server.unref()
    }
  })

  it('POST /api/payments/webhook updates payment to cancelled on verified cancelled event', async () => {
    const { app } = await import('../../src/index.js')
    const { token, base, server } = await getAuthToken(app, 'pay12@example.com', 'password123')

    try {
      const orderResponse = await request(`${base}/api/orders`, {
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

      assert.strictEqual(orderResponse.status, 201)
      const orderNumber = orderResponse.body.id

      const paymentResponse = await request(`${base}/api/payments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          orderNumber,
          paymentMethod: 'online',
        }),
      })

      assert.strictEqual(paymentResponse.status, 201)
      const tracker = paymentResponse.body.providerReference || 'track_test_cancelled_' + Date.now()

      await prisma.payment.update({
        where: { id: paymentResponse.body.id },
        data: { providerReference: tracker },
      })

      const webhookPayload = buildWebhookPayload({
        tracker,
        state: 'CANCELLED',
        amount: '10.80',
        currency: 'USD',
      })

      const secret = process.env.SAFEPAY_WEBHOOK_SECRET || 'test_webhook_secret'
      const signature = signWebhook(webhookPayload, secret)

      const webhookResponse = await request(`${base}/api/payments/webhook`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-SFPY-SIGNATURE': signature,
        },
        body: JSON.stringify(webhookPayload),
      })

      assert.strictEqual(webhookResponse.status, 200)

      const paymentStatusResponse = await request(`${base}/api/payments/${encodeURIComponent(orderNumber)}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      assert.strictEqual(paymentStatusResponse.status, 200)
      assert.strictEqual(paymentStatusResponse.body.status, 'cancelled')
    } finally {
      server.close()
      server.unref()
    }
  })
})
