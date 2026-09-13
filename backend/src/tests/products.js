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

describe('Products API', () => {
  before(async () => {
    await seedDatabase()
  })

  it('GET /api/products returns all 42 products', async () => {
    const { app } = await import('../../src/index.js')
    const server = app.listen(0)
    const port = server.address().port
    const base = `http://localhost:${port}`

    try {
      const response = await request(`${base}/api/products`)
      assert.strictEqual(response.status, 200)
      assert.ok(Array.isArray(response.body))
      assert.strictEqual(response.body.length, 42)
      assert.ok(response.body[0].id)
      assert.ok(response.body[0].name)
    } finally {
      server.close()
    }
  })

  it('GET /api/products/:id returns product 1', async () => {
    const { app } = await import('../../src/index.js')
    const server = app.listen(0)
    const port = server.address().port
    const base = `http://localhost:${port}`

    try {
      const response = await request(`${base}/api/products/1`)
      assert.strictEqual(response.status, 200)
      assert.strictEqual(response.body.id, 1)
      assert.strictEqual(response.body.name, 'Wireless Bluetooth Headphones')
      assert.strictEqual(response.body.categoryId, 'electronics')
    } finally {
      server.close()
    }
  })

  it('GET /api/products/:id returns 404 for missing product', async () => {
    const { app } = await import('../../src/index.js')
    const server = app.listen(0)
    const port = server.address().port
    const base = `http://localhost:${port}`

    try {
      const response = await request(`${base}/api/products/99999`)
      assert.strictEqual(response.status, 404)
      assert.strictEqual(response.body.error, 'Product not found')
    } finally {
      server.close()
    }
  })

  it('GET /api/products?category=electronics filters correctly', async () => {
    const { app } = await import('../../src/index.js')
    const server = app.listen(0)
    const port = server.address().port
    const base = `http://localhost:${port}`

    try {
      const response = await request(`${base}/api/products?category=electronics`)
      assert.strictEqual(response.status, 200)
      assert.ok(Array.isArray(response.body))
      assert.ok(response.body.length > 0)
      assert.ok(response.body.every(p => p.categoryId === 'electronics'))
    } finally {
      server.close()
    }
  })

  it('GET /api/products?search=headphones searches correctly', async () => {
    const { app } = await import('../../src/index.js')
    const server = app.listen(0)
    const port = server.address().port
    const base = `http://localhost:${port}`

    try {
      const response = await request(`${base}/api/products?search=headphones`)
      assert.strictEqual(response.status, 200)
      assert.ok(Array.isArray(response.body))
      assert.ok(response.body.length > 0)
      assert.ok(
        response.body.some(p => p.name.toLowerCase().includes('headphones')),
        'Expected at least one product with headphones in name'
      )
    } finally {
      server.close()
    }
  })
})
