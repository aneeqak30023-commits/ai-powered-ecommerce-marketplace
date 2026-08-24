import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import CartItem from './CartItem.jsx'
import { useCart } from '../../context/CartContext.jsx'

const C = {
  primary: '#4F46E5',
  primaryDark: '#4338CA',
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
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: strong ? 18 : 14, fontWeight: strong ? 700 : 500, color: strong ? C.text : C.textSecondary, padding: '6px 0' }}>
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
      <div style={{ maxWidth: 600, margin: '0 auto', padding: '60px 20px', textAlign: 'center' }}>
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" aria-hidden="true" style={{ marginBottom: 16 }}>
          <path d="M3 4h2l2.4 12.3a1 1 0 0 0 1 .8h8.7a1 1 0 0 0 1-.8L21 8H6" stroke={C.border} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="9.5" cy="20" r="1.4" fill={C.border} />
          <circle cx="17.5" cy="20" r="1.4" fill={C.border} />
        </svg>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: C.text, margin: '0 0 8px' }}>Your cart is empty</h2>
        <p style={{ color: C.textSecondary, margin: '0 0 24px' }}>Looks like you haven't added anything yet.</p>
        <Link to="/products" style={{ display: 'inline-block', padding: '12px 24px', background: C.primary, color: '#fff', textDecoration: 'none', borderRadius: 8, fontWeight: 600 }}>
          Start Shopping
        </Link>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 20px' }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, color: C.text, margin: '0 0 24px' }}>Your Cart</h1>

      <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: 24, alignItems: 'flex-start' }}>
        <div style={{ flex: '1 1 auto', background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, overflow: 'hidden' }}>
          {cartItems.map((item) => (
            <CartItem key={item.id} item={item} onUpdateQuantity={updateQuantity} onRemove={removeFromCart} />
          ))}
        </div>

        <div style={{ flex: '0 0 320px', width: isMobile ? '100%' : 320, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20 }}>
          <h3 style={{ margin: '0 0 12px', fontSize: 18, fontWeight: 700, color: C.text }}>Order Summary</h3>
          <SummaryRow label="Subtotal" value={formatPrice(subtotal)} />
          <SummaryRow label="Shipping" value={shipping === 0 ? 'Free' : formatPrice(shipping)} />
          <SummaryRow label="Tax (8%)" value={formatPrice(tax)} />
          <div style={{ borderTop: `1px solid ${C.border}`, margin: '8px 0' }} />
          <SummaryRow label="Total" value={formatPrice(total)} strong />

          <Link
            to="/checkout"
            style={{ display: 'block', textAlign: 'center', marginTop: 16, padding: '12px 16px', background: C.primary, color: '#fff', textDecoration: 'none', borderRadius: 8, fontWeight: 600, transition: 'background .15s ease' }}
            onMouseEnter={(e) => (e.currentTarget.style.background = C.primaryDark)}
            onMouseLeave={(e) => (e.currentTarget.style.background = C.primary)}
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
