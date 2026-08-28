import { extractMultilingualEntities, normalizeToEnglish, PRODUCT_TYPE_MAP } from './multilingualSearch.js'

function detectUseCases(text) {
  const normalized = normalizeToEnglish(text).toLowerCase()
  const useCases = []

  if (/studying|study|student|college|university|class|lecture/i.test(normalized)) useCases.push('studying')
  if (/gaming|game|gamer|fps|mmo|streaming/i.test(normalized)) useCases.push('gaming')
  if (/work|office|business|professional|meeting|calls/i.test(normalized)) useCases.push('work')
  if (/travel|commute|portable|lightweight|flight/i.test(normalized)) useCases.push('travel')
  if (/home|kitchen|indoor|daily use|everyday/i.test(normalized)) useCases.push('home')
  if (/outdoor|sports|running|gym|exercise|workout/i.test(normalized)) useCases.push('outdoor')

  return useCases
}

const USE_CASE_KEYWORDS = {
  studying: ['noise cancelling', 'quiet', 'comfortable', 'wireless', 'bluetooth', 'battery', 'lightweight'],
  gaming: ['gaming', 'rgb', 'mechanical', 'low latency', 'surround', 'high precision'],
  work: ['professional', 'noise cancelling', 'comfortable', 'bluetooth', 'wireless', 'calls', 'microphone'],
  travel: ['portable', 'compact', 'lightweight', 'wireless', 'long battery', 'travel'],
  home: ['smart', 'voice', 'bluetooth', 'wifi', 'easy to use', 'connected'],
  outdoor: ['waterproof', 'durable', 'wireless', 'portable', 'long battery', 'rugged']
}

export function extractRecommendationEntities(message) {
  const entities = extractMultilingualEntities(message)
  const useCases = detectUseCases(message)

  // Override product type with more accurate detection to avoid substring issues
  // e.g., "headphones" matching "phone" first in multilingualSearch
  const normalized = normalizeToEnglish(message).toLowerCase()
  const normalizedWords = normalized.replace(/[^\w\s]/g, '').split(/\s+/)
  
  // Check product types from longest name to shortest to avoid substring conflicts
  const productTypeKeys = Object.keys(PRODUCT_TYPE_MAP).sort((a, b) => b.length - a.length)
  
  for (const key of productTypeKeys) {
    const values = PRODUCT_TYPE_MAP[key]
    const allNames = [values.en, values.ur, ...(values.roman || [])].filter(Boolean).join(' ')
    const variantWords = allNames.replace(/[^\w\s]/g, '').split(/\s+/)
    
    if (variantWords.some(vw => normalizedWords.some(nw => nw === vw))) {
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
  const genericKeywords = ['recommend', 'suggestion', 'suggest', 'best', 'top', 'popular', 'recommendation', 'advice', 'products', 'product']
  const specificKeywords = entities.keywords.filter(kw => !genericKeywords.includes(kw))
  
  if (specificKeywords.length > 0) {
    candidates = candidates.filter(p => {
      const searchText = `${p.name} ${p.description || ''} ${(p.tags || []).join(' ')}`.toLowerCase()
      return specificKeywords.some(w => searchText.includes(w))
    })
  }

  if (candidates.length === 0) {
    // Fallback: if no hard filters or only generic keywords, return top-rated products
    const genericKeywords = ['recommend', 'suggestion', 'suggest', 'best', 'top', 'popular', 'recommendation', 'advice', 'products', 'product']
    const hasSpecificKeywords = entities.keywords.some(kw => !genericKeywords.includes(kw))
    
    if (!entities.productType && !entities.category && entities.maxPrice === null && !hasSpecificKeywords) {
      const fallback = [...products]
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 4)
      
      const lines = [`Here are some popular products from our catalog:\n`]
      for (const p of fallback) {
        lines.push(`• **${p.name}** — $${p.price.toFixed(2)} (${p.rating}★, ${p.reviewCount} reviews)`)
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

    // Base score from rating
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
      }
    }

    // Rating bonus
    if (product.rating >= 4.5) {
      score += 15
      reasons.push(`highly rated (${product.rating}★)`)
    } else if (product.rating >= 4.0) {
      score += 5
    }

    // Review count bonus
    if (product.reviewCount >= 200) {
      score += 10
      reasons.push(`popular with ${product.reviewCount} reviews`)
    }

    // Use case matching
    for (const useCase of entities.useCases) {
      const keywords = USE_CASE_KEYWORDS[useCase] || []
      const productText = `${product.name} ${product.description || ''} ${(product.tags || []).join(' ')}`.toLowerCase()
      if (keywords.some(kw => productText.includes(kw))) {
        score += 15
        reasons.push(`suitable for ${useCase}`)
      }
    }

    // Keyword matches
    if (entities.keywords.length > 0) {
      const productText = `${product.name} ${product.description || ''} ${(product.tags || []).join(' ')}`.toLowerCase()
      const matchedKeywords = entities.keywords.filter(w => productText.includes(w))
      if (matchedKeywords.length > 0) {
        score += matchedKeywords.length * 5
        reasons.push(`matches: ${matchedKeywords.join(', ')}`)
      }
    }

    return { product, score, reasons }
  })

  scored.sort((a, b) => b.score - a.score)
  const top = scored.slice(0, 4)

  const lines = []
  if (entities.productType) {
    lines.push(`Here are my top recommendations for ${entities.productType}${entities.maxPrice ? ` under $${entities.maxPrice}` : ''}:\n`)
  } else {
    lines.push(`Here are some products I think you might like:\n`)
  }

  for (const item of top) {
    const reasonText = item.reasons.length > 0 ? ` because it's ${item.reasons.join(' and ')}` : ''
    lines.push(`• **${item.product.name}** — $${item.product.price.toFixed(2)} (${item.product.rating}★, ${item.product.reviewCount} reviews)${reasonText}`)
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
