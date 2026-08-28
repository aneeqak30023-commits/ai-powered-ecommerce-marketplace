import productsData from '../data/products.json'
import categoriesData from '../data/categories.json'
import { detectIntent } from './intentDetector.js'
import { searchKnowledgeBase } from './knowledgeBase.js'
import { searchProductsMultilingual } from './multilingualSearch.js'
import { handleComparisonRequest } from './productComparison.js'

function delay(ms = 600) {
  return new Promise(resolve => setTimeout(resolve, ms + Math.random() * 400))
}

export const aiService = {
  async processMessage(message, products = productsData, categories = categoriesData) {
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

    if (faqIntents.has(intentResult.intent)) {
      const kbMatch = searchKnowledgeBase(message)
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

    if (/^(hi|hello|hey|good morning|good evening|good afternoon|how are you|what'?s up|howdy|greetings)/i.test(text)) {
      return {
        text: "Hi there! I'm your AI shopping assistant at NexMart. I can help you find products, compare items, or answer questions about shopping. What are you looking for today?",
        intent: intentResult.intent,
        intentConfidence: intentResult.confidence,
        entities: intentResult.entities
      }
    }

    if (/^(find|search|looking for|do you have|show me|i need|i want|looking to buy|i'?m searching)/i.test(text)) {
      const results = searchProductsMultilingual(text, products, categories)
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

    if (/^(recommend|suggest|best|top|popular|what should i buy|what do you suggest|recommendation|advice)/i.test(text)) {
      const recommended = [...products]
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 4)
      return {
        text: "Based on customer ratings and popularity, here are some top picks from our catalog:",
        products: recommended,
        intent: intentResult.intent,
        intentConfidence: intentResult.confidence,
        entities: intentResult.entities
      }
    }

    if (/^(compare|difference|vs|versus|which is better|comparison)/i.test(text)) {
      const comparisonResult = handleComparisonRequest(message, products)
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

    for (const cat of categories) {
      if (text.includes(cat.id) || text.includes(cat.name.toLowerCase())) {
        const catProducts = products.filter(p => p.categoryId === cat.id).slice(0, 5)
        if (catProducts.length > 0) {
          return {
            text: `Here are our ${cat.name} products:`,
            products: catProducts,
            intent: intentResult.intent,
            intentConfidence: intentResult.confidence,
            entities: intentResult.entities
          }
        }
      }
    }

    if (/shipping|delivery|track|how long|arrive|dispatch/i.test(text)) {
      return { text: "We offer free standard shipping on orders over $50. Express delivery (2-3 business days) is available for $9.99. Standard delivery takes 5-7 business days. All orders include tracking information sent to your email.", intent: intentResult.intent, intentConfidence: intentResult.confidence, entities: intentResult.entities }
    }
    if (/return|refund|exchange|money back|warranty/i.test(text)) {
      return { text: "We have a 30-day hassle-free return policy. If you're not satisfied, simply ship the item back in its original condition for a full refund. Exchanges are also free. Contact support@nexmart.com to initiate a return.", intent: intentResult.intent, intentConfidence: intentResult.confidence, entities: intentResult.entities }
    }
    if (/payment|pay|card|method|checkout|secure/i.test(text)) {
      return { text: "We accept all major credit cards, debit cards, and digital wallets. For this demo, you can place orders using our demo payment option with no real charges. All transactions are secure and encrypted.", intent: intentResult.intent, intentConfidence: intentResult.confidence, entities: intentResult.entities }
    }
    if (/contact|support|help|human|phone|email|speak to/i.test(text)) {
      return { text: "You can reach our support team at support@nexmart.com or call +1 (555) 123-4567. Our team is available Monday-Friday, 9am-6pm EST. You can also use this chat for product help!", intent: intentResult.intent, intentConfidence: intentResult.confidence, entities: intentResult.entities }
    }
    if (/discount|coupon|promo|code|deal|sale/i.test(text)) {
      return { text: "We regularly have sales and promotions! Check the product pages for discount badges. Sign up for our newsletter to get exclusive promo codes and early access to deals.", intent: intentResult.intent, intentConfidence: intentResult.confidence, entities: intentResult.entities }
    }
    if (/stock|available|in stock|out of stock/i.test(text)) {
      return { text: "Stock availability is shown on each product page. Items marked 'In Stock' are ready to ship. If an item is out of stock, you can check back later or browse similar products in the same category.", intent: intentResult.intent, intentConfidence: intentResult.confidence, entities: intentResult.entities }
    }

    const searchResults = searchProductsMultilingual(text, products, categories)
    if (searchResults.length > 0) {
      return {
        text: `I found ${searchResults.length} product${searchResults.length > 1 ? 's' : ''} that might interest you:`,
        products: searchResults,
        intent: intentResult.intent,
        intentConfidence: intentResult.confidence,
        entities: intentResult.entities
      }
    }

    const categoryNames = categories.map(c => c.name).join(', ')
    return {
      text: `I'm not sure I understand. I can help you with:\n• Finding products (e.g., "find wireless headphones")\n• Recommendations (e.g., "recommend best laptops")\n• Comparing products (e.g., "compare iPhone vs Samsung")\n• Browsing categories: ${categoryNames}\n• Shopping questions (shipping, returns, payment)\n\nWhat would you like to know?`,
      intent: intentResult.intent,
      intentConfidence: intentResult.confidence,
      entities: intentResult.entities
    }
  }
}
