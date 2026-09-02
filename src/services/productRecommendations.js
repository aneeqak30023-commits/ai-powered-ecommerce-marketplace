import { extractMultilingualEntities, normalizeToEnglish, PRODUCT_TYPE_MAP } from './multilingualSearch.js'

function detectUseCases(text) {
  const normalized = normalizeToEnglish(text).toLowerCase()
  const useCases = []

  if (/studying|study|student|college|university|class|lecture|educational/i.test(normalized)) useCases.push('studying')
  if (/gaming|game|gamer|fps|mmo|streaming|console|pc gaming/i.test(normalized)) useCases.push('gaming')
  if (/work|office|business|professional|meeting|calls|remote work|home office/i.test(normalized)) useCases.push('work')
  if (/travel|commute|portable|lightweight|flight|on the go|mobile/i.test(normalized)) useCases.push('travel')
  if (/home|kitchen|indoor|daily use|everyday|household/i.test(normalized)) useCases.push('home')
  if (/outdoor|sports|running|gym|exercise|workout|active|fishing|hiking|camping/i.test(normalized)) useCases.push('outdoor')
  if (/content creator|content creation|youtube|tiktok|vlog|video editing|photo editing/i.test(normalized)) useCases.push('content_creation')
  if (/coding|programming|developer|software engineer/i.test(normalized)) useCases.push('coding')

  return useCases
}

const USE_CASE_KEYWORDS = {
  studying: ['noise cancelling', 'quiet', 'comfortable', 'wireless', 'bluetooth', 'battery', 'lightweight', 'study', 'focus', 'dorm'],
  gaming: ['gaming', 'rgb', 'mechanical', 'low latency', 'surround', 'high precision', 'fps', 'mmo', 'gaming', 'performance'],
  work: ['professional', 'noise cancelling', 'comfortable', 'bluetooth', 'wireless', 'calls', 'microphone', 'office', 'meeting'],
  travel: ['portable', 'compact', 'lightweight', 'wireless', 'long battery', 'travel', 'compact', 'foldable'],
  home: ['smart', 'voice', 'bluetooth', 'wifi', 'easy to use', 'connected', 'home automation', 'indoor'],
  outdoor: ['waterproof', 'durable', 'wireless', 'portable', 'long battery', 'rugged', 'weatherproof', 'water resistant'],
  content_creation: ['4k', 'high resolution', 'stabilization', 'professional', 'studio', 'recording', 'content'],
  coding: ['comfortable', 'ergonomic', 'mechanical', 'programmable', 'multi-device', 'quiet', 'backlit']
}

// Synonym expansions for better matching
const KEYWORD_SYNONYMS = {
  'headphones': ['headphone', 'headset', 'earphone', 'over ear', 'on ear', 'noise cancelling'],
  'earbuds': ['earbuds', 'earbud', 'in ear', 'true wireless', 'wireless earbuds'],
  'laptop': ['laptop', 'notebook', 'ultrabook', 'chromebook'],
  'phone': ['phone', 'mobile', 'smartphone', 'cell phone'],
  'watch': ['watch', 'smartwatch', 'wristwatch', 'fitness tracker'],
  'shoes': ['shoes', 'sneakers', 'footwear', 'trainers', 'running shoes'],
  'keyboard': ['keyboard', 'mechanical keyboard', 'wireless keyboard'],
  'speaker': ['speaker', 'bluetooth speaker', 'portable speaker'],
  'camera': ['camera', 'digital camera', 'mirrorless'],
  'monitor': ['monitor', 'display', 'screen', '4k'],
  'book': ['book', 'novel', 'textbook', 'ebook', 'biography'],
  'cream': ['cream', 'moisturizer', 'lotion', 'face cream', 'skincare'],
  'makeup': ['makeup', 'cosmetics', 'beauty', 'foundation', 'lipstick']
}

function expandKeywords(keywords) {
  const expanded = new Set(keywords)
  for (const kw of keywords) {
    // Direct synonym match
    if (KEYWORD_SYNONYMS[kw]) {
      for (const syn of KEYWORD_SYNONYMS[kw]) {
        expanded.add(syn)
      }
    }
    // Check if any synonym key is a parent
    for (const [parent, synonyms] of Object.entries(KEYWORD_SYNONYMS)) {
      if (synonyms.includes(kw)) {
        expanded.add(parent)
        for (const syn of synonyms) {
          expanded.add(syn)
        }
      }
    }
  }
  return [...expanded]
}

export function extractRecommendationEntities(message) {
  const entities = extractMultilingualEntities(message)
  const useCases = detectUseCases(message)

  // Override product type with more accurate detection to avoid substring issues
  const normalized = normalizeToEnglish(message).toLowerCase()
  const normalizedWords = normalized.replace(/[^\w\s]/g, '').split(/\s+/).filter(w => w.length > 0)

  // Check product types from longest name to shortest to avoid substring conflicts
  const productTypeKeys = Object.keys(PRODUCT_TYPE_MAP).sort((a, b) => b.length - a.length)

  for (const key of productTypeKeys) {
    const values = PRODUCT_TYPE_MAP[key]
    const allNames = [values.en, values.ur, ...(values.roman || [])].filter(Boolean).join(' ')
    const variantWords = allNames.replace(/[^\w\s]/g, '').split(/\s+/).filter(Boolean)

    if (variantWords.some(vw => normalizedWords.includes(vw))) {
      entities.productType = key
      break
    }
  }

  return {
    ...entities,
    useCases
  }
}

export function generateRecommendations(message, products) {
  if (!message || !products || products.length === 0) {
    return {
      text: "I need a product catalog to make recommendations. Please try again later.",
      products: [],
      recommendations: null
    }
  }

  const entities = extractRecommendationEntities(message)
  let candidates = [...products]

  // Hard filter: product type
  if (entities.productType) {
    const typeVariants = PRODUCT_TYPE_MAP[entities.productType] || { en: entities.productType }
    const searchTerms = [entities.productType, typeVariants.en, typeVariants.ur, ...(typeVariants.roman || [])].filter(Boolean).map(t => t.toLowerCase())
    candidates = candidates.filter(p => {
      const searchText = `${p.name} ${p.description || ''} ${(p.tags || []).join(' ')}`.toLowerCase()
      return searchTerms.some(term => searchText.includes(term))
    })
  }

  // Hard filter: category
  if (entities.category) {
    candidates = candidates.filter(p => p.categoryId === entities.category)
  }

  // Hard filter: max budget
  if (entities.maxPrice !== null) {
    candidates = candidates.filter(p => p.price <= entities.maxPrice)
  }

  // Hard filter: min rating
  if (entities.minRating !== null) {
    candidates = candidates.filter(p => p.rating >= entities.minRating)
  }

  // Soft filter: keywords (exclude generic recommendation words)
  const genericKeywords = new Set([
    'recommend', 'suggestion', 'suggest', 'best', 'top', 'popular',
    'recommendation', 'advice', 'products', 'product', 'good', 'nice',
    'looking', 'want', 'need', 'buy', 'purchase', 'get'
  ])

  // Expand keywords with synonyms for better matching
  const specificKeywords = entities.keywords.filter(kw => !genericKeywords.has(kw))
  const expandedKeywords = specificKeywords.length > 0 ? expandKeywords(specificKeywords) : []

  if (expandedKeywords.length > 0) {
    const keywordRegex = new RegExp(
      expandedKeywords.map(kw => kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|'),
      'i'
    )
    candidates = candidates.filter(p => {
      const searchText = `${p.name} ${p.description || ''} ${(p.tags || []).join(' ')}`.toLowerCase()
      return keywordRegex.test(searchText)
    })
  }

  if (candidates.length === 0) {
    // Fallback: if no hard filters or only generic keywords, return top-rated products
    const hasSpecificKeywords = entities.keywords.some(kw => !genericKeywords.has(kw))

    if (!entities.productType && !entities.category && entities.maxPrice === null && !hasSpecificKeywords) {
      const fallback = [...products]
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 4)

      const lines = [`Here are some popular products from our catalog:\n`]
      for (const p of fallback) {
        lines.push(`• **${p.name}** — $${p.price.toFixed(2)} (${p.rating}★, ${p.reviewCount || 0} reviews)`)
      }

      return {
        text: lines.join('\n'),
        products: fallback,
        recommendations: fallback.map(p => ({ product: p, score: p.rating * 20, reasons: ['popular choice'] }))
      }
    }

    return {
      text: "I couldn't find any products matching your requirements. Try adjusting your budget or preferences.",
      products: [],
      recommendations: null
    }
  }

  // Score candidates
  const scored = candidates.map(product => {
    let score = 0
    const reasons = []

    // Base score from rating (scale 0-5 to 0-25)
    score += product.rating * 20

    // Budget fit
    if (entities.maxPrice !== null) {
      const budgetRatio = product.price / entities.maxPrice
      if (budgetRatio <= 0.5) {
        score += 20
        reasons.push(`well under your $${entities.maxPrice} budget`)
      } else if (budgetRatio <= 0.8) {
        score += 10
        reasons.push(`within your $${entities.maxPrice} budget`)
      } else {
        score += 3
        reasons.push(`near your $${entities.maxPrice} budget`)
      }
    }

    // Rating bonus
    if (product.rating >= 4.5) {
      score += 15
      reasons.push(`highly rated (${product.rating}★)`)
    } else if (product.rating >= 4.0) {
      score += 5
    } else if (product.rating >= 3.5) {
      score += 2
    }

    // Review count bonus (indicates popularity/reliability)
    if (product.reviewCount >= 500) {
      score += 12
      reasons.push(`very popular with ${product.reviewCount} reviews`)
    } else if (product.reviewCount >= 200) {
      score += 8
      reasons.push(`popular with ${product.reviewCount} reviews`)
    } else if (product.reviewCount >= 100) {
      score += 4
    }

    // Use case matching
    for (const useCase of entities.useCases) {
      const keywords = USE_CASE_KEYWORDS[useCase] || []
      const productText = `${product.name} ${product.description || ''} ${(product.tags || []).join(' ')}`.toLowerCase()
      const matchedUseCaseKeywords = keywords.filter(kw => productText.includes(kw))
      if (matchedUseCaseKeywords.length >= 1) {
        score += 15
        reasons.push(`great for ${useCase}`)
      } else if (matchedUseCaseKeywords.length >= 2) {
        score += 10
        reasons.push(`excellent for ${useCase}`)
      }
    }

    // Keyword matches (expanded with synonyms)
    if (expandedKeywords.length > 0) {
      const productText = `${product.name} ${product.description || ''} ${(product.tags || []).join(' ')}`.toLowerCase()
      const matchedKeywords = expandedKeywords.filter(w => {
        const escaped = w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        return new RegExp(`\\b${escaped}`, 'i').test(productText)
      })
      if (matchedKeywords.length > 0) {
        score += matchedKeywords.length * 5
        reasons.push(`matches: ${matchedKeywords.slice(0, 5).join(', ')}`)
      }
    }

    // Price-value bonus (if no budget specified, prefer mid-range products)
    if (entities.maxPrice === null) {
      if (product.price >= 50 && product.price <= 500) {
        score += 3
      }
    }

    // Premium product bonus for "best" or "top" queries
    if (entities.keywords.some(kw => ['best', 'top', 'premium', 'high-end'].includes(kw))) {
      if (product.rating >= 4.5 && product.reviewCount >= 100) {
        score += 10
        reasons.push('premium choice')
      }
    }

    return { product, score, reasons }
  })

  scored.sort((a, b) => b.score - a.score)
  const top = scored.slice(0, 4)

  const lines = []
  if (entities.productType) {
    let desc = `Here are my top recommendations for ${entities.productType}`
    if (entities.maxPrice !== null) desc += ` under $${entities.maxPrice}`
    if (entities.minRating !== null) desc += ` with rating ${entities.minRating}+`
    desc += `:\n`
    lines.push(desc)
  } else if (entities.category) {
    lines.push(`Here are my top recommendations for ${entities.category} products:\n`)
  } else {
    lines.push(`Here are some products I think you might like:\n`)
  }

  for (const item of top) {
    const reasonText = item.reasons.length > 0 ? ` because it's ${item.reasons.join(' and ')}` : ''
    lines.push(`• **${item.product.name}** — $${item.product.price.toFixed(2)} (${item.product.rating}★, ${item.product.reviewCount || 0} reviews)${reasonText}`)
  }

  if (top.length > 0 && top[0].reasons.length === 0) {
    lines.push(`\nThese are the best matches from our catalog based on your requirements.`)
  }

  return {
    text: lines.join('\n'),
    products: top.map(item => item.product),
    recommendations: top.map(item => ({
      product: item.product,
      score: item.score,
      reasons: item.reasons
    }))
  }
}
