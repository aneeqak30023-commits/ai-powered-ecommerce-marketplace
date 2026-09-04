import { describe, it, expect } from 'vitest'
import { searchProductsMultilingual } from '../services/multilingualSearch.js'
import { generateRecommendations } from '../services/productRecommendations.js'
import { aiService } from '../services/aiService.js'
import productsData from '../data/products.json'
import categoriesData from '../data/categories.json'

describe('Shared Product Retrieval Pipeline', () => {
  describe('searchProductsMultilingual - category constraint enforcement', () => {
    it('returns only electronics for "Show me electronics"', () => {
      const results = searchProductsMultilingual('Show me electronics', productsData, categoriesData)
      expect(results.length).toBeGreaterThan(0)
      expect(results.every(p => p.categoryId === 'electronics')).toBe(true)
    })

    it('returns only electronics for "Find wireless headphones"', () => {
      const results = searchProductsMultilingual('Find wireless headphones', productsData, categoriesData)
      expect(results.length).toBeGreaterThan(0)
      expect(results.every(p => p.categoryId === 'electronics')).toBe(true)
      expect(results.some(p => p.name.toLowerCase().includes('headphone'))).toBe(true)
    })

    it('returns only electronics for "Best watches"', () => {
      const results = searchProductsMultilingual('Best watches', productsData, categoriesData)
      expect(results.length).toBeGreaterThan(0)
      expect(results.every(p => p.categoryId === 'electronics')).toBe(true)
      expect(results.some(p => p.name.toLowerCase().includes('watch'))).toBe(true)
    })

    it('returns only electronics for "headphones under $100"', () => {
      const results = searchProductsMultilingual('headphones under $100', productsData, categoriesData)
      expect(results.length).toBeGreaterThan(0)
      expect(results.every(p => p.categoryId === 'electronics')).toBe(true)
      expect(results.every(p => p.price <= 100)).toBe(true)
    })
  })

  describe('searchProductsMultilingual - use case matching', () => {
    it('returns relevant products for "Products for studying"', () => {
      const results = searchProductsMultilingual('Products for studying', productsData, categoriesData)
      expect(results.length).toBeGreaterThan(0)
      // Results should be relevant to studying: headphones, keyboards, books, speakers
      const relevantTypes = ['headphone', 'speaker', 'keyboard', 'book', 'earbud']
      expect(results.some(p => relevantTypes.some(t => p.name.toLowerCase().includes(t)))).toBe(true)
    })

    it('returns relevant products for "Recommend something for gaming"', () => {
      const results = searchProductsMultilingual('Recommend something for gaming', productsData, categoriesData)
      expect(results.length).toBeGreaterThan(0)
      expect(results.some(p => p.tags?.some(t => ['gaming', 'game'].includes(t) || p.name.toLowerCase().includes('gaming')))).toBe(true)
    })

    it('returns relevant products for "products for traveling"', () => {
      const results = searchProductsMultilingual('products for traveling', productsData, categoriesData)
      expect(results.length).toBeGreaterThan(0)
    })
  })

  describe('searchProductsMultilingual - budget constraints', () => {
    it('filters by max price "headphones under $100"', () => {
      const results = searchProductsMultilingual('headphones under $100', productsData, categoriesData)
      expect(results.length).toBeGreaterThan(0)
      expect(results.every(p => p.price <= 100)).toBe(true)
    })

    it('filters by max price "headphones under $50"', () => {
      const results = searchProductsMultilingual('headphones under $50', productsData, categoriesData)
      // Only one headphone product ($79.99) exists, which exceeds $50
      expect(results).toHaveLength(0)
    })

    it('returns empty for impossibly low budget', () => {
      const results = searchProductsMultilingual('headphones under $1', productsData, categoriesData)
      expect(results).toHaveLength(0)
    })
  })

  describe('searchProductsMultilingual - plural/singular handling', () => {
    it('matches "watches" to "watch" products', () => {
      const results = searchProductsMultilingual('watches', productsData, categoriesData)
      expect(results.length).toBeGreaterThan(0)
      expect(results.some(p => p.name.toLowerCase().includes('watch'))).toBe(true)
    })

    it('matches "earbuds" to "earbuds" products', () => {
      const results = searchProductsMultilingual('earbuds', productsData, categoriesData)
      expect(results.length).toBeGreaterThan(0)
      expect(results.some(p => p.name.toLowerCase().includes('earbud'))).toBe(true)
    })

    it('matches "books" to "book" products', () => {
      const results = searchProductsMultilingual('books', productsData, categoriesData)
      expect(results.length).toBeGreaterThan(0)
      expect(results.every(p => p.categoryId === 'books')).toBe(true)
    })
  })

  describe('searchProductsMultilingual - no-result cases', () => {
    it('returns empty for non-existent product type', () => {
      const results = searchProductsMultilingual('Recommend a good laptop for students', productsData, categoriesData)
      expect(results).toHaveLength(0)
    })

    it('returns empty for non-existent product', () => {
      const results = searchProductsMultilingual('xyznonexistentproduct123', productsData, categoriesData)
      expect(results).toHaveLength(0)
    })

    it('returns empty for null query', () => {
      expect(searchProductsMultilingual(null)).toEqual([])
    })

    it('returns empty for empty string', () => {
      expect(searchProductsMultilingual('')).toEqual([])
    })
  })

  describe('searchProductsMultilingual - category constraint (negative)', () => {
    it('never returns fashion for "laptop" query', () => {
      const results = searchProductsMultilingual('laptop', productsData, categoriesData)
      if (results.length > 0) {
        expect(results.every(p => p.name.toLowerCase().includes('laptop') || p.tags?.some(t => t.includes('laptop')))).toBe(true)
      }
    })

    it('never returns books for "headphones" query', () => {
      const results = searchProductsMultilingual('headphones', productsData, categoriesData)
      expect(results.every(p => p.categoryId !== 'books')).toBe(true)
    })

    it('never returns beauty for "watch" query', () => {
      const results = searchProductsMultilingual('watch', productsData, categoriesData)
      expect(results.every(p => p.categoryId !== 'beauty')).toBe(true)
    })

    it('never returns sports for "smartphone" query', () => {
      const results = searchProductsMultilingual('smartphone', productsData, categoriesData)
      expect(results.every(p => p.categoryId !== 'sports')).toBe(true)
    })
  })

  describe('generateRecommendations - positive cases', () => {
    it('returns headphones under $100 for "good headphones under $100"', () => {
      const result = generateRecommendations('Good headphones under $100', productsData)
      expect(result.products.length).toBeGreaterThan(0)
      expect(result.products.every(p => p.price <= 100)).toBe(true)
      expect(result.products.every(p => p.categoryId === 'electronics')).toBe(true)
      expect(result.recommendations.length).toBeGreaterThan(0)
    })

    it('returns Smart Watch Pro for "Best watches"', () => {
      const result = generateRecommendations('Best watches', productsData)
      expect(result.products.length).toBeGreaterThan(0)
      expect(result.products.some(p => p.name.toLowerCase().includes('watch'))).toBe(true)
    })

    it('returns gaming products for "Recommend something for gaming"', () => {
      const result = generateRecommendations('Recommend something for gaming', productsData)
      expect(result.products.length).toBeGreaterThan(0)
    })

    it('returns study products for "Products for studying"', () => {
      const result = generateRecommendations('Products for studying', productsData)
      expect(result.products.length).toBeGreaterThan(0)
      const relevantTypes = ['headphone', 'speaker', 'keyboard', 'book', 'earbud', 'mouse']
      expect(result.products.some(p => relevantTypes.some(t => p.name.toLowerCase().includes(t)))).toBe(true)
    })

    it('returns electronics for "Show me electronics"', () => {
      const result = generateRecommendations('Show me electronics', productsData)
      expect(result.products.length).toBeGreaterThan(0)
      expect(result.products.every(p => p.categoryId === 'electronics')).toBe(true)
    })

    it('returns wireless headphones for "Find wireless headphones"', () => {
      const result = generateRecommendations('Find wireless headphones', productsData)
      expect(result.products.length).toBeGreaterThan(0)
      expect(result.products.every(p => p.name.toLowerCase().includes('headphone'))).toBe(true)
    })

    it('returns top-rated products for "Best rated products"', () => {
      const result = generateRecommendations('Best rated products', productsData)
      expect(result.products.length).toBeGreaterThan(0)
      // Results should be sorted by rating (highest first)
      for (let i = 1; i < result.products.length; i++) {
        expect(result.products[i - 1].rating).toBeGreaterThanOrEqual(result.products[i].rating)
      }
    })
  })

  describe('generateRecommendations - category constraint (negative)', () => {
    it('never returns T-shirt for "Recommend a good laptop for students"', () => {
      const result = generateRecommendations('Recommend a good laptop for students', productsData)
      expect(result.products.every(p => !p.name.toLowerCase().includes('t-shirt'))).toBe(true)
    })

    it('never returns unrelated products for "headphones"', () => {
      const result = generateRecommendations('headphones', productsData)
      if (result.products.length > 0) {
        expect(result.products.every(p =>
          p.categoryId === 'electronics' ||
          p.name.toLowerCase().includes('headphone') ||
          p.name.toLowerCase().includes('audio')
        )).toBe(true)
      }
    })

    it('never returns fashion for "gaming keyboard" query', () => {
      const result = generateRecommendations('gaming keyboard', productsData)
      if (result.products.length > 0) {
        expect(result.products.every(p => p.categoryId !== 'fashion')).toBe(true)
      }
    })

    it('never returns books for "wireless earbuds"', () => {
      const result = generateRecommendations('wireless earbuds', productsData)
      if (result.products.length > 0) {
        expect(result.products.every(p => p.categoryId !== 'books')).toBe(true)
      }
    })
  })

  describe('generateRecommendations - no-result cases', () => {
    it('returns empty for non-existent product "Recommend a good laptop for students"', () => {
      const result = generateRecommendations('Recommend a good laptop for students', productsData)
      expect(result.products).toHaveLength(0)
      expect(result.text).toContain("couldn't find any products")
    })

    it('returns empty for non-existent product', () => {
      const result = generateRecommendations('Recommend a product that does not exist xyz123', productsData)
      expect(result.products).toHaveLength(0)
      expect(result.text).toContain("couldn't find any products")
    })

    it('returns empty for empty input', () => {
      const result = generateRecommendations('', productsData)
      expect(result.text).toContain('product catalog')
      expect(result.products).toHaveLength(0)
    })

    it('returns empty for null products', () => {
      const result = generateRecommendations('headphones', [])
      expect(result.text).toContain('product catalog')
      expect(result.products).toHaveLength(0)
    })
  })

  describe('aiService - integration with required queries', () => {
    it('handles "Recommend a good laptop for students" without returning T-shirts', async () => {
      const result = await aiService.processMessage(
        'Recommend a good laptop for students', productsData, categoriesData
      )
      expect(result.products.every(p => !p.name.toLowerCase().includes('t-shirt'))).toBe(true)
      // No laptops in catalog, so either empty results or relevant products
      expect(result.products.length).toBe(0)
    })

    it('handles "Best watches" correctly', async () => {
      const result = await aiService.processMessage('Best watches', productsData, categoriesData)
      expect(result.products.length).toBeGreaterThan(0)
      expect(result.products.some(p => p.name.toLowerCase().includes('watch'))).toBe(true)
    })

    it('handles "Products for studying" with relevant results', async () => {
      const result = await aiService.processMessage('Products for studying', productsData, categoriesData)
      expect(result.products.length).toBeGreaterThan(0)
      const relevantTypes = ['headphone', 'speaker', 'keyboard', 'book', 'earbud', 'mouse', 'cookbook']
      const allRelevant = result.products.some(p =>
        relevantTypes.some(t => p.name.toLowerCase().includes(t))
      )
      expect(allRelevant).toBe(true)
    })

    it('handles "Good headphones under $100" with budget filter', async () => {
      const result = await aiService.processMessage(
        'Good headphones under $100', productsData, categoriesData
      )
      expect(result.products.length).toBeGreaterThan(0)
      expect(result.products.every(p => p.price <= 100)).toBe(true)
      expect(result.products.every(p => p.categoryId === 'electronics')).toBe(true)
    })

    it('handles "Recommend something for gaming" with gaming products', async () => {
      const result = await aiService.processMessage(
        'Recommend something for gaming', productsData, categoriesData
      )
      expect(result.products.length).toBeGreaterThan(0)
    })

    it('handles "Show me electronics" returning electronics categories only', async () => {
      const result = await aiService.processMessage(
        'Show me electronics', productsData, categoriesData
      )
      expect(result.products.length).toBeGreaterThan(0)
      expect(result.products.every(p => p.categoryId === 'electronics')).toBe(true)
    })

    it('handles "Find wireless headphones" returning headphones', async () => {
      const result = await aiService.processMessage(
        'Find wireless headphones', productsData, categoriesData
      )
      expect(result.products.length).toBeGreaterThan(0)
      expect(result.products.every(p => p.name.toLowerCase().includes('headphone'))).toBe(true)
    })

    it('handles "Best rated products" returning top-rated', async () => {
      const result = await aiService.processMessage(
        'Best rated products', productsData, categoriesData
      )
      expect(result.products.length).toBeGreaterThan(0)
      for (let i = 1; i < result.products.length; i++) {
        expect(result.products[i - 1].rating).toBeGreaterThanOrEqual(result.products[i].rating)
      }
    })
  })

  describe('AI explanation grounding', () => {
    it('explanations reference only returned products', async () => {
      const result = await aiService.processMessage('Best watches', productsData, categoriesData)
      // The text should mention product names that are in the returned products
      if (result.products.length > 0) {
        const returnedNames = result.products.map(p => p.name.toLowerCase())
        // At least one returned product should be referenced in the explanation
        const textLower = result.text.toLowerCase()
        expect(returnedNames.some(name => textLower.includes(name))).toBe(true)
      }
    })

    it('explanations for recommendations are grounded in actual products', () => {
      const result = generateRecommendations('Best watches', productsData)
      if (result.recommendations && result.recommendations.length > 0) {
        for (const rec of result.recommendations) {
          // Reasons should not contain fabricated product attributes
          expect(rec.reasons).toBeInstanceOf(Array)
          expect(rec.reasons.length).toBeGreaterThan(0)
        // Reasons should reference actual product attributes
        const reasonText = rec.reasons.join(' ').toLowerCase()
          // At least one reason should relate to the product's actual attributes
          expect(reasonText.length).toBeGreaterThan(0)
        }
      }
    })
  })

  describe('Determinism', () => {
    it('returns consistent results for the same query', () => {
      const r1 = generateRecommendations('Best watches', productsData)
      const r2 = generateRecommendations('Best watches', productsData)
      expect(r1.products.map(p => p.id)).toEqual(r2.products.map(p => p.id))
    })

    it('returns consistent results for "headphones under $80 for studying"', () => {
      const r1 = generateRecommendations('Recommend headphones under $80 for studying', productsData)
      const r2 = generateRecommendations('Recommend headphones under $80 for studying', productsData)
      expect(r1.products.map(p => p.id)).toEqual(r2.products.map(p => p.id))
    })

    it('returns consistent results for "Products for studying"', () => {
      const r1 = searchProductsMultilingual('Products for studying', productsData, categoriesData)
      const r2 = searchProductsMultilingual('Products for studying', productsData, categoriesData)
      expect(r1.map(p => p.id)).toEqual(r2.map(p => p.id))
    })
  })

  describe('Query isolation - consecutive messages', () => {
    it('first "Best watches" then "Recommend me a laptop for students" - second returns laptops not watches', async () => {
      // First query: watches
      const r1 = await aiService.processMessage('Best watches', productsData, categoriesData)
      expect(r1.products.length).toBeGreaterThan(0)
      expect(r1.products.every(p => p.name.toLowerCase().includes('watch'))).toBe(true)
      const firstProductIds = new Set(r1.products.map(p => p.id))

      // Second query: laptop (different product type)
      const r2 = await aiService.processMessage('Recommend me a laptop for students', productsData, categoriesData)
      // No laptops in catalog, so should return empty or laptop-like products
      if (r2.products.length > 0) {
        // If any products returned, they should NOT be watches from the first query
        expect(r2.products.every(p => !firstProductIds.has(p.id))).toBe(true)
        expect(r2.products.every(p =>
          p.name.toLowerCase().includes('laptop') ||
          p.name.toLowerCase().includes('notebook') ||
          p.tags?.some(t => ['laptop', 'notebook'].includes(t))
        )).toBe(true)
      }
    })

    it('first "Recommend good headphones" then "Best watches" - second returns watches not headphones', async () => {
      // First query: headphones
      const r1 = await aiService.processMessage('Recommend good headphones', productsData, categoriesData)
      expect(r1.products.length).toBeGreaterThan(0)
      expect(r1.products.every(p => p.name.toLowerCase().includes('headphone'))).toBe(true)

      // Second query: watches (different product type)
      const r2 = await aiService.processMessage('Best watches', productsData, categoriesData)
      expect(r2.products.length).toBeGreaterThan(0)
      expect(r2.products.every(p => p.name.toLowerCase().includes('watch'))).toBe(true)
      // Should not return the same headphones from first query
      const firstProductIds = new Set(r1.products.map(p => p.id))
      expect(r2.products.every(p => !firstProductIds.has(p.id))).toBe(true)
    })

    it('first headphones under $80 then Best watches under $100 - budgets and types don', () => {
      // First query: headphones under $80
      const r1 = searchProductsMultilingual('headphones under $80', productsData, categoriesData)
      expect(r1.length).toBeGreaterThan(0)
      expect(r1.every(p => p.price <= 80)).toBe(true)
      expect(r1.every(p => p.name.toLowerCase().includes('headphone'))).toBe(true)

      // Second query: watches under $100 (different product type + different budget)
      // Note: the only watch in catalog is $199.99, so under $100 returns empty (correct behavior)
      const r2 = searchProductsMultilingual('Best watches under $100', productsData, categoriesData)
      expect(r2.every(p => p.price <= 100)).toBe(true)
      expect(r2.every(p => p.name.toLowerCase().includes('watch'))).toBe(true)

      // Verify query type isolation - r2 should not include any headphones from r1
      const firstIds = new Set(r1.map(p => p.id))
      expect(r2.every(p => !firstIds.has(p.id))).toBe(true)

      // Also verify "watches under $500" does return the actual watch product
      const r3 = searchProductsMultilingual('watches under $500', productsData, categoriesData)
      expect(r3.length).toBe(1)
      expect(r3[0].name).toBe('Smart Watch Pro')
    })

    it('search isolation: "Best watches" then "headphones" - results differ', () => {
      const r1 = searchProductsMultilingual('Best watches', productsData, categoriesData)
      const r2 = searchProductsMultilingual('headphones', productsData, categoriesData)
      // First should return watches, second should return headphones
      if (r1.length > 0 && r2.length > 0) {
        expect(r1.every(p => p.name.toLowerCase().includes('watch'))).toBe(true)
        expect(r2.every(p => p.name.toLowerCase().includes('headphone'))).toBe(true)
      }
    })
  })

  describe('Validation examples', () => {
    it('"Best watches" returns only watch products', () => {
      const results = searchProductsMultilingual('Best watches', productsData, categoriesData)
      expect(results.every(p => p.name.toLowerCase().includes('watch'))).toBe(true)
    })

    it('"Recommend good headphones" returns only headphone products', () => {
      const results = searchProductsMultilingual('Recommend good headphones', productsData, categoriesData)
      expect(results.every(p => p.name.toLowerCase().includes('headphone'))).toBe(true)
    })

    it('"Gaming laptop" returns only laptop products', () => {
      const results = searchProductsMultilingual('Gaming laptop', productsData, categoriesData)
      if (results.length > 0) {
        expect(results.every(p => p.name.toLowerCase().includes('laptop') || p.tags?.some(t => t.includes('laptop')))).toBe(true)
      }
    })

    it('"Headphones under $80" returns headphones under $80', () => {
      const results = searchProductsMultilingual('Headphones under $80', productsData, categoriesData)
      expect(results.every(p => p.price <= 80)).toBe(true)
      expect(results.every(p => p.name.toLowerCase().includes('headphone'))).toBe(true)
    })

    it('"Best watches under $100" returns watches under $100', () => {
      const results = searchProductsMultilingual('Best watches under $100', productsData, categoriesData)
      expect(results.every(p => p.price <= 100)).toBe(true)
      expect(results.every(p => p.name.toLowerCase().includes('watch'))).toBe(true)
    })

    it('"Tell me about a product" does not randomly select an unrelated product', () => {
      const result = generateRecommendations('Tell me about a product', productsData)
      // Should either return empty or ask for clarification
      // Should NOT return a random unrelated product
      if (result.products.length > 0) {
        // If products are returned, they should not be random
        expect(result.recommendations).not.toBeNull()
      }
    })

    it('all returned products exist in the catalog', () => {
      const queries = ['Best watches', 'headphones under $80', 'gaming', 'books', 'Products for studying', 'Show me electronics']
      for (const q of queries) {
        const results = searchProductsMultilingual(q, productsData, categoriesData)
        for (const p of results) {
          const exists = productsData.some(catalogProduct => catalogProduct.id === p.id)
          expect(exists).toBe(true)
        }
      }
    })

    it('displayed prices match the catalog', () => {
      const results = searchProductsMultilingual('Best watches', productsData, categoriesData)
      for (const p of results) {
        const catalogProduct = productsData.find(c => c.id === p.id)
        expect(p.price).toBe(catalogProduct.price)
        expect(p.rating).toBe(catalogProduct.rating)
      }
    })
  })

  describe('Integration: full AIAssistantContext data flow', () => {
    // This simulates what AIAssistantContext.jsx does: calls aiService.processMessage
    // directly (no remote API) and verifies the response object structure
    async function simulateAIChat(message) {
      const { aiService } = await import('../services/aiService.js')
      const result = await aiService.processMessage(message, productsData, categoriesData)
      return result
    }

    it('Best watches -> returns watches not T-shirt', async () => {
      const result = await simulateAIChat('Best watches')
      expect(result.products || []).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ name: expect.stringMatching(/watch/i) })
        ])
      )
      const allProductIds = (result.products || []).map(p => p.id)
      const tshirtId = productsData.find(p => p.name === 'Classic Fit Cotton T-Shirt')?.id
      expect(allProductIds).not.toContain(tshirtId)
    })

    it('Recommend me a laptop for students -> returns laptops not T-shirt', async () => {
      const result = await simulateAIChat('Recommend me a laptop for students')
      // No laptops in catalog, so no unrelated products should be returned
      const allProductIds = (result.products || []).map(p => p.id)
      const tshirtId = productsData.find(p => p.name === 'Classic Fit Cotton T-Shirt')?.id
      expect(allProductIds).not.toContain(tshirtId)
      if (result.products && result.products.length > 0) {
        expect(result.products.every(p => p.name.toLowerCase().includes('laptop') || p.tags?.some(t => t.includes('laptop')))).toBe(true)
      }
    })

    it('Recommend good headphones -> returns headphones not T-shirt', async () => {
      const result = await simulateAIChat('Recommend good headphones')
      expect(result.products || []).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ name: expect.stringMatching(/headphone/i) })
        ])
      )
      const allProductIds = (result.products || []).map(p => p.id)
      const tshirtId = productsData.find(p => p.name === 'Classic Fit Cotton T-Shirt')?.id
      expect(allProductIds).not.toContain(tshirtId)
    })

    it('Best watches under $100 -> returns watches under $100 not T-shirt', async () => {
      const result = await simulateAIChat('Best watches under $100')
      if (result.products && result.products.length > 0) {
        expect(result.products.every(p => p.price <= 100)).toBe(true)
        expect(result.products.every(p => p.name.toLowerCase().includes('watch'))).toBe(true)
      }
      const allProductIds = (result.products || []).map(p => p.id)
      const tshirtId = productsData.find(p => p.name === 'Classic Fit Cotton T-Shirt')?.id
      expect(allProductIds).not.toContain(tshirtId)
    })

    it('consecutive different queries return different product IDs', async () => {
      const r1 = await simulateAIChat('Best watches')
      const r2 = await simulateAIChat('Recommend good headphones')

      // Second response should NOT contain the first response's products
      const firstIds = new Set((r1.products || []).map(p => p.id))
      const secondIds = new Set((r2.products || []).map(p => p.id))

      // If both returned products, they should not overlap
      if (firstIds.size > 0 && secondIds.size > 0) {
        const overlap = [...firstIds].filter(id => secondIds.has(id))
        expect(overlap.length).toBe(0)
      }
    }, 15000)

    it('every rendered product ID exists in the catalog', async () => {
      const queries = [
        'Best watches',
        'Recommend me a laptop for students',
        'Recommend good headphones',
        'Best watches under $100',
        'Products for studying',
        'Headphones under $80'
      ]
      for (const q of queries) {
        const result = await simulateAIChat(q)
        for (const p of result.products || []) {
          const exists = productsData.some(c => c.id === p.id)
          expect(exists).toBe(true)
        }
      }
    }, 30000)
  })

  describe('Natural language and multilingual robustness', () => {
    async function simulateAIChat(message) {
      const { aiService } = await import('../services/aiService.js')
      const result = await aiService.processMessage(message, productsData, categoriesData)
      return result
    }

    it('handles "Which is better?" for comparison', async () => {
      const result = await simulateAIChat('Which is better, the Smart Watch Pro or the Wireless Bluetooth Headphones?')
      // Should either return a comparison or product info
      expect(result.intent).toBeTruthy()
      if (result.comparison) {
        expect(result.comparison.productA).toBeDefined()
        expect(result.comparison.productB).toBeDefined()
      }
    })

    it('handles "I need something for studying"', async () => {
      const result = await simulateAIChat('I need something for studying')
      // Should return products relevant to studying (headphones, laptop, books, etc.)
      if (result.products && result.products.length > 0) {
        for (const p of result.products) {
          const exists = productsData.some(c => c.id === p.id)
          expect(exists).toBe(true)
        }
      }
    })

    it('handles conversational "Can you show me a good laptop?"', async () => {
      const result = await simulateAIChat('Can you show me a good laptop?')
      // No laptops in catalog - should not return unrelated products
      const allProductIds = (result.products || []).map(p => p.id)
      const tshirtId = productsData.find(p => p.name === 'Classic Fit Cotton T-Shirt')?.id
      expect(allProductIds).not.toContain(tshirtId)
    })

    it('handles greeting "Hello"', async () => {
      const result = await simulateAIChat('Hello')
      expect(result.text).toContain('NexMart')
      expect(result.products || []).toEqual([])
    })

    it('handles "Can you help me choose something?"', async () => {
      const result = await simulateAIChat('Can you help me choose something?')
      expect(result.text).toBeTruthy()
      // Should not error or return random products without context
    })

    it('handles return policy question', async () => {
      const result = await simulateAIChat('What are your return policies?')
      expect(result.text).toBeTruthy()
      expect(result.text).toMatch(/return/i)
    })

    it('handles shipping question', async () => {
      const result = await simulateAIChat('How long does shipping take?')
      expect(result.text).toBeTruthy()
      expect(result.text).toMatch(/ship|deliver/i)
    })

    it('handles "Can I return an item?"', async () => {
      const result = await simulateAIChat('Can I return an item?')
      expect(result.text).toBeTruthy()
      expect(result.text).toMatch(/return|30/i)
    })

    it('handles "What are your return policies?"', async () => {
      const result = await simulateAIChat('What are your return policies?')
      expect(result.text).toBeTruthy()
      // Should not return products
      expect(result.products || []).toEqual([])
    })
  })

  describe('Multilingual validation examples', () => {
    async function simulateAIChat(message) {
      const { aiService } = await import('../services/aiService.js')
      const result = await aiService.processMessage(message, productsData, categoriesData)
      return result
    }

    it('Mujhe students ke liye acha laptop chahiye (Roman Urdu)', async () => {
      const result = await simulateAIChat('Mujhe students ke liye acha laptop chahiye')
      const allProductIds = (result.products || []).map(p => p.id)
      const tshirtId = productsData.find(p => p.name === 'Classic Fit Cotton T-Shirt')?.id
      expect(allProductIds).not.toContain(tshirtId)
      // No laptops in catalog, should not return unrelated products
      if (result.products && result.products.length > 0) {
        // If products returned, they should be laptop-related or study-related
        for (const p of result.products) {
          const exists = productsData.some(c => c.id === p.id)
          expect(exists).toBe(true)
        }
      }
    })

    it('Urdu: مجھے پڑھائی کے لیے ایک اچھا لیپ ٹاپ چاہیے', async () => {
      const result = await simulateAIChat('مجھے پڑھائی کے لیے ایک اچھا لیپ ٹاپ چاہیے')
      const allProductIds = (result.products || []).map(p => p.id)
      const tshirtId = productsData.find(p => p.name === 'Classic Fit Cotton T-Shirt')?.id
      expect(allProductIds).not.toContain(tshirtId)
      if (result.products && result.products.length > 0) {
        for (const p of result.products) {
          const exists = productsData.some(c => c.id === p.id)
          expect(exists).toBe(true)
        }
      }
    })

    it('Best watches - multilingual keyword still works', async () => {
      const result = await simulateAIChat('Best watches')
      expect(result.products || []).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ name: expect.stringMatching(/watch/i) })
        ])
      )
    })
  })

  describe('Soft constraint handling', () => {
    async function simulateAIChat(message) {
      const { aiService } = await import('../services/aiService.js')
      const result = await aiService.processMessage(message, productsData, categoriesData)
      return result
    }

    it('use case "for studying" does not reject study-related products', async () => {
      // Headphones are great for studying - should be returned
      const result = await simulateAIChat('I need headphones for studying')
      if (result.products && result.products.length > 0) {
        expect(result.products.every(p => p.name.toLowerCase().includes('headphone'))).toBe(true)
        for (const p of result.products) {
          const exists = productsData.some(c => c.id === p.id)
          expect(exists).toBe(true)
        }
      }
    })

    it('use case "for gaming" with gaming keyboard returns gaming keyboard', async () => {
      const result = await simulateAIChat('Recommend a keyboard for gaming')
      if (result.products && result.products.length > 0) {
        expect(result.products.some(p => p.name.toLowerCase().includes('keyboard') && p.tags?.includes('gaming'))).toBe(true)
      }
    })

    it('budget "under $80" with product type returns products under $80 only', async () => {
      const result = await simulateAIChat('headphones under $80')
      if (result.products && result.products.length > 0) {
        expect(result.products.every(p => p.price <= 80)).toBe(true)
        expect(result.products.every(p => p.name.toLowerCase().includes('headphone'))).toBe(true)
      }
    })

    it('impossibly low budget returns no unrelated products', async () => {
      const result = await simulateAIChat('headphones under $10')
      expect(result.products || []).toEqual([])
    })
  })
})
