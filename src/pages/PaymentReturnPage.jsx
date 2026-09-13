import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { getPayment, pollPayment } from '../services/paymentApi.js'

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
  warning: '#D97706'
}

function CheckIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M5 13l4 4L19 7" stroke={C.success} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function Spinner() {
  return (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="animate-spin">
      <circle cx="12" cy="12" r="10" stroke={C.border} strokeWidth="3" />
      <path d="M12 2a10 10 0 0 1 10 10" stroke={C.primary} strokeWidth="3" strokeLinecap="round" />
    </svg>
  )
}

export default function PaymentReturnPage() {
  const [searchParams] = useSearchParams()
  const orderNumber = searchParams.get('orderNumber')
  const [payment, setPayment] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!orderNumber) {
      setError('Missing order number')
      setLoading(false)
      return
    }

    let cancelled = false

    const loadPayment = async () => {
      try {
        const tracker = new URLSearchParams(window.location.search).get('tracker')
        const data = await getPayment(orderNumber, tracker)
        if (cancelled) return
        setPayment(data)
        setLoading(false)

        if (['pending', 'processing'].includes(data.status)) {
          const polled = await pollPayment(orderNumber, 10, 2000)
          if (cancelled) return
          if (polled) {
            setPayment(polled)
          }
        }
      } catch (err) {
        if (cancelled) return
        setError(err.message || 'Failed to load payment status')
        setLoading(false)
      }
    }

    loadPayment()

    return () => {
      cancelled = true
    }
  }, [orderNumber])

  const getStatusMessage = () => {
    if (!payment) return null
    switch (payment.status) {
      case 'paid':
        return 'Your payment has been confirmed successfully.'
      case 'processing':
        return 'Your payment is being processed. Please wait...'
      case 'pending':
        return 'Your payment is pending confirmation.'
      case 'failed':
        return 'Your payment could not be processed. Please try again.'
      case 'cancelled':
        return 'Your payment was cancelled.'
      default:
        return `Payment status: ${payment.status}`
    }
  }

  const getStatusColor = () => {
    if (!payment) return C.textSecondary
    switch (payment.status) {
      case 'paid': return C.success
      case 'failed':
      case 'cancelled': return C.danger
      case 'processing':
      case 'pending': return C.warning
      default: return C.textSecondary
    }
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: C.background, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <Spinner />
          <p style={{ marginTop: 20, fontSize: 16, color: C.textSecondary }}>Checking payment status...</p>
        </div>
      </div>
    )
  }

  if (error) {
    if (error.includes('Authorization') || error.includes('401')) {
      return (
        <div style={{ minHeight: '100vh', background: C.background, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ maxWidth: 500, margin: '0 auto', padding: 80, textAlign: 'center', background: C.surface, borderRadius: 20, border: `1px solid ${C.border}` }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, color: C.text, margin: '0 0 10px' }}>Please Log In</h2>
            <p style={{ color: C.textSecondary, margin: '0 0 24px', fontSize: 15 }}>Log in to view your payment status.</p>
            <Link to="/login" style={{ display: 'inline-block', padding: '12px 24px', background: C.primary, color: '#fff', textDecoration: 'none', borderRadius: 10, fontWeight: 600 }}>
              Log In
            </Link>
          </div>
        </div>
      )
    }

    return (
      <div style={{ minHeight: '100vh', background: C.background, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ maxWidth: 500, margin: '0 auto', padding: 80, textAlign: 'center', background: C.surface, borderRadius: 20, border: `1px solid ${C.border}` }}>
          <h2 style={{ fontSize: 24, fontWeight: 700, color: C.text, margin: '0 0 10px' }}>Unable to Load Payment</h2>
          <p style={{ color: C.textSecondary, margin: '0 0 24px', fontSize: 15 }}>{error}</p>
          <Link to="/orders" style={{ display: 'inline-block', padding: '12px 24px', background: C.primary, color: '#fff', textDecoration: 'none', borderRadius: 10, fontWeight: 600 }}>
            View Orders
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: C.background, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ maxWidth: 500, margin: '0 auto', padding: 80, textAlign: 'center', background: C.surface, borderRadius: 20, border: `1px solid ${C.border}` }}>
        {payment.status === 'paid' && (
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 80, height: 80, borderRadius: '50%', background: C.success, marginBottom: 18, boxShadow: '0 10px 25px -5px rgba(22,163,74,0.3)' }}>
            <CheckIcon />
          </div>
        )}
        {payment.status === 'processing' || payment.status === 'pending' ? (
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 80, height: 80, borderRadius: '50%', background: `${C.warning}20`, marginBottom: 18 }}>
            <Spinner />
          </div>
        ) : null}
        {payment.status === 'failed' || payment.status === 'cancelled' ? (
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 80, height: 80, borderRadius: '50%', background: `${C.danger}20`, marginBottom: 18 }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M6 18L18 6M6 6l12 12" stroke={C.danger} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        ) : null}

        <h1 style={{ fontSize: 24, fontWeight: 700, color: C.text, margin: '0 0 10px' }}>
          {payment.status === 'paid' && 'Payment Successful'}
          {(payment.status === 'processing' || payment.status === 'pending') && 'Payment Processing'}
          {payment.status === 'failed' && 'Payment Failed'}
          {payment.status === 'cancelled' && 'Payment Cancelled'}
        </h1>
        <p style={{ color: C.textSecondary, margin: '0 0 8px', fontSize: 15 }}>{getStatusMessage()}</p>
        {payment.amount && (
          <p style={{ color: getStatusColor(), margin: '0 0 24px', fontSize: 18, fontWeight: 700 }}>
            ${Number(payment.amount).toFixed(2)}
          </p>
        )}
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/orders" style={{ padding: '12px 24px', background: C.primary, color: '#fff', textDecoration: 'none', borderRadius: 10, fontWeight: 600, fontSize: 15 }}>
            View Orders
          </Link>
          <Link to="/products" style={{ padding: '12px 24px', border: `1px solid ${C.border}`, color: C.text, textDecoration: 'none', borderRadius: 10, fontWeight: 600, background: C.surface, fontSize: 15 }}>
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  )
}
