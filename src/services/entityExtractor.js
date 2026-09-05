/**
 * Entity Extractor
 *
 * Layer 1: Language and Understanding - Entity Extraction
 *
 * Extracts structured entities from customer messages:
 * - language
 * - productType (hard constraint)
 * - category (hard constraint)
 * - brand (hard constraint)
 * - maxPrice / minPrice (hard constraint)
 * - minRating (hard constraint)
 * - features (soft preference)
 * - useCases (soft preference)
 * - comparisonTargets (for comparison intent)
 */

import { LANGUAGES, normalizeText, detectLanguage } from './intentClassifier.js'
import { PRODUCT_TYPE_MAP, CATEGORY_MAP } from './multilingualSearch.js'

/**
 * Simple singularization for better matching.
 */
function singularize(word) {
  if (word.endsWith('ies') && word.length > 4) return word.slice(0, -3) + 'y'
  if (word.endsWith('es') && word.length > 3) return word.slice(0, -2)
  if (word.endsWith('s') && word.length > 3) return word.slice(0, -1)
  return word
}

/**
 * Extract structured entities from a normalized query.
 */
function extractEntities(normalizedQuery) {
  const lang = detectLanguage(normalizedQuery)
  const lower = normalizeText(normalizedQuery).toLowerCase()

  const entities = {
    language: lang,
    productType: null,
    category: null,
    brand: null,
    maxPrice: null,
    minPrice: null,
    minRating: null,
    features: [],
    useCases: [],
    comparisonTargets: [],
    keywords: []
  }

  // Extract category
  for (const [key, values] of Object.entries(CATEGORY_MAP)) {
    const allNames = [values.en, ...(values.roman || [])].filter(Boolean)
    if (allNames.some(name => lower.includes(name.toLowerCase()))) {
      entities.category = key
      break
    }
  }

  // Extract product type (longest-first to avoid substring conflicts)
  const productTypeEntries = Object.entries(PRODUCT_TYPE_MAP).sort((a, b) => b[0].length - a[0].length)
  for (const [key, values] of productTypeEntries) {
    const allNames = [values.en, values.ur, ...(values.roman || [])].filter(Boolean)
    if (allNames.some(name => lower.includes(name.toLowerCase()))) {
      entities.productType = key
      break
    }
  }

  // Extract brand (simple pattern: looking for capitalized brand names)
  // This is a basic implementation - can be enhanced with a brand database
  const brandPatterns = [
    /\b(apple|Samsung|samsung|Sony|sony|Nike|nike|Adidas|adidas|Dell|dell|HP|hp|Lenovo|lenovo|Logitech|logitech|Bose|bose|Garmin|garmin|Armani|armani|Rolex|rolex|Ray-Ban|ray-ban|oakley|Oakley)\b/i
  ]
  for (const pattern of brandPatterns) {
    const match = lower.match(pattern)
    if (match) {
      entities.brand = match[0]
      break
    }
  }

  // Extract price range
  const pricePatterns = [
    /(?:under|below|less\s+than|max|up\s+to|cheaper\s+than|cost|budget|priced)\s+\$?(\d+(?:\.\d+)?)/i,
    /\$(\d+(?:\.\d+)?)\s*[-–to]+\s*\$?(\d+(?:\.\d+)?)/i,
    /between\s+\$?(\d+(?:\.\d+)?)\s*and\s*\$?(\d+(?:\.\d+)?)/i,
    /(\d+(?:\.\d+)?)\s*(?:dollars|dollar)/i,
    /(?:spend|budget)\s+(?:around|about|up\s+to)?\s*\$?(\d+(?:\.\d+)?)/i,
    /under\s+\$?(\d+(?:\.\d+)?)/i,
    /over\s+\$?(\d+(?:\.\d+)?)/i,
    /(\d+(?:\.\d+)?)\s*(?:bucks|dollars)/i
  ]

  for (const pattern of pricePatterns) {
    const match = lower.match(pattern)
    if (match) {
      if (match[2]) {
        entities.minPrice = Number(match[1])
        entities.maxPrice = Number(match[2])
      } else {
        const singlePrice = Number(match[1])
        if (lower.includes('under') || lower.includes('below') || lower.includes('less than') || lower.includes('max') || lower.includes('up to') || lower.includes('cheaper') || lower.includes('budget')) {
          entities.maxPrice = singlePrice
        } else if (lower.includes('over') || lower.includes('above') || lower.includes('more than')) {
          entities.minPrice = singlePrice
        } else {
          // Default to max price
          entities.maxPrice = singlePrice
        }
      }
      break
    }
  }

  // Extract rating
  const ratingPatterns = [
    /(?:rating|rated|stars?|score)\s+(?:above|over|at\s+least|minimum|min|more\s+than)\s+(\d+(?:\.\d+)?)/i,
    /(\d+(?:\.\d+)?)\s*(?:stars?|star\s+rating|ratings?)/i,
    /(?:good|high|top)\s+(?:rating|ratings?)\s*(\d+(?:\.\d+)?)/i
  ]

  for (const pattern of ratingPatterns) {
    const match = lower.match(pattern)
    if (match) {
      entities.minRating = Number(match[1])
      break
    }
  }

  // Extract use cases (soft preference)
  const useCasePatterns = {
    student: /student|studying|study|college|university|class|lecture|educational/i,
    gaming: /gaming|gamer|game|fps|mmo|streaming/i,
    work: /work|office|business|professional|meeting|calls/i,
    travel: /travel|commute|portable|flight|on\s+the\s+go/i,
    fitness: /fitness|gym|exercise|workout|running|outdoor/i,
    home: /home|kitchen|indoor|everyday|daily/i
  }

  for (const [key, pattern] of Object.entries(useCasePatterns)) {
    if (pattern.test(lower)) {
      entities.useCases.push(key)
    }
  }

  // Extract features (soft preference)
  const featurePatterns = [
    'wireless', 'bluetooth', 'noise cancelling', 'waterproof', '4k', 'mechanical',
    'ergonomic', 'portable', 'compact', 'smart', 'voice', 'rgb',
    'lightweight', 'breathable', 'insulated', 'memory foam', 'organic'
  ]

  for (const feature of featurePatterns) {
    if (lower.includes(feature)) {
      entities.features.push(feature)
    }
  }

  // Extract comparison targets
  const comparisonKeywords = ['compare', 'versus', 'vs', 'versus', 'difference between']
  const hasComparison = comparisonKeywords.some(kw => lower.includes(kw))
  if (hasComparison) {
    // Extract product names mentioned in the comparison
    const productMatches = [...lower.matchAll(/([a-z\s]+?)\s+(vs|versus|compared to|compared with|and)\s+([a-z\s]+?)(?:\?|$)/i)]
    if (productMatches.length > 0) {
      for (const match of productMatches) {
        entities.comparisonTargets.push(match[1].trim())
        entities.comparisonTargets.push(match[3].trim())
      }
    } else {
      // Try to extract product names from "compare X and Y"
      const compareMatch = lower.match(/compare\s+(.+?)\s+and\s+(.+?)(?:\?|$)/i)
      if (compareMatch) {
        entities.comparisonTargets.push(compareMatch[1].trim())
        entities.comparisonTargets.push(compareMatch[2].trim())
      }
    }
  }

  // Extract general keywords (for keyword-based retrieval)
  const stopWords = new Set([
    'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
    'i', 'you', 'he', 'she', 'it', 'we', 'they', 'them', 'their', 'your',
    'my', 'our', 'what', 'which', 'for', 'to', 'in', 'on', 'at', 'of',
    'with', 'by', 'from', 'as', 'into', 'about', 'than', 'then', 'so',
    'if', 'or', 'but', 'and', 'not', 'no', 'do', 'does', 'did', 'have',
    'has', 'had', 'will', 'would', 'should', 'could', 'can', 'may', 'might',
    'show', 'me', 'find', 'want', 'need', 'looking', 'search', 'please',
    'tell', 'give', 'try', 'how', 'any', 'under', 'over', 'below', 'above',
    'budget', 'price', 'priced', 'product', 'products', 'recommend', 'suggest',
    'best', 'top', 'good', 'nice', 'popular', 'advice', 'suggestion',
    'looking for', 'do you have', 'i need', 'i want', 'i am', 'would like'
  ])

  const words = lower.replace(/[^\w\s]/g, '').split(/\s+/).filter(w => w.length > 2)
  const singularized = words.map(singularize).filter(w => w.length > 2)
  entities.keywords = [...new Set([...words, ...singularized])].filter(w => !stopWords.has(w))

  return entities
}

export { extractEntities, LANGUAGES }