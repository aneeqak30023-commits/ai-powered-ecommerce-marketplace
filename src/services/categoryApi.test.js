import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fetchCategories, fetchCategory, clearCategoriesCache } from '../services/categoryApi.js'

const mockCategories = [
  {
    id: 'electronics',
    name: 'Electronics',
    slug: 'electronics',
    description: 'Latest gadgets and devices',
    icon: '💻',
    productCount: 7,
    subcategories: [{ id: 'audio', name: 'Audio' }],
  },
]

describe('categoryApi', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    clearCategoriesCache()
  })

  it('fetchCategories returns parsed categories from API', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockCategories),
      })
    )

    const result = await fetchCategories()
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('electronics')
    expect(result[0].subcategories).toEqual([{ id: 'audio', name: 'Audio' }])
  })

  it('fetchCategories throws on network error', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        status: 500,
      })
    )

    await expect(fetchCategories()).rejects.toThrow('Failed to fetch categories: 500')
  })

  it('fetchCategory returns single category by ID', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockCategories[0]),
      })
    )

    const result = await fetchCategory('electronics')
    expect(result.id).toBe('electronics')
    expect(result.name).toBe('Electronics')
  })

  it('fetchCategory returns null for 404', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        status: 404,
      })
    )

    const result = await fetchCategory('nonexistent')
    expect(result).toBeNull()
  })

  it('fetchCategory throws for other errors', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        status: 500,
      })
    )

    await expect(fetchCategory('electronics')).rejects.toThrow('Failed to fetch category: 500')
  })
})
