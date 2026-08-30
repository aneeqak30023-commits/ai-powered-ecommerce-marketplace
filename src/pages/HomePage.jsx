import Hero from '../components/home/Hero'
import FeaturedCategories from '../components/home/FeaturedCategories'
import FeaturedProducts from '../components/home/FeaturedProducts'
import RecentlyViewedProducts from '../components/home/RecentlyViewedProducts'
import products from '../data/products.json'
import categories from '../data/categories.json'
import { useCart } from '../context/CartContext'

const C = {
  primary: '#6366F1',
  primaryLight: '#EEF2FF',
  text: '#0F172A',
  textSecondary: '#475569',
  border: '#E2E8F0',
  surface: '#FFFFFF'
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

export default function HomePage() {
  const featuredProducts = products.slice(0, 5)
  const { addToCart } = useCart()

  return (
    <div>
      <Hero />
      <RecentlyViewedProducts />

      {/* Categories Section */}
      <section style={{ background: C.surface }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px' }}>
          <FeaturedCategories categories={categories} />
        </div>
      </section>

      <div className="section-divider" style={{ height: 1, background: 'linear-gradient(90deg, transparent, #E2E8F0, transparent)' }} />

      {/* Featured Products - Editorial Showcase */}
      <section style={{ background: 'linear-gradient(180deg, #F8FAFC 0%, #FFFFFF 100%)' }}>
        <FeaturedProducts products={featuredProducts} onAddToCart={addToCart} />
      </section>

      <div className="section-divider" style={{ height: 1, background: 'linear-gradient(90deg, transparent, #E2E8F0, transparent)' }} />

      {/* How It Works - 3 Step Flow */}
      <section style={{ background: C.surface }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '80px 24px' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <div className="section-label" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 14px', borderRadius: 9999, background: C.primaryLight, color: C.primary, fontSize: 13, fontWeight: 600, marginBottom: 16 }}>
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

          {/* Mobile: Show vertical connector */}
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
      <section style={{ background: 'linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 100%)' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '80px 24px' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 style={{ fontSize: 28, fontWeight: 700, color: C.text, margin: '0 0 12px', letterSpacing: '-0.02em' }}>AI-Powered Features</h2>
            <p style={{ fontSize: 15, color: C.textSecondary, maxWidth: 500, margin: '0 auto' }}>Discover what makes NexMart different</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 24 }}>
            {AI_FEATURES.map((feature, idx) => (
              <div key={idx} style={{ background: C.surface, borderRadius: 20, border: '1px solid #E2E8F0', padding: 28, textAlign: 'center', transition: 'transform 0.2s ease, box-shadow 0.2s ease' }}
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
