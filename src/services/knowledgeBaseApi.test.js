import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getKnowledgeBaseItems, getKnowledgeBaseCategories, getKnowledgeBaseItem, clearKnowledgeBaseCache } from '../services/knowledgeBaseApi.js'

const mockItems = [
  {
    id: 'shipping-policy',
    category: 'shipping',
    question: 'How long does shipping take?',
    answer: 'Standard delivery takes 5-7 business days.',
    keywords: ['shipping', 'delivery', 'ship'],
    priority: 1,
  },
  {
    id: 'return-policy',
    category: 'returns',
    question: 'What is your return policy?',
    answer: 'We have a 30-day hassle-free return policy.',
    keywords: ['return', 'refund', 'send back'],
    priority: 1,
  },
]

describe('knowledgeBaseApi', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    clearKnowledgeBaseCache()
  })

  it('getKnowledgeBaseItems fetches items from backend', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockItems),
      })
    )

    const result = await getKnowledgeBaseItems()
    expect(result).toHaveLength(2)
    expect(result[0].id).toBe('shipping-policy')
  })

  it('getKnowledgeBaseItems filters by category', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve([mockItems[0]]),
      })
    )

    const result = await getKnowledgeBaseItems({ category: 'shipping' })
    expect(result).toHaveLength(1)
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('category=shipping'),
      expect.any(Object)
    )
  })

  it('getKnowledgeBaseItems searches items', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve([mockItems[0]]),
      })
    )

    const result = await getKnowledgeBaseItems({ search: 'shipping' })
    expect(result).toHaveLength(1)
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('search=shipping'),
      expect.any(Object)
    )
  })

  it('getKnowledgeBaseCategories fetches categories', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve(['shipping', 'returns', 'payment']),
      })
    )

    const result = await getKnowledgeBaseCategories()
    expect(result).toHaveLength(3)
    expect(result).toContain('shipping')
  })

  it('getKnowledgeBaseItem fetches single item', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockItems[0]),
      })
    )

    const result = await getKnowledgeBaseItem('shipping-policy')
    expect(result.id).toBe('shipping-policy')
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/knowledge-base/shipping-policy'),
      expect.any(Object)
    )
  })

  it('throws on error', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        status: 500,
        json: () => Promise.resolve({ error: 'Server error' }),
      })
    )

    await expect(getKnowledgeBaseItems()).rejects.toThrow('Server error')
  })
})
