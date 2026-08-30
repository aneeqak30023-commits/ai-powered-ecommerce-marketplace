import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useWishlist } from '../../context/WishlistContext.jsx'

const C = {
  primary: '#6366F1',
  primaryDark: '#4F46E5',
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
            <path d="M12 2l2.9 6.3 6.9.8-5.1 4.7 1.4 6.8L12 17.8 5.9 20.6l1.4-6.8L2.2 9.1l6.9-.8L12 2z" fill={i <= full ? C.star : C.starEmpty} />
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

export default function ProductCard({ product, onAddToCart, aiReason, aiScore, showCompare = false, onCompare, onToggleWishlist, showWishlistButton = true }) {
  const [hovered, setHovered] = useState(false)
  const { isInWishlist } = useWishlist()

  if (!product) return null

  const { name, price, originalPrice, categoryName, rating, reviewCount, image, stock, specifications } = product
  const hasDiscount = originalPrice && Number(originalPrice) > Number(price)
  const discountPct = hasDiscount
    ? Math.round((1 - Number(price) / Number(originalPrice)) * 100)
    : 0
  const outOfStock = stock !== undefined && stock <= 0
  const wishlisted = isInWishlist(product.id)

  const keySpecs = specifications ? Object.entries(specifications).slice(0, 2) : []

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: C.surface,
        borderRadius: 16,
        border: `1px solid ${C.border}`,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: hovered
          ? '0 20px 25px -5px rgba(0,0,0,0.05), 0 10px 10px -5px rgba(0,0,0,0.02)'
          : '0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)',
        transition: 'box-shadow .25s ease, transform .25s ease',
        transform: hovered ? 'translateY(-4px)' : 'none'
      }}
    >
      <Link to={`/products/${product.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
        <div style={{ position: 'relative', zIndex: 1, aspectRatio: '1 / 1', overflow: 'hidden', background: '#F8FAFC' }}>
          {categoryName && (
            <span
              style={{
                position: 'absolute',
                top: 12,
                left: 12,
                zIndex: 2,
                background: C.primary,
                color: '#fff',
                fontSize: 11,
                fontWeight: 600,
                padding: '4px 10px',
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
                top: 12,
                right: 12,
                zIndex: 2,
                background: C.accent,
                color: '#fff',
                fontSize: 11,
                fontWeight: 700,
                padding: '4px 10px',
                borderRadius: 9999
              }}
            >
              -{discountPct}%
            </span>
          )}
          {aiScore && (
            <span
              style={{
                position: 'absolute',
                bottom: 12,
                right: 12,
                zIndex: 2,
                background: 'rgba(255,255,255,0.95)',
                backdropFilter: 'blur(8px)',
                color: C.primary,
                fontSize: 11,
                fontWeight: 700,
                padding: '4px 10px',
                borderRadius: 9999,
                border: '1px solid rgba(99,102,241,0.15)'
              }}
            >
              AI Match: {aiScore}%
            </span>
          )}
          {showWishlistButton && onToggleWishlist && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                onToggleWishlist(product)
              }}
              aria-label="Toggle wishlist"
              style={{
                position: 'absolute',
                bottom: 12,
                left: 12,
                zIndex: 2,
                width: 36,
                height: 36,
                borderRadius: '50%',
                border: 'none',
                background: '#FFFFFF',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                color: '#EF4444',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'transform .15s ease'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.1)' }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)' }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill={wishlisted ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            </button>
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

        <div style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 10, flexGrow: 1 }}>
          <h3
            style={{
              margin: 0,
              fontSize: 15,
              fontWeight: 600,
              color: C.text,
              lineHeight: 1.4,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden'
            }}
          >
            {name}
          </h3>

          <StarRating rating={rating} count={reviewCount} />

          {keySpecs.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {keySpecs.map(([key, value]) => (
                <span key={key} style={{ fontSize: 12, color: C.textSecondary }}>
                  <span style={{ fontWeight: 600, color: C.text }}>{key}:</span> {value}
                </span>
              ))}
            </div>
          )}

          {aiReason && (
            <div style={{
              padding: '8px 12px',
              borderRadius: 8,
              background: C.primaryLight,
              border: '1px solid rgba(99,102,241,0.1)',
              fontSize: 12,
              color: C.primaryDark,
              lineHeight: 1.5
            }}>
              <span style={{ fontWeight: 700 }}>AI: </span>{aiReason}
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginTop: 4 }}>
            <span style={{ fontSize: 20, fontWeight: 700, color: C.primary }}>{formatPrice(price)}</span>
            {hasDiscount && (
              <span style={{ fontSize: 14, color: C.textSecondary, textDecoration: 'line-through' }}>
                {formatPrice(originalPrice)}
              </span>
            )}
          </div>
        </div>
      </Link>

      <div style={{ padding: '0 18px 18px', display: 'flex', gap: 8 }}>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            if (!outOfStock && onAddToCart) onAddToCart(product)
          }}
          disabled={outOfStock}
          style={{
            flex: 1,
            padding: '10px 12px',
            border: 'none',
            borderRadius: 10,
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
        {showCompare && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              if (onCompare) onCompare(product)
            }}
            style={{
              padding: '10px 14px',
              border: `1px solid ${C.border}`,
              borderRadius: 10,
              background: C.surface,
              color: C.textSecondary,
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all .15s ease'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = C.primary; e.currentTarget.style.color = C.primary }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.textSecondary }}
          >
            Compare
          </button>
        )}
      </div>
    </div>
  )
}
