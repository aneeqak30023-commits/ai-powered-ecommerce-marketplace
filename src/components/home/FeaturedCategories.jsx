import { Link } from 'react-router-dom'
import categoriesData from '../../data/categories.json'

const C = {
  surface: '#FFFFFF',
  text: '#0F172A',
  textSecondary: '#475569',
  border: '#E2E8F0',
  primary: '#6366F1',
  primaryLight: '#EEF2FF'
}

const CATEGORY_COLORS = {
  electronics: '#EEF2FF',
  fashion: '#FDF2F8',
  'home-kitchen': '#F0FDF4',
  sports: '#FFF7ED',
  books: '#FFFBEB',
  beauty: '#FDF2F8'
}

export default function FeaturedCategories() {
  const categories = categoriesData || []

  return (
    <section style={{ padding: '32px 0' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16 }}>
        {categories.map((cat) => (
          <Link
            key={cat.id}
            to={`/products?category=${cat.id}`}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 12,
              padding: '24px 16px',
              borderRadius: 16,
              background: CATEGORY_COLORS[cat.id] || C.surface,
              border: `1px solid ${C.border}`,
              textDecoration: 'none',
              transition: 'transform .25s ease, box-shadow .25s ease',
              position: 'relative',
              overflow: 'hidden'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)'
              e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0,0,0,0.05), 0 10px 10px -5px rgba(0,0,0,0.02)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'none'
              e.currentTarget.style.boxShadow = 'none'
            }}
          >
            <div style={{
              width: 56,
              height: 56,
              borderRadius: 16,
              background: C.surface,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 28,
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
            }}>
              {cat.icon || '🛍️'}
            </div>
            <span style={{ fontSize: 15, fontWeight: 600, color: C.text, textAlign: 'center' }}>{cat.name}</span>
          </Link>
        ))}
      </div>
    </section>
  )
}
