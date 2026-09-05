import { useState, useCallback, useEffect, createContext, useContext } from 'react'
import { useAuth } from './AuthContext.jsx'
import { useInventory } from './InventoryContext.jsx'

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
  localStorage.setItem(STORAGE_KEY, JSON.stringify(orders))
}

const OrderContext = createContext(null)

export function OrderProvider({ children }) {
  const [orders, setOrders] = useState(() => loadOrders())
  const { user: _user } = useAuth()
  const { bulkIncreaseStock, bulkDecreaseStock } = useInventory()

  useEffect(() => {
    saveOrders(orders)
  }, [orders])

  const placeOrder = useCallback((orderData) => {
    const newOrder = {
      ...orderData,
      id: 'ORD-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8).toUpperCase(),
      status: orderData.status || ORDER_STATUSES.CONFIRMED,
      date: orderData.date || new Date().toISOString()
    }

    // Decrease inventory for ordered items
    if (newOrder.items && newOrder.items.length > 0) {
      bulkDecreaseStock(newOrder.items)
    }

    setOrders(prev => [newOrder, ...prev])
    return newOrder
  }, [bulkDecreaseStock])

  const getOrderById = useCallback((id, requestingUserId = null) => {
    const order = orders.find(o => o.id === id) || null
    // Customer isolation: if requestingUserId is provided, ensure order belongs to that user
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
      // Customer isolation: users can only update their own orders
      if (requestingUserId && order.userId !== requestingUserId) return order
      return { ...order, status }
    }))
  }, [])

  const cancelOrder = useCallback((orderId, requestingUserId = null) => {
    let orderToRestore = null
    setOrders(prev => {
      const order = prev.find(o => o.id === orderId)
      if (!order) return prev
      if (requestingUserId && order.userId !== requestingUserId) return prev
      if (![ORDER_STATUSES.PENDING, ORDER_STATUSES.CONFIRMED].includes(order.status)) return prev
      orderToRestore = order
      return prev.map(o => o.id === orderId ? { ...o, status: ORDER_STATUSES.CANCELLED } : o)
    })

    // Restore inventory after render to avoid React render-phase state update warning
    if (orderToRestore && orderToRestore.items && orderToRestore.items.length > 0) {
      setTimeout(() => {
        bulkIncreaseStock(orderToRestore.items)
      }, 0)
    }
  }, [bulkIncreaseStock])

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
    clearOrders
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
