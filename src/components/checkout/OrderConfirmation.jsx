import { Link } from 'react-router-dom'

const C = {
  primary: '#6366F1',
  surface: '#FFFFFF',
  background: '#F8FAFC',
  text: '#0F172A',
  textSecondary: '#475569',
  border: '#E2E8F0',
  success: '#16A34A'
}

function CheckIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M5 13l4 4L19 7" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function formatPrice(value) {
  return `$${Number(value || 0).toFixed(2)}`
}

export default function OrderConfirmation({ order }) {
  if (!order) {
    return (
      <div style={{ maxWidth: 600, margin: '0 auto', padding: '80px 20px', textAlign: 'center' }}>
        <h2 style={{ fontSize: 24, fontWeight: 700, color: C.text, margin: '0 0 10px' }}>No order found</h2>
        <Link to="/products" style={{ display: 'inline-block', marginTop: 20, padding: '14px 28px', background: C.primary, color: '#fff', textDecoration: 'none', borderRadius: 12, fontWeight: 600, fontSize: 15, transition: 'background 0.2s ease, transform 0.15s ease' }}
          onMouseEnter={(e) => { e.currentTarget.style.background = C.primaryDark; e.currentTarget.style.transform = 'translateY(-1px)' }}
          onMouseLeave={(e) => { e.currentTarget.style.background = C.primary; e.currentTarget.style.transform = 'translateY(0)' }}
        >
          Start Shopping
        </Link>
      </div>
    )
  }

  const { id, total, items = [], shipping = {}, customer = {}, date } = order

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '48px 20px' }}>
      <div style={{ textAlign: 'center', marginBottom: 36 }}>
        <div style={{
          width: 80,
          height: 80,
          borderRadius: '50%',
          background: C.success,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 18,
          boxShadow: '0 10px 25px -5px rgba(22,163,74,0.3)'
        }}>
          <CheckIcon />
        </div>
        <h1 style={{ fontSize: 30, fontWeight: 800, color: C.text, margin: '0 0 8px', letterSpacing: '-0.02em' }}>Order Confirmed!</h1>
        <p style={{ color: C.textSecondary, margin: 0, fontSize: 15 }}>Thank you for your purchase. Your order has been placed successfully.</p>
      </div>

      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 20, padding: 28, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)', marginBottom: 24 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20, justifyContent: 'space-between', borderBottom: `1px solid ${C.border}`, paddingBottom: 20, marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 12, color: C.textSecondary, textTransform: 'uppercase', letterSpacing: '.06em', fontWeight: 600 }}>Order ID</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: C.text, marginTop: 4 }}>{id}</div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: C.textSecondary, textTransform: 'uppercase', letterSpacing: '.06em', fontWeight: 600 }}>Date</div>
            <div style={{ fontSize: 16, fontWeight: 600, color: C.text, marginTop: 4 }}>{date ? new Date(date).toLocaleDateString() : '—'}</div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: C.textSecondary, textTransform: 'uppercase', letterSpacing: '.06em', fontWeight: 600 }}>Total</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: C.primary, marginTop: 4 }}>{formatPrice(total)}</div>
          </div>
        </div>

        <h3 style={{ fontSize: 15, fontWeight: 700, color: C.text, margin: '0 0 14px' }}>Items</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 24 }}>
          {items.map((item) => (
            <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <img src={item.image} alt={item.name} style={{ width: 56, height: 56, borderRadius: 12, objectFit: 'cover', background: C.background, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: C.text }}>{item.name}</div>
                <div style={{ fontSize: 13, color: C.textSecondary, marginTop: 2 }}>Qty: {item.quantity}</div>
              </div>
              <div style={{ fontSize: 14, fontWeight: 600, color: C.text }}>{formatPrice(Number(item.price) * (item.quantity || 1))}</div>
            </div>
          ))}
        </div>

        <h3 style={{ fontSize: 15, fontWeight: 700, color: C.text, margin: '0 0 10px' }}>Shipping Address</h3>
        <div style={{
          background: C.background,
          border: `1px solid ${C.border}`,
          borderRadius: 12,
          padding: 16,
          fontSize: 14,
          color: C.textSecondary,
          lineHeight: 1.7
        }}>
          {customer.name}<br />
          {shipping.address}, {shipping.city}, {shipping.state} {shipping.zip}<br />
          {customer.email} · {customer.phone}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
        <Link to="/products" style={{ padding: '14px 28px', background: C.primary, color: '#fff', textDecoration: 'none', borderRadius: 12, fontWeight: 600, fontSize: 15, transition: 'background 0.2s ease, transform 0.15s ease' }}
          onMouseEnter={(e) => { e.currentTarget.style.background = C.primaryDark; e.currentTarget.style.transform = 'translateY(-1px)' }}
          onMouseLeave={(e) => { e.currentTarget.style.background = C.primary; e.currentTarget.style.transform = 'translateY(0)' }}
        >
          Continue Shopping
        </Link>
        <Link to={`/orders/${id}`} style={{ padding: '14px 28px', border: `1px solid ${C.border}`, color: C.text, textDecoration: 'none', borderRadius: 12, fontWeight: 600, background: C.surface, fontSize: 15, transition: 'background 0.2s ease, transform 0.15s ease' }}
          onMouseEnter={(e) => { e.currentTarget.style.background = C.background; e.currentTarget.style.transform = 'translateY(-1px)' }}
          onMouseLeave={(e) => { e.currentTarget.style.background = C.surface; e.currentTarget.style.transform = 'translateY(0)' }}
        >
          View Order
        </Link>
      </div>
    </div>
  )
}
