import { useState, useEffect, useRef } from 'react'

const COLORS = {
  blue: '#3B82F6',
  purple: '#8B5CF6',
  pink: '#EC4899',
  cyan: '#06B6D4',
  violet: '#A855F7',
  fuchsia: '#D946EF',
  indigo: '#6366F1'
}

function darken(hex, amount) {
  const num = parseInt(hex.slice(1), 16)
  const r = Math.max(0, ((num >> 16) & 0xff) - Math.round(255 * amount))
  const g = Math.max(0, ((num >> 8) & 0xff) - Math.round(255 * amount))
  const b = Math.max(0, (num & 0xff) - Math.round(255 * amount))
  return `#${(r << 16 | g << 8 | b).toString(16).padStart(6, '0')}`
}

// 3D Headphone component
function Headphone3D({ parallaxX, parallaxY, delay = 0 }) {
  return (
    <div
      className="floating-product"
      style={{
        position: 'absolute',
        top: '30%',
        left: '15%',
        zIndex: 7,
        animation: `float-prod-1 4s ease-in-out infinite`,
        animationDelay: `${delay}s`,
        transform: `translate(${parallaxX * 0.5}px, ${parallaxY * 0.5}px)`
      }}
    >
      <div style={{
        width: 56,
        height: 56,
        borderRadius: '50% 50% 50% 50%',
        background: 'linear-gradient(135deg, #CBD5E1 0%, #94A3B8 50%, #CBD5E1 100%)',
        border: '1px solid rgba(255,255,255,0.5)',
        boxShadow: '0 10px 25px rgba(0,0,0,0.3), inset 0 2px 4px rgba(255,255,255,0.4)',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 6px'
      }}>
        {/* Left ear cup */}
        <div style={{
          width: 24,
          height: 44,
          borderRadius: '50% 0 0 50%',
          background: 'radial-gradient(circle, #60A5FA 0%, #3B82F6 70%, #1D4ED8 100%)',
          border: '1px solid rgba(255,255,255,0.3)',
          boxShadow: `0 0 15px ${COLORS.blue}`
        }} />
        {/* Right ear cup */}
        <div style={{
          width: 24,
          height: 44,
          borderRadius: '0 50% 50% 0',
          background: 'radial-gradient(circle, #60A5FA 0%, #3B82F6 70%, #1D4ED8 100%)',
          border: '1px solid rgba(255,255,255,0.3)',
          boxShadow: `0 0 15px ${COLORS.blue}`
        }} />
        {/* Headband middle */}
        <div style={{
          position: 'absolute',
          top: 10,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 8,
          height: 28,
          background: 'linear-gradient(180deg, #CBD5E1 0%, #94A3B8 50%, #CBD5E1 100%)',
          borderRadius: 4
        }} />
      </div>
    </div>
  )
}

// 3D Sneaker component
function Sneaker3D({ parallaxX, parallaxY, delay = 0 }) {
  return (
    <div
      className="floating-product"
      style={{
        position: 'absolute',
        top: '65%',
        left: '15%',
        zIndex: 7,
        animation: `float-prod-2 5s ease-in-out infinite`,
        animationDelay: `${delay}s`,
        transform: `translate(${parallaxX * 0.4}px, ${parallaxY * 0.4}px) rotate(-5deg)`
      }}
    >
      <div style={{
        width: 48,
        height: 24,
        borderRadius: '50% 50% 40% 40% / 40% 40% 60% 60%',
        background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 50%, #B45309 100%)',
        border: '1px solid rgba(255,255,255,0.4)',
        boxShadow: '0 8px 20px rgba(0,0,0,0.3), inset 0 2px 4px rgba(255,255,255,0.4)',
        position: 'relative'
      }}>
        {/* Shoelace holes */}
        <div style={{ position: 'absolute', top: 4, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 4 }}>
          <div style={{ width: 3, height: 3, background: '#92400E', borderRadius: '50%' }} />
          <div style={{ width: 3, height: 3, background: '#92400E', borderRadius: '50%' }} />
          <div style={{ width: 3, height: 3, background: '#92400E', borderRadius: '50%' }} />
          <div style={{ width: 3, height: 3, background: '#92400E', borderRadius: '50%' }} />
        </div>
      </div>
    </div>
  )
}

// 3D Laptop component
function Laptop3D({ parallaxX, parallaxY, delay = 0 }) {
  return (
    <div
      className="floating-product"
      style={{
        position: 'absolute',
        top: '45%',
        left: '25%',
        zIndex: 7,
        animation: `float-prod-3 5.5s ease-in-out infinite`,
        animationDelay: `${delay}s`,
        transform: `translate(${parallaxX * 0.3}px, ${parallaxY * 0.3}px)`
      }}
    >
      <div style={{
        width: 52,
        height: 36,
        borderRadius: '4px 4px 0 0',
        background: 'linear-gradient(135deg, #CBD5E1 0%, #94A3B8 100%)',
        border: '2px solid #64748B',
        position: 'relative',
        boxShadow: '0 8px 20px rgba(0,0,0,0.25), inset 0 2px 4px rgba(255,255,255,0.3)'
      }}>
        {/* Screen */}
        <div style={{
          position: 'absolute',
          inset: 4,
          borderRadius: 2,
          background: 'linear-gradient(135deg, #1E293B 0%, #334155 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden'
        }}>
          <div style={{
            width: 12,
            height: 12,
            borderRadius: '50%',
            background: COLORS.blue,
            boxShadow: `0 0 8px ${COLORS.blue}`
          }} />
        </div>
      </div>
      {/* Laptop base */}
      <div style={{
        width: 44,
        height: 8,
        background: 'linear-gradient(135deg, #94A3B8 0%, #64748B 100%)',
        borderRadius: '0 0 4px 4px',
        margin: '0 auto',
        boxShadow: '0 4px 10px rgba(0,0,0,0.2)'
      }} />
    </div>
  )
}

// 3D Smartphone component
function Smartphone3D({ parallaxX, parallaxY, delay = 0 }) {
  return (
    <div
      className="floating-product"
      style={{
        position: 'absolute',
        top: '35%',
        right: '25%',
        zIndex: 7,
        animation: `float-prod-2 4.5s ease-in-out infinite`,
        animationDelay: `${delay}s`,
        transform: `translate(${parallaxX * 0.4}px, ${parallaxY * 0.4}px)`
      }}
    >
      <div style={{
        width: 40,
        height: 28,
        borderRadius: 5,
        background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #0F172A 100%)',
        border: '1px solid rgba(255,255,255,0.2)',
        boxShadow: `0 0 15px ${COLORS.blue}, 0 6px 15px rgba(0,0,0,0.3)`,
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}>
        {/* Screen */}
        <div style={{
          width: 34,
          height: 20,
          borderRadius: 3,
          background: '#0EA5E9',
          marginTop: 4,
          position: 'relative'
        }}>
          {/* Screen content */}
          <div style={{
            position: 'absolute',
            top: 2,
            left: 2,
            right: 2,
            height: 16,
            background: '#0284C7',
            borderRadius: 2
          }} />
        </div>
      </div>
    </div>
  )
}

// 3D Smartwatch component
function Smartwatch3D({ parallaxX, parallaxY, delay = 0 }) {
  return (
    <div
      className="floating-product"
      style={{
        position: 'absolute',
        top: '65%',
        right: '30%',
        zIndex: 7,
        animation: `float-prod-1 5s ease-in-out infinite`,
        animationDelay: `${delay}s`,
        transform: `translate(${parallaxX * 0.6}px, ${parallaxY * 0.6}px) rotate(10deg)`
      }}
    >
      <div style={{
        width: 36,
        height: 26,
        borderRadius: 6,
        background: 'linear-gradient(135deg, #F1F5F9 0%, #E2E8F0 50%, #F1F5F9 100%)',
        border: '1px solid rgba(255,255,255,0.5)',
        boxShadow: `0 0 12px ${COLORS.purple}, 0 6px 12px rgba(0,0,0,0.25)`,
        position: 'relative'
      }}>
        {/* Screen */}
        <div style={{
          position: 'absolute',
          inset: 4,
          borderRadius: 3,
          background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{
            width: 10,
            height: 10,
            borderRadius: '50%',
            background: COLORS.cyan,
            boxShadow: `0 0 6px ${COLORS.cyan}`
          }} />
        </div>
      </div>
    </div>
  )
}

// 3D Shopping Bag component
function ShoppingBag3D({ color, parallaxX, parallaxY, pos, delay = 0, rot = 0 }) {
  return (
    <div
      className="floating-product"
      style={{
        position: 'absolute',
        ...pos,
        zIndex: 7,
        animation: `float-prod-3 4.8s ease-in-out infinite`,
        animationDelay: `${delay}s`,
        transform: `translate(${parallaxX * 0.3}px, ${parallaxY * 0.3}px) rotate(${rot}deg)`
      }}
    >
      <div style={{
        width: 32,
        height: 36,
        background: color,
        borderRadius: '6px 6px 0 0',
        border: '1px solid rgba(0,0,0,0.15)',
        boxShadow: '0 8px 18px rgba(0,0,0,0.25)',
        position: 'relative'
      }}>
        {/* Bag handles */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 26,
          height: 10,
          display: 'flex',
          justifyContent: 'space-between'
        }}>
          <div style={{
            width: 6,
            height: 10,
            border: `2px solid ${darken(color, 0.1)}`,
            borderTop: 'none',
            borderRight: 'none',
            borderRadius: '0 4px 4px 0'
          }} />
          <div style={{
            width: 6,
            height: 10,
            border: `2px solid ${darken(color, 0.1)}`,
            borderTop: 'none',
            borderLeft: 'none',
            borderRadius: '4px 0 0 4px'
          }} />
        </div>
      </div>
    </div>
  )
}

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
            boxShadow: `0 0 30px ${COLORS.cyan}40`
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

        {/* Floating 3D product objects */}
        {/* 3D Headphone above-left */}
        <Headphone3D parallaxX={parallaxX} parallaxY={parallaxY} />

        {/* 3D Sneakers below-left */}
        <Sneaker3D parallaxX={parallaxX} parallaxY={parallaxY} />

        {/* 3D Laptop */}
        <Laptop3D parallaxX={parallaxX} parallaxY={parallaxY} delay={0.5} />

        {/* 3D Smartphone above-right */}
        <Smartphone3D parallaxX={parallaxX} parallaxY={parallaxY} delay={0.3} />

        {/* 3D Smartwatch below-right */}
        <Smartwatch3D parallaxX={parallaxX} parallaxY={parallaxY} delay={0.7} />

        {/* Floating shopping bags around the scene */}
        <ShoppingBag3D color="#F59E0B" parallaxX={parallaxX} parallaxY={parallaxY} pos={{ top: '20%', left: '30%' }} delay={0.2} rot={-10} />
        <ShoppingBag3D color="#EC4899" parallaxX={parallaxX} parallaxY={parallaxY} pos={{ top: '50%', left: '40%' }} delay={0.4} rot={5} />
        <ShoppingBag3D color="#3B82F6" parallaxX={parallaxX} parallaxY={parallaxY} pos={{ top: '60%', right: '20%' }} delay={0.6} rot={-5} />
        <ShoppingBag3D color="#A855F7" parallaxX={parallaxX} parallaxY={parallaxY} pos={{ top: '35%', right: '15%' }} delay={0.8} rot={15} />

        {/* Soft neon light streaks for colorful lighting */}
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

        {/* Floating sparkle particles */}
        <div style={{
          position: 'absolute',
          top: '15%',
          left: '40%',
          width: 12,
          height: 12,
          background: COLORS.pink,
          borderRadius: '50%',
          zIndex: 6,
          boxShadow: `0 0 10px ${COLORS.pink}`,
          animation: 'sparkle 3s infinite'
        }} />
        <div style={{
          position: 'absolute',
          top: '50%',
          right: '35%',
          width: 10,
          height: 10,
          background: COLORS.cyan,
          borderRadius: '50%',
          zIndex: 6,
          boxShadow: `0 0 8px ${COLORS.cyan}`,
          animation: 'sparkle 2.5s infinite 0.5s'
        }} />
        <div style={{
          position: 'absolute',
          top: '75%',
          left: '50%',
          width: 14,
          height: 14,
          background: COLORS.blue,
          borderRadius: '50%',
          zIndex: 6,
          boxShadow: `0 0 12px ${COLORS.blue}`,
          animation: 'sparkle 4s infinite 1s'
        }} />

      </div>

      <style>{`
        @keyframes float-cart {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        @keyframes rotateRing {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes float-prod-1 {
          0%, 100% { transform: translate(0, 0) rotate(0); }
          25% { transform: translate(5px, -8px) rotate(2deg); }
          50% { transform: translate(0, -5px) rotate(0); }
          75% { transform: translate(-5px, -3px) rotate(-2deg); }
        }
        @keyframes float-prod-2 {
          0%, 100% { transform: translate(0, 0) rotate(0); }
          25% { transform: translate(-8px, -6px) rotate(-2deg); }
          50% { transform: translate(-3px, -10px) rotate(0); }
          75% { transform: translate(5px, -4px) rotate(2deg); }
        }
        @keyframes float-prod-3 {
          0%, 100% { transform: translate(0, 0) rotate(0); }
          25% { transform: translate(6px, -5px) rotate(2deg); }
          50% { transform: translate(0, -12px) rotate(0); }
          75% { transform: translate(-6px, -2px) rotate(-2deg); }
        }
        @keyframes light-streak {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.6; }
        }
        @keyframes sparkle {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 0.8; transform: scale(1.2); }
        }
      `}</style>
    </div>
  )
}
