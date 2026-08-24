import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../../context/CartContext.jsx'

const C = {
  primary: '#4F46E5',
  primaryDark: '#4338CA',
  secondary: '#0EA5E9',
  accent: '#F59E0B',
  surface: '#FFFFFF',
  background: '#F8FAFC',
  text: '#0F172A',
  textSecondary: '#475569',
  border: '#E2E8F0'
}

const NAV_LINKS = [
  { label: 'Home', to: '/' },
  { label: 'Products', to: '/products' },
  { label: 'Orders', to: '/orders' }
]

function ShoppingBagIcon({ size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M6 7h12l-1 13H7L6 7z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9 7V5a3 3 0 0 1 6 0v2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
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
      <path
        d="M3 4h2l2.4 12.3a1 1 0 0 0 1 .8h8.7a1 1 0 0 0 1-.8L21 8H6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
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

export default function Header() {
  const { cartCount } = useCart()
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [query, setQuery] = useState('')
  const navigate = useNavigate()

  const handleSearch = (e) => {
    e.preventDefault()
    const q = query.trim()
    navigate(q ? `/products?search=${encodeURIComponent(q)}` : '/products')
    setSearchOpen(false)
  }

  return (
    <>
      <style>{`
        .nx-header { position: sticky; top: 0; z-index: 40; background: ${C.surface}; box-shadow: 0 1px 2px rgba(0,0,0,0.05); }
        .nx-header-inner { max-width: 1200px; margin: 0 auto; padding: 12px 20px; display: flex; align-items: center; gap: 16px; }
        .nx-logo { display: flex; align-items: center; gap: 8px; color: ${C.primary}; font-weight: 700; font-size: 20px; text-decoration: none; white-space: nowrap; }
        .nx-search-wrap { flex: 1; max-width: 480px; margin: 0 auto; position: relative; }
        .nx-search-input { width: 100%; box-sizing: border-box; padding: 10px 16px 10px 42px; border-radius: 9999px; border: 1px solid ${C.border}; background: ${C.background}; font-size: 14px; color: ${C.text}; outline: none; transition: border-color .15s ease, box-shadow .15s ease; }
        .nx-search-input:focus { border-color: ${C.primary}; box-shadow: 0 0 0 3px rgba(79,70,229,0.12); }
        .nx-search-icon { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: ${C.textSecondary}; }
        .nx-nav { display: flex; align-items: center; gap: 22px; }
        .nx-nav-link { color: ${C.textSecondary}; text-decoration: none; font-size: 15px; font-weight: 500; transition: color .15s ease; }
        .nx-nav-link:hover { color: ${C.primary}; }
        .nx-cart-btn { position: relative; display: flex; align-items: center; justify-content: center; width: 42px; height: 42px; border-radius: 9999px; border: 1px solid ${C.border}; background: ${C.surface}; color: ${C.text}; cursor: pointer; transition: background .15s ease; }
        .nx-cart-btn:hover { background: ${C.background}; }
        .nx-badge { position: absolute; top: -4px; right: -4px; min-width: 18px; height: 18px; padding: 0 5px; border-radius: 9999px; background: ${C.primary}; color: #fff; font-size: 11px; font-weight: 700; display: flex; align-items: center; justify-content: center; box-sizing: border-box; }
        .nx-icon-btn { display: flex; align-items: center; justify-content: center; width: 42px; height: 42px; border-radius: 9999px; border: 1px solid ${C.border}; background: ${C.surface}; color: ${C.text}; cursor: pointer; }
        .nx-mobile-menu { border-top: 1px solid ${C.border}; background: ${C.surface}; padding: 8px 20px 16px; }
        .nx-mobile-link { display: block; padding: 12px 4px; color: ${C.text}; text-decoration: none; font-weight: 500; border-bottom: 1px solid ${C.border}; }
        .nx-show-mobile { display: none; }
        @media (max-width: 767px) {
          .nx-hide-mobile { display: none !important; }
          .nx-show-mobile { display: flex !important; }
          .nx-search-wrap { display: none; }
          .nx-search-wrap.nx-search-open { display: block; position: absolute; left: 0; right: 0; top: 100%; padding: 12px 16px; background: ${C.surface}; border-top: 1px solid ${C.border}; max-width: none; }
        }
        @media (min-width: 768px) {
          .nx-hide-desktop { display: none !important; }
        }
      `}</style>

      <header className="nx-header">
        <div className="nx-header-inner">
          <Link to="/" className="nx-logo" onClick={() => setMenuOpen(false)}>
            <ShoppingBagIcon />
            <span>NexMart</span>
          </Link>

          <form className={`nx-search-wrap${searchOpen ? ' nx-search-open' : ''}`} onSubmit={handleSearch}>
            <span className="nx-search-icon"><SearchIcon /></span>
            <input
              className="nx-search-input"
              type="text"
              placeholder="Search products..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search products"
            />
          </form>

          <nav className="nx-nav nx-hide-mobile">
            {NAV_LINKS.map((l) => (
              <Link key={l.to} to={l.to} className="nx-nav-link">{l.label}</Link>
            ))}
          </nav>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              type="button"
              className="nx-icon-btn nx-show-mobile"
              aria-label="Toggle search"
              onClick={() => setSearchOpen((v) => !v)}
              style={{ display: 'none' }}
            >
              <SearchIcon />
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
          </div>
        )}
      </header>
    </>
  )
}
