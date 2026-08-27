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
      'talk to a human', 'speak with a human', 'talk with a human'
    ]
  },
  {
    intent: INTENTS.ORDER_CANCELLATION,
    priority: 90,
    keywords: [
      'cancel my order', 'cancel order', 'stop my order', 'withdraw order',
      'cancel purchase', 'i want to cancel', 'need to cancel', 'cancel my purchase'
    ]
  },
  {
    intent: INTENTS.ORDER_STATUS,
    priority: 80,
    keywords: [
      'where is my order', 'order status', 'track my order', 'tracking',
      'delivery status', 'order update', 'when will my order', 'order arrived',
      'my order', 'order number', 'order #', 'tracking number', 'order details'
    ]
  },
  {
    intent: INTENTS.REFUND_REQUEST,
    priority: 85,
    keywords: [
      'refund', 'get my money back', 'money back', 'refund status',
      'when will i get my refund', 'refund request', 'request refund',
      'refund my', 'refund for'
    ]
  },
  {
    intent: INTENTS.RETURN_REQUEST,
    priority: 85,
    keywords: [
      'return my', 'send back', 'return item', 'return product',
      'return order', 'want to return', 'need to return', 'return this',
      'return the', 'i want to return'
    ]
  },
  {
    intent: INTENTS.COMPLAINT,
    priority: 95,
    keywords: [
      'damaged', 'defective', 'broken', 'not working', 'faulty',
      'complaint', 'unsatisfied', 'unhappy', 'poor quality', 'issue with',
      'problem with', 'wrong item', 'missing parts', 'not as described'
    ]
  },
  {
    intent: INTENTS.PRODUCT_COMPARISON,
    priority: 70,
    keywords: [
      'compare', 'comparison', 'vs', 'versus', 'difference between',
      'which is better', 'better than', 'pros and cons'
    ]
  },
  {
    intent: INTENTS.PRODUCT_INFORMATION,
    priority: 60,
    keywords: [
      'tell me about', 'details about', 'information about', 'specs of',
      'specifications of', 'features of', 'describe', 'more info',
      'learn about', 'tell me more'
    ]
  },
  {
    intent: INTENTS.PRODUCT_RECOMMENDATION,
    priority: 50,
    keywords: [
      'recommend', 'suggestion', 'suggest', 'best', 'top', 'popular',
      'what should i buy', 'what do you suggest', 'recommendation', 'advice',
      'good', 'nice', 'favorite', 'picks'
    ]
  },
  {
    intent: INTENTS.SHIPPING_INQUIRY,
    priority: 75,
    keywords: [
      'shipping', 'delivery', 'ship', 'deliver', 'how long', 'arrive',
      'dispatch', 'tracking', 'courier', 'postage', 'shipment'
    ]
  },
  {
    intent: INTENTS.PAYMENT_INQUIRY,
    priority: 75,
    keywords: [
      'payment', 'pay', 'card', 'method', 'checkout', 'secure',
      'credit', 'debit', 'wallet', 'paypal', 'transaction', 'billing'
    ]
  },
  {
    intent: INTENTS.FAQ,
    priority: 45,
    keywords: [
      'policy', 'policies', 'terms', 'conditions', 'faq', 'help',
      'how do i', 'how can i', 'what are your', 'is it possible'
    ]
  },
  {
    intent: INTENTS.PRODUCT_SEARCH,
    priority: 30,
    keywords: [
      'find', 'search', 'looking for', 'do you have', 'show me',
      'i need', 'i want', 'looking to buy', "i'm searching",
      'where can i find', 'looking for a', 'looking for an'
    ]
  }
]

const GREETING_PATTERNS = /^(hi|hello|hey|good morning|good evening|good afternoon|how are you|what'?s up|howdy|greetings)/i

const PRICE_PATTERN = /(?:under|below|less than|max|up to|cheaper than|between)\s+\$?(\d+(?:\.\d+)?)/i
const PRICE_RANGE_PATTERN = /\$?(\d+(?:\.\d+)?)\s*[-–to]+\s*\$?(\d+(?:\.\d+)?)/i
const RATING_PATTERN = /(?:rating|rated|stars?|score)\s+(?:above|over|at least|minimum|min)\s+(\d+(?:\.\d+)?)/i
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

  const categories = ['electronics', 'fashion', 'home', 'kitchen', 'sports', 'books', 'beauty']
  for (const cat of categories) {
    if (lower.includes(cat)) {
      entities.category = cat
      break
    }
  }

  const productTypes = ['watch', 'phone', 'laptop', 'headphones', 'earbuds', 'keyboard', 'speaker', 'camera', 'webcam', 'power bank', 't-shirt', 'shirt', 'shoes', 'book', 'cream', 'makeup']
  for (const type of productTypes) {
    if (lower.includes(type)) {
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
      if (lower.includes(keyword)) {
        score += rule.priority
      }
    }
    if (score > 0) {
      scores[rule.intent] = score
    }
  }

  let bestIntent = INTENTS.GENERAL_INQUIRY
  let bestScore = 0

  for (const [intent, score] of Object.entries(scores)) {
    if (score > bestScore) {
      bestScore = score
      bestIntent = intent
    }
  }

  const confidence = bestScore > 0 ? Math.min(0.99, bestScore / 200) : 0.1

  return {
    intent: bestIntent,
    confidence,
    entities: extractEntities(text)
  }
}

export { INTENTS }
