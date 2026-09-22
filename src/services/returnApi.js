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

export async function getReturns() {
  const data = await request('/api/returns')
  return data
}

export async function getReturn(id) {
  const data = await request(`/api/returns/${id}`)
  return data
}

export async function getReturnByOrder(orderNumber) {
  const data = await request(`/api/returns/order/${encodeURIComponent(orderNumber)}`)
  return data
}

export async function checkReturnEligibility(orderNumber) {
  const data = await request(`/api/returns/eligibility/${encodeURIComponent(orderNumber)}`)
  return data
}

export async function createReturn(returnData) {
  const data = await request('/api/returns', {
    method: 'POST',
    body: JSON.stringify(returnData),
  })
  return data
}

export function clearReturnsCache() {
}
