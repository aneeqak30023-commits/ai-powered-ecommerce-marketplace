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

export async function getSupportTickets({ status, category, page = 1, limit = 20 } = {}) {
  const params = new URLSearchParams()
  if (status) params.set('status', status)
  if (category) params.set('category', category)
  params.set('page', String(page))
  params.set('limit', String(limit))

  const data = await request(`/api/support/tickets?${params.toString()}`)
  return data
}

export async function getSupportTicket(ticketId) {
  const data = await request(`/api/support/tickets/${encodeURIComponent(ticketId)}`)
  return data
}

export async function createSupportTicket({ subject, message, category, priority, orderId, productId }) {
  const data = await request('/api/support/tickets', {
    method: 'POST',
    body: JSON.stringify({ subject, message, category, priority, orderId, productId }),
  })
  return data
}

export async function addSupportTicketMessage(ticketId, message, sender = 'customer') {
  const data = await request(`/api/support/tickets/${encodeURIComponent(ticketId)}/messages`, {
    method: 'POST',
    body: JSON.stringify({ message, sender }),
  })
  return data
}
