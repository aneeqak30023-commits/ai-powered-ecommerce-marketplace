import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useRecentlyViewed } from '../../context/RecentlyViewedContext'
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

function formatPrice(value) {
  return `$${Number(value).toFixed(2)}`
}

export default function RecentlyViewedProducts() {
  const { recentlyViewedItems, clearRecentlyViewed } = useRecentlyViewed()

  const recentlyViewedProducts = useMemo(() => {
    return recentlyViewedItems
      .map(item => allProducts.find(p => p.id === item.id))
      .filter(Boolean)
  }, [recentlyViewedItems])

  if (recentlyViewedProducts.length === 0) {
    return null
  }

  return (
    <section style={{ background: 'linear-gradient(180deg, #F8FAFC 0%, #FFFFFF 100%)' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '48px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: C.text, margin: '0 0 4px', letterSpacing: '-0.01em' }}>
              Recently Viewed
            </h2>
            <p style={{ fontSize: 13, color: C.textSecondary, margin: 0 }}>
              Continue exploring products you viewed
            </p>
          </div>
          <button
            type="button"
            onClick={clearRecentlyViewed}
            style={{
              background: 'none',
              border: 'none',
              color: C.textSecondary,
              fontSize: 13,
              fontWeight: 500,
              cursor: 'pointer',
              padding: '6px 12px',
              borderRadius: 8,
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = C.text; e.currentTarget.style.background = C.surface }}
            onMouseLeave={(e) => { e.currentTarget.style.color = C.textSecondary; e.currentTarget.style.background = 'transparent' }}
          >
            Clear history
          </button>
        </div>
        <div className="scroll-row" style={{ display: 'flex', gap: 16, overflowX: 'auto', paddingBottom: 8 }}>
          {recentlyViewedProducts.slice(0, 8).map((product) => (
            <Link
              key={product.id}
              to={`/products/${product.id}`}
              style={{
                width: 160,
                minWidth: 160,
                background: C.surface,
                borderRadius: 16,
                border: `1px solid ${C.border}`,
                overflow: 'hidden',
                textDecoration: 'none',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)'
                e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.08)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              <div style={{ aspectRatio: '1/1', overflow: 'hidden', background: '#F8FAFC' }}>
                <img
                  src={product.image}
                  alt={product.name}
                  loading="lazy"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
              <div style={{ padding: 12 }}>
                <h4 style={{ fontSize: 13, fontWeight: 600, color: C.text, margin: '0 0 4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {product.name}
                </h4>
                <span style={{ fontSize: 14, fontWeight: 700, color: C.primary }}>{formatPrice(product.price)}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
