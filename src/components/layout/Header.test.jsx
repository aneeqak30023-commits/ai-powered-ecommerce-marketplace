import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter, useLocation } from 'react-router-dom'
import { CartProvider } from '../../context/CartContext.jsx'
import { WishlistProvider } from '../../context/WishlistContext.jsx'
import { InventoryProvider } from '../../context/InventoryContext.jsx'
import { AuthProvider } from '../../context/AuthContext.jsx'
import Header from './Header.jsx'

function LocationDisplay() {
  const location = useLocation()
  return <div data-testid="location">{location.pathname}</div>
}

function renderWithProviders(ui) {
  return render(
    <MemoryRouter>
      <AuthProvider>
        <InventoryProvider>
          <CartProvider>
            <WishlistProvider>
              {ui}
              <LocationDisplay />
            </WishlistProvider>
          </CartProvider>
        </InventoryProvider>
      </AuthProvider>
    </MemoryRouter>
  )
}

describe('Header navigation', () => {
  it('navigates to Products when Products link is clicked', () => {
    renderWithProviders(<Header />)
    const productsLink = screen.getByRole('link', { name: /products/i })
    fireEvent.click(productsLink)
    expect(screen.getByTestId('location').textContent).toBe('/products')
  })

  it('navigates to Wishlist when Wishlist icon button is clicked', () => {
    renderWithProviders(<Header />)
    const wishlistButton = screen.getByRole('button', { name: /open wishlist/i })
    fireEvent.click(wishlistButton)
    expect(screen.getByTestId('location').textContent).toBe('/wishlist')
  })

  it('navigates to Cart when Cart icon button is clicked', () => {
    renderWithProviders(<Header />)
    const cartButton = screen.getByRole('button', { name: /open cart/i })
    fireEvent.click(cartButton)
    expect(screen.getByTestId('location').textContent).toBe('/cart')
  })

  it('renders all desktop navigation links', () => {
    renderWithProviders(<Header />)
    expect(screen.getByRole('link', { name: /home/i })).toBeDefined()
    expect(screen.getByRole('link', { name: /products/i })).toBeDefined()
    expect(screen.getByRole('link', { name: /categories/i })).toBeDefined()
    expect(screen.getByRole('link', { name: /wishlist/i })).toBeDefined()
    expect(screen.getByRole('link', { name: /ai assistant/i })).toBeDefined()
  })
})
