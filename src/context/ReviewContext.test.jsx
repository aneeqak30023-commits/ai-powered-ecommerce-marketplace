import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { ReviewProvider, useReviews, validateReviewInput } from '../context/ReviewContext.jsx'
import { AuthProvider, useAuth } from '../context/AuthContext.jsx'
import * as authApi from '../services/authApi.js'
import * as reviewApi from '../services/reviewApi.js'

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

if (!window.crypto) {
  window.crypto = {
    subtle: { digest: async () => new ArrayBuffer(32) },
    getRandomValues: (arr) => {
      for (let i = 0; i < arr.length; i++) arr[i] = Math.floor(Math.random() * 256)
    }
  }
}

vi.mock('../data/reviews.json', () => ({
  default: {
    '1': [
      { id: 'rev-1', productId: 1, userId: null, reviewerName: 'Demo User', rating: 5, text: 'Great product', date: '2026-01-01T00:00:00.000Z' }
    ]
  }
}))

const reviewWrapper = ({ children }) => (
  <AuthProvider>
    <ReviewProvider>
      {children}
    </ReviewProvider>
  </AuthProvider>
)

function useAuthAndReviews() {
  const auth = useAuth()
  const reviews = useReviews()
  return { ...auth, ...reviews }
}

describe('ReviewContext', () => {
  beforeEach(() => {
    localStorageMock.clear()
    vi.clearAllMocks()
    vi.spyOn(authApi, 'getSession').mockResolvedValue({ success: false })
    vi.spyOn(reviewApi, 'getProductReviews').mockResolvedValue(null)
    vi.spyOn(reviewApi, 'createReview').mockResolvedValue({
      id: 'backend-rev-1',
      productId: 1,
      userId: 'usr-test',
      reviewerName: 'Test User',
      rating: 5,
      text: 'Great product',
      date: new Date().toISOString(),
      editedAt: new Date().toISOString(),
    })
    vi.spyOn(reviewApi, 'updateReview').mockResolvedValue({
      id: 'backend-rev-1',
      productId: 1,
      userId: 'usr-test',
      reviewerName: 'Test User',
      rating: 5,
      text: 'Updated',
      date: new Date().toISOString(),
      editedAt: new Date().toISOString(),
    })
    vi.spyOn(reviewApi, 'deleteReview').mockResolvedValue({})
  })

  describe('validation', () => {
    it('rejects rating below 1', () => {
      const result = validateReviewInput(0, 'Good product')
      expect(result.valid).toBe(false)
      expect(result.errors.rating).toBe('Rating must be between 1 and 5')
    })

    it('rejects rating above 5', () => {
      const result = validateReviewInput(6, 'Good product')
      expect(result.valid).toBe(false)
      expect(result.errors.rating).toBe('Rating must be between 1 and 5')
    })

    it('accepts rating exactly 1', () => {
      const result = validateReviewInput(1, 'Bad product')
      expect(result.valid).toBe(true)
    })

    it('accepts rating exactly 5', () => {
      const result = validateReviewInput(5, 'Amazing product')
      expect(result.valid).toBe(true)
    })

    it('accepts integer ratings within range', () => {
      for (let r = 1; r <= 5; r++) {
        const result = validateReviewInput(r, 'Nice')
        expect(result.valid).toBe(true)
      }
    })

    it('rejects non-integer ratings', () => {
      const result = validateReviewInput(3.5, 'Nice')
      expect(result.valid).toBe(false)
    })

    it('rejects empty review text', () => {
      const result = validateReviewInput(5, '')
      expect(result.valid).toBe(false)
      expect(result.errors.text).toBe('Review must be at least 3 characters')
    })

    it('rejects whitespace-only review text', () => {
      const result = validateReviewInput(5, '   ')
      expect(result.valid).toBe(false)
    })

    it('accepts review text with exactly 3 characters', () => {
      const result = validateReviewInput(5, 'Good')
      expect(result.valid).toBe(true)
    })
  })

  describe('unauthenticated access', () => {
    it('prevents adding review when not logged in', async () => {
      const { result } = renderHook(() => useReviews(), { wrapper: reviewWrapper })
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0))
      })
      const response = await act(async () => result.current.addReview(1, { rating: 5, text: 'Great product' }))
      expect(response.success).toBe(false)
      expect(response.error).toContain('logged in')
    })

    it('prevents editing review when not logged in', async () => {
      const { result } = renderHook(() => useReviews(), { wrapper: reviewWrapper })
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0))
      })
      const response = await act(async () => result.current.editReview('rev-1', 1, { rating: 4, text: 'Updated' }))
      expect(response.success).toBe(false)
      expect(response.error).toContain('logged in')
    })

    it('prevents deleting review when not logged in', async () => {
      const { result } = renderHook(() => useReviews(), { wrapper: reviewWrapper })
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0))
      })
      const response = await act(async () => result.current.deleteReview('rev-1', 1))
      expect(response.success).toBe(false)
      expect(response.error).toContain('logged in')
    })
  })

  describe('review creation with mocked backend', () => {
    it('creates a review via backend API when available', async () => {
      const mockSession = {
        success: true,
        user: { id: 'usr-auth', email: 'auth@example.com', name: 'Auth User', createdAt: new Date().toISOString() },
        session: { userId: 'usr-auth', email: 'auth@example.com', name: 'Auth User', token: 'token', createdAt: new Date().toISOString() }
      }
      vi.spyOn(authApi, 'register').mockResolvedValue(mockSession)

      const backendReview = {
        id: 'backend-rev-1',
        productId: 1,
        userId: 'usr-auth',
        reviewerName: 'Auth User',
        rating: 5,
        text: 'Amazing product!',
        date: new Date().toISOString(),
        editedAt: new Date().toISOString(),
      }
      vi.spyOn(reviewApi, 'createReview').mockResolvedValue(backendReview)
      vi.spyOn(reviewApi, 'getProductReviews').mockResolvedValue({ reviews: [backendReview], averageRating: 5, reviewCount: 1, breakdown: { 5: 1, 4: 0, 3: 0, 2: 0, 1: 0 } })

      const { result } = renderHook(() => useAuthAndReviews(), { wrapper: reviewWrapper })
      await act(async () => {
        await result.current.register('auth@example.com', 'password123', 'Auth User')
      })

      await waitFor(() => expect(result.current.user).not.toBeNull())

      const response = await act(async () => result.current.addReview(1, { rating: 5, text: 'Amazing product!' }))
      expect(response.success).toBe(true)
      expect(response.review.userId).toBe(result.current.user.userId)
      expect(response.review.rating).toBe(5)
    })

    it('falls back to localStorage when backend is unavailable', async () => {
      const mockSession = {
        success: true,
        user: { id: 'usr-fallback', email: 'fallback@example.com', name: 'Fallback User', createdAt: new Date().toISOString() },
        session: { userId: 'usr-fallback', email: 'fallback@example.com', name: 'Fallback User', token: 'token', createdAt: new Date().toISOString() }
      }
      vi.spyOn(authApi, 'register').mockResolvedValue(mockSession)

      vi.spyOn(reviewApi, 'getProductReviews').mockRejectedValue(new Error('Network error'))
      vi.spyOn(reviewApi, 'createReview').mockResolvedValue(null)

      const { result } = renderHook(() => useAuthAndReviews(), { wrapper: reviewWrapper })
      await act(async () => {
        await result.current.register('fallback@example.com', 'password123', 'Fallback User')
      })

      await waitFor(() => expect(result.current.user).not.toBeNull())

      const response = await act(async () => result.current.addReview(1, { rating: 5, text: 'Local review' }))
      expect(response.success).toBe(true)
      expect(response.review.userId).toBe(result.current.user.userId)
    })

    it('prevents duplicate reviews for same product', async () => {
      const mockSession = {
        success: true,
        user: { id: 'usr-dup', email: 'dup@example.com', name: 'Dup User', createdAt: new Date().toISOString() },
        session: { userId: 'usr-dup', email: 'dup@example.com', name: 'Dup User', token: 'token', createdAt: new Date().toISOString() }
      }
      vi.spyOn(authApi, 'register').mockResolvedValue(mockSession)

      vi.spyOn(reviewApi, 'getProductReviews').mockResolvedValue(null)
      vi.spyOn(reviewApi, 'createReview').mockResolvedValue(null)

      const { result } = renderHook(() => useAuthAndReviews(), { wrapper: reviewWrapper })
      await act(async () => {
        await result.current.register('dup@example.com', 'password123', 'Dup User')
      })

      await waitFor(() => expect(result.current.user).not.toBeNull())

      await act(async () => {
        await result.current.addReview(1, { rating: 5, text: 'First review' })
      })

      const response = await act(async () => result.current.addReview(1, { rating: 4, text: 'Second review' }))
      expect(response.success).toBe(false)
      expect(response.error).toContain('already reviewed')
    })

    it('allows reviews for different products from same user', async () => {
      const mockSession = {
        success: true,
        user: { id: 'usr-diff', email: 'diff@example.com', name: 'Diff User', createdAt: new Date().toISOString() },
        session: { userId: 'usr-diff', email: 'diff@example.com', name: 'Diff User', token: 'token', createdAt: new Date().toISOString() }
      }
      vi.spyOn(authApi, 'register').mockResolvedValue(mockSession)

      vi.spyOn(reviewApi, 'getProductReviews').mockResolvedValue(null)
      vi.spyOn(reviewApi, 'createReview').mockResolvedValue(null)

      const { result } = renderHook(() => useAuthAndReviews(), { wrapper: reviewWrapper })
      await act(async () => {
        await result.current.register('diff@example.com', 'password123', 'Diff User')
      })

      await waitFor(() => expect(result.current.user).not.toBeNull())

      await act(async () => {
        await result.current.addReview(1, { rating: 5, text: 'First review' })
      })

      const response = await act(async () => result.current.addReview(2, { rating: 4, text: 'Second review' }))
      expect(response.success).toBe(true)
    })

    it('rejects invalid rating during creation', async () => {
      const mockSession = {
        success: true,
        user: { id: 'usr-inv', email: 'inv@example.com', name: 'Inv User', createdAt: new Date().toISOString() },
        session: { userId: 'usr-inv', email: 'inv@example.com', name: 'Inv User', token: 'token', createdAt: new Date().toISOString() }
      }
      vi.spyOn(authApi, 'register').mockResolvedValue(mockSession)

      vi.spyOn(reviewApi, 'getProductReviews').mockResolvedValue(null)
      vi.spyOn(reviewApi, 'createReview').mockResolvedValue(null)

      const { result } = renderHook(() => useAuthAndReviews(), { wrapper: reviewWrapper })
      await act(async () => {
        await result.current.register('inv@example.com', 'password123', 'Inv User')
      })

      await waitFor(() => expect(result.current.user).not.toBeNull())

      const response = await act(async () => result.current.addReview(1, { rating: 10, text: 'Invalid rating' }))
      expect(response.success).toBe(false)
      expect(response.errors.rating).toBeDefined()
    })
  })

  describe('review ownership and editing', () => {
    it('allows user to edit their own review', async () => {
      const mockSession = {
        success: true,
        user: { id: 'usr-edit', email: 'edit@example.com', name: 'Edit User', createdAt: new Date().toISOString() },
        session: { userId: 'usr-edit', email: 'edit@example.com', name: 'Edit User', token: 'token', createdAt: new Date().toISOString() }
      }
      vi.spyOn(authApi, 'register').mockResolvedValue(mockSession)

      vi.spyOn(reviewApi, 'getProductReviews').mockResolvedValue(null)
      vi.spyOn(reviewApi, 'createReview').mockResolvedValue({
        id: 'backend-rev-edit',
        productId: 1,
        userId: 'usr-edit',
        reviewerName: 'Edit User',
        rating: 3,
        text: 'Original review',
        date: new Date().toISOString(),
        editedAt: new Date().toISOString(),
      })
      vi.spyOn(reviewApi, 'updateReview').mockResolvedValue({
        id: 'backend-rev-edit',
        productId: 1,
        userId: 'usr-edit',
        reviewerName: 'Edit User',
        rating: 5,
        text: 'Updated review',
        date: new Date().toISOString(),
        editedAt: new Date().toISOString(),
      })

      const { result } = renderHook(() => useAuthAndReviews(), { wrapper: reviewWrapper })
      await act(async () => {
        await result.current.register('edit@example.com', 'password123', 'Edit User')
      })

      await waitFor(() => expect(result.current.user).not.toBeNull())

      let reviewId
      await act(async () => {
        const response = await result.current.addReview(1, { rating: 3, text: 'Original review' })
        reviewId = response.review.id
      })

      await act(async () => {
        await result.current.editReview(reviewId, 1, { rating: 5, text: 'Updated review' })
      })

      const updated = result.current.getReviewsForProduct(1).find(r => r.id === reviewId)
      expect(updated.rating).toBe(5)
      expect(updated.text).toBe('Updated review')
    })

    it('prevents user from editing another users review', async () => {
      const mockSessionA = {
        success: true,
        user: { id: 'usr-a', email: 'user-a@example.com', name: 'User A', createdAt: new Date().toISOString() },
        session: { userId: 'usr-a', email: 'user-a@example.com', name: 'User A', token: 'token', createdAt: new Date().toISOString() }
      }
      vi.spyOn(authApi, 'register').mockResolvedValue(mockSessionA)

      vi.spyOn(reviewApi, 'getProductReviews').mockResolvedValue(null)
      vi.spyOn(reviewApi, 'createReview').mockResolvedValue({
        id: 'backend-rev-a',
        productId: 1,
        userId: 'usr-a',
        reviewerName: 'User A',
        rating: 5,
        text: 'My review',
        date: new Date().toISOString(),
        editedAt: new Date().toISOString(),
      })

      const { result } = renderHook(() => useAuthAndReviews(), { wrapper: reviewWrapper })
      await act(async () => {
        await result.current.register('user-a@example.com', 'password123', 'User A')
      })

      await waitFor(() => expect(result.current.user).not.toBeNull())

      await act(async () => {
        await result.current.addReview(1, { rating: 5, text: 'My review' })
      })

      const reviews = result.current.getReviewsForProduct(1)
      const review = reviews.find(r => r.userId === result.current.user.userId)
      expect(review).toBeDefined()

      await act(async () => {
        await result.current.editReview(review.id, 1, { rating: 4, text: 'Changed' })
      })
      const updated = result.current.getReviewsForProduct(1).find(r => r.id === review.id)
      expect(updated.rating).toBe(4)
    })

    it('allows user to delete their own review', async () => {
      const mockSession = {
        success: true,
        user: { id: 'usr-del', email: 'del@example.com', name: 'Del User', createdAt: new Date().toISOString() },
        session: { userId: 'usr-del', email: 'del@example.com', name: 'Del User', token: 'token', createdAt: new Date().toISOString() }
      }
      vi.spyOn(authApi, 'register').mockResolvedValue(mockSession)

      vi.spyOn(reviewApi, 'getProductReviews').mockResolvedValue(null)
      vi.spyOn(reviewApi, 'createReview').mockResolvedValue({
        id: 'backend-rev-del',
        productId: 1,
        userId: 'usr-del',
        reviewerName: 'Del User',
        rating: 3,
        text: 'To be deleted',
        date: new Date().toISOString(),
        editedAt: new Date().toISOString(),
      })
      vi.spyOn(reviewApi, 'deleteReview').mockResolvedValue({})

      const { result } = renderHook(() => useAuthAndReviews(), { wrapper: reviewWrapper })
      await act(async () => {
        await result.current.register('del@example.com', 'password123', 'Del User')
      })

      await waitFor(() => expect(result.current.user).not.toBeNull())

      let reviewId
      await act(async () => {
        const response = await result.current.addReview(1, { rating: 3, text: 'To be deleted' })
        reviewId = response.review.id
      })

      const countBefore = result.current.getReviewsForProduct(1).length
      expect(countBefore).toBeGreaterThan(0)

      await act(async () => {
        const deleteResponse = await result.current.deleteReview(reviewId, 1)
        expect(deleteResponse.success).toBe(true)
      })

      const countAfter = result.current.getReviewsForProduct(1).length
      expect(countAfter).toBeLessThan(countBefore)
    })
  })

  describe('average ratings and counts', () => {
    it('calculates average rating from stored reviews', async () => {
      const mockSessionA = {
        success: true,
        user: { id: 'usr-avg-a', email: 'user-a@example.com', name: 'User A', createdAt: new Date().toISOString() },
        session: { userId: 'usr-avg-a', email: 'user-a@example.com', name: 'User A', token: 'token', createdAt: new Date().toISOString() }
      }
      const mockSessionB = {
        success: true,
        user: { id: 'usr-avg-b', email: 'user-b@example.com', name: 'User B', createdAt: new Date().toISOString() },
        session: { userId: 'usr-avg-b', email: 'user-b@example.com', name: 'User B', token: 'token', createdAt: new Date().toISOString() }
      }

      const { result } = renderHook(() => useAuthAndReviews(), { wrapper: reviewWrapper })

      vi.spyOn(authApi, 'register').mockResolvedValue(mockSessionA)
      await act(async () => {
        await result.current.register('user-a@example.com', 'password123', 'User A')
      })
      await waitFor(() => expect(result.current.user).not.toBeNull())

      await act(async () => {
        await result.current.addReview(1, { rating: 5, text: 'Great' })
      })

      vi.spyOn(authApi, 'register').mockResolvedValue(mockSessionB)
      await act(async () => {
        await result.current.logout()
      })
      await waitFor(() => expect(result.current.user).toBeNull())

      await act(async () => {
        await result.current.register('user-b@example.com', 'password123', 'User B')
      })
      await waitFor(() => expect(result.current.user).not.toBeNull())

      await act(async () => {
        await result.current.addReview(1, { rating: 3, text: 'Okay' })
      })

      const avg = result.current.getAverageRating(1)
      expect(avg).toBeCloseTo(4.33, 1)
    })

    it('returns null average when no reviews exist', async () => {
      const mockSession = {
        success: true,
        user: { id: 'usr-null', email: 'null@example.com', name: 'Null User', createdAt: new Date().toISOString() },
        session: { userId: 'usr-null', email: 'null@example.com', name: 'Null User', token: 'token', createdAt: new Date().toISOString() }
      }
      vi.spyOn(authApi, 'register').mockResolvedValue(mockSession)

      const { result } = renderHook(() => useAuthAndReviews(), { wrapper: reviewWrapper })
      await act(async () => {
        await result.current.register('null@example.com', 'password123', 'Null User')
      })
      await waitFor(() => expect(result.current.user).not.toBeNull())
      expect(result.current.getAverageRating(999)).toBeNull()
    })

    it('returns correct review count', async () => {
      const mockSessionA = {
        success: true,
        user: { id: 'usr-cnt-a', email: 'user-a@example.com', name: 'User A', createdAt: new Date().toISOString() },
        session: { userId: 'usr-cnt-a', email: 'user-a@example.com', name: 'User A', token: 'token', createdAt: new Date().toISOString() }
      }
      const mockSessionB = {
        success: true,
        user: { id: 'usr-cnt-b', email: 'user-b@example.com', name: 'User B', createdAt: new Date().toISOString() },
        session: { userId: 'usr-cnt-b', email: 'user-b@example.com', name: 'User B', token: 'token', createdAt: new Date().toISOString() }
      }

      const { result } = renderHook(() => useAuthAndReviews(), { wrapper: reviewWrapper })

      vi.spyOn(authApi, 'register').mockResolvedValue(mockSessionA)
      await act(async () => {
        await result.current.register('user-a@example.com', 'password123', 'User A')
      })
      await waitFor(() => expect(result.current.user).not.toBeNull())

      await act(async () => {
        await result.current.addReview(1, { rating: 5, text: 'First' })
      })

      vi.spyOn(authApi, 'register').mockResolvedValue(mockSessionB)
      await act(async () => {
        await result.current.logout()
      })
      await waitFor(() => expect(result.current.user).toBeNull())

      await act(async () => {
        await result.current.register('user-b@example.com', 'password123', 'User B')
      })
      await waitFor(() => expect(result.current.user).not.toBeNull())

      await act(async () => {
        await result.current.addReview(1, { rating: 4, text: 'Second' })
      })

      expect(result.current.getReviewCount(1)).toBe(3)
    })

    it('calculates rating breakdown correctly', async () => {
      const mockSessionA = {
        success: true,
        user: { id: 'usr-bd-a', email: 'user-a@example.com', name: 'User A', createdAt: new Date().toISOString() },
        session: { userId: 'usr-bd-a', email: 'user-a@example.com', name: 'User A', token: 'token', createdAt: new Date().toISOString() }
      }
      const mockSessionB = {
        success: true,
        user: { id: 'usr-bd-b', email: 'user-b@example.com', name: 'User B', createdAt: new Date().toISOString() },
        session: { userId: 'usr-bd-b', email: 'user-b@example.com', name: 'User B', token: 'token', createdAt: new Date().toISOString() }
      }
      const mockSessionC = {
        success: true,
        user: { id: 'usr-bd-c', email: 'user-c@example.com', name: 'User C', createdAt: new Date().toISOString() },
        session: { userId: 'usr-bd-c', email: 'user-c@example.com', name: 'User C', token: 'token', createdAt: new Date().toISOString() }
      }

      const { result } = renderHook(() => useAuthAndReviews(), { wrapper: reviewWrapper })

      vi.spyOn(authApi, 'register').mockResolvedValue(mockSessionA)
      await act(async () => {
        await result.current.register('user-a@example.com', 'password123', 'User A')
      })
      await waitFor(() => expect(result.current.user).not.toBeNull())

      await act(async () => {
        await result.current.addReview(1, { rating: 5, text: 'Five' })
      })

      vi.spyOn(authApi, 'register').mockResolvedValue(mockSessionB)
      await act(async () => {
        await result.current.logout()
      })
      await waitFor(() => expect(result.current.user).toBeNull())

      await act(async () => {
        await result.current.register('user-b@example.com', 'password123', 'User B')
      })
      await waitFor(() => expect(result.current.user).not.toBeNull())

      await act(async () => {
        await result.current.addReview(1, { rating: 5, text: 'Another five' })
      })

      vi.spyOn(authApi, 'register').mockResolvedValue(mockSessionC)
      await act(async () => {
        await result.current.logout()
      })
      await waitFor(() => expect(result.current.user).toBeNull())

      await act(async () => {
        await result.current.register('user-c@example.com', 'password123', 'User C')
      })
      await waitFor(() => expect(result.current.user).not.toBeNull())

      await act(async () => {
        await result.current.addReview(1, { rating: 3, text: 'Three' })
      })

      const breakdown = result.current.getRatingBreakdown(1)
      expect(breakdown[5]).toBe(3)
      expect(breakdown[3]).toBe(1)
      expect(breakdown[4]).toBe(0)
      expect(breakdown[2]).toBe(0)
      expect(breakdown[1]).toBe(0)
    })
  })

  describe('persistence', () => {
    it('persists reviews to localStorage when backend is unavailable', async () => {
      const mockSession = {
        success: true,
        user: { id: 'usr-persist', email: 'persist@example.com', name: 'Persist User', createdAt: new Date().toISOString() },
        session: { userId: 'usr-persist', email: 'persist@example.com', name: 'Persist User', token: 'token', createdAt: new Date().toISOString() }
      }
      vi.spyOn(authApi, 'register').mockResolvedValue(mockSession)

      vi.spyOn(reviewApi, 'getProductReviews').mockResolvedValue(null)
      vi.spyOn(reviewApi, 'createReview').mockResolvedValue(null)

      const { result } = renderHook(() => useAuthAndReviews(), { wrapper: reviewWrapper })
      await act(async () => {
        await result.current.register('persist@example.com', 'password123', 'Persist User')
      })
      await waitFor(() => expect(result.current.user).not.toBeNull())

      await act(async () => {
        await result.current.addReview(1, { rating: 5, text: 'Persistent review' })
      })

      const stored = localStorageMock.getItem('nexmart-reviews')
      expect(stored).not.toBeNull()
      const parsed = JSON.parse(stored)
      expect(parsed['1']).toBeDefined()
      expect(parsed['1'].some(r => r.text === 'Persistent review')).toBe(true)
    })

    it('loads persisted reviews on re-initialization', async () => {
      const preloaded = {
        '1': [
          { id: 'rev-persist', productId: 1, userId: 'usr-123', reviewerName: 'Persist User', rating: 4, text: 'Loaded', date: new Date().toISOString() }
        ]
      }
      localStorageMock.setItem('nexmart-reviews', JSON.stringify(preloaded))

      const { result } = renderHook(() => useReviews(), { wrapper: reviewWrapper })
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0))
      })
      const reviews = result.current.getReviewsForProduct(1)
      expect(reviews.some(r => r.text === 'Loaded')).toBe(true)
    })
  })

  describe('edge cases', () => {
    it('returns empty array for invalid product ID', async () => {
      const { result } = renderHook(() => useReviews(), { wrapper: reviewWrapper })
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0))
      })
      expect(result.current.getReviewsForProduct(null)).toEqual([])
      expect(result.current.getReviewsForProduct(undefined)).toEqual([])
      expect(result.current.getReviewsForProduct('abc')).toEqual([])
    })

    it('handles zero reviews gracefully', async () => {
      const { result } = renderHook(() => useReviews(), { wrapper: reviewWrapper })
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0))
      })
      expect(result.current.getReviewsForProduct(999)).toEqual([])
      expect(result.current.getAverageRating(999)).toBeNull()
      expect(result.current.getReviewCount(999)).toBe(0)
      const breakdown = result.current.getRatingBreakdown(999)
      expect(breakdown[5]).toBe(0)
    })

    it('read-only API strips internal fields', async () => {
      const mockSession = {
        success: true,
        user: { id: 'usr-read', email: 'read@example.com', name: 'Read User', createdAt: new Date().toISOString() },
        session: { userId: 'usr-read', email: 'read@example.com', name: 'Read User', token: 'token', createdAt: new Date().toISOString() }
      }
      vi.spyOn(authApi, 'register').mockResolvedValue(mockSession)

      vi.spyOn(reviewApi, 'getProductReviews').mockResolvedValue(null)
      vi.spyOn(reviewApi, 'createReview').mockResolvedValue(null)

      const { result } = renderHook(() => useAuthAndReviews(), { wrapper: reviewWrapper })
      await act(async () => {
        await result.current.register('read@example.com', 'password123', 'Read User')
      })
      await waitFor(() => expect(result.current.user).not.toBeNull())

      await act(async () => {
        await result.current.addReview(1, { rating: 5, text: 'Clean API' })
      })

      const readOnly = result.current.getReadOnlyReviews(1)
      expect(readOnly[0]).not.toHaveProperty('userId')
      expect(readOnly[0]).toHaveProperty('reviewerName')
      expect(readOnly[0]).toHaveProperty('rating')
      expect(readOnly[0]).toHaveProperty('text')
    })
  })
})
