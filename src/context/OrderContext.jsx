import { useState, useCallback, useEffect, createContext, useContext } from 'react'

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

  useEffect(() => {
    saveOrders(orders)
  }, [orders])

  const placeOrder = useCallback((orderData) => {
    const newOrder = {
      ...orderData,
      id: 'ORD-' + Date.now(),
      status: 'Confirmed',
      date: orderData.date || new Date().toISOString()
    }
    setOrders(prev => [newOrder, ...prev])
    return newOrder
  }, [])

  const getOrderById = useCallback((id) => {
    return orders.find(o => o.id === id) || null
  }, [orders])

  const clearOrders = useCallback(() => {
    setOrders([])
  }, [])

  return (
    <OrderContext.Provider value={{ orders, placeOrder, getOrderById, clearOrders }}>
      {children}
    </OrderContext.Provider>
  )
}

export function useOrders() {
  const context = useContext(OrderContext)
  if (!context) throw new Error('useOrders must be used within an OrderProvider')
  return context
}
