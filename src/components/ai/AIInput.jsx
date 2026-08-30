import { useState } from 'react'

const C = {
  primary: '#6366F1',
  primaryDark: '#4F46E5',
  surface: '#FFFFFF',
  text: '#0F172A',
  textSecondary: '#475569',
  border: '#E2E8F0'
}

function SendIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 12l16-8-6 16-3-7-7-1z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function AIInput({ onSend, disabled = false, isTyping = false }) {
  const [value, setValue] = useState('')

  const send = () => {
    const text = value.trim()
    if (!text || disabled) return
    if (onSend) onSend(text)
    setValue('')
  }

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: 12, borderTop: `1px solid ${C.border}` }}>
      <input
        type="text"
        value={value}
        disabled={disabled}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder={disabled ? 'Please wait...' : 'Type your message...'}
        style={{
          flex: 1,
          boxSizing: 'border-box',
          padding: '10px 16px',
          borderRadius: 9999,
          border: `1px solid ${C.border}`,
          background: C.surface,
          color: C.text,
          fontSize: 14,
          outline: 'none'
        }}
      />
      <button
        type="button"
        onClick={send}
        disabled={disabled || !value.trim()}
        aria-label="Send message"
        style={{
          width: 40,
          height: 40,
          flex: '0 0 auto',
          borderRadius: 9999,
          border: 'none',
          background: disabled || !value.trim() ? C.border : C.primary,
          color: '#fff',
          cursor: disabled || !value.trim() ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
        onMouseEnter={(e) => { if (!disabled && value.trim()) e.currentTarget.style.background = C.primaryDark }}
        onMouseLeave={(e) => { if (!disabled && value.trim()) e.currentTarget.style.background = C.primary }}
      >
        {isTyping ? (
          <span style={{ display: 'flex', gap: 3 }}>
            {[0, 1, 2].map((i) => (
              <span key={i} className="nx-dot" style={dotStyle} />
            ))}
          </span>
        ) : (
          <SendIcon />
        )}
      </button>
    </div>
  )
}

const dotStyle = {
  width: 5,
  height: 5,
  borderRadius: 9999,
  background: '#fff',
  display: 'inline-block',
  animation: 'nx-bounce 1s infinite ease-in-out'
}
