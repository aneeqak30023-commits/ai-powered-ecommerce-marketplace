import { describe, it, expect } from 'vitest'
import { searchKnowledgeBase } from './knowledgeBase.js'
import { detectIntent, INTENTS } from './intentDetector.js'

describe('knowledgeBase', () => {
  it('returns shipping FAQ for shipping questions', () => {
    const result = searchKnowledgeBase('How long does shipping take?')
    expect(result).not.toBeNull()
    expect(result.id).toBe('shipping-policy')
    expect(result.category).toBe('shipping')
  })

  it('returns delivery FAQ for delivery questions', () => {
    const result = searchKnowledgeBase('How long does delivery take?')
    expect(result).not.toBeNull()
    expect(result.category).toBe('shipping')
  })

  it('returns return-policy FAQ for return questions', () => {
    const result = searchKnowledgeBase('What is your return policy?')
    expect(result).not.toBeNull()
    expect(result.id).toBe('return-policy')
    expect(result.category).toBe('returns')
  })

  it('returns refund FAQ for refund questions', () => {
    const result = searchKnowledgeBase('When will I get my refund?')
    expect(result).not.toBeNull()
    expect(result.id).toBe('refund-timeline')
    expect(result.category).toBe('returns')
  })

  it('returns payment FAQ for payment questions', () => {
    const result = searchKnowledgeBase('What payment methods do you accept?')
    expect(result).not.toBeNull()
    expect(result.id).toBe('payment-methods')
    expect(result.category).toBe('payment')
  })

  it('returns free shipping FAQ for free shipping questions', () => {
    const result = searchKnowledgeBase('Is shipping free?')
    expect(result).not.toBeNull()
    expect(result.id).toBe('free-shipping')
  })

  it('returns express delivery FAQ for express delivery questions', () => {
    const result = searchKnowledgeBase('Do you offer express delivery?')
    expect(result).not.toBeNull()
    expect(result.id).toBe('express-delivery')
  })

  it('returns order tracking FAQ for tracking questions', () => {
    const result = searchKnowledgeBase('How can I track my order?')
    expect(result).not.toBeNull()
    expect(result.id).toBe('order-tracking')
  })

  it('returns order cancellation FAQ for cancel questions', () => {
    const result = searchKnowledgeBase('Can I cancel my order?')
    expect(result).not.toBeNull()
    expect(result.id).toBe('order-cancellation')
  })

  it('returns no match for unknown questions', () => {
    const result = searchKnowledgeBase('What is the meaning of life?')
    expect(result).toBeNull()
  })

  it('returns return-policy for plural "return policies" query', () => {
    const result = searchKnowledgeBase('What are your return policies?')
    expect(result).not.toBeNull()
    expect(result.id).toBe('return-policy')
  })

  it('returns return-policy for "returns" query', () => {
    const result = searchKnowledgeBase('returns')
    expect(result).not.toBeNull()
    expect(result.id).toBe('return-policy')
  })

  it('returns no match for empty string', () => {
    const result = searchKnowledgeBase('')
    expect(result).toBeNull()
  })

  it('returns no match for null', () => {
    const result = searchKnowledgeBase(null)
    expect(result).toBeNull()
  })

  it('returns no match for non-string input', () => {
    const result = searchKnowledgeBase(123)
    expect(result).toBeNull()
  })

  it('returns product search intent for watch queries', () => {
    const result = detectIntent('I want a watch')
    expect(result.intent).toBe(INTENTS.PRODUCT_SEARCH)
  })

  it('returns product recommendation intent for recommend queries', () => {
    const result = detectIntent('Recommend products')
    expect(result.intent).toBe(INTENTS.PRODUCT_RECOMMENDATION)
  })

  it('returns general inquiry for greetings', () => {
    const result = detectIntent('Hello')
    expect(result.intent).toBe(INTENTS.GENERAL_INQUIRY)
  })
})
