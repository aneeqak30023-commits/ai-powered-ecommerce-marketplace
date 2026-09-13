import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getAdminDashboard } from '../../services/adminApi.js'

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

function StatCard({ title, value, icon, color }) {
  return (
    <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: 24, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <p style={{ fontSize: 13, fontWeight: 600, color: C.textSecondary, margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '.04em' }}>{title}</p>
          <p style={{ fontSize: 28, fontWeight: 800, color: C.text, margin: 0 }}>{value}</p>
        </div>
        <div style={{ fontSize: 32, opacity: 0.9 }}>{icon}</div>
      </div>
    </div>
  )
}

export default function AdminDashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    getAdminDashboard()
      .then(result => {
        if (!cancelled) {
          setData(result)
          setLoading(false)
        }
      })
      .catch(err => {
        if (!cancelled) {
          setError(err.message || 'Failed to load dashboard')
          setLoading(false)
        }
      })

    return () => { cancelled = true }
  }, [])

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 80 }}>
        <p style={{ color: C.textSecondary, fontSize: 15 }}>Loading dashboard...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ background: `${C.danger}10`, border: `1px solid ${C.danger}30`, borderRadius: 12, padding: 20, color: C.danger, fontSize: 14 }}>
        {error}
      </div>
    )
  }

  const { stats, recentOrders } = data || {}

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20, marginBottom: 32 }}>
        <StatCard title="Total Orders" value={stats?.totalOrders || 0} icon="📋" color={C.primary} />
        <StatCard title="Total Customers" value={stats?.totalCustomers || 0} icon="👥" color={C.success} />
        <StatCard title="Total Products" value={stats?.totalProducts || 0} icon="📦" color={C.warning} />
        <StatCard title="Total Revenue" value={`$${(stats?.totalRevenue || 0).toFixed(2)}`} icon="💰" color={C.primary} />
        <StatCard title="Pending Orders" value={stats?.pendingOrders || 0} icon="⏳" color={C.warning} />
        <StatCard title="Low Stock" value={stats?.lowStockCount || 0} icon="⚠️" color={C.danger} />
        <StatCard title="Open Tickets" value={stats?.openTickets || 0} icon="🎧" color={C.textSecondary} />
      </div>

      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: 24, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)' }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: C.text, margin: '0 0 20px' }}>Recent Orders</h2>
        {!recentOrders || recentOrders.length === 0 ? (
          <p style={{ color: C.textSecondary, fontSize: 14 }}>No orders yet.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                  <th style={{ textAlign: 'left', padding: '12px 8px', color: C.textSecondary, fontWeight: 600, fontSize: 12, textTransform: 'uppercase' }}>Order</th>
                  <th style={{ textAlign: 'left', padding: '12px 8px', color: C.textSecondary, fontWeight: 600, fontSize: 12, textTransform: 'uppercase' }}>Customer</th>
                  <th style={{ textAlign: 'left', padding: '12px 8px', color: C.textSecondary, fontWeight: 600, fontSize: 12, textTransform: 'uppercase' }}>Status</th>
                  <th style={{ textAlign: 'right', padding: '12px 8px', color: C.textSecondary, fontWeight: 600, fontSize: 12, textTransform: 'uppercase' }}>Total</th>
                  <th style={{ textAlign: 'left', padding: '12px 8px', color: C.textSecondary, fontWeight: 600, fontSize: 12, textTransform: 'uppercase' }}>Date</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map(order => (
                  <tr key={order.id} style={{ borderBottom: `1px solid ${C.border}` }}>
                    <td style={{ padding: '14px 8px', fontWeight: 600, color: C.text }}>{order.id}</td>
                    <td style={{ padding: '14px 8px', color: C.textSecondary }}>
                      <div>{order.user?.name || order.customer?.name}</div>
                      <div style={{ fontSize: 12, opacity: 0.8 }}>{order.user?.email || order.customer?.email}</div>
                    </td>
                    <td style={{ padding: '14px 8px' }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '4px 10px',
                        borderRadius: 6,
                        fontSize: 12,
                        fontWeight: 600,
                        background: order.status === 'delivered' ? `${C.success}15` : order.status === 'cancelled' ? `${C.danger}15` : `${C.warning}15`,
                        color: order.status === 'delivered' ? C.success : order.status === 'cancelled' ? C.danger : C.warning,
                        textTransform: 'capitalize',
                      }}>
                        {order.status}
                      </span>
                    </td>
                    <td style={{ padding: '14px 8px', textAlign: 'right', fontWeight: 600, color: C.text }}>${order.total.toFixed(2)}</td>
                    <td style={{ padding: '14px 8px', color: C.textSecondary, fontSize: 13 }}>{new Date(order.date).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
