import { Link } from 'react-router-dom'

const C = {
  footerBg: '#0F172A',
  footerText: '#CBD5E1',
  footerMuted: '#94A3B8',
  primary: '#6366F1',
  primaryLight: '#EEF2FF'
}

function SocialIcon({ children }) {
  return (
    <a
      href="#"
      onClick={(e) => e.preventDefault()}
      aria-label="Social link"
      style={{
        width: 36,
        height: 36,
        borderRadius: 9999,
        background: 'rgba(255,255,255,0.08)',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: C.footerText,
        transition: 'background .15s ease'
      }}
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
      <style>{`
        .nx-footer-grid { max-width: 1200px; margin: 0 auto; padding: 64px 24px 40px; display: grid; gap: 40px; grid-template-columns: repeat(2, 1fr); }
        @media (min-width: 1024px) { .nx-footer-grid { grid-template-columns: repeat(4, 1fr); } }
        .nx-footer-title { color: #fff; font-size: 14px; font-weight: 700; margin: 0 0 20px; text-transform: uppercase; letter-spacing: .06em; }
        .nx-footer-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 12px; }
        .nx-footer-link { color: ${C.footerText}; text-decoration: none; font-size: 14px; transition: color .15s ease; }
        .nx-footer-link:hover { color: #fff; }
        .nx-footer-desc { font-size: 14px; line-height: 1.7; color: ${C.footerMuted}; margin: 0 0 20px; }
        .nx-footer-social { display: flex; gap: 10px; margin-top: 20px; }
        .nx-footer-bar { border-top: 1px solid rgba(255,255,255,0.08); padding: 24px; text-align: center; font-size: 13px; color: ${C.footerMuted}; }
        .nx-footer-ai-badge { display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px; border-radius: 9999px; background: rgba(99,102,241,0.15); color: #A5B4FC; font-size: 12px; font-weight: 600; margin-top: 12px; }
      `}</style>

      <div className="nx-footer-grid">
        <div>
          <h3 className="nx-footer-title">About NexMart</h3>
          <p className="nx-footer-desc">
            NexMart is your AI-powered marketplace, bringing you the latest products with smart, personalized recommendations and a seamless shopping experience.
          </p>
          <div className="nx-footer-social">
            <SocialIcon>
              <path d="M22 12a10 10 0 1 0-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.5h-1.3c-1.2 0-1.6.8-1.6 1.6V12h2.8l-.4 2.9h-2.4v7A10 10 0 0 0 22 12z" />
            </SocialIcon>
            <SocialIcon>
              <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm3.6 7.2c.4 0 .8.1 1.2.1-.3.3-.8.8-1 1.3-.2.5-.4 1-.4 1.6 0 1.6.8 3 2.4 3s2.4-1.2 2.4-2.8c0-2.2-1.6-3.2-3.4-3.2-1.6 0-3 .9-3 2.2 0 .8.4 1.5 1 1.5.3 0 .5-.2.5-.5 0-.3-.1-.5-.1-.6-.2-.3-.6-.2-.6.2 0 .8.9 1.2 1.6 1.2.9 0 1.6-.6 1.6-1.5 0-1.5-.9-2.3-2-2.3-.9 0-1.6.4-1.9 1.1-.2-.6-.4-1.3-.4-1.9 1-.7 2.2-1 3-.1zm-4 1.4c.5 0 .9.4.9.9s-.4.9-.9.9-.9-.4-.9-.9.4-.9.9-.9zm-1.6 3.6c.5 0 .9.4.9.9s-.4.9-.9.9-.9-.4-.9-.9.4-.9.9-.9z" />
            </SocialIcon>
            <SocialIcon>
              <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
            </SocialIcon>
          </div>
          <div className="nx-footer-ai-badge">
            <span>✨</span>
            AI-Powered Shopping
          </div>
        </div>

        <div>
          <h3 className="nx-footer-title">Customer Service</h3>
          <ul className="nx-footer-list">
            <li><a href="#" onClick={(e) => e.preventDefault()} className="nx-footer-link">Shipping</a></li>
            <li><a href="#" onClick={(e) => e.preventDefault()} className="nx-footer-link">Returns</a></li>
            <li><a href="#" onClick={(e) => e.preventDefault()} className="nx-footer-link">FAQ</a></li>
            <li><a href="#" onClick={(e) => e.preventDefault()} className="nx-footer-link">Contact</a></li>
          </ul>
        </div>

        <div>
          <h3 className="nx-footer-title">AI Features</h3>
          <ul className="nx-footer-list">
            <li><Link to="/products" className="nx-footer-link">Smart Search</Link></li>
            <li><Link to="/products" className="nx-footer-link">Product Comparison</Link></li>
            <li><Link to="/products" className="nx-footer-link">AI Recommendations</Link></li>
            <li><Link to="/products" className="nx-footer-link">Multilingual Search</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="nx-footer-title">Quick Links</h3>
          <ul className="nx-footer-list">
            <li><Link to="/" className="nx-footer-link">Home</Link></li>
            <li><Link to="/products" className="nx-footer-link">Products</Link></li>
            <li><Link to="/cart" className="nx-footer-link">Cart</Link></li>
            <li><Link to="/orders" className="nx-footer-link">Orders</Link></li>
          </ul>
        </div>
      </div>

      <div className="nx-footer-bar">
        &copy; {year} NexMart. All rights reserved. Powered by AI.
      </div>
    </footer>
  )
}
