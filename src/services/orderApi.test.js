import { describe, it, expect, beforeEach, vi } from 'vitest'
import { getOrders, getOrder, createOrder, cancelOrder, clearOrdersCache } from '../services/orderApi.js'

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

const mockOrder = {
  id: 'ORD-ABC123',
  orderId: 'uuid-order-1',
  userId: 'user-1',
  status: 'confirmed',
  customer: { name: 'Test User', email: 'test@example.com', phone: '123' },
  shippingAddress: { address: '123 St', city: 'City', state: 'ST', zip: '12345' },
  subtotal: 20,
  shipping: 0,
  tax: 1.6,
  total: 21.6,
  date: '2026-09-10T00:00:00.000Z',
  items: [
    { id: 1, productId: 1, name: 'Product 1', price: 10, quantity: 2, image: 'img.jpg', subtotal: 20 }
  ]
}

describe('orderApi', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    clearOrdersCache()
    localStorageMock.clear()
  })

  it('fetches orders successfully', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve([mockOrder]),
      })
    )

    const result = await getOrders()
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('ORD-ABC123')
  })

  it('fetches single order successfully', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockOrder),
      })
    )

    const result = await getOrder('ORD-ABC123')
    expect(result.id).toBe('ORD-ABC123')
    expect(result.status).toBe('confirmed')
  })

  it('creates order successfully', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 201,
        json: () => Promise.resolve(mockOrder),
      })
    )

    const result = await createOrder({
      items: [{ id: 1, quantity: 2, price: 10 }],
      customer: { name: 'Test', email: 'test@example.com', phone: '123' },
      shippingAddress: { address: '123 St', city: 'City', state: 'ST', zip: '12345' },
      subtotal: 20,
      shipping: 0,
      tax: 1.6,
      total: 21.6,
    })
    expect(result.id).toBe('ORD-ABC123')
  })

  it('cancels order successfully', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ ...mockOrder, status: 'cancelled' }),
      })
    )

    const result = await cancelOrder('ORD-ABC123')
    expect(result.status).toBe('cancelled')
  })

  it('rejects invalid product IDs on create', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        status: 400,
        json: () => Promise.resolve({ error: 'Invalid product IDs' }),
      })
    )

    await expect(createOrder({
      items: [{ id: 'invalid', quantity: 1, price: 10 }],
      customer: { name: 'Test', email: 'test@example.com', phone: '123' },
      shippingAddress: { address: '123 St', city: 'City', state: 'ST', zip: '12345' },
      subtotal: 10,
      shipping: 0,
      tax: 0.8,
      total: 10.8,
    })).rejects.toThrow('Invalid product IDs')
  })

  it('rejects insufficient stock on create', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        status: 400,
        json: () => Promise.resolve({ error: 'Insufficient stock', available: 5, requested: 10 }),
      })
    )

    await expect(createOrder({
      items: [{ id: 1, quantity: 10, price: 10 }],
      customer: { name: 'Test', email: 'test@example.com', phone: '123' },
      shippingAddress: { address: '123 St', city: 'City', state: 'ST', zip: '12345' },
      subtotal: 100,
      shipping: 0,
      tax: 8,
      total: 108,
    })).rejects.toThrow('Insufficient stock')
  })

  it('returns 404 for non-existent order', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        status: 404,
        json: () => Promise.resolve({ error: 'Order not found' }),
      })
    )

    await expect(getOrder('ORD-NONEXISTENT')).rejects.toThrow('Order not found')
  })

  it('returns 400 for non-cancellable order', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        status: 400,
        json: () => Promise.resolve({ error: 'Order cannot be cancelled' }),
      })
    )

    await expect(cancelOrder('ORD-SHIPPED')).rejects.toThrow('cannot be cancelled')
  })

  it('clears cache when orders are modified', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve([mockOrder]),
      })
    )

    await getOrders()
    await createOrder({
      items: [{ id: 1, quantity: 1, price: 10 }],
      customer: { name: 'Test', email: 'test@example.com', phone: '123' },
      shippingAddress: { address: '123 St', city: 'City', state: 'ST', zip: '12345' },
      subtotal: 10,
      shipping: 0,
      tax: 0.8,
      total: 10.8,
    })
    expect(global.fetch).toHaveBeenCalledTimes(2)
  })
})
