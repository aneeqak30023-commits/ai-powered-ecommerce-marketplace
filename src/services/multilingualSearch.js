import productsData from '../data/products.json'
import categoriesData from '../data/categories.json'

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

function extractMultilingualEntities(text) {
  const normalized = normalizeToEnglish(text).toLowerCase()
  const lang = detectLanguage(text)

  const entities = {
    productType: null,
    category: null,
    maxPrice: null,
    minPrice: null,
    minRating: null,
    keywords: [],
    language: lang,
    originalQuery: text
  }

  // Extract category from normalized text
  for (const [key, values] of Object.entries(CATEGORY_MAP)) {
    const allNames = [values.en, ...(values.roman || [])].join(' ')
    if (normalized.includes(key) || allNames.split(' ').some(w => normalized.includes(w))) {
      entities.category = key
      break
    }
  }

  // Extract product type from normalized text
  for (const [key, values] of Object.entries(PRODUCT_TYPE_MAP)) {
    const allNames = [values.en, values.ur, ...(values.roman || [])].join(' ')
    if (allNames.split(' ').some(w => normalized.includes(w.toLowerCase()))) {
      entities.productType = key
      break
    }
  }

  // Extract price
  const pricePatterns = [
    /(?:under|below|less than|max|up to|cheaper than|سے کم)\s+\$?(\d+(?:\.\d+)?)/i,
    /\$?(\d+(?:\.\d+)?)\s*[-–to]+\s*\$?(\d+(?:\.\d+)?)/i,
    /(\d+(?:\.\d+)?)\s*(?:dollars?|ڈالر|dollar)/i
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
    /(?:rating|rated|stars?|score|ریٹنگ|ستارہ)\s+(?:above|over|at least|minimum|min|سے زیادہ)\s+(\d+(?:\.\d+)?)/i,
    /(\d+(?:\.\d+)?)\s*(?:stars?|ستارہ)/i
  ]

  for (const pattern of ratingPatterns) {
    const match = normalized.match(pattern)
    if (match) {
      entities.minRating = Number(match[1])
      break
    }
  }

  // Extract keywords
  const words = normalized.replace(/[^\w\s]/g, '').split(/\s+/).filter(w => w.length > 2)
  entities.keywords = [...new Set(words)]

  return entities
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

  // Filter by keywords
  if (entities.keywords.length > 0) {
    results = results.filter(p => {
      const searchText = `${p.name} ${p.description || ''} ${(p.tags || []).join(' ')}`.toLowerCase()
      return entities.keywords.some(w => searchText.includes(w))
    })
  }

  // Sort by relevance
  results.sort((a, b) => b.rating - a.rating)

  return results.slice(0, 5)
}

export { detectLanguage, normalizeToEnglish, extractMultilingualEntities, PRODUCT_TYPE_MAP, CATEGORY_MAP }
