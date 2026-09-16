import React from 'react'

const C = {
  primary: '#6366F1',
  primaryDark: '#4F46E5',
  secondary: '#0EA5E5',
  surface: '#FFFFFF',
  text: '#0F172A',
  textSecondary: '#475569',
  border: '#E2E8F0',
  primaryLight: '#EEF2FF',
  gradient: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 50%, #EC4899 100%)',
}

function SparkleIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 2l2.4 7.2h7.6l-6 4.8 2.4 7.2-6-4.8-6 4.8 2.4-7.2-6-4.8h7.6z" fill="currentColor" />
    </svg>
  )
}

function ShoppingBagIcon({ size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  )
}

function SearchIcon({ size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  )
}

function CompareIcon({ size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M18 9V4a1 1 0 0 0-1-1h-4a1 1 0 0 0 0 2h3v5H6v2h8a2 2 0 0 1 2 2v3" />
      <path d="M6 15v4a1 1 0 0 0 1 1h4a1 1 0 0 0 0-2h-3v-5h12v-2H8a2 2 0 0 0-2-2v-3" />
    </svg>
  )
}

function ProductBoxIcon({ size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  )
}

function ArrowRightIcon({ size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  )
}

function HeroVisual() {
  return (
    <div style={{
      position: 'relative',
      width: '100%',
      maxWidth: 560,
      aspectRatio: '4 / 3',
      margin: '0 auto',
      borderRadius: 24,
      background: `
        radial-gradient(ellipse at 20% 15%, rgba(99, 102, 241, 0.12) 0%, transparent 55%),
        radial-gradient(ellipse at 80% 80%, rgba(14, 165, 229, 0.1) 0%, transparent 50%),
        linear-gradient(155deg, #EEF2FF 0%, #FFFFFF 40%, #F8FAFC 100%)
      `,
      border: '1px solid rgba(99, 102, 241, 0.1)',
    }}>
      {/* Subtle grid pattern */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: `
          linear-gradient(rgba(99, 102, 241, 0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(99, 102, 241, 0.03) 1px, transparent 1px)
        `,
        backgroundSize: '40px 40px',
        pointerEvents: 'none',
        opacity: 0.5
      }} />

      {/* Center connection line */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '10%',
        right: '10%',
        height: 1,
        background: 'linear-gradient(90deg, transparent, rgba(99, 102, 241, 0.2), transparent)',
        pointerEvents: 'none',
        zIndex: 1
      }} />

      {/* Left cluster - Search & Discovery */}
      <div style={{
        position: 'absolute',
        top: '18%',
        left: '8%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 16,
        zIndex: 2,
        pointerEvents: 'none'
      }}>
        <div style={{
          width: 72,
          height: 72,
          borderRadius: 18,
          background: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 8px 24px rgba(99, 102, 241, 0.25)'
        }}>
          <SearchIcon size={32} style={{ color: '#fff' }} />
        </div>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 4
        }}>
          <span style={{
            fontSize: 13,
            fontWeight: 600,
            color: C.text,
            letterSpacing: '0.02em'
          }}>Smart Search</span>
          <span style={{
            fontSize: 11,
            fontWeight: 400,
            color: C.textSecondary
          }}>Natural language</span>
        </div>
      </div>

      {/* Center - AI Core */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 12,
        zIndex: 3,
        pointerEvents: 'none'
      }}>
        <div style={{
          width: 84,
          height: 84,
          borderRadius: 20,
          background: 'linear-gradient(135deg, #4F46E5 0%, #6366F1 50%, #0EA5E5 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 12px 32px rgba(99, 102, 241, 0.3)'
        }}>
          <SparkleIcon size={36} style={{ color: '#fff', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.15))' }} />
        </div>
        <div style={{
          display: 'flex',
          gap: 6
        }}>
          <span style={{
            padding: '4px 10px',
            background: 'rgba(99, 102, 241, 0.1)',
            border: '1px solid rgba(99, 102, 241, 0.15)',
            borderRadius: 9999,
            fontSize: 11,
            fontWeight: 600,
            color: C.primary,
            letterSpacing: '0.02em'
          }}>AI</span>
          <span style={{
            padding: '4px 10px',
            background: 'rgba(14, 165, 229, 0.1)',
            border: '1px solid rgba(14, 165, 229, 0.15)',
            borderRadius: 9999,
            fontSize: 11,
            fontWeight: 600,
            color: C.secondary,
            letterSpacing: '0.02em'
          }}>ML</span>
        </div>
      </div>

      {/* Right cluster - Compare & Decide */}
      <div style={{
        position: 'absolute',
        top: '18%',
        right: '8%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 16,
        zIndex: 2,
        pointerEvents: 'none'
      }}>
        <div style={{
          width: 72,
          height: 72,
          borderRadius: 18,
          background: 'linear-gradient(135deg, #0EA5E5 0%, #6366F1 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 8px 24px rgba(14, 165, 229, 0.25)'
        }}>
          <CompareIcon size={32} style={{ color: '#fff' }} />
        </div>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 4
        }}>
          <span style={{
            fontSize: 13,
            fontWeight: 600,
            color: C.text,
            letterSpacing: '0.02em'
          }}>AI Compare</span>
          <span style={{
            fontSize: 11,
            fontWeight: 400,
            color: C.textSecondary
          }}>Side by side</span>
        </div>
      </div>

      {/* Bottom - Shopping bag with product icons */}
      <div style={{
        position: 'absolute',
        bottom: '15%',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 14,
        zIndex: 2,
        pointerEvents: 'none'
      }}>
        <div style={{
          position: 'relative',
          width: 100,
          height: 100,
          borderRadius: 22,
          background: 'linear-gradient(135deg, #FFFFFF 0%, #F0F4FF 100%)',
          border: '1px solid rgba(99, 102, 241, 0.12)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 16px rgba(99, 102, 241, 0.08)'
        }}>
          <ShoppingBagIcon size={40} style={{ color: C.primary }} />
        </div>
        <div style={{
          display: 'flex',
          gap: 8,
          flexWrap: 'wrap',
          justifyContent: 'center',
          maxWidth: 280
        }}>
          <ProductPill icon={<ProductBoxIcon size={14} />} label="Electronics" />
          <ProductPill icon={<ProductBoxIcon size={14} />} label="Fashion" />
          <ProductPill icon={<ProductBoxIcon size={14} />} label="Home" />
          <ProductPill icon={<ProductBoxIcon size={14} />} label="Sports" />
        </div>
      </div>

      {/* Small connecting arrows between clusters */}
      <div style={{
        position: 'absolute',
        top: '35%',
        left: '28%',
        zIndex: 1,
        pointerEvents: 'none'
      }}>
        <ArrowRightIcon size={18} style={{ color: 'rgba(99, 102, 241, 0.3)' }} />
      </div>
      <div style={{
        position: 'absolute',
        top: '35%',
        right: '28%',
        zIndex: 1,
        pointerEvents: 'none'
      }}>
        <ArrowRightIcon size={18} style={{ color: 'rgba(99, 102, 241, 0.3)', transform: 'rotate(180deg)' }} />
      </div>

      {/* Small accent dots */}
      <div style={{
        position: 'absolute',
        top: '12%',
        left: '18%',
        width: 6,
        height: 6,
        borderRadius: '50%',
        background: C.primary,
        opacity: 0.4,
        pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute',
        top: '12%',
        right: '18%',
        width: 6,
        height: 6,
        borderRadius: '50%',
        background: C.secondary,
        opacity: 0.4,
        pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute',
        bottom: '10%',
        left: '15%',
        width: 4,
        height: 4,
        borderRadius: '50%',
        background: C.primary,
        opacity: 0.3,
        pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute',
        bottom: '10%',
        right: '15%',
        width: 4,
        height: 4,
        borderRadius: '50%',
        background: C.secondary,
        opacity: 0.3,
        pointerEvents: 'none'
      }} />

      <style>{`
        @keyframes sparkle-pulse {
          0%, 100% { opacity: 0.8; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.08); }
        }
      `}</style>
    </div>
  )
}

function ProductPill({ icon, label }) {
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 5,
      padding: '5px 10px',
      background: 'rgba(255,255,255,0.9)',
      border: '1px solid rgba(99, 102, 241, 0.12)',
      borderRadius: 9999,
      fontSize: 10,
      fontWeight: 500,
      color: C.textSecondary,
      boxShadow: '0 2px 8px rgba(99, 102, 241, 0.06)'
    }}>
      <span style={{ color: C.primary }}>{icon}</span>
      {label}
    </span>
  )
}

export default function Hero() {
  return (
    <section style={{
      position: 'relative',
      width: '100%',
      overflow: 'hidden',
      overflowX: 'hidden',
      background: 'radial-gradient(ellipse at 30% 35%, #EEF2FF 0%, #F0F4FF 25%, #FFFFFF 55%, #EEF2FF 100%)'
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
            <HeroVisual />
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
        @media (max-width: 640px) {
          .hero-3d-panel {
            maxHeight: 50vh;
          }
        }
      `}</style>
    </section>
  )
}