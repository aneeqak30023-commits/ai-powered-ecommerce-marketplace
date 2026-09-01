import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'

const C = {
  primary: '#6366F1',
  primaryDark: '#4F46E5',
  secondary: '#0EA5E9',
  surface: '#FFFFFF',
  text: '#0F172A',
  textSecondary: '#475569',
  primaryLight: '#EEF2FF'
}

const QUICK_SEARCHES = ['Headphones under $80', 'Best watches', 'Products for studying', 'Gaming accessories']

function SearchIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
      <path d="M21 21l-4.3-4.3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function SparkleIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 2l2.4 7.2h7.6l-6 4.8 2.4 7.2-6-4.8-6 4.8 2.4-7.2-6-4.8h7.6z" fill="currentColor" />
    </svg>
  )
}

export default function Hero() {
  const navigate = useNavigate()
  const [Hero3D, setHero3D] = useState(null)

  useEffect(() => {
    let cancelled = false
    import('./Hero3D.jsx').then((mod) => {
      if (!cancelled) {
        setHero3D(() => mod.default)
      }
    }).catch(() => {
      // 3D failed to load; keep UI functional without it
    })
    return () => {
      cancelled = true
    }
  }, [])

  const handleQuickSearch = (term) => {
    navigate(`/products?search=${encodeURIComponent(term)}`)
  }

  return (
    <section style={{ position: 'relative', padding: 'clamp(48px, 8vw, 96px) 24px', background: 'linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 100%)', overflow: 'hidden' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <div className="hero-grid">
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 16px', borderRadius: 9999, background: C.primaryLight, color: C.primary, fontSize: 13, fontWeight: 600, marginBottom: 24 }}>
              <SparkleIcon size={14} />
              AI-Powered Shopping
            </div>
            <h1 style={{ margin: 0, fontSize: 'clamp(32px, 5vw, 56px)', fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1.1, color: C.text }}>
              Shop Smarter with AI
            </h1>
            <p style={{ margin: '20px 0 0', maxWidth: 480, fontSize: 'clamp(15px, 2vw, 18px)', color: C.textSecondary, lineHeight: 1.7, fontWeight: 400 }}>
              Find, compare and choose the right products in seconds. Ask our AI assistant in natural language.
            </p>

            <div style={{ marginTop: 28, maxWidth: 500, position: 'relative' }}>
              <div style={{
                position: 'relative',
                background: C.surface,
                borderRadius: 9999,
                border: '1px solid #E2E8F0',
                boxShadow: '0 20px 40px -10px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.03)',
                padding: '5px 5px 5px 22px',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                transition: 'box-shadow 0.2s ease, border-color 0.2s ease'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = C.primary; e.currentTarget.style.boxShadow = '0 20px 40px -10px rgba(0,0,0,0.1), 0 0 0 3px rgba(99,102,241,0.08)' }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.boxShadow = '0 20px 40px -10px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.03)' }}
              >
                <SearchIcon size={20} />
                <input
                  type="text"
                  placeholder="What are you looking for today?"
                  style={{
                    flex: 1,
                    border: 'none',
                    background: 'transparent',
                    outline: 'none',
                    fontSize: 15,
                    color: C.text,
                    padding: '12px 0',
                    width: '100%'
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const q = e.target.value.trim()
                      if (q) navigate(`/products?search=${encodeURIComponent(q)}`)
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={(e) => {
                    const input = e.target.closest('div').querySelector('input')
                    const q = input.value.trim()
                    if (q) navigate(`/products?search=${encodeURIComponent(q)}`)
                  }}
                  style={{
                    padding: '12px 24px',
                    borderRadius: 9999,
                    border: 'none',
                    background: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)',
                    color: '#fff',
                    fontWeight: 600,
                    fontSize: 14,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'transform 0.15s ease, box-shadow 0.15s ease'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(99,102,241,0.3)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none' }}
                >
                  Search
                </button>
              </div>
            </div>

            <div style={{ marginTop: 20, display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 13, color: C.textSecondary, fontWeight: 500 }}>Try:</span>
              {QUICK_SEARCHES.map((term) => (
                <button
                  key={term}
                  type="button"
                  onClick={() => handleQuickSearch(term)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: 9999,
                    border: '1px solid #E2E8F0',
                    background: C.surface,
                    color: C.textSecondary,
                    fontSize: 13,
                    fontWeight: 500,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = C.primary; e.currentTarget.style.color = C.primary; e.currentTarget.style.background = C.primaryLight }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.color = C.textSecondary; e.currentTarget.style.background = C.surface }}
                >
                  {term}
                </button>
              ))}
            </div>
          </div>

          <div className="hero-3d-panel">
            {Hero3D ? <Hero3D /> : null}
          </div>
        </div>
      </div>

      <style>{`
        .hero-3d-panel { display: none; }
        @media (min-width: 1024px) {
          .hero-3d-panel { display: block; }
        }
      `}</style>
    </section>
  )
}
