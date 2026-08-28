import { describe, it, expect } from 'vitest'
import {
  identifyComparisonProducts,
  classifyProduct,
  getComparisonAttributes,
  generateComparison,
  handleComparisonRequest
} from './productComparison.js'
import productsData from '../data/products.json'

const headphones = productsData.find(p => p.id === 1)
const watch = productsData.find(p => p.id === 2)

describe('productComparison', () => {
  describe('identifyComparisonProducts', () => {
    it('identifies two products from a comparison message', () => {
      const result = identifyComparisonProducts('Compare wireless headphones and smart watch', productsData)
      expect(result.length).toBeGreaterThanOrEqual(2)
    })

    it('returns empty for null message', () => {
      const result = identifyComparisonProducts(null, productsData)
      expect(result).toEqual([])
    })

    it('returns empty for empty products', () => {
      const result = identifyComparisonProducts('compare two products', [])
      expect(result).toEqual([])
    })
  })

  describe('classifyProduct', () => {
    it('classifies electronics product', () => {
      const result = classifyProduct(headphones)
      expect(result.category).toBe('electronics')
      expect(result.productType).toBe('headphones')
    })

    it('classifies watch product', () => {
      const result = classifyProduct(watch)
      expect(result.category).toBe('electronics')
      expect(result.productType).toBe('watch')
    })
  })

  describe('getComparisonAttributes', () => {
    it('returns common and unique attributes', () => {
      const attrs = getComparisonAttributes(headphones, watch)
      expect(attrs).toHaveProperty('common')
      expect(attrs).toHaveProperty('uniqueA')
      expect(attrs).toHaveProperty('uniqueB')
      expect(Array.isArray(attrs.common)).toBe(true)
      expect(Array.isArray(attrs.uniqueA)).toBe(true)
      expect(Array.isArray(attrs.uniqueB)).toBe(true)
    })
  })

  describe('generateComparison', () => {
    it('generates comparison text for two products', () => {
      const result = generateComparison(headphones, watch)
      expect(result.text).toContain(headphones.name)
      expect(result.text).toContain(watch.name)
      expect(result.products).toHaveLength(2)
      expect(result.comparison).not.toBeNull()
    })

    it('returns fallback for missing products', () => {
      const result = generateComparison(null, watch)
      expect(result.text).toContain('need 2 products')
    })
  })

  describe('handleComparisonRequest', () => {
    it('handles comparison request with products', () => {
      const result = handleComparisonRequest('compare wireless headphones and smart watch', productsData)
      expect(result.text.length).toBeGreaterThan(0)
      expect(result.products.length).toBeGreaterThanOrEqual(2)
    })

    it('handles comparison request with insufficient products', () => {
      const result = handleComparisonRequest('compare unknown product xyz', productsData)
      expect(result.text).toContain('need at least 2 products')
    })

    it('handles empty input', () => {
      const result = handleComparisonRequest('', productsData)
      expect(result.text).toContain('need at least 2 products')
    })
  })
})
