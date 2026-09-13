import { describe, it, expect, beforeEach, vi } from 'vitest'
import { getWishlist, addToWishlist, removeFromWishlist, clearWishlistCache } from '../services/wishlistApi.js'

const localStorageMock = (() => {
  let store = {}
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => { store[key] = String(value) },
    removeItem: (key) => { delete store[key] },
    clear: () => { store = {} }
  }
})()

Object.defineProperty(window, 'localStorage', { value: localStorageMock })

const mockWishlistItem = {
  id: 'wish-1',
  productId: 1,
  createdAt: '2026-09-09T00:00:00.000Z',
  product: {
    id: 1,
    name: 'Test Product',
    price: 10,
    originalPrice: 20,
    image: 'test.jpg',
    images: ['test.jpg'],
    rating: 4.5,
    reviewCount: 10,
    stock: 5,
    categoryId: 'electronics',
  }
}

describe('wishlistApi', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    clearWishlistCache()
    localStorageMock.clear()
  })

  it('fetches wishlist successfully', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve([mockWishlistItem]),
      })
    )

    const result = await getWishlist()
    expect(result).toHaveLength(1)
    expect(result[0].productId).toBe(1)
  })

  it('adds item to wishlist', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 201,
        json: () => Promise.resolve(mockWishlistItem),
      })
    )

    const result = await addToWishlist(1)
    expect(result.productId).toBe(1)
  })

  it('removes item from wishlist', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 204,
        json: () => Promise.resolve({}),
      })
    )

    const result = await removeFromWishlist(1)
    expect(result).toEqual({})
  })

  it('rejects duplicate wishlist entry', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        status: 409,
        json: () => Promise.resolve({ error: 'Product already in wishlist' }),
      })
    )

    await expect(addToWishlist(1)).rejects.toThrow('already in wishlist')
  })

  it('returns 404 for missing product', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        status: 404,
        json: () => Promise.resolve({ error: 'Product not found' }),
      })
    )

    await expect(addToWishlist(999)).rejects.toThrow('Product not found')
  })

  it('returns 404 for removing non-existent wishlist item', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        status: 404,
        json: () => Promise.resolve({ error: 'Product not in wishlist' }),
      })
    )

    await expect(removeFromWishlist(999)).rejects.toThrow('not in wishlist')
  })

  it('clears cache when wishlist is modified', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 201,
        json: () => Promise.resolve(mockWishlistItem),
      })
    )

    await getWishlist()
    await addToWishlist(1)
    expect(global.fetch).toHaveBeenCalledTimes(2)
  })
})
