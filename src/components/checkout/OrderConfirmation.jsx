import { Link } from 'react-router-dom'

const C = {
  primary: '#4F46E5',
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
      <div style={{ maxWidth: 600, margin: '0 auto', padding: '60px 20px', textAlign: 'center' }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: C.text, margin: '0 0 8px' }}>No order found</h2>
        <Link to="/products" style={{ display: 'inline-block', marginTop: 16, padding: '12px 24px', background: C.primary, color: '#fff', textDecoration: 'none', borderRadius: 8, fontWeight: 600 }}>
          Start Shopping
        </Link>
      </div>
    )
  }

  const { id, total, items = [], shipping = {}, customer = {}, date } = order

  return (
    <div style={{ maxWidth: 760, margin: '0 auto', padding: '40px 20px' }}>
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <div style={{ width: 72, height: 72, borderRadius: 9999, background: C.success, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
          <CheckIcon />
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: C.text, margin: '0 0 6px' }}>Order Confirmed!</h1>
        <p style={{ color: C.textSecondary, margin: 0 }}>Thank you for your purchase. Your order has been placed successfully.</p>
      </div>

      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 24 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, justifyContent: 'space-between', borderBottom: `1px solid ${C.border}`, paddingBottom: 16, marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 12, color: C.textSecondary, textTransform: 'uppercase', letterSpacing: '.04em' }}>Order ID</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: C.text }}>{id}</div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: C.textSecondary, textTransform: 'uppercase', letterSpacing: '.04em' }}>Date</div>
            <div style={{ fontSize: 16, fontWeight: 600, color: C.text }}>{date ? new Date(date).toLocaleDateString() : '—'}</div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: C.textSecondary, textTransform: 'uppercase', letterSpacing: '.04em' }}>Total</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: C.primary }}>{formatPrice(total)}</div>
          </div>
        </div>

        <h3 style={{ fontSize: 15, fontWeight: 700, color: C.text, margin: '0 0 12px' }}>Items</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
          {items.map((item) => (
            <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <img src={item.image} alt={item.name} style={{ width: 52, height: 52, borderRadius: 8, objectFit: 'cover', background: C.background }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: C.text }}>{item.name}</div>
                <div style={{ fontSize: 13, color: C.textSecondary }}>Qty: {item.quantity}</div>
              </div>
              <div style={{ fontSize: 14, fontWeight: 600, color: C.text }}>{formatPrice(Number(item.price) * (item.quantity || 1))}</div>
            </div>
          ))}
        </div>

        <h3 style={{ fontSize: 15, fontWeight: 700, color: C.text, margin: '0 0 8px' }}>Shipping Address</h3>
        <p style={{ margin: 0, fontSize: 14, color: C.textSecondary, lineHeight: 1.6 }}>
          {customer.name}<br />
          {shipping.address}, {shipping.city}, {shipping.state} {shipping.zip}<br />
          {customer.email} · {customer.phone}
        </p>
      </div>

      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 24, flexWrap: 'wrap' }}>
        <Link to="/products" style={{ padding: '12px 24px', background: C.primary, color: '#fff', textDecoration: 'none', borderRadius: 8, fontWeight: 600 }}>
          Continue Shopping
        </Link>
        <Link to="/orders" style={{ padding: '12px 24px', border: `1px solid ${C.border}`, color: C.text, textDecoration: 'none', borderRadius: 8, fontWeight: 600, background: C.surface }}>
          View Orders
        </Link>
      </div>
    </div>
  )
}
