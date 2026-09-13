import { useState, useCallback, useEffect, createContext, useContext } from 'react'
import { useAuth } from './AuthContext.jsx'
import { useInventory } from './InventoryContext.jsx'
import { getOrders, getOrder as getOrderApi, createOrder as createOrderApi, cancelOrder as cancelOrderApi, clearOrdersCache } from '../services/orderApi.js'

export const ORDER_STATUSES = {
  PENDING: 'Pending',
  CONFIRMED: 'Confirmed',
  SHIPPED: 'Shipped',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled'
}

const STORAGE_KEY = 'nexmart-orders'

function loadOrders() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveOrders(orders) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(orders))
  } catch {
    // storage full or unavailable
  }
}

const OrderContext = createContext(null)

export function OrderProvider({ children }) {
  const [orders, setOrders] = useState(() => loadOrders())
  const [backendAvailable, setBackendAvailable] = useState(false)
  const { user, loading: authLoading, backendAvailable: authBackendAvailable } = useAuth()
  const { bulkIncreaseStock, bulkDecreaseStock } = useInventory()

  useEffect(() => {
    if (Object.keys(orders).length === 0) return
    saveOrders(orders)
  }, [orders])

  useEffect(() => {
    let cancelled = false
    clearOrdersCache()

    const syncOrders = async () => {
      if (!user?.id || !authBackendAvailable) {
        if (!cancelled) setBackendAvailable(false)
        return
      }

      try {
        const backendOrders = await getOrders()
        if (cancelled) return
        setOrders(backendOrders)
        setBackendAvailable(true)
      } catch {
        if (!cancelled) setBackendAvailable(false)
      }
    }

    if (!authLoading) {
      syncOrders()
    }

    return () => {
      cancelled = true
    }
  }, [user?.id, authLoading, authBackendAvailable])

  const placeOrder = useCallback(async (orderData) => {
    if (backendAvailable) {
      try {
        const backendOrder = await createOrderApi({
          items: orderData.items,
          customer: orderData.customer,
          shippingAddress: orderData.shippingAddress,
          subtotal: orderData.subtotal,
          shipping: orderData.shipping,
          tax: orderData.tax,
          total: orderData.total,
        })
        setOrders(prev => [backendOrder, ...prev])
        return backendOrder
      } catch (error) {
        console.error('Backend order creation failed, falling back to localStorage:', error)
      }
    }

    const newOrder = {
      ...orderData,
      id: 'ORD-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8).toUpperCase(),
      status: orderData.status || ORDER_STATUSES.CONFIRMED,
      date: orderData.date || new Date().toISOString()
    }

    if (newOrder.items && newOrder.items.length > 0) {
      bulkDecreaseStock(newOrder.items)
    }

    setOrders(prev => [newOrder, ...prev])
    return newOrder
  }, [backendAvailable, bulkDecreaseStock])

  const getOrderById = useCallback((id, requestingUserId = null) => {
    const order = orders.find(o => o.id === id) || null
    if (order && requestingUserId && order.userId !== requestingUserId) {
      return null
    }
    return order
  }, [orders])

  const getOrdersByUserId = useCallback((userId) => {
    if (!userId) return []
    return orders
      .filter(o => o.userId === userId)
      .sort((a, b) => new Date(b.date) - new Date(a.date))
  }, [orders])

  const updateOrderStatus = useCallback((orderId, status, requestingUserId = null) => {
    setOrders(prev => prev.map(order => {
      if (order.id !== orderId) return order
      if (requestingUserId && order.userId !== requestingUserId) return order
      return { ...order, status }
    }))
  }, [])

  const cancelOrder = useCallback(async (orderId, requestingUserId = null) => {
    if (backendAvailable) {
      try {
        const updated = await cancelOrderApi(orderId)
        setOrders(prev => prev.map(o => o.id === orderId ? updated : o))
        if (updated.items && updated.items.length > 0) {
          bulkIncreaseStock(updated.items)
        }
        return
      } catch (error) {
        console.error('Backend order cancellation failed, falling back to localStorage:', error)
      }
    }

    let orderToRestore = null
    setOrders(prev => {
      const order = prev.find(o => o.id === orderId)
      if (!order) return prev
      if (requestingUserId && order.userId !== requestingUserId) return prev
      if (!['pending', 'confirmed'].includes(order.status.toLowerCase())) return prev
      orderToRestore = order
      return prev.map(o => o.id === orderId ? { ...o, status: ORDER_STATUSES.CANCELLED } : o)
    })

    if (orderToRestore && orderToRestore.items && orderToRestore.items.length > 0) {
      setTimeout(() => {
        bulkIncreaseStock(orderToRestore.items)
      }, 0)
    }
  }, [backendAvailable, bulkIncreaseStock])

  const clearOrders = useCallback(() => {
    setOrders([])
  }, [])

  const value = {
    orders,
    placeOrder,
    getOrderById,
    getOrdersByUserId,
    updateOrderStatus,
    cancelOrder,
    clearOrders,
    backendAvailable
  }

  return (
    <OrderContext.Provider value={value}>
      {children}
    </OrderContext.Provider>
  )
}

export function useOrders() {
  const context = useContext(OrderContext)
  if (!context) throw new Error('useOrders must be used within an OrderProvider')
  return context
}
