/**
 * Product Retrieval Engine
 *
 * Layer 3: Product Retrieval
 *
 * Implements the product retrieval pipeline:
 * 1. Normalize query
 * 2. Identify product type/category
 * 3. Retrieve candidate products
 * 4. Apply hard constraints
 * 5. Score semantic/category/use-case relevance
 * 6. Rank candidates
 * 7. Return validated products
 *
 * Hard constraints: product type, category, brand, budget range, rating threshold
 * Soft preferences: student, studying, work, gaming, travel, fitness, best, good, popular
 */

import productsData from '../data/products.json'
import { extractEntities } from './entityExtractor.js'
import { PRODUCT_TYPE_MAP, KEYWORD_SYNONYMS, USE_CASE_PRODUCTS_KEYWORDS } from './multilingualSearch.js'

/**
 * Use case keywords for relevance scoring (soft preference).
 * These keywords help identify products that are suitable for specific use cases.
 */
const USE_CASE_KEYWORDS = {
  student: ['noise cancelling', 'quiet', 'comfortable', 'wireless', 'bluetooth', 'battery', 'lightweight', 'study', 'focus', 'dorm', 'student', 'educational', 'notebook', 'laptop', 'book', 'books', 'headphones', 'headphone', 'speaker', 'keyboard', 'mouse'],
  gaming: ['gaming', 'rgb', 'mechanical', 'low latency', 'surround', 'high precision', 'fps', 'mmo', 'performance', 'game'],
  work: ['professional', 'noise cancelling', 'comfortable', 'bluetooth', 'wireless', 'calls', 'microphone', 'office', 'meeting'],
  travel: ['portable', 'compact', 'lightweight', 'wireless', 'long battery', 'travel', 'foldable'],
  fitness: ['fitness', 'gym', 'exercise', 'workout', 'running', 'wireless', 'portable', 'lightweight'],
  home: ['smart', 'voice', 'bluetooth', 'wifi', 'easy to use', 'connected', 'home automation', 'indoor', 'everyday']
}

/**
 * Expand keywords with synonyms for better matching.
 */
function expandKeywords(keywords) {
  const expanded = new Set(keywords)
  for (const kw of keywords) {
    if (KEYWORD_SYNONYMS[kw]) {
      for (const syn of KEYWORD_SYNONYMS[kw]) {
        expanded.add(syn)
      }
    }
    for (const [parent, synonyms] of Object.entries(KEYWORD_SYNONYMS)) {
      if (synonyms.includes(kw)) {
        expanded.add(parent)
      }
    }
  }
  return [...expanded]
}

/**
 * Calculate a product's relevance score based on entities and soft preferences.
 * Hard constraints must be pre-filtered before calling this.
 */
function scoreRelevance(product, entities, expandedKeywords) {
  let score = 0
  const reasons = []

  const searchText = `${product.name} ${product.description || ''} ${(product.tags || []).join(' ')}`.toLowerCase()

  // Base rating score (scale 0-5 to 0-25)
  score += product.rating * 20

  // Brand match (if specified)
  if (entities.brand && product.brand && product.brand.toLowerCase() === entities.brand.toLowerCase()) {
    score += 30
    reasons.push('matches your brand preference')
  }

  // Feature matches
  for (const feature of entities.features) {
    if (searchText.includes(feature.toLowerCase())) {
      score += 10
      reasons.push(`has ${feature}`)
    }
  }

  // Budget fit scoring
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

  // Review count bonus
  if (product.reviewCount >= 500) {
    score += 12
    reasons.push(`very popular with ${product.reviewCount} reviews`)
  } else if (product.reviewCount >= 200) {
    score += 8
    reasons.push(`popular with ${product.reviewCount} reviews`)
  } else if (product.reviewCount >= 100) {
    score += 4
  }

  // Use case matching (soft preference - boosts score but doesn't eliminate)
  for (const useCase of entities.useCases) {
    const keywords = USE_CASE_KEYWORDS[useCase] || []
    const matchedUseCaseKeywords = keywords.filter(kw => searchText.includes(kw))

    if (matchedUseCaseKeywords.length >= 2) {
      score += 20
      reasons.push(`excellent for ${useCase}`)
    } else if (matchedUseCaseKeywords.length >= 1) {
      score += 15
      reasons.push(`great for ${useCase}`)
    } else {
      // Even if no explicit use case keywords match, if the use case is "student" or "studying",
      // don't penalize the product. The use case is a soft preference.
      // Products that pass hard filters are already relevant.
    }
  }

  // Keyword matches (expanded with synonyms)
  if (expandedKeywords.length > 0) {
    const matchedKeywords = expandedKeywords.filter(w => {
      const escaped = w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      return new RegExp(`\\b${escaped}`, 'i').test(searchText)
    })
    if (matchedKeywords.length > 0) {
      score += matchedKeywords.length * 5
      reasons.push(`matches: ${matchedKeywords.slice(0, 5).join(', ')}`)
    }
  }

  // Premium product bonus for "best" or "top" queries
  if (entities.keywords.some(kw => ['best', 'top', 'premium', 'high-end'].includes(kw))) {
    if (product.rating >= 4.5 && product.reviewCount >= 100) {
      score += 10
      reasons.push('premium choice')
    }
  }

  // Use case-specific product matching bonus
  if (entities.useCases.length > 0) {
    for (const useCase of entities.useCases) {
      const useCaseProducts = USE_CASE_PRODUCTS_KEYWORDS[useCase] || []
      if (useCaseProducts.length > 0) {
        const matchedUseCaseProducts = useCaseProducts.filter(kw => searchText.includes(kw))
        if (matchedUseCaseProducts.length > 0) {
          score += 8
          if (!reasons.some(r => r.includes(useCase))) {
            reasons.push(`suitable for ${useCase}`)
          }
        }
      }
    }
  }

  return { product, score, reasons }
}

/**
 * Retrieve products based on a query.
 * Returns { products: [], text: string, recommendations: [] }
 */
export function retrieveProducts(query, products = productsData, maxResults = 5) {
  if (!query || typeof query !== 'string' || !products || products.length === 0) {
    return {
      products: [],
      text: "I need a product catalog to help you with. Please try again later.",
      recommendations: null
    }
  }

  const entities = extractEntities(query)
  let candidates = [...products]

  // === HARD CONSTRAINTS ===

  // Hard filter: product type
  if (entities.productType) {
    const typeVariants = PRODUCT_TYPE_MAP[entities.productType] || { en: entities.productType }
    const searchTerms = [
      entities.productType,
      typeVariants.en,
      typeVariants.ur,
      ...(typeVariants.roman || [])
    ].filter(Boolean).map(t => t.toLowerCase())

    candidates = candidates.filter(p => {
      const searchText = `${p.name} ${p.description || ''} ${(p.tags || []).join(' ')}`.toLowerCase()
      return searchTerms.some(term => searchText.includes(term))
    })
  }

  // Hard filter: category
  if (entities.category) {
    candidates = candidates.filter(p => p.categoryId === entities.category)
  }

  // Hard filter: brand (if specified)
  if (entities.brand) {
    candidates = candidates.filter(p =>
      p.brand && p.brand.toLowerCase() === entities.brand.toLowerCase()
    )
  }

  // Hard filter: max budget
  if (entities.maxPrice !== null) {
    candidates = candidates.filter(p => p.price <= entities.maxPrice)
  }

  // Hard filter: min budget
  if (entities.minPrice !== null) {
    candidates = candidates.filter(p => p.price >= entities.minPrice)
  }

  // Hard filter: min rating
  if (entities.minRating !== null) {
    candidates = candidates.filter(p => p.rating >= entities.minRating)
  }

  // Soft filter: keywords (only when no product type hard filter was applied)
  const softKeywords = entities.keywords
  const expandedKeywords = softKeywords.length > 0 ? expandKeywords(softKeywords) : []

  if (expandedKeywords.length > 0 && candidates.length > 0 && !entities.productType) {
    const keywordRegex = new RegExp(
      expandedKeywords.map(kw => kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|'),
      'i'
    )
    const filtered = candidates.filter(p => {
      const searchText = `${p.name} ${p.description || ''} ${(p.tags || []).join(' ')}`.toLowerCase()
      return keywordRegex.test(searchText)
    })
    if (filtered.length > 0) {
      candidates = filtered
    }
  }

  // If still no candidates, try use case matching (only when no hard product type constraint)
  if (candidates.length === 0 && entities.useCases.length > 0 && !entities.productType) {
    const useCaseResults = []
    for (const useCase of entities.useCases) {
      const useCaseProducts = USE_CASE_PRODUCTS_KEYWORDS[useCase] || []
      for (const kw of useCaseProducts) {
        const matched = products.filter(p => {
          const searchText = `${p.name} ${p.description || ''} ${(p.tags || []).join(' ')}`.toLowerCase()
          return searchText.includes(kw)
        })
        for (const m of matched) {
          if (!useCaseResults.includes(m)) {
            useCaseResults.push(m)
          }
        }
      }
    }
    if (useCaseResults.length > 0) {
      candidates = useCaseResults
      // Apply remaining hard constraints
      if (entities.category) {
        candidates = candidates.filter(p => p.categoryId === entities.category)
      }
      if (entities.maxPrice !== null) {
        candidates = candidates.filter(p => p.price <= entities.maxPrice)
      }
      if (entities.minRating !== null) {
        candidates = candidates.filter(p => p.rating >= entities.minRating)
      }
    }
  }

  // Check if we have any meaningful constraints
  const hasHardConstraints = entities.productType || entities.category || entities.brand ||
    entities.maxPrice !== null || entities.minPrice !== null || entities.minRating !== null

  // If no candidates and we have hard constraints, explain clearly
  if (candidates.length === 0) {
    if (hasHardConstraints) {
      let reason = "I couldn't find any products matching your requirements."
      const details = []
      if (entities.productType) details.push(`of type "${entities.productType}"`)
      if (entities.maxPrice !== null) details.push(`under $${entities.maxPrice}`)
      if (entities.minRating !== null) details.push(`with rating ${entities.minRating}+`)
      if (details.length > 0) {
        reason += ` (${details.join(', ')})`
      }
      reason += ". You can try adjusting your criteria."
      return { products: [], text: reason, recommendations: null }
    }

    if (entities.useCases.length > 0) {
      return {
        products: [],
        text: "I couldn't find any products matching your use case. Try a different query or be more specific.",
        recommendations: null
      }
    }

    return {
      products: [],
      text: "I couldn't find any products matching that. Try different keywords like 'wireless headphones', 'running shoes', or 'coffee maker', or ask me to recommend products!",
      recommendations: null
    }
  }

  // === SOFT PREFERENCE RANKING ===
  // Score all candidates using relevance + soft preferences
  const scored = candidates.map(p => scoreRelevance(p, entities, expandedKeywords))

  // Sort by score (higher first)
  scored.sort((a, b) => b.score - a.score)

  // Take top results
  const top = scored.slice(0, maxResults)

  // Generate response text
  let text = ''
  if (entities.productType) {
    let desc = `Here are my top ${entities.productType} recommendations`
    if (entities.maxPrice !== null) desc += ` under $${entities.maxPrice}`
    desc += `:\n`
    text = desc
  } else if (entities.category) {
    text = `Here are some ${entities.category} products:\n`
  } else {
    text = `I found ${top.length} product${top.length > 1 ? 's' : ''} that might interest you:\n`
  }

  for (const item of top) {
    const reasonText = item.reasons.length > 0 ? ` — ${item.reasons.slice(0, 3).join(', ')}` : ''
    text += `• **${item.product.name}** — $${item.product.price.toFixed(2)} (${item.product.rating}★, ${item.product.reviewCount || 0} reviews)${reasonText}\n`
  }

  if (top.length > 0 && top[0].reasons.length === 0) {
    text += `\nThese are the best matches from our catalog based on your requirements.`
  }

  return {
    products: top.map(item => item.product),
    text,
    recommendations: top.map(item => ({
      product: item.product,
      score: item.score,
      reasons: item.reasons
    }))
  }
}