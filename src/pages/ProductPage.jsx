import { useParams, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import ProductDetail from '../components/product/ProductDetail'
import allProducts from '../data/products.json'
import { useCart } from '../context/CartContext'
import { useRecentlyViewed } from '../context/RecentlyViewedContext'

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

  const product = allProducts.find(p => p.id === Number(id))

  // Track product view unconditionally
  useEffect(() => {
    if (product) {
      addRecentlyViewed(product)
    }
  }, [product?.id, addRecentlyViewed])

  if (!product) {
    return (
      <div style={{ minHeight: '100vh', background: C.background, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: 40, fontWeight: 800, color: C.text, margin: '0 0 16px' }}>Product Not Found</h1>
          <p style={{ fontSize: 16, color: C.textSecondary, margin: '0 0 24px' }}>The product you are looking for does not exist.</p>
          <button
            onClick={() => navigate('/products')}
            style={{
              padding: '12px 24px',
              borderRadius: 10,
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

  const relatedProducts = allProducts
    .filter(p => p.categoryId === product.categoryId && p.id !== product.id)
    .slice(0, 4)

  return (
    <div style={{ minHeight: '100vh', background: C.background }}>
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate(-1)}
          style={{
            marginBottom: 24,
            background: 'none',
            border: 'none',
            color: C.primary,
            fontWeight: 600,
            fontSize: 14,
            cursor: 'pointer',
            padding: 0
          }}
        >
          ← Back
        </button>
        <ProductDetail
          product={product}
          relatedProducts={relatedProducts}
          onAddToCart={addToCart}
        />
      </div>
    </div>
  )
}
