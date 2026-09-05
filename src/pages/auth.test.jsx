import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { AuthProvider } from '../context/AuthContext.jsx'
import LoginPage from '../pages/LoginPage.jsx'
import SignupPage from '../pages/SignupPage.jsx'

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

// Mock crypto
if (!window.crypto) {
  window.crypto = {
    subtle: { digest: async () => new ArrayBuffer(32) },
    getRandomValues: (arr) => {
      for (let i = 0; i < arr.length; i++) arr[i] = Math.floor(Math.random() * 256)
    }
  }
}

function renderWithProviders(ui) {
  return render(
    <MemoryRouter>
      <AuthProvider>
        {ui}
      </AuthProvider>
    </MemoryRouter>
  )
}

describe('LoginPage', () => {
  beforeEach(() => {
    localStorageMock.clear()
    vi.clearAllMocks()
  })

  it('renders login form', () => {
    renderWithProviders(<LoginPage />)
    expect(screen.getByText('Welcome back')).toBeDefined()
    expect(screen.getByPlaceholderText('you@example.com')).toBeDefined()
    expect(screen.getByPlaceholderText('Enter your password')).toBeDefined()
    expect(screen.getByText('Sign In')).toBeDefined()
  })

  it('shows link to signup', () => {
    renderWithProviders(<LoginPage />)
    expect(screen.getByText('Sign up')).toBeDefined()
  })

  it('shows error for invalid credentials', async () => {
    renderWithProviders(<LoginPage />)
    
    fireEvent.change(screen.getByPlaceholderText('you@example.com'), { target: { value: 'test@example.com' } })
    fireEvent.change(screen.getByPlaceholderText('Enter your password'), { target: { value: 'wrongpassword' } })
    
    fireEvent.click(screen.getByText('Sign In'))
    
    await waitFor(() => {
      expect(screen.getByText('Invalid email or password')).toBeDefined()
    })
  })
})

describe('SignupPage', () => {
  beforeEach(() => {
    localStorageMock.clear()
    vi.clearAllMocks()
  })

  it('renders signup form', () => {
    renderWithProviders(<SignupPage />)
    expect(screen.getByText('Create account')).toBeDefined()
    expect(screen.getByPlaceholderText('John Doe')).toBeDefined()
    expect(screen.getByPlaceholderText('you@example.com')).toBeDefined()
    expect(screen.getByPlaceholderText('At least 8 characters')).toBeDefined()
    expect(screen.getByPlaceholderText('Repeat your password')).toBeDefined()
    expect(screen.getByText('Create Account')).toBeDefined()
  })

  it('shows link to login', () => {
    renderWithProviders(<SignupPage />)
    expect(screen.getByText('Sign in')).toBeDefined()
  })

  it('shows error for mismatched passwords', async () => {
    renderWithProviders(<SignupPage />)
    
    fireEvent.change(screen.getByPlaceholderText('John Doe'), { target: { value: 'Test User' } })
    fireEvent.change(screen.getByPlaceholderText('you@example.com'), { target: { value: 'test@example.com' } })
    fireEvent.change(screen.getByPlaceholderText('At least 8 characters'), { target: { value: 'password123' } })
    fireEvent.change(screen.getByPlaceholderText('Repeat your password'), { target: { value: 'different' } })
    
    fireEvent.click(screen.getByText('Create Account'))
    
    await waitFor(() => {
      expect(screen.getByText('Passwords do not match')).toBeDefined()
    })
  })

  it('shows error for short password', async () => {
    renderWithProviders(<SignupPage />)
    
    fireEvent.change(screen.getByPlaceholderText('John Doe'), { target: { value: 'Test User' } })
    fireEvent.change(screen.getByPlaceholderText('you@example.com'), { target: { value: 'test@example.com' } })
    fireEvent.change(screen.getByPlaceholderText('At least 8 characters'), { target: { value: 'short' } })
    fireEvent.change(screen.getByPlaceholderText('Repeat your password'), { target: { value: 'short' } })
    
    fireEvent.click(screen.getByText('Create Account'))
    
    await waitFor(() => {
      expect(screen.getByText('Password must be at least 8 characters')).toBeDefined()
    })
  })
})
