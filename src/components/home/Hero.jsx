import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'

const C = {
  primary: '#6366F1',
  primaryDark: '#4F46E5',
  secondary: '#0EA5E5',
  surface: '#FFFFFF',
  text: '#0F172A',
  textSecondary: '#475569',
  border: '#E2E8F0',
  primaryLight: '#EEF2FF',
  gradient: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 50%, #EC4899 100%)'
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
    <section style={{
      position: 'relative',
      width: '100%',
      height: '100vh',
      minHeight: '100vh',
      maxHeight: '100vh',
      overflow: 'hidden',
      background: 'radial-gradient(ellipse at 30% 40%, #1E293B 0%, #0F172A 50%, #111827 100%)',
      display: 'flex',
      alignItems: 'center'
    }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', position: 'relative', zIndex: 1, width: '100%' }}>
        <div className="hero-grid" style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 'clamp(32px, 8vw, 64px)',
          alignItems: 'center',
          width: '100%'
        }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 16px', borderRadius: 9999, background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.2)', color: '#ffffff', fontSize: 13, fontWeight: 600, marginBottom: 24 }}>
              <SparkleIcon size={14} />
              AI-Powered Shopping
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap', marginBottom: 16 }}>
              <span style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-0.04em', color: '#ffffff', textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>NexMart</span>
            </div>
            <h1 style={{ margin: 0, fontSize: 'clamp(28px, 5vw, 48px)', fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1.1, color: '#ffffff', textShadow: '0 2px 8px rgba(0,0,0,0.4)' }}>
              Shop Smarter with AI
            </h1>
            <p style={{ margin: '20px 0 0', maxWidth: 480, fontSize: 'clamp(15px, 2vw, 18px)', color: '#E2E4EB', lineHeight: 1.7, fontWeight: 400 }}>
              Find, compare and choose the right products in seconds. Ask our AI assistant in natural language.
            </p>

            <div style={{ marginTop: 28, maxWidth: 500, position: 'relative' }}>
              <div style={{
                position: 'relative',
                background: C.surface,
                borderRadius: 9999,
                border: '1px solid #E2E8F0',
                boxShadow: '0 20px 40px -10px rgba(0,0,0,0.3), 0 0 0 1px rgba(0,0,0,0.03)',
                padding: '5px 5px 5px 22px',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                transition: 'box-shadow 0.2s ease, border-color 0.2s ease'
              }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = C.primary; e.currentTarget.style.boxShadow = '0 20px 40px -10px rgba(0,0,0,0.1), 0 0 0 3px rgba(99,102,241,0.08)' }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.boxShadow = '0 20px 40px -10px rgba(0,0,0,0.3), 0 0 0 1px rgba(0,0,0,0.03)' }}
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
                    background: C.gradient,
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
              <span style={{ fontSize: 13, color: '#94A3B8', fontWeight: 500 }}>Try:</span>
              {QUICK_SEARCHES.map((term) => (
                <button
                  key={term}
                  type="button"
                  onClick={() => handleQuickSearch(term)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: 9999,
                    border: '1px solid rgba(255,255,255,0.2)',
                    background: 'rgba(255,255,255,0.1)',
                    backdropFilter: 'blur(8px)',
                    color: '#E2E4EB',
                    fontSize: 13,
                    fontWeight: 500,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#60A5FA'; e.currentTarget.style.color = '#60A5FA'; e.currentTarget.style.background = 'rgba(96,165,250,0.15)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; e.currentTarget.style.color = '#E2E4EB'; e.currentTarget.style.background = 'rgba(255,255,255,0.1)' }}
                >
                  {term}
                </button>
              ))}
            </div>
          </div>

          <div className="hero-3d-panel" style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
            maxHeight: 'calc(100vh - 120px)'
          }}>
            {Hero3D ? <Hero3D /> : (
              <div style={{
                width: 300,
                height: 300,
                borderRadius: 24,
                background: 'radial-gradient(ellipse at 30% 40%, #4F46E5 0%, #1E293B 50%, #0F172A 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                border: '1px solid rgba(255,255,255,0.1)'
              }}>
                <div style={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 24,
                  boxShadow: '0 0 30px rgba(99,102,241,0.5)',
                  animation: 'pulse 2s infinite'
                }}>✨</div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .hero-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 32px;
        }
        @media (min-width: 1024px) {
          .hero-grid {
            grid-template-columns: 1fr 1fr;
            gap: 64px;
          }
        }
        .hero-3d-panel { display: none; }
        @media (min-width: 768px) {
          .hero-3d-panel { display: flex; }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 0.9; }
          50% { transform: scale(1.1); opacity: 1; }
        }
      `}</style>
    </section>
  )
}
