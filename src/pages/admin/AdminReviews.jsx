import { useState, useEffect } from 'react'
import { getAdminReviews, deleteAdminReview } from '../../services/adminApi.js'

const C = {
  primary: '#6366F1',
  primaryDark: '#4F46E5',
  surface: '#FFFFFF',
  background: '#F8FAFC',
  text: '#0F172A',
  textSecondary: '#475569',
  border: '#E2E8F0',
  danger: '#DC2626',
  warning: '#D97706',
}

export default function AdminReviews() {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getAdminReviews({ search })
      setReviews(data.reviews || [])
    } catch (err) {
      setError(err.message || 'Failed to load reviews')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [search])

  const handleDelete = async (id) => {
    if (!confirm('Delete this review? This cannot be undone.')) return
    try {
      await deleteAdminReview(id)
      load()
    } catch (err) {
      setError(err.message || 'Failed to delete review')
    }
  }

  if (loading) {
    return <div style={{ padding: 40, textAlign: 'center', color: C.textSecondary }}>Loading reviews...</div>
  }

  return (
    <div>
      <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
        <input
          type="text"
          placeholder="Search reviews..."
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
                <th style={{ textAlign: 'left', padding: '14px 16px', color: C.textSecondary, fontWeight: 600, fontSize: 12, textTransform: 'uppercase' }}>Product</th>
                <th style={{ textAlign: 'left', padding: '14px 16px', color: C.textSecondary, fontWeight: 600, fontSize: 12, textTransform: 'uppercase' }}>Customer</th>
                <th style={{ textAlign: 'center', padding: '14px 16px', color: C.textSecondary, fontWeight: 600, fontSize: 12, textTransform: 'uppercase' }}>Rating</th>
                <th style={{ textAlign: 'left', padding: '14px 16px', color: C.textSecondary, fontWeight: 600, fontSize: 12, textTransform: 'uppercase' }}>Comment</th>
                <th style={{ textAlign: 'left', padding: '14px 16px', color: C.textSecondary, fontWeight: 600, fontSize: 12, textTransform: 'uppercase' }}>Date</th>
                <th style={{ textAlign: 'center', padding: '14px 16px', color: C.textSecondary, fontWeight: 600, fontSize: 12, textTransform: 'uppercase' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {reviews.map(review => (
                <tr key={review.id} style={{ borderBottom: `1px solid ${C.border}` }}>
                  <td style={{ padding: '14px 16px', fontWeight: 600, color: C.text }}>{review.productName || review.productId}</td>
                  <td style={{ padding: '14px 16px', color: C.textSecondary }}>
                    <div>{review.userName}</div>
                    <div style={{ fontSize: 12, opacity: 0.8 }}>{review.userEmail}</div>
                  </td>
                  <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                    <span style={{ color: C.warning, fontWeight: 700 }}>{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</span>
                  </td>
                  <td style={{ padding: '14px 16px', color: C.textSecondary, maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{review.comment}</td>
                  <td style={{ padding: '14px 16px', color: C.textSecondary, fontSize: 13 }}>{new Date(review.date).toLocaleDateString()}</td>
                  <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                    <button onClick={() => handleDelete(review.id)} style={{ padding: '6px 14px', background: `${C.danger}15`, color: C.danger, border: 'none', borderRadius: 8, fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {reviews.length === 0 && (
                <tr><td colSpan="6" style={{ padding: 40, textAlign: 'center', color: C.textSecondary }}>No reviews found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
