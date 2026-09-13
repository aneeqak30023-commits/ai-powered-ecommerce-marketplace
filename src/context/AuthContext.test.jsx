import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { AuthProvider, useAuth } from '../context/AuthContext.jsx'
import * as authApi from '../services/authApi.js'

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

const mockUser = {
  id: 'usr-123',
  email: 'test@example.com',
  name: 'Test User',
  createdAt: '2026-09-09T00:00:00.000Z',
  updatedAt: '2026-09-09T00:00:00.000Z',
}

const mockSession = {
  success: true,
  user: mockUser,
  session: {
    userId: mockUser.id,
    email: mockUser.email,
    name: mockUser.name,
    token: 'mock-jwt-token',
    createdAt: '2026-09-09T00:00:00.000Z',
  },
}

const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>

describe('AuthContext', () => {
  beforeEach(() => {
    localStorageMock.clear()
    vi.clearAllMocks()
  })

  it('starts unauthenticated', async () => {
    vi.spyOn(authApi, 'getSession').mockResolvedValue({ success: false })

    const { result } = renderHook(() => useAuth(), { wrapper })
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0))
    })

    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.user).toBeNull()
    expect(result.current.loading).toBe(false)
  })

  it('validates existing session with backend on mount', async () => {
    localStorageMock.setItem('nexmart-auth', JSON.stringify({
      token: 'stored-token',
      userId: mockUser.id,
      email: mockUser.email,
      name: mockUser.name,
      createdAt: mockUser.createdAt,
    }))

    vi.spyOn(authApi, 'getSession').mockResolvedValue(mockSession)

    const { result } = renderHook(() => useAuth(), { wrapper })
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0))
    })

    expect(result.current.isAuthenticated).toBe(true)
    expect(result.current.user.email).toBe('test@example.com')
    expect(result.current.backendAvailable).toBe(true)
  })

  it('falls back to localStorage when backend is unavailable', async () => {
    localStorageMock.setItem('nexmart-auth', JSON.stringify({
      token: 'stored-token',
      userId: mockUser.id,
      email: mockUser.email,
      name: mockUser.name,
      createdAt: mockUser.createdAt,
    }))

    vi.spyOn(authApi, 'getSession').mockRejectedValue(new Error('Network error'))

    const { result } = renderHook(() => useAuth(), { wrapper })
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0))
    })

    expect(result.current.isAuthenticated).toBe(true)
    expect(result.current.user.email).toBe('test@example.com')
    expect(result.current.backendAvailable).toBe(false)
  })

  it('registers a new user successfully', async () => {
    vi.spyOn(authApi, 'getSession').mockResolvedValue({ success: false })
    vi.spyOn(authApi, 'register').mockResolvedValue(mockSession)

    const { result } = renderHook(() => useAuth(), { wrapper })
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0))
    })

    await act(async () => {
      const res = await result.current.register('test@example.com', 'password123', 'Test User')
      expect(res.success).toBe(true)
      expect(res.user.email).toBe('test@example.com')
    })

    expect(result.current.isAuthenticated).toBe(true)
    expect(result.current.user.email).toBe('test@example.com')
  })

  it('prevents duplicate registration', async () => {
    vi.spyOn(authApi, 'getSession').mockResolvedValue({ success: false })
    vi.spyOn(authApi, 'register').mockRejectedValue(new Error('An account with this email already exists'))

    const { result } = renderHook(() => useAuth(), { wrapper })
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0))
    })

    await act(async () => {
      const res = await result.current.register('test@example.com', 'password123', 'Test User')
      expect(res.success).toBe(false)
      expect(res.error).toContain('already exists')
    })
  })

  it('requires all fields for registration', async () => {
    vi.spyOn(authApi, 'getSession').mockResolvedValue({ success: false })

    const { result } = renderHook(() => useAuth(), { wrapper })
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0))
    })

    await act(async () => {
      const res = await result.current.register('', 'password123', 'Test User')
      expect(res.success).toBe(false)
      expect(res.error).toBe('All fields are required')
    })
  })

  it('requires minimum password length', async () => {
    vi.spyOn(authApi, 'getSession').mockResolvedValue({ success: false })

    const { result } = renderHook(() => useAuth(), { wrapper })
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0))
    })

    await act(async () => {
      const res = await result.current.register('test@example.com', 'short', 'Test User')
      expect(res.success).toBe(false)
      expect(res.error).toBe('Password must be at least 8 characters')
    })
  })

  it('logs in with correct credentials', async () => {
    vi.spyOn(authApi, 'getSession').mockResolvedValue({ success: false })
    vi.spyOn(authApi, 'login').mockResolvedValue(mockSession)

    const { result } = renderHook(() => useAuth(), { wrapper })
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0))
    })

    await act(async () => {
      const res = await result.current.login('test@example.com', 'password123')
      expect(res.success).toBe(true)
    })

    await waitFor(() => expect(result.current.isAuthenticated).toBe(true))
    expect(result.current.user.email).toBe('test@example.com')
  })

  it('rejects invalid login credentials', async () => {
    vi.spyOn(authApi, 'getSession').mockResolvedValue({ success: false })
    vi.spyOn(authApi, 'login').mockRejectedValue(new Error('Invalid email or password'))

    const { result } = renderHook(() => useAuth(), { wrapper })
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0))
    })

    await act(async () => {
      const res = await result.current.login('wrong@example.com', 'password123')
      expect(res.success).toBe(false)
      expect(res.error).toBe('Invalid email or password')
    })
  })

  it('requires email and password for login', async () => {
    vi.spyOn(authApi, 'getSession').mockResolvedValue({ success: false })

    const { result } = renderHook(() => useAuth(), { wrapper })
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0))
    })

    await act(async () => {
      const res = await result.current.login('', 'password123')
      expect(res.success).toBe(false)
      expect(res.error).toBe('Email and password are required')
    })
  })

  it('logs out successfully', async () => {
    localStorageMock.setItem('nexmart-auth', JSON.stringify({
      token: 'stored-token',
      userId: mockUser.id,
      email: mockUser.email,
      name: mockUser.name,
      createdAt: mockUser.createdAt,
    }))

    vi.spyOn(authApi, 'getSession').mockResolvedValue(mockSession)
    vi.spyOn(authApi, 'logout').mockResolvedValue({ success: true })

    const { result } = renderHook(() => useAuth(), { wrapper })
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0))
    })

    await waitFor(() => expect(result.current.isAuthenticated).toBe(true))

    await act(async () => {
      result.current.logout()
    })

    await waitFor(() => expect(result.current.isAuthenticated).toBe(false))
    expect(result.current.user).toBeNull()
  })

  it('updates profile locally', async () => {
    vi.spyOn(authApi, 'getSession').mockResolvedValue({ success: false })
    vi.spyOn(authApi, 'register').mockResolvedValue(mockSession)

    const { result } = renderHook(() => useAuth(), { wrapper })
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0))
    })

    await act(async () => {
      result.current.register('test@example.com', 'password123', 'Test User')
    })

    await waitFor(() => expect(result.current.user).not.toBeNull())
    expect(result.current.user.email).toBe('test@example.com')

    await act(async () => {
      result.current.updateProfile({ name: 'Updated Name', shippingAddress: '123 Main St' })
    })

    await waitFor(() => expect(result.current.user.name).toBe('Updated Name'))
    expect(result.current.user.shippingAddress).toBe('123 Main St')
    expect(result.current.user.email).toBe('test@example.com')
  })

  it('persists auth state in localStorage', async () => {
    vi.spyOn(authApi, 'getSession').mockResolvedValue({ success: false })
    vi.spyOn(authApi, 'register').mockResolvedValue(mockSession)

    const { result } = renderHook(() => useAuth(), { wrapper })
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0))
    })

    await act(async () => {
      result.current.register('test@example.com', 'password123', 'Test User')
    })

    const stored = localStorageMock.getItem('nexmart-auth')
    expect(stored).not.toBeNull()
    const parsed = JSON.parse(stored)
    expect(parsed.email).toBe('test@example.com')
    expect(parsed.token).toBe('mock-jwt-token')
  })

  it('normalizes email to lowercase during registration', async () => {
    vi.spyOn(authApi, 'getSession').mockResolvedValue({ success: false })
    vi.spyOn(authApi, 'register').mockResolvedValue(mockSession)

    const { result } = renderHook(() => useAuth(), { wrapper })
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0))
    })

    await act(async () => {
      const res = await result.current.register('Test@Example.COM', 'password123', 'Test User')
      expect(res.success).toBe(true)
      expect(res.user.email).toBe('test@example.com')
    })
  })
})
