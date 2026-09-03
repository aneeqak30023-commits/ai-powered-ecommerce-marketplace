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
function Headphone3D({ parallaxX, parallaxY, delay = 0, size = {} }) {
  const w = size.w || 56
  const h = size.h || 56
  const cupW = size.cupW || 24
  const cupH = size.cupH || 44
  return (
    <div
      className="floating-product prod-headphone"
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
        width: w,
        height: h,
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
          width: cupW,
          height: cupH,
          borderRadius: '50% 0 0 50%',
          background: 'radial-gradient(circle, #60A5FA 0%, #3B82F6 70%, #1D4ED8 100%)',
          border: '1px solid rgba(255,255,255,0.3)',
          boxShadow: `0 0 15px ${COLORS.blue}`
        }} />
        {/* Right ear cup */}
        <div style={{
          width: cupW,
          height: cupH,
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
function Sneaker3D({ parallaxX, parallaxY, delay = 0, size = {} }) {
  const w = size.w || 48
  const h = size.h || 24
  return (
    <div
      className="floating-product prod-sneaker"
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
        width: w,
        height: h,
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
function Laptop3D({ parallaxX, parallaxY, delay = 0, size = {} }) {
  const w = size.w || 52
  const h = size.h || 36
  const screenW = size.screenW || 12
  const screenH = size.screenH || 12
  return (
    <div
      className="floating-product prod-laptop"
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
        width: w,
        height: h,
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
            width: screenW,
            height: screenH,
            borderRadius: '50%',
            background: COLORS.blue,
            boxShadow: `0 0 8px ${COLORS.blue}`
          }} />
        </div>
      </div>
      {/* Laptop base */}
      <div style={{
        width: size.baseW || 44,
        height: size.baseH || 8,
        background: 'linear-gradient(135deg, #94A3B8 0%, #64748B 100%)',
        borderRadius: '0 0 4px 4px',
        margin: '0 auto',
        boxShadow: '0 4px 10px rgba(0,0,0,0.2)'
      }} />
    </div>
  )
}

// 3D Smartphone component
function Smartphone3D({ parallaxX, parallaxY, delay = 0, size = {} }) {
  const w = size.w || 40
  const h = size.h || 28
  const screenW = size.screenW || 34
  const screenH = size.screenH || 20
  const screenContentH = size.screenContentH || 16
  return (
    <div
      className="floating-product prod-smartphone"
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
        width: w,
        height: h,
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
          width: screenW,
          height: screenH,
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
            height: screenContentH,
            background: '#0284C7',
            borderRadius: 2
          }} />
        </div>
      </div>
    </div>
  )
}

// 3D Smartwatch component
function Smartwatch3D({ parallaxX, parallaxY, delay = 0, size = {} }) {
  const w = size.w || 36
  const h = size.h || 26
  return (
    <div
      className="floating-product prod-smartwatch"
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
        width: w,
        height: h,
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
function ShoppingBag3D({ color, parallaxX, parallaxY, pos, delay = 0, rot = 0, size = {}, bagClass = '' }) {
  const className = `floating-product ${bagClass}`
  const w = size.w || 32
  const h = size.h || 36
  const handleW = size.handleW || 26
  const handleH = size.handleH || 10
  const handleThickness = size.handleThickness || 6
  return (
    <div
      className={className}
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
        width: w,
        height: h,
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
          width: handleW,
          height: handleH,
          display: 'flex',
          justifyContent: 'space-between'
        }}>
          <div style={{
            width: handleThickness,
            height: handleH,
            border: `2px solid ${darken(color, 0.1)}`,
            borderTop: 'none',
            borderRight: 'none',
            borderRadius: '0 4px 4px 0'
          }} />
          <div style={{
            width: handleThickness,
            height: handleH,
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
      className="hero-3d-scene"
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        minHeight: 320,
        maxHeight: '70vh',
        perspective: 1200,
        overflow: 'visible',
        maxWidth: '100%',
        boxSizing: 'border-box'
      }}
    >
      {/* Scene container - centered */}
      <div style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'none',
        width: '100%',
        height: '100%',
        boxSizing: 'border-box'
      }}>
        {/* Glossy futuristic platform with cyan ring */}
        <div className="platform-wrap" style={{
          position: 'relative',
          width: 'var(--platform-size, 340px)',
          height: 'var(--platform-height, 140px)',
          bottom: 'var(--platform-bottom, -30px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transform: `translate(${parallaxX * 0.2}px, ${parallaxY * 0.2}px)`
        }}>
          {/* Cyan glowing ring */}
          <div className="ring" style={{
            position: 'absolute',
            width: 'var(--ring-size, 260px)',
            height: 'var(--ring-size, 260px)',
            borderRadius: '50%',
            border: `3px solid ${COLORS.cyan}`,
            boxShadow: `0 0 25px ${COLORS.cyan}, 0 0 50px ${COLORS.cyan}40`,
            top: 'var(--ring-top, -60px)',
            animation: 'rotateRing 12s linear infinite'
          }} />

          {/* Platform surface */}
          <div className="platform-surface" style={{
            position: 'absolute',
            width: 'var(--surface-width, 280px)',
            height: 'var(--surface-height, 12px)',
            borderRadius: '50%',
            background: 'linear-gradient(90deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.4) 100%)',
            bottom: 'var(--surface-bottom, -8px)',
            boxShadow: `0 0 30px ${COLORS.cyan}40`
          }} />

          {/* Platform reflection */}
          <div className="platform-reflection" style={{
            position: 'absolute',
            width: 'var(--reflection-width, 260px)',
            height: 'var(--reflection-height, 24px)',
            borderRadius: '50%',
            background: 'linear-gradient(180deg, rgba(255,255,255,0.15) 0%, transparent 100%)',
            bottom: 'var(--reflection-bottom, -18px)',
            filter: 'blur(2px)',
            opacity: 0.6
          }} />
        </div>

        {/* Shopping cart */}
        <div className="cart-wrap" style={{
          position: 'relative',
          width: 'var(--cart-size, 220px)',
          height: 'var(--cart-height, 300px)',
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
            width: 'var(--basket-width, 200px)',
            height: 'var(--basket-size, 200px)',
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
            <div className="cart-box" style={{
               width: 'var(--box-width, 70px)',
               height: 'var(--box-height, 60px)',
               background: 'linear-gradient(135deg, #8B4513 0%, #A0522D 50%, #8B4513 100%)',
               borderRadius: 6,
               marginBottom: 6,
               boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
               display: 'flex',
               alignItems: 'center',
               justifyContent: 'center',
               fontSize: 'var(--box-font, 8px)',
               fontWeight: 700,
               color: '#fff'
             }}>NEXMART</div>

             {/* Colorful shopping bags in cart */}
            <div className="cart-bags" style={{ display: 'flex', gap: 'var(--bag-gap, 4px)', flexWrap: 'wrap', justifyContent: 'center' }}>
              <div style={{ width: 'var(--bag-size, 24px)', height: 'var(--bag-height, 20px)', background: '#F59E0B', borderRadius: '4px 4px 0 0', boxShadow: '0 2px 4px rgba(0,0,0,0.15)' }} />
              <div style={{ width: 'var(--bag-size, 24px)', height: 'var(--bag-height, 20px)', background: '#3B82F6', borderRadius: '4px 4px 0 0', boxShadow: '0 2px 4px rgba(0,0,0,0.15)' }} />
              <div style={{ width: 'var(--bag-size, 24px)', height: 'var(--bag-height, 20px)', background: '#EAB308', borderRadius: '4px 4px 0 0', boxShadow: '0 2px 4px rgba(0,0,0,0.15)' }} />
              <div style={{ width: 'var(--bag-size, 24px)', height: 'var(--bag-height, 20px)', background: '#EC4899', borderRadius: '4px 4px 0 0', boxShadow: '0 2px 4px rgba(0,0,0,0.15)' }} />
            </div>
          </div>

          {/* Cart handles */}
          <div className="cart-handles" style={{
            position: 'absolute',
            top: 'var(--handles-top, 10px)',
            left: '50%',
            transform: 'translateX(-50%)',
            width: 'var(--handles-width, 200px)',
            height: 16,
            display: 'flex',
            justifyContent: 'space-between',
            padding: '0 8px',
            boxSizing: 'border-box'
          }}>
            <div style={{ width: 'var(--handle-width, 8px)', height: 16, background: '#CBD5E1', borderRadius: 2, boxShadow: '0 0 5px rgba(0,0,0,0.3)' }} />
            <div style={{ width: 'var(--handle-width, 8px)', height: 16, background: '#CBD5E1', borderRadius: 2, boxShadow: '0 0 5px rgba(0,0,0,0.3)' }} />
          </div>

          {/* Cart wheel */}
          <div className="cart-wheel" style={{
            position: 'absolute',
            top: 'var(--wheel-top, 200px)',
            left: '50%',
            transform: 'translateX(-50%) rotate(15deg)',
            width: 'var(--wheel-width, 180px)',
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
        <div className="robot-wrap" style={{
          position: 'relative',
          width: 'var(--robot-width, 200px)',
          height: 'var(--robot-height, 320px)',
          left: 'var(--robot-left, 60px)',
          top: 'var(--robot-top, -30px)',
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
        <ShoppingBag3D color="#F59E0B" parallaxX={parallaxX} parallaxY={parallaxY} pos={{ top: '20%', left: '30%' }} delay={0.2} rot={-10} bagClass="bag-1" />
        <ShoppingBag3D color="#EC4899" parallaxX={parallaxX} parallaxY={parallaxY} pos={{ top: '50%', left: '40%' }} delay={0.4} rot={5} bagClass="bag-2" />
        <ShoppingBag3D color="#3B82F6" parallaxX={parallaxX} parallaxY={parallaxY} pos={{ top: '60%', right: '20%' }} delay={0.6} rot={-5} bagClass="bag-3" />
        <ShoppingBag3D color="#A855F7" parallaxX={parallaxX} parallaxY={parallaxY} pos={{ top: '35%', right: '15%' }} delay={0.8} rot={15} bagClass="bag-4" />

        {/* Soft neon light streaks for colorful lighting */}
        <div className="light-streak" style={{
          position: 'absolute',
          top: '25%',
          left: '20%',
          width: 'var(--streak-1-w, 200px)',
          height: 'var(--streak-h, 3px)',
          background: `linear-gradient(90deg, transparent, ${COLORS.pink}40, transparent)`,
          borderRadius: 2,
          zIndex: 3,
          animation: 'light-streak 6s ease-in-out infinite'
        }} />
        <div className="light-streak" style={{
          position: 'absolute',
          top: '55%',
          left: '25%',
          width: 'var(--streak-2-w, 150px)',
          height: 'var(--streak-h, 3px)',
          background: `linear-gradient(90deg, transparent, ${COLORS.cyan}40, transparent)`,
          borderRadius: 2,
          zIndex: 3,
          animation: 'light-streak 8s ease-in-out infinite 1s'
        }} />
        <div className="light-streak" style={{
          position: 'absolute',
          top: '40%',
          right: '30%',
          width: 'var(--streak-3-w, 120px)',
          height: 'var(--streak-h, 3px)',
          background: `linear-gradient(90deg, transparent, ${COLORS.blue}40, transparent)`,
          borderRadius: 2,
          zIndex: 3,
          animation: 'light-streak 5s ease-in-out infinite 2s'
        }} />

        {/* Floating sparkle particles */}
        <div className="sparkle" style={{
          position: 'absolute',
          top: '15%',
          left: '40%',
          width: 'var(--sparkle-1, 12px)',
          height: 'var(--sparkle-1, 12px)',
          background: COLORS.pink,
          borderRadius: '50%',
          zIndex: 6,
          boxShadow: `0 0 10px ${COLORS.pink}`,
          animation: 'sparkle 3s infinite'
        }} />
        <div className="sparkle" style={{
          position: 'absolute',
          top: '50%',
          right: '35%',
          width: 'var(--sparkle-2, 10px)',
          height: 'var(--sparkle-2, 10px)',
          background: COLORS.cyan,
          borderRadius: '50%',
          zIndex: 6,
          boxShadow: `0 0 8px ${COLORS.cyan}`,
          animation: 'sparkle 2.5s infinite 0.5s'
        }} />
        <div className="sparkle" style={{
          position: 'absolute',
          top: '75%',
          left: '50%',
          width: 'var(--sparkle-3, 14px)',
          height: 'var(--sparkle-3, 14px)',
          background: COLORS.blue,
          borderRadius: '50%',
          zIndex: 6,
          boxShadow: `0 0 12px ${COLORS.blue}`,
          animation: 'sparkle 4s infinite 1s'
        }} />

      </div>

      <style>{`
        /* Default (desktop) sizing variables */
        .hero-3d-scene {
          --platform-size: 340px;
          --platform-height: 140px;
          --platform-bottom: -30px;
          --ring-size: 260px;
          --ring-top: -60px;
          --surface-width: 280px;
          --surface-height: 12px;
          --surface-bottom: -8px;
          --reflection-width: 260px;
          --reflection-height: 24px;
          --reflection-bottom: -18px;
          --cart-size: 220px;
          --cart-height: 300px;
          --basket-width: 200px;
          --basket-size: 200px;
          --box-width: 70px;
          --box-height: 60px;
          --box-font: 8px;
          --bag-size: 24px;
          --bag-height: 20px;
          --bag-gap: 4px;
          --handles-top: 10px;
          --handles-width: 200px;
          --handle-width: 8px;
          --wheel-top: 200px;
          --wheel-width: 180px;
          --robot-width: 200px;
          --robot-height: 320px;
          --robot-left: 60px;
          --robot-top: -30px;
          --sparkle-size: 12px;
          --light-streak-width: 200px;
        }
        /* Mobile (under 768px) - smaller and spaced out */
        @media (max-width: 767px) {
          .hero-3d-scene {
            --platform-size: 260px;
            --platform-height: 120px;
            --platform-bottom: -25px;
            --ring-size: 200px;
            --ring-top: -45px;
            --surface-width: 210px;
            --surface-height: 10px;
            --surface-bottom: -7px;
            --reflection-width: 200px;
            --reflection-height: 20px;
            --reflection-bottom: -14px;
            --cart-size: 170px;
            --cart-height: 240px;
            --basket-width: 160px;
            --basket-size: 160px;
            --box-width: 55px;
            --box-height: 45px;
            --box-font: 6px;
            --bag-size: 18px;
            --bag-height: 16px;
            --bag-gap: 3px;
            --handles-top: 8px;
            --handles-width: 160px;
            --handle-width: 6px;
            --wheel-top: 160px;
            --wheel-width: 145px;
            --robot-width: 160px;
            --robot-height: 255px;
            --robot-left: 45px;
            --robot-top: -20px;
            --sparkle-1: 10px;
            --sparkle-2: 8px;
            --sparkle-3: 10px;
            --streak-1-w: 150px;
            --streak-2-w: 120px;
            --streak-3-w: 100px;
          }
          /* Reposition floating products for mobile to avoid overlap */
          .prod-headphone {
            top: 20% !important;
            left: 5% !important;
          }
          .prod-sneaker {
            top: 70% !important;
            left: 5% !important;
          }
          .prod-laptop {
            top: 40% !important;
            left: 15% !important;
          }
          .prod-smartphone {
            top: 35% !important;
            right: 15% !important;
          }
          .prod-smartwatch {
            top: 65% !important;
            right: 20% !important;
          }
          .bag-1 { top: 15% !important; left: 25% !important; }
          .bag-2 { top: 45% !important; left: 35% !important; }
          .bag-3 { top: 55% !important; right: 15% !important; }
          .bag-4 { top: 30% !important; right: 10% !important; }
          /* Reduce cart height on mobile */
          .cart-wrap {
            height: var(--cart-height, 240px) !important;
          }
          .robot-wrap {
            left: var(--robot-left, 45px) !important;
            top: var(--robot-top, -20px) !important;
            width: var(--robot-width, 160px) !important;
            height: var(--robot-height, 255px) !important;
          }
        }
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
