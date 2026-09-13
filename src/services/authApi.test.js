import { describe, it, expect, beforeEach, vi } from 'vitest'
import { register, login, logout, getSession, clearAuthCache } from '../services/authApi.js'

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

describe('authApi', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    clearAuthCache()
  })

  it('registers a new user successfully', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 201,
        json: () => Promise.resolve(mockSession),
      })
    )

    const result = await register('test@example.com', 'password123', 'Test User')
    expect(result.success).toBe(true)
    expect(result.user.email).toBe('test@example.com')
    expect(result.session.token).toBe('mock-jwt-token')
  })

  it('rejects duplicate registration', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        status: 409,
        json: () => Promise.resolve({ error: 'An account with this email already exists' }),
      })
    )

    await expect(register('test@example.com', 'password123', 'Test User')).rejects.toThrow('An account with this email already exists')
  })

  it('rejects invalid email format', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        status: 400,
        json: () => Promise.resolve({ error: 'Invalid email format' }),
      })
    )

    await expect(register('invalid', 'password123', 'Test User')).rejects.toThrow('Invalid email format')
  })

  it('rejects short password', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        status: 400,
        json: () => Promise.resolve({ error: 'Password must be at least 8 characters' }),
      })
    )

    await expect(register('test@example.com', 'short', 'Test User')).rejects.toThrow('Password must be at least 8 characters')
  })

  it('logs in with correct credentials', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockSession),
      })
    )

    const result = await login('test@example.com', 'password123')
    expect(result.success).toBe(true)
    expect(result.user.email).toBe('test@example.com')
  })

  it('rejects invalid login credentials', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        status: 401,
        json: () => Promise.resolve({ error: 'Invalid email or password' }),
      })
    )

    await expect(login('wrong@example.com', 'password123')).rejects.toThrow('Invalid email or password')
  })

  it('requires email and password for login', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        status: 400,
        json: () => Promise.resolve({ error: 'Email and password are required' }),
      })
    )

    await expect(login('', 'password123')).rejects.toThrow('Email and password are required')
  })

  it('validates session with token', async () => {
    localStorageMock.setItem('nexmart-auth', JSON.stringify({ token: 'mock-token' }))
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ success: true, user: mockUser }),
      })
    )

    const result = await getSession()
    expect(result.success).toBe(true)
    expect(result.user.id).toBe(mockUser.id)
  })

  it('returns failure for missing session token', async () => {
    localStorage.removeItem('nexmart-auth')

    const result = await getSession()
    expect(result.success).toBe(false)
  })

  it('returns failure for invalid session token', async () => {
    localStorage.setItem('nexmart-auth', JSON.stringify({ token: 'invalid-token' }))

    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        status: 401,
        json: () => Promise.resolve({ error: 'Invalid or expired session' }),
      })
    )

    const result = await getSession()
    expect(result.success).toBe(false)
  })

  it('logs out successfully', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ success: true }),
      })
    )

    const result = await logout()
    expect(result.success).toBe(true)
  })
})
