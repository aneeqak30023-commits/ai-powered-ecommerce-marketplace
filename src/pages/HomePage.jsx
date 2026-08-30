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

export default function HomePage() {
  const featuredProducts = products.slice(0, 8)
  const { addToCart } = useCart()

  return (
    <div>
      <Hero />
      <RecentlyViewedProducts />

      <section className="section-sm" style={{ background: C.surface, borderBottom: `1px solid ${C.border}` }}>
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <h2 className="section-title">Popular Categories</h2>
            <p className="section-subtitle">Browse products by category</p>
          </div>
          <FeaturedCategories categories={categories} />
        </div>
      </section>

      <section className="section-sm" style={{ background: 'linear-gradient(180deg, #F8FAFC 0%, #FFFFFF 100%)' }}>
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 14px', borderRadius: 9999, background: C.primaryLight, color: C.primary, fontSize: 13, fontWeight: 600, marginBottom: 16 }}>
              <span>✨</span>
              AI Recommended
            </div>
            <h2 className="section-title">Curated for You</h2>
            <p className="section-subtitle">Top picks based on ratings, reviews and popularity</p>
          </div>
          <FeaturedProducts products={featuredProducts} onAddToCart={addToCart} />
        </div>
      </section>

      <section className="section" style={{ background: C.surface }}>
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 className="section-title">How NexMart AI Works</h2>
            <p className="section-subtitle">Shopping reimagined with artificial intelligence</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 24 }}>
            {AI_FEATURES.map((feature, idx) => (
              <div key={idx} className="card card-hover" style={{ padding: 32, textAlign: 'center' }}>
                <div style={{ fontSize: 40, marginBottom: 16, lineHeight: 1 }}>{feature.icon}</div>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: C.text, marginBottom: 10 }}>{feature.title}</h3>
                <p style={{ fontSize: 15, color: C.textSecondary, lineHeight: 1.6 }}>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section" style={{ background: 'linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 100%)' }}>
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 className="section-title">Featured Products</h2>
            <p className="section-subtitle">Handpicked products from our catalog</p>
          </div>
          <FeaturedProducts products={featuredProducts} onAddToCart={addToCart} />
        </div>
      </section>
    </div>
  )
}
