import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { CartProvider } from '../../context/CartContext.jsx'
import { WishlistProvider } from '../../context/WishlistContext.jsx'
import { InventoryProvider } from '../../context/InventoryContext.jsx'
import ProductCard from './ProductCard.jsx'

const mockProduct = {
  id: 7,
  name: 'Smart Home Speaker',
  price: 99.99,
  originalPrice: 139.99,
  categoryId: 'electronics',
  categoryName: 'Electronics',
  rating: 4.2,
  reviewCount: 156,
  image: 'https://example.com/image.jpg',
  description: '360-degree smart speaker',
  specifications: { Output: '20W', Connectivity: 'WiFi, Bluetooth' },
  stock: 18,
  subcategory: 'accessories',
  tags: ['speaker', 'smart-home', 'voice']
}

function renderWithProviders(ui) {
  return render(
    <MemoryRouter>
      <InventoryProvider>
        <CartProvider>
          <WishlistProvider>
            {ui}
          </WishlistProvider>
        </CartProvider>
      </InventoryProvider>
    </MemoryRouter>
  )
}

describe('ProductCard navigation', () => {
  it('renders a link to the product detail page with correct href', () => {
    renderWithProviders(
      <ProductCard product={mockProduct} onAddToCart={() => {}} onToggleWishlist={() => {}} />
    )
    const link = screen.getByRole('link')
    expect(link).toBeDefined()
    expect(link.getAttribute('href')).toBe('/products/7')
  })

  it('displays the product name', () => {
    renderWithProviders(
      <ProductCard product={mockProduct} onAddToCart={() => {}} onToggleWishlist={() => {}} />
    )
    expect(screen.getByText('Smart Home Speaker')).toBeDefined()
  })

  it('displays the product price', () => {
    renderWithProviders(
      <ProductCard product={mockProduct} onAddToCart={() => {}} onToggleWishlist={() => {}} />
    )
    expect(screen.getByText('$99.99')).toBeDefined()
  })
})
