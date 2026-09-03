import { extractMultilingualEntities, normalizeToEnglish, PRODUCT_TYPE_MAP, detectUseCases } from './multilingualSearch.js'

const USE_CASE_KEYWORDS = {
  studying: ['noise cancelling', 'quiet', 'comfortable', 'wireless', 'bluetooth', 'battery', 'lightweight', 'study', 'focus', 'dorm', 'student', 'educational', 'notebook', 'laptop', 'book', 'books'],
  gaming: ['gaming', 'rgb', 'mechanical', 'low latency', 'surround', 'high precision', 'fps', 'mmo', 'performance', 'game'],
  work: ['professional', 'noise cancelling', 'comfortable', 'bluetooth', 'wireless', 'calls', 'microphone', 'office', 'meeting'],
  travel: ['portable', 'compact', 'lightweight', 'wireless', 'long battery', 'travel', 'foldable'],
  home: ['smart', 'voice', 'bluetooth', 'wifi', 'easy to use', 'connected', 'home automation', 'indoor'],
  outdoor: ['waterproof', 'durable', 'wireless', 'portable', 'long battery', 'rugged', 'weatherproof', 'water resistant'],
  content_creation: ['4k', 'high resolution', 'stabilization', 'professional', 'studio', 'recording', 'content'],
  coding: ['comfortable', 'ergonomic', 'mechanical', 'programmable', 'multi-device', 'quiet', 'backlit']
}

// Synonym expansions for better matching - includes both singular and plural forms
const KEYWORD_SYNONYMS = {
  'headphone': ['headphones', 'headset', 'earphone', 'earphones', 'over ear', 'on ear', 'noise cancelling', 'head phone', 'head phones'],
  'headphones': ['headphone', 'headset', 'earphone', 'earphones', 'over ear', 'on ear', 'noise cancelling', 'head phone', 'head phones'],
  'earbud': ['earbuds', 'ear bud', 'ear buds', 'in ear', 'true wireless'],
  'earbuds': ['earbud', 'ear bud', 'ear buds', 'in ear', 'true wireless'],
  'laptop': ['laptops', 'notebook', 'notebooks', 'ultrabook', 'chromebook', 'notebook computer'],
  'laptops': ['laptop', 'notebook', 'notebooks', 'ultrabook', 'chromebook', 'notebook computer'],
  'notebook': ['laptops', 'laptop', 'notebooks', 'ultrabook', 'chromebook'],
  'phone': ['phones', 'mobile', 'smartphone', 'smartphones', 'cell phone', 'cell phones', 'mobile phone'],
  'phones': ['phone', 'mobile', 'smartphone', 'smartphones', 'cell phone', 'cell phones', 'mobile phone'],
  'watch': ['watches', 'smartwatch', 'smartwatches', 'wristwatch', 'fitness tracker'],
  'watches': ['watch', 'smartwatch', 'smartwatches', 'wristwatch', 'fitness tracker'],
  'smartwatch': ['smartwatches', 'watch', 'watches', 'fitness tracker'],
  'shoe': ['shoes', 'sneakers', 'sneaker', 'footwear', 'trainers', 'running shoes'],
  'shoes': ['shoe', 'sneaker', 'sneakers', 'footwear', 'trainers', 'running shoes'],
  'keyboard': ['keyboards', 'mechanical keyboard', 'wireless keyboard'],
  'keyboards': ['keyboard', 'mechanical keyboard', 'wireless keyboard'],
  'speaker': ['speakers', 'bluetooth speaker'],
  'speakers': ['speaker', 'bluetooth speaker'],
  'camera': ['cameras', 'digital camera'],
  'cameras': ['camera', 'digital camera'],
  'monitor': ['monitors', 'display', 'displays', 'screen', 'screens'],
  'monitors': ['monitor', 'display', 'displays', 'screen', 'screens'],
  'display': ['displays', 'monitor', 'monitors', 'screen', 'screens'],
  'book': ['books', 'novel', 'novels', 'textbook', 'textbooks', 'ebook'],
  'books': ['book', 'novel', 'novels', 'textbook', 'textbooks', 'ebook'],
  'cream': ['creams', 'moisturizer', 'lotion'],
  'makeup': ['makeups', 'cosmetics', 'beauty', 'foundation', 'lipstick'],
  'bag': ['bags', 'backpack', 'backpacks', 'crossbody'],
  'bags': ['bag', 'backpack', 'backpacks', 'crossbody'],
  'backpack': ['backpacks', 'bag', 'bags'],
  'mouse': ['mice', 'wireless mouse'],
  'earphone': ['earphones', 'headphone', 'headphones'],
  'earphones': ['earphone', 'headphone', 'headphones']
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
    // Check if any synonym key is a parent (reverse lookup)
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

  // Soft filter: keywords (exclude generic recommendation words and category names)
  const genericKeywords = new Set([
    'recommend', 'suggestion', 'suggest', 'best', 'top', 'popular',
    'recommendation', 'advice', 'products', 'product', 'good', 'nice',
    'looking', 'want', 'need', 'buy', 'purchase', 'get', 'find', 'show',
    'search', 'please', 'what', 'which', 'for', 'the', 'a', 'an',
    'i', 'you', 'under', 'over', 'below', 'above', 'my', 'your',
    // Category names should not be used as keyword filters (category is already handled)
    'electronics', 'electronic', 'fashion', 'apparel', 'clothing', 'home', 'kitchen',
    'furniture', 'sports', 'athletic', 'books', 'book', 'beauty', 'cosmetics', 'makeup'
  ])

  // Expand keywords with synonyms for better matching
  const specificKeywords = entities.keywords.filter(kw => !genericKeywords.has(kw) && kw.length > 2)
  const expandedKeywords = specificKeywords.length > 0 ? expandKeywords(specificKeywords) : []

  if (expandedKeywords.length > 0 && candidates.length > 0) {
    const keywordRegex = new RegExp(
      expandedKeywords.map(kw => kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|'),
      'i'
    )
    const filtered = candidates.filter(p => {
      const searchText = `${p.name} ${p.description || ''} ${(p.tags || []).join(' ')}`.toLowerCase()
      return keywordRegex.test(searchText)
    })
    // Only apply keyword filter if it doesn't eliminate all results
    if (filtered.length > 0) {
      candidates = filtered
    } else if (specificKeywords.length > 0) {
      // Keywords were present but matched nothing - do not return
      // unrelated products
      candidates = []
    }
  }

  // Determine if we have any meaningful constraints
  const hasHardConstraints = entities.productType || entities.category ||
    entities.maxPrice !== null || entities.minPrice !== null ||
    entities.minRating !== null

  // Check if there are specific (non-generic) keywords that could match products
  const hasSpecificKeywords = entities.keywords.some(kw =>
    !genericKeywords.has(kw) && kw.length > 2 && !kw.match(/^\d+$/)
  )

  if (candidates.length === 0) {
    // If we had hard constraints (product type, category, budget, rating),
    // do NOT fall back to random/unrelated products - return empty with explanation
    if (hasHardConstraints || entities.useCases.length > 0 || hasSpecificKeywords) {
      // Check if it's a use-case-only query with no product type
      if (!entities.productType && !entities.category && entities.useCases.length > 0) {
        // Use-case only: try to find products matching use case keywords
        return findUseCaseProducts(message, entities, products)
      }

      return {
        text: "I couldn't find any products matching your requirements. Try adjusting your budget or preferences.",
        products: [],
        recommendations: null
      }
    }

    // Truly generic request (e.g., "Recommend products" with no specifics):
    // Return top-rated products as a general suggestion
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
      if (matchedUseCaseKeywords.length >= 2) {
        score += 20
        reasons.push(`excellent for ${useCase}`)
      } else if (matchedUseCaseKeywords.length >= 1) {
        score += 15
        reasons.push(`great for ${useCase}`)
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

/**
 * Fallback for use-case-only queries (no explicit product type or category).
 * Matches products based on use-case keywords and use-case keyword associations,
 * then applies soft relevance scoring. Does NOT return random/unrelated products.
 */
function findUseCaseProducts(message, entities, products) {
  const useCases = entities.useCases
  if (useCases.length === 0) {
    return {
      text: "I couldn't find any products matching your query. Could you be more specific about what you're looking for?",
      products: [],
      recommendations: null
    }
  }

  const candidates = products.filter(p => {
    const productText = `${p.name} ${p.description || ''} ${(p.tags || []).join(' ')}`.toLowerCase()
    return useCases.some(uc => {
      const kw = USE_CASE_KEYWORDS[uc] || []
      return kw.some(k => productText.includes(k))
    })
  })

  if (candidates.length === 0) {
    return {
      text: "I couldn't find any products matching your use case. Try a different query or be more specific.",
      products: [],
      recommendations: null
    }
  }

  // Score by rating
  const scored = candidates
    .map(p => ({
      product: p,
      score: p.rating * 20 + (p.reviewCount >= 200 ? 12 : p.reviewCount >= 100 ? 4 : 0)
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)

  const lines = [`Here are some products great for ${useCases.join(', ')}:\n`]
  for (const item of scored) {
    lines.push(`• **${item.product.name}** — $${item.product.price.toFixed(2)} (${item.product.rating}★, ${item.product.reviewCount || 0} reviews)`)
  }

  return {
    text: lines.join('\n'),
    products: scored.map(item => item.product),
    recommendations: scored.map(item => ({
      product: item.product,
      score: item.score,
      reasons: [`great for ${useCases.join(', ')}`]
    }))
  }
}
