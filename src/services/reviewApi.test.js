import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getProductReviews, createReview, updateReview, deleteReview, clearReviewsCache } from '../services/reviewApi.js'

const mockReview = {
  id: 'rev-1',
  productId: 1,
  userId: 'user-1',
  reviewerName: 'Test User',
  rating: 5,
  text: 'Great product',
  date: '2026-01-01T00:00:00.000Z',
  editedAt: '2026-01-01T00:00:00.000Z',
}

const mockStats = {
  reviews: [mockReview],
  averageRating: 5,
  reviewCount: 1,
  breakdown: { 5: 1, 4: 0, 3: 0, 2: 0, 1: 0 },
}

describe('reviewApi', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    clearReviewsCache()
  })

  it('getProductReviews fetches reviews from backend', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockStats),
      })
    )

    const result = await getProductReviews(1)
    expect(result).toEqual(mockStats)
    expect(result.reviews[0].text).toBe('Great product')
  })

  it('getProductReviews caches results', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockStats),
      })
    )

    await getProductReviews(1)
    await getProductReviews(1)

    expect(global.fetch).toHaveBeenCalledTimes(1)
  })

  it('getProductReviews throws on error', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        status: 500,
        json: () => Promise.resolve({ error: 'Server error' }),
      })
    )

    await expect(getProductReviews(1)).rejects.toThrow('Server error')
  })

  it('createReview sends POST request with auth headers', async () => {
    const localStorageMock = (() => {
      const store = {}
      return {
        getItem: (key) => store[key] || null,
        setItem: (key, value) => { store[key] = String(value) },
        removeItem: (key) => { delete store[key] },
        clear: () => { for (const k in store) delete store[k] }
      }
    })()
    Object.defineProperty(window, 'localStorage', { value: localStorageMock })
    localStorageMock.setItem('nexmart-auth', JSON.stringify({ token: 'test-token' }))

    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 201,
        json: () => Promise.resolve(mockReview),
      })
    )

    const result = await createReview(1, { rating: 5, text: 'Great product' })
    expect(result).toEqual(mockReview)
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/reviews/products/1/reviews'),
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          Authorization: 'Bearer test-token',
        }),
      })
    )
  })

  it('createReview updates cache on success', async () => {
    const localStorageMock = (() => {
      const store = {}
      return {
        getItem: (key) => store[key] || null,
        setItem: (key, value) => { store[key] = String(value) },
        removeItem: (key) => { delete store[key] },
        clear: () => { for (const k in store) delete store[k] }
      }
    })()
    Object.defineProperty(window, 'localStorage', { value: localStorageMock })
    localStorageMock.setItem('nexmart-auth', JSON.stringify({ token: 'test-token' }))

    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 201,
        json: () => Promise.resolve(mockReview),
      })
    )

    await getProductReviews(1)
    await createReview(1, { rating: 5, text: 'New review' })

    const cached = await getProductReviews(1)
    expect(cached.reviews).toHaveLength(1)
  })

  it('createReview throws on validation error', async () => {
    const localStorageMock = (() => {
      const store = {}
      return {
        getItem: (key) => store[key] || null,
        setItem: (key, value) => { store[key] = String(value) },
        removeItem: (key) => { delete store[key] },
        clear: () => { for (const k in store) delete store[k] }
      }
    })()
    Object.defineProperty(window, 'localStorage', { value: localStorageMock })
    localStorageMock.setItem('nexmart-auth', JSON.stringify({ token: 'test-token' }))

    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        status: 409,
        json: () => Promise.resolve({ error: 'You have already reviewed this product' }),
      })
    )

    await expect(createReview(1, { rating: 5, text: 'Duplicate' })).rejects.toThrow('You have already reviewed this product')
  })

  it('updateReview sends PATCH request', async () => {
    const localStorageMock = (() => {
      const store = {}
      return {
        getItem: (key) => store[key] || null,
        setItem: (key, value) => { store[key] = String(value) },
        removeItem: (key) => { delete store[key] },
        clear: () => { for (const k in store) delete store[k] }
      }
    })()
    Object.defineProperty(window, 'localStorage', { value: localStorageMock })
    localStorageMock.setItem('nexmart-auth', JSON.stringify({ token: 'test-token' }))

    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ ...mockReview, rating: 4 }),
      })
    )

    const result = await updateReview('rev-1', { rating: 4 })
    expect(result.rating).toBe(4)
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/reviews/rev-1'),
      expect.objectContaining({ method: 'PATCH' })
    )
  })

  it('deleteReview sends DELETE request', async () => {
    const localStorageMock = (() => {
      const store = {}
      return {
        getItem: (key) => store[key] || null,
        setItem: (key, value) => { store[key] = String(value) },
        removeItem: (key) => { delete store[key] },
        clear: () => { for (const k in store) delete store[k] }
      }
    })()
    Object.defineProperty(window, 'localStorage', { value: localStorageMock })
    localStorageMock.setItem('nexmart-auth', JSON.stringify({ token: 'test-token' }))

    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 204,
        json: () => Promise.resolve({}),
      })
    )

    const result = await deleteReview('rev-1')
    expect(result).toEqual({})
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/reviews/rev-1'),
      expect.objectContaining({ method: 'DELETE' })
    )
  })

  it('clearReviewsCache resets cache', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockStats),
      })
    )

    await getProductReviews(1)
    clearReviewsCache()
    await getProductReviews(1)

    expect(global.fetch).toHaveBeenCalledTimes(2)
  })
})
