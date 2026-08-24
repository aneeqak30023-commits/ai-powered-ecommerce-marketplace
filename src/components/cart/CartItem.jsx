import { useEffect, useState } from 'react'

const C = {
  primary: '#4F46E5',
  primaryDark: '#4338CA',
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
    setMatches(mql.matches)
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
        gap: 14,
        padding: 16,
        borderBottom: `1px solid ${C.border}`,
        flexWrap: isMobile ? 'wrap' : 'nowrap'
      }}
    >
      <img
        src={image}
        alt={name}
        style={{ width: 80, height: 80, borderRadius: 8, objectFit: 'cover', flex: '0 0 auto', background: C.surface }}
      />

      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
          <span style={{ fontSize: 15, fontWeight: 600, color: C.text }}>{name}</span>
          <button
            type="button"
            onClick={() => onRemove && onRemove(id)}
            aria-label={`Remove ${name}`}
            style={{ border: 'none', background: 'transparent', color: C.textSecondary, cursor: 'pointer', flex: '0 0 auto', padding: 2 }}
          >
            <CloseIcon />
          </button>
        </div>
        <span style={{ fontSize: 14, color: C.textSecondary }}>{formatPrice(price)}</span>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginTop: 4, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', border: `1px solid ${C.border}`, borderRadius: 8, overflow: 'hidden' }}>
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
                if (!isNaN(v) && v > 0) onUpdateQuantity && onUpdateQuantity(id, v)
              }}
              style={{ width: 44, textAlign: 'center', border: 'none', outline: 'none', fontSize: 14, color: C.text, padding: '8px 0' }}
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

          <span style={{ fontSize: 15, fontWeight: 700, color: C.text }}>{formatPrice(lineTotal)}</span>
        </div>
      </div>
    </div>
  )
}

const qtyBtn = {
  width: 36,
  height: 36,
  border: 'none',
  background: 'transparent',
  color: C.text,
  fontSize: 16,
  cursor: 'pointer'
}
