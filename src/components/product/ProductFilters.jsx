import { useEffect, useState } from 'react'

const C = {
  primary: '#4F46E5',
  primaryDark: '#4338CA',
  surface: '#FFFFFF',
  background: '#F8FAFC',
  text: '#0F172A',
  textSecondary: '#475569',
  border: '#E2E8F0'
}

const PRICE_RANGES = [
  { value: 'all', label: 'All' },
  { value: '0-50', label: '$0 - $50' },
  { value: '50-100', label: '$50 - $100' },
  { value: '100-200', label: '$100 - $200' },
  { value: '200+', label: '$200+' }
]

const SORT_OPTIONS = [
  { value: 'featured', label: 'Featured' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'newest', label: 'Newest' }
]

export default function ProductFilters({ categories = [], onFilterChange, initialCategory }) {
  const [selectedCategory, setSelectedCategory] = useState(initialCategory || 'all')
  const [priceRange, setPriceRange] = useState('all')
  const [sortBy, setSortBy] = useState('featured')

  useEffect(() => {
    onFilterChange &&
      onFilterChange({ category: selectedCategory, priceRange, sortBy })
  }, [selectedCategory, priceRange, sortBy, onFilterChange])

  const filtersActive =
    selectedCategory !== 'all' || priceRange !== 'all' || sortBy !== 'featured'

  const chipStyle = (active) => ({
    padding: '8px 16px',
    borderRadius: 9999,
    border: `1px solid ${active ? C.primary : C.border}`,
    background: active ? C.primary : C.surface,
    color: active ? '#fff' : C.text,
    fontSize: 14,
    fontWeight: 500,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    transition: 'background .15s ease, color .15s ease'
  })

  const clearAll = () => {
    setSelectedCategory('all')
    setPriceRange('all')
    setSortBy('featured')
  }

  return (
    <div
      style={{
        background: C.surface,
        border: `1px solid ${C.border}`,
        borderRadius: 12,
        padding: 18,
        display: 'flex',
        flexDirection: 'column',
        gap: 18
      }}
    >
      <div>
        <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.04em', color: C.textSecondary, marginBottom: 10 }}>
          Category
        </div>
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
          <button type="button" style={chipStyle(selectedCategory === 'all')} onClick={() => setSelectedCategory('all')}>
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              style={chipStyle(selectedCategory === cat.id)}
              onClick={() => setSelectedCategory(cat.id)}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      <div>
        <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.04em', color: C.textSecondary, marginBottom: 10 }}>
          Price
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {PRICE_RANGES.map((p) => (
            <button
              key={p.value}
              type="button"
              style={chipStyle(priceRange === p.value)}
              onClick={() => setPriceRange(p.value)}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 200px' }}>
          <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.04em', color: C.textSecondary, marginBottom: 10 }}>
            Sort By
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: 8,
              border: `1px solid ${C.border}`,
              background: C.background,
              color: C.text,
              fontSize: 14,
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        {filtersActive && (
          <button
            type="button"
            onClick={clearAll}
            style={{
              padding: '10px 16px',
              borderRadius: 8,
              border: `1px solid ${C.border}`,
              background: C.surface,
              color: C.text,
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Clear Filters
          </button>
        )}
      </div>
    </div>
  )
}
