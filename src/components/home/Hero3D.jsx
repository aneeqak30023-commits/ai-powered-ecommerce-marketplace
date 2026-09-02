import { useState, useEffect, useRef } from 'react'

export default function Hero3D() {
  const containerRef = useRef(null)
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 })

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleMouseMove = (e) => {
      const { left, top, width, height } = e.currentTarget.getBoundingClientRect()
      setMousePos({
        x: (e.clientX - left) / width,
        y: (e.clientY - top) / height
      })
    }

    container.addEventListener('mousemove', handleMouseMove)
    return () => container.removeEventListener('mousemove', handleMouseMove)
  }, [])

  const parallaxX = (mousePos.x - 0.5) * 30
  const parallaxY = (mousePos.y - 0.5) * 30

  // Colorful gradient palette for the scene
  const COLORS = {
    blue: '#3B82F6',
    purple: '#8B5CF6',
    pink: '#EC4899',
    cyan: '#06B6D4',
    violet: '#A855F7',
    fuchsia: '#D946EF',
    indigo: '#6366F1'
  }

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        minHeight: 420,
        borderRadius: 24,
        overflow: 'hidden',
        background: 'radial-gradient(ellipse at 30% 40%, #1E293B 0%, #0F172A 50%, #111827 100%)',
        border: '1px solid rgba(99,102,241,0.15)'
      }}
    >
      {/* Colorful background gradient orbs */}
      <div style={{
        position: 'absolute',
        width: 320,
        height: 320,
        borderRadius: '50%',
        background: `radial-gradient(circle, ${COLORS.blue}30 0%, ${COLORS.purple}30 50%, transparent 70%)`,
        top: '10%',
        left: '5%',
        filter: 'blur(60px)',
        transform: `translate(${parallaxX * 0.4}px, ${parallaxY * 0.4}px)`,
        animation: 'pulse-blue 8s ease-in-out infinite',
        zIndex: 1
      }} />

      <div style={{
        position: 'absolute',
        width: 280,
        height: 280,
        borderRadius: '50%',
        background: `radial-gradient(circle, ${COLORS.pink}30 0%, ${COLORS.cyan}30 50%, transparent 70%)`,
        top: '60%',
        right: '10%',
        filter: 'blur(60px)',
        transform: `translate(${parallaxX * -0.3}px, ${parallaxY * -0.3}px)`,
        animation: 'pulse-pink 10s ease-in-out infinite',
        zIndex: 1
      }} />

      <div style={{
        position: 'absolute',
        width: 240,
        height: 240,
        borderRadius: '50%',
        background: `radial-gradient(circle, ${COLORS.purple}25 0%, ${COLORS.indigo}30 50%, transparent 70%)`,
        bottom: '15%',
        left: '20%',
        filter: 'blur(50px)',
        transform: `translate(${parallaxX * 0.2}px, ${parallaxY * -0.2}px)`,
        animation: 'pulse-purple 12s ease-in-out infinite',
        zIndex: 1
      }} />

      {/* AI Neural grid overlay */}
      <svg
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          opacity: 0.2,
          pointerEvents: 'none',
          zIndex: 2
        }}
      >
        <defs>
          <pattern id="neural-grid" width="50" height="50" patternUnits="userSpaceOnUse">
            <path d="M 50 0 L 0 0 0 50" fill="none" stroke="rgba(99,102,241,0.15)" strokeWidth="1" />
          </pattern>
          <linearGradient id="gradient-line" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={COLORS.blue} stopOpacity="0.6" />
            <stop offset="100%" stopColor={COLORS.purple} stopOpacity="0.4" />
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#neural-grid)" />
        <line x1="20%" y1="30%" x2="80%" y2="30%" stroke="url(#gradient-line)" strokeWidth="0.5" />
        <line x1="20%" y1="50%" x2="80%" y2="50%" stroke="url(#gradient-line)" strokeWidth="0.5" />
        <line x1="50%" y1="10%" x2="50%" y2="90%" stroke="url(#gradient-line)" strokeWidth="0.5" />
        <line x1="20%" y1="30%" x2="50%" y2="10%" stroke="url(#gradient-line)" strokeWidth="0.5" />
        <line x1="80%" y1="30%" x2="50%" y2="10%" stroke="url(#gradient-line)" strokeWidth="0.5" />
        <line x1="20%" y1="50%" x2="50%" y2="70%" stroke="url(#gradient-line)" strokeWidth="0.5" />
        <line x1="80%" y1="50%" x2="50%" y2="70%" stroke="url(#gradient-line)" strokeWidth="0.5" />
        <circle cx="50%" cy="40%" r="1.5" fill={COLORS.blue} opacity="0.5" />
        <circle cx="30%" cy="60%" r="1.8" fill={COLORS.pink} opacity="0.4" />
        <circle cx="70%" cy="65%" r="1.2" fill={COLORS.cyan} opacity="0.45" />
        <circle cx="50%" cy="70%" r="2" fill={COLORS.purple} opacity="0.35" />
      </svg>

      {/* 3D AI Shopping Robot - center stage */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: `translate(calc(-50% + ${parallaxX * 0.3}px), calc(-50% + ${parallaxY * 0.3}px))`,
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}>
        {/* Robot head */}
        <div style={{
          position: 'relative',
          width: 80,
          height: 80,
          borderRadius: '50%',
          background: 'linear-gradient(145deg, #E5E7EB 0%, #F3F4F6 50%, #E5E7EB 100%)',
          boxShadow: '0 20px 40px rgba(0,0,0,0.3), inset 0 4px 8px rgba(255,255,255,0.8), 0 0 30px rgba(99,102,241,0.5)',
          border: '2px solid rgba(255,255,255,0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          animation: 'float 4s ease-in-out infinite'
        }}>
          {/* Eyes */}
          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{
              width: 14,
              height: 14,
              borderRadius: '50%',
              background: COLORS.blue,
              boxShadow: `0 0 15px ${COLORS.blue}, 0 0 30px ${COLORS.blue}`,
              animation: 'blink 6s infinite'
            }} />
            <div style={{
              width: 14,
              height: 14,
              borderRadius: '50%',
              background: COLORS.purple,
              boxShadow: `0 0 15px ${COLORS.purple}, 0 0 30px ${COLORS.purple}`,
              animation: 'blink 6s infinite 0.3s'
            }} />
          </div>
          {/* Antenna */}
          <div style={{
            position: 'absolute',
            top: -20,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 4,
            height: 16,
            background: 'linear-gradient(180deg, #CBD5E1, #94A3B8)',
            borderRadius: 2
          }} />
          <div style={{
            position: 'absolute',
            top: -28,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 10,
            height: 10,
            borderRadius: '50%',
            background: COLORS.cyan,
            boxShadow: `0 0 10px ${COLORS.cyan}`,
            animation: 'pulse-cyan 2s infinite'
          }} />
        </div>

        {/* Robot body */}
        <div style={{
          width: 64,
          height: 80,
          background: 'linear-gradient(145deg, #9CA3AF 0%, #6B7280 50%, #9CA3AF 100%)',
          borderRadius: '50% 50% 0 0 / 60% 60% 0 0',
          boxShadow: '0 10px 30px rgba(0,0,0,0.25), inset 0 4px 8px rgba(255,255,255,0.3), 0 0 20px rgba(139,92,246,0.3)',
          border: '2px solid rgba(255,255,255,0.4)',
          marginTop: -6,
          position: 'relative'
        }}>
          {/* Chest display */}
          <div style={{
            position: 'absolute',
            top: 20,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 20,
            height: 20,
            borderRadius: 4,
            background: COLORS.pink,
            boxShadow: `0 0 15px ${COLORS.pink}, 0 0 30px ${COLORS.pink}`,
            animation: 'pulse-pink-eyes 3s infinite'
          }} />
        </div>
      </div>

      {/* Floating Product Cards */}
      <div
        className="floating-card"
        style={{
          position: 'absolute',
          top: '20%',
          left: '10%',
          transform: `translate(${parallaxX * 0.5}px, ${parallaxY * 0.5}px)`,
          width: 120,
          perspective: 800,
          zIndex: 5,
          animation: 'float-card-1 6s ease-in-out infinite'
        }}
      >
        <div style={{
          width: '100%',
          height: 140,
          background: 'linear-gradient(135deg, #1E293B 0%, #334155 100%)',
          borderRadius: 16,
          border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 12px 30px rgba(0,0,0,0.25), inset 0 2px 4px rgba(255,255,255,0.1)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 12
        }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>🎧</div>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#FFFFFF', textAlign: 'center' }}>Smart Headphones</div>
          <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.cyan, marginTop: 4 }}>$79.99 ★4.8</div>
        </div>
      </div>

      <div
        className="floating-card"
        style={{
          position: 'absolute',
          top: '30%',
          right: '10%',
          transform: `translate(${parallaxX * -0.4}px, ${parallaxY * 0.4}px)`,
          width: 110,
          perspective: 800,
          zIndex: 5,
          animation: 'float-card-2 7s ease-in-out infinite'
        }}
      >
        <div style={{
          width: '100%',
          height: 130,
          background: 'linear-gradient(135deg, #1E293B 0%, #334155 100%)',
          borderRadius: 16,
          border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 12px 30px rgba(0,0,0,0.25), inset 0 2px 4px rgba(255,255,255,0.1)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 12
        }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>⌚</div>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#FFFFFF', textAlign: 'center' }}>Smart Watch Pro</div>
          <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.purple, marginTop: 4 }}>$199.99 ★4.7</div>
        </div>
      </div>

      <div
        className="floating-card"
        style={{
          position: 'absolute',
          bottom: '25%',
          left: '15%',
          transform: `translate(${parallaxX * 0.6}px, ${parallaxY * -0.3}px)`,
          width: 100,
          perspective: 800,
          zIndex: 5,
          animation: 'float-card-3 5s ease-in-out infinite'
        }}
      >
        <div style={{
          width: '100%',
          height: 120,
          background: 'linear-gradient(135deg, #1E293B 0%, #334155 100%))',
          borderRadius: 16,
          border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 12px 30px rgba(0,0,0,0.25), inset 0 2px 4px rgba(255,255,255,0.1)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 12
        }}>
          <div style={{ fontSize: 30, marginBottom: 8 }}>💻</div>
          <div style={{ fontSize: 10, fontWeight: 600, color: '#FFFFFF', textAlign: 'center' }}>Gaming Laptop</div>
          <div style={{ fontSize: 12, fontWeight: 700, color: COLORS.blue, marginTop: 4 }}>$899.99 ★4.9</div>
        </div>
      </div>

      {/* Colorful shopping bags */}
      <div
        className="shopping-bag"
        style={{
          position: 'absolute',
          top: '15%',
          right: '25%',
          transform: `translate(${parallaxX * -0.5}px, ${parallaxY * 0.3}px) rotate(15deg)`,
          zIndex: 6,
          animation: 'bounce-bag 5s ease-in-out infinite'
        }}
      >
        <div style={{
          width: 80,
          height: 80,
          background: COLORS.pink,
          borderRadius: '8px 8px 0 0',
          boxShadow: '0 8px 20px rgba(0,0,0,0.25)',
          position: 'relative',
          border: '1px solid rgba(255,255,255,0.3)'
        }}>
          <div style={{
            position: 'absolute',
            top: -15,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 30,
            height: 15,
            background: COLORS.pink,
            borderRadius: '0 0 50% 50%',
            boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
          }} />
          <div style={{
            position: 'absolute',
            top: -10,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 24,
            height: 10,
            background: COLORS.pink,
            borderRadius: '50%'
          }} />
          <div style={{
            position: 'absolute',
            bottom: 20,
            left: '50%',
            transform: 'translateX(-50%)',
            fontSize: 14,
            fontWeight: 700,
            color: 'white',
            textShadow: '0 1px 2px rgba(0,0,0,0.3)'
          }}>SALE</div>
        </div>
      </div>

      <div
        className="shopping-bag"
        style={{
          position: 'absolute',
          bottom: '15%',
          right: '30%',
          transform: `translate(${parallaxX * 0.4}px, ${parallaxY * -0.2}px) rotate(-10deg)`,
          zIndex: 6,
          animation: 'bounce-bag 5s ease-in-out infinite 0.5s'
        }}
      >
        <div style={{
          width: 70,
          height: 70,
          background: COLORS.cyan,
          borderRadius: '8px 8px 0 0',
          boxShadow: '0 8px 20px rgba(0,0,0,0.25)',
          position: 'relative',
          border: '1px solid rgba(255,255,255,0.3)'
        }}>
          <div style={{
            position: 'absolute',
            top: -12,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 26,
            height: 12,
            background: COLORS.cyan,
            borderRadius: '0 0 50% 50%',
            boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
          }} />
          <div style={{
            position: 'absolute',
            top: -8,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 20,
            height: 8,
            background: COLORS.cyan,
            borderRadius: '50%'
          }} />
          <div style={{
            position: 'absolute',
            bottom: 18,
            left: '50%',
            transform: 'translateX(-50%)',
            fontSize: 13,
            fontWeight: 700,
            color: 'white',
            textShadow: '0 1px 2px rgba(0,0,0,0.3)'
          }}>NEW</div>
        </div>
      </div>

      {/* Gift box */}
      <div
        className="gift-box"
        style={{
          position: 'absolute',
          top: '40%',
          left: '5%',
          transform: `translate(${parallaxX * 0.5}px, ${parallaxY * 0.5}px)`,
          zIndex: 6,
          animation: 'pulse-gift 6s ease-in-out infinite'
        }}
      >
        <div style={{
          width: 60,
          height: 60,
          background: COLORS.purple,
          borderRadius: 8,
          boxShadow: '0 10px 25px rgba(0,0,0,0.3), inset 0 2px 4px rgba(255,255,255,0.2)',
          position: 'relative',
          border: '1px solid rgba(255,255,255,0.3)'
        }}>
          <div style={{
            position: 'absolute',
            top: '50%',
            left: 0,
            right: 0,
            height: 12,
            background: COLORS.fuchsia,
            boxShadow: `0 0 10px ${COLORS.fuchsia}`
          }} />
          <div style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: '50%',
            width: 12,
            background: COLORS.fuchsia,
            boxShadow: `0 0 10px ${COLORS.fuchsia}`
          }} />
          <div style={{
            position: 'absolute',
            top: -6,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 20,
            height: 6,
            background: COLORS.fuchsia,
            borderRadius: '50%'
          }} />
        </div>
      </div>

      {/* Discount badge */}
      <div
        className="discount-badge"
        style={{
          position: 'absolute',
          top: '20%',
          right: '5%',
          transform: `translate(${parallaxX * -0.3}px, ${parallaxY * 0.3}px)`,
          zIndex: 8,
          animation: 'pulse-badge 3s ease-in-out infinite'
        }}
      >
        <div style={{
          width: 80,
          height: 80,
          borderRadius: '50%',
          background: 'conic-gradient(from 0deg, #F59E0B, #EF4444, #F59E0B, #10B981, #F59E0B)',
          padding: 4,
          boxShadow: `0 0 30px ${COLORS.pink}, 0 0 50px ${COLORS.purple}`
        }}>
          <div style={{
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #F59E0B 0%, #EF4444 50%, #F59E0B 100%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 700,
            fontSize: 11
          }}>
            <span style={{ fontSize: 16 }}>50%</span>
            <span>OFF</span>
          </div>
        </div>
      </div>

      {/* Floating sparkles */}
      <div style={{
        position: 'absolute',
        top: '35%',
        left: '35%',
        zIndex: 4,
        animation: 'sparkle 4s infinite'
      }}><div style={{ width: 8, height: 8, background: COLORS.pink, borderRadius: '50%', boxShadow: `0 0 10px ${COLORS.pink}` }} /></div>
      <div style={{
        position: 'absolute',
        top: '55%',
        left: '70%',
        zIndex: 4,
        animation: 'sparkle 5s infinite 0.5s'
      }}><div style={{ width: 6, height: 6, background: COLORS.cyan, borderRadius: '50%', boxShadow: `0 0 8px ${COLORS.cyan}` }} /></div>
      <div style={{
        position: 'absolute',
        top: '25%',
        left: '65%',
        zIndex: 4,
        animation: 'sparkle 3s infinite 1s'
      }}><div style={{ width: 10, height: 10, background: COLORS.blue, borderRadius: '50%', boxShadow: `0 0 12px ${COLORS.blue}` }} /></div>
      <div style={{
        position: 'absolute',
        top: '45%',
        left: '20%',
        zIndex: 4,
        animation: 'sparkle 3.5s infinite 0.8s'
      }}><div style={{ width: 7, height: 7, background: COLORS.purple, borderRadius: '50%', boxShadow: `0 0 10px ${COLORS.purple}` }} /></div>

      {/* "Ask me anything!" AI chat hint bubble */}
      <div
        style={{
          position: 'absolute',
          bottom: '10%',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 20,
          background: 'rgba(255,255,255,0.15)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255,255,255,0.25)',
          borderRadius: 20,
          padding: '14px 24px',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          animation: 'pulse-bubble 4s ease-in-out infinite',
          boxShadow: '0 8px 32px rgba(0,0,0,0.15), 0 0 30px rgba(99,102,241,0.3)'
        }}
      >
        <div style={{
          width: 32,
          height: 32,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 50%, #EC4899 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: `0 0 15px ${COLORS.indigo}`
        }}>
          <span style={{ fontSize: 16 }}>✨</span>
        </div>
        <span style={{
          fontSize: 14,
          fontWeight: 600,
          color: '#FFFFFF',
          whiteSpace: 'nowrap'
        }}>Ask me anything about products!</span>
      </div>

      <style>{`
        @keyframes pulse-blue {
          0%, 100% { opacity: 0.4; filter: blur(60px) scale(1); }
          50% { opacity: 0.6; filter: blur(65px) scale(1.05); }
        }
        @keyframes pulse-pink {
          0%, 100% { opacity: 0.3; filter: blur(60px) scale(1); }
          50% { opacity: 0.5; filter: blur(65px) scale(1.05); }
        }
        @keyframes pulse-purple {
          0%, 100% { opacity: 0.35; filter: blur(50px) scale(1); }
          50% { opacity: 0.55; filter: blur(55px) scale(1.03); }
        }
        @keyframes pulse-cyan {
          0%, 100% { opacity: 0.6; filter: blur(0); }
          50% { opacity: 0.9; filter: blur(0); }
        }
        @keyframes pulse-pink-eyes {
          0%, 100% { opacity: 0.5; filter: blur(0); }
          50% { opacity: 0.9; filter: blur(0); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes float-card-1 {
          0%, 100% { transform: translate(${0}px, ${0}px); }
          25% { transform: translate(5px, -8px); }
          50% { transform: translate(0px, -5px); }
          75% { transform: translate(-5px, -3px); }
        }
        @keyframes float-card-2 {
          0%, 100% { transform: translate(0px, 0px); }
          25% { transform: translate(-8px, -6px); }
          50% { transform: translate(-3px, -10px); }
          75% { transform: translate(5px, -4px); }
        }
        @keyframes float-card-3 {
          0%, 100% { transform: translate(0px, 0px); }
          25% { transform: translate(6px, -5px); }
          50% { transform: translate(0px, -12px); }
          75% { transform: translate(-6px, -2px); }
        }
        @keyframes bounce-bag {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        @keyframes pulse-gift {
          0%, 100% { opacity: 0.7; }
          50% { opacity: 1; }
        }
        @keyframes pulse-badge {
          0%, 100% { transform: scale(1); opacity: 0.9; }
          50% { transform: scale(1.1); opacity: 1; }
        }
        @keyframes sparkle {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 0.8; transform: scale(1.2); }
        }
        @keyframes pulse-bubble {
          0%, 100% { opacity: 0.9; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  )
}
