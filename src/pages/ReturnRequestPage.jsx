import { useState, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { useReturns, RETURN_REASONS } from '../context/ReturnContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'

const C = {
  primary: '#6366F1',
  primaryDark: '#4F46E5',
  surface: '#FFFFFF',
  background: '#F8FAFC',
  text: '#0F172A',
  textSecondary: '#475569',
  border: '#E2E8F0',
  danger: '#DC2626',
  success: '#16A346',
  warning: '#D97706',
  info: '#2563EB'
}

function formatPrice(value) {
  return `$${Number(value || 0).toFixed(2)}`
}

const CONDITION_OPTIONS = [
  { value: 'new_with_tags', label: 'New with tags' },
  { value: 'like_new', label: 'Like new' },
  { value: 'good', label: 'Good' },
  { value: 'fair', label: 'Fair' },
  { value: 'damaged', label: 'Damaged' },
  { value: 'defective', label: 'Defective' },
]

export default function ReturnRequestPage() {
  const { id, orderNumber: orderNumberParam } = useParams()
  const navigate = useNavigate()
  const { checkReturnEligibility, createReturn, getReturnById, getReturnByOrderId, backendAvailable } = useReturns()
  const { user } = useAuth()

  const [loading, setLoading] = useState(true)
  const [eligibility, setEligibility] = useState(null)
  const [selectedItems, setSelectedItems] = useState({})
  const [globalReason, setGlobalReason] = useState('')
  const [globalDescription, setGlobalDescription] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [existingReturn, setExistingReturn] = useState(null)

  useEffect(() => {
    async function load() {
      if (!backendAvailable || !user?.userId) {
        setLoading(false)
        return
      }

      if (id) {
        const ret = getReturnById(id)
        if (ret) {
          setExistingReturn(ret)
          setLoading(false)
          return
        }
      }

      if (orderNumberParam) {
        const existing = getReturnByOrderId(orderNumberParam)
        if (existing) {
          setExistingReturn(existing)
          setLoading(false)
          return
        }

        const result = await checkReturnEligibility(orderNumberParam)
        if (result.eligible) {
          setEligibility(result)
        } else {
          setError(result.reason)
        }
      }

      setLoading(false)
    }

    load()
  }, [id, orderNumberParam, checkReturnEligibility, getReturnById, getReturnByOrderId, backendAvailable, user])

  const handleQuantityChange = (orderItemId, quantity) => {
    const qty = Math.max(1, parseInt(quantity, 10) || 1)
    setSelectedItems(prev => ({
      ...prev,
      [orderItemId]: { ...prev[orderItemId], quantity: qty },
    }))
  }

  const handleConditionChange = (orderItemId, condition) => {
    setSelectedItems(prev => ({
      ...prev,
      [orderItemId]: { ...prev[orderItemId], condition },
    }))
  }

  const handleItemSelect = (orderItemId, item, checked) => {
    if (checked) {
      setSelectedItems(prev => ({
        ...prev,
        [orderItemId]: {
          quantity: 1,
          condition: 'like_new',
          reason: null,
          item,
        },
      }))
    } else {
      const next = { ...selectedItems }
      delete next[orderItemId]
      setSelectedItems(next)
    }
  }

  const handleSubmit = async (ev) => {
    ev.preventDefault()
    if (!globalReason) {
      setError('Please select a reason')
      return
    }

    const items = Object.entries(selectedItems).map(([orderItemId, data]) => ({
      orderItemId,
      quantity: data.quantity,
      condition: data.condition,
      reason: data.reason || globalReason,
    }))

    if (items.length === 0) {
      setError('Please select at least one item to return')
      return
    }

    setSubmitting(true)
    setError('')

    try {
      const result = await createReturn({
        orderNumber: orderNumberParam,
        items,
        reason: globalReason,
        description: globalDescription.trim() || undefined,
      })

      if (result.success) {
        navigate(`/returns/${result.return.id}`)
      } else {
        setError(result.error)
      }
    } catch (err) {
      setError(err.message || 'Failed to submit return request')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <div style={{ padding: 40, textAlign: 'center', color: C.textSecondary }}>Loading...</div>
  }

  if (existingReturn) {
    return (
      <div style={{ minHeight: '100vh', background: C.background }}>
        <div className="container mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12">
          <h1 style={{ fontSize: 24, fontWeight: 700, color: C.text, marginBottom: 8 }}>Return Request</h1>
          <p style={{ color: C.textSecondary, marginBottom: 16 }}>Order #{existingReturn.orderNumber}</p>
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: 24 }}>
            <h2 style={{ fontSize: 16, fontWeight: 600, color: C.text, marginBottom: 12 }}>Status: <span style={{
              padding: '4px 10px',
              borderRadius: 6,
              fontSize: 12,
              fontWeight: 600,
              background: existingReturn.status === 'requested' ? '#FEF3C7' :
                         existingReturn.status === 'approved' ? '#DBEAFE' :
                         existingReturn.status === 'rejected' ? '#FEE2E2' :
                         existingReturn.status === 'returned' ? '#E0E7FF' :
                         existingReturn.status === 'refunded' ? '#D1FAE5' : '#F3F4F6',
              color: existingReturn.status === 'requested' ? '#92400E' :
                     existingReturn.status === 'approved' ? '#1E40AF' :
                     existingReturn.status === 'rejected' ? '#991B1B' :
                     existingReturn.status === 'returned' ? '#3730A3' :
                     existingReturn.status === 'refunded' ? '#065F46' : '#6B7280'
            }}>{existingReturn.status}</span></h2>
            <p style={{ color: C.textSecondary, fontSize: 14, marginBottom: 8 }}>Reason: {globalReason || existingReturn.reason}</p>
            {existingReturn.description && <p style={{ color: C.textSecondary, fontSize: 14 }}>Details: {existingReturn.description}</p>}
          </div>
          <Link to="/orders" style={{ display: 'inline-block', marginTop: 24, padding: '10px 20px', background: C.primary, color: '#fff', textDecoration: 'none', borderRadius: 8, fontWeight: 600, fontSize: 14 }}>
            Back to Orders
          </Link>
        </div>
      </div>
    )
  }

  if (!backendAvailable) {
    return (
      <div style={{ minHeight: '100vh', background: C.background }}>
        <div className="container mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12">
          <div style={{ background: `${C.danger}10`, border: `1px solid ${C.danger}30`, borderRadius: 12, padding: 16, color: C.danger, fontSize: 14, marginBottom: 20 }}>
            Return requests require a connection to the server.
          </div>
          <Link to="/orders" style={{ display: 'inline-block', padding: '10px 20px', background: C.primary, color: '#fff', textDecoration: 'none', borderRadius: 8, fontWeight: 600, fontSize: 14 }}>
            Back to Orders
          </Link>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ minHeight: '100vh', background: C.background }}>
        <div className="container mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12">
          <div style={{ background: `${C.danger}10`, border: `1px solid ${C.danger}30`, borderRadius: 12, padding: 16, color: C.danger, fontSize: 14, marginBottom: 20 }}>
            {error}
          </div>
          <Link to="/orders" style={{ display: 'inline-block', padding: '10px 20px', background: C.primary, color: '#fff', textDecoration: 'none', borderRadius: 8, fontWeight: 600, fontSize: 14 }}>
            Back to Orders
          </Link>
        </div>
      </div>
    )
  }

  if (!eligibility) {
    return null
  }

  return (
    <div style={{ minHeight: '100vh', background: C.background }}>
      <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: C.text, margin: 0 }}>Request Return</h1>
          <Link to="/orders" style={{ padding: '10px 20px', border: `1px solid ${C.border}`, color: C.text, textDecoration: 'none', borderRadius: 8, fontWeight: 600, background: C.surface, fontSize: 14 }}>
            Back to Orders
          </Link>
        </div>

        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: 24, marginBottom: 24, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)' }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: C.text, margin: '0 0 12px' }}>Order #{eligibility.orderNumber}</h2>
          <p style={{ fontSize: 14, color: C.textSecondary, margin: '4px 0' }}>Order total: {formatPrice(eligibility.totalAmount)}</p>
          <p style={{ fontSize: 14, color: C.textSecondary, margin: 4 }}>Return window: {30} days from delivery</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: 24, marginBottom: 24, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)' }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: C.text, margin: '0 0 16px' }}>Return Reason</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
              {RETURN_REASONS.map((reason) => (
                <label key={reason.value} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, border: `1px solid ${globalReason === reason.value ? C.primary : C.border}`, borderRadius: 10, cursor: 'pointer', transition: 'border-color 0.2s ease' }}>
                  <input type="radio" name="reason" value={reason.value} checked={globalReason === reason.value} onChange={(e) => setGlobalReason(e.target.value)} style={{ accentColor: C.primary }} />
                  <span style={{ fontSize: 14, color: C.text }}>{reason.label}</span>
                </label>
              ))}
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: C.textSecondary, marginBottom: 6 }}>
                Additional Details (Optional)
              </label>
              <textarea
                value={globalDescription}
                onChange={(e) => setGlobalDescription(e.target.value)}
                placeholder="Please describe the issue..."
                rows={3}
                style={{ width: '100%', boxSizing: 'border-box', padding: '10px 14px', borderRadius: 10, border: `1px solid ${C.border}`, background: C.surface, color: C.text, fontSize: 14, outline: 'none', resize: 'vertical' }}
              />
            </div>
          </div>

          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: 24, marginBottom: 24, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)' }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: C.text, margin: '0 0 16px' }}>Items to Return</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {eligibility.returnableItems.map((item) => {
                const isSelected = !!selectedItems[item.orderItemId]
                return (
                  <div key={item.orderItemId} style={{ display: 'flex', gap: 16, alignItems: 'center', padding: 12, border: `1px solid ${C.border}`, borderRadius: 12, boxSizing: 'border-box' }}>
                    <input type="checkbox" checked={isSelected} onChange={(e) => handleItemSelect(item.orderItemId, item, e.target.checked)} style={{ accentColor: C.primary, width: 18, height: 18, flexShrink: 0 }} />
                    <img src={item.productImage} alt={item.productName} style={{ width: 56, height: 56, objectFit: 'cover', borderRadius: 8, background: C.background }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontWeight: 600, color: C.text, margin: '0 0 4px', fontSize: 14 }}>{item.productName}</p>
                      <p style={{ fontSize: 13, color: C.textSecondary, margin: 0 }}>Unit price: {formatPrice(item.unitPrice)}</p>
                      <p style={{ fontSize: 13, color: C.textSecondary, margin: '2px 0 0' }}>Returnable: {item.returnableQuantity}</p>
                    </div>
                    {isSelected && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minWidth: 120 }}>
                        <input
                          type="number"
                          min="1"
                          max={item.returnableQuantity}
                          value={selectedItems[item.orderItemId]?.quantity || 1}
                          onChange={(e) => handleQuantityChange(item.orderItemId, e.target.value)}
                          style={{ padding: '8px 10px', border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 14, background: C.surface, color: C.text, outline: 'none' }}
                        />
                        <select
                          value={selectedItems[item.orderItemId]?.condition || 'like_new'}
                          onChange={(e) => handleConditionChange(item.orderItemId, e.target.value)}
                          style={{ padding: '8px 10px', border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 13, background: C.surface, color: C.text, outline: 'none' }}
                        >
                          {CONDITION_OPTIONS.map(c => (
                            <option key={c.value} value={c.value}>{c.label}</option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {error && <p style={{ color: C.danger, fontSize: 14, marginBottom: 16 }}>{error}</p>}

          <button
            type="submit"
            disabled={submitting || Object.keys(selectedItems).length === 0}
            style={{
              width: '100%',
              padding: '14px 24px',
              border: 'none',
              borderRadius: 12,
              background: C.primary,
              color: '#fff',
              fontSize: 16,
              fontWeight: 700,
              cursor: submitting || Object.keys(selectedItems).length === 0 ? 'not-allowed' : 'pointer',
              opacity: submitting || Object.keys(selectedItems).length === 0 ? 0.6 : 1,
              transition: 'background 0.2s ease, transform 0.15s ease'
            }}
          >
            {submitting ? 'Submitting...' : 'Submit Return Request'}
          </button>
        </form>
      </div>
    </div>
  )
}
