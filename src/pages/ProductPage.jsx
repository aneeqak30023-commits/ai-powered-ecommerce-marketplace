import { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import ProductDetail from '../components/product/ProductDetail.jsx'
import { useCart } from '../context/CartContext.jsx'
import { useRecentlyViewed } from '../context/RecentlyViewedContext.jsx'
import { fetchProduct, fetchProducts } from '../services/productApi.js'

const C = {
  primary: '#6366F1',
  primaryDark: '#4F46E5',
  surface: '#FFFFFF',
  background: '#F8FAFC',
  text: '#0F172A',
  textSecondary: '#475569',
  border: '#E2E8F0'
}

export default function ProductPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addToCart } = useCart()
  const { addRecentlyViewed } = useRecentlyViewed()

  const [product, setProduct] = useState(null)
  const [allProducts, setAllProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    Promise.all([
      fetchProduct(Number(id)),
      fetchProducts(),
    ])
      .then(([productData, allData]) => {
        if (!cancelled) {
          setProduct(productData)
          setAllProducts(allData)
          setLoading(false)
          if (productData) {
            addRecentlyViewed(productData)
          }
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message || 'Failed to load product')
          setLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [id, addRecentlyViewed])

  const relatedProducts = useMemo(() => {
    if (!product) return []
    return allProducts
      .filter(p => p.categoryId === product.categoryId && p.id !== product.id)
      .slice(0, 6)
  }, [allProducts, product])

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: C.background, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: C.textSecondary, fontSize: 15 }}>Loading product...</p>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div style={{ minHeight: '100vh', background: C.background, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: 40, fontWeight: 800, color: C.text, margin: '0 0 16px' }}>Product Not Found</h1>
          <p style={{ fontSize: 16, color: C.textSecondary, margin: '0 0 24px' }}>
            {error || 'The product you are looking for does not exist.'}
          </p>
          <button
            onClick={() => navigate('/products')}
            style={{
              padding: '12px 24px',
              borderRadius: 12,
              border: 'none',
              background: `linear-gradient(135deg, ${C.primary} 0%, ${C.primaryDark} 100%)`,
              color: '#fff',
              fontWeight: 600,
              fontSize: 14,
              cursor: 'pointer'
            }}
          >
            Browse Products
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: C.background }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '24px' }}>
        {/* Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24, fontSize: 13, color: C.textSecondary }}>
          <button
            onClick={() => navigate('/')}
            style={{ background: 'none', border: 'none', color: C.textSecondary, cursor: 'pointer', padding: 0, fontSize: 13 }}
            onMouseEnter={(e) => e.currentTarget.style.color = C.primary}
            onMouseLeave={(e) => e.currentTarget.style.color = C.textSecondary}
          >
            Home
          </button>
          <span>/</span>
          <button
            onClick={() => navigate('/products')}
            style={{ background: 'none', border: 'none', color: C.textSecondary, cursor: 'pointer', padding: 0, fontSize: 13 }}
            onMouseEnter={(e) => e.currentTarget.style.color = C.primary}
            onMouseLeave={(e) => e.currentTarget.style.color = C.textSecondary}
          >
            Products
          </button>
          <span>/</span>
          <span style={{ color: C.text }}>{product.name}</span>
        </div>

        <ProductDetail
          product={product}
          relatedProducts={relatedProducts}
          onAddToCart={addToCart}
        />
      </div>
    </div>
  )
}
