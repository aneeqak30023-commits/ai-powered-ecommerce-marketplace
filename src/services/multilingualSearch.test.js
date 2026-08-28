import { describe, it, expect } from 'vitest'
import { searchProductsMultilingual, detectLanguage, normalizeToEnglish, extractMultilingualEntities } from './multilingualSearch.js'

describe('multilingualSearch', () => {
  describe('detectLanguage', () => {
    it('detects English', () => {
      expect(detectLanguage('I want a watch')).toBe('english')
    })

    it('detects Urdu', () => {
      expect(detectLanguage('مجھے گھڑی چاہیے')).toBe('urdu')
    })

    it('detects Roman Urdu', () => {
      expect(detectLanguage('Mujhe watch chahiye')).toBe('roman-urdu')
    })

    it('detects mixed with Urdu script', () => {
      expect(detectLanguage('Mujhe 100 dollar سے کم ki watch چاہیے')).toBe('mixed')
    })
  })

  describe('normalizeToEnglish', () => {
    it('normalizes Roman Urdu to English', () => {
      const result = normalizeToEnglish('Mujhe watch chahiye')
      expect(result.toLowerCase()).toContain('watch')
      expect(result.toLowerCase()).toContain('i want')
    })

    it('normalizes common Urdu phrases to English', () => {
      const result = normalizeToEnglish('مجھے دکھائیں')
      expect(result.toLowerCase()).toContain('show me')
    })

    it('leaves English unchanged', () => {
      const result = normalizeToEnglish('I want a watch')
      expect(result).toBe('I want a watch')
    })
  })

  describe('extractMultilingualEntities', () => {
    it('extracts product type from English', () => {
      const result = extractMultilingualEntities('I want a watch')
      expect(result.productType).toBe('watch')
    })

    it('extracts maxPrice from English', () => {
      const result = extractMultilingualEntities('Show me watches under $100')
      expect(result.maxPrice).toBe(100)
    })

    it('extracts minRating from English', () => {
      const result = extractMultilingualEntities('Find a watch with rating above 4')
      expect(result.minRating).toBe(4)
    })

    it('extracts product type from Roman Urdu', () => {
      const result = extractMultilingualEntities('Mujhe watch chahiye')
      expect(result.productType).toBe('watch')
    })

    it('extracts maxPrice from Roman Urdu', () => {
      const result = extractMultilingualEntities('Mujhe 100 dollar se kam ki watch chahiye')
      expect(result.maxPrice).toBe(100)
    })

    it('extracts product type from mixed query', () => {
      const result = extractMultilingualEntities('Mujhe under $100 ki watch chahiye')
      expect(result.productType).toBe('watch')
      expect(result.maxPrice).toBe(100)
    })
  })

  describe('searchProductsMultilingual', () => {
    it('finds watch for English query', () => {
      const results = searchProductsMultilingual('I want a watch')
      expect(results.length).toBeGreaterThan(0)
      expect(results.some(p => p.name.toLowerCase().includes('watch'))).toBe(true)
    })

    it('finds watch for Roman Urdu query', () => {
      const results = searchProductsMultilingual('Mujhe watch chahiye')
      expect(results.length).toBeGreaterThan(0)
      expect(results.some(p => p.name.toLowerCase().includes('watch'))).toBe(true)
    })

    it('finds headphones under $80 for English query', () => {
      const results = searchProductsMultilingual('I need wireless headphones under $80')
      expect(results.length).toBeGreaterThan(0)
      expect(results.every(p => p.price <= 80)).toBe(true)
    })

    it('finds products for mixed query', () => {
      const results = searchProductsMultilingual('Mujhe achi rating wali headphones show karo')
      expect(results.length).toBeGreaterThan(0)
    })

    it('returns empty array for null query', () => {
      expect(searchProductsMultilingual(null)).toEqual([])
    })

    it('returns empty array for empty string', () => {
      expect(searchProductsMultilingual('')).toEqual([])
    })
  })
})
