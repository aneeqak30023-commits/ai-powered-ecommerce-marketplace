import { useParams, useNavigate, Link } from 'react-router-dom'
import ProductDetail from '../components/product/ProductDetail'
import allProducts from '../data/products.json'
import { useCart } from '../context/CartContext'

export default function ProductPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addToCart } = useCart()

  const product = allProducts.find(p => p.id === Number(id))

  if (!product) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-[#0F172A] mb-4">Product Not Found</h1>
          <p className="text-[#475569] mb-6">The product you are looking for does not exist.</p>
          <Link
            to="/products"
            className="inline-block bg-[#4F46E5] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#4338CA] transition-colors"
          >
            Browse Products
          </Link>
        </div>
      </div>
    )
  }

  const relatedProducts = allProducts
    .filter(p => p.categoryId === product.categoryId && p.id !== product.id)
    .slice(0, 4)

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 text-[#4F46E5] hover:text-[#4338CA] font-medium"
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
