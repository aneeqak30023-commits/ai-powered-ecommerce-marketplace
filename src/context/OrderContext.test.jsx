import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { OrderProvider, useOrders, ORDER_STATUSES } from '../context/OrderContext.jsx'
import { AuthProvider } from '../context/AuthContext.jsx'
import { InventoryProvider } from '../context/InventoryContext.jsx'

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

// Mock crypto
if (!window.crypto) {
  window.crypto = {
    subtle: { digest: async () => new ArrayBuffer(32) },
    getRandomValues: (arr) => {
      for (let i = 0; i < arr.length; i++) arr[i] = Math.floor(Math.random() * 256)
    }
  }
}

const orderWrapper = ({ children }) => (
  <AuthProvider>
    <InventoryProvider>
      <OrderProvider>
        {children}
      </OrderProvider>
    </InventoryProvider>
  </AuthProvider>
)

describe('OrderContext', () => {
  beforeEach(() => {
    localStorageMock.clear()
    localStorageMock.removeItem('nexmart-inventory')
    vi.clearAllMocks()
  })

  describe('order creation', () => {
    it('creates an order with a unique ID', async () => {
      const { result } = renderHook(() => useOrders(), { wrapper: orderWrapper })
      
      await act(async () => {
        result.current.placeOrder({
          userId: 'user-1',
          items: [{ id: 'p1', name: 'Product 1', price: 10, quantity: 2 }],
          customer: { name: 'Test', email: 'test@test.com', phone: '123' },
          shippingAddress: { address: '123 St', city: 'City', state: 'ST', zip: '12345' },
          subtotal: 20,
          shipping: 0,
          tax: 1.6,
          total: 21.6
        })
      })

      expect(result.current.orders).toHaveLength(1)
      expect(result.current.orders[0].id).toBeDefined()
      expect(result.current.orders[0].id).toMatch(/^ORD-/)
      expect(result.current.orders[0].status).toBe(ORDER_STATUSES.CONFIRMED)
    })

    it('stores order items with correct quantities and prices', async () => {
      const { result } = renderHook(() => useOrders(), { wrapper: orderWrapper })
      
      await act(async () => {
        result.current.placeOrder({
          userId: 'user-1',
          items: [
            { id: 'p1', name: 'Product 1', price: 10, quantity: 2 },
            { id: 'p2', name: 'Product 2', price: 25, quantity: 1 }
          ],
          customer: { name: 'Test', email: 'test@test.com', phone: '123' },
          shippingAddress: { address: '123 St', city: 'City', state: 'ST', zip: '12345' },
          subtotal: 45,
          shipping: 5.99,
          tax: 4.08,
          total: 55.07
        })
      })

      expect(result.current.orders[0].items).toHaveLength(2)
      expect(result.current.orders[0].items[0].name).toBe('Product 1')
      expect(result.current.orders[0].items[0].quantity).toBe(2)
      expect(result.current.orders[0].items[1].name).toBe('Product 2')
      expect(result.current.orders[0].subtotal).toBe(45)
      expect(result.current.orders[0].shipping).toBe(5.99)
      expect(result.current.orders[0].tax).toBe(4.08)
      expect(result.current.orders[0].total).toBe(55.07)
    })

    it('links orders to the correct user', async () => {
      const { result } = renderHook(() => useOrders(), { wrapper: orderWrapper })
      
      await act(async () => {
        result.current.placeOrder({
          userId: 'user-1',
          items: [{ id: 'p1', name: 'Product 1', price: 10, quantity: 1 }],
          customer: { name: 'Test', email: 'test@test.com', phone: '123' },
          shippingAddress: { address: '123 St', city: 'City', state: 'ST', zip: '12345' },
          subtotal: 10,
          shipping: 0,
          tax: 0.8,
          total: 10.8
        })
      })

      expect(result.current.orders[0].userId).toBe('user-1')
    })
  })

  describe('customer isolation', () => {
    it('returns only orders for a specific user', async () => {
      const { result } = renderHook(() => useOrders(), { wrapper: orderWrapper })
      
      await act(async () => {
        result.current.placeOrder({
          userId: 'user-1',
          items: [{ id: 'p1', name: 'Product 1', price: 10, quantity: 1 }],
          customer: { name: 'User 1', email: 'u1@test.com', phone: '111' },
          shippingAddress: { address: '111 St', city: 'City', state: 'ST', zip: '11111' },
          subtotal: 10,
          shipping: 0,
          tax: 0.8,
          total: 10.8
        })
        result.current.placeOrder({
          userId: 'user-2',
          items: [{ id: 'p2', name: 'Product 2', price: 20, quantity: 1 }],
          customer: { name: 'User 2', email: 'u2@test.com', phone: '222' },
          shippingAddress: { address: '222 St', city: 'City', state: 'ST', zip: '22222' },
          subtotal: 20,
          shipping: 0,
          tax: 1.6,
          total: 21.6
        })
      })

      const user1Orders = result.current.getOrdersByUserId('user-1')
      const user2Orders = result.current.getOrdersByUserId('user-2')

      expect(user1Orders).toHaveLength(1)
      expect(user1Orders[0].userId).toBe('user-1')
      expect(user2Orders).toHaveLength(1)
      expect(user2Orders[0].userId).toBe('user-2')
    })

    it('prevents accessing another customers order by ID', async () => {
      const { result } = renderHook(() => useOrders(), { wrapper: orderWrapper })
      
      await act(async () => {
        result.current.placeOrder({
          userId: 'user-1',
          items: [{ id: 'p1', name: 'Product 1', price: 10, quantity: 1 }],
          customer: { name: 'User 1', email: 'u1@test.com', phone: '111' },
          shippingAddress: { address: '111 St', city: 'City', state: 'ST', zip: '11111' },
          subtotal: 10,
          shipping: 0,
          tax: 0.8,
          total: 10.8
        })
      })

      const orderId = result.current.orders[0].id
      const foundByUser1 = result.current.getOrderById(orderId, 'user-1')
      const foundByUser2 = result.current.getOrderById(orderId, 'user-2')

      expect(foundByUser1).not.toBeNull()
      expect(foundByUser2).toBeNull()
    })

    it('returns empty array for non-existent user', async () => {
      const { result } = renderHook(() => useOrders(), { wrapper: orderWrapper })
      
      const orders = result.current.getOrdersByUserId('non-existent-user')
      expect(orders).toEqual([])
    })
  })

  describe('order status management', () => {
    it('updates order status', async () => {
      const { result } = renderHook(() => useOrders(), { wrapper: orderWrapper })
      
      await act(async () => {
        result.current.placeOrder({
          userId: 'user-1',
          items: [{ id: 'p1', name: 'Product 1', price: 10, quantity: 1 }],
          customer: { name: 'User 1', email: 'u1@test.com', phone: '111' },
          shippingAddress: { address: '111 St', city: 'City', state: 'ST', zip: '11111' },
          subtotal: 10,
          shipping: 0,
          tax: 0.8,
          total: 10.8
        })
      })

      const orderId = result.current.orders[0].id
      
      await act(async () => {
        result.current.updateOrderStatus(orderId, ORDER_STATUSES.SHIPPED, 'user-1')
      })

      expect(result.current.orders[0].status).toBe(ORDER_STATUSES.SHIPPED)
    })

    it('prevents users from updating another users order status', async () => {
      const { result } = renderHook(() => useOrders(), { wrapper: orderWrapper })
      
      await act(async () => {
        result.current.placeOrder({
          userId: 'user-1',
          items: [{ id: 'p1', name: 'Product 1', price: 10, quantity: 1 }],
          customer: { name: 'User 1', email: 'u1@test.com', phone: '111' },
          shippingAddress: { address: '111 St', city: 'City', state: 'ST', zip: '11111' },
          subtotal: 10,
          shipping: 0,
          tax: 0.8,
          total: 10.8
        })
      })

      const orderId = result.current.orders[0].id
      
      await act(async () => {
        result.current.updateOrderStatus(orderId, ORDER_STATUSES.SHIPPED, 'user-2')
      })

      // Status should remain Confirmed
      expect(result.current.orders[0].status).toBe(ORDER_STATUSES.CONFIRMED)
    })

    it('cancels pending or confirmed orders', async () => {
      const { result } = renderHook(() => useOrders(), { wrapper: orderWrapper })
      
      await act(async () => {
        result.current.placeOrder({
          userId: 'user-1',
          items: [{ id: 'p1', name: 'Product 1', price: 10, quantity: 1 }],
          customer: { name: 'User 1', email: 'u1@test.com', phone: '111' },
          shippingAddress: { address: '111 St', city: 'City', state: 'ST', zip: '11111' },
          subtotal: 10,
          shipping: 0,
          tax: 0.8,
          total: 10.8
        })
      })

      const orderId = result.current.orders[0].id
      
      await act(async () => {
        result.current.cancelOrder(orderId, 'user-1')
      })

      expect(result.current.orders[0].status).toBe(ORDER_STATUSES.CANCELLED)
    })

    it('does not cancel shipped orders', async () => {
      const { result } = renderHook(() => useOrders(), { wrapper: orderWrapper })
      
      await act(async () => {
        result.current.placeOrder({
          userId: 'user-1',
          items: [{ id: 'p1', name: 'Product 1', price: 10, quantity: 1 }],
          customer: { name: 'User 1', email: 'u1@test.com', phone: '111' },
          shippingAddress: { address: '111 St', city: 'City', state: 'ST', zip: '11111' },
          subtotal: 10,
          shipping: 0,
          tax: 0.8,
          total: 10.8,
          status: ORDER_STATUSES.SHIPPED
        })
      })

      const orderId = result.current.orders[0].id
      
      await act(async () => {
        result.current.cancelOrder(orderId, 'user-1')
      })

      expect(result.current.orders[0].status).toBe(ORDER_STATUSES.SHIPPED)
    })
  })

  describe('persistence', () => {
    it('persists orders to localStorage', async () => {
      const { result } = renderHook(() => useOrders(), { wrapper: orderWrapper })
      
      await act(async () => {
        result.current.placeOrder({
          userId: 'user-1',
          items: [{ id: 'p1', name: 'Product 1', price: 10, quantity: 1 }],
          customer: { name: 'User 1', email: 'u1@test.com', phone: '111' },
          shippingAddress: { address: '111 St', city: 'City', state: 'ST', zip: '11111' },
          subtotal: 10,
          shipping: 0,
          tax: 0.8,
          total: 10.8
        })
      })

      const stored = localStorageMock.getItem('nexmart-orders')
      expect(stored).not.toBeNull()
      const parsed = JSON.parse(stored)
      expect(parsed).toHaveLength(1)
      expect(parsed[0].userId).toBe('user-1')
    })

    it('clears all orders', async () => {
      const { result } = renderHook(() => useOrders(), { wrapper: orderWrapper })
      
      await act(async () => {
        result.current.placeOrder({
          userId: 'user-1',
          items: [{ id: 'p1', name: 'Product 1', price: 10, quantity: 1 }],
          customer: { name: 'User 1', email: 'u1@test.com', phone: '111' },
          shippingAddress: { address: '111 St', city: 'City', state: 'ST', zip: '11111' },
          subtotal: 10,
          shipping: 0,
          tax: 0.8,
          total: 10.8
        })
        result.current.placeOrder({
          userId: 'user-1',
          items: [{ id: 'p2', name: 'Product 2', price: 20, quantity: 1 }],
          customer: { name: 'User 1', email: 'u1@test.com', phone: '111' },
          shippingAddress: { address: '111 St', city: 'City', state: 'ST', zip: '11111' },
          subtotal: 20,
          shipping: 0,
          tax: 1.6,
          total: 21.6
        })
      })

      expect(result.current.orders).toHaveLength(2)

      await act(async () => {
        result.current.clearOrders()
      })

      expect(result.current.orders).toHaveLength(0)
    })
  })

  describe('edge cases', () => {
    it('returns null for non-existent order ID', async () => {
      const { result } = renderHook(() => useOrders(), { wrapper: orderWrapper })
      
      const found = result.current.getOrderById('ORD-NONEXISTENT', 'user-1')
      expect(found).toBeNull()
    })

    it('returns empty array when no orders exist', async () => {
      const { result } = renderHook(() => useOrders(), { wrapper: orderWrapper })
      
      const userOrders = result.current.getOrdersByUserId('user-1')
      expect(userOrders).toEqual([])
    })
  })
})
