import { useMemo } from 'react'
import ProductCard from '../product/ProductCard'
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
    <section className="section-sm" style={{ background: C.background, borderBottom: `1px solid ${C.border}` }}>
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: C.text, margin: '0 0 4px', letterSpacing: '-0.01em' }}>
              Recently Viewed
            </h2>
            <p style={{ fontSize: 14, color: C.textSecondary, margin: 0 }}>
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
              transition: 'color .15s ease'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = C.text }}
            onMouseLeave={(e) => { e.currentTarget.style.color = C.textSecondary }}
          >
            Clear history
          </button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 20 }}>
          {recentlyViewedProducts.slice(0, 8).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  )
}
