const API_BASE =  import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001'

let inventoryCache = null
let inventoryCacheTime = 0
const CACHE_TTL = 30_000

export async function fetchInventory() {
  const now = Date.now()
  if (inventoryCache && now - inventoryCacheTime < CACHE_TTL) {
    return inventoryCache
  }

  const response = await fetch(`${API_BASE}/api/inventory`)
  if (!response.ok) {
    throw new Error(`Failed to fetch inventory: ${response.status}`)
  }

  const data = await response.json()
  inventoryCache = data
  inventoryCacheTime = now
  return inventoryCache
}

export async function fetchInventoryForProduct(productId) {
  const response = await fetch(`${API_BASE}/api/inventory/${encodeURIComponent(productId)}`)
  if (!response.ok) {
    if (response.status === 404) return null
    throw new Error(`Failed to fetch inventory: ${response.status}`)
  }

  return response.json()
}

export function clearInventoryCache() {
  inventoryCache = null
  inventoryCacheTime = 0
}
