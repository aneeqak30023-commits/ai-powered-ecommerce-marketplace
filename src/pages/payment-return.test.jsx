import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { AuthProvider } from '../context/AuthContext.jsx'
import PaymentReturnPage from './PaymentReturnPage'

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

function renderWithProviders(ui, { route = '/' } = {}) {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <AuthProvider>
        {ui}
      </AuthProvider>
    </MemoryRouter>
  )
}

describe('PaymentReturnPage', () => {
  beforeEach(() => {
    localStorageMock.clear()
    vi.clearAllMocks()
  })

  it('shows login prompt when not authenticated', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: false,
      status: 401,
      json: () => Promise.resolve({ error: 'Authorization required' }),
    })

    renderWithProviders(<PaymentReturnPage />, { route: '/payment/return?orderNumber=ORD-123' })

    await waitFor(() => {
      expect(screen.getByText('Please Log In')).toBeDefined()
    })
  })

  it('shows error when orderNumber is missing', async () => {
    renderWithProviders(<PaymentReturnPage />, { route: '/payment/return' })

    await waitFor(() => {
      expect(screen.getByText('Unable to Load Payment')).toBeDefined()
    })
  })
})
