import productsData from '../data/products.json'
import categoriesData from '../data/categories.json'

const PRODUCT_TYPE_MAP = {
  watch: { en: 'watch', ur: 'گھڑی', roman: ['waṭch', 'watch', 'gari', 'ghadi', 'watches'] },
  phone: { en: 'phone', ur: 'فون', roman: ['phone', 'fon', 'mobile', 'phones', 'smartphone', 'smartphones'] },
  laptop: { en: 'laptop', ur: 'لیپ ٹاپ', roman: ['laptop', 'leptop', 'notebook', 'laptops', 'notebooks'] },
  headphones: { en: 'headphones', ur: 'ہیڈفون', roman: ['headphones', 'headphone', 'hedfon', 'headphones', 'headset', 'head phones', 'headphones'] },
  earbuds: { en: 'earbuds', ur: 'ایربڈز', roman: ['earbuds', 'earbud', 'earbuds', 'ear phones', 'earbuds', 'earphones'] },
  keyboard: { en: 'keyboard', ur: 'کی بورڈ', roman: ['keyboard', 'keybord', 'key board', 'keyboards'] },
  speaker: { en: 'speaker', ur: 'سپیکر', roman: ['speaker', 'spiker', 'speakers', 'speakers'] },
  camera: { en: 'camera', ur: 'کیمرہ', roman: ['camera', 'kamra', 'cams', 'digital camera', 'cameras'] },
  webcam: { en: 'webcam', ur: 'ویب کیم', roman: ['webcam', 'web cam', 'web cams'] },
  'power bank': { en: 'power bank', ur: 'پاور بینک', roman: ['power bank', 'powerbank', 'power-bank', 'power banks'] },
  't-shirt': { en: 't-shirt', ur: 'ٹی شرٹ', roman: ['t-shirt', 'tshirt', 't shirt', 'tee shirt', 'tee-shirt', 't-shirts', 'tshirts'] },
  shirt: { en: 'shirt', ur: 'شرٹ', roman: ['shirt', 'shert', 'polo shirt', 'shirts', 't-shirt', 't-shirts'] },
  shoes: { en: 'shoes', ur: 'جوتے', roman: ['shoes', 'shoe', 'jootay', 'sneakers', 'sneaker', 'footwear', 'shoe'] },
  book: { en: 'book', ur: 'کتاب', roman: ['book', 'kitab', 'books', 'novel', 'novels', 'textbook', 'textbooks', 'ebook'] },
  cream: { en: 'cream', ur: 'کریم', roman: ['cream', 'kream', 'moisturizer', 'lotion', 'creams'] },
  makeup: { en: 'makeup', ur: 'میک اپ', roman: ['makeup', 'make up', 'meikup', 'cosmetics', 'beauty', 'makeup'] }
}

const CATEGORY_MAP = {
  electronics: { en: 'electronics', ur: 'الیکٹرانکس', roman: ['electronics', 'electronic'] },
  fashion: { en: 'fashion', ur: 'فیشن', roman: ['fashion', 'fashn'] },
  'home-kitchen': { en: 'home kitchen', ur: 'گھر/کچن', roman: ['home', 'kitchen', 'home kitchen'] },
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
  'over', 'above', 'below', 'products', 'product', 'recommend', 'suggest', 'best', 'top',
  'good', 'nice', 'under', 'budget', 'price', 'priced'
])

function detectLanguage(text) {
  const urduPattern = /[\u0600-\u06FF]/
  const hasUrdu = urduPattern.test(text)
  const hasRoman = /\b(mujhe|chahiye|dikhao|dikhado|dikhaen|se kam|se zyada|ki|wali|hai|ka|ki|ke|mein|main|aur|ya|to|bhi|nahi|nai|nahin|bht|bohat|zyada|kam|achha|accha|sasto|mehnga|package|offer|deal)\b/i.test(text)

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

// Synonym expansions - includes both singular and plural forms so that
// "watches" expands to "watch" and vice versa
const KEYWORD_SYNONYMS = {
  'headphone': ['headphones', 'headset', 'earphone', 'earphones', 'head phone', 'head phones', 'over ear', 'on ear', 'noise cancelling'],
  'headphones': ['headphone', 'headset', 'earphone', 'earphones', 'head phone', 'head phones', 'over ear', 'on ear', 'noise cancelling'],
  'earbud': ['earbuds', 'ear bud', 'ear buds', 'in ear', 'true wireless', 'wireless earbuds'],
  'earbuds': ['earbud', 'ear bud', 'ear buds', 'in ear', 'true wireless', 'wireless earbuds'],
  'laptop': ['laptops', 'notebook', 'notebooks', 'ultrabook', 'chromebook', 'notebook computer', 'netbook'],
  'laptops': ['laptop', 'notebook', 'notebooks', 'ultrabook', 'chromebook', 'notebook computer'],
  'notebook': ['laptops', 'laptop', 'notebooks', 'ultrabook', 'chromebook'],
  'phone': ['phones', 'mobile', 'smartphone', 'smartphones', 'cell phone', 'cell phones', 'mobile phone', 'telephone'],
  'phones': ['phone', 'mobile', 'smartphone', 'smartphones', 'cell phone', 'cell phones', 'mobile phone'],
  'watch': ['watches', 'smartwatch', 'smartwatches', 'wristwatch', 'fitness tracker', 'timepiece'],
  'watches': ['watch', 'smartwatch', 'smartwatches', 'wristwatch', 'fitness tracker', 'timepiece'],
  'smartwatch': ['smartwatches', 'watch', 'watches', 'fitness tracker', 'wristwatch'],
  'shoes': ['shoe', 'sneakers', 'sneaker', 'footwear', 'trainers', 'running shoes', 'athletic shoes'],
  'shoe': ['shoes', 'sneakers', 'sneaker', 'footwear', 'trainers', 'running shoes'],
  'keyboard': ['keyboards', 'mechanical keyboard', 'wireless keyboard', 'mechanical keyboards'],
  'keyboards': ['keyboard', 'mechanical keyboard', 'wireless keyboard'],
  'speaker': ['speakers', 'bluetooth speaker', 'portable speaker', 'sound system'],
  'speakers': ['speaker', 'bluetooth speaker', 'portable speaker'],
  'camera': ['cameras', 'digital camera', 'digital cameras', 'mirrorless', 'dslr'],
  'cameras': ['camera', 'digital camera', 'mirrorless', 'dslr'],
  'monitor': ['monitors', 'display', 'displays', 'screen', 'screens', 'desktop monitor'],
  'monitors': ['monitor', 'display', 'displays', 'screen', 'screens'],
  'display': ['displays', 'monitor', 'monitors', 'screen', 'screens'],
  'book': ['books', 'novel', 'novels', 'textbook', 'textbooks', 'ebook', 'ebooks', 'biography'],
  'books': ['book', 'novel', 'novels', 'textbook', 'textbooks', 'ebook', 'ebooks'],
  'cream': ['creams', 'moisturizer', 'lotion', 'face cream', 'skincare', 'body cream'],
  'makeup': ['makeups', 'cosmetics', 'beauty', 'foundation', 'lipstick', 'beauty products'],
  'bag': ['bags', 'backpack', 'backpacks', 'crossbody', 'handbag', 'tote'],
  'bags': ['bag', 'backpack', 'backpacks', 'crossbody', 'handbag', 'tote'],
  'backpack': ['backpacks', 'bag', 'bags', 'rucksack'],
  'mouse': ['mice', 'wireless mouse', 'bluetooth mouse'],
  'earphone': ['earphones', 'headphone', 'headphones', 'in ear'],
  'earphones': ['earphone', 'headphones', 'headphone', 'in ear'],
  'tshirt': ['t-shirt', 't-shirts', 'tee shirt', 'tee-shirt', 'tee shirts'],
  't-shirt': ['tshirt', 't-shirt', 't-shirts', 'tee shirt', 'tee-shirt', 'tee shirts'],
  'sunglasses': ['sunglass', 'shades', 'sun glasses'],
  'sneakers': ['sneaker', 'shoes', 'shoe', 'athletic', 'running'],
  'sneaker': ['sneakers', 'shoe', 'shoes', 'athletic', 'running'],
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

// Use case to keywords mapping for matching products to use cases
const USE_CASE_PRODUCTS_KEYWORDS = {
  studying: ['noise cancelling', 'quiet', 'comfortable', 'wireless', 'bluetooth', 'battery', 'lightweight', 'notebook', 'laptop', 'book', 'books', 'study', 'focus', 'student', 'educational', 'headphones', 'headphone', 'speaker', 'keyboard', 'mouse'],
  gaming: ['gaming', 'rgb', 'mechanical', 'surround', 'performance', 'game', 'high precision', 'low latency', 'fps', 'mmo'],
  work: ['professional', 'noise cancelling', 'comfortable', 'bluetooth', 'wireless', 'calls', 'microphone', 'office', 'meeting', 'keyboard', 'mouse', 'monitor'],
  travel: ['portable', 'compact', 'lightweight', 'wireless', 'long battery', 'travel', 'foldable', 'power bank'],
  content_creation: ['4k', 'high resolution', 'stabilization', 'professional', 'studio', 'recording', 'camera', 'microphone', 'webcam'],
  coding: ['comfortable', 'ergonomic', 'mechanical', 'programmable', 'multi-device', 'quiet', 'backlit', 'keyboard', 'monitor', 'mouse']
}

// Use case detection patterns
const USE_CASE_PATTERNS = [
  { key: 'studying', pattern: /studying|study|student|college|university|class|lecture|educational|school|dorm|campus/i },
  { key: 'gaming', pattern: /gaming|game|gamer|fps|mmo|streaming|console|pc gaming|esports/i },
  { key: 'content_creation', pattern: /content creator|content creation|youtube|tiktok|vlog|video editing|photo editing/i },
  { key: 'coding', pattern: /coding|programming|developer|software engineer|code/i },
  { key: 'work', pattern: /work|office|business|professional|meeting|calls|remote work|home office/i },
  { key: 'travel', pattern: /travel|commute|portable|flight|on the go|mobile|lightweight/i },
  { key: 'outdoor', pattern: /outdoor|sports|running|gym|exercise|workout|active|fishing|hiking|camping/i },
  { key: 'home', pattern: /home|kitchen|indoor|daily use|everyday|household|smart home/i }
]

function detectUseCases(text) {
  const normalized = normalizeToEnglish(text).toLowerCase()
  const useCases = []
  for (const { key, pattern } of USE_CASE_PATTERNS) {
    if (pattern.test(normalized) && !useCases.includes(key)) {
      useCases.push(key)
    }
  }
  return useCases
}

function expandKeywords(keywords) {
  const expanded = new Set(keywords)
  for (const kw of keywords) {
    // Direct synonym match
    if (SYNONYM_MAP[kw]) {
      for (const syn of SYNONYM_MAP[kw]) {
        expanded.add(syn)
      }
    }
    // Check if any synonym key is a parent (reverse lookup)
    for (const [parent, synonyms] of Object.entries(KEYWORD_SYNONYMS)) {
      if (synonyms.includes(kw)) {
        expanded.add(parent)
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
    originalQuery: text,
    useCases: detectUseCases(text)
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
    /(\d+(?:\.\d+)?)\s*(?:dollars|dollar)/i,
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

  // Extract keywords (remove plural 's' for better matching)
  const words = normalized.replace(/[^\w\s]/g, '').split(/\s+/).filter(w => w.length > 2)
  const singularized = words.map(singularize).filter(w => w.length > 2)
  entities.keywords = [...new Set([...words, ...singularized])]

  return entities
}

/**
 * Simple singularization: removes trailing 's' or 'es' for basic plural handling.
 * Not a full stemming library, but handles common e-commerce plurals.
 */
function singularize(word) {
  if (word.endsWith('ies') && word.length > 4) {
    return word.slice(0, -3) + 'y'
  }
  if (word.endsWith('es') && word.length > 3) {
    // Keep "es" endings for words like "watches" -> "watch" handled separately
    return word.slice(0, -2)
  }
  if (word.endsWith('s') && word.length > 3) {
    return word.slice(0, -1)
  }
  return word
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

  // If entity-based filters (category, type, price, rating) reduced results but none remain,
  // try falling back to keyword search
  const hasHardConstraints = entities.productType || entities.category ||
    entities.maxPrice !== null || entities.minPrice !== null || entities.minRating !== null

  if (results.length === 0 && hasHardConstraints) {
    const fallbackResults = fallbackKeywordSearch(query, entities, products)
    if (fallbackResults.length > 0) {
      return fallbackResults
    }
    return []
  }

  // Keyword filtering: only apply when no specific entity filter is active
  // (no product type, no category, no price/rating constraints)
  if (!hasHardConstraints && results.length > 0) {
    const meaningfulKeywords = entities.keywords.filter(kw => !SEARCH_STOPWORDS.has(kw) && kw.length > 2)
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
      } else {
        // Keywords were present but matched nothing - return empty instead of
        // returning all products (which would be irrelevant)
        results = []
      }
    }
  }

  // If no results after keyword filtering, try use case matching as a fallback
  if (results.length === 0 && entities.useCases && entities.useCases.length > 0) {
    const ucResults = searchUseCaseProducts(entities.useCases, products)
    if (ucResults.length > 0) {
      results = ucResults
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

/**
 * Fallback search that matches products based on use case keywords.
 * Does NOT return random/unrelated products - only products that match
 * the detected use case keywords.
 */
function searchUseCaseProducts(useCases, products) {
  const matchedProducts = products.filter(p => {
    const productText = `${p.name} ${p.description || ''} ${(p.tags || []).join(' ')}`.toLowerCase()
    return useCases.some(uc => {
      const kw = USE_CASE_PRODUCTS_KEYWORDS[uc] || []
      return kw.some(k => productText.includes(k))
    })
  })
  return matchedProducts
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

  let fallbackResults = products

  // CRITICAL: If a product type was detected in the query, the fallback must
  // still respect that constraint. Filter by product type BEFORE keyword search
  // to prevent returning unrelated product categories.
  if (entities.productType) {
    const typeRegex = new RegExp(entities.productType, 'i')
    fallbackResults = fallbackResults.filter(p => {
      const searchText = `${p.name} ${p.description || ''} ${(p.tags || []).join(' ')}`.toLowerCase()
      return typeRegex.test(searchText)
    })
  }

  // Now apply keyword matching on the constrained set
  fallbackResults = fallbackResults.filter(p => {
    const searchText = `${p.name} ${p.description || ''} ${(p.tags || []).join(' ')}`.toLowerCase()
    return keywordRegex.test(searchText)
  })

  if (fallbackResults.length === 0) {
    return []
  }

  // Apply price/rating filters if available (MUST enforce constraints)
  if (entities.maxPrice !== null) {
    fallbackResults = fallbackResults.filter(p => p.price <= entities.maxPrice)
  }
  if (entities.minPrice !== null) {
    fallbackResults = fallbackResults.filter(p => p.price >= entities.minPrice)
  }
  if (entities.minRating !== null) {
    fallbackResults = fallbackResults.filter(p => p.rating >= entities.minRating)
  }

  if (fallbackResults.length === 0) {
    return []
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

export { detectLanguage, normalizeToEnglish, extractMultilingualEntities, PRODUCT_TYPE_MAP, CATEGORY_MAP, detectUseCases, USE_CASE_PRODUCTS_KEYWORDS, KEYWORD_SYNONYMS }
