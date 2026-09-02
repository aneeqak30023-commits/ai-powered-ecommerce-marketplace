import productsData from '../data/products.json'
import categoriesData from '../data/categories.json'

const PRODUCT_TYPE_MAP = {
  watch: { en: 'watch', ur: 'گھڑی', roman: ['waṭch', 'watch', 'gari', 'ghadi'] },
  phone: { en: 'phone', ur: 'فون', roman: ['phone', 'fon', 'mobile'] },
  laptop: { en: 'laptop', ur: 'لیپ ٹاپ', roman: ['laptop', 'leptop', 'notebook'] },
  headphones: { en: 'headphones', ur: 'ہیڈفون', roman: ['headphones', 'headphone', 'hedfon', 'headphone', 'headset', 'head phones'] },
  earbuds: { en: 'earbuds', ur: 'ایربڈز', roman: ['earbuds', 'earbud', 'earbuds', 'ear phones', 'earbuds'] },
  keyboard: { en: 'keyboard', ur: 'کی بورڈ', roman: ['keyboard', 'keybord', 'key board'] },
  speaker: { en: 'speaker', ur: 'سپیکر', roman: ['speaker', 'spiker', 'speakers'] },
  camera: { en: 'camera', ur: 'کیمرہ', roman: ['camera', 'kamra', 'cams', 'digital camera'] },
  webcam: { en: 'webcam', ur: 'ویب کیم', roman: ['webcam', 'web cam', 'web cam'] },
  'power bank': { en: 'power bank', ur: 'پاور بینک', roman: ['power bank', 'powerbank', 'power-bank'] },
  't-shirt': { en: 't-shirt', ur: 'ٹی شرٹ', roman: ['t-shirt', 'tshirt', 't shirt', 'tee shirt', 'tee-shirt'] },
  shirt: { en: 'shirt', ur: 'شرٹ', roman: ['shirt', 'shert', 'polo shirt'] },
  shoes: { en: 'shoes', ur: 'جوتے', roman: ['shoes', 'shoe', 'jootay', 'sneakers', 'footwear'] },
  book: { en: 'book', ur: 'کتاب', roman: ['book', 'kitab', 'books', 'novel', 'textbook'] },
  cream: { en: 'cream', ur: 'کریم', roman: ['cream', 'kream', 'moisturizer', 'lotion'] },
  makeup: { en: 'makeup', ur: 'میک اپ', roman: ['makeup', 'make up', 'meikup', 'cosmetics', 'beauty'] }
}

const CATEGORY_MAP = {
  electronics: { en: 'electronics', ur: 'الیکٹرانکس', roman: ['electronics', 'electronic'] },
  fashion: { en: 'fashion', ur: 'فیشن', roman: ['fashion', 'fashn'] },
  'home-kitchen': { en: 'home kitchen', ur: 'گھر/کچن', roman: ['home', 'kitchen', 'home kitchen', 'homedics'] },
  sports: { en: 'sports', ur: 'کھیل', roman: ['sports', 'sport'] },
  books: { en: 'books', ur: 'کتابیں', roman: ['books', 'book'] },
  beauty: { en: 'beauty', ur: 'بیوٹی', roman: ['beauty', 'beuty'] }
}

const SEARCH_STOPWORDS = new Set([
  'show', 'me', 'find', 'want', 'need', 'looking', 'search', 'please', 'what', 'which',
  'tell', 'give', 'try', 'how', 'can', 'could', 'would', 'should', 'may', 'might', 'with',
  'for', 'the', 'this', 'that', 'a', 'an', 'of', 'in', 'on', 'to', 'do', 'does', 'did',
  'will', 'has', 'had', 'have', 'are', 'is', 'was', 'were', 'i', 'you', 'he', 'she', 'it',
  'we', 'they', 'them', 'their', 'your', 'my', 'our', 'all', 'any', 'some', 'many', 'more',
  'most', 'or', 'but', 'about', 'from', 'than', 'then', 'here', 'also', 'very', 'much', 'under',
  'over', 'above', 'below', 'products', 'product'
])

function detectLanguage(text) {
  const urduPattern = /[\u0600-\u06FF]/
  const hasUrdu = urduPattern.test(text)
  const hasRoman = /\b(mujhe|chahiye|dikhao|dikhado|dikhaen|se kam|se zyada|ki|wali|hai|ka|ki|ke|mein|main|aur|ya|to|bhi|nahi|nai|nahin|bht|bohat|zyada|kam|achha|accha|sasta|mehnga|package|offer|deal)\b/i.test(text)

  if (hasUrdu && hasRoman) return 'mixed'
  if (hasUrdu) return 'urdu'
  if (hasRoman) return 'roman-urdu'
  return 'english'
}

function normalizeRomanUrdu(text) {
  return text
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

function normalizeUrdu(text) {
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
}

function normalizeToEnglish(text) {
  const lang = detectLanguage(text)
  if (lang === 'urdu') {
    return normalizeUrdu(text)
  }
  if (lang === 'roman-urdu' || lang === 'mixed') {
    return normalizeRomanUrdu(text)
  }
  return text
}

// Synonym expansions for more natural language understanding
const KEYWORD_SYNONYMS = {
  'headphones': ['headphone', 'headphone', 'head phones', 'earphone', 'earphones', 'headset'],
  'earbuds': ['earbuds', 'earbud', 'ear bud', 'ear buds', 'in ear', 'wireless earbuds'],
  'laptop': ['laptop', 'laptops', 'notebook', 'laptops', 'notebook computer'],
  'phone': ['phone', 'phones', 'mobile', 'smartphone', 'mobile phone'],
  'watch': ['watch', 'watches', 'smartwatch', 'wristwatch'],
  'shoes': ['shoes', 'shoe', 'sneaker', 'sneakers', 'footwear', 'trainers'],
  'book': ['book', 'books', 'novel', 'textbook', 'ebook'],
  'keyboard': ['keyboard', 'keyboards', 'key board'],
  'speaker': ['speaker', 'speakers', 'bluetooth speaker'],
  'camera': ['camera', 'cameras', 'digital camera'],
  'shirt': ['shirt', 'shirts', 't-shirt', 'tshirt', 'polo'],
  'cream': ['cream', 'creams', 'moisturizer', 'lotion', 'face cream'],
  'makeup': ['makeup', 'make-up', 'cosmetics', 'beauty', 'beauty products']
}

function buildSynonymMap() {
  const map = {}
  // Direct synonyms from map
  for (const [key, synonyms] of Object.entries(KEYWORD_SYNONYMS)) {
    map[key] = [key, ...synonyms]
  }
  return map
}

const SYNONYM_MAP = buildSynonymMap()

function expandKeywords(keywords) {
  const expanded = new Set(keywords)
  for (const kw of keywords) {
    if (SYNONYM_MAP[kw]) {
      for (const syn of SYNONYM_MAP[kw]) {
        expanded.add(syn)
      }
    }
  }
  return [...expanded]
}

function extractMultilingualEntities(text) {
  const normalized = normalizeToEnglish(text).toLowerCase()
  const lang = detectLanguage(text)

  const entities = {
    productType: null,
    category: null,
    maxPrice: null,
    minPrice: null,
    minRating: null,
    orderId: null,
    keywords: [],
    language: lang,
    originalQuery: text
  }

  // Extract category from normalized text
  for (const [key, values] of Object.entries(CATEGORY_MAP)) {
    const allNames = [values.en, ...(values.roman || [])].filter(Boolean)
    if (key === 'home-kitchen') {
      // Match 'home' or 'kitchen' but exclude 'home' used in phrases like 'homedics'
      if (/\bhome\b/.test(normalized) || /\bkitchen\b/.test(normalized)) {
        entities.category = key
        break
      }
    } else if (allNames.some(name => hasWord(normalized, name))) {
      entities.category = key
      break
    }
  }

  // Extract product type from normalized text (longest-first to avoid substring conflicts)
  const productTypeEntries = Object.entries(PRODUCT_TYPE_MAP).sort((a, b) => b[0].length - a[0].length)
  for (const [key, values] of productTypeEntries) {
    const allNames = [values.en, values.ur, ...(values.roman || [])].filter(Boolean)
    if (allNames.some(name => hasWord(normalized, name))) {
      entities.productType = key
      break
    }
  }

  // Extract price ranges (more patterns for natural language)
  const pricePatterns = [
    /(?:under|below|less than|max|up to|cheaper than|cost)\s+(?:around|about|roughly)?\s*\$?(\d+(?:\.\d+)?)/i,
    /\$?(\d+(?:\.\d+)?)\s*[-–]\s*\$?(\d+(?:\.\d+)?)/i,
    /between\s+\$?(\d+(?:\.\d+)?)\s*and\s*\$?(\d+(?:\.\d+)?)/i,
    /(\d+(?:\.\d+)?)\s*(?:dollars?|dollar)/i,
    /(?:budget|spend)\s+(?:around|about|up to)?\s*\$?(\d+(?:\.\d+)?)/i,
    /under\s+\$?(\d+(?:\.\d+)?)/i,
    /(?:more than|above)\s+\$?(\d+(?:\.\d+)?)\s*(?:but\s+(?:under|below|less))\s+\$?(\d+(?:\.\d+)?)/i
  ]

  for (const pattern of pricePatterns) {
    const match = normalized.match(pattern)
    if (match) {
      if (match[2]) {
        entities.minPrice = Number(match[1])
        entities.maxPrice = Number(match[2])
      } else {
        entities.maxPrice = Number(match[1])
      }
      break
    }
  }

  // Extract rating
  const ratingPatterns = [
    /(?:rating|rated|stars?|score|rated)\s+(?:above|over|at least|minimum|min|more than|better than)\s+(\d+(?:\.\d+)?)/i,
    /(\d+(?:\.\d+)?)\s*(?:stars?|star rating|ratings?)/i,
    /(?:good|high|top)\s+(?:rating|ratings?)\s*(\d+(?:\.\d+)?)/i
  ]

  for (const pattern of ratingPatterns) {
    const match = normalized.match(pattern)
    if (match) {
      entities.minRating = Number(match[1])
      break
    }
  }

  // Extract keywords (preserve meaningful product descriptors)
  const words = normalized.replace(/[^\w\s]/g, '').split(/\s+/).filter(w => w.length > 2)
  entities.keywords = [...new Set(words)]

  return entities
}

function hasWord(text, word) {
  const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return new RegExp(`\\b${escaped}`, 'i').test(text)
}

export function searchProductsMultilingual(query, products = productsData, _categories = categoriesData) {
  if (!query || typeof query !== 'string') {
    return []
  }

  const entities = extractMultilingualEntities(query)
  let results = [...products]

  // Filter by category
  if (entities.category) {
    results = results.filter(p => p.categoryId === entities.category)
  }

  // Filter by product type
  if (entities.productType) {
    const typeVariants = PRODUCT_TYPE_MAP[entities.productType] || { en: entities.productType }
    const searchTerms = [entities.productType, typeVariants.en, typeVariants.ur, ...(typeVariants.roman || [])].filter(Boolean).map(t => t.toLowerCase())
    results = results.filter(p => {
      const searchText = `${p.name} ${p.description || ''} ${(p.tags || []).join(' ')}`.toLowerCase()
      return searchTerms.some(term => searchText.includes(term))
    })
  }

  // Filter by max price
  if (entities.maxPrice !== null) {
    results = results.filter(p => p.price <= entities.maxPrice)
  }

  // Filter by min price
  if (entities.minPrice !== null) {
    results = results.filter(p => p.price >= entities.minPrice)
  }

  // Filter by min rating
  if (entities.minRating !== null) {
    results = results.filter(p => p.rating >= entities.minRating)
  }

  // If entity-based filters reduced results but none remain, try falling back to keyword search
  if (results.length === 0) {
    const fallbackResults = fallbackKeywordSearch(query, entities, products)
    if (fallbackResults.length > 0) {
      return fallbackResults
    }
  }

  // Keyword filtering: only apply when no specific entity filter is active,
  // or when entity filter returned no results and we're in fallback mode
  const hasEntityFilter = entities.productType || entities.category ||
    entities.maxPrice !== null || entities.minPrice !== null || entities.minRating !== null

  if (!hasEntityFilter) {
    const meaningfulKeywords = entities.keywords.filter(kw => !SEARCH_STOPWORDS.has(kw))
    if (meaningfulKeywords.length > 0) {
      // Expand keywords with synonyms for better matching
      const expandedKeywords = expandKeywords(meaningfulKeywords)
      const keywordRegex = new RegExp(expandedKeywords.map(kw => kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|'), 'i')

      const filtered = results.filter(p => {
        const searchText = `${p.name} ${p.description || ''} ${(p.tags || []).join(' ')}`.toLowerCase()
        return keywordRegex.test(searchText)
      })
      // Only apply keyword filter if it doesn't eliminate all results
      if (filtered.length > 0) {
        results = filtered
      }
    }
  }

  // Sort by relevance score (rating, then price proximity if budget specified)
  results.sort((a, b) => {
    // Primary: rating (higher first)
    if (b.rating !== a.rating) {
      return b.rating - a.rating
    }
    // Secondary: price preference (if budget specified, prefer closer to budget)
    if (entities.maxPrice !== null) {
      return Math.abs(a.price - entities.maxPrice) - Math.abs(b.price - entities.maxPrice)
    }
    return 0
  })

  return results.slice(0, 5)
}

function fallbackKeywordSearch(query, entities, products) {
  const normalized = query.toLowerCase()
  // Expand the original query with synonyms
  const words = normalized.replace(/[^\w\s]/g, '').split(/\s+/).filter(w => w.length > 2)
  const meaningful = words.filter(w => !SEARCH_STOPWORDS.has(w))
  const expanded = expandKeywords(meaningful)

  if (expanded.length === 0) {
    return []
  }

  const keywordRegex = new RegExp(expanded.map(kw => kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|'), 'i')

  let fallbackResults = products.filter(p => {
    const searchText = `${p.name} ${p.description || ''} ${(p.tags || []).join(' ')}`.toLowerCase()
    return keywordRegex.test(searchText)
  })

  if (fallbackResults.length === 0) {
    return []
  }

  // Apply price/rating filters if available (price is optional in fallback)
  if (entities.maxPrice !== null) {
    const priceFiltered = fallbackResults.filter(p => p.price <= entities.maxPrice)
    if (priceFiltered.length > 0) {
      fallbackResults = priceFiltered
    }
  }
  if (entities.minPrice !== null) {
    const priceFiltered = fallbackResults.filter(p => p.price >= entities.minPrice)
    if (priceFiltered.length > 0) {
      fallbackResults = priceFiltered
    }
  }
  if (entities.minRating !== null) {
    const ratingFiltered = fallbackResults.filter(p => p.rating >= entities.minRating)
    if (ratingFiltered.length > 0) {
      fallbackResults = ratingFiltered
    }
  }

  // Sort by relevance
  fallbackResults.sort((a, b) => b.rating - a.rating)
  if (entities.maxPrice !== null) {
    fallbackResults.sort((a, b) => {
      if (b.rating !== a.rating) return b.rating - a.rating
      return Math.abs(a.price - entities.maxPrice) - Math.abs(b.price - entities.maxPrice)
    })
  }

  return fallbackResults.slice(0, 5)
}

export { detectLanguage, normalizeToEnglish, extractMultilingualEntities, PRODUCT_TYPE_MAP, CATEGORY_MAP }
