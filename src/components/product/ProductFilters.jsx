import { useEffect, useState } from 'react'

const C = {
  primary: '#6366F1',
  primaryDark: '#4F46E5',
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

export default function ProductFilters({ categories = [], subcategories = [], selectedSubcategory, onSubcategoryChange, onFilterChange, initialCategory }) {
  const [selectedCategory, setSelectedCategory] = useState(initialCategory || 'all')
  const [priceRange, setPriceRange] = useState('all')
  const [sortBy, setSortBy] = useState('featured')
  const [isExpanded, setIsExpanded] = useState(false)

  useEffect(() => {
    if (onFilterChange) {
      onFilterChange({ category: selectedCategory, subcategory: selectedSubcategory, priceRange, sortBy })
    }
  }, [selectedCategory, selectedSubcategory, priceRange, sortBy, onFilterChange])

  const filtersActive =
    selectedCategory !== 'all' || priceRange !== 'all' || sortBy !== 'featured'

  const clearAll = () => {
    setSelectedCategory('all')
    setPriceRange('all')
    setSortBy('featured')
  }

  const activeFilters = []
  if (selectedCategory !== 'all') {
    const cat = categories.find(c => c.id === selectedCategory)
    activeFilters.push({ key: 'category', label: cat?.name || selectedCategory, clear: () => { setSelectedCategory('all'); onSubcategoryChange('') } })
  }
  if (selectedSubcategory) {
    const sub = subcategories.find(s => s.id === selectedSubcategory)
    activeFilters.push({ key: 'subcategory', label: sub?.name || selectedSubcategory, clear: () => onSubcategoryChange('') })
  }
  if (priceRange !== 'all') {
    const range = PRICE_RANGES.find(p => p.value === priceRange)
    activeFilters.push({ key: 'price', label: range?.label || priceRange, clear: () => setPriceRange('all') })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Active Filter Chips */}
      {activeFilters.length > 0 && (
        <div className="filter-chips" style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {activeFilters.map((filter) => (
            <span
              key={filter.key}
              className="filter-chip-active"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 12px',
                borderRadius: 9999,
                background: C.primary,
                color: 'white',
                fontSize: 12,
                fontWeight: 600
              }}
            >
              {filter.label}
              <button
                type="button"
                onClick={filter.clear}
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  border: 'none',
                  borderRadius: '50%',
                  width: 18,
                  height: 18,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: 'white',
                  fontSize: 12,
                  padding: 0
                }}
              >
                ×
              </button>
            </span>
          ))}
          <button
            type="button"
            onClick={clearAll}
            style={{
              padding: '6px 12px',
              borderRadius: 9999,
              border: `1px solid ${C.border}`,
              background: 'transparent',
              color: C.textSecondary,
              fontSize: 12,
              fontWeight: 500,
              cursor: 'pointer'
            }}
          >
            Clear all
          </button>
        </div>
      )}

      {/* Sort Dropdown - Pill Style */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: C.textSecondary }}>Sort:</span>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="pill-btn"
          style={{
            padding: '8px 16px',
            borderRadius: 9999,
            border: `1px solid ${C.border}`,
            background: C.surface,
            color: C.text,
            fontSize: 13,
            fontWeight: 500,
            outline: 'none',
            cursor: 'pointer',
            appearance: 'none',
            paddingRight: 32,
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23475569' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right 12px center'
          }}
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      {/* Filter Sections - Collapsible */}
      <div
        style={{
          background: C.surface,
          border: `1px solid ${C.border}`,
          borderRadius: 16,
          overflow: 'hidden'
        }}
      >
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 20px',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            fontSize: 14,
            fontWeight: 600,
            color: C.text
          }}
        >
          <span>Filters</span>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s ease' }}
          >
            <path d="M6 9l6 6 6-6" stroke={C.textSecondary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        {isExpanded && (
          <div style={{ padding: '0 20px 20px', display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Category Filter */}
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: C.textSecondary, marginBottom: 10 }}>
                Category
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                <button
                  type="button"
                  onClick={() => setSelectedCategory('all')}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 9999,
                    border: `1px solid ${selectedCategory === 'all' ? C.primary : C.border}`,
                    background: selectedCategory === 'all' ? C.primary : 'transparent',
                    color: selectedCategory === 'all' ? 'white' : C.text,
                    fontSize: 13,
                    fontWeight: 500,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  All
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id)}
                    style={{
                      padding: '6px 14px',
                      borderRadius: 9999,
                      border: `1px solid ${selectedCategory === cat.id ? C.primary : C.border}`,
                      background: selectedCategory === cat.id ? C.primary : 'transparent',
                      color: selectedCategory === cat.id ? 'white' : C.text,
                      fontSize: 13,
                      fontWeight: 500,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Subcategory Filter */}
            {selectedCategory !== 'all' && subcategories.length > 0 && (
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: C.textSecondary, marginBottom: 10 }}>
                  Subcategory
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  <button
                    type="button"
                    onClick={() => onSubcategoryChange('')}
                    style={{
                      padding: '6px 14px',
                      borderRadius: 9999,
                      border: `1px solid ${!selectedSubcategory ? C.primary : C.border}`,
                      background: !selectedSubcategory ? C.primary : 'transparent',
                      color: !selectedSubcategory ? 'white' : C.text,
                      fontSize: 13,
                      fontWeight: 500,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    All
                  </button>
                  {subcategories.map((sub) => (
                    <button
                      key={sub.id}
                      type="button"
                      onClick={() => onSubcategoryChange(sub.id)}
                      style={{
                        padding: '6px 14px',
                        borderRadius: 9999,
                        border: `1px solid ${selectedSubcategory === sub.id ? C.primary : C.border}`,
                        background: selectedSubcategory === sub.id ? C.primary : 'transparent',
                        color: selectedSubcategory === sub.id ? 'white' : C.text,
                        fontSize: 13,
                        fontWeight: 500,
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {sub.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Price Filter */}
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: C.textSecondary, marginBottom: 10 }}>
                Price
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {PRICE_RANGES.map((p) => (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() => setPriceRange(p.value)}
                    style={{
                      padding: '6px 14px',
                      borderRadius: 9999,
                      border: `1px solid ${priceRange === p.value ? C.primary : C.border}`,
                      background: priceRange === p.value ? C.primary : 'transparent',
                      color: priceRange === p.value ? 'white' : C.text,
                      fontSize: 13,
                      fontWeight: 500,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
