import knowledgeBaseData from '../data/knowledgeBase.json'

const MIN_CONFIDENCE = 0.3

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
    const questionWordMatches = words.filter(w => question.includes(w) && w.length > 3)

    const hasKeywordMatch = exactKeywordMatches.length > 0
    const hasQuestionMatch = questionWordMatches.length >= 2

    if (!hasKeywordMatch && !hasQuestionMatch) {
      continue
    }

    let score = 0
    if (hasKeywordMatch) {
      score = Math.max(score, exactKeywordMatches.length / keywords.length)
    }
    if (hasQuestionMatch) {
      score = Math.max(score, questionWordMatches.length / words.length * 0.7)
    }

    if (score > bestScore) {
      bestScore = score
      bestMatch = {
        ...item,
        confidence: score,
        matchedKeywords: exactKeywordMatches.length > 0 ? exactKeywordMatches : questionWordMatches
      }
    }
  }

  if (bestMatch && bestMatch.confidence >= MIN_CONFIDENCE) {
    return bestMatch
  }

  return null
}

export { knowledgeBaseData }
