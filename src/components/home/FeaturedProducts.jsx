import { useRef, useEffect, useState } from 'react'
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

  const cardWidth = 220
  const gap = 16
  const heroWidth = 380

  const heroProduct = products[0]
  const gridProducts = products.slice(1, 5)

  return (
    <section style={{ padding: '64px 0' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 36, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div className="section-label" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 14px', borderRadius: 9999, background: '#EEF2FF', color: '#6366F1', fontSize: 13, fontWeight: 600, marginBottom: 16 }}>
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

        <div style={{ position: 'relative' }}>
          {/* Carousel navigation - desktop */}
          {canScrollLeft && (
            <button
              type="button"
              onClick={() => scrollBy(-(heroWidth + gap))}
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
              onClick={() => scrollBy(heroWidth + gap)}
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
            className="carousel-row featured-carousel"
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
            {/* Hero Product (wider card) */}
            {heroProduct && (
              <div style={{
                scrollSnapAlign: 'start',
                flexShrink: 0,
                minWidth: heroWidth,
                width: heroWidth
              }}>
                <div style={{
                  position: 'relative',
                  borderRadius: 24,
                  overflow: 'hidden',
                  background: '#F8FAFC',
                  height: '100%',
                  border: `1px solid ${C.border}`
                }}>
                  <img
                    src={heroProduct.image}
                    alt={heroProduct.name}
                    style={{ width: '100%', height: 200, objectFit: 'cover' }}
                  />
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.7) 100%)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-end',
                    padding: 24
                  }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: '#A5B4FC', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
                      {heroProduct.categoryName || 'Featured'}
                    </span>
                    <h3 style={{ fontSize: 22, fontWeight: 700, color: 'white', margin: '0 0 8px' }}>{heroProduct.name}</h3>
                    <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', margin: '0 0 16px', maxWidth: 280, lineHeight: 1.5 }}>
                      {heroProduct.description?.slice(0, 120)}...
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                      <span style={{ fontSize: 24, fontWeight: 700, color: 'white' }}>${Number(heroProduct.price).toFixed(2)}</span>
                      <button
                        type="button"
                        onClick={() => onAddToCart && onAddToCart(heroProduct)}
                        style={{
                          padding: '11px 24px',
                          borderRadius: 9999,
                          border: 'none',
                          background: 'white',
                          color: '#6366F1',
                          fontSize: 14,
                          fontWeight: 600,
                          cursor: 'pointer',
                          transition: 'transform 0.2s ease'
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)' }}
                        onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none' }}
                      >
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Grid Products */}
            {gridProducts.map((product) => (
              <div key={product.id} style={{ scrollSnapAlign: 'start', flexShrink: 0, minWidth: cardWidth, width: cardWidth }}>
                <ProductCard product={product} onAddToCart={onAddToCart} onToggleWishlist={toggleWishlist} />
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .featured-carousel::-webkit-scrollbar { display: none; }
        .featured-carousel { -ms-overflow-style: none; }
      `}</style>
    </section>
  )
}
