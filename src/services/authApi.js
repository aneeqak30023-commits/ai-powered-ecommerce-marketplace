const API_BASE = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001'

let authCache = null
let authCacheTime = 0
const CACHE_TTL = 30_000

export async function register(email, password, name) {
  const response = await fetch(`${API_BASE}/api/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password, name }),
  })

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    const message = data?.error || `Failed to register: ${response.status}`
    throw new Error(message)
  }

  authCache = data
  authCacheTime = Date.now()
  return data
}

export async function login(email, password) {
  const response = await fetch(`${API_BASE}/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  })

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    const message = data?.error || `Failed to login: ${response.status}`
    throw new Error(message)
  }

  authCache = data
  authCacheTime = Date.now()
  return data
}

export async function logout() {
  const response = await fetch(`${API_BASE}/api/auth/logout`, {
    method: 'POST',
  })

  const data = await response.json().catch(() => ({ success: true }))

  authCache = null
  authCacheTime = 0
  return data
}

export async function getSession() {
  const token = getStoredToken()
  if (!token) {
    return { success: false }
  }

  const now = Date.now()
  if (authCache && now - authCacheTime < CACHE_TTL) {
    return authCache
  }

  const response = await fetch(`${API_BASE}/api/auth/session`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    clearStoredToken()
    return { success: false }
  }

  authCache = data
  authCacheTime = now
  return data
}

function getStoredToken() {
  try {
    const raw = localStorage.getItem('nexmart-auth')
    if (raw) {
      const parsed = JSON.parse(raw)
      return parsed?.token || null
    }
  } catch {
    // ignore
  }
  return null
}

function clearStoredToken() {
  try {
    localStorage.removeItem('nexmart-auth')
  } catch {
    // ignore
  }
}

export function clearAuthCache() {
  authCache = null
  authCacheTime = 0
}
