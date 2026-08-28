import { describe, it, expect } from 'vitest'
import { aiService } from './aiService.js'
import productsData from '../data/products.json'
import categoriesData from '../data/categories.json'

describe('aiService integration', () => {
  it('finds watch for I want a watch', async () => {
    const result = await aiService.processMessage('I want a watch', productsData, categoriesData)
    console.log('Result:', JSON.stringify(result, null, 2))
    expect(result.products.length).toBeGreaterThan(0)
    expect(result.products.some(p => p.name.toLowerCase().includes('watch'))).toBe(true)
  })

  it('finds watch for Show me a watch', async () => {
    const result = await aiService.processMessage('Show me a watch', productsData, categoriesData)
    console.log('Result:', JSON.stringify(result, null, 2))
    expect(result.products.length).toBeGreaterThan(0)
    expect(result.products.some(p => p.name.toLowerCase().includes('watch'))).toBe(true)
  })

  it('recommends products', async () => {
    const result = await aiService.processMessage('Recommend products', productsData, categoriesData)
    console.log('Result:', JSON.stringify(result, null, 2))
    expect(result.products.length).toBeGreaterThan(0)
  })
})
