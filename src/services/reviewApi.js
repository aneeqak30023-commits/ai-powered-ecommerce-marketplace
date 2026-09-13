const API_BASE = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001'

let reviewsCache = null
let reviewsCacheTime = 0
const CACHE_TTL = 15_000

function getAuthHeaders() {
  try {
    const raw = localStorage.getItem('nexmart-auth')
    if (raw) {
      const parsed = JSON.parse(raw)
      if (parsed?.token) {
        return {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${parsed.token}`,
        }
      }
    }
  } catch {
    // ignore
  }
  return {
    'Content-Type': 'application/json',
  }
}

async function request(url, options = {}) {
  const response = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...(options.headers || {}),
    },
  })

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    const message = data?.error || `Request failed: ${response.status}`
    const error = new Error(message)
    error.status = response.status
    error.body = data
    throw error
  }

  return data
}

export async function getProductReviews(productId) {
  const cacheKey = `reviews-${productId}`
  const now = Date.now()
  if (reviewsCache && reviewsCache[cacheKey] && now - reviewsCacheTime < CACHE_TTL) {
    return reviewsCache[cacheKey]
  }

  const data = await request(`/api/reviews/products/${productId}/reviews`)
  if (!reviewsCache) {
    reviewsCache = {}
  }
  reviewsCache[cacheKey] = data
  reviewsCacheTime = now
  return data
}

export async function createReview(productId, reviewData) {
  const data = await request(`/api/reviews/products/${productId}/reviews`, {
    method: 'POST',
    body: JSON.stringify(reviewData),
  })
  if (!reviewsCache) {
    reviewsCache = {}
  }
  const cacheKey = `reviews-${productId}`
  if (reviewsCache[cacheKey]) {
    reviewsCache[cacheKey] = {
      ...reviewsCache[cacheKey],
      reviews: [data, ...(reviewsCache[cacheKey].reviews || [])],
    }
  }
  return data
}

export async function updateReview(reviewId, updates) {
  const data = await request(`/api/reviews/${encodeURIComponent(reviewId)}`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  })
  return data
}

export async function deleteReview(reviewId) {
  const data = await request(`/api/reviews/${encodeURIComponent(reviewId)}`, {
    method: 'DELETE',
  })
  return data
}

export function clearReviewsCache() {
  reviewsCache = null
  reviewsCacheTime = 0
}
