import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext.jsx'
import { getAdminReturns, updateAdminReturnStatus } from '../../services/adminApi.js'
import { RETURN_STATUSES } from '../../context/ReturnContext.jsx'

function formatPrice(value) {
  return `$${Number(value || 0).toFixed(2)}`
}

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

const STATUS_OPTIONS = Object.entries(RETURN_STATUSES).map(([key, value]) => ({
  value,
  label: key.charAt(0) + key.slice(1).toLowerCase(),
}))

export default function AdminReturns() {
  const { user, loading: authLoading } = useAuth()
  const [returns, setReturns] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [updating, setUpdating] = useState(null)
  const [updateNotes, setUpdateNotes] = useState({})

  useEffect(() => {
    if (!authLoading && user?.role !== 'admin') {
      window.location.href = '/'
      return
    }
    if (!authLoading && user?.role === 'admin') {
      loadReturns()
    }
  }, [authLoading, user, search, statusFilter])

  async function loadReturns() {
    setLoading(true)
    setError(null)
    try {
      const data = await getAdminReturns({ search, status: statusFilter })
      setReturns(data.returns || [])
    } catch (err) {
      setError(err.message || 'Failed to load returns')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (returnId, newStatus) => {
    setUpdating(returnId)
    try {
      await updateAdminReturnStatus(returnId, newStatus, updateNotes[returnId])
      await loadReturns()
    } catch (err) {
      setError(err.message || 'Failed to update status')
    } finally {
      setUpdating(null)
    }
  }

  if (authLoading) {
    return <div style={{ padding: 40, textAlign: 'center', color: C.textSecondary }}>Loading...</div>
  }

  if (!user || user.role !== 'admin') {
    return null
  }

  if (loading) {
    return <div style={{ padding: 40, textAlign: 'center', color: C.textSecondary }}>Loading returns...</div>
  }

  return (
    <div>
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Search by order number, customer email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ flex: 1, minWidth: 200, padding: '10px 14px', border: `1px solid ${C.border}`, borderRadius: 10, fontSize: 14, background: C.surface, color: C.text, outline: 'none' }}
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
                <th style={{ textAlign: 'left', padding: '14px 16px', color: C.textSecondary, fontWeight: 600, fontSize: 12, textTransform: 'uppercase' }}>Return ID</th>
                <th style={{ textAlign: 'left', padding: '14px 16px', color: C.textSecondary, fontWeight: 600, fontSize: 12, textTransform: 'uppercase' }}>Order</th>
                <th style={{ textAlign: 'left', padding: '14px 16px', color: C.textSecondary, fontWeight: 600, fontSize: 12, textTransform: 'uppercase' }}>Customer</th>
                <th style={{ textAlign: 'left', padding: '14px 16px', color: C.textSecondary, fontWeight: 600, fontSize: 12, textTransform: 'uppercase' }}>Reason</th>
                <th style={{ textAlign: 'left', padding: '14px 16px', color: C.textSecondary, fontWeight: 600, fontSize: 12, textTransform: 'uppercase' }}>Status</th>
                <th style={{ textAlign: 'right', padding: '14px 16px', color: C.textSecondary, fontWeight: 600, fontSize: 12, textTransform: 'uppercase' }}>Amount</th>
                <th style={{ textAlign: 'left', padding: '14px 16px', color: C.textSecondary, fontWeight: 600, fontSize: 12, textTransform: 'uppercase' }}>Date</th>
                <th style={{ textAlign: 'center', padding: '14px 16px', color: C.textSecondary, fontWeight: 600, fontSize: 12, textTransform: 'uppercase' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {returns.map(ret => (
                <tr key={ret.id} style={{ borderBottom: `1px solid ${C.border}` }}>
                  <td style={{ padding: '14px 16px', fontWeight: 600, color: C.text, fontSize: 13 }}>{ret.id}</td>
                  <td style={{ padding: '14px 16px', color: C.textSecondary }}>{ret.orderNumber}</td>
                  <td style={{ padding: '14px 16px', color: C.textSecondary }}>
                    {ret.userName && (
                      <div>
                        <div style={{ fontWeight: 500 }}>{ret.userName}</div>
                        <div style={{ fontSize: 12 }}>{ret.userEmail}</div>
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '14px 16px', color: C.textSecondary, textTransform: 'capitalize' }}>{ret.reason.replace('_', ' ')}</td>
                  <td style={{ padding: '14px 16px' }}>
                    <select
                      value={ret.status}
                      onChange={(e) => handleStatusChange(ret.id, e.target.value)}
                      disabled={updating === ret.id}
                      style={{ padding: '6px 10px', border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 13, background: C.surface, color: C.text, outline: 'none', cursor: 'pointer', textTransform: 'capitalize' }}
                    >
                      {STATUS_OPTIONS.map(status => (
                        <option key={status.value} value={status.value}>{status.label}</option>
                      ))}
                    </select>
                  </td>
                  <td style={{ padding: '14px 16px', textAlign: 'right', fontWeight: 600, color: C.text }}>{formatPrice(ret.totalAmount)}</td>
                  <td style={{ padding: '14px 16px', color: C.textSecondary, fontSize: 13 }}>{new Date(ret.createdAt).toLocaleDateString()}</td>
                  <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                    <textarea
                      placeholder="Notes"
                      value={updateNotes[ret.id] || ''}
                      onChange={(e) => setUpdateNotes(prev => ({ ...prev, [ret.id]: e.target.value }))}
                      rows={2}
                      style={{ width: '100%', padding: '6px 8px', border: `1px solid ${C.border}`, borderRadius: 6, fontSize: 12, background: C.background, color: C.text, outline: 'none', boxSizing: 'border-box' }}
                    />
                  </td>
                </tr>
              ))}
              {returns.length === 0 && (
                <tr><td colSpan="8" style={{ padding: 40, textAlign: 'center', color: C.textSecondary }}>No returns found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
