import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import ProductCard from '../product/ProductCard'
import { useCart } from '../../context/CartContext'
import { useWishlist } from '../../context/WishlistContext'
import allProducts from '../../data/products.json'

const C = {
  primary: '#6366F1',
  primaryDark: '#4F46E5',
  surface: '#FFFFFF',
  background: '#F8FAFC',
  text: '#0F172A',
  textSecondary: '#475569',
  border: '#E2E8F0'
}

export default function WishlistPage() {
  const { addToCart } = useCart()
  const { wishlistItems, removeFromWishlist } = useWishlist()

  const wishlistProducts = useMemo(() => {
    return wishlistItems
      .map(item => allProducts.find(p => p.id === item.id))
      .filter(Boolean)
  }, [wishlistItems])

  const handleAddToCart = (product) => {
    addToCart(product)
  }

  const handleRemove = (id) => {
    removeFromWishlist(id)
  }

  return (
    <div style={{ minHeight: '100vh', background: C.background }}>
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 700, color: C.text, margin: '0 0 4px', letterSpacing: '-0.02em' }}>
              My Wishlist
            </h1>
            <p style={{ fontSize: 14, color: C.textSecondary, margin: 0 }}>
              {wishlistProducts.length} {wishlistProducts.length === 1 ? 'item' : 'items'} saved
            </p>
          </div>
          {wishlistProducts.length > 0 && (
            <Link
              to="/products"
              style={{
                padding: '10px 20px',
                borderRadius: 10,
                border: `1px solid ${C.border}`,
                background: C.surface,
                color: C.text,
                fontSize: 14,
                fontWeight: 600,
                textDecoration: 'none',
                transition: 'all .15s ease'
              }}
            >
              Continue Shopping
            </Link>
          )}
        </div>

        {wishlistProducts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 20px' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>💜</div>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: C.text, margin: '0 0 8px' }}>
              Your wishlist is empty
            </h2>
            <p style={{ fontSize: 16, color: C.textSecondary, margin: '0 0 24px', maxWidth: 420, marginLeft: 'auto', marginRight: 'auto', lineHeight: 1.6 }}>
              Save items you love by clicking the heart icon on any product. They'll appear here for easy access.
            </p>
            <Link
              to="/products"
              style={{
                display: 'inline-block',
                padding: '12px 24px',
                background: `linear-gradient(135deg, ${C.primary} 0%, ${C.primaryDark} 100%)`,
                color: '#fff',
                textDecoration: 'none',
                borderRadius: 10,
                fontWeight: 600
              }}
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 24 }}>
            {wishlistProducts.map(product => (
              <div key={product.id} style={{ position: 'relative' }}>
                <ProductCard
                  product={product}
                  onAddToCart={handleAddToCart}
                  onToggleWishlist={handleRemove}
                  showWishlistButton={false}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
