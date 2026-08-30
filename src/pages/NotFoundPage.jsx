import { Link } from 'react-router-dom'

const C = {
  primary: '#6366F1',
  text: '#0F172A',
  textSecondary: '#475569',
  background: '#F8FAFC'
}

export default function NotFoundPage() {
  return (
    <div style={{ minHeight: '100vh', background: C.background, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 20px' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 80, fontWeight: 800, color: C.primary, margin: '0 0 16px', letterSpacing: '-0.02em' }}>404</div>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: C.text, margin: '0 0 12px' }}>Page Not Found</h1>
        <p style={{ fontSize: 16, color: C.textSecondary, margin: '0 0 32px', maxWidth: 480, marginLeft: 'auto', marginRight: 'auto', lineHeight: 1.6 }}>
          The page you're looking for doesn't exist. It might have been moved, deleted, or you entered the wrong URL.
        </p>
        <Link
          to="/"
          style={{ display: 'inline-block', padding: '12px 24px', background: `linear-gradient(135deg, ${C.primary} 0%, #4F46E5 100%)`, color: '#fff', textDecoration: 'none', borderRadius: 10, fontWeight: 600 }}
        >
          Go Back Home
        </Link>
      </div>
    </div>
  )
}
