import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fetchInventory, fetchInventoryForProduct, clearInventoryCache } from '../services/inventoryApi.js'

const mockInventory = [
  {
    productId: 1,
    stock: 10,
    lowStockThreshold: 5,
    updatedAt: '2026-09-09T12:00:00.000Z',
    product: { id: 1, name: 'Product 1', categoryId: 'electronics' }
  },
  {
    productId: 2,
    stock: 3,
    lowStockThreshold: 5,
    updatedAt: '2026-09-09T12:00:00.000Z',
    product: { id: 2, name: 'Product 2', categoryId: 'fashion' }
  }
]

describe('inventoryApi', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    clearInventoryCache()
  })

  it('fetchInventory returns inventory list from API', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockInventory),
      })
    )

    const result = await fetchInventory()
    expect(result).toHaveLength(2)
    expect(result[0].productId).toBe(1)
    expect(result[0].stock).toBe(10)
  })

  it('fetchInventory throws on network error', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        status: 500,
      })
    )

    await expect(fetchInventory()).rejects.toThrow('Failed to fetch inventory: 500')
  })

  it('fetchInventoryForProduct returns single inventory entry', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockInventory[0]),
      })
    )

    const result = await fetchInventoryForProduct(1)
    expect(result.productId).toBe(1)
    expect(result.stock).toBe(10)
  })

  it('fetchInventoryForProduct returns null for 404', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        status: 404,
      })
    )

    const result = await fetchInventoryForProduct(999)
    expect(result).toBeNull()
  })

  it('fetchInventoryForProduct throws for other errors', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        status: 500,
      })
    )

    await expect(fetchInventoryForProduct(1)).rejects.toThrow('Failed to fetch inventory: 500')
  })
})
