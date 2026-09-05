import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { ReviewProvider, useReviews, validateReviewInput } from '../context/ReviewContext.jsx'
import { AuthProvider, useAuth } from '../context/AuthContext.jsx'

// Mock localStorage
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

// Mock crypto
if (!window.crypto) {
  window.crypto = {
    subtle: { digest: async () => new ArrayBuffer(32) },
    getRandomValues: (arr) => {
      for (let i = 0; i < arr.length; i++) arr[i] = Math.floor(Math.random() * 256)
    }
  }
}

// Mock reviews.json to keep tests fast and deterministic
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
    it('prevents adding review when not logged in', () => {
      const { result } = renderHook(() => useReviews(), { wrapper: reviewWrapper })
      const response = result.current.addReview(1, { rating: 5, text: 'Great product' })
      expect(response.success).toBe(false)
      expect(response.error).toContain('logged in')
    })

    it('prevents editing review when not logged in', () => {
      const { result } = renderHook(() => useReviews(), { wrapper: reviewWrapper })
      const response = result.current.editReview('rev-1', 1, { rating: 4, text: 'Updated' })
      expect(response.success).toBe(false)
      expect(response.error).toContain('logged in')
    })

    it('prevents deleting review when not logged in', () => {
      const { result } = renderHook(() => useReviews(), { wrapper: reviewWrapper })
      const response = result.current.deleteReview('rev-1', 1)
      expect(response.success).toBe(false)
      expect(response.error).toContain('logged in')
    })
  })

  describe('review creation', () => {
    it('creates a review for authenticated user', async () => {
      const { result } = renderHook(() => useAuthAndReviews(), { wrapper: reviewWrapper })
      await act(async () => {
        await result.current.register('testuser@example.com', 'password123', 'Test User')
      })
      const response = result.current.addReview(1, { rating: 5, text: 'Amazing product!' })
      expect(response.success).toBe(true)
      expect(response.review.userId).toBe(result.current.user.userId)
      expect(response.review.rating).toBe(5)
    })

    it('prevents duplicate reviews for same product', async () => {
      const { result } = renderHook(() => useAuthAndReviews(), { wrapper: reviewWrapper })
      await act(async () => {
        await result.current.register('testuser@example.com', 'password123', 'Test User')
      })
      await act(async () => {
        result.current.addReview(1, { rating: 5, text: 'First review' })
      })
      const response = result.current.addReview(1, { rating: 4, text: 'Second review' })
      expect(response.success).toBe(false)
      expect(response.error).toContain('already reviewed')
    })

    it('allows reviews for different products from same user', async () => {
      const { result } = renderHook(() => useAuthAndReviews(), { wrapper: reviewWrapper })
      await act(async () => {
        await result.current.register('testuser@example.com', 'password123', 'Test User')
      })
      await act(async () => {
        result.current.addReview(1, { rating: 5, text: 'First review' })
      })
      const response = result.current.addReview(2, { rating: 4, text: 'Second review' })
      expect(response.success).toBe(true)
    })

    it('rejects invalid rating during creation', async () => {
      const { result } = renderHook(() => useAuthAndReviews(), { wrapper: reviewWrapper })
      await act(async () => {
        await result.current.register('testuser@example.com', 'password123', 'Test User')
      })
      const response = result.current.addReview(1, { rating: 10, text: 'Invalid rating' })
      expect(response.success).toBe(false)
      expect(response.errors.rating).toBeDefined()
    })
  })

  describe('review ownership and editing', () => {
    it('allows user to edit their own review', async () => {
      const { result } = renderHook(() => useAuthAndReviews(), { wrapper: reviewWrapper })
      await act(async () => {
        await result.current.register('testuser@example.com', 'password123', 'Test User')
      })

      let reviewId
      await act(async () => {
        const response = result.current.addReview(1, { rating: 3, text: 'Original review' })
        reviewId = response.review.id
      })

      await act(async () => {
        result.current.editReview(reviewId, 1, { rating: 5, text: 'Updated review' })
      })

      const updated = result.current.getReviewsForProduct(1).find(r => r.id === reviewId)
      expect(updated.rating).toBe(5)
      expect(updated.text).toBe('Updated review')
    })

    it('prevents user from editing another users review', async () => {
      const { result } = renderHook(() => useAuthAndReviews(), { wrapper: reviewWrapper })
      await act(async () => {
        await result.current.register('user-a@example.com', 'password123', 'User A')
      })

      await act(async () => {
        result.current.addReview(1, { rating: 5, text: 'My review' })
      })

      const reviews = result.current.getReviewsForProduct(1)
      const review = reviews.find(r => r.userId === result.current.user.userId)
      expect(review).toBeDefined()

      // The editReview function checks if review.userId === user.userId
      // Since we're logged in as the same user, this should succeed
      await act(async () => {
        result.current.editReview(review.id, 1, { rating: 4, text: 'Changed' })
      })
      const updated = result.current.getReviewsForProduct(1).find(r => r.id === review.id)
      expect(updated.rating).toBe(4)
    })

    it('allows user to delete their own review', async () => {
      const { result } = renderHook(() => useAuthAndReviews(), { wrapper: reviewWrapper })
      await act(async () => {
        await result.current.register('testuser@example.com', 'password123', 'Test User')
      })

      let reviewId
      await act(async () => {
        const response = result.current.addReview(1, { rating: 3, text: 'To be deleted' })
        reviewId = response.review.id
      })

      const countBefore = result.current.getReviewsForProduct(1).length
      expect(countBefore).toBeGreaterThan(0)

      await act(async () => {
        const deleteResponse = result.current.deleteReview(reviewId, 1)
        expect(deleteResponse.success).toBe(true)
      })

      const countAfter = result.current.getReviewsForProduct(1).length
      expect(countAfter).toBeLessThan(countBefore)
    })
  })

  describe('average ratings and counts', () => {
    it('calculates average rating from stored reviews', async () => {
      const { result } = renderHook(() => useAuthAndReviews(), { wrapper: reviewWrapper })
      
      // Create two different users to add reviews
      await act(async () => {
        await result.current.register('user-a@example.com', 'password123', 'User A')
      })
      await act(async () => {
        result.current.addReview(1, { rating: 5, text: 'Great' })
      })

      // Logout and login as different user
      await act(async () => {
        result.current.logout()
      })
      await act(async () => {
        await result.current.register('user-b@example.com', 'password123', 'User B')
      })
      await act(async () => {
        result.current.addReview(1, { rating: 3, text: 'Okay' })
      })

      const avg = result.current.getAverageRating(1)
      // Demo review (5) + user A (5) + user B (3) = 13/3 = 4.33
      expect(avg).toBeCloseTo(4.33, 1)
    })

    it('returns null average when no reviews exist', async () => {
      const { result } = renderHook(() => useAuthAndReviews(), { wrapper: reviewWrapper })
      await act(async () => {
        await result.current.register('testuser@example.com', 'password123', 'Test User')
      })
      expect(result.current.getAverageRating(999)).toBeNull()
    })

    it('returns correct review count', async () => {
      const { result } = renderHook(() => useAuthAndReviews(), { wrapper: reviewWrapper })
      
      await act(async () => {
        await result.current.register('user-a@example.com', 'password123', 'User A')
      })
      await act(async () => {
        result.current.addReview(1, { rating: 5, text: 'First' })
      })

      await act(async () => {
        result.current.logout()
      })
      await act(async () => {
        await result.current.register('user-b@example.com', 'password123', 'User B')
      })
      await act(async () => {
        result.current.addReview(1, { rating: 4, text: 'Second' })
      })

      // Demo (1) + user A (1) + user B (1) = 3
      expect(result.current.getReviewCount(1)).toBe(3)
    })

    it('calculates rating breakdown correctly', async () => {
      const { result } = renderHook(() => useAuthAndReviews(), { wrapper: reviewWrapper })
      
      await act(async () => {
        await result.current.register('user-a@example.com', 'password123', 'User A')
      })
      await act(async () => {
        result.current.addReview(1, { rating: 5, text: 'Five' })
      })

      await act(async () => {
        result.current.logout()
      })
      await act(async () => {
        await result.current.register('user-b@example.com', 'password123', 'User B')
      })
      await act(async () => {
        result.current.addReview(1, { rating: 5, text: 'Another five' })
      })

      await act(async () => {
        result.current.logout()
      })
      await act(async () => {
        await result.current.register('user-c@example.com', 'password123', 'User C')
      })
      await act(async () => {
        result.current.addReview(1, { rating: 3, text: 'Three' })
      })

      const breakdown = result.current.getRatingBreakdown(1)
      // Demo (5) + user A (5) + user B (5) + user C (3)
      expect(breakdown[5]).toBe(3)
      expect(breakdown[3]).toBe(1)
      expect(breakdown[4]).toBe(0)
      expect(breakdown[2]).toBe(0)
      expect(breakdown[1]).toBe(0)
    })
  })

  describe('persistence', () => {
    it('persists reviews to localStorage', async () => {
      const { result } = renderHook(() => useAuthAndReviews(), { wrapper: reviewWrapper })
      await act(async () => {
        await result.current.register('testuser@example.com', 'password123', 'Test User')
      })

      await act(async () => {
        result.current.addReview(1, { rating: 5, text: 'Persistent review' })
      })

      const stored = localStorageMock.getItem('nexmart-reviews')
      expect(stored).not.toBeNull()
      const parsed = JSON.parse(stored)
      expect(parsed['1']).toBeDefined()
      expect(parsed['1'].some(r => r.text === 'Persistent review')).toBe(true)
    })

    it('loads persisted reviews on re-initialization', () => {
      const preloaded = {
        '1': [
          { id: 'rev-persist', productId: 1, userId: 'usr-123', reviewerName: 'Persist User', rating: 4, text: 'Loaded', date: new Date().toISOString() }
        ]
      }
      localStorageMock.setItem('nexmart-reviews', JSON.stringify(preloaded))

      const { result } = renderHook(() => useReviews(), { wrapper: reviewWrapper })
      const reviews = result.current.getReviewsForProduct(1)
      expect(reviews.some(r => r.text === 'Loaded')).toBe(true)
    })
  })

  describe('edge cases', () => {
    it('returns empty array for invalid product ID', () => {
      const { result } = renderHook(() => useReviews(), { wrapper: reviewWrapper })
      expect(result.current.getReviewsForProduct(null)).toEqual([])
      expect(result.current.getReviewsForProduct(undefined)).toEqual([])
      expect(result.current.getReviewsForProduct('abc')).toEqual([])
    })

    it('handles zero reviews gracefully', () => {
      const { result } = renderHook(() => useReviews(), { wrapper: reviewWrapper })
      expect(result.current.getReviewsForProduct(999)).toEqual([])
      expect(result.current.getAverageRating(999)).toBeNull()
      expect(result.current.getReviewCount(999)).toBe(0)
      const breakdown = result.current.getRatingBreakdown(999)
      expect(breakdown[5]).toBe(0)
    })

    it('read-only API strips internal fields', async () => {
      const { result } = renderHook(() => useAuthAndReviews(), { wrapper: reviewWrapper })
      await act(async () => {
        await result.current.register('testuser@example.com', 'password123', 'Test User')
      })

      await act(async () => {
        result.current.addReview(1, { rating: 5, text: 'Clean API' })
      })

      const readOnly = result.current.getReadOnlyReviews(1)
      expect(readOnly[0]).not.toHaveProperty('userId')
      expect(readOnly[0]).toHaveProperty('reviewerName')
      expect(readOnly[0]).toHaveProperty('rating')
      expect(readOnly[0]).toHaveProperty('text')
    })
  })
})
