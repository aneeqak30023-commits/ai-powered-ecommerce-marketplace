/**
 * Intent Classifier
 *
 * Layer 1: Language and Understanding
 * Layer 2: Intent Router
 *
 * Classifies customer messages into clear intent categories.
 * Uses pattern-based matching enhanced with synonym normalization
 * for natural language robustness.
 */

const LANGUAGES = {
  ENGLISH: 'english',
  URDU: 'urdu',
  ROMAN_URDU: 'roman-urdu',
  SPANISH: 'spanish',
  FRENCH: 'french',
  UNKNOWN: 'unknown'
}

/** Urdu script detection */
const URDU_SCRIPT = /[\u0600-\u06FF]/

/** Roman Urdu pattern words */
const ROMAN_URDU_PATTERNS = /^(mujhe|chahiye|dikhao|dikhado|dikhaen|se kam|se zyada|ziyada|kam se|zyada se|wali|bhi|kya|kuch|hai|hai|mein|mujhe|chahiye|dikhao|pakki|pakka|theek|achha|bohat|zyada|kam|nahin|ni|toh|bhi|phir|ab|mera|tera|hamara|kya|koi|kaun|kitna|kaunse)/i

function detectLanguage(text) {
  if (!text || typeof text !== 'string') return LANGUAGES.UNKNOWN

  const hasUrduScript = URDU_SCRIPT.test(text)
  const words = text.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/).filter(w => w.length > 0)
  const romanUrduMatches = words.filter(w => ROMAN_URDU_PATTERNS.test(w)).length

  // Spanish detection
  const spanishWords = ['hola', 'gracias', 'por', 'favor', 'quiero', 'busco', 'ordenador', 'auriculares', 'reloj', 'envío', 'devolución', 'precio', 'cuánto', 'dónde', 'cómo']
  const spanishMatches = words.filter(w => spanishWords.includes(w)).length

  // French detection
  const frenchWords = ['bonjour', 'merci', 'je', 'vous', 'recherche', 'ordinateur', 'écouteurs', 'montre', 'livraison', 'retour', 'prix', 'combien', 'où', 'comment', 'recommand']
  const frenchMatches = words.filter(w => frenchWords.includes(w)).length

  if (hasUrduScript) return LANGUAGES.URDU
  if (romanUrduMatches >= 2) return LANGUAGES.ROMAN_URDU
  if (spanishMatches >= 2) return LANGUAGES.SPANISH
  if (frenchMatches >= 2) return LANGUAGES.FRENCH
  return LANGUAGES.ENGLISH
}

/**
 * Normalizes multilingual text to English for consistent processing.
 */
function normalizeText(text) {
  const lang = detectLanguage(text)

  if (lang === LANGUAGES.URDU) {
    return text
      .replace(/مجھے/gi, 'I want')
      .replace(/چاہیے/gi, 'want')
      .replace(/دکھائیں/gi, 'show me')
      .replace(/دکھادو/gi, 'show me')
      .replace(/سے کم/gi, 'under')
      .replace(/سے زیادہ/gi, 'above')
      .replace(/والی/gi, 'with')
      .replace(/کا|کی|کے/gi, 'of')
      .replace(/میں/gi, 'in')
      .replace(/ہے/gi, 'is')
      .replace(/بہت/gi, 'very')
      .replace(/اچھا|اچھی/gi, 'good')
      .replace(/لیپ ٹاپ/gi, 'laptop')
      .replace(/ہیڈفون/gi, 'headphones')
      .replace(/گھڑی/gi, 'watch')
      .replace(/کتابیں|کتاب/gi, 'book')
      .replace(/کیبنٹ/gi, 'keyboard')
      .replace(/سینچر/gi, 'speaker')
  }

  if (lang === LANGUAGES.ROMAN_URDU) {
    return text
      .replace(/\bmujhe\b/gi, 'i want')
      .replace(/\bchahiye\b/gi, 'want')
      .replace(/\bdikhao\b/gi, 'show me')
      .replace(/\bdikhado\b/gi, 'show me')
      .replace(/\bdikhaen\b/gi, 'show me')
      .replace(/\bse kam\b/gi, 'under')
      .replace(/\bse zyada\b/gi, 'above')
      .replace(/\bzyada se\b/gi, 'above')
      .replace(/\bkam se\b/gi, 'under')
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
      .replace(/\bleptop\b/gi, 'laptop')
      .replace(/\bheadphone\b/gi, 'headphones')
  }

  return text
}

const INTENT = {
  PRODUCT_SEARCH: 'PRODUCT_SEARCH',
  PRODUCT_RECOMMENDATION: 'PRODUCT_RECOMMENDATION',
  PRODUCT_COMPARISON: 'PRODUCT_COMPARISON',
  PRODUCT_INFORMATION: 'PRODUCT_INFORMATION',
  RETURNS: 'RETURNS',
  REFUNDS: 'REFUNDS',
  SHIPPING: 'SHIPPING',
  PAYMENTS: 'PAYMENTS',
  ORDER_STATUS: 'ORDER_STATUS',
  ORDER_CANCELLATION: 'ORDER_CANCELLATION',
  ACCOUNT_HELP: 'ACCOUNT_HELP',
  GREETING: 'GREETING',
  GENERAL_CONVERSATION: 'GENERAL_CONVERSATION',
  CLARIFICATION: 'CLARIFICATION',
  UNKNOWN: 'UNKNOWN'
}

const PRODUCT_INTENTS = new Set([
  INTENT.PRODUCT_SEARCH,
  INTENT.PRODUCT_RECOMMENDATION,
  INTENT.PRODUCT_COMPARISON,
  INTENT.PRODUCT_INFORMATION
])

const SUPPORT_INTENTS = new Set([
  INTENT.RETURNS,
  INTENT.REFUNDS,
  INTENT.SHIPPING,
  INTENT.PAYMENTS,
  INTENT.ORDER_STATUS,
  INTENT.ORDER_CANCELLATION,
  INTENT.ACCOUNT_HELP
])

const CONVERSATION_INTENTS = new Set([
  INTENT.GREETING,
  INTENT.GENERAL_CONVERSATION,
  INTENT.CLARIFICATION,
  INTENT.UNKNOWN
])

/**
 * Intent classification patterns.
 * Each pattern has a regex that, when matched, strongly indicates the intent.
 * Patterns are evaluated in order and the first match wins.
 */
const INTENT_PATTERNS = [
  // ORDER_STATUS - check before order cancellation
  {
    intent: INTENT.ORDER_STATUS,
    patterns: [
      /order\s*#?\s*\d+/i,
      /track(ing|ed)?\s*(my)?\s*order/i,
      /where\s+is\s+(my\s+)?(order|package|shipment)/i,
      /order\s+status/i,
      /delivery\s+status/i,
      /order\s+number/i
    ]
  },
  // ORDER_CANCELLATION
  {
    intent: INTENT.ORDER_CANCELLATION,
    patterns: [
      /cancel\s+(my\s+)?order/i,
      /want\s+to\s+cancel/i,
      /need\s+to\s+cancel/i,
      /stop\s+(my\s+)?order/i,
      /can\s+i\s+cancel/i,
      /cancellation/i
    ]
  },
  // RETURNS
  {
    intent: INTENT.RETURNS,
    patterns: [
      /return/i,
      /send\s+back/i,
      /exchange/i,
      /return\s+(policy|window|period|process)/i,
      /how\s+do\s+i\s+return/i,
      /can\s+i\s+return/i
    ]
  },
  // REFUNDS
  {
    intent: INTENT.REFUNDS,
    patterns: [
      /refund/i,
      /money\s+back/i,
      /get\s+my\s+money/i,
      /when\s+will\s+i\s+(get\s+)?(my\s+)?refund/i,
      /refund\s+(process|timeline|method|status)/i
    ]
  },
  // SHIPPING
  {
    intent: INTENT.SHIPPING,
    patterns: [
      /shipp(ing|ed)?/i,
      /deliver(y|ies|ed|ing)?/i,
      /how\s+long/i,
      /arrive/i,
      /dispatch/i,
      /track(ing)?/i,
      /courier/i,
      /postage/i,
      /shipping\s+(cost|fee|price|options|date|time|method)/i,
      /when\s+will\s+(it|my\s+order|the)/i
    ]
  },
  // PAYMENTS
  {
    intent: INTENT.PAYMENTS,
    patterns: [
      /payment/i,
      /pay(ment|ing)?\b/i,
      /credit\s+card/i,
      /debit\s+card/i,
      /wallet/i,
      /paypal/i,
      /checkout/i,
      /secure\s+(transact|payment)/i,
      /how\s+to\s+pay/i,
      /accepted\s+payment/i,
      /billing/i
    ]
  },
  // ACCOUNT_HELP
  {
    intent: INTENT.ACCOUNT_HELP,
    patterns: [
      /account/i,
      /password/i,
      /login|sign\s+in|sign\s+up/i,
      /profile/i,
      /address/i,
      /edit\s+account/i,
      /update\s+(my\s+)?(account|profile|address)/i,
      /customer\s+service/i,
      /contact/i,
      /human/i,
      /speak\s+(to|with)/i,
      /live\s+(agent|support)/i,
      /representative/i
    ]
  },
  // GREETING
  {
    intent: INTENT.GREETING,
    patterns: [
      /^(hi|hello|hey|good\s+(morning|evening|afternoon))[\s!.,]*$/i,
      /^what['']?s\s+up/i,
      /^howdy/i,
      /^greetings/i,
      /^(salam|as-salam)/i
    ]
  },
  // PRODUCT_COMPARISON
  {
    intent: INTENT.PRODUCT_COMPARISON,
    patterns: [
      /compare/i,
      /compar(ison|ing|ed)/i,
      /vs\b/i,
      /versus/i,
      /difference\s+between/i,
      /which\s+is\s+better/i,
      /better\s+between/i,
      /pros\s+and\s+cons/i,
      /side\s+by\s+side/i,
      /which\s+(one|is)\s+better/i,
      /worth\s+(it|buying)/i,
      /worth\s+more/i,
      /should\s+i\s+get/i
    ]
  },
  // PRODUCT_INFORMATION
  {
    intent: INTENT.PRODUCT_INFORMATION,
    patterns: [
      /tell\s+me\s+about/i,
      /details/i,
      /information\s+about/i,
      /specs/i,
      /specifications/i,
      /features/i,
      /describe/i,
      /learn\s+about/i,
      /product\s+info/i,
      /product\s+details/i,
      /characteristics/i,
      /what\s+is\s+(this|the)\s+(product|item)/i,
      /what\s+are\s+the\s+specs/i,
      /what\s+are\s+the\s+features/i,
      /more\s+info/i
    ]
  },
  // PRODUCT_RECOMMENDATION
  {
    intent: INTENT.PRODUCT_RECOMMENDATION,
    patterns: [
      /recommend/i,
      /suggest/i,
      /what\s+should\s+i\s+(buy|get|choose)/i,
      /what\s+to\s+buy/i,
      /what\s+do\s+you\s+suggest/i,
      /advice/i,
      /what['']?s\s+(the\s+)?best/i,
      /what\s+are\s+the\s+best/i,
      /show\s+me\s+(good|the\s+best)/i,
      /any\s+suggestions/i,
      /good\s+(option|choice|picks)/i,
      /best\s+(option|choice|picks|deal)/i,
      /should\s+i\s+get/i,
      /looking\s+for\s+(a\s+)?(good|the\s+best)/i,
      /what['']?s\s+(good|nice)/i,
      /i\s+need\s+(a\s+)?(good|the\s+best)/i
    ]
  },
  // PRODUCT_SEARCH
  {
    intent: INTENT.PRODUCT_SEARCH,
    patterns: [
      /find/i,
      /search/i,
      /looking\s+for/i,
      /do\s+you\s+have/i,
      /show\s+me/i,
      /i\s+need/i,
      /i\s+want/i,
      /where\s+can\s+i\s+find/i,
      /want\s+to\s+buy/i,
      /want\s+to\s+purchase/i,
      /any\s+good/i
    ]
  },
  // GREETING (short responses)
  {
    intent: INTENT.GREETING,
    patterns: [
      /^hi[\s!.,]*$/i,
      /^hello[\s!.,]*$/i,
      /^hey[\s!.,]*$/i
    ]
  }
]

/**
 * Classify the intent of a customer message.
 */
function classifyIntent(normalizedText) {
  const text = normalizedText.toLowerCase().trim()

  if (!text) return { intent: INTENT.UNKNOWN, confidence: 0.1 }

  // Check each intent pattern in order (priority order)
  for (const { intent, patterns } of INTENT_PATTERNS) {
    for (const pattern of patterns) {
      if (pattern.test(text)) {
        return { intent, confidence: 0.9 }
      }
    }
  }

  // Check for general conversation / clarification
  if (/^(thanks|thank\s+you|ok(ay)?|sure|surely|got\s+it|alright|cool|nice|yeah|yep|ok)/i.test(text)) {
    return { intent: INTENT.GENERAL_CONVERSATION, confidence: 0.8 }
  }

  if (/^(no\b|no\s+thanks|nope|never\s+mind|nothing|not\s+now)/i.test(text)) {
    return { intent: INTENT.GENERAL_CONVERSATION, confidence: 0.8 }
  }

  if (/^(ok|okay|sure|alright|got\s+it|thanks)/i.test(text) && text.split(/\s+/).length <= 3) {
    return { intent: INTENT.GENERAL_CONVERSATION, confidence: 0.7 }
  }

  // Single-word or very short queries with product type keywords
  const productTypePatterns = [
    /\b(headphones?|earbuds?|laptop?s?|watch(es)?|smartphone?s?|phone?s?|keyboard?s?|speaker?s?|camera?s?|monitor?s?)\b/i,
    /\b(shirt?s?|shoes|sneakers|t-shirt|tshirt|jeans|dress|jacket|coat|bag|backpack|wallet)s?\b/i,
    /\b(book|s|cream|makeup|lipstick|perfume|cream|sunscreen)\b/i
  ]

  for (const pattern of productTypePatterns) {
    if (pattern.test(text)) {
      return { intent: INTENT.PRODUCT_SEARCH, confidence: 0.7 }
    }
  }

  return { intent: INTENT.CLARIFICATION, confidence: 0.5 }
}

export {
  INTENT,
  PRODUCT_INTENTS,
  SUPPORT_INTENTS,
  CONVERSATION_INTENTS,
  LANGUAGES,
  detectLanguage,
  normalizeText,
  classifyIntent
}