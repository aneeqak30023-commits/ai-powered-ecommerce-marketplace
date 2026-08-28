import { describe, it, expect } from 'vitest'
import { generateRecommendations, extractRecommendationEntities } from './productRecommendations.js'
import productsData from '../data/products.json'

describe('productRecommendations', () => {
  describe('extractRecommendationEntities', () => {
    it('extracts product type and use case from recommendation query', () => {
      const result = extractRecommendationEntities('Recommend headphones under $80 for studying')
      expect(result.productType).toBe('headphones')
      expect(result.maxPrice).toBe(80)
      expect(result.useCases).toContain('studying')
    })

    it('extracts use case and budget from mixed-language query', () => {
      const result = extractRecommendationEntities('Mujhe 100 dollar se kam ki watch chahiye')
      expect(result.productType).toBe('watch')
      expect(result.maxPrice).toBe(100)
    })
  })

  describe('generateRecommendations', () => {
    it('recommends headphones under $80 for studying', () => {
      const result = generateRecommendations('Recommend headphones under $80 for studying', productsData)
      expect(result.text.length).toBeGreaterThan(0)
      expect(result.products.length).toBeGreaterThan(0)
      expect(result.products.every(p => p.price <= 80)).toBe(true)
      expect(result.recommendations).not.toBeNull()
      expect(result.recommendations.length).toBeGreaterThan(0)
    })

    it('recommends products with high ratings first', () => {
      const result = generateRecommendations('Recommend the best wireless headphones', productsData)
      expect(result.products.length).toBeGreaterThan(0)
      for (let i = 1; i < result.products.length; i++) {
        expect(result.products[i - 1].rating).toBeGreaterThanOrEqual(result.products[i].rating)
      }
    })

    it('returns no-match message when no products match', () => {
      const result = generateRecommendations('Recommend a product that does not exist xyz123', productsData)
      expect(result.text).toContain("couldn't find any products")
      expect(result.products).toHaveLength(0)
    })

    it('includes explanation for each recommendation', () => {
      const result = generateRecommendations('Recommend headphones under $80 for studying', productsData)
      expect(result.recommendations.length).toBeGreaterThan(0)
      for (const rec of result.recommendations) {
        expect(rec.reasons).toBeInstanceOf(Array)
        expect(rec.reasons.length).toBeGreaterThan(0)
      }
    })

    it('handles empty input', () => {
      const result = generateRecommendations('', productsData)
      expect(result.text).toContain('product catalog')
    })
  })
})
