import { useState, useCallback, useEffect, createContext, useContext, useReducer } from 'react'

const STORAGE_KEY = 'nexmart-cart'

function loadCart() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function saveCart(items) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
}

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const [items, dispatch] = useReducer(cartReducer, loadCart())

  useEffect(() => {
    saveCart(items)
  }, [items])

  const addToCart = useCallback((product, quantity = 1) => {
    dispatch({
      type: 'ADD_ITEM',
      payload: {
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.images?.[0] || product.image || '',
        quantity
      }
    })
  }, [])

  const removeFromCart = useCallback((id) => {
    dispatch({ type: 'REMOVE_ITEM', payload: id })
  }, [])

  const updateQuantity = useCallback((id, quantity) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } })
  }, [])

  const clearCart = useCallback(() => {
    dispatch({ type: 'CLEAR_CART' })
  }, [])

  const cartCount = items.reduce((sum, i) => sum + (i.quantity || 0), 0)
  const cartTotal = items.reduce((sum, i) => sum + Number(i.price) * (i.quantity || 0), 0)

  return (
    <CartContext.Provider value={{ cartItems: items, cartCount, cartTotal, addToCart, removeFromCart, updateQuantity, clearCart }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) throw new Error('useCart must be used within a CartProvider')
  return context
}

function cartReducer(state, action) {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existing = state.find(i => i.id === action.payload.id)
      if (existing) {
        return state.map(i =>
          i.id === action.payload.id
            ? { ...i, quantity: i.quantity + (action.payload.quantity || 1) }
            : i
        )
      }
      return [...state, { ...action.payload, quantity: action.payload.quantity || 1 }]
    }
    case 'REMOVE_ITEM':
      return state.filter(i => i.id !== action.payload)
    case 'UPDATE_QUANTITY': {
      if (action.payload.quantity <= 0) {
        return state.filter(i => i.id !== action.payload.id)
      }
      return state.map(i =>
        i.id === action.payload.id ? { ...i, quantity: action.payload.quantity } : i
      )
    }
    case 'CLEAR_CART':
      return []
    default:
      return state
  }
}
