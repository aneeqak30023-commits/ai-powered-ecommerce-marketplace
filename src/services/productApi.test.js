import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fetchProducts, fetchProduct, clearProductsCache } from '../services/productApi.js'

const mockProducts = [
  {
    id: 1,
    name: 'Test Product',
    price: 99.99,
    categoryId: 'electronics',
    images: '["https://example.com/img.jpg"]',
    tags: '["test"]',
    specifications: '{"Key": "Value"}',
    stock: 10,
  },
]

describe('productApi', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    clearProductsCache()
  })

  it('fetchProducts returns parsed products from API', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockProducts),
      })
    )

    const result = await fetchProducts()
    expect(result).toHaveLength(1)
    expect(result[0].name).toBe('Test Product')
    expect(result[0].images).toEqual(['https://example.com/img.jpg'])
    expect(result[0].tags).toEqual(['test'])
    expect(result[0].specifications).toEqual({ Key: 'Value' })
  })

  it('fetchProducts throws on network error', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        status: 500,
      })
    )

    await expect(fetchProducts()).rejects.toThrow('Failed to fetch products: 500')
  })

  it('fetchProduct returns single product by ID', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockProducts[0]),
      })
    )

    const result = await fetchProduct(1)
    expect(result.name).toBe('Test Product')
    expect(result.id).toBe(1)
  })

  it('fetchProduct returns null for 404', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        status: 404,
      })
    )

    const result = await fetchProduct(999)
    expect(result).toBeNull()
  })

  it('fetchProduct throws for other errors', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        status: 500,
      })
    )

    await expect(fetchProduct(1)).rejects.toThrow('Failed to fetch product: 500')
  })
})
