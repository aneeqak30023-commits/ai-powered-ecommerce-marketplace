import { useState, useCallback, useEffect, createContext, useContext } from 'react'
import { useAuth } from './AuthContext.jsx'
import { getReturns, createReturn as createReturnApi, checkReturnEligibility as checkEligibilityApi, clearReturnsCache } from '../services/returnApi.js'

export const RETURN_STATUSES = {
  REQUESTED: 'requested',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  RETURNED: 'returned',
  REFUNDED: 'refunded',
  CANCELLED: 'cancelled'
}

export const RETURN_REASONS = [
  { value: 'defective', label: 'Defective item' },
  { value: 'wrong_item', label: 'Wrong item received' },
  { value: 'not_as_described', label: 'Item not as described' },
  { value: 'changed_mind', label: 'Changed my mind' },
  { value: 'damaged_in_shipping', label: 'Damaged in shipping' },
  { value: 'other', label: 'Other reason' },
]

export const ITEM_CONDITIONS = [
  { value: 'new_with_tags', label: 'New with tags' },
  { value: 'like_new', label: 'Like new' },
  { value: 'good', label: 'Good' },
  { value: 'fair', label: 'Fair' },
  { value: 'damaged', label: 'Damaged' },
  { value: 'defective', label: 'Defective' },
]

export const REFUND_STATUSES = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  PAID: 'paid',
  FAILED: 'failed',
  CANCELLED: 'cancelled'
}

export const REFUND_METHODS = [
  { value: 'manual', label: 'Manual (Cash on Delivery)' },
  { value: 'online', label: 'Online (Safepay Dashboard)' },
]

const ACTIVE_RETURN_STATUSES = [RETURN_STATUSES.REQUESTED, RETURN_STATUSES.APPROVED, RETURN_STATUSES.RETURNED]

const STORAGE_KEY = 'nexmart-returns'

function loadReturns() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) {
        return parsed
      }
    }
  } catch {
    // fall through
  }
  return []
}

function saveReturns(returns) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(returns))
  } catch {
    // storage full or unavailable
  }
}

const ReturnContext = createContext(null)

export function ReturnProvider({ children }) {
  const [returns, setReturns] = useState(() => loadReturns())
  const [backendAvailable, setBackendAvailable] = useState(false)
  const { user, loading: authLoading, backendAvailable: authBackendAvailable } = useAuth()

  useEffect(() => {
    if (Object.keys(returns).length === 0) return
    saveReturns(returns)
  }, [returns])

  useEffect(() => {
    let cancelled = false
    clearReturnsCache()

    const syncReturns = async () => {
      if (!user?.userId || !authBackendAvailable) {
        if (!cancelled) setBackendAvailable(false)
        return
      }

      try {
        const backendReturns = await getReturns()
        if (cancelled) return
        setReturns(backendReturns)
        setBackendAvailable(true)
      } catch {
        if (!cancelled) setBackendAvailable(false)
      }
    }

    if (!authLoading) {
      syncReturns()
    }

    return () => {
      cancelled = true
    }
  }, [user?.userId, authLoading, authBackendAvailable])

  const checkReturnEligibility = useCallback(async (orderNumber) => {
    if (!user?.userId) {
      return { eligible: false, reason: 'You must be logged in to check return eligibility.' }
    }

    try {
      const result = await checkEligibilityApi(orderNumber)
      return result
    } catch (error) {
      return { eligible: false, reason: error.message || 'Unable to check eligibility.' }
    }
  }, [user?.userId])

  const createReturn = useCallback(async (returnData) => {
    if (!user?.userId) {
      return { success: false, error: 'You must be logged in to create a return.' }
    }

    try {
      const created = await createReturnApi(returnData)
      setReturns(prev => [created, ...prev])
      return { success: true, return: created }
    } catch (error) {
      return { success: false, error: error.message || 'Failed to create return.' }
    }
  }, [user?.userId])

  const getReturnById = useCallback((id) => {
    return returns.find(r => r.id === id) || null
  }, [returns])

  const getReturnByOrderId = useCallback((orderNumber) => {
    return returns.find(r => r.orderNumber === orderNumber && ACTIVE_RETURN_STATUSES.includes(r.status)) || null
  }, [returns])

  const getReturnsByUserId = useCallback((userId) => {
    if (!userId) return []
    return returns
      .filter(r => r.userId === userId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  }, [returns])

  const value = {
    returns,
    backendAvailable,
    checkReturnEligibility,
    createReturn,
    getReturnById,
    getReturnByOrderId,
    getReturnsByUserId,
  }

  return (
    <ReturnContext.Provider value={value}>
      {children}
    </ReturnContext.Provider>
  )
}

export function useReturns() {
  const context = useContext(ReturnContext)
  if (!context) throw new Error('useReturns must be used within a ReturnProvider')
  return context
}
