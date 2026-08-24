import { Link } from 'react-router-dom'

const C = { primary: '#4F46E5' }

export default function Hero() {
  return (
    <section style={{ padding: '24px 20px', maxWidth: 1200, margin: '0 auto' }}>
      <div
        style={{
          background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
          borderRadius: 24,
          boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2), 0 8px 10px -6px rgba(0,0,0,0.1)',
          padding: 'clamp(40px, 8vw, 80px) clamp(20px, 5vw, 40px)',
          color: '#fff',
          textAlign: 'center'
        }}
      >
        <h1 style={{ margin: 0, fontSize: 'clamp(28px, 5vw, 48px)', fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.1 }}>
          Discover Amazing Products
        </h1>
        <p style={{ margin: '16px auto 0', maxWidth: 560, fontSize: 'clamp(15px, 2.5vw, 18px)', opacity: 0.92, lineHeight: 1.6 }}>
          Shop the latest trends with AI-powered recommendations tailored just for you.
        </p>
        <Link
          to="/products"
          style={{
            display: 'inline-block',
            marginTop: 28,
            padding: '14px 32px',
            background: '#fff',
            color: C.primary,
            textDecoration: 'none',
            borderRadius: 8,
            fontWeight: 700,
            fontSize: 16,
            transition: 'transform .15s ease, box-shadow .15s ease'
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'none')}
        >
          Shop Now
        </Link>
      </div>
    </section>
  )
}
