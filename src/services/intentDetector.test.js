import { describe, it, expect } from 'vitest'
import { detectIntent, INTENTS } from './intentDetector.js'

describe('intentDetector', () => {
  it('detects PRODUCT_SEARCH for watch queries', () => {
    const result = detectIntent('I want a watch')
    expect(result.intent).toBe(INTENTS.PRODUCT_SEARCH)
    expect(result.confidence).toBeGreaterThan(0)
  })

  it('detects PRODUCT_SEARCH for show me queries', () => {
    const result = detectIntent('Show me watches under $100')
    expect(result.intent).toBe(INTENTS.PRODUCT_SEARCH)
  })

  it('detects PRODUCT_RECOMMENDATION for recommend queries', () => {
    const result = detectIntent('Recommend a good watch')
    expect(result.intent).toBe(INTENTS.PRODUCT_RECOMMENDATION)
  })

  it('detects PRODUCT_COMPARISON for compare queries', () => {
    const result = detectIntent('Compare these two watches')
    expect(result.intent).toBe(INTENTS.PRODUCT_COMPARISON)
  })

  it('detects PRODUCT_INFORMATION for product detail queries', () => {
    const result = detectIntent('Tell me about the Smart Watch Pro')
    expect(result.intent).toBe(INTENTS.PRODUCT_INFORMATION)
  })

  it('detects ORDER_STATUS for order tracking queries', () => {
    const result = detectIntent('Where is my order?')
    expect(result.intent).toBe(INTENTS.ORDER_STATUS)
  })

  it('detects ORDER_CANCELLATION for cancel queries', () => {
    const result = detectIntent('Cancel my order')
    expect(result.intent).toBe(INTENTS.ORDER_CANCELLATION)
  })

  it('detects RETURN_REQUEST for return queries', () => {
    const result = detectIntent('I want to return my shoes')
    expect(result.intent).toBe(INTENTS.RETURN_REQUEST)
  })

  it('detects REFUND_REQUEST for refund queries', () => {
    const result = detectIntent('When will I get my refund?')
    expect(result.intent).toBe(INTENTS.REFUND_REQUEST)
  })

  it('detects COMPLAINT for damaged product queries', () => {
    const result = detectIntent('My product arrived damaged')
    expect(result.intent).toBe(INTENTS.COMPLAINT)
  })

  it('detects SHIPPING_INQUIRY for delivery queries', () => {
    const result = detectIntent('How long does delivery take?')
    expect(result.intent).toBe(INTENTS.SHIPPING_INQUIRY)
  })

  it('detects PAYMENT_INQUIRY for payment queries', () => {
    const result = detectIntent('What payment methods do you accept?')
    expect(result.intent).toBe(INTENTS.PAYMENT_INQUIRY)
  })

  it('detects FAQ for policy queries', () => {
    const result = detectIntent('What is your return policy?')
    expect(result.intent).toBe(INTENTS.FAQ)
  })

  it('detects HUMAN_SUPPORT for human escalation', () => {
    const result = detectIntent('I want to speak to a human')
    expect(result.intent).toBe(INTENTS.HUMAN_SUPPORT)
  })

  it('detects GENERAL_INQUIRY for greetings', () => {
    const result = detectIntent('Hello, I need some help')
    expect(result.intent).toBe(INTENTS.GENERAL_INQUIRY)
  })

  it('returns entities for price queries', () => {
    const result = detectIntent('Show me watches under $100')
    expect(result.entities.maxPrice).toBe(100)
  })

  it('returns entities for product type', () => {
    const result = detectIntent('I want a watch')
    expect(result.entities.productType).toBe('watch')
  })

  it('returns structured output with all fields', () => {
    const result = detectIntent('I want a watch')
    expect(result).toHaveProperty('intent')
    expect(result).toHaveProperty('confidence')
    expect(result).toHaveProperty('entities')
    expect(result.entities).toHaveProperty('productType')
    expect(result.entities).toHaveProperty('keywords')
  })
})
