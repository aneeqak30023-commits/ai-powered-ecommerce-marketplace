import { useState, useCallback, useEffect, createContext, useContext } from 'react'
import { useAuth } from './AuthContext.jsx'
import demoReviews from '../data/reviews.json'

const STORAGE_KEY = 'nexmart-reviews'

function loadReviews() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (typeof parsed === 'object' && parsed !== null) {
        return parsed
      }
    }
  } catch {
    // fall through to seed
  }
  return seedDemoReviews()
}

function seedDemoReviews() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      if (typeof parsed === 'object' && parsed !== null && Object.keys(parsed).length > 0) {
        return parsed
      }
    }
  } catch {
    // ignore
  }
  return JSON.parse(JSON.stringify(demoReviews))
}

function saveReviews(reviews) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reviews))
  } catch {
    // storage full or unavailable
  }
}

function validateReviewInput(rating, text) {
  const errors = {}
  const numRating = Number(rating)
  if (!Number.isInteger(numRating) || numRating < 1 || numRating > 5) {
    errors.rating = 'Rating must be between 1 and 5'
  }
  const trimmedText = typeof text === 'string' ? text.trim() : ''
  if (trimmedText.length < 3) {
    errors.text = 'Review must be at least 3 characters'
  }
  return { valid: Object.keys(errors).length === 0, errors }
}

const ReviewContext = createContext(null)

export function ReviewProvider({ children }) {
  const [reviewsByProduct, setReviewsByProduct] = useState(() => loadReviews())
  const { user } = useAuth()

  useEffect(() => {
    saveReviews(reviewsByProduct)
  }, [reviewsByProduct])

  const getReviewsForProduct = useCallback((productId) => {
    if (!productId) return []
    return reviewsByProduct[productId] || []
  }, [reviewsByProduct])

  const getUserReviewForProduct = useCallback((productId, userId) => {
    if (!productId || !userId) return null
    const reviews = reviewsByProduct[productId] || []
    return reviews.find(r => r.userId === userId) || null
  }, [reviewsByProduct])

  const addReview = useCallback((productId, reviewData) => {
    if (!user) {
      return { success: false, error: 'You must be logged in to submit a review' }
    }

    const validation = validateReviewInput(reviewData.rating, reviewData.text)
    if (!validation.valid) {
      return { success: false, error: 'Invalid review', errors: validation.errors }
    }

    const existing = getUserReviewForProduct(productId, user.userId)
    if (existing) {
      return { success: false, error: 'You have already reviewed this product' }
    }

    const newReview = {
      id: 'rev-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8).toUpperCase(),
      productId,
      userId: user.userId,
      reviewerName: user.name || 'Anonymous',
      rating: Math.min(5, Math.max(1, Number(reviewData.rating))),
      text: typeof reviewData.text === 'string' ? reviewData.text.trim() : '',
      date: new Date().toISOString()
    }

    setReviewsByProduct((prev) => {
      const existingReviews = prev[productId] || []
      return {
        ...prev,
        [productId]: [newReview, ...existingReviews]
      }
    })

    return { success: true, review: newReview }
  }, [user, getUserReviewForProduct])

  const editReview = useCallback((reviewId, productId, updates) => {
    if (!user) {
      return { success: false, error: 'You must be logged in to edit a review' }
    }

    const validation = validateReviewInput(updates.rating, updates.text)
    if (!validation.valid) {
      return { success: false, error: 'Invalid review', errors: validation.errors }
    }

    setReviewsByProduct((prev) => {
      const existingReviews = prev[productId] || []
      const reviewIndex = existingReviews.findIndex(r => r.id === reviewId)
      if (reviewIndex === -1) {
        return prev
      }
      const review = existingReviews[reviewIndex]
      if (review.userId !== user.userId) {
        return prev
      }

      const updated = {
        ...review,
        rating: Math.min(5, Math.max(1, Number(updates.rating))),
        text: typeof updates.text === 'string' ? updates.text.trim() : review.text,
        editedAt: new Date().toISOString()
      }

      const next = [...existingReviews]
      next[reviewIndex] = updated
      return {
        ...prev,
        [productId]: next
      }
    })

    return { success: true }
  }, [user])

  const deleteReview = useCallback((reviewId, productId) => {
    if (!user) {
      return { success: false, error: 'You must be logged in to delete a review' }
    }

    setReviewsByProduct((prev) => {
      const existingReviews = prev[productId] || []
      const review = existingReviews.find(r => r.id === reviewId)
      if (!review || review.userId !== user.userId) {
        return prev
      }

      return {
        ...prev,
        [productId]: existingReviews.filter(r => r.id !== reviewId)
      }
    })

    return { success: true }
  }, [user])

  const getAverageRating = useCallback((productId) => {
    const reviews = reviewsByProduct[productId] || []
    if (reviews.length === 0) return null
    const sum = reviews.reduce((acc, r) => acc + Number(r.rating), 0)
    return sum / reviews.length
  }, [reviewsByProduct])

  const getReviewCount = useCallback((productId) => {
    return (reviewsByProduct[productId] || []).length
  }, [reviewsByProduct])

  const getRatingBreakdown = useCallback((productId) => {
    const reviews = reviewsByProduct[productId] || []
    const breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
    for (const r of reviews) {
      const star = Math.min(5, Math.max(1, Number(r.rating)))
      breakdown[star] = (breakdown[star] || 0) + 1
    }
    return breakdown
  }, [reviewsByProduct])

  const getReadOnlyReviews = useCallback((productId) => {
    if (!productId) return []
    return (reviewsByProduct[productId] || []).map(({ id, productId, reviewerName, rating, text, date, editedAt }) => ({
      id,
      productId,
      reviewerName,
      rating: Number(rating),
      text: typeof text === 'string' ? text : '',
      date,
      editedAt
    }))
  }, [reviewsByProduct])

  const value = {
    getReviewsForProduct,
    getUserReviewForProduct,
    addReview,
    editReview,
    deleteReview,
    getAverageRating,
    getReviewCount,
    getRatingBreakdown,
    getReadOnlyReviews
  }

  return (
    <ReviewContext.Provider value={value}>
      {children}
    </ReviewContext.Provider>
  )
}

export function useReviews() {
  const context = useContext(ReviewContext)
  if (!context) throw new Error('useReviews must be used within a ReviewProvider')
  return context
}

export { validateReviewInput }
