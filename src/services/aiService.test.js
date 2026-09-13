import { describe, it, expect } from 'vitest'
import { aiService } from './aiService.js'
import productsData from '../data/products.json'
import categoriesData from '../data/categories.json'

describe('aiService integration', () => {
  it('finds watch for I want a watch', async () => {
    const result = await aiService.processMessage('I want a watch', productsData, [], [])
    console.log('Result:', JSON.stringify(result, null, 2))
    expect(result.products.length).toBeGreaterThan(0)
    expect(result.products.some(p => p.name.toLowerCase().includes('watch'))).toBe(true)
  })

  it('finds watch for Show me a watch', async () => {
    const result = await aiService.processMessage('Show me a watch', productsData, [], [])
    console.log('Result:', JSON.stringify(result, null, 2))
    expect(result.products.length).toBeGreaterThan(0)
    expect(result.products.some(p => p.name.toLowerCase().includes('watch'))).toBe(true)
  })

  it('recommends products', async () => {
    const result = await aiService.processMessage('Recommend products', productsData, [], [])
    console.log('Result:', JSON.stringify(result, null, 2))
    expect(result.products.length).toBeGreaterThan(0)
  })

  it('returns knowledge base answer for FAQ intents when items provided', async () => {
    const kbItems = [
      {
        id: 'shipping-policy',
        category: 'shipping',
        question: 'How long does shipping take?',
        answer: 'Standard delivery takes 5-7 business days.',
        keywords: ['shipping', 'delivery', 'ship'],
        priority: 1,
      }
    ]

    const result = await aiService.processMessage('How long does shipping take?', productsData, kbItems, [])
    expect(result.text).toBe('Standard delivery takes 5-7 business days.')
    expect(result.source).toBe('knowledge-base')
  })

  it('returns support ticket action for complaint intent', async () => {
    const result = await aiService.processMessage('My item arrived damaged', productsData, [], [])
    expect(result.intent).toBe('COMPLAINT')
    expect(result.action).toBe('create_support_ticket')
    expect(result.actionData.category).toBe('complaint')
  })

  it('returns support ticket action for human support intent', async () => {
    const result = await aiService.processMessage('I want to speak to a human', productsData, [], [])
    expect(result.intent).toBe('HUMAN_SUPPORT')
    expect(result.action).toBe('create_support_ticket')
  })
})
