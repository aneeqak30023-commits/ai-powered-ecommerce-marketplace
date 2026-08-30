import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import CartItem from './CartItem.jsx'
import { useCart } from '../../context/CartContext.jsx'

const C = {
  primary: '#6366F1',
  primaryDark: '#4F46E5',
  surface: '#FFFFFF',
  text: '#0F172A',
  textSecondary: '#475569',
  border: '#E2E8F0'
}

function CloseIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function calcTotals(items) {
  const subtotal = items.reduce((sum, i) => sum + Number(i.price) * (i.quantity || 1), 0)
  const shipping = subtotal === 0 || subtotal > 50 ? 0 : 9.99
  const tax = subtotal * 0.08
  return { subtotal, shipping, tax, total: subtotal + shipping + tax }
}

function formatPrice(value) {
  return `$${Number(value).toFixed(2)}`
}

export default function CartDrawer({ isOpen, onClose }) {
  const { cartItems = [], updateQuantity, removeFromCart } = useCart()
  const { subtotal } = calcTotals(cartItems)

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose && onClose()
    if (isOpen) window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return createPortal(
    <>
      <style>{`
        @keyframes nx-drawer-in { from { transform: translateX(100%); } to { transform: translateX(0); } }
        @keyframes nx-fade-in { from { opacity: 0; } to { opacity: 1; } }
        .nx-drawer-panel { animation: nx-drawer-in .3s cubic-bezier(0.16, 1, 0.3, 1); }
        .nx-drawer-backdrop { animation: nx-fade-in .2s ease-out; }
      `}</style>

      <div
        className="nx-drawer-backdrop"
        onClick={onClose}
        style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.5)', zIndex: 50 }}
      />

      <aside
        className="nx-drawer-panel"
        role="dialog"
        aria-label="Shopping cart"
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          height: '100%',
          width: 'min(420px, 100%)',
          background: C.surface,
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.35)',
          zIndex: 51,
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 24px', borderBottom: `1px solid ${C.border}` }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: C.text }}>
            Shopping Cart {cartItems.length > 0 && <span style={{ color: C.textSecondary, fontWeight: 500, fontSize: 14 }}>({cartItems.length})</span>}
          </h2>
          <button type="button" onClick={onClose} aria-label="Close cart" style={{ border: 'none', background: 'transparent', color: C.text, cursor: 'pointer', padding: 6, borderRadius: 8, transition: 'background 0.15s ease' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = C.background }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
          >
            <CloseIcon />
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto' }}>
          {cartItems.length === 0 ? (
            <div style={{ padding: 48, textAlign: 'center', color: C.textSecondary }}>
              <p style={{ margin: '0 0 16px', fontSize: 15 }}>Your cart is empty.</p>
              <Link to="/products" onClick={onClose} style={{ color: C.primary, textDecoration: 'none', fontWeight: 600, fontSize: 14 }}>Browse products</Link>
            </div>
          ) : (
            cartItems.map((item) => (
              <CartItem key={item.id} item={item} onUpdateQuantity={updateQuantity} onRemove={removeFromCart} />
            ))
          )}
        </div>

        {cartItems.length > 0 && (
          <div style={{ borderTop: `1px solid ${C.border}`, padding: 20, background: C.surface }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 16, fontWeight: 700, color: C.text, marginBottom: 16 }}>
              <span>Subtotal</span>
              <span style={{ color: C.primary }}>{formatPrice(subtotal)}</span>
            </div>
            <Link
              to="/checkout"
              onClick={onClose}
              style={{
                display: 'block',
                textAlign: 'center',
                padding: '14px 20px',
                background: C.primary,
                color: '#fff',
                textDecoration: 'none',
                borderRadius: 12,
                fontWeight: 600,
                fontSize: 15,
                transition: 'background 0.2s ease, transform 0.15s ease'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = C.primaryDark; e.currentTarget.style.transform = 'translateY(-1px)' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = C.primary; e.currentTarget.style.transform = 'translateY(0)' }}
            >
              Checkout
            </Link>
          </div>
        )}
      </aside>
    </>,
    document.body
  )
}
