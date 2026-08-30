import { Link } from 'react-router-dom'
import ProductCard from './ProductCard.jsx'
import { useWishlist } from '../../context/WishlistContext.jsx'

const C = {
  surface: '#FFFFFF',
  background: '#F8FAFC',
  text: '#0F172A',
  textSecondary: '#475569',
  border: '#E2E8F0',
  primary: '#6366F1'
}

function SkeletonCard() {
  return (
    <div
      style={{
        background: C.surface,
        borderRadius: 16,
        border: `1px solid ${C.border}`,
        overflow: 'hidden'
      }}
    >
      <div className="nx-shimmer" style={{ aspectRatio: '1 / 1', width: '100%' }} />
      <div style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div className="nx-shimmer" style={{ height: 16, width: '85%', borderRadius: 6 }} />
        <div className="nx-shimmer" style={{ height: 12, width: '50%', borderRadius: 6 }} />
        <div className="nx-shimmer" style={{ height: 22, width: '40%', borderRadius: 6, marginTop: 4 }} />
        <div className="nx-shimmer" style={{ height: 38, width: '100%', borderRadius: 8, marginTop: 6 }} />
      </div>
    </div>
  )
}

function EmptyState({ message }) {
  return (
    <div
      style={{
        gridColumn: '1 / -1',
        textAlign: 'center',
        padding: '60px 20px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 14
      }}
    >
      <svg width="64" height="64" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M3 4h2l2.4 12.3a1 1 0 0 0 1 .8h8.7a1 1 0 0 0 1-.8L21 8H6" stroke={C.border} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="9.5" cy="20" r="1.4" fill={C.border} />
        <circle cx="17.5" cy="20" r="1.4" fill={C.border} />
      </svg>
      <p style={{ margin: 0, fontSize: 16, color: C.textSecondary }}>{message || 'No products found.'}</p>
      <Link
        to="/products"
        style={{
          marginTop: 4,
          padding: '10px 20px',
          background: C.primary,
          color: '#fff',
          textDecoration: 'none',
          borderRadius: 10,
          fontWeight: 600,
          fontSize: 14
        }}
      >
        Browse Products
      </Link>
    </div>
  )
}

export default function ProductGrid({ products = [], loading = false, emptyMessage, onAddToCart }) {
  const { toggleWishlist } = useWishlist()

  return (
    <>
      <style>{`
        .nx-shimmer { background: linear-gradient(90deg, #eef1f5 25%, #e2e8f0 37%, #eef1f5 63%); background-size: 400% 100%; animation: nx-shimmer 1.4s ease infinite; }
        @keyframes nx-shimmer { 0% { background-position: 100% 0; } 100% { background-position: 0 0; } }
      `}</style>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: 24,
          padding: '8px 0'
        }}
      >
        {loading ? (
          Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
        ) : products.length === 0 ? (
          <EmptyState message={emptyMessage} />
        ) : (
          products.map((product) => (
            <ProductCard key={product.id} product={product} onAddToCart={onAddToCart} onToggleWishlist={toggleWishlist} />
          ))
        )}
      </div>
    </>
  )
}
