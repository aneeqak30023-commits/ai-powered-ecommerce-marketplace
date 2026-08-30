import { useEffect, useState } from 'react'
import ProductCard from './ProductCard.jsx'
import { useReviews } from '../../context/ReviewContext.jsx'
import { useWishlist } from '../../context/WishlistContext.jsx'

const C = {
  primary: '#6366F1',
  primaryDark: '#4F46E5',
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

function formatPrice(value) {
  return `$${Number(value).toFixed(2)}`
}

export default function ProductDetail({ product, onAddToCart, relatedProducts = [] }) {
  const isMobile = useMediaQuery('(max-width: 767px)')
  const [activeImage, setActiveImage] = useState(product?.image)
  const [quantity, setQuantity] = useState(1)
  const [specsOpen, setSpecsOpen] = useState(true)
  const { getReviewsForProduct, addReview, getAverageRating, getReviewCount } = useReviews()
  const { toggleWishlist } = useWishlist()
  const [reviews, setReviews] = useState(() => getReviewsForProduct(product?.id))
  const [reviewForm, setReviewForm] = useState({ reviewerName: '', rating: 5, text: '' })

  useEffect(() => {
    setActiveImage(product?.image)
    setQuantity(1)
    setReviews(getReviewsForProduct(product?.id))
  }, [product?.id, product?.image, getReviewsForProduct])

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
    <div style={{ maxWidth: 1280, margin: '0 auto' }}>
      <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: 48 }}>
        {/* Left: Image Gallery */}
        <div style={{ flex: '1 1 55%', minWidth: 0 }}>
          <div style={{ borderRadius: 24, overflow: 'hidden', background: '#F8FAFC', border: `1px solid ${C.border}` }}>
            <div style={{ aspectRatio: isMobile ? '1/1' : '4/3', overflow: 'hidden' }}>
              <img src={activeImage} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          </div>
          <div className="gallery-thumbnails" style={{ display: 'flex', gap: 12, marginTop: 16 }}>
            {gallery.slice(0, 4).map((img, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setActiveImage(img)}
                className={`gallery-thumb ${activeImage === img ? 'active' : ''}`}
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: 12,
                  overflow: 'hidden',
                  padding: 0,
                  border: activeImage === img ? `2px solid ${C.primary}` : `1px solid ${C.border}`,
                  cursor: 'pointer',
                  background: C.surface,
                  transition: 'border-color 0.2s ease'
                }}
              >
                <img src={img} alt={`${name} ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </button>
            ))}
          </div>

          {/* Specifications - Expandable */}
          {specifications && Object.keys(specifications).length > 0 && (
            <div style={{ marginTop: 32 }}>
              <button
                type="button"
                onClick={() => setSpecsOpen(!specsOpen)}
                className="expandable-header"
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '16px 0',
                  cursor: 'pointer',
                  background: 'transparent',
                  border: 'none',
                  borderBottom: `1px solid ${C.border}`
                }}
              >
                <span style={{ fontSize: 16, fontWeight: 600, color: C.text }}>Specifications</span>
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  style={{ transform: specsOpen ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s ease' }}
                >
                  <path d="M6 9l6 6 6-6" stroke={C.textSecondary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              {specsOpen && (
                <div style={{ padding: '16px 0' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                    <tbody>
                      {Object.entries(specifications).map(([k, v], idx) => (
                        <tr key={k} style={{ background: idx % 2 === 0 ? '#F8FAFC' : 'white' }}>
                          <td style={{ padding: '12px 16px', color: C.textSecondary, fontWeight: 500, width: '40%', borderTopLeftRadius: idx === 0 ? 8 : 0, borderBottomLeftRadius: idx === Object.keys(specifications).length - 1 ? 8 : 0 }}>{k}</td>
                          <td style={{ padding: '12px 16px', color: C.text, borderTopRightRadius: idx === 0 ? 8 : 0, borderBottomRightRadius: idx === Object.keys(specifications).length - 1 ? 8 : 0 }}>{v}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right: Sticky Product Info */}
        <div className="sticky-sidebar" style={{ flex: '1 1 45%', minWidth: 0, position: 'sticky', top: 100 }}>
          <div style={{ background: C.surface, borderRadius: 20, border: `1px solid ${C.border}`, padding: 28 }}>
            {categoryName && (
              <span style={{ fontSize: 12, fontWeight: 600, color: C.primary, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                {categoryName}
              </span>
            )}
            <h1 style={{ margin: '8px 0 12px', fontSize: 28, fontWeight: 700, color: C.text, lineHeight: 1.2, letterSpacing: '-0.02em' }}>{name}</h1>
            <StarRatingDisplay rating={displayRating} count={displayReviewCount} />

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '16px 0', flexWrap: 'wrap' }}>
              <span style={{ fontSize: 28, fontWeight: 700, color: C.primary }}>{formatPrice(price)}</span>
              {hasDiscount && (
                <>
                  <span style={{ fontSize: 16, color: C.textSecondary, textDecoration: 'line-through' }}>{formatPrice(originalPrice)}</span>
                  <span style={{ background: C.accent, color: '#fff', fontSize: 12, fontWeight: 700, padding: '4px 10px', borderRadius: 8 }}>
                    -{discountPct}%
                  </span>
                </>
              )}
            </div>

            {description && <p style={{ margin: '0 0 20px', fontSize: 14, color: C.textSecondary, lineHeight: 1.7 }}>{description}</p>}

            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 20 }}>
              {inStock ? (
                <span style={{ color: C.success, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: C.success, display: 'inline-block' }} />
                  In Stock
                </span>
              ) : (
                <span style={{ color: C.danger, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: C.danger, display: 'inline-block' }} />
                  Out of Stock
                </span>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', border: `1px solid ${C.border}`, borderRadius: 10, overflow: 'hidden', background: C.surface }}>
                <button type="button" onClick={dec} disabled={!inStock} style={qtyBtn} aria-label="Decrease quantity">−</button>
                <input
                  value={quantity}
                  onChange={(e) => {
                    const v = parseInt(e.target.value, 10)
                    if (!isNaN(v)) setQuantity(Math.min(stock || 99, Math.max(1, v)))
                  }}
                  style={{ width: 52, textAlign: 'center', border: 'none', outline: 'none', fontSize: 15, color: C.text, padding: '12px 0' }}
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
                  padding: '14px 24px',
                  border: 'none',
                  borderRadius: 12,
                  background: inStock ? C.primary : C.border,
                  color: inStock ? '#fff' : C.textSecondary,
                  fontSize: 15,
                  fontWeight: 600,
                  cursor: inStock ? 'pointer' : 'not-allowed',
                  transition: 'background 0.2s ease'
                }}
                onMouseEnter={(e) => { if (inStock) e.currentTarget.style.background = C.primaryDark }}
                onMouseLeave={(e) => { if (inStock) e.currentTarget.style.background = C.primary }}
              >
                {inStock ? 'Add to Cart' : 'Out of Stock'}
              </button>
            </div>

            <button
              type="button"
              onClick={() => toggleWishlist && toggleWishlist(product)}
              style={{
                width: '100%',
                marginTop: 12,
                padding: '12px 24px',
                border: `1px solid ${C.border}`,
                borderRadius: 12,
                background: 'transparent',
                color: C.textSecondary,
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = C.primary; e.currentTarget.style.color = C.primary }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.textSecondary }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
              Add to Wishlist
            </button>
          </div>
        </div>
      </div>

      {/* Related Products - Horizontal Scroll */}
      {relatedProducts.length > 0 && (
        <div style={{ marginTop: 64 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: C.text, margin: '0 0 20px', letterSpacing: '-0.02em' }}>Related Products</h2>
          <div className="scroll-row" style={{ display: 'flex', gap: 16, overflowX: 'auto', paddingBottom: 16 }}>
            {relatedProducts.slice(0, 6).map((p) => (
              <div key={p.id} style={{ width: 220, minWidth: 220 }}>
                <ProductCard product={p} onAddToCart={onAddToCart} onToggleWishlist={toggleWishlist} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reviews Section */}
      <div style={{ marginTop: 64 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: C.text, margin: '0 0 20px', letterSpacing: '-0.02em' }}>Customer Reviews</h2>

        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: 24, marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 24 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 48, fontWeight: 800, color: C.primary, lineHeight: 1 }}>
                {displayRating.toFixed(1)}
              </div>
              <StarRatingDisplay rating={displayRating} count={null} size={20} />
              <div style={{ fontSize: 13, color: C.textSecondary, marginTop: 6 }}>
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
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 40,
                      height: 40,
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
                <p style={{ margin: 0, fontSize: 14, color: C.textSecondary, lineHeight: 1.7 }}>{r.text}</p>
              </div>
            ))}
          </div>
        </div>

        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: 24 }}>
          <h3 style={{ margin: '0 0 18px', fontSize: 18, fontWeight: 700, color: C.text }}>Write a Review</h3>
          <form onSubmit={handleSubmitReview}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
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
                  borderRadius: 10,
                  background: C.primary,
                  color: '#fff',
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'background 0.2s ease'
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
  borderRadius: 10,
  border: `1px solid ${C.border}`,
  background: C.surface,
  color: C.text,
  fontSize: 14,
  outline: 'none'
}

const qtyBtn = {
  width: 44,
  height: 44,
  border: 'none',
  background: 'transparent',
  color: C.text,
  fontSize: 18,
  cursor: 'pointer'
}
