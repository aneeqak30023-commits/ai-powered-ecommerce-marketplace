import { detectIntent, INTENTS } from './intentDetector.js'
import { searchProductsMultilingual } from './multilingualSearch.js'
import { handleComparisonRequest } from './productComparison.js'
import { generateRecommendations } from './productRecommendations.js'

export { INTENTS }

function delay(ms = 600) {
  return new Promise(resolve => setTimeout(resolve, ms + Math.random() * 400))
}

function resolveConversationReferences(message, prevMessages) {
  if (!prevMessages || prevMessages.length === 0) return message

  const prevAssistantMsg = [...prevMessages].reverse().find(
    m => m.sender === 'assistant' && m.products && m.products.length > 0
  )

  if (!prevAssistantMsg || !prevAssistantMsg.products) return message

  const prevProducts = prevAssistantMsg.products
  const lowerMessage = message.toLowerCase().trim()

  if (/\b(another|something else|different|other|else|more|another one|another option)/i.test(lowerMessage)) {
    if (prevProducts.length > 0) {
      const firstProduct = prevProducts[0]
      const productName = firstProduct.name.toLowerCase()
      const typeMatch = productName.match(/(headphone|headphones|earbud|earbuds|laptop|notebook|watch|smartphone|phone|keyboard|speaker|camera|t-shirt|shirt|shoes|sneakers|book|cream|makeup|monitor|bag|backpack|mouse|charger|earbud)/i)
      if (typeMatch) {
        return typeMatch[0]
      }
    }
    return message
  }

  if (/\b(that one|it|this one|the cheaper|the better|the cheaper one|the better one|which is better|compare them|compare)\b/i.test(lowerMessage) && prevProducts.length > 0) {
    if (prevProducts.length >= 2) {
      return `compare ${prevProducts[0].name} and ${prevProducts[1].name}`
    }
    return prevProducts[0].name
  }

  if (/\b(this|it).*\b(black|red|blue|green|white|large|small|size|color|colour|sized?)/i.test(lowerMessage)) {
    if (prevProducts.length > 0) {
      const colorMatch = lowerMessage.match(/\b(black|red|blue|green|white|silver|gold|pink|purple)\b/i)
      const sizeMatch = lowerMessage.match(/\b(small|medium|large|xl|xs|s|m|l)\b/i)
      const attrs = [colorMatch?.[0], sizeMatch?.[0]].filter(Boolean).join(' ')
      return `${prevProducts[0].name} ${attrs}`.trim()
    }
  }

  return message
}

function searchKnowledgeBaseItems(items, query) {
  if (!items || !Array.isArray(items) || !query) return null

  const text = query.toLowerCase().trim()
  if (!text) return null

  const words = text
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(w => w.length > 2)

  if (words.length === 0) return null

  let bestMatch = null
  let bestScore = 0

  for (const item of items) {
    const keywords = item.keywords || []
    const question = (item.question || '').toLowerCase()

    const matchedKeywords = keywords.filter(k => {
      const normText = text.replace(/[^\w\s]/g, '').trim()
      const normKw = k.replace(/[^\w\s]/g, '').trim()
      if (normText.includes(normKw)) return true
      const textWords = normText.split(/\s+/)
      const kwWords = normKw.split(/\s+/)
      if (kwWords.length === 1) {
        return textWords.some(w => w === normKw)
      }
      return kwWords.every(kw => textWords.some(tw => tw === kw))
    })
    const questionWordMatches = words.filter(w => question.includes(w) && w.length > 3)

    const hasKeywordMatch = matchedKeywords.length > 0
    const hasQuestionMatch = questionWordMatches.length >= 2

    if (!hasKeywordMatch && !hasQuestionMatch) {
      continue
    }

    let score = 0
    if (hasKeywordMatch) {
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

  if (bestMatch && bestMatch.confidence >= 0.3) {
    return bestMatch
  }

  return null
}

export const aiService = {
  async processMessage(message, products = [], knowledgeBaseItems = [], prevMessages = []) {
    await delay()

    const intentResult = detectIntent(message)

    const faqIntents = new Set([
      'FAQ',
      'SHIPPING_INQUIRY',
      'PAYMENT_INQUIRY',
      'RETURN_REQUEST',
      'REFUND_REQUEST',
      'ORDER_CANCELLATION'
    ])

    if (faqIntents.has(intentResult.intent) && knowledgeBaseItems.length > 0) {
      const kbMatch = searchKnowledgeBaseItems(knowledgeBaseItems, message)
      if (kbMatch) {
        return {
          text: kbMatch.answer,
          intent: intentResult.intent,
          intentConfidence: intentResult.confidence,
          entities: intentResult.entities,
          source: 'knowledge-base',
          knowledgeBaseId: kbMatch.id
        }
      }
    }

    const text = message.toLowerCase().trim()
    const intent = intentResult.intent
    const confidence = intentResult.confidence
    const entities = intentResult.entities

    const resolvedMessage = resolveConversationReferences(text, prevMessages)
    const resolvedIntent = detectIntent(resolvedMessage)
    const resolvedText = resolvedMessage

    if (/^(hi|hello|hey|good morning|good evening|good afternoon|how are you|what'?s up|howdy|greetings|as-salamu alaykum|salam)/i.test(text)) {
      const lang = entities.language || 'english'
      const greetings = {
        english: "Hi there! I'm your AI shopping assistant at NexMart. I can help you find products, compare items, or answer questions about shopping. What are you looking for today?",
        urdu: "ہیلو! میں NexMart کا آئی آئی شاپنگ اسسٹینٹ ہوں۔ میں آپ کی مدد کر سکتا ہوں مواقعات تلاش کرنا، موقعات کی تقابل کرنا، یا خریداری کے بارے میں سوالات کے جواب دینا۔ آج آپ کیا ڈھونڈ رہے ہیں؟",
        'roman-urdu': "Hi! Mein NexMart ka AI shopping assistant hoon. Mein aapki madad kar sakta hoon products dhundnay, compare karne, ya shopping ke baare mein sawal pattne mein. Aaj aap kya dhund rahe hain?"
      }
      return {
        text: greetings[lang] || greetings.english,
        intent: intentResult.intent,
        intentConfidence: intentResult.confidence,
        entities: intentResult.entities
      }
    }

    if (/^(no\b|no thanks|never mind|nope|nothing|not now|maybe later|not interested)/i.test(text)) {
      const lang = entities.language || 'english'
      const responses = {
        english: "Okay! Let me know if you need help finding anything else.",
        urdu: "ٹھیک ہے! اگر آپ کو کسی اور چیز تلاش کرنے میں مدد درکار ہو تو بتائیں۔",
        'roman-urdu': "Theek hai! Agar aapko kuch aur dhoopna ho to batae."
      }
      return {
        text: responses[lang] || responses.english,
        intent: intentResult.intent,
        intentConfidence: intentResult.confidence,
        entities: intentResult.entities
      }
    }

    if (intent === INTENTS.PRODUCT_SEARCH) {
      const results = searchProductsMultilingual(text, products, [])
      if (results.length > 0) {
        return {
          text: `I found ${results.length} product${results.length > 1 ? 's' : ''} that match your search:`,
          products: results,
          intent: intentResult.intent,
          intentConfidence: intentResult.confidence,
          entities: intentResult.entities
        }
      }
      return {
        text: "I couldn't find any products matching that. Try different keywords like 'wireless headphones', 'running shoes', or 'coffee maker', or ask me to recommend products!",
        intent: intentResult.intent,
        intentConfidence: intentResult.confidence,
        entities: intentResult.entities
      }
    }

    if (intent === INTENTS.PRODUCT_RECOMMENDATION ||
        (intent === INTENTS.GENERAL_INQUIRY && /^(what should i|which|should i get|looking for|need|want|want to buy|any suggestions|what|what's good|what are good|what are some good|what are the best)/i.test(text))) {
      const recommendationResult = generateRecommendations(message, products)
      return {
        text: recommendationResult.text,
        products: recommendationResult.products,
        intent: intentResult.intent,
        intentConfidence: intentResult.confidence,
        entities: intentResult.entities,
        recommendations: recommendationResult.recommendations
      }
    }

    if (intent === INTENTS.PRODUCT_COMPARISON ||
        (intent === INTENTS.GENERAL_INQUIRY && /^(which is better|compare|which one|better between|should i get|worth it|worth buying|better deal)/i.test(text))) {
      const comparisonResult = handleComparisonRequest(resolvedText, products)
      if (comparisonResult.comparison) {
        return {
          text: comparisonResult.text,
          products: comparisonResult.products,
          intent: intentResult.intent,
          intentConfidence: intentResult.confidence,
          entities: intentResult.entities,
          comparison: comparisonResult.comparison
        }
      }
      return {
        text: comparisonResult.text,
        intent: intentResult.intent,
        intentConfidence: intentResult.confidence,
        entities: intentResult.entities
      }
    }

    if (intent === INTENTS.PRODUCT_INFORMATION ||
        (intent === INTENTS.GENERAL_INQUIRY && /^(tell me about|what|describe|more info|details|specs|information about)/i.test(text))) {
      const infoResults = searchProductsMultilingual(text, products, [])
      if (infoResults.length > 0) {
        const p = infoResults[0]
        const lines = [`**${p.name}**`, '', `Price: $${p.price.toFixed(2)}`, `Rating: ${p.rating}★ (${p.reviewCount || 0} reviews)`]
        if (p.categoryName) lines.push(`Category: ${p.categoryName}`)
        if (p.description) lines.push(`\n${p.description.slice(0, 200)}...`)
        if (p.specifications) {
          lines.push('\n**Specifications:**')
          for (const [key, value] of Object.entries(p.specifications).slice(0, 6)) {
            lines.push(`• ${key}: ${value}`)
          }
        }
        if (p.tags && p.tags.length > 0) lines.push(`\nTags: ${p.tags.join(', ')}`)
        return {
          text: lines.join('\n'),
          products: infoResults.slice(0, 3),
          intent: intentResult.intent,
          intentConfidence: intentResult.confidence,
          entities: intentResult.entities
        }
      }
      if (/^(tell me about a product|what can you tell me|tell me about something)/i.test(text)) {
        return {
          text: "I'd be happy to tell you about any product! Could you please specify which product you're interested in? For example, 'Tell me about the Smart Watch Pro' or 'What headphones do you have?'",
          intent: intentResult.intent,
          intentConfidence: intentResult.confidence,
          entities: intentResult.entities
        }
      }
    }

    if (intent === INTENTS.ORDER_STATUS) {
      const orderId = entities.orderId
      if (orderId) {
        return {
          text: `I can help track your order #${orderId}. We don't have real-time order tracking in this demo, but you can check your order status in the Orders section of your account. Is there anything else I can help you with?`,
          intent: intentResult.intent,
          intentConfidence: intentResult.confidence,
          entities: intentResult.entities
        }
      }
      return {
        text: "I can help you track your order! Please provide your order number (e.g., 'Where is my order #12345?'). You can also check your order status in the Orders section of your account.",
        intent: intentResult.intent,
        intentConfidence: intentResult.confidence,
        entities: intentResult.entities
      }
    }

    if (intent === INTENTS.COMPLAINT) {
      const complaintResults = searchProductsMultilingual(text, products, [])
      const product = complaintResults.length > 0 ? complaintResults[0] : null
      return {
        text: "I'm sorry to hear about the issue. I can create a support ticket for you so our team can help resolve this right away. Would you like me to do that?",
        intent: intentResult.intent,
        intentConfidence: intentResult.confidence,
        entities: intentResult.entities,
        products: complaintResults.slice(0, 3),
        action: 'create_support_ticket',
        actionData: {
          category: 'complaint',
          subject: product ? `Complaint about ${product.name}` : 'Customer complaint',
          message: text,
          productId: product?.id,
        }
      }
    }

    if (intent === INTENTS.HUMAN_SUPPORT) {
      return {
        text: "I can help you create a support ticket so our team can assist you. Would you like me to create one?",
        intent: intentResult.intent,
        intentConfidence: intentResult.confidence,
        entities: intentResult.entities,
        action: 'create_support_ticket',
        actionData: {
          category: 'other',
          subject: 'Request for human support',
          message: text,
        }
      }
    }

    if (/shipping|delivery|track|how long|arrive|dispatch|when.*come|when.*get/i.test(text)) {
      return { text: "We offer free standard shipping on orders over $50. Express delivery (2-3 business days) is available for $9.99. Standard delivery takes 5-7 business days. All orders include tracking information sent to your email.", intent: intentResult.intent, intentConfidence: intentResult.confidence, entities: intentResult.entities }
    }
    if (/return|refund|exchange|money back|warranty|send back|wrong item|damaged|defective/i.test(text)) {
      return { text: "We have a 30-day hassle-free return policy. If you're not satisfied, simply ship the item back in its original condition for a full refund. Exchanges are also free. Contact support@nexmart.com to initiate a return.", intent: intentResult.intent, intentConfidence: intentResult.confidence, entities: intentResult.entities }
    }
    if (/payment|pay|card|method|checkout|secure|credit|debit|wallet|paypal|transaction/i.test(text)) {
      return { text: "We accept all major credit cards, debit cards, and digital wallets. For this demo, you can place orders using our demo payment option with no real charges. All transactions are secure and encrypted.", intent: intentResult.intent, intentConfidence: intentResult.confidence, entities: intentResult.entities }
    }
    if (/contact|support|help|human|phone|email|speak to|call.*support/i.test(text)) {
      return { text: "You can reach our support team at support@nexmart.com or call +1 (555) 123-4567. Our team is available Monday-Friday, 9am-6pm EST. You can also use this chat for product help!", intent: intentResult.intent, intentConfidence: intentResult.confidence, entities: intentResult.entities }
    }
    if (/discount|coupon|promo|code|deal|sale|offer|promotion|special offer/i.test(text)) {
      return { text: "We regularly have sales and promotions! Check the product pages for discount badges showing current deals. Sign up for our newsletter to get exclusive promo codes and early access to deals.", intent: intentResult.intent, intentConfidence: intentResult.confidence, entities: intentResult.entities }
    }
    if (/stock|available|in stock|out of stock|have any|do you sell|do you carry/i.test(text)) {
      return { text: "Stock availability is shown on each product page. Items marked 'In Stock' are ready to ship. You can also check specific product pages or browse our catalog by category.", intent: intentResult.intent, intentConfidence: intentResult.confidence, entities: intentResult.entities }
    }

    const searchResults = searchProductsMultilingual(text, products, [])
    if (searchResults.length > 0 && searchResults.length < products.length) {
      return {
        text: `I found ${searchResults.length} product${searchResults.length > 1 ? 's' : ''} that might interest you:`,
        products: searchResults,
        intent: intentResult.intent,
        intentConfidence: intentResult.confidence,
        entities: intentResult.entities
      }
    }

    return {
      text: `I'm not sure I understand. I can help you with:\n• Finding products (e.g., "find wireless headphones")\n• Recommendations (e.g., "recommend best laptops")\n• Comparing products (e.g., "compare iPhone vs Samsung")\n• Shopping questions (shipping, returns, payment)\n\nWhat would you like to know?`,
      intent: intentResult.intent,
      intentConfidence: intentResult.confidence,
      entities: intentResult.entities
    }
  }
}
