import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useOrders } from '../context/OrderContext'

const C = {
  primary: '#6366F1',
  primaryDark: '#4F46E5',
  text: '#0F172A',
  textSecondary: '#475569',
  background: '#F8FAFC',
  surface: '#FFFFFF',
  border: '#E2E8F0',
  success: '#16A34A'
}

export default function OrdersPage() {
  const { orders } = useOrders()
  const [expandedOrder, setExpandedOrder] = useState(null)

  const sortedOrders = [...orders].sort((a, b) => new Date(b.date) - new Date(a.date))

  if (sortedOrders.length === 0) {
    return (
      <div style={{ minHeight: '100vh', background: C.background, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: C.text, margin: '0 0 8px' }}>No Orders Yet</h1>
          <p style={{ fontSize: 16, color: C.textSecondary, margin: '0 0 24px' }}>You haven't placed any orders. Start shopping now!</p>
          <Link
            to="/products"
            style={{ display: 'inline-block', padding: '12px 24px', background: `linear-gradient(135deg, ${C.primary} 0%, ${C.primaryDark} 100%)`, color: '#fff', textDecoration: 'none', borderRadius: 10, fontWeight: 600 }}
          >
            Start Shopping
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: C.background }}>
      <div className="container mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8">
        <h1 style={{ fontSize: 28, fontWeight: 700, color: C.text, margin: '0 0 24px' }}>My Orders</h1>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {sortedOrders.map(order => (
            <div key={order.id} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, overflow: 'hidden' }}>
              <div
                style={{ padding: 24, cursor: 'pointer' }}
                onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
              >
                <div style={{ display: 'flex', flexDirection: 'column', smFlexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
                  <div>
                    <p style={{ fontWeight: 600, color: C.text, margin: '0 0 4px' }}>Order #{order.id}</p>
                    <p style={{ fontSize: 14, color: C.textSecondary, margin: 0 }}>{new Date(order.date).toLocaleDateString()}</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <span style={{ display: 'inline-block', padding: '4px 12px', borderRadius: 9999, fontSize: 12, fontWeight: 600, background: '#DCFCE7', color: '#16A34A' }}>
                      {order.status || 'Confirmed'}
                    </span>
                    <span style={{ fontWeight: 700, color: C.text }}>${order.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
              {expandedOrder === order.id && (
                <div style={{ borderTop: `1px solid ${C.border}`, padding: 24 }}>
                  <h3 style={{ fontWeight: 700, color: C.text, margin: '0 0 16px', fontSize: 16 }}>Items</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {order.items.map((item, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <img
                          src={item.image}
                          alt={item.name}
                          style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 10 }}
                        />
                        <div style={{ flex: 1 }}>
                          <p style={{ fontWeight: 600, color: C.text, margin: '0 0 4px', fontSize: 14 }}>{item.name}</p>
                          <p style={{ fontSize: 13, color: C.textSecondary, margin: 0 }}>Qty: {item.quantity}</p>
                        </div>
                        <p style={{ fontWeight: 600, color: C.text }}>${(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
