const API_BASE = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001'

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

export async function getAnalyticsOverview(range = '30d') {
  const params = new URLSearchParams()
  if (range) params.set('range', range)
  const qs = params.toString()
  return request(`/api/admin/analytics/overview${qs ? `?${qs}` : ''}`)
}

export async function getAnalyticsSales(range = '30d', granularity) {
  const params = new URLSearchParams()
  params.set('range', range)
  if (granularity) params.set('granularity', granularity)
  const qs = params.toString()
  return request(`/api/admin/analytics/sales?${qs}`)
}

export async function getAnalyticsProducts() {
  return request('/api/admin/analytics/products')
}

export async function getAnalyticsCustomers(range = '30d') {
  const params = new URLSearchParams()
  if (range) params.set('range', range)
  const qs = params.toString()
  return request(`/api/admin/analytics/customers${qs ? `?${qs}` : ''}`)
}

export async function getAnalyticsOrders(range = '30d') {
  const params = new URLSearchParams()
  if (range) params.set('range', range)
  const qs = params.toString()
  return request(`/api/admin/analytics/orders${qs ? `?${qs}` : ''}`)
}

export async function getAnalyticsPayments(range = '30d') {
  const params = new URLSearchParams()
  if (range) params.set('range', range)
  const qs = params.toString()
  return request(`/api/admin/analytics/payments${qs ? `?${qs}` : ''}`)
}

export async function getAnalyticsSupport(range = '30d') {
  const params = new URLSearchParams()
  if (range) params.set('range', range)
  const qs = params.toString()
  return request(`/api/admin/analytics/support${qs ? `?${qs}` : ''}`)
}

export async function getAnalyticsReturns(range = '30d') {
  const params = new URLSearchParams()
  if (range) params.set('range', range)
  const qs = params.toString()
  return request(`/api/admin/analytics/returns${qs ? `?${qs}` : ''}`)
}

export async function getAnalyticsRefunds(range = '30d') {
  const params = new URLSearchParams()
  if (range) params.set('range', range)
  const qs = params.toString()
  return request(`/api/admin/analytics/refunds${qs ? `?${qs}` : ''}`)
}
