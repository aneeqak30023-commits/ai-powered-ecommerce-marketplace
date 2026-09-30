const API_BASE =  import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001'

let authCache = null
let authCacheTime = 0
const CACHE_TTL = 30_000

// When the session endpoint reports 429 we stop calling it until the limiter's
// window elapses, instead of retrying on every render and making the limit worse.
const RATE_LIMIT_BACKOFF_MS = 60_000
let rateLimitRetryAt = 0

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

export async function forgotPassword(email) {
  const response = await fetch(`${API_BASE}/api/auth/forgot-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email }),
  })

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    const message = data?.error || `Failed to request password reset: ${response.status}`
    throw new Error(message)
  }

  return data
}

export async function resetPassword(token, password, confirmPassword) {
  const response = await fetch(`${API_BASE}/api/auth/reset-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ token, password, confirmPassword }),
  })

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    const message = data?.error || `Failed to reset password: ${response.status}`
    throw new Error(message)
  }

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

  if (now < rateLimitRetryAt) {
    return { success: false, rateLimited: true }
  }

  let response
  try {
    response = await fetch(`${API_BASE}/api/auth/session`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
  } catch {
    return { success: false }
  }

  // A 429 means the rate limiter rejected the check, not that the token is
  // invalid. Keep the stored JWT so the user is not silently logged out, and
  // honour Retry-After before trying again.
  if (response.status === 429) {
    const retryAfterSeconds = Number(response.headers?.get?.('Retry-After'))
    const waitMs =
      Number.isFinite(retryAfterSeconds) && retryAfterSeconds > 0
        ? retryAfterSeconds * 1000
        : RATE_LIMIT_BACKOFF_MS
    rateLimitRetryAt = Date.now() + waitMs
    return { success: false, rateLimited: true }
  }

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
  rateLimitRetryAt = 0
}
