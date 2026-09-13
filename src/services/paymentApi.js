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

export async function getPayment(orderNumber, tracker) {
  const url = tracker
    ? `/api/payments/${encodeURIComponent(orderNumber)}?tracker=${encodeURIComponent(tracker)}`
    : `/api/payments/${encodeURIComponent(orderNumber)}`
  const data = await request(url)
  return data
}

export async function createPayment(orderNumber, paymentMethod) {
  const data = await request('/api/payments', {
    method: 'POST',
    body: JSON.stringify({ orderNumber, paymentMethod }),
  })
  return data
}

export async function pollPayment(orderNumber, attempts = 10, interval = 2000) {
  for (let i = 0; i < attempts; i++) {
    await new Promise(resolve => setTimeout(resolve, interval))
    try {
      const payment = await getPayment(orderNumber)
      if (['paid', 'failed', 'cancelled'].includes(payment.status)) {
        return payment
      }
    } catch {
      // continue polling
    }
  }
  return null
}
