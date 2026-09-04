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

function SparkleIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 2l2.4 7.2h7.6l-6 4.8 2.4 7.2-6-4.8-6 4.8 2.4-7.2-6-4.8h7.6z" fill="currentColor" />
    </svg>
  )
}

export default function Hero() {
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

  return (
    <section style={{
      position: 'relative',
      width: '100%',
      overflow: 'hidden',
      overflowX: 'hidden',
      background: 'radial-gradient(ellipse at 30% 40%, #E0F2FE 0%, #F0F9FF 30%, #FFFFFF 60%, #F0F9FF 100%)'
    }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', position: 'relative', zIndex: 1, width: '100%', padding: '0 16px', boxSizing: 'border-box' }}>
        <div className="hero-grid" style={{
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: '24px',
          alignItems: 'center',
          width: '100%',
          padding: '24px 0 32px'
        }}>
          <div style={{ width: '100%', boxSizing: 'border-box' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 16px', borderRadius: 9999, background: C.primaryLight, color: C.primary, fontSize: 13, fontWeight: 600, marginBottom: 24 }}>
              <SparkleIcon size={14} />
              AI-Powered Shopping
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap', marginBottom: 16 }}>
              <span style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-0.04em', color: C.text }}>NexMart</span>
            </div>
            <h1 style={{ margin: 0, fontSize: 'clamp(28px, 8vw, 48px)', fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1.15, color: C.text }}>
              Shop Smarter with AI
            </h1>
            <p style={{ margin: '20px 0 0', maxWidth: 480, fontSize: 'clamp(15px, 4vw, 18px)', color: C.textSecondary, lineHeight: 1.7, fontWeight: 400 }}>
              Find, compare and choose the right products in seconds. Ask our AI assistant in natural language.
            </p>
          </div>

          <div className="hero-3d-panel" style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            width: '100%',
            boxSizing: 'border-box',
            maxHeight: '70vh',
            overflow: 'visible'
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
          gap: 24px;
          width: 100%;
          padding: 24px 16px 32px;
          box-sizing: border-box;
        }
        @media (min-width: 1024px) {
          .hero-grid {
            grid-template-columns: 1fr 1fr;
            gap: 64px;
            padding: 48px 0;
          }
        }
        .hero-3d-panel {
          display: block;
          width: 100%;
          max-width: 100%;
          overflow: visible;
        }
        @media (min-width: 768px) {
          .hero-3d-panel {
            display: flex;
          }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 0.9; }
          50% { transform: scale(1.1); opacity: 1; }
        }
      `}</style>
    </section>
  )
}
