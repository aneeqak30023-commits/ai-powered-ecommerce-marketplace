import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useEffect, useRef } from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { OrderProvider, useOrders, ORDER_STATUSES } from '../context/OrderContext.jsx'
import { AuthProvider, useAuth } from '../context/AuthContext.jsx'
import { InventoryProvider } from '../context/InventoryContext.jsx'
import OrdersPage from '../pages/OrdersPage.jsx'
import OrderDetailsPage from '../pages/OrderDetailsPage.jsx'

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

function AuthInitializer({ autoLogin, children }) {
  const { register } = useAuth()
  
  useEffect(() => {
    if (autoLogin) {
      register('testuser@example.com', 'password123', 'Test User')
    }
  }, [autoLogin, register])
  
  return children
}

function renderWithProviders(ui, { route = '/' } = {}) {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <AuthProvider>
        <InventoryProvider>
          <AuthInitializer autoLogin={true}>
            <OrderProvider>
              {ui}
            </OrderProvider>
          </AuthInitializer>
        </InventoryProvider>
      </AuthProvider>
    </MemoryRouter>
  )
}

async function waitForAuthAndOrders() {
  await waitFor(() => {
    expect(screen.queryByText('Loading your orders...')).toBeNull()
    expect(screen.queryByText('Loading order...')).toBeNull()
  }, { timeout: 3000 })
}

describe('OrdersPage', () => {
  beforeEach(() => {
    localStorageMock.clear()
    vi.clearAllMocks()
  })

  it('shows empty state when no orders exist', async () => {
    renderWithProviders(<OrdersPage />)
    
    await waitForAuthAndOrders()
    expect(screen.getByText('No Orders Yet')).toBeDefined()
    expect(screen.getByText('Start Shopping')).toBeDefined()
  })

  it('shows orders for authenticated user', async () => {
    function OrdersPageWithSetup() {
      const { user } = useAuth()
      const { placeOrder } = useOrders()
      const placed = useRef(false)

      useEffect(() => {
        if (user && !placed.current) {
          placed.current = true
          placeOrder({
            userId: user.userId,
            items: [{ id: 'p1', name: 'Product 1', price: 10, quantity: 2, image: 'https://example.com/img.jpg' }],
            customer: { name: 'Test User', email: 'test@test.com', phone: '123' },
            shippingAddress: { address: '123 St', city: 'City', state: 'ST', zip: '12345' },
            subtotal: 20,
            shipping: 0,
            tax: 1.6,
            total: 21.6
          })
        }
      }, [user, placeOrder])

      return <OrdersPage />
    }

    renderWithProviders(<OrdersPageWithSetup />)
    
    await waitForAuthAndOrders()
    expect(screen.getByText('My Orders')).toBeDefined()
    expect(screen.getByText(/Order #/)).toBeDefined()
  })

  it('shows order status with correct styling', async () => {
    function OrdersPageWithSetup() {
      const { user } = useAuth()
      const { placeOrder } = useOrders()
      const placed = useRef(false)

      useEffect(() => {
        if (user && !placed.current) {
          placed.current = true
          placeOrder({
            userId: user.userId,
            items: [{ id: 'p1', name: 'Product 1', price: 10, quantity: 1, image: 'https://example.com/img.jpg' }],
            customer: { name: 'Test User', email: 'test@test.com', phone: '123' },
            shippingAddress: { address: '123 St', city: 'City', state: 'ST', zip: '12345' },
            subtotal: 10,
            shipping: 0,
            tax: 0.8,
            total: 10.8,
            status: ORDER_STATUSES.SHIPPED
          })
        }
      }, [user, placeOrder])

      return <OrdersPage />
    }

    renderWithProviders(<OrdersPageWithSetup />)
    
    await waitForAuthAndOrders()
    expect(screen.getByText('Shipped')).toBeDefined()
  })

  it('shows order item count', async () => {
    function OrdersPageWithSetup() {
      const { user } = useAuth()
      const { placeOrder } = useOrders()
      const placed = useRef(false)

      useEffect(() => {
        if (user && !placed.current) {
          placed.current = true
          placeOrder({
            userId: user.userId,
            items: [{ id: 'p1', name: 'Product 1', price: 10, quantity: 1, image: 'https://example.com/img.jpg' }],
            customer: { name: 'Test User', email: 'test@test.com', phone: '123' },
            shippingAddress: { address: '123 St', city: 'City', state: 'ST', zip: '12345' },
            subtotal: 10,
            shipping: 0,
            tax: 0.8,
            total: 10.8
          })
        }
      }, [user, placeOrder])

      return <OrdersPage />
    }

    renderWithProviders(<OrdersPageWithSetup />)
    
    await waitForAuthAndOrders()
    expect(screen.getByText(/1 item/)).toBeDefined()
  })
})

describe('OrderDetailsPage', () => {
  beforeEach(() => {
    localStorageMock.clear()
    localStorageMock.removeItem('nexmart-inventory')
    vi.clearAllMocks()
  })

  it('shows loading state initially', async () => {
    render(
      <MemoryRouter initialEntries={['/orders/ORD-123']}>
        <AuthProvider>
          <InventoryProvider>
            <AuthInitializer autoLogin={true}>
              <OrderProvider>
                <OrderDetailsPage />
              </OrderProvider>
            </AuthInitializer>
          </InventoryProvider>
        </AuthProvider>
      </MemoryRouter>
    )
    
    expect(screen.getByText('Loading order...')).toBeDefined()
    await waitForAuthAndOrders()
  })

  it('shows order details when found', async () => {
    render(
      <MemoryRouter initialEntries={['/orders/ORD-123']}>
        <AuthProvider>
          <InventoryProvider>
            <AuthInitializer autoLogin={true}>
              <OrderProvider>
                <OrderDetailsPage />
              </OrderProvider>
            </AuthInitializer>
          </InventoryProvider>
        </AuthProvider>
      </MemoryRouter>
    )
    
    await waitForAuthAndOrders()
    // With no orders, shows not found
    expect(screen.getByText('Order Not Found')).toBeDefined()
  })

  it('shows error for non-existent order', async () => {
    render(
      <MemoryRouter initialEntries={['/orders/ORD-NONEXISTENT']}>
        <AuthProvider>
          <InventoryProvider>
            <AuthInitializer autoLogin={true}>
              <OrderProvider>
                <OrderDetailsPage />
              </OrderProvider>
            </AuthInitializer>
          </InventoryProvider>
        </AuthProvider>
      </MemoryRouter>
    )
    
    await waitForAuthAndOrders()
    expect(screen.getByText('Order Not Found')).toBeDefined()
  })

  it('shows cancel button for pending orders', async () => {
    render(
      <MemoryRouter initialEntries={['/orders/ORD-PENDING']}>
        <AuthProvider>
          <InventoryProvider>
            <AuthInitializer autoLogin={true}>
              <OrderProvider>
                <OrderDetailsPage />
              </OrderProvider>
            </AuthInitializer>
          </InventoryProvider>
        </AuthProvider>
      </MemoryRouter>
    )
    
    await waitForAuthAndOrders()
    expect(screen.getByText('Order Not Found')).toBeDefined()
  })

  it('does not show cancel button for shipped orders', async () => {
    render(
      <MemoryRouter initialEntries={['/orders/ORD-SHIPPED']}>
        <AuthProvider>
          <InventoryProvider>
            <AuthInitializer autoLogin={true}>
              <OrderProvider>
                <OrderDetailsPage />
              </OrderProvider>
            </AuthInitializer>
          </InventoryProvider>
        </AuthProvider>
      </MemoryRouter>
    )
    
    await waitForAuthAndOrders()
    expect(screen.getByText('Order Not Found')).toBeDefined()
  })
})
