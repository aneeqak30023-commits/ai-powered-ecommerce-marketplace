import { describe, it, expect, beforeEach, vi } from 'vitest'
import { getPayment, createPayment, pollPayment } from '../services/paymentApi.js'

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

const mockPayment = {
  id: 'payment-uuid-1',
  orderId: 'order-uuid-1',
  userId: 'user-1',
  paymentMethod: 'cash_on_delivery',
  status: 'pending',
  amount: 10.8,
  currency: 'USD',
  provider: null,
  providerReference: null,
  checkoutUrl: null,
  createdAt: '2026-09-10T00:00:00.000Z',
  updatedAt: '2026-09-10T00:00:00.000Z',
}

describe('paymentApi', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    localStorageMock.clear()
  })

  it('fetches payment successfully', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockPayment),
      })
    )

    const result = await getPayment('ORD-ABC123')
    expect(result.id).toBe('payment-uuid-1')
    expect(result.paymentMethod).toBe('cash_on_delivery')
    expect(result.status).toBe('pending')
    expect(result.amount).toBe(10.8)
  })

  it('creates payment successfully', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 201,
        json: () => Promise.resolve(mockPayment),
      })
    )

    const result = await createPayment('ORD-ABC123', 'cash_on_delivery')
    expect(result.paymentMethod).toBe('cash_on_delivery')
    expect(result.status).toBe('pending')
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/payments'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ orderNumber: 'ORD-ABC123', paymentMethod: 'cash_on_delivery' }),
      })
    )
  })

  it('creates online payment with safepay checkout url', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 201,
        json: () => Promise.resolve({
          ...mockPayment,
          paymentMethod: 'online',
          provider: 'safepay',
          status: 'processing',
          checkoutUrl: 'https://sandbox.api.getsafepay.com/checkout/pay?beacon=test&env=sandbox',
        }),
      })
    )

    const result = await createPayment('ORD-ABC123', 'online')
    expect(result.paymentMethod).toBe('online')
    expect(result.provider).toBe('safepay')
    expect(result.status).toBe('processing')
    expect(result.checkoutUrl).toContain('sandbox.api.getsafepay.com')
  })

  it('returns 404 for non-existent order payment', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        status: 404,
        json: () => Promise.resolve({ error: 'Order not found' }),
      })
    )

    await expect(getPayment('ORD-NONEXISTENT')).rejects.toThrow('Order not found')
  })

  it('returns 404 when no payment exists for order', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        status: 404,
        json: () => Promise.resolve({ error: 'Payment not found for this order' }),
      })
    )

    await expect(getPayment('ORD-NOPAYMENT')).rejects.toThrow('Payment not found for this order')
  })

  it('requires authentication for payment creation', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        status: 401,
        json: () => Promise.resolve({ error: 'Authorization required' }),
      })
    )

    await expect(createPayment('ORD-ABC123', 'cash_on_delivery')).rejects.toThrow('Authorization required')
  })

  it('prevents duplicate payment creation', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        status: 409,
        json: () => Promise.resolve({ error: 'Payment already exists for this order' }),
      })
    )

    await expect(createPayment('ORD-ABC123', 'cash_on_delivery')).rejects.toThrow('Payment already exists for this order')
  })

  it('rejects invalid payment methods', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        status: 400,
        json: () => Promise.resolve({ error: 'Payment method must be one of: cash_on_delivery, online' }),
      })
    )

    await expect(createPayment('ORD-ABC123', 'bitcoin')).rejects.toThrow('Payment method must be one of: cash_on_delivery, online')
  })

  it('polls payment until terminal status is reached', async () => {
    const responses = [
      { ok: true, status: 200, json: () => Promise.resolve({ ...mockPayment, status: 'processing' }) },
      { ok: true, status: 200, json: () => Promise.resolve({ ...mockPayment, status: 'paid' }) },
    ]
    let callIndex = 0
    global.fetch = vi.fn(() => {
      const response = responses[callIndex]
      callIndex++
      return Promise.resolve(response)
    })

    const result = await pollPayment('ORD-ABC123', 5, 100)
    expect(result.status).toBe('paid')
    expect(global.fetch).toHaveBeenCalledTimes(2)
  })

  it('polls payment until attempts are exhausted', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ ...mockPayment, status: 'processing' }),
      })
    )

    const result = await pollPayment('ORD-ABC123', 3, 100)
    expect(result).toBeNull()
    expect(global.fetch).toHaveBeenCalledTimes(3)
  })
})
