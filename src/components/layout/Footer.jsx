import { Link } from 'react-router-dom'

const C = {
  footerBg: '#0F172A',
  footerText: '#CBD5E1',
  footerMuted: '#94A3B8',
  primary: '#6366F1',
  primaryLight: '#EEF2FF'
}

function SocialIcon({ children, label }) {
  return (
    <a
      href="#"
      onClick={(e) => e.preventDefault()}
      aria-label={label}
      style={{
        width: 40,
        height: 40,
        borderRadius: 10,
        background: 'rgba(255,255,255,0.08)',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: C.footerText,
        transition: 'all 0.2s ease'
      }}
      onMouseEnter={(e) => { e.currentTarget.style.background = C.primary; e.currentTarget.style.transform = 'translateY(-2px)' }}
      onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.transform = 'translateY(0)' }}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        {children}
      </svg>
    </a>
  )
}

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer style={{ background: C.footerBg, color: C.footerText, marginTop: 'auto' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '64px 24px 32px' }}>
        <div className="footer-grid" style={{ display: 'grid', gap: 40 }}>
          {/* Brand Column */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                background: 'linear-gradient(135deg, #6366F1, #4F46E5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M6 7h12l-1 13H7L6 7z" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M9 7V5a3 3 0 0 1 6 0v2" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <span style={{ fontSize: 20, fontWeight: 700, color: '#fff', letterSpacing: '-0.02em' }}>NexMart</span>
            </div>
            <p style={{ fontSize: 14, lineHeight: 1.7, color: C.footerMuted, margin: '0 0 20px', maxWidth: 280 }}>
              Your AI-powered marketplace, bringing you the latest products with smart, personalized recommendations.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <SocialIcon label="Facebook">
                <path d="M22 12a10 10 0 1 0-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.5h-1.3c-1.2 0-1.6.8-1.6 1.6V12h2.8l-.4 2.9h-2.4v7A10 10 0 0 0 22 12z" />
              </SocialIcon>
              <SocialIcon label="Twitter">
                <path d="M18 2h3l-7.5 8.6L22 22h-6.7l-5.2-6.8L4 22H1l8-9.2L1.5 2h6.9l4.7 6.2L18 2z" />
              </SocialIcon>
              <SocialIcon label="Instagram">
                <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 18a8 8 0 1 1 0-16 8 8 0 0 1 0 16zm1-13h2v2h-2V7zm-2 2h2v2h-2V9zm-2 2h2v2h-2v-2zm-2 2h2v2h-2v-2zm8 0h2v2h-2v-2zm-2 0h2v2h-2v-2zm-2 0h2v2h-2v-2z" />
              </SocialIcon>
              <SocialIcon label="LinkedIn">
                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2V9zm2-6a2 2 0 1 1 0 4 2 2 0 0 1 0-4z" />
              </SocialIcon>
            </div>
          </div>

          {/* Shop Column */}
          <div>
            <h3 style={{ color: '#fff', fontSize: 14, fontWeight: 700, margin: '0 0 20px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Shop</h3>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <li><Link to="/products" style={{ color: C.footerText, textDecoration: 'none', fontSize: 14, transition: 'color 0.2s ease' }} onMouseEnter={(e) => e.currentTarget.style.color = '#fff'} onMouseLeave={(e) => e.currentTarget.style.color = C.footerText}>All Products</Link></li>
              <li><Link to="/products" style={{ color: C.footerText, textDecoration: 'none', fontSize: 14, transition: 'color 0.2s ease' }} onMouseEnter={(e) => e.currentTarget.style.color = '#fff'} onMouseLeave={(e) => e.currentTarget.style.color = C.footerText}>New Arrivals</Link></li>
              <li><Link to="/products" style={{ color: C.footerText, textDecoration: 'none', fontSize: 14, transition: 'color 0.2s ease' }} onMouseEnter={(e) => e.currentTarget.style.color = '#fff'} onMouseLeave={(e) => e.currentTarget.style.color = C.footerText}>Best Sellers</Link></li>
              <li><Link to="/products" style={{ color: C.footerText, textDecoration: 'none', fontSize: 14, transition: 'color 0.2s ease' }} onMouseEnter={(e) => e.currentTarget.style.color = '#fff'} onMouseLeave={(e) => e.currentTarget.style.color = C.footerText}>Sale</Link></li>
            </ul>
          </div>

          {/* Company Column */}
          <div>
            <h3 style={{ color: '#fff', fontSize: 14, fontWeight: 700, margin: '0 0 20px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Company</h3>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <li><a href="#" onClick={(e) => e.preventDefault()} style={{ color: C.footerText, textDecoration: 'none', fontSize: 14, transition: 'color 0.2s ease' }} onMouseEnter={(e) => e.currentTarget.style.color = '#fff'} onMouseLeave={(e) => e.currentTarget.style.color = C.footerText}>About Us</a></li>
              <li><a href="#" onClick={(e) => e.preventDefault()} style={{ color: C.footerText, textDecoration: 'none', fontSize: 14, transition: 'color 0.2s ease' }} onMouseEnter={(e) => e.currentTarget.style.color = '#fff'} onMouseLeave={(e) => e.currentTarget.style.color = C.footerText}>Careers</a></li>
              <li><a href="#" onClick={(e) => e.preventDefault()} style={{ color: C.footerText, textDecoration: 'none', fontSize: 14, transition: 'color 0.2s ease' }} onMouseEnter={(e) => e.currentTarget.style.color = '#fff'} onMouseLeave={(e) => e.currentTarget.style.color = C.footerText}>Press</a></li>
              <li><a href="#" onClick={(e) => e.preventDefault()} style={{ color: C.footerText, textDecoration: 'none', fontSize: 14, transition: 'color 0.2s ease' }} onMouseEnter={(e) => e.currentTarget.style.color = '#fff'} onMouseLeave={(e) => e.currentTarget.style.color = C.footerText}>Blog</a></li>
            </ul>
          </div>

          {/* Support Column */}
          <div>
            <h3 style={{ color: '#fff', fontSize: 14, fontWeight: 700, margin: '0 0 20px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Support</h3>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <li><a href="#" onClick={(e) => e.preventDefault()} style={{ color: C.footerText, textDecoration: 'none', fontSize: 14, transition: 'color 0.2s ease' }} onMouseEnter={(e) => e.currentTarget.style.color = '#fff'} onMouseLeave={(e) => e.currentTarget.style.color = C.footerText}>Shipping</a></li>
              <li><a href="#" onClick={(e) => e.preventDefault()} style={{ color: C.footerText, textDecoration: 'none', fontSize: 14, transition: 'color 0.2s ease' }} onMouseEnter={(e) => e.currentTarget.style.color = '#fff'} onMouseLeave={(e) => e.currentTarget.style.color = C.footerText}>Returns</a></li>
              <li><a href="#" onClick={(e) => e.preventDefault()} style={{ color: C.footerText, textDecoration: 'none', fontSize: 14, transition: 'color 0.2s ease' }} onMouseEnter={(e) => e.currentTarget.style.color = '#fff'} onMouseLeave={(e) => e.currentTarget.style.color = C.footerText}>FAQ</a></li>
              <li><a href="#" onClick={(e) => e.preventDefault()} style={{ color: C.footerText, textDecoration: 'none', fontSize: 14, transition: 'color 0.2s ease' }} onMouseEnter={(e) => e.currentTarget.style.color = '#fff'} onMouseLeave={(e) => e.currentTarget.style.color = C.footerText}>Contact</a></li>
            </ul>
          </div>
        </div>

        {/* AI Features Banner */}
        <div style={{
          marginTop: 40,
          padding: '20px 24px',
          borderRadius: 16,
          background: 'rgba(99, 102, 241, 0.1)',
          border: '1px solid rgba(99, 102, 241, 0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 16
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 24 }}>✨</span>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>AI-Powered Shopping Experience</div>
              <div style={{ fontSize: 12, color: C.footerMuted }}>Smart search, recommendations, and product comparison</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ padding: '4px 10px', borderRadius: 9999, background: 'rgba(99, 102, 241, 0.2)', color: '#A5B4FC', fontSize: 11, fontWeight: 600 }}>Smart Search</span>
            <span style={{ padding: '4px 10px', borderRadius: 9999, background: 'rgba(99, 102, 241, 0.2)', color: '#A5B4FC', fontSize: 11, fontWeight: 600 }}>AI Recommendations</span>
            <span style={{ padding: '4px 10px', borderRadius: 9999, background: 'rgba(99, 102, 241, 0.2)', color: '#A5B4FC', fontSize: 11, fontWeight: 600 }}>Comparison</span>
          </div>
        </div>
      </div>

      {/* Copyright Bar */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', padding: '20px 24px', textAlign: 'center', fontSize: 13, color: C.footerMuted }}>
        &copy; {year} NexMart. All rights reserved. Powered by AI.
      </div>
    </footer>
  )
}
