import { Link } from 'react-router-dom'
import ProductCard from '../product/ProductCard.jsx'
import productsData from '../../data/products.json'

const C = {
  primary: '#4F46E5',
  text: '#0F172A',
  surface: '#FFFFFF'
}

export default function FeaturedProducts({ allProducts, onAddToCart }) {
  const products = (allProducts && allProducts.length ? allProducts : productsData || []).slice(0, 8)

  return (
    <section style={{ padding: '32px 20px', maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <h2 style={{ fontSize: 24, fontWeight: 700, color: C.text, margin: 0 }}>Featured Products</h2>
        <Link to="/products" style={{ color: C.primary, textDecoration: 'none', fontWeight: 600, fontSize: 14 }}>
          View All
        </Link>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 20 }}>
        {products.map((product) => (
          <ProductCard key={product.id} product={product} onAddToCart={onAddToCart} />
        ))}
      </div>
    </section>
  )
}
