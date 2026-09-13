import { useState, useCallback, useEffect, createContext, useContext } from 'react'
import { register as registerApi, login as loginApi, logout as logoutApi, getSession as getSessionApi, clearAuthCache } from '../services/authApi.js'

const STORAGE_KEY = 'nexmart-auth'
const USERS_KEY = 'nexmart-users'

function loadAuth() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function saveAuth(auth) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(auth))
  } catch {
    // storage full or unavailable
  }
}

function loadUsers() {
  try {
    const raw = localStorage.getItem(USERS_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveUsers(users) {
  try {
    localStorage.setItem(USERS_KEY, JSON.stringify(users))
  } catch {
    // storage full or unavailable
  }
}

function normalizeSession(data) {
  if (!data || !data.success) return null
  const user = data.user || data
  const session = data.session || user
  return {
    userId: session.userId || user.id,
    email: session.email || user.email,
    name: session.name || user.name,
    token: session.token,
    createdAt: session.createdAt || user.createdAt || new Date().toISOString(),
  }
}

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(() => loadAuth())
  const [backendAvailable, setBackendAvailable] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (Object.keys(auth || {}).length === 0) return
    saveAuth(auth)
  }, [auth])

  useEffect(() => {
    let cancelled = false
    clearAuthCache()

    const validate = async () => {
      const local = loadAuth()
      if (!local?.token) {
        if (!cancelled) setLoading(false)
        return
      }

      try {
        const result = await getSessionApi()
        if (cancelled) return
        const session = normalizeSession(result)
        if (session) {
          setAuth(session)
          setBackendAvailable(true)
        } else {
          setAuth(local)
        }
      } catch {
        if (cancelled) return
        setAuth(local)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    validate()
    return () => {
      cancelled = true
    }
  }, [])

  const register = useCallback(async (email, password, name) => {
    const trimmedEmail = email.trim().toLowerCase()
    const trimmedName = name.trim()

    if (!trimmedEmail || !password || !trimmedName) {
      return { success: false, error: 'All fields are required' }
    }

    if (password.length < 8) {
      return { success: false, error: 'Password must be at least 8 characters' }
    }

    try {
      const result = await registerApi(trimmedEmail, password, trimmedName)
      const session = normalizeSession(result)
      if (session) {
        setAuth(session)
        setBackendAvailable(true)
      }
      return { success: true, user: session }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }, [])

  const login = useCallback(async (email, password) => {
    const trimmedEmail = email.trim().toLowerCase()

    if (!trimmedEmail || !password) {
      return { success: false, error: 'Email and password are required' }
    }

    try {
      const result = await loginApi(trimmedEmail, password)
      const session = normalizeSession(result)
      if (session) {
        setAuth(session)
        setBackendAvailable(true)
      }
      return { success: true, user: session }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }, [])

  const logout = useCallback(async () => {
    try {
      await logoutApi()
    } catch {
      // ignore logout errors
    }
    setAuth(null)
    setBackendAvailable(false)
  }, [])

  const updateProfile = useCallback((updates) => {
    setAuth(prev => {
      if (!prev) return prev
      const updated = { ...prev, ...updates }
      return updated
    })

    const users = loadUsers()
    const userIndex = users.findIndex(u => u.id === auth?.userId)
    if (userIndex >= 0) {
      users[userIndex] = { ...users[userIndex], ...updates }
      saveUsers(users)
    }
  }, [auth])

  const value = {
    user: auth,
    loading,
    isAuthenticated: !!auth?.token,
    register,
    login,
    logout,
    updateProfile,
    backendAvailable,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}
