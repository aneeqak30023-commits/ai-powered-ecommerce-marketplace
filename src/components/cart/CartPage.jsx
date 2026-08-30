import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import CartItem from './CartItem.jsx'
import { useCart } from '../../context/CartContext.jsx'

const C = {
  primary: '#6366F1',
  primaryDark: '#4F46E5',
  surface: '#FFFFFF',
  background: '#F8FAFC',
  text: '#0F172A',
  textSecondary: '#475569',
  border: '#E2E8F0'
}

function useMediaQuery(query) {
  const [matches, setMatches] = useState(
    typeof window !== 'undefined' ? window.matchMedia(query).matches : false
  )
  useEffect(() => {
    const mql = window.matchMedia(query)
    const handler = (e) => setMatches(e.matches)
    mql.addEventListener('change', handler)
    setMatches(mql.matches)
    return () => mql.removeEventListener('change', handler)
  }, [query])
  return matches
}

function calcTotals(items) {
  const subtotal = items.reduce((sum, i) => sum + Number(i.price) * (i.quantity || 1), 0)
  const shipping = subtotal === 0 || subtotal > 50 ? 0 : 9.99
  const tax = subtotal * 0.08
  const total = subtotal + shipping + tax
  return { subtotal, shipping, tax, total }
}

function formatPrice(value) {
  return `$${Number(value).toFixed(2)}`
}

function SummaryRow({ label, value, strong }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: strong ? 18 : 14, fontWeight: strong ? 700 : 500, color: strong ? C.text : C.textSecondary, padding: '8px 0' }}>
      <span>{label}</span>
      <span style={strong ? { color: C.primary } : undefined}>{value}</span>
    </div>
  )
}

export default function CartPage() {
  const isMobile = useMediaQuery('(max-width: 900px)')
  const { cartItems = [], updateQuantity, removeFromCart } = useCart()
  const { subtotal, shipping, tax, total } = calcTotals(cartItems)

  if (cartItems.length === 0) {
    return (
      <div style={{ maxWidth: 600, margin: '0 auto', padding: '80px 20px', textAlign: 'center' }}>
        <div style={{
          width: 80,
          height: 80,
          borderRadius: '50%',
          background: C.primaryLight,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 20
        }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" aria-hidden="true" style={{ color: C.primary }}>
            <path d="M3 4h2l2.4 12.3a1 1 0 0 0 1 .8h8.7a1 1 0 0 0 1-.8L21 8H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="9.5" cy="20" r="1.4" fill="currentColor" />
            <circle cx="17.5" cy="20" r="1.4" fill="currentColor" />
          </svg>
        </div>
        <h2 style={{ fontSize: 24, fontWeight: 700, color: C.text, margin: '0 0 10px', letterSpacing: '-0.01em' }}>Your cart is empty</h2>
        <p style={{ color: C.textSecondary, margin: '0 0 28px', fontSize: 15 }}>Looks like you haven't added anything yet.</p>
        <Link to="/products" style={{
          display: 'inline-block',
          padding: '14px 28px',
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
          Start Shopping
        </Link>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 20px' }}>
      <h1 style={{ fontSize: 30, fontWeight: 700, color: C.text, margin: '0 0 28px', letterSpacing: '-0.02em' }}>Your Cart</h1>

      <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: 24, alignItems: 'flex-start' }}>
        <div style={{ flex: '1 1 auto', background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)' }}>
          {cartItems.map((item) => (
            <CartItem key={item.id} item={item} onUpdateQuantity={updateQuantity} onRemove={removeFromCart} />
          ))}
        </div>

        <div style={{ flex: '0 0 340px', width: isMobile ? '100%' : 340, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: 24, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)' }}>
          <h3 style={{ margin: '0 0 16px', fontSize: 18, fontWeight: 700, color: C.text }}>Order Summary</h3>
          <SummaryRow label="Subtotal" value={formatPrice(subtotal)} />
          <SummaryRow label="Shipping" value={shipping === 0 ? 'Free' : formatPrice(shipping)} />
          <SummaryRow label="Tax (8%)" value={formatPrice(tax)} />
          <div style={{ borderTop: `1px solid ${C.border}`, margin: '10px 0' }} />
          <SummaryRow label="Total" value={formatPrice(total)} strong />

          <Link
            to="/checkout"
            style={{
              display: 'block',
              textAlign: 'center',
              marginTop: 20,
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
            Proceed to Checkout
          </Link>
          <Link to="/products" style={{ display: 'block', textAlign: 'center', marginTop: 12, color: C.primary, textDecoration: 'none', fontSize: 14, fontWeight: 600 }}>
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  )
}
