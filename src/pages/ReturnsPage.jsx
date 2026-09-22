import { Link, useNavigate } from 'react-router-dom'
import { useReturns, RETURN_STATUSES } from '../context/ReturnContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { REFUND_STATUSES } from '../context/ReturnContext.jsx'

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

const STATUS_COLORS = {
  [RETURN_STATUSES.REQUESTED]: { bg: '#FEF3C7', text: '#92400E' },
  [RETURN_STATUSES.APPROVED]: { bg: '#DBEAFE', text: '#1E40AF' },
  [RETURN_STATUSES.REJECTED]: { bg: '#FEE2E2', text: '#991B1B' },
  [RETURN_STATUSES.RETURNED]: { bg: '#E0E7FF', text: '#3730A3' },
  [RETURN_STATUSES.REFUNDED]: { bg: '#D1FAE5', text: '#065F46' },
  [RETURN_STATUSES.CANCELLED]: { bg: '#F3F4F6', text: '#6B7280' },
}

const REFUND_STATUS_COLORS = {
  [REFUND_STATUSES.PENDING]: { bg: '#FEF3C7', text: '#92400E' },
  [REFUND_STATUSES.PROCESSING]: { bg: '#DBEAFE', text: '#1E40AF' },
  [REFUND_STATUSES.PAID]: { bg: '#D1FAE5', text: '#065F46' },
  [REFUND_STATUSES.FAILED]: { bg: '#FEE2E2', text: '#991B1B' },
  [REFUND_STATUSES.CANCELLED]: { bg: '#F3F4F6', text: '#6B7280' },
}

export default function ReturnsPage() {
  const { returns } = useReturns()
  const { user, loading: authLoading } = useAuth()
  const navigate = useNavigate()

  if (authLoading) {
    return (
      <div style={{ minHeight: '100vh', background: C.background, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: C.textSecondary, fontSize: 15 }}>Loading...</p>
      </div>
    )
  }

  if (!user) {
    navigate('/login', { replace: true })
    return null
  }

  if (returns.length === 0) {
    return (
      <div style={{ minHeight: '100vh', background: C.background, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: C.text, margin: '0 0 8px' }}>No Returns Yet</h1>
          <p style={{ fontSize: 16, color: C.textSecondary, margin: '0 0 24px' }}>You haven't initiated any return requests.</p>
          <Link to="/orders" style={{ display: 'inline-block', padding: '12px 24px', background: C.primary, color: '#fff', textDecoration: 'none', borderRadius: 10, fontWeight: 600 }}>
            View My Orders
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: C.background }}>
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 20px' }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: C.text, margin: '0 0 24px' }}>My Returns</h1>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {returns.map((ret) => {
            const statusColor = STATUS_COLORS[ret.status] || STATUS_COLORS[RETURN_STATUSES.REQUESTED]
            const hasRefund = ret.refunds && ret.refunds.length > 0
            return (
              <Link
                key={ret.id}
                to={`/returns/${ret.id}`}
                style={{ display: 'block', background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, overflow: 'hidden', textDecoration: 'none', color: 'inherit', transition: 'box-shadow 0.2s ease' }}
                onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.06)' }}
                onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'none' }}
              >
                <div style={{ padding: 24 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 12 }}>
                    <div>
                      <p style={{ fontWeight: 600, color: C.text, margin: '0 0 4px', fontSize: 15 }}>
                        Return #{ret.id} — Order #{ret.orderNumber}
                      </p>
                      <p style={{ fontSize: 13, color: C.textSecondary, margin: 0 }}>
                        {new Date(ret.createdAt).toLocaleDateString()} · {ret.items?.length || 0} item{(ret.items?.length || 0) !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <span style={{ display: 'inline-block', padding: '4px 12px', borderRadius: 9999, fontSize: 12, fontWeight: 600, background: statusColor.bg, color: statusColor.text }}>
                      {ret.status}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: C.textSecondary }}>
                    <span>{ret.reason}</span>
                    <span style={{ fontWeight: 600, color: C.text }}>{formatPrice(ret.totalAmount)}</span>
                  </div>
                  {hasRefund && (
                    <div style={{ marginTop: 12, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                      {ret.refunds.map((refund) => {
                        const refundColor = REFUND_STATUS_COLORS[refund.status] || REFUND_STATUS_COLORS[REFUND_STATUSES.PENDING]
                        return (
                          <div key={refund.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ display: 'inline-block', padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 600, background: refundColor.bg, color: refundColor.text }}>
                              Refund: {refund.status}
                            </span>
                            <span style={{ fontSize: 13, color: C.textSecondary }}>{formatPrice(refund.amount)}</span>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
