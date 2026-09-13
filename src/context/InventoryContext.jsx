import { useState, useCallback, useEffect, createContext, useContext } from 'react'
import { fetchProducts } from '../services/productApi.js'
import { fetchInventory, clearInventoryCache } from '../services/inventoryApi.js'

export const LOW_STOCK_THRESHOLD = 5

export const STOCK_STATES = {
  IN_STOCK: 'in_stock',
  LOW_STOCK: 'low_stock',
  OUT_OF_STOCK: 'out_of_stock'
}

const STORAGE_KEY = 'nexmart-inventory'

function getLocalInventory() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (typeof parsed === 'object' && parsed !== null) {
        return parsed
      }
    }
  } catch {
    // fall through
  }
  return null
}

function saveInventory(inventory) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(inventory))
  } catch {
    // storage full or unavailable
  }
}

function getStockState(quantity) {
  if (quantity <= 0) return STOCK_STATES.OUT_OF_STOCK
  if (quantity <= LOW_STOCK_THRESHOLD) return STOCK_STATES.LOW_STOCK
  return STOCK_STATES.IN_STOCK
}

const InventoryContext = createContext(null)

export function InventoryProvider({ children }) {
  const [inventory, setInventory] = useState({})
  const [backendAvailable, setBackendAvailable] = useState(false)

  useEffect(() => {
    let cancelled = false
    clearInventoryCache()

    fetchInventory()
      .then((apiInventory) => {
        if (cancelled) return
        const next = {}
        for (const entry of apiInventory) {
          next[entry.productId] = {
            quantity: entry.stock,
            lastUpdated: entry.updatedAt
          }
        }
        setInventory(next)
        setBackendAvailable(true)
      })
      .catch(() => {
        if (cancelled) return
        // Backend unavailable: fall back to localStorage, then products
        const local = getLocalInventory()
        if (local && Object.keys(local).length > 0) {
          setInventory(local)
        } else {
          fetchProducts()
            .then((apiProducts) => {
              if (cancelled) return
              const next = {}
              for (const product of apiProducts) {
                const stock = typeof product.stock === 'number' ? product.stock : 0
                next[product.id] = {
                  quantity: stock,
                  lastUpdated: new Date().toISOString()
                }
              }
              setInventory(next)
            })
            .catch(() => {
              // keep empty inventory on complete failure
            })
        }
      })

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (Object.keys(inventory).length === 0) return
    saveInventory(inventory)
  }, [inventory])

  const getStock = useCallback((productId) => {
    const entry = inventory[productId]
    if (!entry) return 0
    return typeof entry.quantity === 'number' ? entry.quantity : 0
  }, [inventory])

  const getStockStateForProduct = useCallback((productId) => {
    return getStockState(getStock(productId))
  }, [getStock])

  const isInStock = useCallback((productId, requiredQuantity = 1) => {
    return getStock(productId) >= requiredQuantity
  }, [getStock])

  const canAddToCart = useCallback((productId, quantity = 1) => {
    const available = getStock(productId)
    if (available <= 0) return { allowed: false, reason: 'out_of_stock', available: 0 }
    if (available < quantity) {
      return { allowed: false, reason: 'insufficient_stock', available, requested: quantity }
    }
    return { allowed: true, available }
  }, [getStock])

  const decreaseStock = useCallback((productId, quantity) => {
    setInventory(prev => {
      const current = prev[productId]
      const currentQty = current?.quantity || 0
      const newQty = Math.max(0, currentQty - quantity)
      return {
        ...prev,
        [productId]: {
          quantity: newQty,
          lastUpdated: new Date().toISOString()
        }
      }
    })
  }, [])

  const increaseStock = useCallback((productId, quantity) => {
    setInventory(prev => {
      const current = prev[productId]
      const currentQty = current?.quantity || 0
      const newQty = currentQty + quantity
      return {
        ...prev,
        [productId]: {
          quantity: newQty,
          lastUpdated: new Date().toISOString()
        }
      }
    })
  }, [])

  const setStock = useCallback((productId, quantity) => {
    const safeQty = Math.max(0, typeof quantity === 'number' ? quantity : 0)
    setInventory(prev => ({
      ...prev,
      [productId]: {
        quantity: safeQty,
        lastUpdated: new Date().toISOString()
      }
    }))
  }, [])

  const bulkDecreaseStock = useCallback((items) => {
    setInventory(prev => {
      const next = { ...prev }
      for (const item of items) {
        const current = next[item.id]
        const currentQty = current?.quantity || 0
        const qty = item.quantity || 1
        next[item.id] = {
          quantity: Math.max(0, currentQty - qty),
          lastUpdated: new Date().toISOString()
        }
      }
      return next
    })
  }, [])

  const bulkIncreaseStock = useCallback((items) => {
    setInventory(prev => {
      const next = { ...prev }
      for (const item of items) {
        const current = next[item.id]
        const currentQty = current?.quantity || 0
        const qty = item.quantity || 1
        next[item.id] = {
          quantity: currentQty + qty,
          lastUpdated: new Date().toISOString()
        }
      }
      return next
    })
  }, [])

  const validateCartStock = useCallback((cartItems) => {
    const issues = []
    for (const item of cartItems) {
      const available = getStock(item.id)
      const requested = item.quantity || 1
      if (available <= 0) {
        issues.push({ productId: item.id, name: item.name, reason: 'out_of_stock', available: 0, requested })
      } else if (available < requested) {
        issues.push({ productId: item.id, name: item.name, reason: 'insufficient_stock', available, requested })
      }
    }
    return issues
  }, [getStock])

  const value = {
    inventory,
    getStock,
    getStockStateForProduct,
    isInStock,
    canAddToCart,
    decreaseStock,
    increaseStock,
    setStock,
    bulkDecreaseStock,
    bulkIncreaseStock,
    validateCartStock,
    backendAvailable
  }

  return (
    <InventoryContext.Provider value={value}>
      {children}
    </InventoryContext.Provider>
  )
}

export function useInventory() {
  const context = useContext(InventoryContext)
  if (!context) throw new Error('useInventory must be used within an InventoryProvider')
  return context
}

