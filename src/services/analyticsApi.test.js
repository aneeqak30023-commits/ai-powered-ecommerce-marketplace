import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  getAnalyticsOverview,
  getAnalyticsSales,
  getAnalyticsProducts,
  getAnalyticsCustomers,
  getAnalyticsOrders,
  getAnalyticsPayments,
  getAnalyticsSupport,
} from '../services/analyticsApi.js'

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

const mockToken = 'analytics-token'

function setAuthToken() {
  localStorageMock.setItem('nexmart-auth', JSON.stringify({ token: mockToken }))
}

describe('analyticsApi', () => {
  beforeEach(() => {
    localStorageMock.clear()
    vi.clearAllMocks()
    global.fetch = vi.fn()
  })

  it('getAnalyticsOverview calls correct endpoint', async () => {
    setAuthToken()
    const mockData = { totalRevenue: 1000, totalOrders: 10, totalCustomers: 5, totalProducts: 20, averageOrderValue: 100, pendingOrders: 2, completedOrders: 7, cancelledOrders: 1 }
    global.fetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve(mockData),
    })

    const result = await getAnalyticsOverview('30d')
    expect(fetch).toHaveBeenCalledWith('http://localhost:3001/api/admin/analytics/overview?range=30d', expect.objectContaining({
      headers: expect.objectContaining({ Authorization: `Bearer ${mockToken}` }),
    }))
    expect(result).toEqual(mockData)
  })

  it('getAnalyticsSales passes range and granularity', async () => {
    setAuthToken()
    const mockData = { data: [], range: '7d' }
    global.fetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve(mockData),
    })

    const result = await getAnalyticsSales('7d', 'day')
    expect(fetch).toHaveBeenCalledWith('http://localhost:3001/api/admin/analytics/sales?range=7d&granularity=day', expect.any(Object))
    expect(result).toEqual(mockData)
  })

  it('getAnalyticsProducts calls correct endpoint', async () => {
    setAuthToken()
    const mockData = { topProducts: [], categories: [], lowStock: [], outOfStock: [] }
    global.fetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve(mockData),
    })

    const result = await getAnalyticsProducts()
    expect(fetch).toHaveBeenCalledWith('http://localhost:3001/api/admin/analytics/products', expect.objectContaining({
      headers: expect.objectContaining({ Authorization: `Bearer ${mockToken}` }),
    }))
    expect(result).toEqual(mockData)
  })

  it('getAnalyticsCustomers passes range', async () => {
    setAuthToken()
    const mockData = { totalCustomers: 5, newCustomersOverTime: [], topCustomers: [] }
    global.fetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve(mockData),
    })

    const result = await getAnalyticsCustomers('90d')
    expect(fetch).toHaveBeenCalledWith('http://localhost:3001/api/admin/analytics/customers?range=90d', expect.any(Object))
    expect(result).toEqual(mockData)
  })

  it('getAnalyticsOrders passes range', async () => {
    setAuthToken()
    const mockData = { byStatus: [], byPaymentMethod: [], overTime: [], cancelledOrders: 0 }
    global.fetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve(mockData),
    })

    const result = await getAnalyticsOrders('all')
    expect(fetch).toHaveBeenCalledWith('http://localhost:3001/api/admin/analytics/orders?range=all', expect.any(Object))
    expect(result).toEqual(mockData)
  })

  it('getAnalyticsPayments passes range', async () => {
    setAuthToken()
    const mockData = { totalAmount: 500, byStatus: [], byMethod: [], byCurrency: [] }
    global.fetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve(mockData),
    })

    const result = await getAnalyticsPayments('30d')
    expect(fetch).toHaveBeenCalledWith('http://localhost:3001/api/admin/analytics/payments?range=30d', expect.any(Object))
    expect(result).toEqual(mockData)
  })

  it('getAnalyticsSupport passes range', async () => {
    setAuthToken()
    const mockData = { totalTickets: 10, openTickets: 3, resolvedTickets: 5, byCategory: [], overTime: [] }
    global.fetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve(mockData),
    })

    const result = await getAnalyticsSupport('30d')
    expect(fetch).toHaveBeenCalledWith('http://localhost:3001/api/admin/analytics/support?range=30d', expect.any(Object))
    expect(result).toEqual(mockData)
  })

  it('throws on network error', async () => {
    setAuthToken()
    global.fetch.mockResolvedValue({
      ok: false,
      status: 500,
      json: () => Promise.resolve({}),
    })

    await expect(getAnalyticsOverview()).rejects.toThrow('Request failed: 500')
  })
})
