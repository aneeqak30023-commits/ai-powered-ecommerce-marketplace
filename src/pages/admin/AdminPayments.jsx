import { useState, useEffect } from 'react'
import { getAdminPayments } from '../../services/adminApi.js'

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

export default function AdminPayments() {
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [statusFilter, setStatusFilter] = useState('')
  const [methodFilter, setMethodFilter] = useState('')

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getAdminPayments({ status: statusFilter, method: methodFilter })
      setPayments(data.payments || [])
    } catch (err) {
      setError(err.message || 'Failed to load payments')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [statusFilter, methodFilter])

  if (loading) {
    return <div style={{ padding: 40, textAlign: 'center', color: C.textSecondary }}>Loading payments...</div>
  }

  return (
    <div>
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ padding: '10px 14px', border: `1px solid ${C.border}`, borderRadius: 10, fontSize: 14, background: C.surface, color: C.text, outline: 'none', minWidth: 150 }}>
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="paid">Paid</option>
          <option value="failed">Failed</option>
          <option value="cancelled">Cancelled</option>
          <option value="refunded">Refunded</option>
        </select>
        <select value={methodFilter} onChange={(e) => setMethodFilter(e.target.value)} style={{ padding: '10px 14px', border: `1px solid ${C.border}`, borderRadius: 10, fontSize: 14, background: C.surface, color: C.text, outline: 'none', minWidth: 150 }}>
          <option value="">All Methods</option>
          <option value="cash_on_delivery">Cash on Delivery</option>
          <option value="online">Online</option>
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
                <th style={{ textAlign: 'left', padding: '14px 16px', color: C.textSecondary, fontWeight: 600, fontSize: 12, textTransform: 'uppercase' }}>Payment ID</th>
                <th style={{ textAlign: 'left', padding: '14px 16px', color: C.textSecondary, fontWeight: 600, fontSize: 12, textTransform: 'uppercase' }}>Order</th>
                <th style={{ textAlign: 'left', padding: '14px 16px', color: C.textSecondary, fontWeight: 600, fontSize: 12, textTransform: 'uppercase' }}>Customer</th>
                <th style={{ textAlign: 'left', padding: '14px 16px', color: C.textSecondary, fontWeight: 600, fontSize: 12, textTransform: 'uppercase' }}>Method</th>
                <th style={{ textAlign: 'left', padding: '14px 16px', color: C.textSecondary, fontWeight: 600, fontSize: 12, textTransform: 'uppercase' }}>Status</th>
                <th style={{ textAlign: 'right', padding: '14px 16px', color: C.textSecondary, fontWeight: 600, fontSize: 12, textTransform: 'uppercase' }}>Amount</th>
                <th style={{ textAlign: 'left', padding: '14px 16px', color: C.textSecondary, fontWeight: 600, fontSize: 12, textTransform: 'uppercase' }}>Provider</th>
                <th style={{ textAlign: 'left', padding: '14px 16px', color: C.textSecondary, fontWeight: 600, fontSize: 12, textTransform: 'uppercase' }}>Date</th>
              </tr>
            </thead>
            <tbody>
              {payments.map(payment => (
                <tr key={payment.id} style={{ borderBottom: `1px solid ${C.border}` }}>
                  <td style={{ padding: '14px 16px', fontWeight: 600, color: C.text, fontSize: 12 }}>{payment.id}</td>
                  <td style={{ padding: '14px 16px', color: C.textSecondary, fontSize: 13 }}>{payment.orderNumber || payment.orderId}</td>
                  <td style={{ padding: '14px 16px', color: C.textSecondary }}>
                    <div>{payment.userName}</div>
                    <div style={{ fontSize: 12, opacity: 0.8 }}>{payment.userEmail}</div>
                  </td>
                  <td style={{ padding: '14px 16px', color: C.textSecondary, textTransform: 'capitalize' }}>{payment.paymentMethod?.replace('_', ' ')}</td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{
                      display: 'inline-block',
                      padding: '4px 10px',
                      borderRadius: 6,
                      fontSize: 12,
                      fontWeight: 600,
                      background: payment.status === 'paid' ? `${C.success}15` : payment.status === 'failed' || payment.status === 'cancelled' ? `${C.danger}15` : `${C.warning}15`,
                      color: payment.status === 'paid' ? C.success : payment.status === 'failed' || payment.status === 'cancelled' ? C.danger : C.warning,
                      textTransform: 'capitalize',
                    }}>
                      {payment.status}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px', textAlign: 'right', fontWeight: 600, color: C.text }}>
                    ${payment.amount.toFixed(2)} <span style={{ fontSize: 12, color: C.textSecondary, fontWeight: 400 }}>{payment.currency}</span>
                  </td>
                  <td style={{ padding: '14px 16px', color: C.textSecondary, fontSize: 13, textTransform: 'capitalize' }}>{payment.provider || '—'}</td>
                  <td style={{ padding: '14px 16px', color: C.textSecondary, fontSize: 13 }}>{new Date(payment.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
              {payments.length === 0 && (
                <tr><td colSpan="8" style={{ padding: 40, textAlign: 'center', color: C.textSecondary }}>No payments found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
