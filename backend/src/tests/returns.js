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

async function getAdminAuth(app, email, password) {
  const server = app.listen(0)
  const port = server.address().port
  const base = `http://localhost:${port}`

  try {
    const loginResponse = await request(`${base}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    return { token: loginResponse.body.session.token, base, server }
  } catch (error) {
    server.close()
    server.unref()
    throw error
  }
}

async function createOrderWithPayment(token, base, total = 25.8) {
  const orderResponse = await request(`${base}/api/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      items: [{ id: 1, quantity: 1, price: 10 }, { id: 2, quantity: 1, price: 9 }],
      customer: { name: 'Test User', email: 'returns@example.com', phone: '123' },
      shippingAddress: { address: '123 St', city: 'City', state: 'ST', zip: '12345' },
      subtotal: 19,
      shipping: 0,
      tax: 0.8,
      total,
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
  return {
    orderNumber,
    orderId: orderResponse.body.orderId || orderResponse.body.id,
    paymentId: paymentResponse.body.id,
  }
}

describe('Returns API', () => {
  before(async () => {
    await seedDatabase()
    await prisma.payment.deleteMany()
    await prisma.orderItem.deleteMany()
    await prisma.order.deleteMany()
    await prisma.cartItem.deleteMany()
    await prisma.wishlist.deleteMany()
    await prisma.review.deleteMany()
    await prisma.user.deleteMany()
  })

  after(async () => {
    await prisma.returnItem.deleteMany()
    await prisma.return.deleteMany()
    await prisma.refund.deleteMany()
    await prisma.returnAuditLog.deleteMany()
    await prisma.refundAuditLog.deleteMany()
    await prisma.payment.deleteMany()
    await prisma.orderItem.deleteMany()
    await prisma.order.deleteMany()
    await prisma.cartItem.deleteMany()
    await prisma.wishlist.deleteMany()
    await prisma.review.deleteMany()
    await prisma.user.deleteMany()
    await prisma.$disconnect()
  })

  it('customer cannot create a return without being logged in', async () => {
    const { app } = await import('../../src/index.js')
    const server = app.listen(0)
    const port = server.address().port
    const base = `http://localhost:${port}`

    try {
      const res = await request(`${base}/api/returns`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderNumber: 'test',
          items: [{ orderItemId: 'item1', quantity: 1, condition: 'like_new' }],
          reason: 'wrong_item',
        }),
      })

      assert.strictEqual(res.status, 401)
    } finally {
      server.close()
      server.unref()
    }
  })

  it('customer can view their returns list (empty for new user)', async () => {
    const { app } = await import('../../src/index.js')
    const { token, base, server } = await getAuthToken(app, 'returnsview@example.com', 'password123')

    try {
      const res = await request(`${base}/api/returns`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      })

      assert.strictEqual(res.status, 200)
      assert.strictEqual(Array.isArray(res.body), true)
    } finally {
      server.close()
      server.unref()
    }
  })

  it('customer cannot create a return for an ineligible (not delivered) order', async () => {
    const { app } = await import('../../src/index.js')
    const { token, base, server } = await getAuthToken(app, 'ineligible@example.com', 'password123')

    try {
      const orderData = await createOrderWithPayment(token, base)

      const res = await request(`${base}/api/returns`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          orderNumber: orderData.orderNumber,
          items: [{ orderItemId: 'item1', quantity: 1, condition: 'like_new' }],
          reason: 'wrong_item',
        }),
      })

      assert.strictEqual(res.status, 400)
      assert.ok(res.body.error.includes('eligible') || res.body.error.includes('delivered'))
    } finally {
      server.close()
      server.unref()
    }
  })

  it('customer cannot create a return with invalid reason', async () => {
    const { app } = await import('../../src/index.js')
    const { token, base, server } = await getAuthToken(app, 'invalidreason@example.com', 'password123')

    try {
      const res = await request(`${base}/api/returns`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          orderNumber: 'ORD-TEST',
          items: [{ orderItemId: 'item1', quantity: 1, condition: 'like_new' }],
          reason: 'invalid_reason',
        }),
      })

      assert.strictEqual(res.status, 400)
    } finally {
      server.close()
      server.unref()
    }
  })

  it('customer cannot view another user return', async () => {
    const { app } = await import('../../src/index.js')
    const { token, base, server } = await getAuthToken(app, 'privacy@example.com', 'password123')

    try {
      const res = await request(`${base}/api/returns/some-nonexistent-id`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      assert.strictEqual(res.status, 404)
    } finally {
      server.close()
      server.unref()
    }
  })
})

describe('Admin Returns API', () => {
  before(async () => {
    await seedDatabase()
  })

  it('non-admin cannot access admin returns', async () => {
    const { app } = await import('../../src/index.js')
    const { token, base, server } = await getAuthToken(app, 'nonadmin@example.com', 'password123')

    try {
      const res = await request(`${base}/api/admin/returns`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      assert.strictEqual(res.status, 403)
    } finally {
      server.close()
      server.unref()
    }
  })

  it('admin can view returns list', async () => {
    const { app } = await import('../../src/index.js')
    const { token, base, server } = await getAdminAuth(app, 'admin@nexmart.example.com', 'admin123')

    try {
      const res = await request(`${base}/api/admin/returns`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      assert.strictEqual(res.status, 200)
      assert.ok(res.body.returns !== undefined)
      assert.ok(res.body.pagination !== undefined)
    } finally {
      server.close()
      server.unref()
    }
  })

  it('admin cannot create refund exceeding payment amount', async () => {
    const { app } = await import('../../src/index.js')
    const userTokenData = await getAuthToken(app, 'refundtest@example.com', 'password123')
    const adminData = await getAdminAuth(app, 'admin@nexmart.example.com', 'admin123')

    try {
      const orderData = await createOrderWithPayment(userTokenData.token, userTokenData.base)

      const refundRes = await request(`${adminData.base}/api/admin/refunds`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminData.token}`,
        },
        body: JSON.stringify({
          paymentId: orderData.paymentId,
          amount: 100,
          method: 'manual',
          notes: 'Over-refund attempt',
        }),
      })

      assert.strictEqual(refundRes.status, 400)
      assert.ok(refundRes.body.error.includes('exceeds') || refundRes.body.error.includes('remaining'))
    } finally {
      userTokenData.server.close()
      userTokenData.server.unref()
      adminData.server.close()
      adminData.server.unref()
    }
  })

  it('admin can create a partial refund', async () => {
    const { app } = await import('../../src/index.js')
    const userTokenData = await getAuthToken(app, 'partialrefund@example.com', 'password123')
    const adminData = await getAdminAuth(app, 'admin@nexmart.example.com', 'admin123')

    try {
      const orderData = await createOrderWithPayment(userTokenData.token, userTokenData.base, 25.8)

      const refundRes = await request(`${adminData.base}/api/admin/refunds`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminData.token}`,
        },
        body: JSON.stringify({
          paymentId: orderData.paymentId,
          amount: 10,
          method: 'manual',
          notes: 'Partial refund test',
        }),
      })

      assert.strictEqual(refundRes.status, 201)
      assert.strictEqual(refundRes.body.amount, 10)
      assert.strictEqual(refundRes.body.status, 'pending')
      assert.strictEqual(refundRes.body.method, 'manual')
    } finally {
      userTokenData.server.close()
      userTokenData.server.unref()
      adminData.server.close()
      adminData.server.unref()
    }
  })

  it('admin marking order as delivered sets deliveredAt and makes order eligible for return', async () => {
    const { app } = await import('../../src/index.js')
    const userTokenData = await getAuthToken(app, 'deliveredtest@example.com', 'password123')
    const adminData = await getAdminAuth(app, 'admin@nexmart.example.com', 'admin123')

    try {
      const orderData = await createOrderWithPayment(userTokenData.token, userTokenData.base, 49.99)

      const statusRes = await request(`${adminData.base}/api/admin/orders/${orderData.orderNumber}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminData.token}`,
        },
        body: JSON.stringify({ status: 'delivered' }),
      })

      assert.strictEqual(statusRes.status, 200)
      assert.ok(statusRes.body.deliveredAt, 'deliveredAt should be set when order is marked delivered')

      const eligibilityRes = await request(`${userTokenData.base}/api/returns/eligibility/${orderData.orderNumber}`, {
        headers: { Authorization: `Bearer ${userTokenData.token}` },
      })

      assert.strictEqual(eligibilityRes.status, 200)
      assert.strictEqual(eligibilityRes.body.eligible, true)
      assert.ok(Array.isArray(eligibilityRes.body.returnableItems))
      assert.strictEqual(eligibilityRes.body.returnableItems.length, 2)
    } finally {
      userTokenData.server.close()
      userTokenData.server.unref()
      adminData.server.close()
      adminData.server.unref()
    }
  })

  it('admin can update return status: requested -> approved -> returned', async () => {
    const { app } = await import('../../src/index.js')
    const userTokenData = await getAuthToken(app, 'statusflow@example.com', 'password123')
    const adminData = await getAdminAuth(app, 'admin@nexmart.example.com', 'admin123')
    let orderData, returnId

    try {
      orderData = await createOrderWithPayment(userTokenData.token, userTokenData.base, 49.99)

      await request(`${adminData.base}/api/admin/orders/${orderData.orderNumber}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminData.token}`,
        },
        body: JSON.stringify({ status: 'delivered' }),
      })

      const orderItems = await prisma.orderItem.findMany({
        where: { orderId: orderData.orderId },
      })
      const orderItemId = orderItems[0].id

      const createRes = await request(`${userTokenData.base}/api/returns`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userTokenData.token}`,
        },
        body: JSON.stringify({
          orderNumber: orderData.orderNumber,
          items: [{ orderItemId, quantity: 1, condition: 'like_new' }],
          reason: 'defective',
        }),
      })
      assert.strictEqual(createRes.status, 201)
      returnId = createRes.body.id

      const approveRes = await request(`${adminData.base}/api/admin/returns/${returnId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminData.token}`,
        },
        body: JSON.stringify({ status: 'approved' }),
      })
      assert.strictEqual(approveRes.status, 200)
      assert.strictEqual(approveRes.body.status, 'approved')
      assert.ok(approveRes.body.approvedAt, 'approvedAt should be populated')

      const detailAfterApprove = await request(`${adminData.base}/api/admin/returns/${returnId}`, {
        headers: { Authorization: `Bearer ${adminData.token}` },
      })
      assert.strictEqual(detailAfterApprove.status, 200)
      assert.strictEqual(detailAfterApprove.body.status, 'approved')
      assert.ok(detailAfterApprove.body.auditLogs.length >= 1, 'audit log should have an entry for approved transition')

      const returnRes = await request(`${adminData.base}/api/admin/returns/${returnId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminData.token}`,
        },
        body: JSON.stringify({ status: 'returned' }),
      })
      assert.strictEqual(returnRes.status, 200)
      assert.strictEqual(returnRes.body.status, 'returned')
      assert.ok(returnRes.body.receivedAt, 'receivedAt should be populated')

      const detailAfterReturned = await request(`${adminData.base}/api/admin/returns/${returnId}`, {
        headers: { Authorization: `Bearer ${adminData.token}` },
      })
      assert.strictEqual(detailAfterReturned.body.status, 'returned')
      assert.ok(detailAfterReturned.body.auditLogs.length >= 2, 'audit log should have entries for approved and returned transitions')
    } finally {
      userTokenData.server.close()
      userTokenData.server.unref()
      adminData.server.close()
      adminData.server.unref()
    }
  })
})
