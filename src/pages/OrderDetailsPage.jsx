import { useState, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { useOrders } from '../context/OrderContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { ORDER_STATUSES } from '../context/OrderContext.jsx'

const C = {
  primary: '#6366F1',
  primaryDark: '#4F46E5',
  text: '#0F172A',
  textSecondary: '#475569',
  background: '#F8FAFC',
  surface: '#FFFFFF',
  border: '#E2E8F0',
  danger: '#DC2626',
  success: '#16A34A',
  warning: '#D97706',
  info: '#2563EB'
}

const STATUS_COLORS = {
  [ORDER_STATUSES.PENDING]: { bg: '#FEF3C7', text: '#92400E' },
  [ORDER_STATUSES.CONFIRMED]: { bg: '#DBEAFE', text: '#1E40AF' },
  [ORDER_STATUSES.SHIPPED]: { bg: '#E0E7FF', text: '#3730A3' },
  [ORDER_STATUSES.DELIVERED]: { bg: '#D1FAE5', text: '#065F46' },
  [ORDER_STATUSES.CANCELLED]: { bg: '#FEE2E2', text: '#991B1B' }
}

function formatPrice(value) {
  return `$${Number(value || 0).toFixed(2)}`
}

export default function OrderDetailsPage() {
  const { orderId } = useParams()
  const { getOrderById, cancelOrder } = useOrders()
  const { isAuthenticated, user } = useAuth()
  const navigate = useNavigate()

  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { replace: true })
      return
    }

    // Small delay to simulate loading
    const timer = setTimeout(() => {
      const found = getOrderById(orderId, user?.userId)
      if (!found) {
        setError('Order not found or you do not have permission to view it.')
      } else {
        setOrder(found)
      }
      setLoading(false)
    }, 300)

    return () => clearTimeout(timer)
  }, [isAuthenticated, orderId, user, getOrderById, navigate])

  if (loading) {
    return (
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '80px 20px', textAlign: 'center' }}>
        <p style={{ color: C.textSecondary, fontSize: 15 }}>Loading order...</p>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '80px 20px', textAlign: 'center' }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: C.text, margin: '0 0 12px' }}>Order Not Found</h1>
        <p style={{ fontSize: 15, color: C.textSecondary, margin: '0 0 28px' }}>
          {error || 'We could not find this order. It may have been removed or the link is invalid.'}
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/orders" style={{ padding: '12px 24px', background: C.primary, color: '#fff', textDecoration: 'none', borderRadius: 12, fontWeight: 600, fontSize: 15 }}>
            View My Orders
          </Link>
          <Link to="/products" style={{ padding: '12px 24px', border: `1px solid ${C.border}`, color: C.text, textDecoration: 'none', borderRadius: 12, fontWeight: 600, background: C.surface, fontSize: 15 }}>
            Continue Shopping
          </Link>
        </div>
      </div>
    )
  }

  const statusColor = STATUS_COLORS[order.status] || STATUS_COLORS[ORDER_STATUSES.CONFIRMED]
  const canCancel = [ORDER_STATUSES.PENDING, ORDER_STATUSES.CONFIRMED].includes(order.status)

  return (
    <div style={{ minHeight: '100vh', background: C.background }}>
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: C.text }}>Order Details</h1>
            <p style={{ margin: '4px 0 0', fontSize: 14, color: C.textSecondary }}>
              Order #{order.id} · {new Date(order.date).toLocaleDateString()} {new Date(order.date).toLocaleTimeString()}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={{ display: 'inline-block', padding: '6px 14px', borderRadius: 9999, fontSize: 13, fontWeight: 600, background: statusColor.bg, color: statusColor.text }}>
              {order.status}
            </span>
          </div>
        </div>

        {/* Items */}
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 20, padding: 24, marginBottom: 20, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)' }}>
          <h2 style={{ margin: '0 0 18px', fontSize: 18, fontWeight: 700, color: C.text }}>Items</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {order.items?.map((item, idx) => (
              <div key={item.id || idx} style={{ display: 'flex', alignItems: 'center', gap: 16, paddingBottom: 16, borderBottom: idx < (order.items?.length || 0) - 1 ? `1px solid ${C.border}` : 'none' }}>
                <img
                  src={item.image}
                  alt={item.name}
                  style={{ width: 72, height: 72, objectFit: 'cover', borderRadius: 12, background: C.background, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontWeight: 600, color: C.text, margin: '0 0 4px', fontSize: 14 }}>{item.name}</p>
                  <p style={{ fontSize: 13, color: C.textSecondary, margin: 0 }}>Qty: {item.quantity}</p>
                  <p style={{ fontSize: 13, color: C.textSecondary, margin: '2px 0 0' }}>Unit price: {formatPrice(item.price)}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontWeight: 700, color: C.text, margin: 0, fontSize: 15 }}>{formatPrice(Number(item.price) * (item.quantity || 1))}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Shipping & Totals */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20, marginBottom: 20 }}>
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 20, padding: 24, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)' }}>
            <h2 style={{ margin: '0 0 14px', fontSize: 18, fontWeight: 700, color: C.text }}>Shipping Address</h2>
            <div style={{ fontSize: 14, color: C.textSecondary, lineHeight: 1.7 }}>
              <p style={{ margin: '0 0 6px', fontWeight: 600, color: C.text }}>{order.customer?.name}</p>
              <p style={{ margin: 0 }}>{order.shippingAddress?.address}</p>
              <p style={{ margin: 0 }}>{order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.zip}</p>
              <p style={{ margin: '8px 0 0' }}>{order.customer?.email}</p>
              <p style={{ margin: 0 }}>{order.customer?.phone}</p>
            </div>
          </div>

          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 20, padding: 24, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)' }}>
            <h2 style={{ margin: '0 0 14px', fontSize: 18, fontWeight: 700, color: C.text }}>Order Summary</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: C.textSecondary }}>
                <span>Subtotal</span><span style={{ fontWeight: 600, color: C.text }}>{formatPrice(order.subtotal)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: C.textSecondary }}>
                <span>Shipping</span><span style={{ fontWeight: 600, color: C.text }}>{order.shipping === 0 ? 'Free' : formatPrice(order.shipping)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: C.textSecondary }}>
                <span>Tax (8%)</span><span style={{ fontWeight: 600, color: C.text }}>{formatPrice(order.tax)}</span>
              </div>
              <div style={{ borderTop: `1px solid ${C.border}`, margin: '6px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 18, fontWeight: 700, color: C.text }}>
                <span>Total</span><span style={{ color: C.primary }}>{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-start', flexWrap: 'wrap' }}>
          <Link to="/orders" style={{ padding: '12px 24px', border: `1px solid ${C.border}`, color: C.text, textDecoration: 'none', borderRadius: 12, fontWeight: 600, background: C.surface, fontSize: 15 }}>
            Back to Orders
          </Link>
          {canCancel && (
            <button
              onClick={() => {
                cancelOrder(order.id, user?.userId)
                setOrder(prev => ({ ...prev, status: ORDER_STATUSES.CANCELLED }))
              }}
              style={{ padding: '12px 24px', border: 'none', background: C.danger, color: '#fff', borderRadius: 12, fontWeight: 600, fontSize: 15, cursor: 'pointer' }}
            >
              Cancel Order
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
