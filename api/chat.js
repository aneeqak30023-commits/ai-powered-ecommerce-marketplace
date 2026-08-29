import fs from 'fs'
import path from 'path'

const PRODUCT_TYPE_MAP = {
  watch: { en: 'watch', ur: 'گھڑی', roman: ['waṭch', 'watch', 'gari'] },
  phone: { en: 'phone', ur: 'فون', roman: ['phone', 'fon'] },
  laptop: { en: 'laptop', ur: 'لیپ ٹاپ', roman: ['laptop', 'leptop'] },
  headphones: { en: 'headphones', ur: 'ہیڈفون', roman: ['headphones', 'headphone', 'hedfon'] },
  earbuds: { en: 'earbuds', ur: 'ایربڈز', roman: ['earbuds', 'earbud'] },
  keyboard: { en: 'keyboard', ur: 'کی بورڈ', roman: ['keyboard', 'keybord'] },
  speaker: { en: 'speaker', ur: 'سپیکر', roman: ['speaker', 'spiker'] },
  camera: { en: 'camera', ur: 'کیمرہ', roman: ['camera', 'kamra'] },
  webcam: { en: 'webcam', ur: 'ویب کیم', roman: ['webcam', 'webcam'] },
  'power bank': { en: 'power bank', ur: 'پاور بینک', roman: ['power bank', 'powerbank'] },
  't-shirt': { en: 't-shirt', ur: 'ٹی شرٹ', roman: ['t-shirt', 'tshirt', 't shirt'] },
  shirt: { en: 'shirt', ur: 'شرٹ', roman: ['shirt', 'shert'] },
  shoes: { en: 'shoes', ur: 'جوتے', roman: ['shoes', 'shoe', 'jootay'] },
  book: { en: 'book', ur: 'کتاب', roman: ['book', 'kitab'] },
  cream: { en: 'cream', ur: 'کریم', roman: ['cream', 'kream'] },
  makeup: { en: 'makeup', ur: 'میک اپ', roman: ['makeup', 'make up', 'meikup'] }
}

const CATEGORY_MAP = {
  electronics: { en: 'electronics', ur: 'الیکٹرانکس', roman: ['electronics', 'electronic'] },
  fashion: { en: 'fashion', ur: 'فیشن', roman: ['fashion', 'fashn'] },
  'home-kitchen': { en: 'home kitchen', ur: 'گھر/کچن', roman: ['home', 'kitchen', 'home kitchen'] },
  sports: { en: 'sports', ur: 'کھیل', roman: ['sports', 'sport'] },
  books: { en: 'books', ur: 'کتابیں', roman: ['books', 'book'] },
  beauty: { en: 'beauty', ur: 'بیوٹی', roman: ['beauty', 'beuty'] }
}

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
    const body = await new Promise((resolve, reject) => {
      const chunks = []
      request.on('data', chunk => chunks.push(chunk))
      request.on('end', () => {
        try {
          resolve(JSON.parse(Buffer.concat(chunks).toString('utf8')))
        } catch {
          reject(new Error('Invalid JSON'))
        }
      })
      request.on('error', reject)
    })
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

    if (intent.intent === 'PRODUCT_COMPARISON') {
      const productsPath = path.join(process.cwd(), 'src/data/products.json')
      const fullProducts = JSON.parse(fs.readFileSync(productsPath, 'utf8'))

      const lower = message.toLowerCase()
      const exactMatches = fullProducts.filter(p => lower.includes(p.name.toLowerCase())).slice(0, 2)

      let productA = exactMatches[0]
      let productB = exactMatches[1]

      if (exactMatches.length < 2) {
        const words = lower
          .replace(/compare|comparison|vs|versus|difference between|which is better|better than|pros and cons|compare the|compare a|compare an/gi, ' ')
          .replace(/\b(i want|show me|find|search|looking for|do you have|i need|looking to buy|i'm searching|where can i find|looking for a|looking for an|the|a|an|some|me|to|and|or|with|under|over|above|below|less than|more than|between|from)\b/gi, ' ')
          .split(/[\s,]+/)
          .filter(w => w.length > 2)

        const matched = []
        for (const word of words) {
          for (const product of fullProducts) {
            if (matched.includes(product)) continue
            const searchText = `${product.name} ${product.description || ''} ${(product.tags || []).join(' ')}`.toLowerCase()
            if (searchText.includes(word)) {
              matched.push(product)
              if (matched.length >= 2) break
            }
          }
          if (matched.length >= 2) break
        }
        productA = matched[0] || productA
        productB = matched[1] || productB
      }

      if (!productA || !productB) {
        return response.status(200).json({
          text: "I need at least 2 products to compare. Could you mention specific products or categories? For example: 'compare wireless headphones'",
          products: [productA, productB].filter(Boolean),
          intent: intent.intent,
          comparison: null
        })
      }

      const specsA = productA.specifications || {}
      const specsB = productB.specifications || {}
      const allKeys = new Set([...Object.keys(specsA), ...Object.keys(specsB)])
      const common = []
      const uniqueA = []
      const uniqueB = []
      for (const key of allKeys) {
        const valA = specsA[key]
        const valB = specsB[key]
        if (valA && valB) common.push({ key, valueA: valA, valueB: valB })
        else if (valA) uniqueA.push({ key, value: valA })
        else if (valB) uniqueB.push({ key, value: valB })
      }

      const priceDiff = productA.price - productB.price
      const ratingDiff = productA.rating - productB.rating
      const verdict = ratingDiff >= 0 ? 'A' : 'B'

      const lines = [
        `Here is a comparison between ${productA.name} and ${productB.name}:\n`,
        `**${productA.name}** (${productA.categoryName || productA.categoryId})`,
        `Price: $${productA.price.toFixed(2)} | Rating: ${productA.rating}★ (${productA.reviewCount} reviews)`,
        '',
        `**${productB.name}** (${productB.categoryName || productB.categoryId})`,
        `Price: $${productB.price.toFixed(2)} | Rating: ${productB.rating}★ (${productB.reviewCount} reviews)`,
        ''
      ]

      if (common.length) {
        lines.push('**Common Specifications:**')
        for (const attr of common) {
          lines.push(`• ${attr.key}: ${productA.name} = ${attr.valueA}, ${productB.name} = ${attr.valueB}`)
        }
        lines.push('')
      }
      if (uniqueA.length) {
        lines.push(`**Features only in ${productA.name}:**`)
        for (const attr of uniqueA) lines.push(`• ${attr.key}: ${attr.value}`)
        lines.push('')
      }
      if (uniqueB.length) {
        lines.push(`**Features only in ${productB.name}:**`)
        for (const attr of uniqueB) lines.push(`• ${attr.key}: ${attr.value}`)
        lines.push('')
      }

      lines.push('**Summary based on your priorities:**')
      if (ratingDiff > 0) lines.push(`${productA.name} has a higher rating (${productA.rating}★ vs ${productB.rating}★)`)
      else if (ratingDiff < 0) lines.push(`${productB.name} has a higher rating (${productB.rating}★ vs ${productA.rating}★)`)
      else lines.push('Both have the same rating')

      if (priceDiff < 0) lines.push(`${productA.name} is $${Math.abs(priceDiff).toFixed(2)} cheaper`)
      else if (priceDiff > 0) lines.push(`${productB.name} is $${Math.abs(priceDiff).toFixed(2)} cheaper`)

      return response.status(200).json({
        text: lines.join('\n'),
        products: [productA, productB],
        intent: intent.intent,
        comparison: {
          productA: { ...productA },
          productB: { ...productB },
          attributes: { common, uniqueA, uniqueB },
          priority: ['rating', 'price'],
          verdict
        }
      })
    }

    if (intent.intent === 'PRODUCT_RECOMMENDATION') {
      const productsPath = path.join(process.cwd(), 'src/data/products.json')
      const fullProducts = JSON.parse(fs.readFileSync(productsPath, 'utf8'))

      const lower = message.toLowerCase()
      const normalized = normalizeToEnglish(message).toLowerCase()

      // Extract product type using longest-match-first to avoid substring conflicts
      const productTypeKeys = Object.entries(PRODUCT_TYPE_MAP).sort((a, b) => b[0].length - a[0].length)
      let productType = null
      for (const [key, values] of productTypeKeys) {
        const allNames = [values.en, values.ur, ...(values.roman || [])].filter(Boolean).join(' ')
        const variantWords = allNames.replace(/[^\w\s]/g, '').split(/\s+/)
        if (variantWords.some(vw => lower.includes(vw))) {
          productType = key
          break
        }
      }

      // Extract category
      let category = null
      for (const [key, values] of Object.entries(CATEGORY_MAP)) {
        const allNames = [values.en, values.ur, ...(values.roman || [])].join(' ')
        if (normalized.includes(key) || allNames.split(' ').some(w => normalized.includes(w))) {
          category = key
          break
        }
      }

      // Extract max price
      const priceMatch = normalized.match(/(?:under|below|less than|max|up to|cheaper than|between)\s+\$?(\d+(?:\.\d+)?)/i)
      const maxPrice = priceMatch ? Number(priceMatch[1]) : null

      // Extract min rating
      const ratingMatch = normalized.match(/(?:rating|rated|stars?|score)\s+(?:above|over|at least|minimum|min)\s+(\d+(?:\.\d+)?)/i)
      const minRating = ratingMatch ? Number(ratingMatch[1]) : null

      // Extract use cases
      const useCases = []
      if (/studying|study|student|college|university|class|lecture/i.test(normalized)) useCases.push('studying')
      if (/gaming|game|gamer|fps|mmo|streaming/i.test(normalized)) useCases.push('gaming')
      if (/work|office|business|professional|meeting|calls/i.test(normalized)) useCases.push('work')
      if (/travel|commute|portable|lightweight|flight/i.test(normalized)) useCases.push('travel')
      if (/home|kitchen|indoor|daily use|everyday/i.test(normalized)) useCases.push('home')
      if (/outdoor|sports|running|gym|exercise|workout/i.test(normalized)) useCases.push('outdoor')

      // Hard filters
      let candidates = [...fullProducts]
      if (productType) {
        const typeVariants = PRODUCT_TYPE_MAP[productType] || { en: productType }
        const searchTerms = [productType, typeVariants.en, typeVariants.ur, ...(typeVariants.roman || [])].filter(Boolean).map(t => t.toLowerCase())
        candidates = candidates.filter(p => {
          const searchText = `${p.name} ${p.description || ''} ${(p.tags || []).join(' ')}`.toLowerCase()
          return searchTerms.some(term => searchText.includes(term))
        })
      }
      if (category) {
        candidates = candidates.filter(p => p.categoryId === category)
      }
      if (maxPrice !== null) {
        candidates = candidates.filter(p => p.price <= maxPrice)
      }
      if (minRating !== null) {
        candidates = candidates.filter(p => p.rating >= minRating)
      }

      if (candidates.length === 0) {
        const genericKeywords = ['recommend', 'suggestion', 'suggest', 'best', 'top', 'popular', 'recommendation', 'advice', 'products', 'product']
        const keywords = normalized.replace(/[^\w\s]/g, '').split(/\s+/).filter(w => w.length > 2)
        const hasSpecificKeywords = keywords.some(kw => !genericKeywords.includes(kw))
        
        if (!productType && !category && maxPrice === null && !hasSpecificKeywords) {
          const fallback = [...fullProducts]
            .sort((a, b) => b.rating - a.rating)
            .slice(0, 4)
          
          const lines = ['Here are some popular products from our catalog:\n']
          for (const p of fallback) {
            lines.push(`• **${p.name}** — $${p.price.toFixed(2)} (${p.rating}★, ${p.reviewCount} reviews)`)
          }

          return response.status(200).json({
            text: lines.join('\n'),
            products: fallback,
            intent: intent.intent,
            recommendations: fallback.map(p => ({ product: p, score: p.rating * 20, reasons: ['popular choice'] }))
          })
        }

        return response.status(200).json({
          text: "I couldn't find any products matching your requirements. Try adjusting your budget or preferences.",
          products: [],
          intent: intent.intent,
          recommendations: null
        })
      }

      // Score candidates
      const useCaseKeywords = {
        studying: ['noise cancelling', 'quiet', 'comfortable', 'wireless', 'bluetooth', 'battery', 'lightweight'],
        gaming: ['gaming', 'rgb', 'mechanical', 'low latency', 'surround', 'high precision'],
        work: ['professional', 'noise cancelling', 'comfortable', 'bluetooth', 'wireless', 'calls', 'microphone'],
        travel: ['portable', 'compact', 'lightweight', 'wireless', 'long battery', 'travel'],
        home: ['smart', 'voice', 'bluetooth', 'wifi', 'easy to use', 'connected'],
        outdoor: ['waterproof', 'durable', 'wireless', 'portable', 'long battery', 'rugged']
      }

      const scored = candidates.map(product => {
        let score = 0
        const reasons = []
        const productText = `${product.name} ${product.description || ''} ${(product.tags || []).join(' ')}`.toLowerCase()

        score += product.rating * 20
        if (product.rating >= 4.5) {
          score += 15
          reasons.push(`highly rated (${product.rating}★)`)
        } else if (product.rating >= 4.0) {
          score += 5
        }

        if (product.reviewCount >= 200) {
          score += 10
          reasons.push(`popular with ${product.reviewCount} reviews`)
        }

        if (maxPrice !== null) {
          const budgetRatio = product.price / maxPrice
          if (budgetRatio <= 0.5) {
            score += 20
            reasons.push(`well under your $${maxPrice} budget`)
          } else if (budgetRatio <= 0.8) {
            score += 10
            reasons.push(`within your $${maxPrice} budget`)
          }
        }

        for (const useCase of useCases) {
          const keywords = useCaseKeywords[useCase] || []
          if (keywords.some(kw => productText.includes(kw))) {
            score += 15
            reasons.push(`suitable for ${useCase}`)
          }
        }

        return { product, score, reasons }
      })

      scored.sort((a, b) => b.score - a.score)
      const top = scored.slice(0, 4)

      const lines = productType
        ? [`Here are my top recommendations for ${productType}${maxPrice ? ` under $${maxPrice}` : ''}:\n`]
        : ['Here are some products I think you might like:\n']

      for (const item of top) {
        const reasonText = item.reasons.length > 0 ? ` because it's ${item.reasons.join(' and ')}` : ''
        lines.push(`• **${item.product.name}** — $${item.product.price.toFixed(2)} (${item.product.rating}★, ${item.product.reviewCount} reviews)${reasonText}`)
      }

      if (top.length > 0 && top[0].reasons.length === 0) {
        lines.push(`\nThese are the best matches from our catalog based on your requirements.`)
      }

      return response.status(200).json({
        text: lines.join('\n'),
        products: top.map(item => item.product),
        intent: intent.intent,
        recommendations: top.map(item => ({
          product: item.product,
          score: item.score,
          reasons: item.reasons
        }))
      })
    }

    if (intent.intent === 'PRODUCT_SEARCH') {
      const productsPath = path.join(process.cwd(), 'src/data/products.json')
      const fullProducts = JSON.parse(fs.readFileSync(productsPath, 'utf8'))
      const lower = message.toLowerCase()
      const normalized = normalizeToEnglish(message).toLowerCase()

      // Extract product type using longest-match-first to avoid substring conflicts
      const productTypeKeys = Object.entries(PRODUCT_TYPE_MAP).sort((a, b) => b[0].length - a[0].length)
      let productType = null
      for (const [key, values] of productTypeKeys) {
        const allNames = [values.en, values.ur, ...(values.roman || [])].filter(Boolean).join(' ')
        const variantWords = allNames.replace(/[^\w\s]/g, '').split(/\s+/)
        if (variantWords.some(vw => lower.includes(vw))) {
          productType = key
          break
        }
      }

      // Extract category
      let category = null
      for (const [key, values] of Object.entries(CATEGORY_MAP)) {
        const allNames = [values.en, values.ur, ...(values.roman || [])].join(' ')
        if (normalized.includes(key) || allNames.split(' ').some(w => normalized.includes(w))) {
          category = key
          break
        }
      }

      // Extract max price
      const priceMatch = normalized.match(/(?:under|below|less than|max|up to|cheaper than|between)\s+\$?(\d+(?:\.\d+)?)/i)
      const maxPrice = priceMatch ? Number(priceMatch[1]) : null

      // Extract min rating
      const ratingMatch = normalized.match(/(?:rating|rated|stars?|score)\s+(?:above|over|at least|minimum|min)\s+(\d+(?:\.\d+)?)/i)
      const minRating = ratingMatch ? Number(ratingMatch[1]) : null

      // Extract keywords
      const keywords = normalized.replace(/[^\w\s]/g, '').split(/\s+/).filter(w => w.length > 2)

      // Filter products
      let results = [...fullProducts]
      if (productType) {
        const typeVariants = PRODUCT_TYPE_MAP[productType] || { en: productType }
        const searchTerms = [productType, typeVariants.en, typeVariants.ur, ...(typeVariants.roman || [])].filter(Boolean).map(t => t.toLowerCase())
        results = results.filter(p => {
          const searchText = `${p.name} ${p.description || ''} ${(p.tags || []).join(' ')}`.toLowerCase()
          return searchTerms.some(term => searchText.includes(term))
        })
      }
      if (category) {
        results = results.filter(p => p.categoryId === category)
      }
      if (maxPrice !== null) {
        results = results.filter(p => p.price <= maxPrice)
      }
      if (minRating !== null) {
        results = results.filter(p => p.rating >= minRating)
      }
      if (keywords.length > 0) {
        results = results.filter(p => {
          const searchText = `${p.name} ${p.description || ''} ${(p.tags || []).join(' ')}`.toLowerCase()
          return keywords.some(w => searchText.includes(w))
        })
      }

      results.sort((a, b) => b.rating - a.rating)
      const topResults = results.slice(0, 5)

      if (topResults.length > 0) {
        const lines = [`I found ${topResults.length} product${topResults.length > 1 ? 's' : ''} that match your search:\n`]
        for (const p of topResults) {
          lines.push(`• **${p.name}** — $${p.price.toFixed(2)} (${p.rating}★, ${p.reviewCount} reviews)`)
        }
        return response.status(200).json({
          text: lines.join('\n'),
          products: topResults,
          intent: intent.intent
        })
      }

      return response.status(200).json({
        text: "I couldn't find any products matching that. Try different keywords like 'wireless headphones', 'running shoes', or 'coffee maker', or ask me to recommend products!",
        products: [],
        intent: intent.intent
      })
    }

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
        maxOutputTokens: 1024
      }
    }

    let geminiResponse
    try {
      geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
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
