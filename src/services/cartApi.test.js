import { describe, it, expect, beforeEach, vi } from 'vitest'
import { getCart, addToCart, updateCartItem, removeFromCart, clearCart, clearCartCache } from '../services/cartApi.js'

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

const mockCartItem = {
  id: 'cart-1',
  productId: 1,
  quantity: 2,
  createdAt: '2026-09-09T00:00:00.000Z',
  updatedAt: '2026-09-09T00:00:00.000Z',
  product: {
    id: 1,
    name: 'Test Product',
    price: 10,
    image: 'test.jpg',
    images: ['test.jpg'],
    stock: 10,
  }
}

describe('cartApi', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    clearCartCache()
    localStorageMock.clear()
  })

  it('fetches cart successfully', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve([mockCartItem]),
      })
    )

    const result = await getCart()
    expect(result).toHaveLength(1)
    expect(result[0].productId).toBe(1)
  })

  it('adds item to cart', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 201,
        json: () => Promise.resolve(mockCartItem),
      })
    )

    const result = await addToCart(1, 2)
    expect(result.productId).toBe(1)
    expect(result.quantity).toBe(2)
  })

  it('updates cart item quantity', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ ...mockCartItem, quantity: 5 }),
      })
    )

    const result = await updateCartItem(1, 5)
    expect(result.quantity).toBe(5)
  })

  it('removes item from cart', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 204,
        json: () => Promise.resolve({}),
      })
    )

    const result = await removeFromCart(1)
    expect(result).toEqual({})
  })

  it('clears cart', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 204,
        json: () => Promise.resolve({}),
      })
    )

    const result = await clearCart()
    expect(result).toEqual({})
  })

  it('rejects invalid product ID on add', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        status: 400,
        json: () => Promise.resolve({ error: 'Invalid product ID' }),
      })
    )

    await expect(addToCart('invalid')).rejects.toThrow('Invalid product ID')
  })

  it('rejects quantity exceeding stock', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        status: 400,
        json: () => Promise.resolve({ error: 'Requested quantity exceeds available stock', available: 5, requested: 10 }),
      })
    )

    await expect(addToCart(1, 10)).rejects.toThrow('exceeds available stock')
  })

  it('rejects non-positive quantity on update', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        status: 400,
        json: () => Promise.resolve({ error: 'Quantity must be a positive integer' }),
      })
    )

    await expect(updateCartItem(1, 0)).rejects.toThrow('positive integer')
  })

  it('returns 404 for missing product on add', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        status: 404,
        json: () => Promise.resolve({ error: 'Product not found' }),
      })
    )

    await expect(addToCart(999)).rejects.toThrow('Product not found')
  })

  it('clears cache when cart is modified', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 201,
        json: () => Promise.resolve(mockCartItem),
      })
    )

    await getCart()
    await addToCart(1, 1)
    expect(global.fetch).toHaveBeenCalledTimes(2)
  })
})
