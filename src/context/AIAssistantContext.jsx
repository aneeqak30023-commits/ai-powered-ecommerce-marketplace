import { useState, useCallback, useEffect, useRef, createContext, useContext } from 'react'
import { fetchProducts } from '../services/productApi.js'
import { getKnowledgeBaseItems } from '../services/knowledgeBaseApi.js'
import { createSupportTicket } from '../services/supportApi.js'

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
  const messagesRef = useRef(messages)

  useEffect(() => {
    messagesRef.current = messages
  }, [messages])

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

      const { aiService } = await import('../services/aiService.js')
      const products = await fetchProducts()
      let knowledgeBaseItems = []
      try {
        knowledgeBaseItems = await getKnowledgeBaseItems()
      } catch {
        // knowledge base may not be available
      }
      result = await aiService.processMessage(text, products, knowledgeBaseItems, messagesRef.current)

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
        comparison: result.comparison || null,
        ticketCreated: result.ticketCreated || null,
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

  const createTicketFromConversation = useCallback(async (ticketData) => {
    try {
      const ticket = await createSupportTicket(ticketData)
      return ticket
    } catch (error) {
      console.error('Failed to create support ticket:', error)
      return null
    }
  }, [])

  const clearHistory = useCallback(() => {
    setMessages([])
  }, [])

  return (
    <AIAssistantContext.Provider value={{ messages, sendMessage, clearHistory, isTyping, createTicketFromConversation }}>
      {children}
    </AIAssistantContext.Provider>
  )
}

export function useAIAssistant() {
  const context = useContext(AIAssistantContext)
  if (!context) throw new Error('useAIAssistant must be used within an AIAssistantProvider')
  return context
}
