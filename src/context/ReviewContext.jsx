import { useState, useCallback, useEffect, createContext, useContext } from 'react'
import demoReviews from '../data/reviews.json'

const STORAGE_KEY = 'nexmart-reviews'

function loadReviews() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      return JSON.parse(raw)
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
      if (Object.keys(parsed).length > 0) return parsed
    }
  } catch {
    // ignore
  }
  return JSON.parse(JSON.stringify(demoReviews))
}

function saveReviews(reviews) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reviews))
}

const ReviewContext = createContext(null)

export function ReviewProvider({ children }) {
  const [reviewsByProduct, setReviewsByProduct] = useState(() => loadReviews())

  useEffect(() => {
    saveReviews(reviewsByProduct)
  }, [reviewsByProduct])

  const getReviewsForProduct = useCallback((productId) => {
    return reviewsByProduct[productId] || []
  }, [reviewsByProduct])

  const addReview = useCallback((productId, review) => {
    setReviewsByProduct((prev) => {
      const existing = prev[productId] || []
      const newReview = {
        id: Date.now().toString(),
        productId,
        reviewerName: review.reviewerName || 'Anonymous',
        rating: Math.min(5, Math.max(1, Number(review.rating) || 5)),
        text: review.text || '',
        date: new Date().toISOString()
      }
      return {
        ...prev,
        [productId]: [newReview, ...existing]
      }
    })
  }, [])

  const getAverageRating = useCallback((productId) => {
    const reviews = reviewsByProduct[productId] || []
    if (reviews.length === 0) return null
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0)
    return sum / reviews.length
  }, [reviewsByProduct])

  const getReviewCount = useCallback((productId) => {
    return (reviewsByProduct[productId] || []).length
  }, [reviewsByProduct])

  return (
    <ReviewContext.Provider value={{ getReviewsForProduct, addReview, getAverageRating, getReviewCount }}>
      {children}
    </ReviewContext.Provider>
  )
}

export function useReviews() {
  const context = useContext(ReviewContext)
  if (!context) throw new Error('useReviews must be used within a ReviewProvider')
  return context
}
