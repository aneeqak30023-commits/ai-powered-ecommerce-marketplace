import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { CartProvider, useCart } from '../context/CartContext.jsx'
import * as cartApi from '../services/cartApi.js'

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

vi.mock('../context/InventoryContext.jsx', () => ({
  useInventory: () => ({
    canAddToCart: () => ({ allowed: true, available: 100 }),
  })
}))

vi.mock('../context/AuthContext.jsx', () => ({
  useAuth: () => ({
    user: { userId: 'usr-cart', email: 'cart@example.com', name: 'Cart User' },
    loading: false,
    isAuthenticated: true,
    backendAvailable: true,
  })
}))

const mockProduct = {
  id: 1,
  name: 'Test Product',
  price: 10,
  image: 'test.jpg',
  images: ['test.jpg'],
}

const wrapper = ({ children }) => (
  <CartProvider>
    {children}
  </CartProvider>
)

describe('CartContext', () => {
  beforeEach(() => {
    localStorageMock.clear()
    vi.clearAllMocks()
    vi.spyOn(cartApi, 'getCart').mockResolvedValue([
      { productId: 1, quantity: 2, product: { id: 1, name: 'Test Product', price: 10, image: 'test.jpg', images: ['test.jpg'], stock: 10 } },
      { productId: 2, quantity: 1, product: { id: 2, name: 'Product 2', price: 5, image: '2.jpg', images: ['2.jpg'], stock: 10 } },
    ])
    vi.spyOn(cartApi, 'addToCart').mockResolvedValue({ productId: 1, quantity: 1 })
    vi.spyOn(cartApi, 'updateCartItem').mockResolvedValue({ productId: 1, quantity: 2 })
    vi.spyOn(cartApi, 'removeFromCart').mockResolvedValue({})
    vi.spyOn(cartApi, 'clearCart').mockResolvedValue({})
  })

  it('starts with empty cart when no localStorage', async () => {
    vi.spyOn(cartApi, 'getCart').mockResolvedValue([])

    const { result } = renderHook(() => useCart(), { wrapper })
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0))
    })

    expect(result.current.cartItems).toEqual([])
    expect(result.current.cartCount).toBe(0)
    expect(result.current.cartTotal).toBe(0)
  })

  it('loads from localStorage when backend is unavailable', async () => {
    localStorageMock.setItem('nexmart-cart', JSON.stringify([
      { id: 1, name: 'Local Product', price: 5, image: 'local.jpg', quantity: 2 }
    ]))
    vi.spyOn(cartApi, 'getCart').mockRejectedValue(new Error('Network error'))

    const { result } = renderHook(() => useCart(), { wrapper })
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0))
    })

    expect(result.current.cartItems).toHaveLength(1)
    expect(result.current.cartItems[0].name).toBe('Local Product')
  })

  it('adds item to cart', async () => {
    vi.spyOn(cartApi, 'getCart').mockResolvedValue([])

    const { result } = renderHook(() => useCart(), { wrapper })
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0))
    })

    await act(async () => {
      const res = result.current.addToCart(mockProduct, 1)
      expect(res.success).toBe(true)
    })

    expect(result.current.cartItems).toHaveLength(1)
    expect(result.current.cartItems[0].id).toBe(1)
    expect(result.current.cartCount).toBe(1)
  })

  it('removes item from cart', async () => {
    vi.spyOn(cartApi, 'getCart').mockResolvedValue([
      { productId: 1, quantity: 1, product: { id: 1, name: 'Test Product', price: 10, image: 'test.jpg', images: ['test.jpg'], stock: 10 } }
    ])

    const { result } = renderHook(() => useCart(), { wrapper })
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0))
    })

    await act(async () => {
      result.current.removeFromCart(1)
    })

    expect(result.current.cartItems).toHaveLength(0)
  })

  it('updates quantity', async () => {
    vi.spyOn(cartApi, 'getCart').mockResolvedValue([
      { productId: 1, quantity: 1, product: { id: 1, name: 'Test Product', price: 10, image: 'test.jpg', images: ['test.jpg'], stock: 10 } }
    ])

    const { result } = renderHook(() => useCart(), { wrapper })
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0))
    })

    await act(async () => {
      const res = result.current.updateQuantity(1, 5)
      expect(res.success).toBe(true)
    })

    expect(result.current.cartItems[0].quantity).toBe(5)
    expect(result.current.cartTotal).toBe(50)
  })

  it('clears cart', async () => {
    vi.spyOn(cartApi, 'getCart').mockResolvedValue([
      { productId: 1, quantity: 1, product: { id: 1, name: 'Test Product', price: 10, image: 'test.jpg', images: ['test.jpg'], stock: 10 } }
    ])

    const { result } = renderHook(() => useCart(), { wrapper })
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0))
    })

    await act(async () => {
      result.current.clearCart()
    })

    expect(result.current.cartItems).toHaveLength(0)
  })

  it('calculates cart count and total correctly', async () => {
    vi.spyOn(cartApi, 'getCart').mockResolvedValue([
      { productId: 1, quantity: 2, product: { id: 1, name: 'Product 1', price: 10, image: '1.jpg', images: ['1.jpg'], stock: 10 } },
      { productId: 2, quantity: 1, product: { id: 2, name: 'Product 2', price: 5, image: '2.jpg', images: ['2.jpg'], stock: 10 } },
    ])

    const { result } = renderHook(() => useCart(), { wrapper })
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0))
    })

    expect(result.current.cartCount).toBe(3)
    expect(result.current.cartTotal).toBe(25)
  })
})
