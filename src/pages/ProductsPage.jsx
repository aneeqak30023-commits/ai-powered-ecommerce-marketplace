import { useState, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import ProductGrid from '../components/product/ProductGrid'
import ProductFilters from '../components/product/ProductFilters'
import allProducts from '../data/products.json'
import allCategories from '../data/categories.json'
import { useCart } from '../context/CartContext'

const C = {
  primary: '#6366F1',
  primaryDark: '#4F46E5',
  primaryLight: '#EEF2FF',
  surface: '#FFFFFF',
  background: '#F8FAFC',
  text: '#0F172A',
  textSecondary: '#475569',
  border: '#E2E8F0'
}

export default function ProductsPage() {
  const [searchParams] = useSearchParams()
  const searchFromUrl = searchParams.get('search') || ''
  const categoryFromUrl = searchParams.get('category') || ''

  const [searchQuery, setSearchQuery] = useState(searchFromUrl)
  const [selectedCategory, setSelectedCategory] = useState(categoryFromUrl)
  const [priceRange, setPriceRange] = useState([0, 10000])
  const [sortBy, setSortBy] = useState('id')
  const { addToCart } = useCart()

  const filteredProducts = useMemo(() => {
    let result = [...allProducts]

    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      result = result.filter(p => {
        const category = allCategories.find(c => c.id === p.categoryId)
        return (
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.tags?.some(t => t.toLowerCase().includes(q)) ||
          category?.name.toLowerCase().includes(q)
        )
      })
    }

    if (selectedCategory) {
      result = result.filter(p => p.categoryId === selectedCategory)
    }

    result = result.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1])

    result.sort((a, b) => {
      switch (sortBy) {
        case 'price-asc':
          return a.price - b.price
        case 'price-desc':
          return b.price - a.price
        case 'rating':
          return b.rating - a.rating
        case 'id':
        default:
          return b.id - a.id
      }
    })

    return result
  }, [searchQuery, selectedCategory, priceRange, sortBy])

  const handleFilterChange = (filters) => {
    if (filters.search !== undefined) setSearchQuery(filters.search)
    if (filters.category !== undefined) {
      setSelectedCategory(filters.category === 'all' ? '' : filters.category)
    }
    if (filters.priceRange !== undefined) {
      if (filters.priceRange === 'all') {
        setPriceRange([0, 10000])
      } else if (filters.priceRange === '200+') {
        setPriceRange([200, 10000])
      } else {
        const parts = filters.priceRange.split('-').map(Number)
        if (parts.length === 2 && !parts.some(isNaN)) {
          setPriceRange(parts)
        }
      }
    }
    if (filters.sortBy !== undefined) setSortBy(filters.sortBy)
  }

  return (
    <div style={{ minHeight: '100vh', background: C.background }}>
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h1 style={{ fontSize: 28, fontWeight: 700, color: C.text, margin: 0, letterSpacing: '-0.02em' }}>
                {searchQuery ? `Results for "${searchQuery}"` : 'All Products'}
              </h1>
              <p style={{ fontSize: 14, color: C.textSecondary, margin: '4px 0 0' }}>
                {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'} found
              </p>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'row', gap: 24 }}>
          <aside style={{ width: 260, flexShrink: 0 }}>
            <ProductFilters
              categories={allCategories}
              onFilterChange={handleFilterChange}
              initialCategory={categoryFromUrl}
            />
          </aside>
          <div style={{ flex: 1, minWidth: 0 }}>
            <ProductGrid products={filteredProducts} onAddToCart={addToCart} />
          </div>
        </div>
      </div>
    </div>
  )
}
