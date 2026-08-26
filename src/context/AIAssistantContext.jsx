import { useState, useCallback, useEffect, createContext, useContext } from 'react'

const STORAGE_KEY = 'nexmart-ai-chat'

function loadMessages() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveMessages(messages) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(messages))
}

function reduceProducts(products) {
  return (products || [])
    .slice(0, 20)
    .map((p) => ({
      id: p.id,
      name: p.name,
      price: p.price,
      categoryId: p.categoryId,
      categoryName: p.categoryName,
      rating: p.rating,
      tags: p.tags
    }))
}

const AIAssistantContext = createContext(null)

export function AIAssistantProvider({ children }) {
  const [messages, setMessages] = useState(() => loadMessages())
  const [isTyping, setIsTyping] = useState(false)

  useEffect(() => {
    saveMessages(messages)
  }, [messages])

  const sendMessage = useCallback(async (text) => {
    if (!text || !text.trim()) return

    const userMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: text.trim(),
      timestamp: Date.now()
    }

    setMessages(prev => [...prev, userMessage])
    setIsTyping(true)

    try {
      let result
      const apiBase = import.meta.env.DEV
        ? '/api/chat'
        : 'https://ai-powered-ecommerce-marketplace.vercel.app/api/chat'

      try {
        const response = await fetch(apiBase, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: text.trim(),
            products: reduceProducts(await import('../data/products.json').then(m => m.default || m)),
            categories: await import('../data/categories.json').then(m => m.default || m)
          })
        })

        if (response.ok) {
          const data = await response.json()
          result = { text: data.text, products: data.products || [] }
        } else {
          throw new Error('API not available')
        }
      } catch {
        const { processMessage } = await import('../services/aiService.js')
        const { products } = await import('../data/products.json')
        result = await processMessage(text, products)
      }

      const assistantMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: result.text,
        timestamp: Date.now(),
        products: result.products || []
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: "I'm sorry, I'm having trouble right now. Please try again in a moment.",
        timestamp: Date.now()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsTyping(false)
    }
  }, [])

  const clearHistory = useCallback(() => {
    setMessages([])
  }, [])

  return (
    <AIAssistantContext.Provider value={{ messages, sendMessage, clearHistory, isTyping }}>
      {children}
    </AIAssistantContext.Provider>
  )
}

export function useAIAssistant() {
  const context = useContext(AIAssistantContext)
  if (!context) throw new Error('useAIAssistant must be used within an AIAssistantProvider')
  return context
}
