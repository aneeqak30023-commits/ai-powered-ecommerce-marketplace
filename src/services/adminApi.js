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

export async function getAdminDashboard() {
  return request('/api/admin/dashboard')
}

export async function getAdminProducts(params = {}) {
  const query = new URLSearchParams()
  if (params.search) query.set('search', params.search)
  if (params.category) query.set('category', params.category)
  if (params.lowStock) query.set('lowStock', 'true')
  const qs = query.toString()
  return request(`/api/admin/products${qs ? `?${qs}` : ''}`)
}

export async function createAdminProduct(productData) {
  return request('/api/admin/products', {
    method: 'POST',
    body: JSON.stringify(productData),
  })
}

export async function updateAdminProduct(id, productData) {
  return request(`/api/admin/products/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(productData),
  })
}

export async function deleteAdminProduct(id) {
  return request(`/api/admin/products/${id}`, {
    method: 'DELETE',
  })
}

export async function getAdminOrders(params = {}) {
  const query = new URLSearchParams()
  if (params.search) query.set('search', params.search)
  if (params.status) query.set('status', params.status)
  if (params.page) query.set('page', params.page)
  if (params.limit) query.set('limit', params.limit)
  const qs = query.toString()
  return request(`/api/admin/orders${qs ? `?${qs}` : ''}`)
}

export async function updateAdminOrderStatus(orderId, status) {
  return request(`/api/admin/orders/${orderId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  })
}

export async function getAdminCustomers(params = {}) {
  const query = new URLSearchParams()
  if (params.search) query.set('search', params.search)
  if (params.page) query.set('page', params.page)
  if (params.limit) query.set('limit', params.limit)
  const qs = query.toString()
  return request(`/api/admin/customers${qs ? `?${qs}` : ''}`)
}

export async function getAdminReviews(params = {}) {
  const query = new URLSearchParams()
  if (params.search) query.set('search', params.search)
  if (params.page) query.set('page', params.page)
  if (params.limit) query.set('limit', params.limit)
  const qs = query.toString()
  return request(`/api/admin/reviews${qs ? `?${qs}` : ''}`)
}

export async function deleteAdminReview(id) {
  return request(`/api/admin/reviews/${id}`, {
    method: 'DELETE',
  })
}

export async function getAdminSupportTickets(params = {}) {
  const query = new URLSearchParams()
  if (params.status) query.set('status', params.status)
  if (params.category) query.set('category', params.category)
  if (params.page) query.set('page', params.page)
  if (params.limit) query.set('limit', params.limit)
  const qs = query.toString()
  return request(`/api/admin/support-tickets${qs ? `?${qs}` : ''}`)
}

export async function updateAdminSupportTicket(ticketId, data) {
  return request(`/api/admin/support-tickets/${ticketId}/status`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
}

export async function getAdminInventory() {
  return request('/api/admin/inventory')
}

export async function getAdminPayments(params = {}) {
  const query = new URLSearchParams()
  if (params.status) query.set('status', params.status)
  if (params.method) query.set('method', params.method)
  if (params.page) query.set('page', params.page)
  if (params.limit) query.set('limit', params.limit)
  const qs = query.toString()
  return request(`/api/admin/payments${qs ? `?${qs}` : ''}`)
}

export async function getAdminReturns(params = {}) {
  const query = new URLSearchParams()
  if (params.status) query.set('status', params.status)
  if (params.reason) query.set('reason', params.reason)
  if (params.search) query.set('search', params.search)
  if (params.page) query.set('page', params.page)
  if (params.limit) query.set('limit', params.limit)
  const qs = query.toString()
  return request(`/api/admin/returns${qs ? `?${qs}` : ''}`)
}

export async function getAdminReturn(id) {
  return request(`/api/admin/returns/${encodeURIComponent(id)}`)
}

export async function updateAdminReturnStatus(id, status, notes) {
  return request(`/api/admin/returns/${encodeURIComponent(id)}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status, notes }),
  })
}

export async function getAdminRefunds(params = {}) {
  const query = new URLSearchParams()
  if (params.status) query.set('status', params.status)
  if (params.method) query.set('method', params.method)
  if (params.search) query.set('search', params.search)
  if (params.page) query.set('page', params.page)
  if (params.limit) query.set('limit', params.limit)
  const qs = query.toString()
  return request(`/api/admin/refunds${qs ? `?${qs}` : ''}`)
}

export async function getAdminRefund(id) {
  return request(`/api/admin/refunds/${encodeURIComponent(id)}`)
}

export async function createAdminRefund(data) {
  return request('/api/admin/refunds', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function updateAdminRefundStatus(id, status, notes) {
  return request(`/api/admin/refunds/${encodeURIComponent(id)}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status, notes }),
  })
}
