import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import ProductCard from './ProductCard.jsx'
import { useReviews } from '../../context/ReviewContext.jsx'

const C = {
  primary: '#4F46E5',
  primaryDark: '#4338CA',
  accent: '#F59E0B',
  surface: '#FFFFFF',
  background: '#F8FAFC',
  text: '#0F172A',
  textSecondary: '#475569',
  border: '#E2E8F0',
  success: '#16A34A',
  danger: '#DC2626',
  star: '#F59E0B',
  starEmpty: '#E2E8F0'
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

function StarRating({ rating = 0, count }) {
  const full = Math.round(rating)
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <div style={{ display: 'flex' }}>
        {[1, 2, 3, 4, 5].map((i) => (
          <svg key={i} width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M12 2l2.9 6.3 6.9.8-5.1 4.7 1.4 6.8L12 17.8 5.9 20.6l1.4-6.8L2.2 9.1l6.9-.8L12 2z"
              fill={i <= full ? C.star : C.starEmpty}
            />
          </svg>
        ))}
      </div>
      {typeof count === 'number' && (
        <span style={{ fontSize: 14, color: C.textSecondary }}>({count} reviews)</span>
      )}
    </div>
  )
}

function formatPrice(value) {
  return `$${Number(value).toFixed(2)}`
}

export default function ProductDetail({ product, onAddToCart, relatedProducts = [] }) {
  const isMobile = useMediaQuery('(max-width: 767px)')
  const [activeImage, setActiveImage] = useState(product?.image)
  const [quantity, setQuantity] = useState(1)
  const { getReviewsForProduct, addReview, getAverageRating, getReviewCount } = useReviews()
  const [reviews, setReviews] = useState(() => getReviewsForProduct(product?.id))
  const [reviewForm, setReviewForm] = useState({ reviewerName: '', rating: 5, text: '' })

  useEffect(() => {
    setActiveImage(product?.image)
    setQuantity(1)
    setReviews(getReviewsForProduct(product?.id))
  }, [product?.id, getReviewsForProduct])

  if (!product) return null

  const { name, price, originalPrice, categoryName, rating, reviewCount, image, description, specifications, stock } = product
  const gallery = product.images && product.images.length ? product.images : [image]
  const hasDiscount = originalPrice && Number(originalPrice) > Number(price)
  const discountPct = hasDiscount ? Math.round((1 - Number(price) / Number(originalPrice)) * 100) : 0
  const inStock = stock === undefined ? true : stock > 0
  const avgRating = getAverageRating(product.id)
  const totalReviews = getReviewCount(product.id)
  const displayRating = avgRating !== null ? avgRating : rating
  const displayReviewCount = totalReviews > 0 ? totalReviews : reviewCount

  const dec = () => setQuantity((q) => Math.max(1, q - 1))
  const inc = () => setQuantity((q) => Math.min(stock || 99, q + 1))

  const handleSubmitReview = (e) => {
    e.preventDefault()
    if (!reviewForm.text.trim()) return
    addReview(product.id, reviewForm)
    setReviews(getReviewsForProduct(product.id))
    setReviewForm({ reviewerName: '', rating: 5, text: '' })
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const StarRatingDisplay = ({ rating = 0, count, size = 18 }) => {
    const full = Math.round(rating)
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <div style={{ display: 'flex' }}>
          {[1, 2, 3, 4, 5].map((i) => (
            <svg key={i} width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M12 2l2.9 6.3 6.9.8-5.1 4.7 1.4 6.8L12 17.8 5.9 20.6l1.4-6.8L2.2 9.1l6.9-.8L12 2z"
                fill={i <= full ? C.star : C.starEmpty}
              />
            </svg>
          ))}
        </div>
        {typeof count === 'number' && (
          <span style={{ fontSize: 14, color: C.textSecondary }}>({count} reviews)</span>
        )}
      </div>
    )
  }

  return (
    <div style={{ padding: '24px 20px', maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: 32 }}>
        <div style={{ flex: '1 1 50%', minWidth: 0 }}>
          <div
            style={{
              aspectRatio: '1 / 1',
              borderRadius: 12,
              overflow: 'hidden',
              background: C.background,
              border: `1px solid ${C.border}`
            }}
          >
            <img src={activeImage} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 12, flexWrap: 'wrap' }}>
            {gallery.slice(0, 3).map((img, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setActiveImage(img)}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = 0.8)}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = 1)}
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: 10,
                  overflow: 'hidden',
                  padding: 0,
                  border: activeImage === img ? `2px solid ${C.primary}` : `1px solid ${C.border}`,
                  cursor: 'pointer',
                  background: C.surface,
                  opacity: 1,
                  transition: 'opacity .15s ease'
                }}
              >
                <img src={img} alt={`${name} ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </button>
            ))}
          </div>
        </div>

        <div style={{ flex: '1 1 50%', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>
          {categoryName && (
            <span style={{ fontSize: 13, fontWeight: 600, color: C.primary, textTransform: 'uppercase', letterSpacing: '.04em' }}>
              {categoryName}
            </span>
          )}
          <h1 style={{ margin: 0, fontSize: 30, fontWeight: 700, color: C.text, lineHeight: 1.2 }}>{name}</h1>
          <StarRatingDisplay rating={displayRating} count={displayReviewCount} />

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 30, fontWeight: 700, color: C.primary }}>{formatPrice(price)}</span>
            {hasDiscount && (
              <>
                <span style={{ fontSize: 16, color: C.textSecondary, textDecoration: 'line-through' }}>{formatPrice(originalPrice)}</span>
                <span style={{ background: C.accent, color: '#fff', fontSize: 12, fontWeight: 700, padding: '4px 10px', borderRadius: 9999 }}>
                  -{discountPct}%
                </span>
              </>
            )}
          </div>

          {description && <p style={{ margin: 0, fontSize: 15, color: C.textSecondary, lineHeight: 1.6 }}>{description}</p>}

          {specifications && Object.keys(specifications).length > 0 && (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14, marginTop: 4 }}>
              <tbody>
                {Object.entries(specifications).map(([k, v]) => (
                  <tr key={k} style={{ borderBottom: `1px solid ${C.border}` }}>
                    <td style={{ padding: '8px 0', color: C.textSecondary, fontWeight: 500, width: '40%' }}>{k}</td>
                    <td style={{ padding: '8px 0', color: C.text }}>{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          <div style={{ fontSize: 14, fontWeight: 600 }}>
            {inStock ? (
              <span style={{ color: C.success }}>In Stock</span>
            ) : (
              <span style={{ color: C.danger }}>Out of Stock</span>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 4 }}>
            <div style={{ display: 'flex', alignItems: 'center', border: `1px solid ${C.border}`, borderRadius: 8, overflow: 'hidden' }}>
              <button type="button" onClick={dec} disabled={!inStock} style={qtyBtn} aria-label="Decrease quantity">−</button>
              <input
                value={quantity}
                onChange={(e) => {
                  const v = parseInt(e.target.value, 10)
                  if (!isNaN(v)) setQuantity(Math.min(stock || 99, Math.max(1, v)))
                }}
                style={{ width: 48, textAlign: 'center', border: 'none', outline: 'none', fontSize: 15, color: C.text, padding: '10px 0' }}
                aria-label="Quantity"
              />
              <button type="button" onClick={inc} disabled={!inStock} style={qtyBtn} aria-label="Increase quantity">+</button>
            </div>

            <button
              type="button"
              disabled={!inStock}
              onClick={() => inStock && onAddToCart && onAddToCart(product, quantity)}
              style={{
                flex: 1,
                padding: '14px 20px',
                border: 'none',
                borderRadius: 8,
                background: inStock ? C.primary : C.border,
                color: inStock ? '#fff' : C.textSecondary,
                fontSize: 15,
                fontWeight: 600,
                cursor: inStock ? 'pointer' : 'not-allowed',
                transition: 'background .15s ease'
              }}
              onMouseEnter={(e) => { if (inStock) e.currentTarget.style.background = C.primaryDark }}
              onMouseLeave={(e) => { if (inStock) e.currentTarget.style.background = C.primary }}
            >
              {inStock ? 'Add to Cart' : 'Out of Stock'}
            </button>
          </div>
        </div>
      </div>

      {relatedProducts.length > 0 && (
        <div style={{ marginTop: 48 }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: C.text, margin: '0 0 20px' }}>Related Products</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 20 }}>
            {relatedProducts.slice(0, 4).map((p) => (
              <ProductCard key={p.id} product={p} onAddToCart={onAddToCart} />
            ))}
          </div>
        </div>
      )}

      <div style={{ marginTop: 48 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: C.text, margin: '0 0 20px' }}>Customer Reviews</h2>

        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20, marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 36, fontWeight: 800, color: C.primary }}>
                {displayRating.toFixed(1)}
              </div>
              <StarRatingDisplay rating={displayRating} count={null} size={20} />
              <div style={{ fontSize: 13, color: C.textSecondary, marginTop: 4 }}>
                {displayReviewCount} review{displayReviewCount !== 1 ? 's' : ''}
              </div>
            </div>
          </div>

          {reviews.length === 0 && (
            <p style={{ color: C.textSecondary, margin: 0 }}>No reviews yet. Be the first to review this product!</p>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {reviews.map((r) => (
              <div key={r.id} style={{ borderBottom: `1px solid ${C.border}`, paddingBottom: 16, marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 36,
                      height: 36,
                      borderRadius: '50%',
                      background: C.primary,
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: 14
                    }}>
                      {r.reviewerName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, color: C.text, fontSize: 14 }}>{r.reviewerName}</div>
                      <div style={{ fontSize: 12, color: C.textSecondary }}>{formatDate(r.date)}</div>
                    </div>
                  </div>
                  <StarRatingDisplay rating={r.rating} count={null} size={14} />
                </div>
                <p style={{ margin: 0, fontSize: 14, color: C.textSecondary, lineHeight: 1.6 }}>{r.text}</p>
              </div>
            ))}
          </div>
        </div>

        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20 }}>
          <h3 style={{ margin: '0 0 16px', fontSize: 18, fontWeight: 700, color: C.text }}>Write a Review</h3>
          <form onSubmit={handleSubmitReview}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={labelStyle}>Your Name</label>
                <input
                  style={inputStyle}
                  value={reviewForm.reviewerName}
                  onChange={(e) => setReviewForm((f) => ({ ...f, reviewerName: e.target.value }))}
                  placeholder="Enter your name"
                  required
                />
              </div>
              <div>
                <label style={labelStyle}>Rating</label>
                <select
                  style={inputStyle}
                  value={reviewForm.rating}
                  onChange={(e) => setReviewForm((f) => ({ ...f, rating: Number(e.target.value) }))}
                >
                  <option value="5">5 - Excellent</option>
                  <option value="4">4 - Good</option>
                  <option value="3">3 - Average</option>
                  <option value="2">2 - Poor</option>
                  <option value="1">1 - Terrible</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Review</label>
                <textarea
                  style={{ ...inputStyle, minHeight: 100, resize: 'vertical' }}
                  value={reviewForm.text}
                  onChange={(e) => setReviewForm((f) => ({ ...f, text: e.target.value }))}
                  placeholder="Share your experience with this product"
                  required
                />
              </div>
              <button
                type="submit"
                style={{
                  padding: '12px 24px',
                  border: 'none',
                  borderRadius: 8,
                  background: C.primary,
                  color: '#fff',
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'background .15s ease'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = C.primaryDark)}
                onMouseLeave={(e) => (e.currentTarget.style.background = C.primary)}
              >
                Submit Review
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

const labelStyle = { display: 'block', fontSize: 13, fontWeight: 600, color: C.textSecondary, marginBottom: 6 }
const inputStyle = {
  width: '100%',
  boxSizing: 'border-box',
  padding: '10px 12px',
  borderRadius: 8,
  border: `1px solid ${C.border}`,
  background: C.surface,
  color: C.text,
  fontSize: 14,
  outline: 'none'
}

const qtyBtn = {
  width: 42,
  height: 42,
  border: 'none',
  background: 'transparent',
  color: C.text,
  fontSize: 18,
  cursor: 'pointer'
}
