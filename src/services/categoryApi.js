const API_BASE = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001'

let categoriesCache = null
let categoriesCacheTime = 0
const CACHE_TTL = 60_000

function parseJsonField(value) {
  if (!value) return null
  try {
    return JSON.parse(value)
  } catch {
    return value
  }
}

function serializeCategory(category) {
  return {
    ...category,
    subcategories: parseJsonField(category.subcategories),
  }
}

export async function fetchCategories() {
  const now = Date.now()
  if (categoriesCache && now - categoriesCacheTime < CACHE_TTL) {
    return categoriesCache
  }

  const response = await fetch(`${API_BASE}/api/categories`)
  if (!response.ok) {
    throw new Error(`Failed to fetch categories: ${response.status}`)
  }

  const data = await response.json()
  categoriesCache = data.map(serializeCategory)
  categoriesCacheTime = now
  return categoriesCache
}

export async function fetchCategory(id) {
  const response = await fetch(`${API_BASE}/api/categories/${encodeURIComponent(id)}`)
  if (!response.ok) {
    if (response.status === 404) return null
    throw new Error(`Failed to fetch category: ${response.status}`)
  }

  const category = await response.json()
  return serializeCategory(category)
}

export function clearCategoriesCache() {
  categoriesCache = null
  categoriesCacheTime = 0
}
