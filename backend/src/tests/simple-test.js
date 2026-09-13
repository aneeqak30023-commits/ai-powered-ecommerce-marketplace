import { describe, it } from 'node:test'
import assert from 'node:assert'
import http from 'http'

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

describe('Simple test', () => {
  it('works', async () => {
    const server = http.createServer((req, res) => {
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ ok: true }))
    })

    server.listen(0, async () => {
      const port = server.address().port
      const response = await request(`http://localhost:${port}/`)
      assert.strictEqual(response.status, 200)
      server.close()
      server.unref()
    })
  })
})
