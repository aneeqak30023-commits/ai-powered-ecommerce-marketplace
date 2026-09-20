const API_BASE = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001'

let ordersCache = null
let ordersCacheTime = 0
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

export async function getOrders(authToken) {
  const now = Date.now()
  if (ordersCache && now - ordersCacheTime < CACHE_TTL) {
    return ordersCache
  }

  const headers = authToken
    ? { Authorization: `Bearer ${authToken}` }
    : {}

  const data = await request('/api/orders', { headers })
  ordersCache = data
  ordersCacheTime = now
  return data
}

export async function getOrder(orderId) {
  const data = await request(`/api/orders/${encodeURIComponent(orderId)}`)
  return data
}

export async function createOrder(orderData) {
  const data = await request('/api/orders', {
    method: 'POST',
    body: JSON.stringify(orderData),
  })
  ordersCache = null
  return data
}

export async function cancelOrder(orderId) {
  const data = await request(`/api/orders/${encodeURIComponent(orderId)}/cancel`, {
    method: 'PATCH',
  })
  ordersCache = null
  return data
}

export function clearOrdersCache() {
  ordersCache = null
  ordersCacheTime = 0
}
