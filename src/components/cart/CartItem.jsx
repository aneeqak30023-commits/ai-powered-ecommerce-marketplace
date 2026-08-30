import { useEffect, useState } from 'react'

const C = {
  primary: '#6366F1',
  primaryDark: '#4F46E5',
  text: '#0F172A',
  textSecondary: '#475569',
  border: '#E2E8F0',
  surface: '#FFFFFF'
}

function useMediaQuery(query) {
  const [matches, setMatches] = useState(
    typeof window !== 'undefined' ? window.matchMedia(query).matches : false
  )
  useEffect(() => {
    const mql = window.matchMedia(query)
    const handler = (e) => setMatches(e.matches)
    mql.addEventListener('change', handler)
    return () => mql.removeEventListener('change', handler)
  }, [query])
  return matches
}

function CloseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function formatPrice(value) {
  return `$${Number(value).toFixed(2)}`
}

export default function CartItem({ item, onUpdateQuantity, onRemove }) {
  const isMobile = useMediaQuery('(max-width: 600px)')
  if (!item) return null

  const { id, name, price, image, quantity = 1 } = item
  const lineTotal = Number(price) * quantity

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 16,
        padding: '18px 20px',
        borderBottom: `1px solid ${C.border}`,
        flexWrap: isMobile ? 'wrap' : 'nowrap',
        transition: 'background 0.2s ease'
      }}
      onMouseEnter={(e) => { e.currentTarget.style.background = '#FAFBFC' }}
      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
    >
      <img
        src={image}
        alt={name}
        style={{ width: 88, height: 88, borderRadius: 12, objectFit: 'cover', flex: '0 0 auto', background: C.surface, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
      />

      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'flex-start' }}>
          <span style={{ fontSize: 15, fontWeight: 600, color: C.text, lineHeight: 1.4 }}>{name}</span>
          <button
            type="button"
            onClick={() => onRemove && onRemove(id)}
            aria-label={`Remove ${name}`}
            style={{
              border: 'none',
              background: 'transparent',
              color: C.textSecondary,
              cursor: 'pointer',
              flex: '0 0 auto',
              padding: 4,
              borderRadius: 6,
              transition: 'color 0.15s ease, background 0.15s ease'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = C.danger || '#DC2626'; e.currentTarget.style.background = '#FEE2E2' }}
            onMouseLeave={(e) => { e.currentTarget.style.color = C.textSecondary; e.currentTarget.style.background = 'transparent' }}
          >
            <CloseIcon />
          </button>
        </div>
        <span style={{ fontSize: 14, color: C.textSecondary, fontWeight: 500 }}>{formatPrice(price)}</span>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14, marginTop: 6, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', border: `1px solid ${C.border}`, borderRadius: 10, overflow: 'hidden', background: C.surface }}>
            <button
              type="button"
              onClick={() => onUpdateQuantity && onUpdateQuantity(id, Math.max(1, quantity - 1))}
              style={qtyBtn}
              aria-label="Decrease quantity"
            >
              −
            </button>
            <input
              value={quantity}
              onChange={(e) => {
                const v = parseInt(e.target.value, 10)
                if (!isNaN(v) && v > 0 && onUpdateQuantity) onUpdateQuantity(id, v)
              }}
              style={{ width: 48, textAlign: 'center', border: 'none', outline: 'none', fontSize: 14, color: C.text, padding: '10px 0' }}
              aria-label="Quantity"
            />
            <button
              type="button"
              onClick={() => onUpdateQuantity && onUpdateQuantity(id, quantity + 1)}
              style={qtyBtn}
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>

          <span style={{ fontSize: 16, fontWeight: 700, color: C.text }}>{formatPrice(lineTotal)}</span>
        </div>
      </div>
    </div>
  )
}

const qtyBtn = {
  width: 38,
  height: 38,
  border: 'none',
  background: 'transparent',
  color: C.text,
  fontSize: 16,
  cursor: 'pointer',
  transition: 'background 0.15s ease'
}
