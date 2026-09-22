import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext.jsx'
import { getAdminRefunds, updateAdminRefundStatus, createAdminRefund, getAdminPayments } from '../../services/adminApi.js'
import { REFUND_STATUSES, REFUND_METHODS } from '../../context/ReturnContext.jsx'

const C = {
  primary: '#6366F1',
  primaryDark: '#4F46E5',
  surface: '#FFFFFF',
  background: '#F8FAFC',
  text: '#0F172A',
  textSecondary: '#475569',
  border: '#E2E8F0',
  success: '#16A45A',
  danger: '#DC2626',
  warning: '#D97706',
  info: '#2563EB'
}

function formatPrice(value) {
  return `$${Number(value || 0).toFixed(2)}`
}

const STATUS_OPTIONS = Object.entries(REFUND_STATUSES).map(([key, value]) => ({
  value,
  label: key.charAt(0) + key.slice(1).toLowerCase(),
}))

export default function AdminRefunds() {
  const { user, loading: authLoading } = useAuth()
  const [refunds, setRefunds] = useState([])
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [updating, setUpdating] = useState(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [createForm, setCreateForm] = useState({ paymentId: '', amount: '', method: 'manual', notes: '' })

  useEffect(() => {
    if (!authLoading && user?.role !== 'admin') {
      window.location.href = '/'
      return
    }
    if (!authLoading && user?.role === 'admin') {
      loadRefunds()
    }
  }, [authLoading, user, search, statusFilter])

  async function loadRefunds() {
    setLoading(true)
    setError(null)
    try {
      const [refundData, paymentData] = await Promise.all([
        getAdminRefunds({ search, status: statusFilter }),
        getAdminPayments({}),
      ])
      setRefunds(refundData.refunds || [])
      setPayments(paymentData.payments || [])
    } catch (err) {
      setError(err.message || 'Failed to load refunds')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (refundId, newStatus, notes) => {
    setUpdating(refundId)
    try {
      await updateAdminRefundStatus(refundId, newStatus, notes)
      await loadRefunds()
    } catch (err) {
      setError(err.message || 'Failed to update status')
    } finally {
      setUpdating(null)
    }
  }

  const handleCreateRefund = async (ev) => {
    ev.preventDefault()
    try {
      await createAdminRefund(createForm)
      setShowCreateModal(false)
      setCreateForm({ paymentId: '', amount: '', method: 'manual', notes: '' })
      await loadRefunds()
    } catch (err) {
      setError(err.message || 'Failed to create refund')
    }
  }

  if (authLoading) {
    return <div style={{ padding: 40, textAlign: 'center', color: C.textSecondary }}>Loading...</div>
  }

  if (!user || user.role !== 'admin') {
    return null
  }

  return (
    <div>
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 12, flex: 1, minWidth: 200 }}>
          <input
            type="text"
            placeholder="Search by order, payment..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ flex: 1, padding: '10px 14px', border: `1px solid ${C.border}`, borderRadius: 10, fontSize: 14, background: C.surface, color: C.text, outline: 'none' }}
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ padding: '10px 14px', border: `1px solid ${C.border}`, borderRadius: 10, fontSize: 14, background: C.surface, color: C.text, outline: 'none', minWidth: 150 }}
          >
            <option value="">All Statuses</option>
            {STATUS_OPTIONS.map(status => (
              <option key={status.value} value={status.value}>{status.label}</option>
            ))}
          </select>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          style={{ padding: '10px 20px', border: 'none', background: C.primary, color: '#fff', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
        >
          Create Refund
        </button>
      </div>

      {error && (
        <div style={{ background: `${C.danger}10`, border: `1px solid ${C.danger}30`, borderRadius: 12, padding: 16, color: C.danger, fontSize: 14, marginBottom: 20 }}>
          {error}
        </div>
      )}

      {showCreateModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: C.surface, borderRadius: 16, padding: 24, maxWidth: 480, width: '90%', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: 18, fontWeight: 700, color: C.text }}>Create Refund</h3>
            <form onSubmit={handleCreateRefund} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: C.textSecondary, marginBottom: 6 }}>Payment</label>
                <select
                  value={createForm.paymentId}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, paymentId: e.target.value }))}
                  required
                  style={{ width: '100%', padding: '10px 14px', border: `1px solid ${C.border}`, borderRadius: 10, fontSize: 14, background: C.surface, color: C.text, outline: 'none' }}
                >
                  <option value="">Select a payment</option>
                  {payments.map(payment => (
                    <option key={payment.id} value={payment.id}>
                      Order #{payment.orderNumber || payment.orderId} — {payment.paymentMethod} — {formatPrice(payment.amount)} ({payment.status})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: C.textSecondary, marginBottom: 6 }}>Amount</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={createForm.amount}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, amount: e.target.value }))}
                  required
                  placeholder="0.00"
                  style={{ width: '100%', padding: '10px 14px', border: `1px solid ${C.border}`, borderRadius: 10, fontSize: 14, background: C.surface, color: C.text, outline: 'none' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: C.textSecondary, marginBottom: 6 }}>Method</label>
                <select
                  value={createForm.method}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, method: e.target.value }))}
                  required
                  style={{ width: '100%', padding: '10px 14px', border: `1px solid ${C.border}`, borderRadius: 10, fontSize: 14, background: C.surface, color: C.text, outline: 'none' }}
                >
                  {REFUND_METHODS.map(method => (
                    <option key={method.value} value={method.value}>{method.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: C.textSecondary, marginBottom: 6 }}>Notes</label>
                <textarea
                  value={createForm.notes}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Processing notes..."
                  rows={3}
                  style={{ width: '100%', padding: '10px 14px', border: `1px solid ${C.border}`, borderRadius: 10, fontSize: 14, background: C.surface, color: C.text, outline: 'none', resize: 'vertical' }}
                />
              </div>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  style={{ padding: '10px 20px', border: `1px solid ${C.border}`, background: C.surface, borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '10px 20px', border: 'none', background: C.primary, color: '#fff', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ padding: 40, textAlign: 'center', color: C.textSecondary }}>Loading refunds...</div>
      ) : (
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${C.border}`, background: C.background }}>
                  <th style={{ textAlign: 'left', padding: '14px 16px', color: C.textSecondary, fontWeight: 600, fontSize: 12, textTransform: 'uppercase' }}>Refund ID</th>
                  <th style={{ textAlign: 'left', padding: '14px 16px', color: C.textSecondary, fontWeight: 600, fontSize: 12, textTransform: 'uppercase' }}>Order</th>
                  <th style={{ textAlign: 'right', padding: '14px 16px', color: C.textSecondary, fontWeight: 600, fontSize: 12, textTransform: 'uppercase' }}>Amount</th>
                  <th style={{ textAlign: 'left', padding: '14px 16px', color: C.textSecondary, fontWeight: 600, fontSize: 12, textTransform: 'uppercase' }}>Status</th>
                  <th style={{ textAlign: 'left', padding: '14px 16px', color: C.textSecondary, fontWeight: 600, fontSize: 12, textTransform: 'uppercase' }}>Method</th>
                  <th style={{ textAlign: 'left', padding: '14px 16px', color: C.textSecondary, fontWeight: 600, fontSize: 12, textTransform: 'uppercase' }}>Date</th>
                  <th style={{ textAlign: 'center', padding: '14px 16px', color: C.textSecondary, fontWeight: 600, fontSize: 12, textTransform: 'uppercase' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {refunds.map(refund => (
                  <tr key={refund.id} style={{ borderBottom: `1px solid ${C.border}` }}>
                    <td style={{ padding: '14px 16px', fontWeight: 600, color: C.text, fontSize: 13 }}>{refund.id}</td>
                    <td style={{ padding: '14px 16px', color: C.textSecondary }}>{refund.orderNumber || '—'}</td>
                    <td style={{ padding: '14px 16px', textAlign: 'right', fontWeight: 600, color: C.text }}>{formatPrice(refund.amount)} ({refund.currency})</td>
                    <td style={{ padding: '14px 16px' }}>
                      <select
                        value={refund.status}
                        onChange={(e) => handleStatusChange(refund.id, e.target.value, '')}
                        disabled={updating === refund.id}
                        style={{ padding: '4px 8px', border: `1px solid ${C.border}`, borderRadius: 6, fontSize: 12, background: C.surface, color: C.text, outline: 'none', cursor: 'pointer', textTransform: 'capitalize' }}
                      >
                        {STATUS_OPTIONS.map(status => (
                          <option key={status.value} value={status.value}>{status.label}</option>
                        ))}
                      </select>
                    </td>
                    <td style={{ padding: '14px 16px', color: C.textSecondary, textTransform: 'capitalize' }}>{refund.method}</td>
                    <td style={{ padding: '14px 16px', color: C.textSecondary, fontSize: 13 }}>{new Date(refund.createdAt).toLocaleDateString()}</td>
                    <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                      {refund.notes && (
                        <span style={{ fontSize: 11, color: C.textSecondary }} title={refund.notes}>
                          {refund.notes.length > 20 ? refund.notes.slice(0, 20) + '...' : refund.notes}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
                {refunds.length === 0 && (
                  <tr><td colSpan="7" style={{ padding: 40, textAlign: 'center', color: C.textSecondary }}>No refunds found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
