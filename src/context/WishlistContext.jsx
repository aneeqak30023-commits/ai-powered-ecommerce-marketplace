import { useState, useCallback, useEffect, createContext, useContext, useReducer } from 'react'
import { useAuth } from './AuthContext.jsx'
import { getWishlist, addToWishlist as addToWishlistApi, removeFromWishlist as removeFromWishlistApi, clearWishlistCache } from '../services/wishlistApi.js'

const STORAGE_KEY = 'nexmart-wishlist'

function loadWishlist() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function saveWishlist(items) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  } catch {
    // storage full or unavailable
  }
}

const WishlistContext = createContext(null)

export function WishlistProvider({ children }) {
  const [items, dispatch] = useReducer(wishlistReducer, loadWishlist())
  const [backendAvailable, setBackendAvailable] = useState(false)
  const { user, loading: authLoading, backendAvailable: authBackendAvailable } = useAuth()

  useEffect(() => {
    if (Object.keys(items).length === 0) return
    saveWishlist(items)
  }, [items])

  useEffect(() => {
    let cancelled = false
    clearWishlistCache()

    const syncWishlist = async () => {
      if (!user?.userId || !authBackendAvailable) {
        if (!cancelled) setBackendAvailable(false)
        return
      }

      try {
        const backendItems = await getWishlist()
        if (cancelled) return
        const next = backendItems.map(item => ({
          id: item.productId,
          name: item.product?.name || '',
          price: item.product?.price || 0,
          image: item.product?.images?.[0] || item.product?.image || '',
          categoryName: item.product?.categoryId || '',
          rating: item.product?.rating || 0,
          reviewCount: item.product?.reviewCount || 0,
          stock: item.product?.stock || 0,
          specifications: {},
        }))
        dispatch({ type: 'HYDRATE', payload: next })
        setBackendAvailable(true)
      } catch {
        if (cancelled) return
        setBackendAvailable(false)
      }
    }

    if (!authLoading) {
      syncWishlist()
    }

    return () => {
      cancelled = true
    }
  }, [user?.userId, authLoading, authBackendAvailable])

  const syncToBackend = useCallback(async (productId, action = 'add') => {
    if (!backendAvailable) return
    try {
      if (action === 'add') {
        await addToWishlistApi(productId)
      } else if (action === 'remove') {
        await removeFromWishlistApi(productId)
      }
    } catch {
      // ignore backend sync errors; frontend state remains valid
    }
  }, [backendAvailable])

  const toggleWishlist = useCallback((product) => {
    const exists = items.some(i => i.id === product.id)
    if (exists) {
      dispatch({ type: 'REMOVE_ITEM', payload: product.id })
      syncToBackend(product.id, 'remove')
    } else {
      dispatch({
        type: 'ADD_ITEM',
        payload: {
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.images?.[0] || product.image || '',
          categoryName: product.categoryName,
          rating: product.rating,
          reviewCount: product.reviewCount,
          stock: product.stock,
          specifications: product.specifications
        }
      })
      syncToBackend(product.id, 'add')
    }
  }, [items, syncToBackend])

  const removeFromWishlist = useCallback((id) => {
    dispatch({ type: 'REMOVE_ITEM', payload: id })
    syncToBackend(id, 'remove')
  }, [syncToBackend])

  const isInWishlist = useCallback((id) => {
    return items.some(i => i.id === id)
  }, [items])

  const clearWishlist = useCallback(() => {
    dispatch({ type: 'CLEAR_WISHLIST' })
  }, [])

  const wishlistCount = items.length

  return (
    <WishlistContext.Provider value={{ wishlistItems: items, wishlistCount, toggleWishlist, removeFromWishlist, isInWishlist, clearWishlist, backendAvailable }}>
      {children}
    </WishlistContext.Provider>
  )
}

export function useWishlist() {
  const context = useContext(WishlistContext)
  if (!context) throw new Error('useWishlist must be used within a WishlistProvider')
  return context
}

function wishlistReducer(state, action) {
  switch (action.type) {
    case 'TOGGLE_ITEM': {
      const existing = state.find(i => i.id === action.payload.id)
      if (existing) {
        return state.filter(i => i.id !== action.payload.id)
      }
      return [...state, action.payload]
    }
    case 'ADD_ITEM':
      return [...state, action.payload]
    case 'REMOVE_ITEM':
      return state.filter(i => i.id !== action.payload)
    case 'CLEAR_WISHLIST':
      return []
    case 'HYDRATE':
      return action.payload
    default:
      return state
  }
}
