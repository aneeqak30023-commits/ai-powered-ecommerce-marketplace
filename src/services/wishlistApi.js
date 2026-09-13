const API_BASE = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001'

let wishlistCache = null
let wishlistCacheTime = 0
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

export async function getWishlist() {
  const now = Date.now()
  if (wishlistCache && now - wishlistCacheTime < CACHE_TTL) {
    return wishlistCache
  }

  const data = await request('/api/wishlist')
  wishlistCache = data
  wishlistCacheTime = now
  return data
}

export async function addToWishlist(productId) {
  const data = await request(`/api/wishlist/${productId}`, {
    method: 'POST',
  })
  wishlistCache = null
  return data
}

export async function removeFromWishlist(productId) {
  const data = await request(`/api/wishlist/${productId}`, {
    method: 'DELETE',
  })
  wishlistCache = null
  return data
}

export function clearWishlistCache() {
  wishlistCache = null
  wishlistCacheTime = 0
}
