import { Link } from 'react-router-dom'
import categoriesData from '../../data/categories.json'

const C = {
  surface: '#FFFFFF',
  text: '#0F172A',
  textSecondary: '#475569',
  border: '#E2E8F0',
  primary: '#4F46E5'
}

export default function FeaturedCategories() {
  const categories = categoriesData || []

  return (
    <section style={{ padding: '32px 20px', maxWidth: 1200, margin: '0 auto' }}>
      <h2 style={{ fontSize: 24, fontWeight: 700, color: C.text, margin: '0 0 20px' }}>Shop by Category</h2>

      <div style={{ display: 'flex', gap: 16, overflowX: 'auto', paddingBottom: 8, scrollSnapType: 'x mandatory' }}>
        {categories.map((cat) => (
          <Link
            key={cat.id}
            to={`/products?category=${cat.id}`}
            style={{
              flex: '0 0 auto',
              width: 160,
              scrollSnapAlign: 'start',
              background: C.surface,
              border: `1px solid ${C.border}`,
              borderRadius: 12,
              padding: 20,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 12,
              textDecoration: 'none',
              boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)',
              transition: 'transform .2s ease, box-shadow .2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)'
              e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.06)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'none'
              e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)'
            }}
          >
            <div style={{ fontSize: 44, lineHeight: 1 }}>{cat.icon || '🛍️'}</div>
            <span style={{ fontSize: 15, fontWeight: 600, color: C.text }}>{cat.name}</span>
          </Link>
        ))}
      </div>
    </section>
  )
}
