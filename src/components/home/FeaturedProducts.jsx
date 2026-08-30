import { Link } from 'react-router-dom'
import ProductCard from '../product/ProductCard.jsx'
import productsData from '../../data/products.json'
import { useWishlist } from '../../context/WishlistContext.jsx'

const C = {
  primary: '#6366F1',
  text: '#0F172A',
  surface: '#FFFFFF',
  textSecondary: '#475569'
}

export default function FeaturedProducts({ allProducts, onAddToCart }) {
  const products = (allProducts && allProducts.length ? allProducts : productsData || []).slice(0, 5)
  const { toggleWishlist } = useWishlist()

  const heroProduct = products[0]
  const gridProducts = products.slice(1, 5)

  return (
    <section style={{ padding: '64px 0' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 36, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div className="section-label">
              <span>✨</span>
              Featured
            </div>
            <h2 style={{ fontSize: 28, fontWeight: 700, color: C.text, margin: '0 0 8px', letterSpacing: '-0.02em' }}>Featured Products</h2>
            <p style={{ fontSize: 15, color: C.textSecondary, margin: 0 }}>Handpicked products from our catalog</p>
          </div>
          <Link to="/products" className="pill-btn" style={{ textDecoration: 'none' }}>
            View All
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </div>

        <div className="editorial-grid">
          {heroProduct && (
            <div style={{ position: 'relative', borderRadius: 24, overflow: 'hidden', background: '#F8FAFC', minHeight: 300 }}>
              <img
                src={heroProduct.image}
                alt={heroProduct.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover', minHeight: 300 }}
              />
              <div style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.7) 100%)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-end',
                padding: 32
              }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: '#A5B4FC', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
                  {heroProduct.categoryName || 'Featured'}
                </span>
                <h3 style={{ fontSize: 24, fontWeight: 700, color: 'white', margin: '0 0 8px' }}>{heroProduct.name}</h3>
                <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.8)', margin: '0 0 16px', maxWidth: 400 }}>
                  {heroProduct.description?.slice(0, 100)}...
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <span style={{ fontSize: 24, fontWeight: 700, color: 'white' }}>${Number(heroProduct.price).toFixed(2)}</span>
                  <button
                    type="button"
                    onClick={() => onAddToCart && onAddToCart(heroProduct)}
                    style={{
                      padding: '12px 24px',
                      borderRadius: 9999,
                      border: 'none',
                      background: 'white',
                      color: '#6366F1',
                      fontSize: 14,
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'transform 0.2s ease'
                    }}
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          )}
          {gridProducts.map((product) => (
            <ProductCard key={product.id} product={product} onAddToCart={onAddToCart} onToggleWishlist={toggleWishlist} />
          ))}
        </div>
      </div>
    </section>
  )
}
