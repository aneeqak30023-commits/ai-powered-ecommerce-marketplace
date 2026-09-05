import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../../context/CartContext.jsx'
import { useWishlist } from '../../context/WishlistContext.jsx'
import { useAuth } from '../../context/AuthContext.jsx'

const C = {
  primary: '#6366F1',
  primaryDark: '#4F46E5',
  primaryLight: '#EEF2FF',
  surface: '#FFFFFF',
  background: '#F8FAFC',
  text: '#0F172A',
  textSecondary: '#475569',
  border: '#E2E8F0'
}

const NAV_LINKS = [
  { label: 'Home', to: '/' },
  { label: 'Products', to: '/products' },
  { label: 'Categories', to: '/products' },
  { label: 'Wishlist', to: '/wishlist' },
  { label: 'AI Assistant', to: '/products', highlight: true }
]

function ShoppingBagIcon({ size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M6 7h12l-1 13H7L6 7z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9 7V5a3 3 0 0 1 6 0v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function SearchIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
      <path d="M21 21l-4.3-4.3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function CartIcon({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M3 4h2l2.4 12.3a1 1 0 0 0 1 .8h8.7a1 1 0 0 0 1-.8L21 8H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="9.5" cy="20" r="1.4" fill="currentColor" />
      <circle cx="17.5" cy="20" r="1.4" fill="currentColor" />
    </svg>
  )
}

function MenuIcon({ size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function CloseIcon({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function SparkleIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 2l2.4 7.2h7.6l-6 4.8 2.4 7.2-6-4.8-6 4.8 2.4-7.2-6-4.8h7.6z" fill="currentColor" />
    </svg>
  )
}

function HeartIcon({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function UserIcon({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function Header() {
  const { cartCount } = useCart()
  const { wishlistCount } = useWishlist()
  const { isAuthenticated, user, logout } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [scrolled, setScrolled] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    const q = query.trim()
    navigate(q ? `/products?search=${encodeURIComponent(q)}` : '/products')
    setSearchOpen(false)
  }

  return (
    <>
      <style>{`
        .nx-header {
          position: sticky;
          top: 0;
          z-index: 40;
          background: rgba(255, 255, 255, 0.92);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border-bottom: 1px solid ${C.border};
          transition: box-shadow 0.3s ease;
        }
        .nx-header.scrolled {
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
        }
        .nx-header-inner {
          max-width: 1280px;
          margin: 0 auto;
          padding: 16px 24px;
          display: flex;
          align-items: center;
          gap: 24px;
        }
        .nx-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          color: ${C.primary};
          font-weight: 700;
          font-size: 22px;
          text-decoration: none;
          white-space: nowrap;
          letter-spacing: -0.03em;
        }
        .nx-logo-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: linear-gradient(135deg, #6366F1 0%, #4F46E5 100%);
          color: #fff;
          box-shadow: 0 4px 10px rgba(99, 102, 241, 0.25);
        }
        .nx-search-wrap {
          flex: 1;
          max-width: 520px;
          margin: 0 auto;
          position: relative;
        }
        .nx-search-input {
          width: 100%;
          box-sizing: border-box;
          padding: 12px 18px 12px 44px;
          border-radius: 9999px;
          border: 1px solid ${C.border};
          background: ${C.background};
          font-size: 14px;
          color: ${C.text};
          outline: none;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }
        .nx-search-input:focus {
          border-color: ${C.primary};
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.12);
        }
        .nx-search-icon {
          position: absolute;
          left: 16px;
          top: 50%;
          transform: translateY(-50%);
          color: ${C.textSecondary};
          pointer-events: none;
        }
        .nx-nav {
          display: flex;
          align-items: center;
          gap: 28px;
        }
        .nx-nav-link {
          color: ${C.textSecondary};
          text-decoration: none;
          font-size: 15px;
          font-weight: 500;
          transition: color 0.2s ease;
          position: relative;
        }
        .nx-nav-link:hover {
          color: ${C.primary};
        }
        .nx-nav-link.nx-ai-link {
          color: ${C.primary};
          font-weight: 600;
          background: ${C.primaryLight};
          padding: 8px 16px;
          border-radius: 9999px;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .nx-nav-link.nx-ai-link:hover {
          background: #EEF2FF;
        }
        .nx-cart-btn {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 42px;
          height: 42px;
          border-radius: 9999px;
          border: 1px solid ${C.border};
          background: ${C.surface};
          color: ${C.text};
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .nx-cart-btn:hover {
          background: ${C.background};
          border-color: ${C.primary};
          color: ${C.primary};
        }
        .nx-badge {
          position: absolute;
          top: -4px;
          right: -4px;
          min-width: 18px;
          height: 18px;
          padding: 0 5px;
          border-radius: 9999px;
          background: ${C.primary};
          color: #fff;
          font-size: 11px;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          box-sizing: border-box;
        }
        .nx-icon-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 42px;
          height: 42px;
          border-radius: 9999px;
          border: 1px solid ${C.border};
          background: ${C.surface};
          color: ${C.text};
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .nx-icon-btn:hover {
          background: ${C.background};
          border-color: ${C.primary};
          color: ${C.primary};
        }
        .nx-mobile-menu {
          border-top: 1px solid ${C.border};
          background: ${C.surface};
          padding: 8px 24px 16px;
        }
        .nx-mobile-link {
          display: block;
          padding: 12px 4px;
          color: ${C.text};
          text-decoration: none;
          font-weight: 500;
          border-bottom: 1px solid ${C.border};
        }
        .nx-show-mobile { display: none; }
        @media (max-width: 767px) {
          .nx-hide-mobile { display: none !important; }
          .nx-show-mobile { display: flex !important; }
          .nx-search-wrap { display: none; }
          .nx-search-wrap.nx-search-open {
            display: block;
            position: absolute;
            left: 0;
            right: 0;
            top: 100%;
            padding: 12px 16px;
            background: ${C.surface};
            border-bottom: 1px solid ${C.border};
            max-width: none;
          }
          .nx-header-inner { padding: 12px 16px; }
        }
        @media (min-width: 768px) {
          .nx-hide-desktop { display: none !important; }
        }
      `}</style>

      <header className={`nx-header${scrolled ? ' scrolled' : ''}`}>
        <div className="nx-header-inner">
          <Link to="/" className="nx-logo" onClick={() => setMenuOpen(false)}>
            <span className="nx-logo-icon"><ShoppingBagIcon size={20} /></span>
            <span>NexMart</span>
          </Link>

          <form className={`nx-search-wrap${searchOpen ? ' nx-search-open' : ''}`} onSubmit={handleSearch}>
            <span className="nx-search-icon"><SearchIcon /></span>
            <input
              className="nx-search-input"
              type="text"
              placeholder="What are you looking for today?"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search products"
            />
          </form>

          <nav className="nx-nav nx-hide-mobile">
            {NAV_LINKS.map((l) => (
              <Link key={l.label} to={l.to} className={`nx-nav-link${l.highlight ? ' nx-ai-link' : ''}`} onClick={() => setMenuOpen(false)}>
                {l.highlight && <SparkleIcon size={14} />}
                {l.label}
              </Link>
            ))}
            {isAuthenticated ? (
              <Link to="/account" className="nx-nav-link" onClick={() => setMenuOpen(false)}>
                Account
              </Link>
            ) : (
              <Link to="/login" className="nx-nav-link" onClick={() => setMenuOpen(false)}>
                Sign in
              </Link>
            )}
          </nav>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              type="button"
              className="nx-icon-btn nx-show-mobile"
              aria-label="Toggle search"
              onClick={() => setSearchOpen((v) => !v)}
              style={{ display: 'none' }}
            >
              <SearchIcon />
            </button>

            {isAuthenticated ? (
              <>
                <button
                  type="button"
                  className="nx-icon-btn nx-hide-mobile"
                  aria-label="Account"
                  onClick={() => navigate('/account')}
                  title={user?.name || 'Account'}
                >
                  <UserIcon />
                </button>
                <button
                  type="button"
                  className="nx-icon-btn nx-show-mobile"
                  aria-label="Account menu"
                  onClick={() => {
                    if (menuOpen) {
                      logout()
                      navigate('/')
                    } else {
                      navigate('/account')
                    }
                    setMenuOpen(false)
                  }}
                  style={{ display: 'none' }}
                >
                  <UserIcon />
                </button>
              </>
            ) : (
              <button
                type="button"
                className="nx-icon-btn nx-show-mobile"
                aria-label="Login"
                onClick={() => navigate('/login')}
                style={{ display: 'none' }}
              >
                <UserIcon />
              </button>
            )}

            <button
              type="button"
              className="nx-icon-btn"
              aria-label="Open wishlist"
              onClick={() => navigate('/wishlist')}
            >
              <HeartIcon />
              {wishlistCount > 0 && <span className="nx-badge">{wishlistCount}</span>}
            </button>

            <button
              type="button"
              className="nx-cart-btn"
              aria-label="Open cart"
              onClick={() => navigate('/cart')}
            >
              <CartIcon />
              {cartCount > 0 && <span className="nx-badge">{cartCount}</span>}
            </button>

            <button
              type="button"
              className="nx-icon-btn nx-show-mobile"
              aria-label="Toggle menu"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((v) => !v)}
              style={{ display: 'none' }}
            >
              {menuOpen ? <CloseIcon /> : <MenuIcon />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="nx-mobile-menu nx-show-mobile" style={{ display: 'none' }}>
            {NAV_LINKS.map((l) => (
              <Link key={l.to} to={l.to} className="nx-mobile-link" onClick={() => setMenuOpen(false)}>
                {l.label}
              </Link>
            ))}
            {isAuthenticated ? (
              <>
                <Link to="/account" className="nx-mobile-link" onClick={() => setMenuOpen(false)}>Account</Link>
                <button
                  type="button"
                  className="nx-mobile-link"
                  onClick={() => { logout(); setMenuOpen(false); navigate('/') }}
                  style={{ background: 'none', border: 'none', textAlign: 'left', width: '100%', cursor: 'pointer' }}
                >
                  Sign out
                </button>
              </>
            ) : (
              <Link to="/login" className="nx-mobile-link" onClick={() => setMenuOpen(false)}>Sign in</Link>
            )}
          </div>
        )}
      </header>
    </>
  )
}
