import { useState, useRef, useEffect } from 'react'
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

export default function FeaturedCategories({ categories: catsProp }) {
  const categories = catsProp || categoriesData || []
  const [expandedCategory, setExpandedCategory] = useState(null)
  const scrollContainerRef = useRef(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  const updateScrollButtons = () => {
    const el = scrollContainerRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 10)
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10)
  }

  useEffect(() => {
    updateScrollButtons()
    const el = scrollContainerRef.current
    if (!el) return
    el.addEventListener('scroll', updateScrollButtons)
    return () => el.removeEventListener('scroll', updateScrollButtons)
  }, [])

  const scrollBy = (amount) => {
    const el = scrollContainerRef.current
    if (el) {
      el.scrollBy({ left: amount, behavior: 'smooth' })
    }
  }

  const cardWidth = 180
  const gap = 16

  return (
    <section style={{ padding: '80px 0' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px' }}>
        <div style={{ marginBottom: 40, textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px', borderRadius: 9999, background: C.primaryLight, color: C.primary, fontSize: 13, fontWeight: 600, marginBottom: 16 }}>
            Explore
          </div>
          <h2 style={{ fontSize: 32, fontWeight: 700, color: C.text, margin: '0 0 12px', letterSpacing: '-0.02em' }}>Popular Categories</h2>
          <p style={{ fontSize: 16, color: C.textSecondary, maxWidth: 500, margin: '0 auto' }}>Discover products across all categories</p>
        </div>

        <div style={{ position: 'relative' }}>
          {/* Carousel navigation - desktop */}
          {canScrollLeft && (
            <button
              type="button"
              onClick={() => scrollBy(-(cardWidth + gap))}
              className="carousel-nav carousel-nav-left"
              style={{
                position: 'absolute',
                left: -12,
                top: '50%',
                transform: 'translateY(-50%)',
                width: 40,
                height: 40,
                borderRadius: '50%',
                border: '1px solid #E2E8F0',
                background: 'rgba(255,255,255,0.9)',
                backdropFilter: 'blur(8px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                zIndex: 10,
                boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.1)' }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(-50%)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.06)' }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M15 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
          )}

          {canScrollRight && (
            <button
              type="button"
              onClick={() => scrollBy(cardWidth + gap)}
              className="carousel-nav carousel-nav-right"
              style={{
                position: 'absolute',
                right: -12,
                top: '50%',
                transform: 'translateY(-50%)',
                width: 40,
                height: 40,
                borderRadius: '50%',
                border: '1px solid #E2E8F0',
                background: 'rgba(255,255,255,0.9)',
                backdropFilter: 'blur(8px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                zIndex: 10,
                boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.1)' }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(-50%)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.06)' }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
          )}

          <div
            ref={scrollContainerRef}
            className="carousel-row categories-carousel"
            style={{
              display: 'flex',
              gap: 20,
              overflowX: 'auto',
              paddingBottom: 8,
              scrollSnapType: 'x mandatory',
              msOverflowStyle: 'none',
              scrollbarWidth: 'none'
            }}
          >
            {categories.map((cat) => {
              const colors = CATEGORY_COLORS[cat.id] || { bg: C.surface, accent: C.primary }
              const isExpanded = expandedCategory === cat.id
              const hasSubcategories = cat.subcategories && cat.subcategories.length > 0

              return (
                <div
                  key={cat.id}
                  style={{ position: 'relative', scrollSnapAlign: 'start', flexShrink: 0 }}
                >
                  <Link
                    to={`/products?category=${cat.id}`}
                    className="category-card-visual"
                    style={{
                      background: colors.bg,
                      border: `1px solid ${colors.accent}25`,
                      borderRadius: 20,
                      padding: '28px 24px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 12,
                      minWidth: 160,
                      width: 180,
                      textDecoration: 'none',
                      transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.3s ease',
                      cursor: hasSubcategories ? 'pointer' : 'pointer'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-8px)'
                      e.currentTarget.style.boxShadow = `0 20px 40px -10px ${colors.accent}30`
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)'
                      e.currentTarget.style.boxShadow = 'none'
                    }}
                    onClick={(e) => {
                      if (hasSubcategories) {
                        e.preventDefault()
                        setExpandedCategory(isExpanded ? null : cat.id)
                      }
                    }}
                  >
                    <div style={{
                      width: 72,
                      height: 72,
                      borderRadius: 20,
                      background: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 36,
                      boxShadow: `0 8px 20px ${colors.accent}15`
                    }}>
                      {CATEGORY_ICONS[cat.id] || cat.icon || '🛍️'}
                    </div>
                    <span style={{ fontSize: 16, fontWeight: 700, color: C.text, textAlign: 'center', letterSpacing: '-0.01em' }}>{cat.name}</span>
                    <span style={{ fontSize: 13, color: C.textSecondary }}>{cat.productCount} products</span>
                  </Link>

                  {/* Subcategories dropdown */}
                  {hasSubcategories && isExpanded && (
                    <div style={{
                      position: 'absolute',
                      top: '100%',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      marginTop: 12,
                      background: C.surface,
                      border: `1px solid ${C.border}`,
                      borderRadius: 16,
                      padding: 12,
                      boxShadow: '0 20px 40px -10px rgba(0,0,0,0.12)',
                      zIndex: 50,
                      minWidth: 180,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 4
                    }}>
                      {cat.subcategories.map((sub) => (
                        <Link
                          key={sub.id}
                          to={`/products?category=${cat.id}`}
                          style={{
                            padding: '10px 14px',
                            borderRadius: 10,
                            color: C.text,
                            textDecoration: 'none',
                            fontSize: 14,
                            fontWeight: 500,
                            transition: 'background 0.15s ease'
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = C.primaryLight }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
                        >
                          {sub.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <style>{`
        .categories-carousel::-webkit-scrollbar { display: none; }
        .categories-carousel { -ms-overflow-style: none; }
      `}</style>
    </section>
  )
}
