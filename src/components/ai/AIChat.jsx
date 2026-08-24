import { useEffect, useRef, useState } from 'react'
import { useAIAssistant } from '../../context/AIAssistantContext.jsx'
import AIMessage from './AIMessage.jsx'
import AIInput from './AIInput.jsx'

const C = {
  primary: '#4F46E5',
  primaryDark: '#4338CA',
  surface: '#FFFFFF',
  text: '#0F172A',
  textSecondary: '#475569',
  border: '#E2E8F0'
}

function ChatBubbleIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M21 11.5a8.38 8.38 0 0 1-8.5 8.5 8.5 8.5 0 0 1-3.8-.9L3 21l1.9-5.7A8.5 8.5 0 1 1 21 11.5z" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function MinimizeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function AIChat() {
  const [isOpen, setIsOpen] = useState(false)
  const { messages = [], sendMessage, isTyping = false } = useAIAssistant()
  const bodyRef = useRef(null)

  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight
  }, [messages, isTyping, isOpen])

  const handleSend = (text) => sendMessage && sendMessage(text)

  return (
    <>
      <style>{`
        @keyframes nx-pulse { 0% { box-shadow: 0 0 0 0 rgba(79,70,229,0.5); } 70% { box-shadow: 0 0 0 18px rgba(79,70,229,0); } 100% { box-shadow: 0 0 0 0 rgba(79,70,229,0); } }
        @keyframes nx-bounce { 0%, 80%, 100% { transform: translateY(0); } 40% { transform: translateY(-5px); } }
        @keyframes nx-chat-in { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        .nx-pulse-btn { animation: nx-pulse 2s infinite; }
        .nx-chat-window { animation: nx-chat-in .2s ease-out; }
      `}</style>

      <div style={{ position: 'fixed', right: 20, bottom: 20, zIndex: 40, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 12 }}>
        {isOpen && (
          <div
            className="nx-chat-window"
            style={{
              width: 380,
              maxWidth: 'calc(100vw - 40px)',
              height: 500,
              maxHeight: 'calc(100vh - 100px)',
              background: C.surface,
              borderRadius: 24,
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.35)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', background: `linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)`, color: '#fff' }}>
              <span style={{ fontSize: 15, fontWeight: 700 }}>AI Shopping Assistant</span>
              <div style={{ display: 'flex', gap: 4 }}>
                <button type="button" onClick={() => setIsOpen(false)} aria-label="Minimize chat" style={{ border: 'none', background: 'transparent', color: '#fff', cursor: 'pointer', display: 'flex', padding: 4 }}>
                  <MinimizeIcon />
                </button>
                <button type="button" onClick={() => setIsOpen(false)} aria-label="Close chat" style={{ border: 'none', background: 'transparent', color: '#fff', cursor: 'pointer', display: 'flex', padding: 4 }}>
                  <CloseIcon />
                </button>
              </div>
            </div>

            <div ref={bodyRef} style={{ flex: 1, overflowY: 'auto', padding: 16, background: '#FBFCFE' }}>
              {messages.length === 0 && (
                <p style={{ fontSize: 13, color: C.textSecondary, textAlign: 'center', marginTop: 12 }}>
                  Hi! Ask me to find products, compare prices, or get recommendations.
                </p>
              )}
              {messages.map((m) => (
                <AIMessage key={m.id} message={m} />
              ))}
              {isTyping && (
                <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                  <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, borderTopLeftRadius: 4, padding: '12px 14px', display: 'flex', gap: 4 }}>
                    {[0, 1, 2].map((i) => (
                      <span key={i} style={{ width: 6, height: 6, borderRadius: 9999, background: C.textSecondary, display: 'inline-block', animation: 'nx-bounce 1s infinite ease-in-out' }} />
                    ))}
                  </div>
                </div>
              )}
            </div>

            <AIInput onSend={handleSend} disabled={false} isTyping={isTyping} />
          </div>
        )}

        <button
          type="button"
          onClick={() => setIsOpen((v) => !v)}
          aria-label={isOpen ? 'Close assistant' : 'Open assistant'}
          className={isOpen ? '' : 'nx-pulse-btn'}
          style={{
            width: 60,
            height: 60,
            borderRadius: 9999,
            border: 'none',
            background: C.primary,
            color: '#fff',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 10px 15px -3px rgba(0,0,0,0.25)',
            transition: 'background .15s ease'
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = C.primaryDark)}
          onMouseLeave={(e) => (e.currentTarget.style.background = C.primary)}
        >
          {isOpen ? <CloseIcon /> : <ChatBubbleIcon />}
        </button>
      </div>
    </>
  )
}
