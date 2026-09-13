import { describe, it } from 'node:test'
import assert from 'node:assert'
import http from 'http'

// Helper to make HTTP requests without external dependencies
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

describe('Health endpoint', () => {
  it('returns 200 and JSON status ok', async () => {
    // Import the app to ensure it compiles
    const { app } = await import('../../src/index.js')

    // Start server on random port
    const server = app.listen(0)
    const port = server.address().port
    const base = `http://localhost:${port}`

    try {
      const response = await request(`${base}/health`)
      assert.strictEqual(response.status, 200)
      assert.strictEqual(response.body.status, 'ok')
      assert.ok(response.body.timestamp)
      assert.strictEqual(response.body.service, 'nexmart-backend')
    } finally {
      server.close()
    }
  })
})
