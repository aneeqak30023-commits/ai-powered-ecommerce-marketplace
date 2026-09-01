import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import Hero from '../components/home/Hero'
import FeaturedCategories from '../components/home/FeaturedCategories'
import FeaturedProducts from '../components/home/FeaturedProducts'
import RecentlyViewedProducts from '../components/home/RecentlyViewedProducts'
import ProductCard from '../components/product/ProductCard.jsx'
import products from '../data/products.json'
import categories from '../data/categories.json'
import { useCart } from '../context/CartContext'
import { useWishlist } from '../context/WishlistContext.jsx'

const C = {
  primary: '#6366F1',
  primaryDark: '#4F46E5',
  secondary: '#0EA5E9',
  surface: '#FFFFFF',
  background: '#F8FAFC',
  text: '#0F172A',
  textSecondary: '#475569',
  border: '#E2E8F0',
  primaryLight: '#EEF2FF'
}

const AI_FEATURES = [
  { title: 'Smart Search', description: 'Find products using natural language in English, Urdu and Roman Urdu.', icon: '🔍' },
  { title: 'AI Comparison', description: 'Compare products using real catalog specifications and attributes.', icon: '⚖️' },
  { title: 'AI Recommendations', description: 'Get products matched to your budget, rating, and use case.', icon: '✨' },
  { title: 'Multilingual Search', description: 'Search naturally in multiple languages with instant results.', icon: '🌐' }
]

const HOW_IT_WORKS_STEPS = [
  { number: '01', title: 'Ask Anything', description: 'Type what you need in natural language - our AI understands context and intent.' },
  { number: '02', title: 'AI Analyzes', description: 'Our AI searches the catalog, compares options, and finds the best matches.' },
  { number: '03', title: 'Shop Confidently', description: 'Get personalized recommendations with detailed comparisons and reviews.' }
]

const SECTION_IDS = ['hero', 'categories', 'featured', 'ai-recommendations', 'recently-viewed', 'how-it-works', 'ai-features']
const SECTION_LABELS = ['Home', 'Categories', 'Featured', 'AI Picks', 'History', 'How it Works', 'Features']

export default function HomePage() {
  const featuredProducts = products.slice(0, 5)
  const aiRecommendedProducts = products.slice(7, 17).map((p, i) => ({
    ...p,
    aiMatchScore: 85 + (i * 3) % 14,
    aiMatchReason: ['Matches your style', 'Great value', 'Top rated', 'Trending pick', 'Editor choice'][i % 5]
  }))
  const { addToCart } = useCart()
  const { toggleWishlist } = useWishlist()
  const [activeSection, setActiveSection] = useState(0)
  const sectionRefs = useRef([])

  // Track active section on scroll (desktop only)
  useEffect(() => {
    const isDesktop = window.matchMedia('(min-width: 1024px)').matches
    if (!isDesktop) return

    const updateActiveSection = () => {
      const center = window.innerHeight / 2
      let closest = 0
      let minDistance = Infinity
      sectionRefs.current.forEach((ref, i) => {
        if (!ref) return
        const rect = ref.getBoundingClientRect()
        const sectionCenter = rect.top + rect.height / 2
        const distance = Math.abs(sectionCenter - center)
        if (distance < minDistance) {
          minDistance = distance
          closest = i
        }
      })
      setActiveSection(closest)
    }

    window.addEventListener('scroll', updateActiveSection, { passive: true })
    updateActiveSection()
    return () => window.removeEventListener('scroll', updateActiveSection)
  }, [])

  const scrollToSection = (index) => {
    const ref = sectionRefs.current[index]
    if (ref) {
      const offset = index === 0 ? 0 : 80
      const top = ref.getBoundingClientRect().top + window.scrollY - offset
      window.scrollTo({ top, behavior: 'smooth' })
    }
  }

  const renderCarousel = (items) => {
    return (
      <div
        className="carousel-row"
        style={{
          display: 'flex',
          gap: 16,
          overflowX: 'auto',
          paddingBottom: 8,
          scrollSnapType: 'x mandatory'
        }}
      >
        {items}
      </div>
    )
  }

  return (
    <div style={{ background: C.background, minHeight: '100vh' }}>
      {/* Navigation Dots (desktop only) */}
      <nav className="nav-dots" style={{
        position: 'fixed',
        right: 24,
        top: '50%',
        transform: 'translateY(-50%)',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        zIndex: 50
      }}>
        {SECTION_IDS.map((id, i) => {
          const isActive = activeSection === i
          return (
            <button
              key={id}
              onClick={() => scrollToSection(i)}
              title={SECTION_LABELS[i]}
              style={{
                width: isActive ? 20 : 12,
                height: 12,
                borderRadius: 9999,
                border: 'none',
                background: isActive
                  ? `linear-gradient(135deg, ${C.primary} 0%, ${C.primaryDark} 100%)`
                  : 'rgba(99,102,241,0.3)',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                padding: 0,
                position: 'relative'
              }}
              onMouseEnter={(e) => {
                if (!isActive) e.currentTarget.style.background = 'rgba(99,102,241,0.6)'
              }}
              onMouseLeave={(e) => {
                if (!isActive) e.currentTarget.style.background = 'rgba(99,102,241,0.3)'
              }}
            />
          )
        })}
      </nav>

      {/* Hero Section */}
      <section
        ref={el => sectionRefs.current[0] = el}
        id="hero"
        className="snap-section"
        style={{ minHeight: '90vh' }}
      >
        <Hero />
      </section>

      <div className="section-divider" style={{ height: 1, background: 'linear-gradient(90deg, transparent, #E2E8F0, transparent)' }} />

      {/* Categories — Horizontal Carousel */}
      <section
        ref={el => sectionRefs.current[1] = el}
        id="categories"
        className="snap-section"
        style={{ padding: '80px 0' }}
      >
        <FeaturedCategories categories={categories} />
      </section>

      <div className="section-divider" style={{ height: 1, background: 'linear-gradient(90deg, transparent, #E2E8F0, transparent)' }} />

      {/* Featured Products — Horizontal Carousel */}
      <section
        ref={el => sectionRefs.current[2] = el}
        id="featured"
        className="snap-section"
        style={{ padding: '64px 0' }}
      >
        <FeaturedProducts products={featuredProducts} onAddToCart={addToCart} />
      </section>

      <div className="section-divider" style={{ height: 1, background: 'linear-gradient(90deg, transparent, #E2E8F0, transparent)' }} />

      {/* AI Recommendations — Horizontal Carousel */}
      <section
        ref={el => sectionRefs.current[3] = el}
        id="ai-recommendations"
        className="snap-section"
        style={{ padding: '64px 0', background: 'linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 100%)' }}
      >
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
            <div>
              <div className="section-label" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 14px', borderRadius: 9999, background: C.primaryLight, color: C.primary, fontSize: 13, fontWeight: 600, marginBottom: 16 }}>
                <span>✨</span>
                AI Recommendations
              </div>
              <h2 style={{ fontSize: 28, fontWeight: 700, color: C.text, margin: '0 0 8px', letterSpacing: '-0.02em' }}>Recommended for You</h2>
              <p style={{ fontSize: 15, color: C.textSecondary, margin: 0 }}>Curated by our AI based on your profile</p>
            </div>
            <Link to="/products" className="pill-btn" style={{ textDecoration: 'none' }}>
              View All
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          </div>

          {renderCarousel(
            aiRecommendedProducts.map((product) => (
              <div key={product.id} style={{ scrollSnapAlign: 'start', flexShrink: 0, width: 220 }}>
                <ProductCard
                  product={product}
                  onAddToCart={addToCart}
                  aiScore={product.aiMatchScore}
                  aiReason={product.aiMatchReason}
                  onToggleWishlist={toggleWishlist}
                  showWishlistButton={true}
                />
              </div>
            )),
            'ai-rec'
          )}
        </div>
      </section>

      <div className="section-divider" style={{ height: 1, background: 'linear-gradient(90deg, transparent, #E2E8F0, transparent)' }} />

      {/* Recently Viewed — Horizontal Carousel */}
      <section
        ref={el => sectionRefs.current[4] = el}
        id="recently-viewed"
        className="snap-section"
      >
        <RecentlyViewedProducts />
      </section>

      <div className="section-divider" style={{ height: 1, background: 'linear-gradient(90deg, transparent, #E2E8F0, transparent)' }} />

      {/* How It Works — Smooth Section */}
      <section
        ref={el => sectionRefs.current[5] = el}
        id="how-it-works"
        className="snap-section"
        style={{ padding: '80px 0', background: C.surface }}
      >
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <div className="section-label" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px', borderRadius: 9999, background: C.primaryLight, color: C.primary, fontSize: 13, fontWeight: 600, marginBottom: 16 }}>
              Simple Process
            </div>
            <h2 style={{ fontSize: 32, fontWeight: 700, color: C.text, margin: '0 0 12px', letterSpacing: '-0.02em' }}>How NexMart AI Works</h2>
            <p style={{ fontSize: 16, color: C.textSecondary, maxWidth: 500, margin: '0 auto' }}>Shopping reimagined with artificial intelligence</p>
          </div>

          <div className="step-flow" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {HOW_IT_WORKS_STEPS.map((step, idx) => (
              <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', flex: 1, position: 'relative' }}>
                <div className="step-number" style={{ width: 56, height: 56, borderRadius: '50%', background: 'linear-gradient(135deg, #6366F1, #4F46E5)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 700, boxShadow: '0 8px 20px rgba(99, 102, 241, 0.3)', marginBottom: 20 }}>
                  {step.number}
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: C.text, marginBottom: 8, letterSpacing: '-0.01em' }}>{step.title}</h3>
                <p style={{ fontSize: 14, color: C.textSecondary, lineHeight: 1.7, maxWidth: 280, margin: 0 }}>{step.description}</p>
                {idx < HOW_IT_WORKS_STEPS.length - 1 && (
                  <div className="connector-line" style={{ display: 'none', flex: 1, height: 2, background: 'linear-gradient(90deg, #6366F1, #818CF8)', minWidth: 40, alignSelf: 'center' }} />
                )}
              </div>
            ))}
          </div>

          <style>{`
            @media (min-width: 768px) {
              .step-flow {
                flex-direction: row !important;
                align-items: flex-start !important;
                justify-content: center !important;
              }
              .connector-line {
                display: block !important;
                position: absolute;
                top: 28px;
                right: -50%;
                width: 100%;
                z-index: 0;
              }
            }
          `}</style>
        </div>
      </section>

      <div className="section-divider" style={{ height: 1, background: 'linear-gradient(90deg, transparent, #E2E8F0, transparent)' }} />

      {/* AI Features Grid */}
      <section
        ref={el => sectionRefs.current[6] = el}
        id="ai-features"
        className="snap-section"
        style={{ padding: '80px 0', background: 'linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 100%)' }}
      >
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 style={{ fontSize: 28, fontWeight: 700, color: C.text, margin: '0 0 12px', letterSpacing: '-0.02em' }}>AI-Powered Features</h2>
            <p style={{ fontSize: 15, color: C.textSecondary, maxWidth: 500, margin: '0 auto' }}>Discover what makes NexMart different</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 24 }}>
            {AI_FEATURES.map((feature, idx) => (
              <div
                key={idx}
                style={{
                  background: C.surface,
                  borderRadius: 20,
                  border: '1px solid #E2E8F0',
                  padding: 28,
                  textAlign: 'center',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.08)' }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none' }}
              >
                <div style={{ fontSize: 40, marginBottom: 16, lineHeight: 1, display: 'inline-block', padding: '14px', borderRadius: '50%', background: C.primaryLight }}>
                  {feature.icon}
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: C.text, marginBottom: 8, letterSpacing: '-0.01em' }}>{feature.title}</h3>
                <p style={{ fontSize: 14, color: C.textSecondary, lineHeight: 1.7, margin: 0 }}>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
