import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
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
  success: '#16A45A',
  warning: '#D97706',
  danger: '#DC2626'
}

const STATUS_COLORS = {
  pending: { bg: '#FEF3C7', text: '#92400E' },
  confirmed: { bg: '#DBEAFE', text: '#1E40AF' },
  shipped: { bg: '#E0E7FF', text: '#3730A3' },
  delivered: { bg: '#D1FAE5', text: '#065F46' },
  cancelled: { bg: '#FEE2E2', text: '#991B1B' }
}

export default function OrdersPage() {
  const { getOrdersByUserId, cancelOrder } = useOrders()
  const { isAuthenticated, user } = useAuth()
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { replace: true })
      return
    }

    const timer = setTimeout(() => {
      const userOrders = getOrdersByUserId(user?.userId)
      setOrders(userOrders)
      setLoading(false)
    }, 300)

    return () => clearTimeout(timer)
  }, [isAuthenticated, user, getOrdersByUserId, navigate])

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: C.background, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: C.textSecondary, fontSize: 15 }}>Loading your orders...</p>
      </div>
    )
  }

  if (orders.length === 0) {
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
          <Link
            to="/returns"
            style={{ display: 'inline-block', padding: '12px 24px', border: `1px solid ${C.border}`, color: C.textSecondary, textDecoration: 'none', borderRadius: 10, fontWeight: 600, marginLeft: 12 }}
          >
            View My Returns
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: C.background }}>
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '32px 20px' }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: C.text, margin: '0 0 24px' }}>My Orders</h1>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {orders.map(order => {
            const statusColor = STATUS_COLORS[order.status?.toLowerCase()] || STATUS_COLORS[ORDER_STATUSES.CONFIRMED.toLowerCase()]
            const canCancel = order.status?.toLowerCase() === 'pending' || order.status?.toLowerCase() === 'confirmed'
            return (
              <Link
                key={order.id}
                to={`/orders/${order.id}`}
                style={{ display: 'block', background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, overflow: 'hidden', textDecoration: 'none', color: 'inherit', transition: 'box-shadow 0.2s ease' }}
                onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.06)' }}
                onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'none' }}
              >
                <div style={{ padding: 24 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4, smFlexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <p style={{ fontWeight: 600, color: C.text, margin: '0 0 4px', fontSize: 15 }}>Order #{order.id}</p>
                      <p style={{ fontSize: 14, color: C.textSecondary, margin: 0 }}>
                        {new Date(order.date).toLocaleDateString()} · {order.items?.length || 0} item{(order.items?.length || 0) !== 1 ? 's' : ''}
                      </p>
                    </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                      <span style={{ display: 'inline-block', padding: '4px 12px', borderRadius: 9999, fontSize: 12, fontWeight: 600, background: statusColor.bg, color: statusColor.text }}>
                        {order.status || ORDER_STATUSES.CONFIRMED}
                      </span>
                      <span style={{ fontWeight: 700, color: C.text, fontSize: 16 }}>{formatPrice(order.total)}</span>
                    </div>
                    <div style={{ padding: '0 24px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      {canCancel && (
                        <button
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            cancelOrder(order.id, user?.userId)
                          }}
                          style={{ fontSize: 13, fontWeight: 600, padding: '8px 16px', borderRadius: 8,
                                    background: `${C.danger}10`, color: C.danger, border: `1px solid ${C.danger}30`,
                                    cursor: 'pointer' }}
                        >
                          Cancel Order
                        </button>
                      )}
                      <Link to={order.status?.toLowerCase() === 'shipped' || order.status?.toLowerCase() === 'delivered' ? `/returns/request/${order.id}` : '#'}
                        style={{ fontSize: 13, fontWeight: 600, textDecoration: 'none', padding: '8px 16px', borderRadius: 8,
                                  background: (order.status?.toLowerCase() === 'shipped' || order.status?.toLowerCase() === 'delivered') ? `${C.warning}15` : C.background,
                                  color: (order.status?.toLowerCase() === 'shipped' || order.status?.toLowerCase() === 'delivered') ? C.warning : C.textSecondary,
                                  cursor: (order.status?.toLowerCase() === 'shipped' || order.status?.toLowerCase() === 'delivered') ? 'pointer' : 'not-allowed' }}>
                        Request Return
                      </Link>
                      <Link to="/returns" style={{ fontSize: 13, fontWeight: 600, color: C.textSecondary, textDecoration: 'none' }}>
                        My Returns
                      </Link>
                    </div>
                  </div>
                </div>
              </Link>
              )
          })}
        </div>
      </div>
    </div>
  )
}

function formatPrice(value) {
  return `$${Number(value || 0).toFixed(2)}`
}
