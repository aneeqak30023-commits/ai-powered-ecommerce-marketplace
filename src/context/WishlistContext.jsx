import { useCallback, useEffect, createContext, useContext, useReducer } from 'react'

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
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
}

const WishlistContext = createContext(null)

export function WishlistProvider({ children }) {
  const [items, dispatch] = useReducer(wishlistReducer, loadWishlist())

  useEffect(() => {
    saveWishlist(items)
  }, [items])

  const toggleWishlist = useCallback((product) => {
    dispatch({
      type: 'TOGGLE_ITEM',
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
  }, [])

  const removeFromWishlist = useCallback((id) => {
    dispatch({ type: 'REMOVE_ITEM', payload: id })
  }, [])

  const isInWishlist = useCallback((id) => {
    return items.some(i => i.id === id)
  }, [items])

  const clearWishlist = useCallback(() => {
    dispatch({ type: 'CLEAR_WISHLIST' })
  }, [])

  const wishlistCount = items.length

  return (
    <WishlistContext.Provider value={{ wishlistItems: items, wishlistCount, toggleWishlist, removeFromWishlist, isInWishlist, clearWishlist }}>
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
    case 'REMOVE_ITEM':
      return state.filter(i => i.id !== action.payload)
    case 'CLEAR_WISHLIST':
      return []
    default:
      return state
  }
}
