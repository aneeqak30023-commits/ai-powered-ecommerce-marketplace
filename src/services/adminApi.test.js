import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getAdminDashboard, getAdminProducts, createAdminProduct, updateAdminProduct, deleteAdminProduct, getAdminOrders, updateAdminOrderStatus, getAdminCustomers, getAdminReviews, deleteAdminReview, getAdminSupportTickets, updateAdminSupportTicket, getAdminInventory, getAdminPayments } from '../services/adminApi.js'

const localStorageMock = (() => {
  let store = {}
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => { store[key] = String(value) },
    removeItem: (key) => { delete store[key] },
    clear: () => { store = {} }
  }
})()

Object.defineProperty(window, 'localStorage', { value: localStorageMock })

const mockToken = 'admin-token'

function setAuthToken() {
  localStorageMock.setItem('nexmart-auth', JSON.stringify({ token: mockToken }))
}

describe('adminApi', () => {
  beforeEach(() => {
    localStorageMock.clear()
    vi.clearAllMocks()
    global.fetch = vi.fn()
  })

  it('getAdminDashboard calls correct endpoint', async () => {
    setAuthToken()
    const mockData = { stats: { totalOrders: 10, totalCustomers: 5, totalProducts: 20, totalRevenue: 1000, pendingOrders: 2, lowStockCount: 1, openTickets: 3 }, recentOrders: [] }
    global.fetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve(mockData),
    })

    const result = await getAdminDashboard()
    expect(fetch).toHaveBeenCalledWith('http://localhost:3001/api/admin/dashboard', expect.objectContaining({
      headers: expect.objectContaining({ Authorization: `Bearer ${mockToken}` }),
    }))
    expect(result).toEqual(mockData)
  })

  it('getAdminProducts passes search params', async () => {
    setAuthToken()
    const mockData = [{ id: 1, name: 'Test Product' }]
    global.fetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve(mockData),
    })

    const result = await getAdminProducts({ search: 'test', lowStock: true })
    expect(fetch).toHaveBeenCalledWith('http://localhost:3001/api/admin/products?search=test&lowStock=true', expect.any(Object))
    expect(result).toEqual(mockData)
  })

  it('createAdminProduct sends POST with body', async () => {
    setAuthToken()
    const mockData = { id: 1, name: 'New Product' }
    global.fetch.mockResolvedValue({
      ok: true,
      status: 201,
      json: () => Promise.resolve(mockData),
    })

    const result = await createAdminProduct({ name: 'New Product', price: 10 })
    expect(fetch).toHaveBeenCalledWith('http://localhost:3001/api/admin/products', {
      method: 'POST',
      headers: { Authorization: `Bearer ${mockToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'New Product', price: 10 }),
    })
    expect(result).toEqual(mockData)
  })

  it('updateAdminProduct sends PATCH with body', async () => {
    setAuthToken()
    const mockData = { id: 1, name: 'Updated Product' }
    global.fetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve(mockData),
    })

    const result = await updateAdminProduct(1, { name: 'Updated Product' })
    expect(fetch).toHaveBeenCalledWith('http://localhost:3001/api/admin/products/1', {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${mockToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Updated Product' }),
    })
    expect(result).toEqual(mockData)
  })

  it('deleteAdminProduct sends DELETE', async () => {
    setAuthToken()
    global.fetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ success: true }),
    })

    await deleteAdminProduct(1)
    expect(fetch).toHaveBeenCalledWith('http://localhost:3001/api/admin/products/1', {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${mockToken}`, 'Content-Type': 'application/json' },
    })
  })

  it('getAdminOrders passes status filter', async () => {
    setAuthToken()
    const mockData = { orders: [], pagination: { total: 0 } }
    global.fetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve(mockData),
    })

    const result = await getAdminOrders({ status: 'pending' })
    expect(fetch).toHaveBeenCalledWith('http://localhost:3001/api/admin/orders?status=pending', expect.any(Object))
    expect(result).toEqual(mockData)
  })

  it('updateAdminOrderStatus sends PATCH', async () => {
    setAuthToken()
    const mockData = { id: 'ORD-123', status: 'shipped' }
    global.fetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve(mockData),
    })

    const result = await updateAdminOrderStatus('ORD-123', 'shipped')
    expect(fetch).toHaveBeenCalledWith('http://localhost:3001/api/admin/orders/ORD-123/status', {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${mockToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'shipped' }),
    })
    expect(result).toEqual(mockData)
  })

  it('getAdminCustomers passes search param', async () => {
    setAuthToken()
    const mockData = { customers: [], pagination: { total: 0 } }
    global.fetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve(mockData),
    })

    const result = await getAdminCustomers({ search: 'john' })
    expect(fetch).toHaveBeenCalledWith('http://localhost:3001/api/admin/customers?search=john', expect.any(Object))
    expect(result).toEqual(mockData)
  })

  it('getAdminReviews passes search param', async () => {
    setAuthToken()
    const mockData = { reviews: [], pagination: { total: 0 } }
    global.fetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve(mockData),
    })

    const result = await getAdminReviews({ search: 'great' })
    expect(fetch).toHaveBeenCalledWith('http://localhost:3001/api/admin/reviews?search=great', expect.any(Object))
    expect(result).toEqual(mockData)
  })

  it('deleteAdminReview sends DELETE', async () => {
    setAuthToken()
    global.fetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ success: true }),
    })

    await deleteAdminReview('review-1')
    expect(fetch).toHaveBeenCalledWith('http://localhost:3001/api/admin/reviews/review-1', {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${mockToken}`, 'Content-Type': 'application/json' },
    })
  })

  it('getAdminSupportTickets passes status filter', async () => {
    setAuthToken()
    const mockData = { tickets: [], pagination: { total: 0 } }
    global.fetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve(mockData),
    })

    const result = await getAdminSupportTickets({ status: 'open' })
    expect(fetch).toHaveBeenCalledWith('http://localhost:3001/api/admin/support-tickets?status=open', expect.any(Object))
    expect(result).toEqual(mockData)
  })

  it('updateAdminSupportTicket sends PATCH', async () => {
    setAuthToken()
    const mockData = { id: 'ticket-1', status: 'resolved' }
    global.fetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve(mockData),
    })

    const result = await updateAdminSupportTicket('ticket-1', { status: 'resolved' })
    expect(fetch).toHaveBeenCalledWith('http://localhost:3001/api/admin/support-tickets/ticket-1/status', {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${mockToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'resolved' }),
    })
    expect(result).toEqual(mockData)
  })

  it('getAdminInventory calls correct endpoint', async () => {
    setAuthToken()
    const mockData = [{ productId: 1, stock: 5, isLowStock: true }]
    global.fetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve(mockData),
    })

    const result = await getAdminInventory()
    expect(fetch).toHaveBeenCalledWith('http://localhost:3001/api/admin/inventory', expect.objectContaining({
      headers: expect.objectContaining({ Authorization: `Bearer ${mockToken}` }),
    }))
    expect(result).toEqual(mockData)
  })

  it('getAdminPayments passes filters', async () => {
    setAuthToken()
    const mockData = { payments: [], pagination: { total: 0 } }
    global.fetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve(mockData),
    })

    const result = await getAdminPayments({ status: 'paid', method: 'online' })
    expect(fetch).toHaveBeenCalledWith('http://localhost:3001/api/admin/payments?status=paid&method=online', expect.any(Object))
    expect(result).toEqual(mockData)
  })

  it('throws on network error', async () => {
    setAuthToken()
    global.fetch.mockResolvedValue({
      ok: false,
      status: 500,
      json: () => Promise.resolve({}),
    })

    await expect(getAdminDashboard()).rejects.toThrow('Request failed: 500')
  })
})
