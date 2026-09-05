import { useState, useCallback, useEffect, createContext, useContext } from 'react'

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
  localStorage.setItem(STORAGE_KEY, JSON.stringify(auth))
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
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

/**
 * Simple hash function using Web Crypto API.
 * Falls back to a basic hash if crypto is unavailable.
 */
async function hashPassword(password, salt) {
  const encoder = new TextEncoder()
  const data = encoder.encode(password + salt)
  
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  }
  
  // Fallback hash for environments without Web Crypto
  let hash = 0
  for (let i = 0; i < data.length; i++) {
    const char = data[i]
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return Math.abs(hash).toString(16).padStart(64, '0')
}

function generateToken() {
  const bytes = new Uint8Array(32)
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(bytes)
  } else {
    for (let i = 0; i < 32; i++) {
      bytes[i] = Math.floor(Math.random() * 256)
    }
  }
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('')
}

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(() => loadAuth())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    saveAuth(auth)
  }, [auth])

  // Simulate session check on mount
  useEffect(() => {
    if (auth && auth.token) {
      // In a real app, validate token with backend
      // For demo, we just verify the token exists
      setLoading(false)
    } else {
      setLoading(false)
    }
  }, [auth])

  const register = useCallback(async (email, password, name) => {
    const trimmedEmail = email.trim().toLowerCase()
    const trimmedName = name.trim()
    
    if (!trimmedEmail || !password || !trimmedName) {
      return { success: false, error: 'All fields are required' }
    }

    if (password.length < 8) {
      return { success: false, error: 'Password must be at least 8 characters' }
    }

    const users = loadUsers()
    const existing = users.find(u => u.email === trimmedEmail)
    if (existing) {
      return { success: false, error: 'An account with this email already exists' }
    }

    const salt = generateToken().slice(0, 16)
    const hashedPassword = await hashPassword(password, salt)
    
    const newUser = {
      id: 'usr-' + Date.now(),
      email: trimmedEmail,
      name: trimmedName,
      passwordHash: hashedPassword,
      salt,
      createdAt: new Date().toISOString()
    }

    users.push(newUser)
    saveUsers(users)

    const token = generateToken()
    const session = {
      userId: newUser.id,
      email: trimmedEmail,
      name: trimmedName,
      token,
      createdAt: new Date().toISOString()
    }

    setAuth(session)
    return { success: true, user: session }
  }, [])

  const login = useCallback(async (email, password) => {
    const trimmedEmail = email.trim().toLowerCase()
    
    if (!trimmedEmail || !password) {
      return { success: false, error: 'Email and password are required' }
    }

    const users = loadUsers()
    const user = users.find(u => u.email === trimmedEmail)
    
    if (!user) {
      return { success: false, error: 'Invalid email or password' }
    }

    const hashedPassword = await hashPassword(password, user.salt)
    if (hashedPassword !== user.passwordHash) {
      return { success: false, error: 'Invalid email or password' }
    }

    const token = generateToken()
    const session = {
      userId: user.id,
      email: user.email,
      name: user.name,
      token,
      createdAt: new Date().toISOString()
    }

    setAuth(session)
    return { success: true, user: session }
  }, [])

  const logout = useCallback(() => {
    setAuth(null)
  }, [])

  const updateProfile = useCallback((updates) => {
    setAuth(prev => {
      if (!prev) return prev
      const updated = { ...prev, ...updates }
      return updated
    })
    
    // Also update users list
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
    updateProfile
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
