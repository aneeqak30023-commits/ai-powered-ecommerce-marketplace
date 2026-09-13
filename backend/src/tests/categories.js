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

describe('Categories API', () => {
  before(async () => {
    await seedDatabase()
  })

  it('GET /api/categories returns all 6 categories', async () => {
    const { app } = await import('../../src/index.js')
    const server = app.listen(0)
    const port = server.address().port
    const base = `http://localhost:${port}`

    try {
      const response = await request(`${base}/api/categories`)
      assert.strictEqual(response.status, 200)
      assert.ok(Array.isArray(response.body))
      assert.strictEqual(response.body.length, 6)
      assert.ok(response.body.some(c => c.id === 'electronics'))
      assert.ok(response.body.some(c => c.id === 'fashion'))
    } finally {
      server.close()
    }
  })

  it('GET /api/categories/:id returns electronics category', async () => {
    const { app } = await import('../../src/index.js')
    const server = app.listen(0)
    const port = server.address().port
    const base = `http://localhost:${port}`

    try {
      const response = await request(`${base}/api/categories/electronics`)
      assert.strictEqual(response.status, 200)
      assert.strictEqual(response.body.id, 'electronics')
      assert.strictEqual(response.body.name, 'Electronics')
      assert.ok(Array.isArray(response.body.subcategories))
      assert.strictEqual(response.body.subcategories.length, 3)
    } finally {
      server.close()
    }
  })

  it('GET /api/categories/:id returns 404 for missing category', async () => {
    const { app } = await import('../../src/index.js')
    const server = app.listen(0)
    const port = server.address().port
    const base = `http://localhost:${port}`

    try {
      const response = await request(`${base}/api/categories/nonexistent`)
      assert.strictEqual(response.status, 404)
      assert.strictEqual(response.body.error, 'Category not found')
    } finally {
      server.close()
    }
  })
})
