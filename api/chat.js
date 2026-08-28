export default async function handler(request, response) {
  response.setHeader('Access-Control-Allow-Origin', '*')
  response.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (request.method === 'OPTIONS') {
    return response.status(200).json({})
  }

  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const body = request.body || {}
    const { message, products = [], categories = [] } = body

    if (!message || typeof message !== 'string') {
      return response.status(400).json({ error: 'Message is required' })
    }

    const normalizedMessage = normalizeToEnglish(message)

    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      console.error('GEMINI_API_KEY is not configured')
      return response.status(500).json({ error: 'AI service not configured' })
    }

    const intent = detectIntent(normalizedMessage)

    const faqIntents = new Set([
      'FAQ',
      'SHIPPING_INQUIRY',
      'PAYMENT_INQUIRY',
      'RETURN_REQUEST',
      'REFUND_REQUEST',
      'ORDER_CANCELLATION'
    ])

    if (faqIntents.has(intent.intent)) {
      const kbMatch = searchKnowledgeBase(normalizedMessage)
      if (kbMatch) {
        return response.status(200).json({ text: kbMatch.answer, intent: intent.intent, source: 'knowledge-base', knowledgeBaseId: kbMatch.id })
      }
    }

    const systemPrompt = `You are a helpful shopping assistant for NexMart, an AI-powered e-commerce marketplace. 
You have access to the current product catalog. 
Only recommend products that exist in the catalog. 
Do not invent products, prices, or policies. 
If you don't know the answer, say so and offer to help with something else. 
Keep responses concise and helpful.`

    const catalogContext = JSON.stringify({ products, categories }, null, 2)

    const geminiBody = {
      contents: [
        { role: 'user', parts: [{ text: `${systemPrompt}\n\nCatalog:\n${catalogContext}\n\nUser: ${normalizedMessage}` }] }
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 512
      }
    }

    let geminiResponse
    try {
      geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(geminiBody)
      })
    } catch (fetchError) {
      console.error('Gemini fetch error:', fetchError)
      return response.status(500).json({ error: 'AI service temporarily unavailable' })
    }

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text().catch(() => 'Unknown error')
      console.error('Gemini API error:', geminiResponse.status, errorText)
      return response.status(500).json({ error: 'AI service temporarily unavailable' })
    }

    let data
    try {
      data = await geminiResponse.json()
    } catch (parseError) {
      console.error('Gemini response parse error:', parseError)
      return response.status(500).json({ error: 'AI service temporarily unavailable' })
    }

    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "I'm sorry, I couldn't process that right now. Please try again."

    return response.status(200).json({ text, intent })
  } catch (error) {
    console.error('Chat API error:', error)
    return response.status(500).json({ error: 'Internal server error' })
  }
}

function normalizeToEnglish(text) {
  return text
    .replace(/مجھے/gi, 'i want')
    .replace(/چاہیے/gi, 'want')
    .replace(/دکھائیں/gi, 'show me')
    .replace(/دکھادو/gi, 'show me')
    .replace(/سے کم/gi, 'under')
    .replace(/سے زیادہ/gi, 'above')
    .replace(/سے زائد/gi, 'above')
    .replace(/والی/gi, 'with')
    .replace(/کا/gi, 'of')
    .replace(/کی/gi, 'of')
    .replace(/کے/gi, 'of')
    .replace(/میں/gi, 'in')
    .replace(/ہے/gi, 'is')
    .replace(/بہت/gi, 'very')
    .replace(/اچھا/gi, 'good')
    .replace(/اچھی/gi, 'good')
    .replace(/\bmujhe\b/gi, 'i want')
    .replace(/\bchahiye\b/gi, 'want')
    .replace(/\bdikhao\b/gi, 'show me')
    .replace(/\bdikhado\b/gi, 'show me')
    .replace(/\bdikhaen\b/gi, 'show me')
    .replace(/\bse kam\b/gi, 'under')
    .replace(/\bse zyada\b/gi, 'above')
    .replace(/\bse ziyada\b/gi, 'above')
    .replace(/\bkam se\b/gi, 'under')
    .replace(/\bzyada se\b/gi, 'above')
    .replace(/\bwali\b/gi, 'with')
    .replace(/\bki\b/gi, 'of')
    .replace(/\bka\b/gi, 'of')
    .replace(/\bke\b/gi, 'of')
    .replace(/\bhai\b/gi, 'is')
    .replace(/\bmein\b/gi, 'in')
    .replace(/\bmain\b/gi, 'in')
    .replace(/\bbht\b/gi, 'very')
    .replace(/\bbohat\b/gi, 'very')
    .replace(/\bachha\b/gi, 'good')
    .replace(/\baccha\b/gi, 'good')
}

function detectIntent(message) {
  if (!message || typeof message !== 'string') {
    return { intent: 'GENERAL_INQUIRY', confidence: 0 }
  }

  const text = message.toLowerCase().trim()

  const patterns = [
    { intent: 'HUMAN_SUPPORT', priority: 100, keywords: ['speak to human', 'talk to human', 'human agent', 'real person', 'customer service', 'live agent', 'human support', 'speak to someone', 'talk to someone', 'agent', 'representative'] },
    { intent: 'ORDER_CANCELLATION', priority: 90, keywords: ['cancel my order', 'cancel order', 'stop my order', 'withdraw order', 'cancel purchase', 'i want to cancel', 'need to cancel'] },
    { intent: 'ORDER_STATUS', priority: 80, keywords: ['where is my order', 'order status', 'track my order', 'tracking', 'delivery status', 'order update', 'when will my order', 'order arrived', 'my order', 'order number', 'order #', 'tracking number'] },
    { intent: 'REFUND_REQUEST', priority: 85, keywords: ['refund', 'get my money back', 'money back', 'refund status', 'when will i get my refund', 'refund request', 'request refund'] },
    { intent: 'RETURN_REQUEST', priority: 85, keywords: ['return', 'return my', 'send back', 'return item', 'return product', 'return order', 'want to return', 'need to return', 'return policy'] },
    { intent: 'COMPLAINT', priority: 95, keywords: ['damaged', 'defective', 'broken', 'not working', 'faulty', 'complaint', 'unsatisfied', 'unhappy', 'poor quality', 'issue with', 'problem with', 'wrong item', 'missing parts', 'not as described'] },
    { intent: 'PRODUCT_COMPARISON', priority: 70, keywords: ['compare', 'comparison', 'vs', 'versus', 'difference between', 'which is better', 'better than', 'pros and cons'] },
    { intent: 'PRODUCT_INFORMATION', priority: 60, keywords: ['tell me about', 'details about', 'information about', 'specs of', 'specifications of', 'features of', 'what is', 'describe'] },
    { intent: 'PRODUCT_RECOMMENDATION', priority: 50, keywords: ['recommend', 'suggestion', 'suggest', 'best', 'top', 'popular', 'what should i buy', 'what do you suggest', 'recommendation', 'advice', 'good', 'nice', 'favorite', 'picks'] },
    { intent: 'SHIPPING_INQUIRY', priority: 75, keywords: ['shipping', 'delivery', 'ship', 'deliver', 'how long', 'arrive', 'dispatch', 'tracking', 'courier', 'postage', 'shipment'] },
    { intent: 'PAYMENT_INQUIRY', priority: 75, keywords: ['payment', 'pay', 'card', 'method', 'checkout', 'secure', 'credit', 'debit', 'wallet', 'paypal', 'transaction', 'billing'] },
    { intent: 'FAQ', priority: 40, keywords: ['policy', 'policies', 'terms', 'conditions', 'faq', 'help', 'how do i', 'how can i', 'what are your', 'is it possible'] },
    { intent: 'PRODUCT_SEARCH', priority: 30, keywords: ['find', 'search', 'looking for', 'do you have', 'show me', 'i need', 'i want', 'looking to buy', "i'm searching", 'where can i find', 'looking for a', 'looking for an'] }
  ]

  const greetingPattern = /^(hi|hello|hey|good morning|good evening|good afternoon|how are you|what'?s up|howdy|greetings)/i
  if (greetingPattern.test(text)) {
    return { intent: 'GENERAL_INQUIRY', confidence: 0.9 }
  }

  const scores = {}
  for (const rule of patterns) {
    let score = 0
    for (const keyword of rule.keywords) {
      if (text.includes(keyword)) {
        score += rule.priority
      }
    }
    if (score > 0) {
      scores[rule.intent] = score
    }
  }

  let bestIntent = 'GENERAL_INQUIRY'
  let bestScore = 0
  for (const [intent, score] of Object.entries(scores)) {
    if (score > bestScore) {
      bestScore = score
      bestIntent = intent
    }
  }

  const confidence = bestScore > 0 ? Math.min(0.99, bestScore / 200) : 0.1

  return { intent: bestIntent, confidence }
}

const KNOWLEDGE_BASE = [
  { "id": "shipping-policy", "category": "shipping", "question": "How long does shipping take?", "answer": "Standard delivery takes 5-7 business days. Express delivery (2-3 business days) is available for $9.99. All orders include tracking information sent to your email.", "keywords": ["shipping", "delivery", "ship", "deliver", "how long", "arrive", "dispatch", "tracking", "courier", "postage", "shipment", "time", "days", "business days"] },
  { "id": "free-shipping", "category": "shipping", "question": "Is shipping free?", "answer": "Yes! We offer free standard shipping on all orders over $50. Orders under $50 have a flat shipping fee of $9.99 for standard delivery.", "keywords": ["free shipping", "shipping cost", "shipping fee", "free delivery", "shipping charges", "shipping price"] },
  { "id": "express-delivery", "category": "shipping", "question": "Do you offer express delivery?", "answer": "Yes, express delivery (2-3 business days) is available for $9.99. You can select this option at checkout.", "keywords": ["express delivery", "fast shipping", "rush delivery", "next day", "overnight", "quick delivery"] },
  { "id": "order-tracking", "category": "shipping", "question": "How can I track my order?", "answer": "Once your order ships, you'll receive a tracking number via email. You can use this number to track your package on the carrier's website. You can also check your order status in the Orders page.", "keywords": ["track order", "tracking number", "tracking info", "where is my order", "order status", "delivery status", "track package", "shipment tracking"] },
  { "id": "return-policy", "category": "returns", "question": "What is your return policy?", "answer": "We have a 30-day hassle-free return policy. If you're not satisfied, simply ship the item back in its original condition for a full refund. Exchanges are also free. Contact support@nexmart.com to initiate a return.", "keywords": ["return policy", "returns", "return item", "return product", "send back", "return order", "30 days", "hassle-free"] },
  { "id": "how-to-return", "category": "returns", "question": "How do I return an item?", "answer": "To return an item, contact our support team at support@nexmart.com or call +1 (555) 123-4567. We'll provide you with a prepaid return label and instructions. Pack the item securely in its original packaging and drop it off at any authorized carrier location.", "keywords": ["how to return", "return process", "return item", "return product", "send back", "return steps", "return instructions"] },
  { "id": "refund-policy", "category": "returns", "question": "How do refunds work?", "answer": "Once we receive and inspect your return, we'll process your refund to the original payment method within 5-10 business days. You'll receive an email confirmation when your refund is processed.", "keywords": ["refund", "refund policy", "money back", "refund status", "refund process", "get my money back", "refund time", "refund method"] },
  { "id": "refund-timeline", "category": "returns", "question": "When will I get my refund?", "answer": "Refunds are typically processed within 5-10 business days after we receive your returned item. The time it takes for the refund to appear in your account depends on your bank or payment provider, usually an additional 3-5 business days.", "keywords": ["when will i get my refund", "refund timeline", "refund duration", "how long refund", "refund waiting time"] },
  { "id": "order-cancellation", "category": "orders", "question": "Can I cancel my order?", "answer": "Yes, you can cancel your order within 1 hour of placing it. After that, the order enters the fulfillment process and cannot be cancelled. To cancel, contact our support team immediately at support@nexmart.com or call +1 (555) 123-4567 with your order number.", "keywords": ["cancel order", "cancel my order", "order cancellation", "stop order", "withdraw order", "cancel purchase", "cancel my purchase"] },
  { "id": "payment-methods", "category": "payment", "question": "What payment methods do you accept?", "answer": "We accept all major credit cards (Visa, MasterCard, American Express, Discover), debit cards, and digital wallets (Apple Pay, Google Pay, PayPal). For this demo, you can use our demo payment option with no real charges. All transactions are secure and encrypted.", "keywords": ["payment methods", "pay", "card", "credit card", "debit card", "checkout", "secure", "wallet", "paypal", "apple pay", "google pay", "transaction", "billing"] },
  { "id": "payment-security", "category": "payment", "question": "Is my payment information secure?", "answer": "Yes, all transactions are encrypted using industry-standard SSL technology. We do not store your full credit card details on our servers. For this demo, payments are simulated and no real charges are made.", "keywords": ["payment security", "secure payment", "safe payment", "encrypted", "credit card safety", "payment protection"] },
  { "id": "failed-payment", "category": "payment", "question": "What happens if my payment fails?", "answer": "If your payment fails, you'll receive an error message at checkout. Please verify your card details, ensure sufficient funds are available, and try again. If the issue persists, contact your bank or try an alternative payment method.", "keywords": ["payment failed", "failed payment", "payment error", "transaction failed", "card declined", "payment not working"] },
  { "id": "product-warranty", "category": "support", "question": "Do products come with a warranty?", "answer": "Most products come with a manufacturer's warranty ranging from 1-2 years. Warranty details are listed on each product page under specifications. For warranty claims, contact the manufacturer directly or reach out to our support team for assistance.", "keywords": ["warranty", "guarantee", "product warranty", "manufacturer warranty", "warranty claim", "coverage"] },
  { "id": "product-support", "category": "support", "question": "How do I get help with a product?", "answer": "You can reach our support team at support@nexmart.com or call +1 (555) 123-4567. Our team is available Monday-Friday, 9am-6pm EST. You can also use this chat for product help! For technical issues, please include your order number and a description of the problem.", "keywords": ["product support", "help with product", "product issue", "product problem", "technical support", "customer service", "support team"] },
  { "id": "contact-us", "category": "support", "question": "How do I contact customer service?", "answer": "You can reach our support team at support@nexmart.com or call +1 (555) 123-4567. Our team is available Monday-Friday, 9am-6pm EST. You can also use the AI chat for instant help with products, orders, and general questions.", "keywords": ["contact", "customer service", "support", "phone", "email", "reach us", "get in touch", "speak to", "call us"] },
  { "id": "stock-availability", "category": "products", "question": "How do I know if a product is in stock?", "answer": "Stock availability is shown on each product page. Items marked 'In Stock' are ready to ship. If an item is out of stock, you can check back later or browse similar products in the same category. You can also sign up for back-in-stock notifications on the product page.", "keywords": ["in stock", "out of stock", "stock", "available", "availability", "inventory", "back in stock"] },
  { "id": "discounts-promotions", "category": "general", "question": "Do you have discounts or promotions?", "answer": "We regularly have sales and promotions! Check the product pages for discount badges showing current deals. Sign up for our newsletter to get exclusive promo codes and early access to deals. Follow us on social media for flash sales and special offers.", "keywords": ["discount", "coupon", "promo", "code", "deal", "sale", "promotion", "offer", "special offer", "save money", "cheap", "reduced price"] },
  { "id": "return-period", "category": "returns", "question": "What is the return window?", "answer": "You have 30 days from the delivery date to return any item. The item must be in its original condition with all tags attached and original packaging. Some items like personal care products and clearance items may not be eligible for return.", "keywords": ["return window", "return period", "how many days to return", "return timeframe", "return deadline", "30 days"] },
  { "id": "exchange-policy", "category": "returns", "question": "Can I exchange an item?", "answer": "Yes, exchanges are free within 30 days of delivery. If you need a different size, color, or product, contact our support team at support@nexmart.com or call +1 (555) 123-4567 to arrange an exchange.", "keywords": ["exchange", "exchange policy", "swap item", "different size", "different color", "exchange item"] },
  { "id": "shipping-cost", "category": "shipping", "question": "How much does shipping cost?", "answer": "Standard shipping is free on orders over $50. For orders under $50, standard shipping costs $9.99. Express delivery (2-3 business days) is available for $9.99 regardless of order total.", "keywords": ["shipping cost", "shipping fee", "shipping price", "delivery charge", "how much shipping", "shipping rates"] },
  { "id": "international-shipping", "category": "shipping", "question": "Do you ship internationally?", "answer": "Currently, we ship within the United States only. International shipping may be available in the future. Please check back later or contact our support team for more information.", "keywords": ["international shipping", "ship abroad", "ship overseas", "international delivery", "worldwide shipping"] },
  { "id": "order-modification", "category": "orders", "question": "Can I modify my order?", "answer": "Order modifications are possible within 1 hour of placing your order. After that, the order enters the fulfillment process and cannot be modified. To request a change, contact our support team immediately with your order number.", "keywords": ["modify order", "change order", "edit order", "update order", "add item to order", "remove item from order"] },
  { "id": "damaged-item", "category": "support", "question": "What if my item arrives damaged?", "answer": "If your item arrives damaged, please take photos of the damaged product and packaging, then contact our support team at support@nexmart.com or call +1 (555) 123-4567 within 48 hours of delivery. We'll arrange a replacement or full refund immediately.", "keywords": ["damaged", "broken", "damage", "cracked", "defective", "arrived damaged", "product damaged", "item damaged"] },
  { "id": "wrong-item", "category": "support", "question": "I received the wrong item.", "answer": "We're sorry for the mix-up! Please contact our support team at support@nexmart.com or call +1 (555) 123-4567 with your order number and photos of the incorrect item. We'll ship the correct item to you right away at no extra cost.", "keywords": ["wrong item", "incorrect item", "wrong product", "wrong order", "received wrong", "mistake"] },
  { "id": "missing-item", "category": "support", "question": "An item is missing from my order.", "answer": "We're sorry to hear that an item is missing. Please check your packing slip first to confirm what was shipped. If an item is truly missing, contact our support team at support@nexmart.com or call +1 (555) 123-4567 with your order number, and we'll investigate and ship the missing item.", "keywords": ["missing item", "missing product", "item not received", "not in box", "forgot item", "incomplete order"] },
  { "id": "demo-payment-info", "category": "payment", "question": "How does the demo payment work?", "answer": "For this demo, you can use the demo payment option at checkout. No real charges will be made to your card. The payment is simulated to demonstrate the checkout flow. In a live environment, real payment processing would be integrated.", "keywords": ["demo payment", "test payment", "practice payment", "fake payment", "demo checkout", "test checkout"] }
]

function searchKnowledgeBase(query) {
  if (!query || typeof query !== 'string') {
    return null
  }

  const text = query.toLowerCase().trim()
  if (!text) {
    return null
  }

  const words = text
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(w => w.length > 2)

  if (words.length === 0) {
    return null
  }

  let bestMatch = null
  let bestScore = 0

  for (const item of KNOWLEDGE_BASE) {
    const keywords = item.keywords || []
    const question = (item.question || '').toLowerCase()

    const exactKeywordMatches = keywords.filter(k => text.includes(k.toLowerCase()))
    const questionWordMatches = words.filter(w => question.includes(w) && w.length > 3)

    const hasKeywordMatch = exactKeywordMatches.length > 0
    const hasQuestionMatch = questionWordMatches.length >= 2

    if (!hasKeywordMatch && !hasQuestionMatch) {
      continue
    }

    let score = 0
    if (hasKeywordMatch) {
      score = Math.max(score, exactKeywordMatches.length / keywords.length)
    }
    if (hasQuestionMatch) {
      score = Math.max(score, questionWordMatches.length / words.length * 0.7)
    }

    if (score > bestScore) {
      bestScore = score
      bestMatch = {
        ...item,
        confidence: score,
        matchedKeywords: exactKeywordMatches.length > 0 ? exactKeywordMatches : questionWordMatches
      }
    }
  }

  if (bestMatch && bestMatch.confidence >= 0.3) {
    return bestMatch
  }

  return null
}
