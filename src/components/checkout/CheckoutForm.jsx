import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../../context/CartContext.jsx'
import { useOrders } from '../../context/OrderContext.jsx'

const C = {
  primary: '#6366F1',
  primaryDark: '#4F46E5',
  surface: '#FFFFFF',
  background: '#F8FAFC',
  text: '#0F172A',
  textSecondary: '#475569',
  border: '#E2E8F0',
  danger: '#DC2626'
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
  return { subtotal, shipping, tax, total: subtotal + shipping + tax }
}

function formatPrice(value) {
  return `$${Number(value).toFixed(2)}`
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function CheckoutForm() {
  const isMobile = useMediaQuery('(max-width: 900px)')
  const navigate = useNavigate()
  const { cartItems = [], updateQuantity: _updateQuantity, removeFromCart: _removeFromCart } = useCart()
  const { placeOrder } = useOrders()
  const { subtotal, shipping, tax, total } = calcTotals(cartItems)
  const orderCounter = useRef(0)

  const [form, setForm] = useState({
    name: '', email: '', phone: '', address: '', city: '', state: '', zip: ''
  })
  const [errors, setErrors] = useState({})

  if (cartItems.length === 0) {
    return (
      <div style={{ maxWidth: 600, margin: '0 auto', padding: '80px 20px', textAlign: 'center' }}>
        <h2 style={{ fontSize: 24, fontWeight: 700, color: C.text, margin: '0 0 10px' }}>Your cart is empty</h2>
        <p style={{ color: C.textSecondary, margin: '0 0 28px', fontSize: 15 }}>Add items to your cart before checking out.</p>
        <Link to="/products" style={{ display: 'inline-block', padding: '14px 28px', background: C.primary, color: '#fff', textDecoration: 'none', borderRadius: 12, fontWeight: 600, fontSize: 15, transition: 'background 0.2s ease, transform 0.15s ease' }}
          onMouseEnter={(e) => { e.currentTarget.style.background = C.primaryDark; e.currentTarget.style.transform = 'translateY(-1px)' }}
          onMouseLeave={(e) => { e.currentTarget.style.background = C.primary; e.currentTarget.style.transform = 'translateY(0)' }}
        >
          Back to Products
        </Link>
      </div>
    )
  }

  const setField = (key, value) => {
    setForm((f) => ({ ...f, [key]: value }))
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }))
  }

  const validate = () => {
    const e = {}
    if (!form.name.trim()) e.name = 'Name is required'
    if (!form.email.trim()) e.email = 'Email is required'
    else if (!EMAIL_RE.test(form.email)) e.email = 'Enter a valid email'
    if (!form.phone.trim()) e.phone = 'Phone is required'
    if (!form.address.trim()) e.address = 'Address is required'
    if (!form.city.trim()) e.city = 'City is required'
    if (!form.state.trim()) e.state = 'State is required'
    if (!form.zip.trim()) e.zip = 'ZIP is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = (ev) => {
    ev.preventDefault()
    if (!validate()) return
    const order = {
      items: cartItems,
      customer: { name: form.name, email: form.email, phone: form.phone },
      shippingAddress: { address: form.address, city: form.city, state: form.state, zip: form.zip },
      subtotal,
      shipping,
      tax,
      total,
      date: new Date().toISOString()
    }
    const created = placeOrder ? placeOrder(order) : { ...order, id: 'ORD-' + (++orderCounter.current) }
    navigate('/confirmation', { state: { order: created } })
  }

  const inputStyle = (key) => ({
    width: '100%',
    boxSizing: 'border-box',
    padding: '12px 14px',
    borderRadius: 10,
    border: `1px solid ${errors[key] ? C.danger : C.border}`,
    background: C.surface,
    color: C.text,
    fontSize: 14,
    outline: 'none',
    transition: 'border-color 0.2s ease, box-shadow 0.2s ease'
  })

  const labelStyle = { display: 'block', fontSize: 13, fontWeight: 600, color: C.textSecondary, marginBottom: 6 }

  const Section = ({ title, children }) => (
    <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: 24, marginBottom: 20, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)' }}>
      <h3 style={{ margin: '0 0 18px', fontSize: 16, fontWeight: 700, color: C.text }}>{title}</h3>
      {children}
    </div>
  )

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 20px' }}>
      <h1 style={{ fontSize: 30, fontWeight: 700, color: C.text, margin: '0 0 28px', letterSpacing: '-0.02em' }}>Checkout</h1>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: 28, alignItems: 'flex-start' }}>
        <div style={{ flex: '1 1 auto', minWidth: 0 }}>
          <Section title="Contact Information">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={labelStyle}>Full Name</label>
                <input style={inputStyle('name')} value={form.name} onChange={(e) => setField('name', e.target.value)} placeholder="Jane Doe" />
                {errors.name && <p style={errStyle}>{errors.name}</p>}
              </div>
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <label style={labelStyle}>Email</label>
                  <input style={inputStyle('email')} value={form.email} onChange={(e) => setField('email', e.target.value)} placeholder="jane@example.com" />
                  {errors.email && <p style={errStyle}>{errors.email}</p>}
                </div>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <label style={labelStyle}>Phone</label>
                  <input style={inputStyle('phone')} value={form.phone} onChange={(e) => setField('phone', e.target.value)} placeholder="+1 555 000 0000" />
                  {errors.phone && <p style={errStyle}>{errors.phone}</p>}
                </div>
              </div>
            </div>
          </Section>

          <Section title="Shipping Address">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={labelStyle}>Address</label>
                <input style={inputStyle('address')} value={form.address} onChange={(e) => setField('address', e.target.value)} placeholder="123 Market St" />
                {errors.address && <p style={errStyle}>{errors.address}</p>}
              </div>
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                <div style={{ flex: 2, minWidth: 140 }}>
                  <label style={labelStyle}>City</label>
                  <input style={inputStyle('city')} value={form.city} onChange={(e) => setField('city', e.target.value)} />
                  {errors.city && <p style={errStyle}>{errors.city}</p>}
                </div>
                <div style={{ flex: 1, minWidth: 120 }}>
                  <label style={labelStyle}>State</label>
                  <input style={inputStyle('state')} value={form.state} onChange={(e) => setField('state', e.target.value)} />
                  {errors.state && <p style={errStyle}>{errors.state}</p>}
                </div>
                <div style={{ flex: 1, minWidth: 100 }}>
                  <label style={labelStyle}>ZIP</label>
                  <input style={inputStyle('zip')} value={form.zip} onChange={(e) => setField('zip', e.target.value)} />
                  {errors.zip && <p style={errStyle}>{errors.zip}</p>}
                </div>
              </div>
            </div>
          </Section>

          <Section title="Payment Method">
            <label style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 14, border: `1px solid ${C.border}`, borderRadius: 12, cursor: 'pointer', transition: 'border-color 0.2s ease' }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = C.primary }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = C.border }}
            >
              <input type="radio" name="payment" defaultChecked style={{ accentColor: C.primary }} />
              <span style={{ fontSize: 14, color: C.text, fontWeight: 500 }}>Demo Payment — No real charge</span>
            </label>
          </Section>

          <button
            type="submit"
            style={{
              width: '100%',
              padding: '16px 24px',
              border: 'none',
              borderRadius: 12,
              background: C.primary,
              color: '#fff',
              fontSize: 16,
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'background 0.2s ease, transform 0.15s ease',
              marginTop: 8
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = C.primaryDark; e.currentTarget.style.transform = 'translateY(-1px)' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = C.primary; e.currentTarget.style.transform = 'translateY(0)' }}
          >
            Place Demo Order
          </button>
        </div>

        <div style={{ flex: '0 0 340px', width: isMobile ? '100%' : 340, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: 24, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)' }}>
          <h3 style={{ margin: '0 0 16px', fontSize: 18, fontWeight: 700, color: C.text }}>Order Summary</h3>
          <div style={{ maxHeight: 260, overflowY: 'auto', marginBottom: 16 }}>
            {cartItems.map((item) => (
              <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', gap: 8, fontSize: 13, color: C.textSecondary, padding: '8px 0', borderBottom: `1px solid ${C.border}` }}>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 500 }}>{item.name} × {item.quantity}</span>
                <span style={{ flex: '0 0 auto', fontWeight: 600, color: C.text }}>{formatPrice(Number(item.price) * (item.quantity || 1))}</span>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: C.textSecondary, padding: '6px 0' }}>
            <span>Subtotal</span><span style={{ fontWeight: 600, color: C.text }}>{formatPrice(subtotal)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: C.textSecondary, padding: '6px 0' }}>
            <span>Shipping</span><span style={{ fontWeight: 600, color: C.text }}>{shipping === 0 ? 'Free' : formatPrice(shipping)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: C.textSecondary, padding: '6px 0' }}>
            <span>Tax (8%)</span><span style={{ fontWeight: 600, color: C.text }}>{formatPrice(tax)}</span>
          </div>
          <div style={{ borderTop: `1px solid ${C.border}`, margin: '10px 0' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 18, fontWeight: 700, color: C.text }}>
            <span>Total</span><span style={{ color: C.primary }}>{formatPrice(total)}</span>
          </div>
        </div>
      </form>
    </div>
  )
}

const errStyle = { margin: '6px 0 0', fontSize: 12, color: C.danger }
