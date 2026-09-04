import knowledgeBaseData from '../data/knowledgeBase.json'

const MIN_CONFIDENCE = 0.3

/**
 * Simple plural/singular normalization for keyword matching.
 * Strips trailing 's' or 'es' to match singular forms.
 */
function normalizeKeyword(kw) {
  const trimmed = kw.replace(/[^\w\s]/g, '').trim()
  if (trimmed.endsWith('ies') && trimmed.length > 4) return trimmed.slice(0, -3) + 'y'
  if (trimmed.endsWith('es') && trimmed.length > 3) return trimmed.slice(0, -2)
  if (trimmed.endsWith('s') && trimmed.length > 3) return trimmed.slice(0, -1)
  return trimmed
}

/**
 * Checks if a keyword matches the query text, handling plurals/singulars.
 * Both the query and the keyword are normalized for matching.
 */
function matchesKeyword(text, keyword) {
  const normText = normalizeKeyword(text)
  const normKw = normalizeKeyword(keyword)

  // Direct substring match
  if (normText.includes(normKw)) return true

  // Word-level match (handles "returns" matching "return")
  const textWords = normText.split(/\s+/)
  const kwWords = normKw.split(/\s+/)
  if (kwWords.length === 1) {
    // Single word: check if any text word matches after normalization
    return textWords.some(w => normalizeKeyword(w) === kwWords[0])
  }
  // Multi-word: check if all keywords words appear as a subsequence
  return kwWords.every(kw => textWords.some(tw => normalizeKeyword(tw) === normalizeKeyword(kw)))
}

export function searchKnowledgeBase(query) {
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

  for (const item of knowledgeBaseData) {
    const keywords = item.keywords || []
    const question = (item.question || '').toLowerCase()

    const exactKeywordMatches = keywords.filter(k => text.includes(k.toLowerCase()))
    const matchedKeywords = keywords.filter(k => matchesKeyword(text, k.toLowerCase()))
    const questionWordMatches = words.filter(w => question.includes(w) && w.length > 3)

    const hasKeywordMatch = matchedKeywords.length > 0
    const hasQuestionMatch = questionWordMatches.length >= 2

    if (!hasKeywordMatch && !hasQuestionMatch) {
      continue
    }

    let score = 0
    if (hasKeywordMatch) {
      // Use the count of matched keywords for scoring, with a minimum per match
      score = Math.max(score, matchedKeywords.length / Math.max(1, keywords.length), 0.5)
    }
    if (hasQuestionMatch) {
      score = Math.max(score, questionWordMatches.length / words.length * 0.7)
    }

    if (score > bestScore) {
      bestScore = score
      bestMatch = {
        ...item,
        confidence: score,
        matchedKeywords: hasKeywordMatch ? matchedKeywords : questionWordMatches
      }
    }
  }

  if (bestMatch && bestMatch.confidence >= MIN_CONFIDENCE) {
    return bestMatch
  }

  return null
}

export { knowledgeBaseData }
