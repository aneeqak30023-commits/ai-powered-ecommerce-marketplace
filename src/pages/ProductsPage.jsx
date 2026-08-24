import { useState, useMemo } from 'react'
import ProductGrid from '../components/product/ProductGrid'
import ProductFilters from '../components/product/ProductFilters'
import allProducts from '../data/products.json'
import allCategories from '../data/categories.json'
import { useCart } from '../context/CartContext'

export default function ProductsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
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
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <h1 className="text-3xl font-bold text-[#0F172A] mb-4 sm:mb-0">All Products</h1>
          <span className="text-[#475569]">
            {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'} found
          </span>
        </div>
        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="w-full lg:w-64 flex-shrink-0">
            <ProductFilters
              categories={allCategories}
              onFilterChange={handleFilterChange}
            />
          </aside>
          <div className="flex-1">
            <ProductGrid products={filteredProducts} onAddToCart={addToCart} />
          </div>
        </div>
      </div>
    </div>
  )
}
