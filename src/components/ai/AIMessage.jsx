const C = {
  primary: '#6366F1',
  surface: '#FFFFFF',
  text: '#0F172A',
  textSecondary: '#475569',
  border: '#E2E8F0'
}

function formatPrice(value) {
  return `$${Number(value).toFixed(2)}`
}

function formatTime(ts) {
  if (!ts) return ''
  const d = new Date(ts)
  return isNaN(d.getTime()) ? '' : d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function SparkleIcon({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 2l2.4 7.2h7.6l-6 4.8 2.4 7.2-6-4.8-6 4.8 2.4-7.2-6-4.8h7.6z" fill="currentColor" />
    </svg>
  )
}

export default function AIMessage({ message }) {
  if (!message) return null
  const isUser = message.sender === 'user'

  return (
    <div style={{ display: 'flex', justifyContent: isUser ? 'flex-end' : 'flex-start', marginBottom: 16, gap: 8 }}>
      {!isUser && (
        <div style={{
          width: 32,
          height: 32,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          marginTop: 4
        }}>
          <SparkleIcon size={14} />
        </div>
      )}
      <div style={{ maxWidth: '80%', display: 'flex', flexDirection: 'column' }}>
        <div
          className={isUser ? 'message-user' : 'message-ai'}
          style={{
            padding: '12px 16px',
            borderRadius: isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
            background: isUser ? 'linear-gradient(135deg, #6366F1, #4F46E5)' : C.surface,
            color: isUser ? '#fff' : C.text,
            border: isUser ? 'none' : `1px solid ${C.border}`,
            fontSize: 14,
            lineHeight: 1.6,
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            boxShadow: isUser ? '0 4px 12px rgba(99,102,241,0.25)' : '0 2px 8px rgba(0,0,0,0.03)'
          }}
        >
          {message.text}
        </div>

        {message.products && message.products.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 10 }}>
            {message.products.map((p) => (
              <a
                key={p.id}
                href={`/products?search=${encodeURIComponent(p.name)}`}
                onClick={(e) => e.preventDefault()}
                style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 10, border: `1px solid ${C.border}`, borderRadius: 12, background: C.surface, textDecoration: 'none', transition: 'box-shadow 0.2s ease' }}
                onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.05)' }}
                onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'none' }}
              >
                <img src={p.image} alt={p.name} style={{ width: 44, height: 44, borderRadius: 10, objectFit: 'cover', background: C.background }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: C.primary }}>{formatPrice(p.price)}</div>
                </div>
              </a>
            ))}
          </div>
        )}

        {message.timestamp && (
          <span style={{ fontSize: 11, color: C.textSecondary, marginTop: 5, alignSelf: isUser ? 'flex-end' : 'flex-start', opacity: 0.7 }}>
            {formatTime(message.timestamp)}
          </span>
        )}
      </div>
    </div>
  )
}
