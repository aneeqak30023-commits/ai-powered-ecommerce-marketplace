import { describe, it, before } from 'node:test'
import assert from 'node:assert'
import http from 'http'
import { seedDatabase } from '../_seed-helper.js'

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

describe('Inventory API', () => {
  before(async () => {
    await seedDatabase()
  })

  it('GET /api/inventory returns all 42 inventory records', async () => {
    const { app } = await import('../../src/index.js')
    const server = app.listen(0)
    const port = server.address().port
    const base = `http://localhost:${port}`

    try {
      const response = await request(`${base}/api/inventory`)
      assert.strictEqual(response.status, 200)
      assert.ok(Array.isArray(response.body))
      assert.strictEqual(response.body.length, 42)
      assert.ok(response.body[0].productId)
      assert.ok(typeof response.body[0].stock === 'number')
    } finally {
      server.close()
    }
  })

  it('GET /api/inventory/:productId returns inventory for product 1', async () => {
    const { app } = await import('../../src/index.js')
    const server = app.listen(0)
    const port = server.address().port
    const base = `http://localhost:${port}`

    try {
      const response = await request(`${base}/api/inventory/1`)
      assert.strictEqual(response.status, 200)
      assert.strictEqual(response.body.productId, 1)
      assert.ok(typeof response.body.stock === 'number')
      assert.ok(typeof response.body.lowStockThreshold === 'number')
    } finally {
      server.close()
    }
  })

  it('GET /api/inventory/:productId returns 404 for missing inventory', async () => {
    const { app } = await import('../../src/index.js')
    const server = app.listen(0)
    const port = server.address().port
    const base = `http://localhost:${port}`

    try {
      const response = await request(`${base}/api/inventory/999999`)
      assert.strictEqual(response.status, 404)
      assert.strictEqual(response.body.error, 'Inventory not found')
    } finally {
      server.close()
    }
  })

  it('PATCH /api/inventory/:productId returns 404 (endpoint removed for security)', async () => {
    const { app } = await import('../../src/index.js')
    const server = app.listen(0)
    const port = server.address().port
    const base = `http://localhost:${port}`

    try {
      const response = await request(`${base}/api/inventory/1`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stock: 50 }),
      })
      assert.strictEqual(response.status, 404)
    } finally {
      server.close()
    }
  })
})
