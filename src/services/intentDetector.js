const INTENTS = {
  PRODUCT_SEARCH: 'PRODUCT_SEARCH',
  PRODUCT_RECOMMENDATION: 'PRODUCT_RECOMMENDATION',
  PRODUCT_COMPARISON: 'PRODUCT_COMPARISON',
  PRODUCT_INFORMATION: 'PRODUCT_INFORMATION',
  ORDER_STATUS: 'ORDER_STATUS',
  ORDER_CANCELLATION: 'ORDER_CANCELLATION',
  RETURN_REQUEST: 'RETURN_REQUEST',
  REFUND_REQUEST: 'REFUND_REQUEST',
  COMPLAINT: 'COMPLAINT',
  SHIPPING_INQUIRY: 'SHIPPING_INQUIRY',
  PAYMENT_INQUIRY: 'PAYMENT_INQUIRY',
  FAQ: 'FAQ',
  HUMAN_SUPPORT: 'HUMAN_SUPPORT',
  GENERAL_INQUIRY: 'GENERAL_INQUIRY'
}

const INTENT_RULES = [
  {
    intent: INTENTS.HUMAN_SUPPORT,
    priority: 100,
    keywords: [
      'speak to human', 'talk to human', 'human agent', 'real person',
      'customer service', 'live agent', 'human support', 'speak to someone',
      'talk to someone', 'agent', 'representative', 'speak to a human',
      'talk to a human', 'speak with a human', 'talk with a human',
      'customer care', 'support agent', 'call center', 'talk to a rep',
      'speak to a rep', 'talk to someone', 'need to talk', 'want to talk'
    ]
  },
  {
    intent: INTENTS.ORDER_CANCELLATION,
    priority: 90,
    keywords: [
      'cancel my order', 'cancel order', 'stop my order', 'withdraw order',
      'cancel purchase', 'i want to cancel', 'need to cancel', 'cancel my purchase',
      'cancelling order', 'cancellation', 'cancel transaction', 'abort order'
    ]
  },
  {
    intent: INTENTS.ORDER_STATUS,
    priority: 80,
    keywords: [
      'where is my order', 'order status', 'track my order', 'tracking',
      'delivery status', 'order update', 'when will my order', 'order arrived',
      'my order', 'order number', 'order #', 'tracking number', 'order details',
      'where is my package', 'shipment tracking', 'package status',
      'order shipped', 'shipping status', 'where is my shipment'
    ]
  },
  {
    intent: INTENTS.REFUND_REQUEST,
    priority: 88,
    keywords: [
      'refund', 'get my money back', 'money back', 'refund status',
      'when will i get my refund', 'refund request', 'request refund',
      'refund my', 'refund for', 'how do i get a refund', 'can i get a refund',
      'refund process', 'refund timeline', 'refund policy'
    ]
  },
  {
    intent: INTENTS.RETURN_REQUEST,
    priority: 86,
    keywords: [
      'return my', 'send back', 'return item', 'return product',
      'return order', 'want to return', 'need to return', 'return this',
      'i want to return', 'returning', 'how to return',
      'can i return', 'eligible for return', 'return request'
    ]
  },
  {
    intent: INTENTS.COMPLAINT,
    priority: 95,
    keywords: [
      'damaged', 'defective', 'broken', 'not working', 'faulty',
      'complaint', 'unsatisfied', 'unhappy', 'poor quality', 'issue with',
      'problem with', 'wrong item', 'missing parts', 'not as described',
      'poor quality', 'bad quality', 'scratched', 'dented', 'malfunction',
      'doesn\'t work', "doesn't work", 'not functioning'
    ]
  },
  {
    intent: INTENTS.PRODUCT_COMPARISON,
    priority: 70,
    keywords: [
      'compare', 'comparison', 'vs', 'versus', 'difference between',
      'which is better', 'better than', 'pros and cons', 'side by side',
      'comparing', 'compared to', 'versus', 'how does', 'distinguish'
    ]
  },
  {
    intent: INTENTS.PRODUCT_INFORMATION,
    priority: 65,
    keywords: [
      'tell me about', 'details about', 'information about', 'specs of',
      'specifications of', 'features of', 'describe', 'more info',
      'learn about', 'tell me more', 'what is', 'what are', 'product info',
      'product details', 'characteristics of', 'what does', 'tech specs'
    ]
  },
  {
    intent: INTENTS.PRODUCT_RECOMMENDATION,
    priority: 55,
    keywords: [
      'recommend', 'suggestion', 'suggest', 'best', 'top', 'popular',
      'what should i buy', 'what do you suggest', 'recommendation', 'advice',
      'good', 'nice', 'favorite', 'picks', 'should i get', 'what to buy',
      'what\'s the best', 'which is the best', 'top picks', 'must have',
      'worth buying', 'good choice'
    ]
  },
  {
    intent: INTENTS.SHIPPING_INQUIRY,
    priority: 80,
    keywords: [
      'shipping', 'delivery', 'ship', 'deliver', 'how long', 'arrive',
      'dispatch', 'tracking', 'courier', 'postage', 'shipment',
      'shipping cost', 'delivery time', 'shipping fee', 'how fast',
      'when will it arrive', 'delivery date', 'shipping options',
      'standard shipping', 'express shipping', 'international shipping'
    ]
  },
  {
    intent: INTENTS.PAYMENT_INQUIRY,
    priority: 80,
    keywords: [
      'payment', 'pay', 'card', 'method', 'checkout', 'secure',
      'credit', 'debit', 'wallet', 'paypal', 'transaction', 'billing',
      'payment method', 'how to pay', 'accepted payments', 'payment options',
      'credit card', 'debit card', 'payment process', 'billing information'
    ]
  },
  {
    intent: INTENTS.FAQ,
    priority: 100,
    keywords: [
      'return policy', 'refund policy', 'shipping policy', 'payment policy',
      'exchange policy', 'warranty policy', 'what is your return policy',
      'what is your refund policy', 'what is your shipping policy',
      'what is your payment policy', 'terms and conditions', 'terms of service',
      'privacy policy', 'faq', 'frequently asked questions',
      'how do i return', 'can i return', 'return policy', 'money back guarantee',
      'warranty coverage', 'what are your policies'
    ]
  },
  {
    intent: INTENTS.PRODUCT_SEARCH,
    priority: 30,
    keywords: [
      'find', 'search', 'looking for', 'do you have', 'show me',
      'i need', 'i want', 'looking to buy', "i'm searching",
      'where can i find', 'looking for a', 'looking for an',
      'need', 'want', 'buy', 'purchase', 'get', 'shopping', 'looking',
      'shop', 'browse', 'any', 'available', 'in stock'
    ]
  }
]

const GREETING_PATTERNS = /^(hi|hello|hey|good morning|good evening|good afternoon|how are you|what'?s up|howdy|greetings)/i

const PRICE_PATTERN = /(?:under|below|less than|max|up to|cheaper than|between|budget|spend|cost|price|priced)\s+\$?(\d+(?:\.\d+)?)/i
const PRICE_RANGE_PATTERN = /\$?(\d+(?:\.\d+)?)\s*[-–to]+\s*\$?(\d+(?:\.\d+)?)/i
const RATING_PATTERN = /(?:rating|rated|stars?|score)\s+(?:above|over|at least|minimum|min|more than)\s+(\d+(?:\.\d+)?)/i
const ORDER_ID_PATTERN = /(?:order|ord)\s*#?\s*([A-Z0-9-]{3,})/i

function extractEntities(text) {
  const entities = {
    productType: null,
    category: null,
    maxPrice: null,
    minPrice: null,
    minRating: null,
    orderId: null,
    keywords: []
  }

  const lower = text.toLowerCase()

  const categoryKeywords = [
    { id: 'electronics', words: ['electronics', 'electronic'] },
    { id: 'fashion', words: ['fashion', 'clothing', 'apparel'] },
    { id: 'home-kitchen', words: ['home', 'kitchen', 'furniture'] },
    { id: 'sports', words: ['sports', 'sport', 'athletic', 'fitness'] },
    { id: 'books', words: ['books', 'book', 'novels'] },
    { id: 'beauty', words: ['beauty', 'cosmetics', 'makeup', 'skincare', 'personal care'] }
  ]
  for (const cat of categoryKeywords) {
    if (cat.words.some(w => new RegExp(`\\b${w}\\b`, 'i').test(lower))) {
      entities.category = cat.id
      break
    }
  }

  const productTypes = [
    'power bank', 'headphones', 'earbuds', 'keyboard', 'webcam', 'speaker', 'camera', 'laptop', 't-shirt', 'shirt', 'shoes', 'watch', 'phone', 'book', 'cream', 'makeup',
    'tablet', 'monitor', 'mouse', 'charger', 'case', 'headset', 'microphone', 'printer', 'router', 'smartwatch', 'jeans', 'jacket', 'dress', 'boots', 'sandals',
    'pants', 'shorts', 'hat', 'sunglasses', 'wallet', 'bag', 'backpack', 'luggage',
    'sofa', 'table', 'chair', 'lamp', 'bed', 'desk', 'shelf', 'cookware', 'pots', 'pans', 'knife', 'cutlery',
    'treadmill', 'bike', 'ball', 'racket', 'gloves', 'helmet',
    'novel', 'textbook', 'magazine', 'journal',
    'perfume', 'lotion', 'serum', 'shampoo', 'conditioner', 'soap'
  ]

  // Sort product types by length descending so multi-word types match first
  const sortedProductTypes = [...productTypes].sort((a, b) => b.split(/\s+/).length - a.split(/\s+/).length)

  for (const type of sortedProductTypes) {
    const escaped = type.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    if (new RegExp(`\\b${escaped}`, 'i').test(lower)) {
      entities.productType = type
      break
    }
  }

  const priceMatch = text.match(PRICE_PATTERN)
  if (priceMatch) {
    entities.maxPrice = Number(priceMatch[1])
  }

  const rangeMatch = text.match(PRICE_RANGE_PATTERN)
  if (rangeMatch) {
    entities.minPrice = Number(rangeMatch[1])
    entities.maxPrice = Number(rangeMatch[2])
  }

  const ratingMatch = text.match(RATING_PATTERN)
  if (ratingMatch) {
    entities.minRating = Number(ratingMatch[1])
  }

  const orderMatch = text.match(ORDER_ID_PATTERN)
  if (orderMatch) {
    entities.orderId = orderMatch[1]
  }

  const words = lower.replace(/[^\w\s]/g, '').split(/\s+/).filter(w => w.length > 2)
  entities.keywords = [...new Set(words)]

  return entities
}

function tokenize(lower) {
  return lower.replace(/[^\w\s]/g, '').split(/\s+/).filter(w => w.length > 0)
}

function hasKeyword(lower, keyword) {
  const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return new RegExp(`\\b${escaped}\\b`, 'i').test(lower)
}

export function detectIntent(message) {
  if (!message || typeof message !== 'string') {
    return { intent: INTENTS.GENERAL_INQUIRY, confidence: 0, entities: extractEntities('') }
  }

  const text = message.trim()
  const lower = text.toLowerCase()

  if (GREETING_PATTERNS.test(text)) {
    return {
      intent: INTENTS.GENERAL_INQUIRY,
      confidence: 0.9,
      entities: extractEntities(text)
    }
  }

  const scores = {}

  for (const rule of INTENT_RULES) {
    let score = 0
    for (const keyword of rule.keywords) {
      if (hasKeyword(lower, keyword)) {
        score += rule.priority
      }
    }
    if (score > 0) {
      scores[rule.intent] = (scores[rule.intent] || 0) + score
    }
  }

  // Synonym-based enhancement for product recommendation detection
  if (
    scores[INTENTS.PRODUCT_RECOMMENDATION] === undefined &&
    (hasKeyword(lower, 'recommend') || hasKeyword(lower, 'suggest') ||
     hasKeyword(lower, 'best') || hasKeyword(lower, 'top') ||
     hasKeyword(lower, 'should') || hasKeyword(lower, 'worth') ||
     hasKeyword(lower, 'ideal') || hasKeyword(lower, 'favorite') ||
     hasKeyword(lower, 'recommendation') || hasKeyword(lower, 'advice') ||
     hasKeyword(lower, 'picks'))
  ) {
    scores[INTENTS.PRODUCT_RECOMMENDATION] = (scores[INTENTS.PRODUCT_RECOMMENDATION] || 0) + 50
  }

  // Synonym-based enhancement for product search detection
  if (
    scores[INTENTS.PRODUCT_SEARCH] === undefined &&
    (hasKeyword(lower, 'looking') || hasKeyword(lower, 'find') ||
     hasKeyword(lower, 'search') || hasKeyword(lower, 'want') ||
     hasKeyword(lower, 'need') || hasKeyword(lower, 'buy') ||
     hasKeyword(lower, 'get') || hasKeyword(lower, 'purchase') ||
     hasKeyword(lower, 'looking for') || hasKeyword(lower, 'any'))
  ) {
    scores[INTENTS.PRODUCT_SEARCH] = (scores[INTENTS.PRODUCT_SEARCH] || 0) + 30
  }

  // Synonym-based enhancement for comparison detection
  // Only trigger comparison if there are actual comparison indicators (not just "which")
  if (
    scores[INTENTS.PRODUCT_COMPARISON] === undefined &&
    (hasKeyword(lower, 'compare') || hasKeyword(lower, 'comparison') ||
     hasKeyword(lower, 'vs') || hasKeyword(lower, 'versus') ||
     hasKeyword(lower, 'difference between') || hasKeyword(lower, 'better than') ||
     hasKeyword(lower, 'pros and cons') || hasKeyword(lower, 'side by side') ||
     hasKeyword(lower, 'compared to'))
  ) {
    scores[INTENTS.PRODUCT_COMPARISON] = (scores[INTENTS.PRODUCT_COMPARISON] || 0) + 70
  }

  // Synonym-based enhancement for product info detection
  if (
    scores[INTENTS.PRODUCT_INFORMATION] === undefined &&
    (hasKeyword(lower, 'tell me about') || hasKeyword(lower, 'details') ||
     hasKeyword(lower, 'information about') || hasKeyword(lower, 'specs') ||
     hasKeyword(lower, 'specifications') || hasKeyword(lower, 'features') ||
     hasKeyword(lower, 'describe') || hasKeyword(lower, 'learn about') ||
     hasKeyword(lower, 'what is') || hasKeyword(lower, 'what are'))
  ) {
    scores[INTENTS.PRODUCT_INFORMATION] = (scores[INTENTS.PRODUCT_INFORMATION] || 0) + 65
  }

  // Synonym-based enhancement for shipping detection
  if (
    scores[INTENTS.SHIPPING_INQUIRY] === undefined &&
    (hasKeyword(lower, 'shipping') || hasKeyword(lower, 'delivery') ||
     hasKeyword(lower, 'ship') || hasKeyword(lower, 'deliver') ||
     hasKeyword(lower, 'arrive') || hasKeyword(lower, 'dispatch') ||
     hasKeyword(lower, 'tracking') || hasKeyword(lower, 'how long') ||
     hasKeyword(lower, 'courier') || hasKeyword(lower, 'postage'))
  ) {
    scores[INTENTS.SHIPPING_INQUIRY] = (scores[INTENTS.SHIPPING_INQUIRY] || 0) + 80
  }

  let bestIntent = INTENTS.GENERAL_INQUIRY
  let bestScore = 0

  for (const [intent, score] of Object.entries(scores)) {
    if (score > bestScore) {
      bestScore = score
      bestIntent = intent
    }
  }

  let confidence = bestScore > 0 ? Math.min(0.99, bestScore / 200) : 0.1

  // Boost confidence if entities were extracted (indicates product-related query)
  const entities = extractEntities(text)
  if (bestScore > 0 && (entities.productType || entities.category || entities.maxPrice || entities.minRating)) {
    confidence = Math.min(0.99, confidence + 0.1)
  }

  // If only a generic FAQ score exists but entities indicate a product query, promote INTENT
  if (bestIntent === INTENTS.FAQ && (entities.productType || entities.category || entities.maxPrice)) {
    // Check if any product-related intent scored
    if (scores[INTENTS.PRODUCT_SEARCH] >= 30) {
      bestIntent = INTENTS.PRODUCT_SEARCH
    } else if (scores[INTENTS.PRODUCT_RECOMMENDATION] >= 50) {
      bestIntent = INTENTS.PRODUCT_RECOMMENDATION
    } else {
      // Low-confidence FAQ with product context: treat as product search
      bestIntent = INTENTS.PRODUCT_SEARCH
      confidence = 0.4
    }
  }

  return {
    intent: bestIntent,
    confidence,
    entities
  }
}

export { INTENTS }
