const API_BASE =  import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001'

let productsCache = null
let productsCacheTime = 0
const CACHE_TTL = 60_000

function parseJsonFields(product) {
  const parseArrayField = (value) => {
    if (!value) return []
    if (Array.isArray(value)) return value

    try {
      const parsed = JSON.parse(value)
      return Array.isArray(parsed) ? parsed : [parsed]
    } catch {
      return [value]
    }
  }

  const parseObjectField = (value) => {
    if (!value) return {}

    if (typeof value === 'object') {
      return value
    }

    try {
      const parsed = JSON.parse(value)
      return parsed && typeof parsed === 'object' && !Array.isArray(parsed)
        ? parsed
        : {}
    } catch {
      return {}
    }
  }

  return {
    ...product,
    images: parseArrayField(product.images),
    tags: parseArrayField(product.tags),
    specifications: parseObjectField(product.specifications),
  }
}

export function clearProductsCache() {
  productsCache = null
  productsCacheTime = 0
}

export async function fetchProducts() {
  const now = Date.now()
  if (productsCache && now - productsCacheTime < CACHE_TTL) {
    return productsCache
  }

  const response = await fetch(`${API_BASE}/api/products`)
  if (!response.ok) {
    throw new Error(`Failed to fetch products: ${response.status}`)
  }

  const data = await response.json()
  productsCache = data.map(parseJsonFields)
  productsCacheTime = now
  return productsCache
}

export async function fetchProduct(id) {
  const response = await fetch(`${API_BASE}/api/products/${id}`)
  if (!response.ok) {
    if (response.status === 404) return null
    throw new Error(`Failed to fetch product: ${response.status}`)
  }

  const product = await response.json()
  return parseJsonFields(product)
}
