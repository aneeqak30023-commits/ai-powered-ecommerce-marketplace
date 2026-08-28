import { searchProductsMultilingual, normalizeToEnglish } from './multilingualSearch.js'

const PRIORITY_KEYWORDS = {
  price: ['price', 'cost', 'cheap', 'expensive', 'budget', 'affordable', 'قیمت', 'سستا', 'مہنگا'],
  rating: ['rating', 'rated', 'stars', 'score', 'best', 'top', 'popular', 'ریٹنگ', 'ستارہ'],
  battery: ['battery', 'battery life', '续航', 'پاور', 'چارج'],
  features: ['features', 'specs', 'specifications', 'functions', 'فیچرز', 'خصوصیات'],
  value: ['value', 'worth', '性价比', 'قیمت کا']
}

function detectPriority(text) {
  const normalized = normalizeToEnglish(text).toLowerCase()
  const detected = []
  for (const [priority, keywords] of Object.entries(PRIORITY_KEYWORDS)) {
    for (const keyword of keywords) {
      if (normalized.includes(keyword.toLowerCase())) {
        detected.push(priority)
        break
      }
    }
  }
  return detected.length > 0 ? detected : ['rating', 'price']
}

function extractProductNamesFromMessage(text) {
  const normalized = normalizeToEnglish(text)
  const lower = normalized.toLowerCase()
  
  // Remove comparison keywords
  const cleaned = lower
    .replace(/compare|comparison|vs|versus|difference between|which is better|better than|pros and cons|compare the|compare a|compare an/gi, ' ')
    .replace(/\b(i want|show me|find|search|looking for|do you have|i need|looking to buy|i'm searching|where can i find|looking for a|looking for an|the|a|an|some|me|to|and|or|with|under|over|above|below|less than|more than|between|from)\b/gi, ' ')
  
  const words = cleaned.split(/[\s,]+/).filter(w => w.length > 2)
  return [...new Set(words)]
}

export function identifyComparisonProducts(message, products) {
  if (!message || !products || products.length === 0) {
    return []
  }

  const lower = message.toLowerCase()
  
  // Exact product-name matching first
  const exactMatches = products.filter(p => lower.includes(p.name.toLowerCase()))
  if (exactMatches.length >= 2) {
    return exactMatches.slice(0, 2)
  }
  
  // If only one exact match, pair it with the best multilingual candidate
  const candidates = searchProductsMultilingual(message, products, [])
  if (exactMatches.length === 1 && candidates.length >= 1) {
    const remaining = candidates.filter(p => p.id !== exactMatches[0].id)
    if (remaining.length > 0) {
      return [exactMatches[0], remaining[0]]
    }
  }

  if (candidates.length >= 2) {
    return candidates.slice(0, 2)
  }

  const nameWords = extractProductNamesFromMessage(message)
  const matched = []
  
  for (const word of nameWords) {
    for (const product of products) {
      if (matched.includes(product)) continue
      const searchText = `${product.name} ${product.description || ''} ${(product.tags || []).join(' ')}`.toLowerCase()
      if (searchText.includes(word)) {
        matched.push(product)
        if (matched.length >= 2) break
      }
    }
    if (matched.length >= 2) break
  }

  return matched.slice(0, 2)
}

export function classifyProduct(product) {
  const name = (product.name || '').toLowerCase()
  const category = product.categoryId || product.categoryName || 'unknown'
  
  let productType = 'general'
  const typeHints = [
    ['watch', ['watch', 'wearable', 'smartwatch', 'band']],
    ['phone', ['smartphone', 'mobile']],
    ['laptop', ['laptop', 'notebook', 'macbook']],
    ['headphones', ['headphones', 'earphones']],
    ['earbuds', ['earbuds', 'airpods', 'tws']],
    ['keyboard', ['keyboard', 'keypad']],
    ['speaker', ['speaker', 'sound']],
    ['camera', ['camera', 'webcam']],
    ['power bank', ['power bank', 'powerbank', 'battery pack']],
    ['t-shirt', ['t-shirt', 'tshirt', 'tee']],
    ['shirt', ['shirt', 'top', 'blouse']],
    ['shoes', ['shoes', 'shoe', 'sneaker', 'boot']],
    ['book', ['book', 'novel', 'guide']],
    ['cream', ['cream', 'serum', 'moisturizer']],
    ['makeup', ['makeup', 'palette', 'lipstick', 'eyeshadow']]
  ]

  for (const [type, hints] of typeHints) {
    if (hints.some(hint => name.includes(hint))) {
      productType = type
      break
    }
  }

  return { category, productType }
}

export function getComparisonAttributes(productA, productB) {
  const attrs = {
    common: [],
    uniqueA: [],
    uniqueB: []
  }

  const specsA = productA.specifications || {}
  const specsB = productB.specifications || {}
  const allSpecKeys = new Set([...Object.keys(specsA), ...Object.keys(specsB)])

  for (const key of allSpecKeys) {
    const valA = specsA[key]
    const valB = specsB[key]
    if (valA && valB) {
      attrs.common.push({ key, valueA: valA, valueB: valB })
    } else if (valA) {
      attrs.uniqueA.push({ key, value: valA })
    } else if (valB) {
      attrs.uniqueB.push({ key, value: valB })
    }
  }

  return attrs
}

function getNumericValue(str) {
  if (!str) return null
  const match = String(str).match(/(\d+(?:\.\d+)?)/)
  return match ? parseFloat(match[1]) : null
}

function compareByPriority(productA, productB, priorities) {
  const aScore = { wins: 0, details: [] }
  const bScore = { wins: 0, details: [] }

  for (const priority of priorities) {
    switch (priority) {
      case 'price': {
        const diff = productA.price - productB.price
        if (diff < 0) {
          aScore.wins++
          aScore.details.push(`${productA.name} is $${Math.abs(diff).toFixed(2)} cheaper`)
        } else if (diff > 0) {
          bScore.wins++
          bScore.details.push(`${productB.name} is $${Math.abs(diff).toFixed(2)} cheaper`)
        } else {
          aScore.details.push('Both are the same price')
          bScore.details.push('Both are the same price')
        }
        break
      }
      case 'rating': {
        const diff = productA.rating - productB.rating
        if (diff > 0) {
          aScore.wins++
          aScore.details.push(`${productA.name} has a higher rating (${productA.rating}★ vs ${productB.rating}★)`)
        } else if (diff < 0) {
          bScore.wins++
          bScore.details.push(`${productB.name} has a higher rating (${productB.rating}★ vs ${productA.rating}★)`)
        } else {
          aScore.details.push('Both have the same rating')
          bScore.details.push('Both have the same rating')
        }
        break
      }
      case 'battery': {
        const battA = productA.specifications?.['Battery'] || productA.specifications?.['Battery Life'] || ''
        const battB = productB.specifications?.['Battery'] || productB.specifications?.['Battery Life'] || ''
        if (battA && battB) {
          const numA = getNumericValue(battA)
          const numB = getNumericValue(battB)
          if (numA && numB) {
            if (numA > numB) {
              aScore.wins++
              aScore.details.push(`${productA.name} has longer battery life (${battA})`)
            } else if (numB > numA) {
              bScore.wins++
              bScore.details.push(`${productB.name} has longer battery life (${battB})`)
            }
          } else {
            aScore.details.push(`${productA.name} battery: ${battA}`)
            bScore.details.push(`${productB.name} battery: ${battB}`)
          }
        } else if (battA) {
          aScore.details.push(`${productA.name} battery: ${battA}`)
        } else if (battB) {
          bScore.details.push(`${productB.name} battery: ${battB}`)
        }
        break
      }
      case 'features': {
        const tagsA = (productA.tags || []).length + Object.keys(productA.specifications || {}).length
        const tagsB = (productB.tags || []).length + Object.keys(productB.specifications || {}).length
        if (tagsA > tagsB) {
          aScore.wins++
          aScore.details.push(`${productA.name} has more listed features`)
        } else if (tagsB > tagsA) {
          bScore.wins++
          bScore.details.push(`${productB.name} has more listed features`)
        } else {
          aScore.details.push('Both have similar feature counts')
        }
        break
      }
      case 'value': {
        const valA = productA.rating / productA.price
        const valB = productB.rating / productB.price
        if (valA > valB) {
          aScore.wins++
          aScore.details.push(`${productA.name} offers better value (${productA.rating}★ / $${productA.price})`)
        } else if (valB > valA) {
          bScore.wins++
          bScore.details.push(`${productB.name} offers better value (${productB.rating}★ / $${productB.price})`)
        } else {
          aScore.details.push('Both offer similar value')
        }
        break
      }
    }
  }

  return { aScore, bScore }
}

export function generateComparison(productA, productB, priority = ['rating', 'price']) {
  if (!productA || !productB) {
    return {
      text: "I need 2 products to compare. Please mention the two products you'd like to compare.",
      products: productA && productB ? [productA, productB] : [],
      comparison: null
    }
  }

  const classA = classifyProduct(productA)
  const classB = classifyProduct(productB)
  const attrs = getComparisonAttributes(productA, productB)
  const { aScore, bScore } = compareByPriority(productA, productB, priority)

  const lines = []
  lines.push(`Here is a comparison between ${productA.name} and ${productB.name}:\n`)

  // Basic info
  lines.push(`**${productA.name}** (${classA.category})`)
  lines.push(`Price: $${productA.price.toFixed(2)} | Rating: ${productA.rating}★ (${productA.reviewCount} reviews)`)
  lines.push('')

  lines.push(`**${productB.name}** (${classB.category})`)
  lines.push(`Price: $${productB.price.toFixed(2)} | Rating: ${productB.rating}★ (${productB.reviewCount} reviews)`)
  lines.push('')

  // Common specifications
  if (attrs.common.length > 0) {
    lines.push('**Common Specifications:**')
    for (const attr of attrs.common) {
      lines.push(`• ${attr.key}: ${productA.name} = ${attr.valueA}, ${productB.name} = ${attr.valueB}`)
    }
    lines.push('')
  }

  // Unique attributes
  if (attrs.uniqueA.length > 0) {
    lines.push(`**Features only in ${productA.name}:**`)
    for (const attr of attrs.uniqueA) {
      lines.push(`• ${attr.key}: ${attr.value}`)
    }
    lines.push('')
  }

  if (attrs.uniqueB.length > 0) {
    lines.push(`**Features only in ${productB.name}:**`)
    for (const attr of attrs.uniqueB) {
      lines.push(`• ${attr.key}: ${attr.value}`)
    }
    lines.push('')
  }

  // Priority-based verdict
  lines.push('**Summary based on your priorities:**')
  if (aScore.wins > bScore.wins) {
    lines.push(`For your priorities, ${productA.name} has more strengths. ${aScore.details.filter(Boolean).join('. ')}.`)
  } else if (bScore.wins > aScore.wins) {
    lines.push(`For your priorities, ${productB.name} has more strengths. ${bScore.details.filter(Boolean).join('. ')}.`)
  } else {
    lines.push('Both products have different strengths. It depends on what matters most to you.')
    if (aScore.details.filter(Boolean).length > 0) {
      lines.push(aScore.details.filter(Boolean).join('. ') + '.')
    }
  }

  return {
    text: lines.join('\n'),
    products: [productA, productB],
    comparison: {
      productA: { ...productA, classification: classA },
      productB: { ...productB, classification: classB },
      attributes: attrs,
      priority,
      verdict: aScore.wins >= bScore.wins ? 'A' : 'B'
    }
  }
}

export function handleComparisonRequest(message, products) {
  if (!message || !products || products.length === 0) {
    return {
      text: "I need at least 2 products to compare. Could you mention specific products or categories? For example: 'compare wireless headphones'",
      products: [],
      comparison: null
    }
  }

  const matches = identifyComparisonProducts(message, products)
  if (matches.length < 2) {
    return {
      text: "I need at least 2 products to compare. Could you mention specific products or categories? For example: 'compare wireless headphones'",
      products: matches,
      comparison: null
    }
  }

  const priority = detectPriority(message)
  return generateComparison(matches[0], matches[1], priority)
}
