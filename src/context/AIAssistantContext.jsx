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

      // Use the local aiService directly (not a remote API) so the deployed
      // site uses exactly the same tested retrieval logic as the test suite.
      // A remote API can drift out of sync with the local code and return
      // stale or incorrect product results.
      const { aiService } = await import('../services/aiService.js')
      const products = (await import('../data/products.json')).default
      result = await aiService.processMessage(text, products)

      const assistantMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: result.text,
        timestamp: Date.now(),
        products: result.products || [],
        intent: result.intent || null,
        intentConfidence: result.intentConfidence || null,
        entities: result.entities || null,
        recommendations: result.recommendations || null,
        comparison: result.comparison || null
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      const assistantMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: "I'm sorry, I'm having trouble connecting to my services right now. Please try again in a moment, or rephrase your question.",
        timestamp: Date.now(),
        error: error?.message || 'Unknown error'
      }
      setMessages(prev => [...prev, assistantMessage])
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
