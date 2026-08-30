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
  electronics: { bg: '#EEF2FF', accent: '#6366F1' },
  fashion: { bg: '#FDF2F8', accent: '#EC4899' },
  'home-kitchen': { bg: '#F0FDF4', accent: '#10B981' },
  sports: { bg: '#FFF7ED', accent: '#F97316' },
  books: { bg: '#FFFBEB', accent: '#EAB308' },
  beauty: { bg: '#FDF2F8', accent: '#A855F7' }
}

const CATEGORY_ICONS = {
  electronics: '💻',
  fashion: '👗',
  'home-kitchen': '🏠',
  sports: '⚽',
  books: '📚',
  beauty: '✨'
}

export default function FeaturedCategories() {
  const categories = categoriesData || []

  return (
    <section style={{ padding: '64px 0' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px' }}>
        <div style={{ marginBottom: 36 }}>
          <h2 style={{ fontSize: 28, fontWeight: 700, color: C.text, margin: '0 0 8px', letterSpacing: '-0.02em' }}>Popular Categories</h2>
          <p style={{ fontSize: 15, color: C.textSecondary, margin: 0 }}>Browse products by category</p>
        </div>
        <div className="scroll-row" style={{ display: 'flex', gap: 16, overflowX: 'auto', paddingBottom: 16 }}>
          {categories.map((cat) => {
            const colors = CATEGORY_COLORS[cat.id] || { bg: C.surface, accent: C.primary }
            return (
              <Link
                key={cat.id}
                to={`/products?category=${cat.id}`}
                className="category-card-h"
                style={{ background: colors.bg, border: `1px solid ${colors.accent}20` }}
              >
                <div style={{
                  width: 64,
                  height: 64,
                  borderRadius: 16,
                  background: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 32,
                  boxShadow: `0 4px 12px ${colors.accent}15`
                }}>
                  {CATEGORY_ICONS[cat.id] || cat.icon || '🛍️'}
                </div>
                <span style={{ fontSize: 15, fontWeight: 600, color: C.text, textAlign: 'center' }}>{cat.name}</span>
                <span style={{ fontSize: 12, color: C.textSecondary }}>{cat.productCount} products</span>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
