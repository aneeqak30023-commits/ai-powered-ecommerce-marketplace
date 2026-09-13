import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { InventoryProvider, useInventory, STOCK_STATES, LOW_STOCK_THRESHOLD } from '../context/InventoryContext.jsx'
import * as inventoryApi from '../services/inventoryApi.js'
import * as productApi from '../services/productApi.js'

// Mock localStorage
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

const mockInventory = {
  1: { quantity: 10, lastUpdated: '2026-09-09T12:00:00.000Z' },
  2: { quantity: 3, lastUpdated: '2026-09-09T12:00:00.000Z' },
  3: { quantity: 0, lastUpdated: '2026-09-09T12:00:00.000Z' },
  4: { quantity: 1, lastUpdated: '2026-09-09T12:00:00.000Z' },
}

const mockProducts = [
  { id: 1, name: 'Product 1', price: 10, stock: 10 },
  { id: 2, name: 'Product 2', price: 20, stock: 3 },
  { id: 3, name: 'Product 3', price: 30, stock: 0 },
  { id: 4, name: 'Product 4', price: 40, stock: 1 }
]

const wrapper = ({ children }) => <InventoryProvider>{children}</InventoryProvider>

describe('InventoryContext', () => {
  beforeEach(() => {
    localStorageMock.clear()
    vi.clearAllMocks()
  })

  describe('initialization', () => {
    it('initializes inventory from backend API', async () => {
      vi.spyOn(inventoryApi, 'fetchInventory').mockResolvedValue(
        Object.entries(mockInventory).map(([productId, data]) => ({
          productId: Number(productId),
          stock: data.quantity,
          lowStockThreshold: 5,
          updatedAt: data.lastUpdated,
          product: { id: Number(productId), name: `Product ${productId}`, categoryId: 'electronics' }
        }))
      )

      const { result } = renderHook(() => useInventory(), { wrapper })
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0))
      })

      expect(result.current.getStock(1)).toBe(10)
      expect(result.current.getStock(2)).toBe(3)
      expect(result.current.getStock(3)).toBe(0)
      expect(result.current.getStock(4)).toBe(1)
    })

    it('falls back to localStorage when backend is unavailable', async () => {
      vi.spyOn(inventoryApi, 'fetchInventory').mockRejectedValue(new Error('Network error'))
      localStorageMock.setItem('nexmart-inventory', JSON.stringify({
        1: { quantity: 5, lastUpdated: new Date().toISOString() }
      }))

      const { result } = renderHook(() => useInventory(), { wrapper })
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0))
      })

      expect(result.current.getStock(1)).toBe(5)
    })

    it('falls back to products when backend and localStorage are unavailable', async () => {
      vi.spyOn(inventoryApi, 'fetchInventory').mockRejectedValue(new Error('Network error'))
      vi.spyOn(productApi, 'fetchProducts').mockResolvedValue(mockProducts)

      const { result } = renderHook(() => useInventory(), { wrapper })
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0))
      })

      expect(result.current.getStock(1)).toBe(10)
      expect(result.current.getStock(2)).toBe(3)
    })

    it('defaults missing product stock to 0', async () => {
      vi.spyOn(inventoryApi, 'fetchInventory').mockResolvedValue(
        Object.entries(mockInventory).map(([productId, data]) => ({
          productId: Number(productId),
          stock: data.quantity,
          lowStockThreshold: 5,
          updatedAt: data.lastUpdated,
          product: { id: Number(productId), name: `Product ${productId}`, categoryId: 'electronics' }
        }))
      )

      const { result } = renderHook(() => useInventory(), { wrapper })
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0))
      })

      expect(result.current.getStock(999)).toBe(0)
    })
  })

  describe('stock states', () => {
    it('correctly identifies in_stock', async () => {
      vi.spyOn(inventoryApi, 'fetchInventory').mockResolvedValue(
        Object.entries(mockInventory).map(([productId, data]) => ({
          productId: Number(productId),
          stock: data.quantity,
          lowStockThreshold: 5,
          updatedAt: data.lastUpdated,
          product: { id: Number(productId), name: `Product ${productId}`, categoryId: 'electronics' }
        }))
      )

      const { result } = renderHook(() => useInventory(), { wrapper })
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0))
      })

      expect(result.current.getStockStateForProduct(1)).toBe(STOCK_STATES.IN_STOCK)
    })

    it('correctly identifies low_stock', async () => {
      vi.spyOn(inventoryApi, 'fetchInventory').mockResolvedValue(
        Object.entries(mockInventory).map(([productId, data]) => ({
          productId: Number(productId),
          stock: data.quantity,
          lowStockThreshold: 5,
          updatedAt: data.lastUpdated,
          product: { id: Number(productId), name: `Product ${productId}`, categoryId: 'electronics' }
        }))
      )

      const { result } = renderHook(() => useInventory(), { wrapper })
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0))
      })

      expect(result.current.getStockStateForProduct(2)).toBe(STOCK_STATES.LOW_STOCK)
    })

    it('correctly identifies out_of_stock', async () => {
      vi.spyOn(inventoryApi, 'fetchInventory').mockResolvedValue(
        Object.entries(mockInventory).map(([productId, data]) => ({
          productId: Number(productId),
          stock: data.quantity,
          lowStockThreshold: 5,
          updatedAt: data.lastUpdated,
          product: { id: Number(productId), name: `Product ${productId}`, categoryId: 'electronics' }
        }))
      )

      const { result } = renderHook(() => useInventory(), { wrapper })
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0))
      })

      expect(result.current.getStockStateForProduct(3)).toBe(STOCK_STATES.OUT_OF_STOCK)
    })

    it('uses consistent low stock threshold', async () => {
      vi.spyOn(inventoryApi, 'fetchInventory').mockResolvedValue(
        Object.entries(mockInventory).map(([productId, data]) => ({
          productId: Number(productId),
          stock: data.quantity,
          lowStockThreshold: 5,
          updatedAt: data.lastUpdated,
          product: { id: Number(productId), name: `Product ${productId}`, categoryId: 'electronics' }
        }))
      )

      const { result } = renderHook(() => useInventory(), { wrapper })
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0))
      })

      expect(LOW_STOCK_THRESHOLD).toBe(5)
      expect(result.current.getStock(2)).toBeLessThanOrEqual(LOW_STOCK_THRESHOLD)
    })
  })

  describe('stock availability checks', () => {
    it('allows adding items when stock is sufficient', async () => {
      vi.spyOn(inventoryApi, 'fetchInventory').mockResolvedValue(
        Object.entries(mockInventory).map(([productId, data]) => ({
          productId: Number(productId),
          stock: data.quantity,
          lowStockThreshold: 5,
          updatedAt: data.lastUpdated,
          product: { id: Number(productId), name: `Product ${productId}`, categoryId: 'electronics' }
        }))
      )

      const { result } = renderHook(() => useInventory(), { wrapper })
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0))
      })

      const check = result.current.canAddToCart(1, 5)
      expect(check.allowed).toBe(true)
      expect(check.available).toBe(10)
    })

    it('blocks adding out-of-stock items', async () => {
      vi.spyOn(inventoryApi, 'fetchInventory').mockResolvedValue(
        Object.entries(mockInventory).map(([productId, data]) => ({
          productId: Number(productId),
          stock: data.quantity,
          lowStockThreshold: 5,
          updatedAt: data.lastUpdated,
          product: { id: Number(productId), name: `Product ${productId}`, categoryId: 'electronics' }
        }))
      )

      const { result } = renderHook(() => useInventory(), { wrapper })
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0))
      })

      const check = result.current.canAddToCart(3, 1)
      expect(check.allowed).toBe(false)
      expect(check.reason).toBe('out_of_stock')
    })

    it('blocks adding more than available stock', async () => {
      vi.spyOn(inventoryApi, 'fetchInventory').mockResolvedValue(
        Object.entries(mockInventory).map(([productId, data]) => ({
          productId: Number(productId),
          stock: data.quantity,
          lowStockThreshold: 5,
          updatedAt: data.lastUpdated,
          product: { id: Number(productId), name: `Product ${productId}`, categoryId: 'electronics' }
        }))
      )

      const { result } = renderHook(() => useInventory(), { wrapper })
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0))
      })

      const check = result.current.canAddToCart(2, 5)
      expect(check.allowed).toBe(false)
      expect(check.reason).toBe('insufficient_stock')
      expect(check.available).toBe(3)
    })

    it('allows adding exactly available stock', async () => {
      vi.spyOn(inventoryApi, 'fetchInventory').mockResolvedValue(
        Object.entries(mockInventory).map(([productId, data]) => ({
          productId: Number(productId),
          stock: data.quantity,
          lowStockThreshold: 5,
          updatedAt: data.lastUpdated,
          product: { id: Number(productId), name: `Product ${productId}`, categoryId: 'electronics' }
        }))
      )

      const { result } = renderHook(() => useInventory(), { wrapper })
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0))
      })

      const check = result.current.canAddToCart(2, 3)
      expect(check.allowed).toBe(true)
      expect(check.available).toBe(3)
    })

    it('allows adding one item when one remains', async () => {
      vi.spyOn(inventoryApi, 'fetchInventory').mockResolvedValue(
        Object.entries(mockInventory).map(([productId, data]) => ({
          productId: Number(productId),
          stock: data.quantity,
          lowStockThreshold: 5,
          updatedAt: data.lastUpdated,
          product: { id: Number(productId), name: `Product ${productId}`, categoryId: 'electronics' }
        }))
      )

      const { result } = renderHook(() => useInventory(), { wrapper })
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0))
      })

      const check = result.current.canAddToCart(4, 1)
      expect(check.allowed).toBe(true)
      expect(check.available).toBe(1)
    })
  })

  describe('stock modifications', () => {
    it('decreases stock correctly', async () => {
      vi.spyOn(inventoryApi, 'fetchInventory').mockResolvedValue(
        Object.entries(mockInventory).map(([productId, data]) => ({
          productId: Number(productId),
          stock: data.quantity,
          lowStockThreshold: 5,
          updatedAt: data.lastUpdated,
          product: { id: Number(productId), name: `Product ${productId}`, categoryId: 'electronics' }
        }))
      )

      const { result } = renderHook(() => useInventory(), { wrapper })
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0))
      })

      act(() => {
        result.current.decreaseStock(1, 3)
      })
      expect(result.current.getStock(1)).toBe(7)
    })

    it('increases stock correctly', async () => {
      vi.spyOn(inventoryApi, 'fetchInventory').mockResolvedValue(
        Object.entries(mockInventory).map(([productId, data]) => ({
          productId: Number(productId),
          stock: data.quantity,
          lowStockThreshold: 5,
          updatedAt: data.lastUpdated,
          product: { id: Number(productId), name: `Product ${productId}`, categoryId: 'electronics' }
        }))
      )

      const { result } = renderHook(() => useInventory(), { wrapper })
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0))
      })

      act(() => {
        result.current.decreaseStock(1, 3)
        result.current.increaseStock(1, 2)
      })
      expect(result.current.getStock(1)).toBe(9)
    })

    it('prevents negative stock', async () => {
      vi.spyOn(inventoryApi, 'fetchInventory').mockResolvedValue(
        Object.entries(mockInventory).map(([productId, data]) => ({
          productId: Number(productId),
          stock: data.quantity,
          lowStockThreshold: 5,
          updatedAt: data.lastUpdated,
          product: { id: Number(productId), name: `Product ${productId}`, categoryId: 'electronics' }
        }))
      )

      const { result } = renderHook(() => useInventory(), { wrapper })
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0))
      })

      act(() => {
        result.current.decreaseStock(3, 10)
      })
      expect(result.current.getStock(3)).toBe(0)
    })

    it('sets stock to a specific value', async () => {
      vi.spyOn(inventoryApi, 'fetchInventory').mockResolvedValue(
        Object.entries(mockInventory).map(([productId, data]) => ({
          productId: Number(productId),
          stock: data.quantity,
          lowStockThreshold: 5,
          updatedAt: data.lastUpdated,
          product: { id: Number(productId), name: `Product ${productId}`, categoryId: 'electronics' }
        }))
      )

      const { result } = renderHook(() => useInventory(), { wrapper })
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0))
      })

      act(() => {
        result.current.setStock(1, 50)
      })
      expect(result.current.getStock(1)).toBe(50)
    })

    it('prevents setting negative stock', async () => {
      vi.spyOn(inventoryApi, 'fetchInventory').mockResolvedValue(
        Object.entries(mockInventory).map(([productId, data]) => ({
          productId: Number(productId),
          stock: data.quantity,
          lowStockThreshold: 5,
          updatedAt: data.lastUpdated,
          product: { id: Number(productId), name: `Product ${productId}`, categoryId: 'electronics' }
        }))
      )

      const { result } = renderHook(() => useInventory(), { wrapper })
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0))
      })

      act(() => {
        result.current.setStock(1, -5)
      })
      expect(result.current.getStock(1)).toBe(0)
    })
  })

  describe('bulk operations', () => {
    it('decreases stock for multiple products', async () => {
      vi.spyOn(inventoryApi, 'fetchInventory').mockResolvedValue(
        Object.entries(mockInventory).map(([productId, data]) => ({
          productId: Number(productId),
          stock: data.quantity,
          lowStockThreshold: 5,
          updatedAt: data.lastUpdated,
          product: { id: Number(productId), name: `Product ${productId}`, categoryId: 'electronics' }
        }))
      )

      const { result } = renderHook(() => useInventory(), { wrapper })
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0))
      })

      act(() => {
        result.current.bulkDecreaseStock([
          { id: 1, quantity: 2 },
          { id: 2, quantity: 1 }
        ])
      })
      expect(result.current.getStock(1)).toBe(8)
      expect(result.current.getStock(2)).toBe(2)
    })

    it('increases stock for multiple products', async () => {
      vi.spyOn(inventoryApi, 'fetchInventory').mockResolvedValue(
        Object.entries(mockInventory).map(([productId, data]) => ({
          productId: Number(productId),
          stock: data.quantity,
          lowStockThreshold: 5,
          updatedAt: data.lastUpdated,
          product: { id: Number(productId), name: `Product ${productId}`, categoryId: 'electronics' }
        }))
      )

      const { result } = renderHook(() => useInventory(), { wrapper })
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0))
      })

      act(() => {
        result.current.bulkDecreaseStock([
          { id: 1, quantity: 2 },
          { id: 2, quantity: 1 }
        ])
        result.current.bulkIncreaseStock([
          { id: 1, quantity: 1 },
          { id: 2, quantity: 2 }
        ])
      })
      expect(result.current.getStock(1)).toBe(9)
      expect(result.current.getStock(2)).toBe(4)
    })

    it('prevents negative stock in bulk operations', async () => {
      vi.spyOn(inventoryApi, 'fetchInventory').mockResolvedValue(
        Object.entries(mockInventory).map(([productId, data]) => ({
          productId: Number(productId),
          stock: data.quantity,
          lowStockThreshold: 5,
          updatedAt: data.lastUpdated,
          product: { id: Number(productId), name: `Product ${productId}`, categoryId: 'electronics' }
        }))
      )

      const { result } = renderHook(() => useInventory(), { wrapper })
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0))
      })

      act(() => {
        result.current.bulkDecreaseStock([
          { id: 3, quantity: 5 },
          { id: 4, quantity: 10 }
        ])
      })
      expect(result.current.getStock(3)).toBe(0)
      expect(result.current.getStock(4)).toBe(0)
    })
  })

  describe('cart validation', () => {
    it('validates cart with no issues', async () => {
      vi.spyOn(inventoryApi, 'fetchInventory').mockResolvedValue(
        Object.entries(mockInventory).map(([productId, data]) => ({
          productId: Number(productId),
          stock: data.quantity,
          lowStockThreshold: 5,
          updatedAt: data.lastUpdated,
          product: { id: Number(productId), name: `Product ${productId}`, categoryId: 'electronics' }
        }))
      )

      const { result } = renderHook(() => useInventory(), { wrapper })
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0))
      })

      const issues = result.current.validateCartStock([
        { id: 1, quantity: 5 },
        { id: 2, quantity: 2 }
      ])
      expect(issues).toHaveLength(0)
    })

    it('detects out-of-stock items in cart', async () => {
      vi.spyOn(inventoryApi, 'fetchInventory').mockResolvedValue(
        Object.entries(mockInventory).map(([productId, data]) => ({
          productId: Number(productId),
          stock: data.quantity,
          lowStockThreshold: 5,
          updatedAt: data.lastUpdated,
          product: { id: Number(productId), name: `Product ${productId}`, categoryId: 'electronics' }
        }))
      )

      const { result } = renderHook(() => useInventory(), { wrapper })
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0))
      })

      const issues = result.current.validateCartStock([
        { id: 3, quantity: 1 }
      ])
      expect(issues).toHaveLength(1)
      expect(issues[0].reason).toBe('out_of_stock')
    })

    it('detects insufficient stock in cart', async () => {
      vi.spyOn(inventoryApi, 'fetchInventory').mockResolvedValue(
        Object.entries(mockInventory).map(([productId, data]) => ({
          productId: Number(productId),
          stock: data.quantity,
          lowStockThreshold: 5,
          updatedAt: data.lastUpdated,
          product: { id: Number(productId), name: `Product ${productId}`, categoryId: 'electronics' }
        }))
      )

      const { result } = renderHook(() => useInventory(), { wrapper })
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0))
      })

      const issues = result.current.validateCartStock([
        { id: 2, quantity: 5 }
      ])
      expect(issues).toHaveLength(1)
      expect(issues[0].reason).toBe('insufficient_stock')
      expect(issues[0].available).toBe(3)
    })
  })

  describe('persistence', () => {
    it('persists inventory to localStorage', async () => {
      vi.spyOn(inventoryApi, 'fetchInventory').mockResolvedValue(
        Object.entries(mockInventory).map(([productId, data]) => ({
          productId: Number(productId),
          stock: data.quantity,
          lowStockThreshold: 5,
          updatedAt: data.lastUpdated,
          product: { id: Number(productId), name: `Product ${productId}`, categoryId: 'electronics' }
        }))
      )

      const { result } = renderHook(() => useInventory(), { wrapper })
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0))
      })

      act(() => {
        result.current.decreaseStock(1, 3)
      })
      const stored = localStorageMock.getItem('nexmart-inventory')
      expect(stored).not.toBeNull()
      const parsed = JSON.parse(stored)
      expect(parsed['1'].quantity).toBe(7)
    })

    it('loads persisted inventory on re-initialization', async () => {
      vi.spyOn(inventoryApi, 'fetchInventory').mockRejectedValue(new Error('Network error'))
      localStorageMock.setItem('nexmart-inventory', JSON.stringify({
        '1': { quantity: 5, lastUpdated: new Date().toISOString() }
      }))

      const { result } = renderHook(() => useInventory(), { wrapper })
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0))
      })

      expect(result.current.getStock(1)).toBe(5)
    })
  })

  describe('edge cases', () => {
    it('handles zero stock gracefully', async () => {
      vi.spyOn(inventoryApi, 'fetchInventory').mockResolvedValue(
        Object.entries(mockInventory).map(([productId, data]) => ({
          productId: Number(productId),
          stock: data.quantity,
          lowStockThreshold: 5,
          updatedAt: data.lastUpdated,
          product: { id: Number(productId), name: `Product ${productId}`, categoryId: 'electronics' }
        }))
      )

      const { result } = renderHook(() => useInventory(), { wrapper })
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0))
      })

      expect(result.current.getStock(3)).toBe(0)
      expect(result.current.getStockStateForProduct(3)).toBe(STOCK_STATES.OUT_OF_STOCK)
      expect(result.current.isInStock(3)).toBe(false)
    })

    it('handles one item remaining', async () => {
      vi.spyOn(inventoryApi, 'fetchInventory').mockResolvedValue(
        Object.entries(mockInventory).map(([productId, data]) => ({
          productId: Number(productId),
          stock: data.quantity,
          lowStockThreshold: 5,
          updatedAt: data.lastUpdated,
          product: { id: Number(productId), name: `Product ${productId}`, categoryId: 'electronics' }
        }))
      )

      const { result } = renderHook(() => useInventory(), { wrapper })
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0))
      })

      expect(result.current.getStock(4)).toBe(1)
      expect(result.current.getStockStateForProduct(4)).toBe(STOCK_STATES.LOW_STOCK)
      expect(result.current.isInStock(4, 1)).toBe(true)
      expect(result.current.isInStock(4, 2)).toBe(false)
    })

    it('handles quantity equal to available stock', async () => {
      vi.spyOn(inventoryApi, 'fetchInventory').mockResolvedValue(
        Object.entries(mockInventory).map(([productId, data]) => ({
          productId: Number(productId),
          stock: data.quantity,
          lowStockThreshold: 5,
          updatedAt: data.lastUpdated,
          product: { id: Number(productId), name: `Product ${productId}`, categoryId: 'electronics' }
        }))
      )

      const { result } = renderHook(() => useInventory(), { wrapper })
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0))
      })

      const check = result.current.canAddToCart(4, 1)
      expect(check.allowed).toBe(true)
    })

    it('handles quantity greater than available stock', async () => {
      vi.spyOn(inventoryApi, 'fetchInventory').mockResolvedValue(
        Object.entries(mockInventory).map(([productId, data]) => ({
          productId: Number(productId),
          stock: data.quantity,
          lowStockThreshold: 5,
          updatedAt: data.lastUpdated,
          product: { id: Number(productId), name: `Product ${productId}`, categoryId: 'electronics' }
        }))
      )

      const { result } = renderHook(() => useInventory(), { wrapper })
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0))
      })

      const check = result.current.canAddToCart(4, 5)
      expect(check.allowed).toBe(false)
      expect(check.reason).toBe('insufficient_stock')
    })

    it('handles missing product inventory safely', async () => {
      vi.spyOn(inventoryApi, 'fetchInventory').mockResolvedValue(
        Object.entries(mockInventory).map(([productId, data]) => ({
          productId: Number(productId),
          stock: data.quantity,
          lowStockThreshold: 5,
          updatedAt: data.lastUpdated,
          product: { id: Number(productId), name: `Product ${productId}`, categoryId: 'electronics' }
        }))
      )

      const { result } = renderHook(() => useInventory(), { wrapper })
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0))
      })

      expect(result.current.getStock(999)).toBe(0)
      expect(result.current.getStockStateForProduct(999)).toBe(STOCK_STATES.OUT_OF_STOCK)
      expect(result.current.isInStock(999)).toBe(false)
    })
  })
})
