import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { AuthProvider, useAuth } from '../context/AuthContext.jsx'

// Mock localStorage
const localStorageMock = (() => {
  let store = {}
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => { store[key] = String(value) },
    removeItem: (key) => { delete store[key] },
    clear: () => { store = {} }
  }
})()

Object.defineProperty(window, 'localStorage', { value: localStorageMock })

// Mock crypto for tests
if (!window.crypto) {
  window.crypto = {
    subtle: {
      digest: async () => new ArrayBuffer(32)
    },
    getRandomValues: (arr) => {
      for (let i = 0; i < arr.length; i++) arr[i] = Math.floor(Math.random() * 256)
    }
  }
}

describe('AuthContext', () => {
  beforeEach(() => {
    localStorageMock.clear()
    vi.clearAllMocks()
  })

  const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>

  it('starts unauthenticated', () => {
    const { result } = renderHook(() => useAuth(), { wrapper })
    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.user).toBeNull()
    expect(result.current.loading).toBe(false)
  })

  it('registers a new user successfully', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper })
    
    await act(async () => {
      const res = await result.current.register('test@example.com', 'password123', 'Test User')
      expect(res.success).toBe(true)
      expect(res.user.email).toBe('test@example.com')
      expect(res.user.name).toBe('Test User')
    })

    expect(result.current.isAuthenticated).toBe(true)
    expect(result.current.user.email).toBe('test@example.com')
  })

  it('prevents duplicate registration', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper })
    
    await act(async () => {
      await result.current.register('test@example.com', 'password123', 'Test User')
    })

    await act(async () => {
      const res = await result.current.register('test@example.com', 'password456', 'Another User')
      expect(res.success).toBe(false)
      expect(res.error).toContain('already exists')
    })
  })

  it('requires all fields for registration', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper })
    
    await act(async () => {
      const res = await result.current.register('', 'password123', 'Test User')
      expect(res.success).toBe(false)
      expect(res.error).toBe('All fields are required')
    })

    await act(async () => {
      const res = await result.current.register('test@example.com', '', 'Test User')
      expect(res.success).toBe(false)
      expect(res.error).toBe('All fields are required')
    })

    await act(async () => {
      const res = await result.current.register('test@example.com', 'password123', '')
      expect(res.success).toBe(false)
      expect(res.error).toBe('All fields are required')
    })
  })

  it('requires minimum password length', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper })
    
    await act(async () => {
      const res = await result.current.register('test@example.com', 'short', 'Test User')
      expect(res.success).toBe(false)
      expect(res.error).toBe('Password must be at least 8 characters')
    })
  })

  it('logs in with correct credentials', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper })
    
    await act(async () => {
      await result.current.register('test@example.com', 'password123', 'Test User')
    })

    // Create a new hook instance to test login
    const { result: loginResult } = renderHook(() => useAuth(), { wrapper })
    
    await act(async () => {
      const res = await loginResult.current.login('test@example.com', 'password123')
      expect(res.success).toBe(true)
      expect(loginResult.current.isAuthenticated).toBe(true)
    })
  })

  it('rejects invalid login credentials', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper })
    
    await act(async () => {
      const res = await result.current.login('wrong@example.com', 'password123')
      expect(res.success).toBe(false)
      expect(res.error).toBe('Invalid email or password')
    })
  })

  it('requires email and password for login', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper })
    
    await act(async () => {
      const res = await result.current.login('', 'password123')
      expect(res.success).toBe(false)
      expect(res.error).toBe('Email and password are required')
    })

    await act(async () => {
      const res = await result.current.login('test@example.com', '')
      expect(res.success).toBe(false)
      expect(res.error).toBe('Email and password are required')
    })
  })

  it('logs out successfully', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper })
    
    await act(async () => {
      await result.current.register('test@example.com', 'password123', 'Test User')
    })

    expect(result.current.isAuthenticated).toBe(true)

    await act(async () => {
      result.current.logout()
    })

    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.user).toBeNull()
  })

  it('updates profile', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper })
    
    await act(async () => {
      await result.current.register('test@example.com', 'password123', 'Test User')
    })

    await act(async () => {
      result.current.updateProfile({ name: 'Updated Name', shippingAddress: '123 Main St' })
    })

    expect(result.current.user.name).toBe('Updated Name')
    expect(result.current.user.shippingAddress).toBe('123 Main St')
    expect(result.current.user.email).toBe('test@example.com') // unchanged
  })

  it('persists auth state in localStorage', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper })
    
    await act(async () => {
      await result.current.register('test@example.com', 'password123', 'Test User')
    })

    const stored = localStorageMock.getItem('nexmart-auth')
    expect(stored).not.toBeNull()
    const parsed = JSON.parse(stored)
    expect(parsed.email).toBe('test@example.com')
    expect(parsed.token).toBeDefined()
  })

  it('normalizes email to lowercase during registration', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper })
    
    await act(async () => {
      const res = await result.current.register('Test@Example.COM', 'password123', 'Test User')
      expect(res.success).toBe(true)
      expect(res.user.email).toBe('test@example.com')
    })
  })
})
