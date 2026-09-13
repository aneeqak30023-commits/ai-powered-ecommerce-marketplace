import { useState, useEffect } from 'react'
import { getAdminCustomers } from '../../services/adminApi.js'

const C = {
  primary: '#6366F1',
  primaryDark: '#4F46E5',
  surface: '#FFFFFF',
  background: '#F8FAFC',
  text: '#0F172A',
  textSecondary: '#475569',
  border: '#E2E8F0',
}

export default function AdminCustomers() {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getAdminCustomers({ search })
      setCustomers(data.customers || [])
    } catch (err) {
      setError(err.message || 'Failed to load customers')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [search])

  if (loading) {
    return <div style={{ padding: 40, textAlign: 'center', color: C.textSecondary }}>Loading customers...</div>
  }

  return (
    <div>
      <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
        <input
          type="text"
          placeholder="Search customers by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ flex: 1, maxWidth: 400, padding: '10px 14px', border: `1px solid ${C.border}`, borderRadius: 10, fontSize: 14, background: C.surface, color: C.text, outline: 'none' }}
        />
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
                <th style={{ textAlign: 'left', padding: '14px 16px', color: C.textSecondary, fontWeight: 600, fontSize: 12, textTransform: 'uppercase' }}>Name</th>
                <th style={{ textAlign: 'left', padding: '14px 16px', color: C.textSecondary, fontWeight: 600, fontSize: 12, textTransform: 'uppercase' }}>Email</th>
                <th style={{ textAlign: 'center', padding: '14px 16px', color: C.textSecondary, fontWeight: 600, fontSize: 12, textTransform: 'uppercase' }}>Orders</th>
                <th style={{ textAlign: 'center', padding: '14px 16px', color: C.textSecondary, fontWeight: 600, fontSize: 12, textTransform: 'uppercase' }}>Reviews</th>
                <th style={{ textAlign: 'center', padding: '14px 16px', color: C.textSecondary, fontWeight: 600, fontSize: 12, textTransform: 'uppercase' }}>Tickets</th>
                <th style={{ textAlign: 'left', padding: '14px 16px', color: C.textSecondary, fontWeight: 600, fontSize: 12, textTransform: 'uppercase' }}>Joined</th>
              </tr>
            </thead>
            <tbody>
              {customers.map(customer => (
                <tr key={customer.id} style={{ borderBottom: `1px solid ${C.border}` }}>
                  <td style={{ padding: '14px 16px', fontWeight: 600, color: C.text }}>{customer.name}</td>
                  <td style={{ padding: '14px 16px', color: C.textSecondary }}>{customer.email}</td>
                  <td style={{ padding: '14px 16px', textAlign: 'center', color: C.text }}>{customer.orderCount}</td>
                  <td style={{ padding: '14px 16px', textAlign: 'center', color: C.text }}>{customer.reviewCount}</td>
                  <td style={{ padding: '14px 16px', textAlign: 'center', color: C.text }}>{customer.ticketCount}</td>
                  <td style={{ padding: '14px 16px', color: C.textSecondary, fontSize: 13 }}>{new Date(customer.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
              {customers.length === 0 && (
                <tr><td colSpan="6" style={{ padding: 40, textAlign: 'center', color: C.textSecondary }}>No customers found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
