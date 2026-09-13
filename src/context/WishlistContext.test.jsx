import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { WishlistProvider, useWishlist } from '../context/WishlistContext.jsx'
import { AuthProvider, useAuth } from '../context/AuthContext.jsx'
import * as wishlistApi from '../services/wishlistApi.js'

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

const mockProduct = {
  id: 1,
  name: 'Test Product',
  price: 10,
  image: 'test.jpg',
  images: ['test.jpg'],
  categoryName: 'Electronics',
  rating: 4.5,
  reviewCount: 10,
  stock: 5,
  specifications: {},
}

const wrapper = ({ children }) => (
  <AuthProvider>
    <WishlistProvider>
      {children}
    </WishlistProvider>
  </AuthProvider>
)

describe('WishlistContext', () => {
  beforeEach(() => {
    localStorageMock.clear()
    vi.clearAllMocks()
    vi.spyOn(wishlistApi, 'getWishlist').mockResolvedValue([])
    vi.spyOn(wishlistApi, 'addToWishlist').mockResolvedValue({ productId: 1 })
    vi.spyOn(wishlistApi, 'removeFromWishlist').mockResolvedValue({})
  })

  it('starts with empty wishlist when no localStorage', async () => {
    vi.spyOn(wishlistApi, 'getWishlist').mockResolvedValue([])

    const { result } = renderHook(() => useWishlist(), { wrapper })
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0))
    })

    expect(result.current.wishlistItems).toEqual([])
    expect(result.current.wishlistCount).toBe(0)
  })

  it('loads from localStorage when backend is unavailable', async () => {
    localStorageMock.setItem('nexmart-wishlist', JSON.stringify([
      { id: 1, name: 'Local Product', price: 5, image: 'local.jpg', categoryName: 'Test', rating: 0, reviewCount: 0, stock: 0, specifications: {} }
    ]))
    vi.spyOn(wishlistApi, 'getWishlist').mockRejectedValue(new Error('Network error'))

    const { result } = renderHook(() => useWishlist(), { wrapper })
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0))
    })

    expect(result.current.wishlistItems).toHaveLength(1)
    expect(result.current.wishlistItems[0].name).toBe('Local Product')
  })

  it('adds item to wishlist', async () => {
    vi.spyOn(wishlistApi, 'getWishlist').mockResolvedValue([])

    const { result } = renderHook(() => useWishlist(), { wrapper })
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0))
    })

    await act(async () => {
      result.current.toggleWishlist(mockProduct)
    })

    expect(result.current.wishlistItems).toHaveLength(1)
    expect(result.current.wishlistItems[0].id).toBe(1)
    expect(result.current.isInWishlist(1)).toBe(true)
  })

  it('removes item from wishlist', async () => {
    vi.spyOn(wishlistApi, 'getWishlist').mockResolvedValue([
      { id: 1, name: 'Test Product', price: 10, image: 'test.jpg', categoryName: 'Electronics', rating: 4.5, reviewCount: 10, stock: 5, specifications: {} }
    ])

    const { result } = renderHook(() => useWishlist(), { wrapper })
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0))
    })

    await act(async () => {
      result.current.removeFromWishlist(1)
    })

    expect(result.current.wishlistItems).toHaveLength(0)
    expect(result.current.isInWishlist(1)).toBe(false)
  })

  it('toggles wishlist correctly', async () => {
    vi.spyOn(wishlistApi, 'getWishlist').mockResolvedValue([])

    const { result } = renderHook(() => useWishlist(), { wrapper })
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0))
    })

    await act(async () => {
      result.current.toggleWishlist(mockProduct)
    })
    expect(result.current.wishlistItems).toHaveLength(1)

    await act(async () => {
      result.current.toggleWishlist(mockProduct)
    })
    expect(result.current.wishlistItems).toHaveLength(0)
  })

  it('clears wishlist', async () => {
    vi.spyOn(wishlistApi, 'getWishlist').mockResolvedValue([
      { id: 1, name: 'Test Product', price: 10, image: 'test.jpg', categoryName: 'Electronics', rating: 4.5, reviewCount: 10, stock: 5, specifications: {} }
    ])

    const { result } = renderHook(() => useWishlist(), { wrapper })
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0))
    })

    await act(async () => {
      result.current.clearWishlist()
    })

    expect(result.current.wishlistItems).toHaveLength(0)
    expect(result.current.wishlistCount).toBe(0)
  })
})
