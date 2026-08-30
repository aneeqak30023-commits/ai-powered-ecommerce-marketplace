import { useCallback, useEffect, createContext, useContext, useReducer } from 'react'

const STORAGE_KEY = 'nexmart-recently-viewed'
const MAX_ITEMS = 8

function loadRecentlyViewed() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function saveRecentlyViewed(items) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
}

const RecentlyViewedContext = createContext(null)

export function RecentlyViewedProvider({ children }) {
  const [items, dispatch] = useReducer(recentlyViewedReducer, null, loadRecentlyViewed)

  useEffect(() => {
    saveRecentlyViewed(items)
  }, [items])

  const addRecentlyViewed = useCallback((product) => {
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
  }, [])

  const clearRecentlyViewed = useCallback(() => {
    dispatch({ type: 'CLEAR_ITEMS' })
  }, [])

  const recentlyViewedCount = items.length

  return (
    <RecentlyViewedContext.Provider value={{ recentlyViewedItems: items, recentlyViewedCount, addRecentlyViewed, clearRecentlyViewed }}>
      {children}
    </RecentlyViewedContext.Provider>
  )
}

export function useRecentlyViewed() {
  const context = useContext(RecentlyViewedContext)
  if (!context) throw new Error('useRecentlyViewed must be used within a RecentlyViewedProvider')
  return context
}

function recentlyViewedReducer(state, action) {
  switch (action.type) {
    case 'ADD_ITEM': {
      const filtered = state.filter(i => i.id !== action.payload.id)
      const updated = [action.payload, ...filtered]
      return updated.slice(0, MAX_ITEMS)
    }
    case 'CLEAR_ITEMS':
      return []
    default:
      return state
  }
}
