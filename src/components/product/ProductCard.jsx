import { useState } from 'react'
import { Link } from 'react-router-dom'

const C = {
  primary: '#4F46E5',
  primaryDark: '#4338CA',
  accent: '#F59E0B',
  surface: '#FFFFFF',
  text: '#0F172A',
  textSecondary: '#475569',
  border: '#E2E8F0',
  star: '#F59E0B',
  starEmpty: '#E2E8F0'
}

function StarRating({ rating = 0, count }) {
  const full = Math.round(rating)
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
      <div style={{ display: 'flex' }}>
        {[1, 2, 3, 4, 5].map((i) => (
          <svg key={i} width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M12 2l2.9 6.3 6.9.8-5.1 4.7 1.4 6.8L12 17.8 5.9 20.6l1.4-6.8L2.2 9.1l6.9-.8L12 2z"
              fill={i <= full ? C.star : C.starEmpty}
            />
          </svg>
        ))}
      </div>
      {typeof count === 'number' && (
        <span style={{ fontSize: 12, color: C.textSecondary }}>({count})</span>
      )}
    </div>
  )
}

function formatPrice(value) {
  return `$${Number(value).toFixed(2)}`
}

export default function ProductCard({ product, onAddToCart }) {
  const [hovered, setHovered] = useState(false)

  if (!product) return null

  const { name, price, originalPrice, categoryName, rating, reviewCount, image, stock } = product
  const hasDiscount = originalPrice && Number(originalPrice) > Number(price)
  const discountPct = hasDiscount
    ? Math.round((1 - Number(price) / Number(originalPrice)) * 100)
    : 0
  const outOfStock = stock !== undefined && stock <= 0

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: C.surface,
        borderRadius: 12,
        border: `1px solid ${C.border}`,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: hovered
          ? '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.06)'
          : '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)',
        transition: 'box-shadow .2s ease, transform .2s ease',
        transform: hovered ? 'translateY(-2px)' : 'none'
      }}
    >
      <Link to={`/products/${product.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
        <div style={{ position: 'relative', aspectRatio: '1 / 1', overflow: 'hidden', background: C.surface }}>
          {categoryName && (
            <span
              style={{
                position: 'absolute',
                top: 10,
                left: 10,
                zIndex: 2,
                background: C.primary,
                color: '#fff',
                fontSize: 11,
                fontWeight: 600,
                padding: '3px 8px',
                borderRadius: 9999,
                textTransform: 'uppercase',
                letterSpacing: '.03em'
              }}
            >
              {categoryName}
            </span>
          )}
          {hasDiscount && (
            <span
              style={{
                position: 'absolute',
                top: 10,
                right: 10,
                zIndex: 2,
                background: C.accent,
                color: '#fff',
                fontSize: 11,
                fontWeight: 700,
                padding: '3px 8px',
                borderRadius: 9999
              }}
            >
              -{discountPct}%
            </span>
          )}
          <img
            src={image}
            alt={name}
            loading="lazy"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transition: 'transform .3s ease',
              transform: hovered ? 'scale(1.05)' : 'scale(1)'
            }}
          />
        </div>

        <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 8, flexGrow: 1 }}>
          <h3
            style={{
              margin: 0,
              fontSize: 15,
              fontWeight: 600,
              color: C.text,
              lineHeight: 1.3,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              minHeight: 39
            }}
          >
            {name}
          </h3>

          <StarRating rating={rating} count={reviewCount} />

          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 2 }}>
            <span style={{ fontSize: 18, fontWeight: 700, color: C.primary }}>{formatPrice(price)}</span>
            {hasDiscount && (
              <span
                style={{
                  fontSize: 13,
                  color: C.textSecondary,
                  textDecoration: 'line-through'
                }}
              >
                {formatPrice(originalPrice)}
              </span>
            )}
          </div>
        </div>
      </Link>

      <div style={{ padding: '0 16px 16px' }}>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            !outOfStock && onAddToCart && onAddToCart(product)
          }}
          disabled={outOfStock}
          style={{
            marginTop: 'auto',
            width: '100%',
            padding: '10px 12px',
            border: 'none',
            borderRadius: 8,
            background: outOfStock ? C.border : C.primary,
            color: outOfStock ? C.textSecondary : '#fff',
            fontSize: 14,
            fontWeight: 600,
            cursor: outOfStock ? 'not-allowed' : 'pointer',
            transition: 'background .15s ease'
          }}
          onMouseEnter={(e) => { if (!outOfStock) e.currentTarget.style.background = C.primaryDark }}
          onMouseLeave={(e) => { if (!outOfStock) e.currentTarget.style.background = C.primary }}
        >
          {outOfStock ? 'Out of Stock' : 'Add to Cart'}
        </button>
      </div>
    </div>
  )
}
