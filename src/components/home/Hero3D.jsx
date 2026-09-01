import { useState, useEffect, useRef } from 'react'

export default function Hero3D() {
  const containerRef = useRef(null)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })

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

  const parallaxX = (mousePos.x - 0.5) * 20
  const parallaxY = (mousePos.y - 0.5) * 20

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
        background: 'linear-gradient(135deg, #0D1117 0%, #1E293B 50%, #312E81 100%)',
        border: '1px solid rgba(99,102,241,0.15)'
      }}
    >
      {/* Floating gradient orbs */}
      <div style={{
        position: 'absolute',
        width: 280,
        height: 280,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(99,102,241,0.2) 0%, transparent 70%)',
        top: '15%',
        left: '10%',
        filter: 'blur(50px)',
        transform: `translate(${parallaxX * 0.3}px, ${parallaxY * 0.3}px)`,
        animation: 'pulse-slow 8s ease-in-out infinite'
      }} />

      <div style={{
        position: 'absolute',
        width: 220,
        height: 220,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(139,92,246,0.18) 0%, transparent 70%)',
        bottom: '20%',
        right: '15%',
        filter: 'blur(50px)',
        transform: `translate(${parallaxX * -0.2}px, ${parallaxY * -0.2}px)`,
        animation: 'pulse-slow 12s ease-in-out infinite'
      }} />

      <div style={{
        position: 'absolute',
        width: 180,
        height: 180,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(14,165,233,0.15) 0%, transparent 70%)',
        top: '50%',
        left: '50%',
        filter: 'blur(40px)',
        transform: `translate(${parallaxX * 0.5}px, ${parallaxY * 0.5}px)`,
        animation: 'pulse-medium 10s ease-in-out infinite'
      }} />

      {/* AI neural grid overlay */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        opacity: 0.15,
        pointerEvents: 'none'
      }}>
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(99,102,241,0.2)" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
          <circle cx="30%" cy="40%" r="2" fill="rgba(99,102,241,0.4)">
            <animate attributeName="r" values="2;4;2" dur="4s" repeatCount="indefinite" />
          </circle>
          <circle cx="70%" cy="35%" r="1.5" fill="rgba(139,92,246,0.3)">
            <animate attributeName="r" values="1.5;3;1.5" dur="6s" repeatCount="indefinite" />
          </circle>
          <circle cx="50%" cy="65%" r="1.8" fill="rgba(14,165,233,0.35)">
            <animate attributeName="r" values="1.8;3.5;1.8" dur="5s" repeatCount="indefinite" />
          </circle>
          <line x1="25%" y1="40%" x2="75%" y2="35%" stroke="rgba(99,102,241,0.1)" strokeWidth="0.5" />
          <line x1="25%" y1="40%" x2="50%" y2="65%" stroke="rgba(99,102,241,0.1)" strokeWidth="0.5" />
          <line x1="75%" y1="35%" x2="50%" y2="65%" stroke="rgba(99,102,241,0.1)" strokeWidth="0.5" />
        </svg>
      </div>

      {/* Floating AI badge */}
      <div style={{
        position: 'absolute',
        top: 24,
        right: 24,
        background: 'rgba(255,255,255,0.1)',
        backdropFilter: 'blur(8px)',
        border: '1px solid rgba(255,255,255,0.15)',
        borderRadius: 16,
        padding: '12px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        fontSize: 13,
        fontWeight: 600,
        color: '#FFFFFF'
      }}>
        <span style={{ fontSize: 16 }}>✨</span>
        AI-Powered Shopping
      </div>

      <style>{`
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.3; filter: blur(50px) scale(1); }
          50% { opacity: 0.5; filter: blur(55px) scale(1.05); }
        }
        @keyframes pulse-medium {
          0%, 100% { opacity: 0.2; filter: blur(40px) scale(1); }
          50% { opacity: 0.4; filter: blur(45px) scale(1.03); }
        }
      `}</style>
    </div>
  )
}
