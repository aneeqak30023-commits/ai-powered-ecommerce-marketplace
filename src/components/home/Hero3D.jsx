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

function getProductImage(categoryId, products = []) {
  const product = products.find(p => p.categoryId === categoryId)
  return product?.image || ''
}

// Realistic product as a standalone floating object
function ProductOrb({ src, alt, size, style, className, parallaxX, parallaxY, delay = 0, floatAnim = 'float-prod-1' }) {
  return (
    <div
      className={`floating-product ${className}`}
      style={{
        position: 'absolute',
        ...style,
        zIndex: 7,
        animation: `${floatAnim} 4s ease-in-out infinite`,
        animationDelay: `${delay}s`,
        transform: `translate(${parallaxX * 0.5}px, ${parallaxY * 0.5}px)`
      }}
    >
      {/* Ground shadow */}
      <div style={{
        position: 'absolute',
        bottom: -12,
        left: '50%',
        transform: 'translateX(-50%)',
        width: '90%',
        height: 18,
        background: 'radial-gradient(ellipse, rgba(0,0,0,0.45) 0%, transparent 70%)',
        filter: 'blur(6px)',
        zIndex: -1
      }} />
      {/* Soft glow behind product */}
      <div style={{
        position: 'absolute',
        inset: -20,
        borderRadius: '50%',
        background: `radial-gradient(circle, ${COLORS.cyan}25 0%, transparent 70%)`,
        filter: 'blur(12px)',
        zIndex: -1
      }} />
      {/* Product image with soft mask for natural edges */}
      <div style={{
        width: size || 56,
        height: size || 56,
        borderRadius: '50%',
        overflow: 'hidden',
        position: 'relative',
        transform: 'perspective(800px) rotateX(8deg) rotateY(-10deg)',
        transformStyle: 'preserve-3d',
        boxShadow: '0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05)'
      }}>
        <img
          src={src}
          alt={alt}
          loading="lazy"
          style={{
            width: '120%',
            height: '120%',
            objectFit: 'cover',
            display: 'block',
            filter: 'drop-shadow(0 15px 30px rgba(0,0,0,0.6)) brightness(1.1) contrast(1.05)',
            transform: 'translate(-10%, -10%)'
          }}
        />
        {/* Reflection overlay */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(135deg, rgba(255,255,255,0.3) 0%, transparent 35%, rgba(0,0,0,0.1) 100%)',
          pointerEvents: 'none',
          mixBlendMode: 'overlay'
        }} />
      </div>
    </div>
  )
}

// Premium shopping bag
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
        background: `linear-gradient(145deg, ${color} 0%, ${darken(color, 0.15)} 100%)`,
        borderRadius: '6px 6px 0 0',
        border: '1px solid rgba(255,255,255,0.25)',
        boxShadow: '0 8px 18px rgba(0,0,0,0.3), inset 0 2px 4px rgba(255,255,255,0.3)',
        position: 'relative'
      }}>
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
            border: `2px solid ${darken(color, 0.2)}`,
            borderTop: 'none',
            borderRight: 'none',
            borderRadius: '0 4px 4px 0'
          }} />
          <div style={{
            width: handleThickness,
            height: handleH,
            border: `2px solid ${darken(color, 0.2)}`,
            borderTop: 'none',
            borderLeft: 'none',
            borderRadius: '4px 0 0 4px'
          }} />
        </div>
      </div>
    </div>
  )
}

export default function Hero3D({ products = [] }) {
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
        {/* Rich gradient background environment */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: `
            radial-gradient(ellipse at 20% 30%, rgba(59,130,246,0.35) 0%, transparent 55%),
            radial-gradient(ellipse at 80% 70%, rgba(139,92,246,0.35) 0%, transparent 55%),
            radial-gradient(ellipse at 50% 50%, rgba(6,182,212,0.2) 0%, transparent 65%),
            radial-gradient(ellipse at 70% 20%, rgba(236,72,153,0.25) 0%, transparent 45%),
            radial-gradient(ellipse at 30% 80%, rgba(99,102,241,0.2) 0%, transparent 45%),
            linear-gradient(135deg, #0F172A 0%, #1E293B 30%, #0F172A 60%, #1E293B 100%)
          `,
          zIndex: 0
        }} />

        {/* Atmospheric glow layers */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: `
            radial-gradient(circle at 30% 40%, rgba(99,102,241,0.2) 0%, transparent 55%),
            radial-gradient(circle at 70% 60%, rgba(6,182,212,0.18) 0%, transparent 55%),
            radial-gradient(circle at 50% 80%, rgba(236,72,153,0.15) 0%, transparent 45%),
            radial-gradient(circle at 20% 70%, rgba(139,92,246,0.15) 0%, transparent 40%)
          `,
          zIndex: 1
        }} />

        {/* Large glossy futuristic platform with cyan ring */}
        <div className="platform-wrap" style={{
          position: 'relative',
          width: 'var(--platform-size, 420px)',
          height: 'var(--platform-height, 180px)',
          bottom: 'var(--platform-bottom, -40px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transform: `translate(${parallaxX * 0.2}px, ${parallaxY * 0.2}px)`,
          zIndex: 2
        }}>
          {/* Platform surface - glossy with reflection */}
          <div className="platform-surface" style={{
            position: 'absolute',
            width: 'var(--surface-width, 360px)',
            height: 'var(--surface-height, 16px)',
            borderRadius: '50%',
            background: 'linear-gradient(90deg, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.6) 100%)',
            bottom: 'var(--surface-bottom, -10px)',
            boxShadow: `0 0 40px ${COLORS.cyan}80, 0 0 80px ${COLORS.cyan}40`
          }} />

          {/* Platform reflection */}
          <div className="platform-reflection" style={{
            position: 'absolute',
            width: 'var(--reflection-width, 320px)',
            height: 'var(--reflection-height, 32px)',
            borderRadius: '50%',
            background: 'linear-gradient(180deg, rgba(255,255,255,0.35) 0%, transparent 100%)',
            bottom: 'var(--reflection-bottom, -22px)',
            filter: 'blur(6px)',
            opacity: 0.8
          }} />
        </div>

        {/* Cyan glowing ring */}
        <div className="ring" style={{
          position: 'absolute',
          width: 'var(--ring-size, 320px)',
          height: 'var(--ring-size, 320px)',
          borderRadius: '50%',
          border: `3px solid ${COLORS.cyan}`,
          boxShadow: `0 0 35px ${COLORS.cyan}, 0 0 70px ${COLORS.cyan}60`,
          top: 'var(--ring-top, -70px)',
          animation: 'rotateRing 12s linear infinite',
          zIndex: 3
        }} />

        {/* Premium Shopping Cart - foreground */}
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
            background: 'linear-gradient(145deg, #CBD5E1 0%, #94A5B8 50%, #CBD5E1 100%)',
            border: '2px solid #94A5B8',
            boxShadow: '0 15px 40px rgba(0,0,0,0.4), inset 0 2px 4px rgba(255,255,255,0.6)',
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
               boxShadow: '0 4px 8px rgba(0,0,0,0.3), inset 0 1px 2px rgba(255,255,255,0.3)',
               display: 'flex',
               alignItems: 'center',
               justifyContent: 'center',
               fontSize: 'var(--box-font, 8px)',
               fontWeight: 700,
               color: '#fff',
               letterSpacing: '0.05em'
             }}>NEXMART</div>

             {/* Colorful shopping bags in cart */}
            <div className="cart-bags" style={{ display: 'flex', gap: 'var(--bag-gap, 4px)', flexWrap: 'wrap', justifyContent: 'center' }}>
              <div style={{ width: 'var(--bag-size, 24px)', height: 'var(--bag-height, 20px)', background: 'linear-gradient(145deg, #F59E0B 0%, #D97706 100%)', borderRadius: '4px 4px 0 0', boxShadow: '0 2px 4px rgba(0,0,0,0.25)' }} />
              <div style={{ width: 'var(--bag-size, 24px)', height: 'var(--bag-height, 20px)', background: 'linear-gradient(145deg, #3B82F6 0%, #2563EB 100%)', borderRadius: '4px 4px 0 0', boxShadow: '0 2px 4px rgba(0,0,0,0.25)' }} />
              <div style={{ width: 'var(--bag-size, 24px)', height: 'var(--bag-height, 20px)', background: 'linear-gradient(145deg, #EAB308 0%, #CA8A04 100%)', borderRadius: '4px 4px 0 0', boxShadow: '0 2px 4px rgba(0,0,0,0.25)' }} />
              <div style={{ width: 'var(--bag-size, 24px)', height: 'var(--bag-height, 20px)', background: 'linear-gradient(145deg, #EC4899 0%, #DB2777 100%)', borderRadius: '4px 4px 0 0', boxShadow: '0 2px 4px rgba(0,0,0,0.25)' }} />
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
            <div style={{ width: 'var(--handle-width, 8px)', height: 16, background: 'linear-gradient(180deg, #CBD5E1 0%, #94A5B8 100%)', borderRadius: 2, boxShadow: '0 0 5px rgba(0,0,0,0.3)' }} />
            <div style={{ width: 'var(--handle-width, 8px)', height: 16, background: 'linear-gradient(180deg, #CBD5E1 0%, #94A5B8 100%)', borderRadius: 2, boxShadow: '0 0 5px rgba(0,0,0,0.3)' }} />
          </div>

          {/* Cart wheel */}
          <div className="cart-wheel" style={{
            position: 'absolute',
            top: 'var(--wheel-top, 200px)',
            left: '50%',
            transform: 'translateX(-50%) rotate(15deg)',
            width: 'var(--wheel-width, 180px)',
            height: 8,
            border: '2px solid #94A5B8',
            borderRadius: '50% 50% 0 0',
            borderTop: 'none',
            borderBottom: 'none'
          }}>
            <div style={{
              position: 'absolute',
              width: 8,
              height: 40,
              background: 'linear-gradient(180deg, #94A5B8 0%, #64748B 100%)',
              left: '25%',
              top: -16,
              borderRadius: 4
            }} />
          </div>
        </div>

        {/* AI Robot - centered complete character */}
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
              boxShadow: '0 12px 25px rgba(0,0,0,0.3), inset 0 2px 4px rgba(255,255,255,0.6)'
            }} />
            <div style={{
              width: 25,
              height: 80,
              background: 'linear-gradient(145deg, #F1F5F9 0%, #CBD5E1 100%)',
              borderRadius: '12px 12px 40px 40px',
              boxShadow: '0 12px 25px rgba(0,0,0,0.3), inset 0 2px 4px rgba(255,255,255,0.6)'
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
            border: '2px solid rgba(255,255,255,0.7)',
            boxShadow: '0 10px 30px rgba(0,0,0,0.4), inset 0 4px 8px rgba(255,255,255,0.7), 0 0 30px rgba(139,92,246,0.4)',
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
              boxShadow: `0 0 20px ${COLORS.blue}, 0 0 40px ${COLORS.blue}60`
            }}>
              <span style={{ color: '#fff', fontSize: 16, fontWeight: 700, letterSpacing: '-0.02em' }}>AI</span>
            </div>

            {/* Chest line */}
            <div style={{
              marginTop: 12,
              width: 60,
              height: 2,
              background: 'rgba(0,0,0,0.15)',
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
              border: '1px solid rgba(255,255,255,0.2)',
              boxShadow: `0 0 12px ${COLORS.purple}50`
            }} />
            <div style={{
              position: 'absolute',
              top: 20,
              right: 8,
              width: 22,
              height: 40,
              background: `linear-gradient(135deg, ${COLORS.purple} 0%, ${COLORS.blue} 100%)`,
              borderRadius: 8,
              border: '1px solid rgba(255,255,255,0.2)',
              boxShadow: `0 0 12px ${COLORS.purple}50`
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
              border: '2px solid rgba(255,255,255,0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.15), 0 0 20px rgba(6,182,212,0.4)'
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
                  boxShadow: `0 0 12px ${COLORS.cyan}, 0 0 20px ${COLORS.cyan}`
                }} />
                <div style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: COLORS.cyan,
                  boxShadow: `0 0 12px ${COLORS.cyan}, 0 0 20px ${COLORS.cyan}`
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
              boxShadow: `0 0 8px ${COLORS.cyan}`
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
            boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
            zIndex: -1
          }} />
        </div>

        {/* Realistic floating product objects - standalone with no rectangular cards */}
        {/* Headphones - top left */}
        <ProductOrb
          src={getProductImage('electronics', products)}
          alt="Wireless Headphones"
          size={120}
          className="prod-headphone"
          style={{ top: '10%', left: '0%' }}
          parallaxX={parallaxX}
          parallaxY={parallaxY}
          delay={0}
          rotate="-6deg"
          floatAnim="float-prod-1"
        />

        {/* Sneakers - bottom left */}
        <ProductOrb
          src={getProductImage('sports', products)}
          alt="Running Shoes"
          size={140}
          className="prod-sneaker"
          style={{ top: '52%', left: '-2%' }}
          parallaxX={parallaxX}
          parallaxY={parallaxY}
          delay={0.2}
          rotate="-4deg"
          floatAnim="float-prod-2"
        />

        {/* Laptop - center left */}
        <ProductOrb
          src="https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&h=400&fit=crop"
          alt="Premium Laptop"
          size={160}
          className="prod-laptop"
          style={{ top: '28%', left: '10%' }}
          parallaxX={parallaxX}
          parallaxY={parallaxY}
          delay={0.5}
          rotate="0deg"
          floatAnim="float-prod-3"
        />

        {/* Smartphone - top right */}
        <ProductOrb
          src={getProductImage('electronics', products)}
          alt="Smartphone"
          size={100}
          className="prod-smartphone"
          style={{ top: '12%', right: '8%' }}
          parallaxX={parallaxX}
          parallaxY={parallaxY}
          delay={0.3}
          rotate="5deg"
          floatAnim="float-prod-2"
        />

        {/* Smartwatch - bottom right */}
        <ProductOrb
          src={getProductImage('electronics', products)}
          alt="Smart Watch"
          size={100}
          className="prod-smartwatch"
          style={{ top: '46%', right: '10%' }}
          parallaxX={parallaxX}
          parallaxY={parallaxY}
          delay={0.7}
          rotate="8deg"
          floatAnim="float-prod-1"
        />

        {/* Floating shopping bags around the scene */}
        <ShoppingBag3D color="#F59E0B" parallaxX={parallaxX} parallaxY={parallaxY} pos={{ top: '14%', left: '24%' }} delay={0.2} rot={-10} bagClass="bag-1" />
        <ShoppingBag3D color="#EC4899" parallaxX={parallaxX} parallaxY={parallaxY} pos={{ top: '44%', left: '32%' }} delay={0.4} rot={5} bagClass="bag-2" />
        <ShoppingBag3D color="#3B82F6" parallaxX={parallaxX} parallaxY={parallaxY} pos={{ top: '54%', right: '14%' }} delay={0.6} rot={-5} bagClass="bag-3" />
        <ShoppingBag3D color="#A855F7" parallaxX={parallaxX} parallaxY={parallaxY} pos={{ top: '28%', right: '8%' }} delay={0.8} rot={15} bagClass="bag-4" />

        {/* Soft neon light streaks for colorful lighting */}
        <div className="light-streak" style={{
          position: 'absolute',
          top: '18%',
          left: '14%',
          width: 'var(--streak-1-w, 200px)',
          height: 'var(--streak-h, 3px)',
          background: `linear-gradient(90deg, transparent, ${COLORS.pink}40, transparent)`,
          borderRadius: 2,
          zIndex: 3,
          animation: 'light-streak 6s ease-in-out infinite'
        }} />
        <div className="light-streak" style={{
          position: 'absolute',
          top: '48%',
          left: '18%',
          width: 'var(--streak-2-w, 150px)',
          height: 'var(--streak-h, 3px)',
          background: `linear-gradient(90deg, transparent, ${COLORS.cyan}40, transparent)`,
          borderRadius: 2,
          zIndex: 3,
          animation: 'light-streak 8s ease-in-out infinite 1s'
        }} />
        <div className="light-streak" style={{
          position: 'absolute',
          top: '34%',
          right: '24%',
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
          top: '10%',
          left: '34%',
          width: 'var(--sparkle-1, 12px)',
          height: 'var(--sparkle-1, 12px)',
          background: COLORS.pink,
          borderRadius: '50%',
          zIndex: 6,
          boxShadow: `0 0 12px ${COLORS.pink}`,
          animation: 'sparkle 3s infinite'
        }} />
        <div className="sparkle" style={{
          position: 'absolute',
          top: '44%',
          right: '28%',
          width: 'var(--sparkle-2, 10px)',
          height: 'var(--sparkle-2, 10px)',
          background: COLORS.cyan,
          borderRadius: '50%',
          zIndex: 6,
          boxShadow: `0 0 10px ${COLORS.cyan}`,
          animation: 'sparkle 2.5s infinite 0.5s'
        }} />
        <div className="sparkle" style={{
          position: 'absolute',
          top: '68%',
          left: '44%',
          width: 'var(--sparkle-3, 14px)',
          height: 'var(--sparkle-3, 14px)',
          background: COLORS.blue,
          borderRadius: '50%',
          zIndex: 6,
          boxShadow: `0 0 14px ${COLORS.blue}`,
          animation: 'sparkle 4s infinite 1s'
        }} />

      </div>

      <style>{`
        /* Default (desktop) sizing variables */
        .hero-3d-scene {
          --platform-size: 420px;
          --platform-height: 180px;
          --platform-bottom: -40px;
          --ring-size: 320px;
          --ring-top: -70px;
          --surface-width: 360px;
          --surface-height: 16px;
          --surface-bottom: -10px;
          --reflection-width: 320px;
          --reflection-height: 32px;
          --reflection-bottom: -22px;
          --cart-size: 240px;
          --cart-height: 320px;
          --basket-width: 220px;
          --basket-size: 220px;
          --box-width: 75px;
          --box-height: 65px;
          --box-font: 9px;
          --bag-size: 26px;
          --bag-height: 22px;
          --bag-gap: 5px;
          --handles-top: 12px;
          --handles-width: 220px;
          --handle-width: 9px;
          --wheel-top: 220px;
          --wheel-width: 200px;
          --robot-width: 220px;
          --robot-height: 340px;
          --robot-left: 70px;
          --robot-top: -35px;
          --sparkle-size: 14px;
          --light-streak-width: 220px;
        }
        /* Mobile (under 768px) - smaller and spaced out */
        @media (max-width: 767px) {
          .hero-3d-scene {
            --platform-size: 320px;
            --platform-height: 150px;
            --platform-bottom: -32px;
            --ring-size: 250px;
            --ring-top: -55px;
            --surface-width: 260px;
            --surface-height: 13px;
            --surface-bottom: -8px;
            --reflection-width: 240px;
            --reflection-height: 26px;
            --reflection-bottom: -17px;
            --cart-size: 190px;
            --cart-height: 260px;
            --basket-width: 170px;
            --basket-size: 170px;
            --box-width: 60px;
            --box-height: 50px;
            --box-font: 7px;
            --bag-size: 20px;
            --bag-height: 18px;
            --bag-gap: 4px;
            --handles-top: 10px;
            --handles-width: 180px;
            --handle-width: 7px;
            --wheel-top: 180px;
            --wheel-width: 160px;
            --robot-width: 180px;
            --robot-height: 280px;
            --robot-left: 50px;
            --robot-top: -25px;
            --sparkle-1: 11px;
            --sparkle-2: 9px;
            --sparkle-3: 11px;
            --streak-1-w: 160px;
            --streak-2-w: 130px;
            --streak-3-w: 110px;
          }
          /* Reposition floating products for mobile to avoid overlap */
          .prod-headphone {
            top: 8% !important;
            left: -2% !important;
          }
          .prod-sneaker {
            top: 54% !important;
            left: -4% !important;
          }
          .prod-laptop {
            top: 26% !important;
            left: 8% !important;
          }
          .prod-smartphone {
            top: 20% !important;
            right: 6% !important;
          }
          .prod-smartwatch {
            top: 50% !important;
            right: 8% !important;
          }
          .bag-1 { top: 8% !important; left: 18% !important; }
          .bag-2 { top: 38% !important; left: 28% !important; }
          .bag-3 { top: 48% !important; right: 8% !important; }
          .bag-4 { top: 22% !important; right: 4% !important; }
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
