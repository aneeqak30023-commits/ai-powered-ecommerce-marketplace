import { useEffect, useRef, useState } from 'react'
import { useAIAssistant } from '../../context/AIAssistantContext.jsx'
import AIMessage from './AIMessage.jsx'
import AIInput from './AIInput.jsx'

const C = {
  primary: '#6366F1',
  primaryDark: '#4F46E5',
  primaryLight: '#EEF2FF',
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

function SparkleIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 2l2.4 7.2h7.6l-6 4.8 2.4 7.2-6-4.8-6 4.8 2.4-7.2-6-4.8h7.6z" fill="currentColor" />
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
        @keyframes nx-pulse { 0% { box-shadow: 0 0 0 0 rgba(99,102,241,0.4); } 70% { box-shadow: 0 0 0 14px rgba(99,102,241,0); } 100% { box-shadow: 0 0 0 0 rgba(99,102,241,0); } }
        @keyframes nx-bounce { 0%, 80%, 100% { transform: translateY(0); } 40% { transform: translateY(-5px); } }
        @keyframes nx-chat-in { from { opacity: 0; transform: translateY(16px) scale(0.96); } to { opacity: 1; transform: translateY(0) scale(1); } }
        @keyframes nx-float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-3px); } }
        .nx-pulse-btn { animation: nx-pulse 2.5s infinite; }
        .nx-chat-window { animation: nx-chat-in .25s cubic-bezier(0.16, 1, 0.3, 1); }
        .nx-float { animation: nx-float 3s ease-in-out infinite; }
      `}</style>

      <div style={{ position: 'fixed', right: 24, bottom: 24, zIndex: 40, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 12 }}>
        {isOpen && (
          <div
            className="nx-chat-window"
            style={{
              width: 400,
              maxWidth: 'calc(100vw - 48px)',
              height: 520,
              maxHeight: 'calc(100vh - 120px)',
              background: C.surface,
              borderRadius: 24,
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.05)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', background: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)', color: '#fff' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span className="nx-float"><SparkleIcon size={18} /></span>
                <span style={{ fontSize: 15, fontWeight: 700 }}>Ask NexMart AI</span>
              </div>
              <div style={{ display: 'flex', gap: 4 }}>
                <button type="button" onClick={() => setIsOpen(false)} aria-label="Minimize chat" style={{ border: 'none', background: 'rgba(255,255,255,0.15)', color: '#fff', cursor: 'pointer', display: 'flex', padding: 6, borderRadius: 8 }}>
                  <MinimizeIcon />
                </button>
                <button type="button" onClick={() => setIsOpen(false)} aria-label="Close chat" style={{ border: 'none', background: 'rgba(255,255,255,0.15)', color: '#fff', cursor: 'pointer', display: 'flex', padding: 6, borderRadius: 8 }}>
                  <CloseIcon />
                </button>
              </div>
            </div>

            <div ref={bodyRef} style={{ flex: 1, overflowY: 'auto', padding: 16, background: '#FAFBFC' }}>
              {messages.length === 0 && (
                <div style={{ textAlign: 'center', padding: '40px 16px', color: C.textSecondary }}>
                  <div style={{ fontSize: 40, marginBottom: 12, opacity: 0.8 }}>🤖</div>
                  <p style={{ fontSize: 14, margin: 0, lineHeight: 1.6 }}>
                    Hi! Ask me to find products, compare prices, or get recommendations.
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginTop: 16 }}>
                    {['Headphones under $80', 'Smart watches', 'Best laptops', 'Compare books'].map((s) => (
                      <button key={s} type="button" onClick={() => handleSend(s)} style={{ padding: '6px 12px', borderRadius: 9999, border: '1px solid #E2E8F0', background: '#fff', fontSize: 12, color: C.textSecondary, cursor: 'pointer' }}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
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
            width: 64,
            height: 64,
            borderRadius: 9999,
            border: 'none',
            background: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)',
            color: '#fff',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)',
            transition: 'transform .15s ease, box-shadow .15s ease'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.05)' }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)' }}
        >
          {isOpen ? <CloseIcon /> : <ChatBubbleIcon />}
        </button>
      </div>
    </>
  )
}
