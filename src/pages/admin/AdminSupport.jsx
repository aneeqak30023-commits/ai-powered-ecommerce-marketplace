import { useState, useEffect } from 'react'
import { getAdminSupportTickets, updateAdminSupportTicket } from '../../services/adminApi.js'

const C = {
  primary: '#6366F1',
  primaryDark: '#4F46E5',
  surface: '#FFFFFF',
  background: '#F8FAFC',
  text: '#0F172A',
  textSecondary: '#475569',
  border: '#E2E8F0',
  success: '#16A34A',
  danger: '#DC2626',
  warning: '#D97706',
}

const STATUS_OPTIONS = ['open', 'in_progress', 'resolved', 'closed']
const PRIORITY_OPTIONS = ['low', 'medium', 'high', 'urgent']

export default function AdminSupport() {
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [statusFilter, setStatusFilter] = useState('')
  const [updating, setUpdating] = useState(null)

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getAdminSupportTickets({ status: statusFilter })
      setTickets(data.tickets || [])
    } catch (err) {
      setError(err.message || 'Failed to load support tickets')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [statusFilter])

  const handleUpdate = async (ticketId, updates) => {
    setUpdating(ticketId)
    try {
      await updateAdminSupportTicket(ticketId, updates)
      load()
    } catch (err) {
      setError(err.message || 'Failed to update ticket')
    } finally {
      setUpdating(null)
    }
  }

  if (loading) {
    return <div style={{ padding: 40, textAlign: 'center', color: C.textSecondary }}>Loading support tickets...</div>
  }

  return (
    <div>
      <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ padding: '10px 14px', border: `1px solid ${C.border}`, borderRadius: 10, fontSize: 14, background: C.surface, color: C.text, outline: 'none', minWidth: 150 }}>
          <option value="">All Statuses</option>
          {STATUS_OPTIONS.map(status => (
            <option key={status} value={status}>{status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</option>
          ))}
        </select>
      </div>

      {error && (
        <div style={{ background: `${C.danger}10`, border: `1px solid ${C.danger}30`, borderRadius: 12, padding: 16, color: C.danger, fontSize: 14, marginBottom: 20 }}>
          {error}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {tickets.map(ticket => (
          <div key={ticket.id} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: 20, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: C.text, margin: '0 0 6px' }}>{ticket.subject}</h3>
                <p style={{ fontSize: 13, color: C.textSecondary, margin: 0 }}>From: {ticket.userName} ({ticket.userEmail})</p>
                <p style={{ fontSize: 13, color: C.textSecondary, margin: '4px 0 0' }}>Category: {ticket.category} | Created: {new Date(ticket.createdAt).toLocaleString()}</p>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <select
                  value={ticket.status}
                  onChange={(e) => handleUpdate(ticket.id, { status: e.target.value })}
                  disabled={updating === ticket.id}
                  style={{ padding: '6px 10px', border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 13, background: C.surface, color: C.text, outline: 'none', cursor: 'pointer' }}
                >
                  {STATUS_OPTIONS.map(status => (
                    <option key={status} value={status}>{status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</option>
                  ))}
                </select>
                <select
                  value={ticket.priority}
                  onChange={(e) => handleUpdate(ticket.id, { priority: e.target.value })}
                  disabled={updating === ticket.id}
                  style={{ padding: '6px 10px', border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 13, background: C.surface, color: C.text, outline: 'none', cursor: 'pointer' }}
                >
                  {PRIORITY_OPTIONS.map(priority => (
                    <option key={priority} value={priority}>{priority.charAt(0).toUpperCase() + priority.slice(1)}</option>
                  ))}
                </select>
              </div>
            </div>
            <p style={{ fontSize: 14, color: C.text, margin: '0 0 12px', lineHeight: 1.6 }}>{ticket.message}</p>
            {ticket.messages && ticket.messages.length > 0 && (
              <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 12 }}>
                <p style={{ fontSize: 12, fontWeight: 600, color: C.textSecondary, margin: '0 0 8px', textTransform: 'uppercase' }}>Messages ({ticket.messages.length})</p>
                {ticket.messages.map(msg => (
                  <div key={msg.id} style={{ padding: '8px 0', borderBottom: `1px solid ${C.border}`, fontSize: 13 }}>
                    <span style={{ fontWeight: 600, color: C.text }}>{msg.sender}: </span>
                    <span style={{ color: C.textSecondary }}>{msg.message}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
        {tickets.length === 0 && (
          <div style={{ padding: 40, textAlign: 'center', color: C.textSecondary, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16 }}>
            No support tickets found.
          </div>
        )}
      </div>
    </div>
  )
}
