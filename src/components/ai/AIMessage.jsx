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

export default function AIMessage({ message }) {
  if (!message) return null
  const isUser = message.sender === 'user'

  return (
    <div style={{ display: 'flex', justifyContent: isUser ? 'flex-end' : 'flex-start', marginBottom: 12 }}>
      <div style={{ maxWidth: '80%', display: 'flex', flexDirection: 'column' }}>
        <div
          style={{
            padding: '10px 14px',
            borderRadius: 16,
            borderTopRightRadius: isUser ? 4 : 16,
            borderTopLeftRadius: isUser ? 16 : 4,
            background: isUser ? C.primary : C.surface,
            color: isUser ? '#fff' : C.text,
            border: isUser ? 'none' : `1px solid ${C.border}`,
            fontSize: 14,
            lineHeight: 1.5,
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word'
          }}
        >
          {message.text}
        </div>

        {message.products && message.products.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
            {message.products.map((p) => (
              <a
                key={p.id}
                href={`/products?search=${encodeURIComponent(p.name)}`}
                onClick={(e) => e.preventDefault()}
                style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 8, border: `1px solid ${C.border}`, borderRadius: 10, background: C.surface, textDecoration: 'none' }}
              >
                <img src={p.image} alt={p.name} style={{ width: 40, height: 40, borderRadius: 6, objectFit: 'cover' }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: C.primary }}>{formatPrice(p.price)}</div>
                </div>
              </a>
            ))}
          </div>
        )}

        {message.timestamp && (
          <span style={{ fontSize: 11, color: C.textSecondary, marginTop: 4, alignSelf: isUser ? 'flex-end' : 'flex-start' }}>
            {formatTime(message.timestamp)}
          </span>
        )}
      </div>
    </div>
  )
}
