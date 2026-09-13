import { describe, it } from 'node:test'
import assert from 'node:assert'
import { PrismaClient } from '@prisma/client'
import { validateEnv } from '../config/env.js'
import { unlink } from 'node:fs/promises'

describe('Database configuration', () => {
  it('validates environment variables without throwing', () => {
    assert.doesNotThrow(() => validateEnv())
  })

  it('instantiates Prisma client and connects to SQLite', async () => {
    process.env.DATABASE_URL = 'file:test.db'

    const prisma = new PrismaClient()

    try {
      await prisma.$connect()
      assert.ok(true, 'Prisma connected successfully')

      // Verify we can run a simple query (SQLite returns BigInt for integers)
      const result = await prisma.$queryRaw`SELECT 1 as test`
      assert.strictEqual(Number(result[0].test), 1)
    } catch (error) {
      assert.fail(`Prisma connection failed: ${error.message}`)
    } finally {
      await prisma.$disconnect()
      await unlink('test.db').catch(() => {})
    }
  })
})
