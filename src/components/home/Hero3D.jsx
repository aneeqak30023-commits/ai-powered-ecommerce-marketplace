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

  // Product card data matching the reference composition
  const productCards = [
    { emoji: '🎧', label: 'Smart Headphones', price: '$79.99', color: '#06B6D4' },
    { emoji: '💻', label: 'Gaming Laptop', price: '$899.99', color: '#8B5CF6' },
    { emoji: '👟', label: 'Running Sneakers', price: '$129.99', color: '#F59E0B' },
    { emoji: '⌚', label: 'Smart Watch', price: '$199.99', color: '#EC4899' }
  ]

  // Floating individual products
  const floatingProducts = [
    { emoji: '📱', label: 'Smartphone', color: '#3B82F6' },
    { emoji: '🎮', label: 'Gaming Controller', color: '#8B5CF6' },
    { emoji: '📷', label: 'Camera', color: '#EC4899' }
  ]

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        minHeight: 500,
        perspective: 1200,
        overflow: 'visible'
      }}
    >
      {/* Scene container - right side content */}
      <div style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        pointerEvents: 'none'
      }}>
        {/* Glossy futuristic platform with cyan ring */}
        <div style={{
          position: 'relative',
          width: 340,
          height: 140,
          bottom: -30,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transform: `translate(${parallaxX * 0.2}px, ${parallaxY * 0.2}px)`
        }}>
          {/* Cyan glowing ring */}
          <div style={{
            position: 'absolute',
            width: 260,
            height: 260,
            borderRadius: '50%',
            border: `3px solid ${COLORS.cyan}`,
            boxShadow: `0 0 25px ${COLORS.cyan}, 0 0 50px ${COLORS.cyan}40`,
            top: -60,
            animation: 'rotateRing 12s linear infinite'
          }} />

          {/* Platform surface */}
          <div style={{
            position: 'absolute',
            width: 280,
            height: 12,
            borderRadius: '50%',
            background: 'linear-gradient(90deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.4) 100%)',
            bottom: -8,
            boxShadow: '0 0 30px rgba(6,172,214,0.4)'
          }} />

          {/* Platform reflection */}
          <div style={{
            position: 'absolute',
            width: 260,
            height: 24,
            borderRadius: '50%',
            background: 'linear-gradient(180deg, rgba(255,255,255,0.15) 0%, transparent 100%)',
            bottom: -18,
            filter: 'blur(2px)',
            opacity: 0.6
          }} />
        </div>

        {/* Shopping cart */}
        <div style={{
          position: 'relative',
          width: 220,
          height: 300,
          transform: `translate(${parallaxX * 0.3}px, ${parallaxY * 0.3}px)`,
          zIndex: 5,
          animation: 'float-cart 5s ease-in-out infinite'
        }}>
          {/* Cart basket */}
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 200,
            height: 200,
            borderRadius: '0 0 12px 12px',
            background: 'linear-gradient(145deg, #CBD5E1 0%, #94A3B8 50%, #CBD5E1 100%)',
            border: '2px solid #94A3B8',
            boxShadow: '0 15px 40px rgba(0,0,0,0.25), inset 0 2px 4px rgba(255,255,255,0.4)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'flex-end',
            padding: 12,
            overflow: 'hidden'
          }}>
            {/* Basket wire pattern */}
            <div style={{ position: 'absolute', inset: 8, border: '1px dashed rgba(148,165,177,0.5)', borderRadius: 8 }} />

            {/* Brown NexMart box */}
            <div style={{
              width: 70,
              height: 60,
              background: 'linear-gradient(135deg, #8B4513 0%, #A0522D 50%, #8B4513 100%)',
              borderRadius: 6,
              marginBottom: 6,
              boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 8,
              fontWeight: 700,
              color: '#fff'
            }}>NEXMART</div>

            {/* Colorful shopping bags in cart */}
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', justifyContent: 'center' }}>
              <div style={{ width: 24, height: 20, background: '#F59E0B', borderRadius: '4px 4px 0 0', boxShadow: '0 2px 4px rgba(0,0,0,0.15)' }} />
              <div style={{ width: 24, height: 20, background: '#3B82F6', borderRadius: '4px 4px 0 0', boxShadow: '0 2px 4px rgba(0,0,0,0.15)' }} />
              <div style={{ width: 24, height: 20, background: '#EAB308', borderRadius: '4px 4px 0 0', boxShadow: '0 2px 4px rgba(0,0,0,0.15)' }} />
              <div style={{ width: 24, height: 20, background: '#EC4899', borderRadius: '4px 4px 0 0', boxShadow: '0 2px 4px rgba(0,0,0,0.15)' }} />
            </div>
          </div>

          {/* Cart handles */}
          <div style={{
            position: 'absolute',
            top: 10,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 200,
            height: 16,
            display: 'flex',
            justifyContent: 'space-between',
            padding: '0 8px',
            boxSizing: 'border-box'
          }}>
            <div style={{ width: 8, height: 16, background: '#CBD5E1', borderRadius: 2, boxShadow: '0 0 5px rgba(0,0,0,0.3)' }} />
            <div style={{ width: 8, height: 16, background: '#CBD5E1', borderRadius: 2, boxShadow: '0 0 5px rgba(0,0,0,0.3)' }} />
          </div>

          {/* Cart wheel */}
          <div style={{
            position: 'absolute',
            top: 200,
            left: '50%',
            transform: 'translateX(-50%) rotate(15deg)',
            width: 180,
            height: 8,
            border: '2px solid #94A3B8',
            borderRadius: '50% 50% 0 0',
            borderTop: 'none',
            borderBottom: 'none'
          }}>
            <div style={{
              position: 'absolute',
              width: 8,
              height: 40,
              background: '#94A3B8',
              left: '25%',
              top: -16,
              borderRadius: 4
            }} />
          </div>
        </div>

        {/* AI Robot - sitting/standing behind cart, pointing left */}
        <div style={{
          position: 'relative',
          width: 200,
          height: 320,
          left: 60,
          top: -30,
          transform: `translate(${parallaxX * 0.4}px, ${parallaxY * 0.4}px)`,
          zIndex: 10
        }}>
          {/* Robot legs */}
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 60,
            height: 80,
            display: 'flex',
            gap: 10
          }}>
            <div style={{
              width: 25,
              height: 80,
              background: 'linear-gradient(145deg, #F1F5F9 0%, #CBD5E1 100%)',
              borderRadius: '12px 12px 40px 40px',
              boxShadow: '0 12px 25px rgba(0,0,0,0.2), inset 0 2px 4px rgba(255,255,255,0.5)'
            }} />
            <div style={{
              width: 25,
              height: 80,
              background: 'linear-gradient(145deg, #F1F5F9 0%, #CBD5E1 100%)',
              borderRadius: '12px 12px 40px 40px',
              boxShadow: '0 12px 25px rgba(0,0,0,0.2), inset 0 2px 4px rgba(255,255,255,0.5)'
            }} />
          </div>

          {/* Robot body */}
          <div style={{
            position: 'absolute',
            bottom: 80,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 120,
            height: 140,
            background: 'linear-gradient(145deg, #F8FAFC 0%, #E2E8F0 30%, #F8FAFC 70%, #E2E8F0 100%)',
            borderRadius: '50% 50% 30px 30px',
            border: '2px solid rgba(255,255,255,0.6)',
            boxShadow: '0 10px 30px rgba(0,0,0,0.25), inset 0 4px 8px rgba(255,255,255,0.5), 0 0 20px rgba(139,92,246,0.3)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}>
            {/* AI badge on chest */}
            <div style={{
              marginTop: 20,
              width: 36,
              height: 36,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: `0 0 15px ${COLORS.blue}, 0 0 30px ${COLORS.blue}40`
            }}>
              <span style={{ color: '#fff', fontSize: 16, fontWeight: 700 }}>AI</span>
            </div>

            {/* Chest line */}
            <div style={{
              marginTop: 12,
              width: 60,
              height: 2,
              background: 'rgba(0,0,0,0.1)',
              borderRadius: 1
            }} />
          </div>

          {/* Robot head - rounded with dark face */}
          <div style={{
            position: 'relative',
            bottom: 215,
            left: '50%',
            transform: 'translateX(-50%)',
          }}>
            {/* Headphones/ear pieces */}
            <div style={{
              position: 'absolute',
              top: 20,
              left: 8,
              width: 22,
              height: 40,
              background: `linear-gradient(135deg, ${COLORS.purple} 0%, ${COLORS.blue} 100%)`,
              borderRadius: 8,
              border: '1px solid rgba(0,0,0,0.1)'
            }} />
            <div style={{
              position: 'absolute',
              top: 20,
              right: 8,
              width: 22,
              height: 40,
              background: `linear-gradient(135deg, ${COLORS.purple} 0%, ${COLORS.blue} 100%)`,
              borderRadius: 8,
              border: '1px solid rgba(0,0,0,0.1)'
            }} />

            {/* Dark face screen */}
            <div style={{
              position: 'absolute',
              top: 28,
              left: '50%',
              transform: 'translateX(-50%)',
              width: 60,
              height: 40,
              background: 'linear-gradient(145deg, #1E293B 0%, #0F172A 50%, #1E293B 100%)',
              borderRadius: 12,
              border: '2px solid rgba(255,255,255,0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.1)'
            }}>
              {/* Glowing cyan smiling eyes */}
              <div style={{
                display: 'flex',
                gap: 8
              }}>
                <div style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: COLORS.cyan,
                  boxShadow: `0 0 8px ${COLORS.cyan}, 0 0 15px ${COLORS.cyan}`
                }} />
                <div style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: COLORS.cyan,
                  boxShadow: `0 0 8px ${COLORS.cyan}, 0 0 15px ${COLORS.cyan}`
                }} />
              </div>
            </div>

            {/* Smile */}
            <div style={{
              position: 'absolute',
              bottom: 24,
              left: '50%',
              transform: 'translateX(-50%)',
              width: 24,
              height: 12,
              borderBottom: `2px solid ${COLORS.cyan}`,
              borderRadius: '0 0 50% 50%',
              boxShadow: `0 0 5px ${COLORS.cyan}`
            }} />
          </div>

          {/* Robot arm pointing left */}
          <div style={{
            position: 'absolute',
            top: 200,
            left: -20,
            width: 40,
            height: 12,
            background: 'linear-gradient(145deg, #F8FAFC 0%, #E2E8F0 100%)',
            borderRadius: 6,
            transform: 'rotate(-20deg)',
            boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
            zIndex: -1
          }} />
        </div>
      </div>

      {/* Floating product cards - left side */}
      {productCards.map((product, idx) => {
        const positions = [
          { top: '20%', left: '10%' },
          { top: '65%', left: '10%' },
          { top: '15%', right: '45%' },
          { top: '70%', right: '45%' }
        ]
        const pos = positions[idx]
        return (
          <div
            key={`card-${idx}`}
            className="floating-card"
            style={{
              position: 'absolute',
              ...pos,
              transform: `translate(${parallaxX * (0.5 + idx * 0.2)}px, ${parallaxY * (0.5 + idx * 0.2)}px)`,
              width: 160,
              zIndex: 8,
              animation: `float-card-${idx + 1} ${5 + idx}s ease-in-out infinite`
            }}
          >
            <div style={{
              width: '100%',
              height: 180,
              background: 'linear-gradient(145deg, #1E293B 0%, #334155 100%)',
              borderRadius: 16,
              border: '1px solid rgba(255,255,255,0.1)',
              boxShadow: '0 12px 30px rgba(0,0,0,0.3), inset 0 2px 4px rgba(255,255,255,0.1)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 12
            }}>
              <div style={{ fontSize: 36, marginBottom: 8 }}>{product.emoji}</div>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#FFFFFF', textAlign: 'center', marginBottom: 4 }}>{product.label}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: product.color }}>{product.price}</div>
            </div>
          </div>
        )
      })}

      {/* Floating individual products */}
      {floatingProducts.map((product, idx) => {
        const positions = [
          { top: '35%', left: '30%' },
          { top: '55%', left: '35%' },
          { top: '50%', left: '30%' }
        ]
        const pos = positions[idx]
        const icons = ['📱', '🎮', '📷']
        return (
          <div
            key={`prod-${idx}`}
            className="floating-product"
            style={{
              position: 'absolute',
              ...pos,
              transform: `translate(${parallaxX * (0.4 + idx * 0.3)}px, ${parallaxY * (0.4 + idx * 0.3)}px)`,
              zIndex: 7,
              animation: `float-prod-${idx + 1} ${4 + idx * 0.5}s ease-in-out infinite`
            }}
          >
            <div style={{
              width: 50,
              height: 50,
              borderRadius: '50%',
              background: `linear-gradient(135deg, ${product.color} 0%, ${product.color} 50%, ${darken(product.color, 0.2)} 100%)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: `0 0 20px ${product.color}, 0 8px 25px rgba(0,0,0,0.3)`,
              fontSize: 24
            }}>{icons[idx]}</div>
          </div>
        )
      })}

      {/* Blue gift box above robot */}
      <div className="gift-box" style={{
        position: 'absolute',
        top: '15%',
        left: '60%',
        transform: `translate(${parallaxX * 0.3}px, ${parallaxY * 0.3}px)`,
        zIndex: 9,
        animation: 'pulse-gift 4s ease-in-out infinite'
      }}>
        <div style={{
          width: 50,
          height: 50,
          background: COLORS.blue,
          borderRadius: 10,
          boxShadow: '0 8px 20px rgba(0,0,0,0.3), inset 0 2px 4px rgba(255,255,255,0.3)'
        }}>
          <div style={{
            position: 'absolute',
            top: '50%',
            left: 0,
            right: 0,
            height: 8,
            background: COLORS.fuchsia,
            transform: 'translateY(-50%)'
          }} />
          <div style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: '50%',
            width: 8,
            background: COLORS.fuchsia,
            transform: 'translateX(-50%)'
          }} />
        </div>
      </div>

      {/* Blue gift box near bottom-left of cart */}
      <div className="gift-box" style={{
        position: 'absolute',
        top: '75%',
        left: '15%',
        transform: `translate(${parallaxX * 0.4}px, ${parallaxY * 0.4}px) rotate(15deg)`,
        zIndex: 8,
        animation: 'pulse-gift 4s ease-in-out infinite 0.5s'
      }}>
        <div style={{
          width: 40,
          height: 40,
          background: COLORS.blue,
          borderRadius: 8,
          boxShadow: '0 6px 15px rgba(0,0,0,0.25), inset 0 2px 4px rgba(255,255,255,0.3)'
        }} />
      </div>

      {/* Pink percentage discount tag */}
      <div style={{
        position: 'absolute',
        top: '10%',
        left: '25%',
        transform: `translate(${parallaxX * 0.3}px, ${parallaxY * 0.3}px)`,
        zIndex: 11,
        background: 'conic-gradient(from 0deg, #F59E0B, #EF4444, #EC4899, #F59E0B)',
        borderRadius: '50%',
        padding: 3,
        animation: 'pulse-tag 2.5s ease-in-out infinite'
      }}>
        <div style={{
          width: 60,
          height: 60,
          borderRadius: 'inherit',
          background: 'linear-gradient(135deg, #EF4444 0%, #EC4899 100%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontWeight: 700,
          fontSize: 11,
          boxShadow: `0 0 15px ${COLORS.pink}, 0 8px 20px rgba(0,0,0,0.3)`
        }}>
          <span style={{ fontSize: 14 }}>50%</span>
          <span>OFF</span>
        </div>
      </div>

      {/* Additional small floating shopping elements */}
      <div style={{
        position: 'absolute',
        top: '60%',
        left: '40%',
        width: 32,
        height: 32,
        background: COLORS.purple,
        borderRadius: '50%',
        zIndex: 8,
        boxShadow: `0 0 12px ${COLORS.purple}`,
        animation: 'sparkle 3s infinite',
        transform: `translate(${parallaxX * 0.5}px, ${parallaxY * 0.5}px)`
      }} />
      <div style={{
        position: 'absolute',
        top: '30%',
        left: '50%',
        width: 24,
        height: 24,
        background: COLORS.pink,
        borderRadius: '50%',
        zIndex: 7,
        boxShadow: `0 0 10px ${COLORS.pink}`,
        animation: 'sparkle 2.5s infinite 0.5s',
        transform: `translate(${parallaxX * 0.4}px, ${parallaxY * 0.4}px)`
      }} />

      {/* AI Speech bubble - upper right */}
      <div style={{
        position: 'absolute',
        top: '15%',
        right: '15%',
        zIndex: 15,
        animation: 'pulse-bubble 3s ease-in-out infinite'
      }}>
        <div style={{
          background: `linear-gradient(135deg, ${COLORS.blue} 0%, ${COLORS.purple} 50%, ${COLORS.pink} 100%)`,
          borderRadius: 20,
          padding: '12px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          boxShadow: `0 0 25px ${COLORS.blue}40, 0 0 40px ${COLORS.purple}40`,
          border: '1px solid rgba(255,255,255,0.2)'
        }}>
          <span style={{
            color: '#fff',
            fontSize: 14,
            fontWeight: 600,
            whiteSpace: 'nowrap'
          }}>Ask me anything!</span>
          <div style={{ display: 'flex', gap: 2 }}>
            <span style={{ fontSize: 12 }}>✨</span>
            <span style={{ fontSize: 12 }}>✨</span>
          </div>
        </div>

        {/* Speech bubble tail */}
        <div style={{
          position: 'absolute',
          bottom: -10,
          right: 12,
          width: 0,
          height: 0,
          borderLeft: '10px solid transparent',
          borderRight: '10px solid transparent',
          borderTop: '10px solid #8B5CF6'
        }} />
      </div>

      {/* Soft neon light streaks */}
      <div style={{
        position: 'absolute',
        top: '25%',
        left: '20%',
        width: 200,
        height: 3,
        background: `linear-gradient(90deg, transparent, ${COLORS.pink}40, transparent)`,
        borderRadius: 2,
        zIndex: 3,
        animation: 'light-streak 6s ease-in-out infinite'
      }} />
      <div style={{
        position: 'absolute',
        top: '55%',
        left: '25%',
        width: 150,
        height: 3,
        background: `linear-gradient(90deg, transparent, ${COLORS.cyan}40, transparent)`,
        borderRadius: 2,
        zIndex: 3,
        animation: 'light-streak 8s ease-in-out infinite 1s'
      }} />
      <div style={{
        position: 'absolute',
        top: '40%',
        right: '30%',
        width: 120,
        height: 3,
        background: `linear-gradient(90deg, transparent, ${COLORS.blue}40, transparent)`,
        borderRadius: 2,
        zIndex: 3,
        animation: 'light-streak 5s ease-in-out infinite 2s'
      }} />

      <style>{`
        @keyframes float-card-1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(5px, -8px) scale(1.02); }
          50% { transform: translate(0, -5px) scale(1); }
          75% { transform: translate(-5px, -3px) scale(1.01); }
        }
        @keyframes float-card-2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(-8px, -6px) scale(1.02); }
          50% { transform: translate(-3px, -10px) scale(1); }
          75% { transform: translate(5px, -4px) scale(1.01); }
        }
        @keyframes float-card-3 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(6px, -5px) scale(1.02); }
          50% { transform: translate(0, -12px) scale(1); }
          75% { transform: translate(-6px, -2px) scale(1.01); }
        }
        @keyframes float-card-4 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(-6px, -4px) scale(1.02); }
          50% { transform: translate(0, -8px) scale(1); }
          75% { transform: translate(4px, -2px) scale(1.01); }
        }
        @keyframes float-cart {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        @keyframes pulse-gift {
          0%, 100% { opacity: 0.8; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.05); }
        }
        @keyframes sparkle {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 0.8; transform: scale(1.1); }
        }
        @keyframes pulse-tag {
          0%, 100% { transform: scale(1); opacity: 0.9; }
          50% { transform: scale(1.1); opacity: 1; }
        }
        @keyframes pulse-bubble {
          0%, 100% { opacity: 0.9; }
          50% { opacity: 1; }
        }
        @keyframes light-streak {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.6; }
        }
        .floating-card, .floating-product {
          transition: transform 0.1s ease;
        }
      `}</style>
    </div>
  )
}

// Helper function for color darkening
function darken(hex, amount) {
  const num = parseInt(hex.slice(1), 16)
  const r = Math.max(0, ((num >> 16) & 0xff) - Math.round(255 * amount))
  const g = Math.max(0, ((num >> 8) & 0xff) - Math.round(255 * amount))
  const b = Math.max(0, (num & 0xff) - Math.round(255 * amount))
  return `#${(r << 16 | g << 8 | b).toString(16).padStart(6, '0')}`
}

const COLORS = {
  blue: '#3B82F6',
  purple: '#8B5CF6',
  pink: '#EC4899',
  cyan: '#06B6D4',
  violet: '#A855F7',
  fuchsia: '#D946EF',
  indigo: '#6366F1'
}
