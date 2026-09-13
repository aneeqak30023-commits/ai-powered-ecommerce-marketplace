import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import AdminRoute from './AdminRoute.jsx'

vi.mock('../../context/AuthContext.jsx', () => ({
  useAuth: () => ({
    isAuthenticated: true,
    user: { role: 'admin' },
    loading: false,
  }),
}))

describe('AdminRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders children for admin user', () => {
    render(
      <MemoryRouter>
        <AdminRoute>
          <div data-testid="admin-content">Admin Content</div>
        </AdminRoute>
      </MemoryRouter>
    )
    expect(screen.getByTestId('admin-content')).toBeDefined()
  })
})
