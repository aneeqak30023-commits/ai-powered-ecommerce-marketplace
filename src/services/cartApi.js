const API_BASE = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001'

let cartCache = null
let cartCacheTime = 0
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

export async function getCart() {
  const now = Date.now()
  if (cartCache && now - cartCacheTime < CACHE_TTL) {
    return cartCache
  }

  const data = await request('/api/cart')
  cartCache = data
  cartCacheTime = now
  return data
}

export async function addToCart(productId, quantity = 1) {
  const data = await request('/api/cart', {
    method: 'POST',
    body: JSON.stringify({ productId, quantity }),
  })
  cartCache = null
  return data
}

export async function updateCartItem(productId, quantity) {
  const data = await request(`/api/cart/${productId}`, {
    method: 'PATCH',
    body: JSON.stringify({ quantity }),
  })
  cartCache = null
  return data
}

export async function removeFromCart(productId) {
  const data = await request(`/api/cart/${productId}`, {
    method: 'DELETE',
  })
  cartCache = null
  return data
}

export async function clearCart() {
  const data = await request('/api/cart', {
    method: 'DELETE',
  })
  cartCache = null
  return data
}

export function clearCartCache() {
  cartCache = null
  cartCacheTime = 0
}
