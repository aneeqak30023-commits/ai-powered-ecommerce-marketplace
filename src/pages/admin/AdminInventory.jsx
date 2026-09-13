import { useState, useEffect } from 'react'
import { getAdminInventory } from '../../services/adminApi.js'

const C = {
  primary: '#6366F1',
  primaryDark: '#4F46E5',
  surface: '#FFFFFF',
  background: '#F8FAFC',
  text: '#0F172A',
  textSecondary: '#475569',
  border: '#E2E8F0',
  danger: '#DC2626',
  success: '#16A34A',
}

export default function AdminInventory() {
  const [inventory, setInventory] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    getAdminInventory()
      .then(data => {
        if (!cancelled) {
          setInventory(data)
          setLoading(false)
        }
      })
      .catch(err => {
        if (!cancelled) {
          setError(err.message || 'Failed to load inventory')
          setLoading(false)
        }
      })

    return () => { cancelled = true }
  }, [])

  if (loading) {
    return <div style={{ padding: 40, textAlign: 'center', color: C.textSecondary }}>Loading inventory...</div>
  }

  return (
    <div>
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
                <th style={{ textAlign: 'left', padding: '14px 16px', color: C.textSecondary, fontWeight: 600, fontSize: 12, textTransform: 'uppercase' }}>Product ID</th>
                <th style={{ textAlign: 'left', padding: '14px 16px', color: C.textSecondary, fontWeight: 600, fontSize: 12, textTransform: 'uppercase' }}>Product Name</th>
                <th style={{ textAlign: 'left', padding: '14px 16px', color: C.textSecondary, fontWeight: 600, fontSize: 12, textTransform: 'uppercase' }}>Category</th>
                <th style={{ textAlign: 'right', padding: '14px 16px', color: C.textSecondary, fontWeight: 600, fontSize: 12, textTransform: 'uppercase' }}>Stock</th>
                <th style={{ textAlign: 'center', padding: '14px 16px', color: C.textSecondary, fontWeight: 600, fontSize: 12, textTransform: 'uppercase' }}>Status</th>
                <th style={{ textAlign: 'left', padding: '14px 16px', color: C.textSecondary, fontWeight: 600, fontSize: 12, textTransform: 'uppercase' }}>Updated</th>
              </tr>
            </thead>
            <tbody>
              {inventory.map(item => (
                <tr key={item.productId} style={{ borderBottom: `1px solid ${C.border}` }}>
                  <td style={{ padding: '14px 16px', color: C.textSecondary }}>{item.productId}</td>
                  <td style={{ padding: '14px 16px', fontWeight: 600, color: C.text }}>{item.productName}</td>
                  <td style={{ padding: '14px 16px', color: C.textSecondary }}>{item.categoryName || '—'}</td>
                  <td style={{ padding: '14px 16px', textAlign: 'right', fontWeight: 700, color: C.text }}>{item.stock}</td>
                  <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                    <span style={{
                      display: 'inline-block',
                      padding: '4px 10px',
                      borderRadius: 6,
                      fontSize: 12,
                      fontWeight: 600,
                      background: item.isLowStock ? `${C.danger}15` : `${C.success}15`,
                      color: item.isLowStock ? C.danger : C.success,
                    }}>
                      {item.isLowStock ? 'Low Stock' : 'In Stock'}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px', color: C.textSecondary, fontSize: 13 }}>{new Date(item.updatedAt).toLocaleDateString()}</td>
                </tr>
              ))}
              {inventory.length === 0 && (
                <tr><td colSpan="6" style={{ padding: 40, textAlign: 'center', color: C.textSecondary }}>No inventory records found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
