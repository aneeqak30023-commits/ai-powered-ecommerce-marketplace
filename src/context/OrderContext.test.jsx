import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { OrderProvider, useOrders, ORDER_STATUSES } from '../context/OrderContext.jsx'
import { AuthProvider } from '../context/AuthContext.jsx'
import { InventoryProvider } from '../context/InventoryContext.jsx'
import * as orderApi from '../services/orderApi.js'

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

vi.mock('../context/AuthContext.jsx', async () => {
  const actual = await vi.importActual('../context/AuthContext.jsx')
  return {
    ...actual,
    useAuth: () => ({
      user: { id: 'usr-orders', userId: 'usr-orders', email: 'orders@example.com', name: 'Order User' },
      loading: false,
      isAuthenticated: true,
      backendAvailable: true,
    })
  }
})

const mockUser = {
  id: 'usr-orders',
  email: 'orders@example.com',
  name: 'Order User',
  createdAt: new Date().toISOString()
}

const mockSession = {
  success: true,
  user: mockUser,
  session: {
    userId: mockUser.id,
    email: mockUser.email,
    name: mockUser.name,
    token: 'token',
    createdAt: mockUser.createdAt,
  }
}

const mockOrder = {
  id: 'ORD-ABC123',
  orderId: 'uuid-order-1',
  userId: 'usr-orders',
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
    localStorageMock.setItem('nexmart-auth', JSON.stringify({
      token: 'token',
      userId: 'usr-orders',
      email: 'orders@example.com',
      name: 'Order User',
      createdAt: new Date().toISOString()
    }))
    vi.clearAllMocks()
    vi.spyOn(orderApi, 'getOrders').mockImplementation(() => {
      // This will be populated by the orders state
      return Promise.resolve([])
    })
    vi.spyOn(orderApi, 'createOrder').mockImplementation((orderData) => {
      return Promise.resolve({
        id: 'ORD-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8).toUpperCase(),
        orderId: 'uuid-' + Date.now(),
        userId: 'usr-orders',
        status: 'confirmed',
        customer: orderData.customer,
        shippingAddress: orderData.shippingAddress,
        subtotal: orderData.subtotal,
        shipping: orderData.shipping,
        tax: orderData.tax,
        total: orderData.total,
        date: new Date().toISOString(),
        items: orderData.items.map(item => ({
          id: item.id,
          productId: Number(item.id),
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image || '',
          subtotal: item.price * item.quantity
        }))
      })
    })
    vi.spyOn(orderApi, 'cancelOrder').mockImplementation((orderId) => {
      return Promise.resolve({
        ...mockOrder,
        id: orderId,
        status: 'Cancelled'
      })
    })
  })

  describe('order creation', () => {
    it('creates an order via backend', async () => {
      const { result } = renderHook(() => useOrders(), { wrapper: orderWrapper })

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0))
      })

      await act(async () => {
        const created = await result.current.placeOrder({
          items: [{ id: 1, name: 'Product 1', price: 10, quantity: 2 }],
          customer: { name: 'Test', email: 'test@example.com', phone: '123' },
          shippingAddress: { address: '123 St', city: 'City', state: 'ST', zip: '12345' },
          subtotal: 20,
          shipping: 0,
          tax: 1.6,
          total: 21.6
        })
        expect(created.id).toMatch(/^ORD-/)
        expect(created.status).toBe('confirmed')
      })

      expect(result.current.orders).toHaveLength(1)
    })

    it('falls back to localStorage when backend fails', async () => {
      vi.spyOn(orderApi, 'createOrder').mockRejectedValue(new Error('Network error'))

      const { result } = renderHook(() => useOrders(), { wrapper: orderWrapper })

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0))
      })

      await act(async () => {
        const created = await result.current.placeOrder({
          userId: 'user-1',
          items: [{ id: 'p1', name: 'Product 1', price: 10, quantity: 2 }],
          customer: { name: 'Test', email: 'test@example.com', phone: '123' },
          shippingAddress: { address: '123 St', city: 'City', state: 'ST', zip: '12345' },
          subtotal: 20,
          shipping: 0,
          tax: 1.6,
          total: 21.6
        })
        expect(created.id).toMatch(/^ORD-/)
      })

      expect(result.current.orders).toHaveLength(1)
      expect(result.current.orders[0].userId).toBe('user-1')
    })

    it('stores order items with correct quantities and prices', async () => {
      const { result } = renderHook(() => useOrders(), { wrapper: orderWrapper })

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0))
      })

      await act(async () => {
        result.current.placeOrder({
          items: [
            { id: 1, name: 'Product 1', price: 10, quantity: 2 },
            { id: 2, name: 'Product 2', price: 25, quantity: 1 }
          ],
          customer: { name: 'Test', email: 'test@example.com', phone: '123' },
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
      expect(result.current.orders[0].subtotal).toBe(45)
    })
  })

  describe('customer isolation', () => {
    it('returns only orders for a specific user', async () => {
      const { result } = renderHook(() => useOrders(), { wrapper: orderWrapper })

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0))
      })

      await act(async () => {
        result.current.placeOrder({
          userId: 'usr-orders',
          items: [{ id: 1, name: 'Product 1', price: 10, quantity: 1 }],
          customer: { name: 'User 1', email: 'u1@test.com', phone: '111' },
          shippingAddress: { address: '111 St', city: 'City', state: 'ST', zip: '11111' },
          subtotal: 10,
          shipping: 0,
          tax: 0.8,
          total: 10.8
        })
      })

      const userOrders = result.current.getOrdersByUserId('usr-orders')
      expect(userOrders).toHaveLength(1)
      expect(userOrders[0].userId).toBe('usr-orders')
    })

    it('prevents accessing another customers order by ID', async () => {
      const { result } = renderHook(() => useOrders(), { wrapper: orderWrapper })

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0))
      })

      await act(async () => {
        result.current.placeOrder({
          userId: 'usr-orders',
          items: [{ id: 1, name: 'Product 1', price: 10, quantity: 1 }],
          customer: { name: 'User 1', email: 'u1@test.com', phone: '111' },
          shippingAddress: { address: '111 St', city: 'City', state: 'ST', zip: '11111' },
          subtotal: 10,
          shipping: 0,
          tax: 0.8,
          total: 10.8
        })
      })

      const orderId = result.current.orders[0].id
      const foundByUser = result.current.getOrderById(orderId, 'usr-orders')
      const foundByOther = result.current.getOrderById(orderId, 'other-user')

      expect(foundByUser).not.toBeNull()
      expect(foundByOther).toBeNull()
    })
  })

  describe('order status management', () => {
    it('cancels pending or confirmed orders via backend', async () => {
      const { result } = renderHook(() => useOrders(), { wrapper: orderWrapper })

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0))
      })

      await act(async () => {
        result.current.placeOrder({
          items: [{ id: 1, name: 'Product 1', price: 10, quantity: 1 }],
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
        await result.current.cancelOrder(orderId, 'usr-orders')
      })

      expect(result.current.orders[0].status).toBe(ORDER_STATUSES.CANCELLED)
    })

    it('falls back to localStorage cancellation when backend fails', async () => {
      vi.spyOn(orderApi, 'createOrder').mockResolvedValue(mockOrder)
      vi.spyOn(orderApi, 'cancelOrder').mockRejectedValue(new Error('Network error'))

      const { result } = renderHook(() => useOrders(), { wrapper: orderWrapper })

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0))
      })

      await act(async () => {
        result.current.placeOrder({
          userId: 'usr-orders',
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
        result.current.cancelOrder(orderId, 'usr-orders')
      })

      expect(result.current.orders[0].status).toBe(ORDER_STATUSES.CANCELLED)
    })
  })

  describe('persistence', () => {
    it('persists orders to localStorage', async () => {
      const { result } = renderHook(() => useOrders(), { wrapper: orderWrapper })

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0))
      })

      await act(async () => {
        result.current.placeOrder({
          items: [{ id: 1, name: 'Product 1', price: 10, quantity: 1 }],
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
    })

    it('clears all orders', async () => {
      const { result } = renderHook(() => useOrders(), { wrapper: orderWrapper })

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0))
      })

      await act(async () => {
        result.current.placeOrder({
          items: [{ id: 1, name: 'Product 1', price: 10, quantity: 1 }],
          customer: { name: 'User 1', email: 'u1@test.com', phone: '111' },
          shippingAddress: { address: '111 St', city: 'City', state: 'ST', zip: '11111' },
          subtotal: 10,
          shipping: 0,
          tax: 0.8,
          total: 10.8
        })
      })

      expect(result.current.orders).toHaveLength(1)

      await act(async () => {
        result.current.clearOrders()
      })

      expect(result.current.orders).toHaveLength(0)
    })
  })

  describe('edge cases', () => {
    it('returns null for non-existent order ID', async () => {
      const { result } = renderHook(() => useOrders(), { wrapper: orderWrapper })

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0))
      })

      const found = result.current.getOrderById('ORD-NONEXISTENT', 'user-1')
      expect(found).toBeNull()
    })

    it('returns empty array when no orders exist', async () => {
      const { result } = renderHook(() => useOrders(), { wrapper: orderWrapper })

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0))
      })

      const userOrders = result.current.getOrdersByUserId('user-1')
      expect(userOrders).toEqual([])
    })
  })
})
