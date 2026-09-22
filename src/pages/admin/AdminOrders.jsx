import { useState, useEffect } from 'react'
import { getAdminOrders, updateAdminOrderStatus } from '../../services/adminApi.js'

const C = {
  primary: '#6366F1',
  primaryDark: '#4F46E5',
  surface: '#FFFFFF',
  background: '#F8FAFC',
  text: '#0F172A',
  textSecondary: '#475569',
  border: '#E2E8F0',
  success: '#16A34A',
  danger: '#DC2626',
  warning: '#D97706',
}

const STATUS_OPTIONS = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled']

export default function AdminOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [updating, setUpdating] = useState(null)

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getAdminOrders({ search, status: statusFilter })
      setOrders(data.orders || [])
    } catch (err) {
      setError(err.message || 'Failed to load orders')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [search, statusFilter])

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdating(orderId)
    try {
      await updateAdminOrderStatus(orderId, newStatus)
      load()
    } catch (err) {
      setError(err.message || 'Failed to update status')
    } finally {
      setUpdating(null)
    }
  }

  if (loading) {
    return <div style={{ padding: 40, textAlign: 'center', color: C.textSecondary }}>Loading orders...</div>
  }

  return (
    <div>
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Search by order number or customer..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ flex: 1, minWidth: 200, padding: '10px 14px', border: `1px solid ${C.border}`, borderRadius: 10, fontSize: 14, background: C.surface, color: C.text, outline: 'none' }}
        />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ padding: '10px 14px', border: `1px solid ${C.border}`, borderRadius: 10, fontSize: 14, background: C.surface, color: C.text, outline: 'none', minWidth: 150 }}>
          <option value="">All Statuses</option>
          {STATUS_OPTIONS.map(status => (
            <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>
          ))}
        </select>
      </div>

      {error && (
        <div style={{ background: `${C.danger}10`, border: `1px solid ${C.danger}30`, borderRadius: 12, padding: 16, color: C.danger, fontSize: 14, marginBottom: 20 }}>
          {error}
        </div>
      )}

      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${C.border}`, background: C.background }}>
                <th style={{ textAlign: 'left', padding: '14px 16px', color: C.textSecondary, fontWeight: 600, fontSize: 12, textTransform: 'uppercase' }}>Order</th>
                <th style={{ textAlign: 'left', padding: '14px 16px', color: C.textSecondary, fontWeight: 600, fontSize: 12, textTransform: 'uppercase' }}>Customer</th>
                <th style={{ textAlign: 'left', padding: '14px 16px', color: C.textSecondary, fontWeight: 600, fontSize: 12, textTransform: 'uppercase' }}>Status</th>
                <th style={{ textAlign: 'right', padding: '14px 16px', color: C.textSecondary, fontWeight: 600, fontSize: 12, textTransform: 'uppercase' }}>Total</th>
                <th style={{ textAlign: 'left', padding: '14px 16px', color: C.textSecondary, fontWeight: 600, fontSize: 12, textTransform: 'uppercase' }}>Payment</th>
                <th style={{ textAlign: 'left', padding: '14px 16px', color: C.textSecondary, fontWeight: 600, fontSize: 12, textTransform: 'uppercase' }}>Date</th>
                <th style={{ textAlign: 'center', padding: '14px 16px', color: C.textSecondary, fontWeight: 600, fontSize: 12, textTransform: 'uppercase' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order.id} style={{ borderBottom: `1px solid ${C.border}` }}>
                  <td style={{ padding: '14px 16px', fontWeight: 600, color: C.text }}>{order.id}</td>
                  <td style={{ padding: '14px 16px', color: C.textSecondary }}>
                    <div>{order.user?.name || order.customer?.name}</div>
                    <div style={{ fontSize: 12, opacity: 0.8 }}>{order.user?.email || order.customer?.email}</div>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      disabled={updating === order.id}
                      style={{ padding: '6px 10px', border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 13, background: C.surface, color: C.text, outline: 'none', cursor: 'pointer' }}
                    >
                      {STATUS_OPTIONS.map(status => (
                        <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>
                      ))}
                    </select>
                  </td>
                  <td style={{ padding: '14px 16px', textAlign: 'right', fontWeight: 600, color: C.text }}>${order.total.toFixed(2)}</td>
                  <td style={{ padding: '14px 16px' }}>
                    {order.payment ? (
                      <span style={{
                        display: 'inline-block',
                        padding: '4px 10px',
                        borderRadius: 6,
                        fontSize: 12,
                        fontWeight: 600,
                        background: order.payment.status === 'paid' ? `${C.success}15` : order.payment.status === 'failed' ? `${C.danger}15` : `${C.warning}15`,
                        color: order.payment.status === 'paid' ? C.success : order.payment.status === 'failed' ? C.danger : C.warning,
                        textTransform: 'capitalize',
                      }}>
                        {order.payment.status}
                      </span>
                    ) : (
                      <span style={{ color: C.textSecondary, fontSize: 13 }}>—</span>
                    )}
                  </td>
                  <td style={{ padding: '14px 16px', color: C.textSecondary, fontSize: 13 }}>{new Date(order.date).toLocaleDateString()}</td>
                  <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                      <Link to={`/orders/${order.id}`} style={{ padding: '6px 14px', background: C.primaryLight, color: C.primary, textDecoration: 'none', borderRadius: 8, fontWeight: 600, fontSize: 13 }}>
                        View
                      </Link>
                      <Link to={`/admin/returns?search=${encodeURIComponent(order.orderNumber || order.id)}`} style={{ padding: '6px 14px', background: `${C.warning}15`, color: C.warning, textDecoration: 'none', borderRadius: 8, fontWeight: 600, fontSize: 13 }}>
                        Returns
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr><td colSpan="7" style={{ padding: 40, textAlign: 'center', color: C.textSecondary }}>No orders found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
