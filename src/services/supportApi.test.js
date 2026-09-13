import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getSupportTickets, getSupportTicket, createSupportTicket, addSupportTicketMessage } from '../services/supportApi.js'

const mockTicket = {
  id: 'ticket-1',
  userId: 'user-1',
  subject: 'Test ticket',
  message: 'Test message',
  category: 'other',
  status: 'open',
  priority: 'medium',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  messages: [],
}

describe('supportApi', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('getSupportTickets fetches tickets from backend', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ tickets: [mockTicket], pagination: { page: 1, limit: 20, total: 1, pages: 1 } }),
      })
    )

    const result = await getSupportTickets()
    expect(result.tickets).toHaveLength(1)
    expect(result.tickets[0].subject).toBe('Test ticket')
  })

  it('getSupportTickets sends query parameters', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ tickets: [], pagination: { page: 1, limit: 20, total: 0, pages: 0 } }),
      })
    )

    await getSupportTickets({ status: 'open', category: 'other', page: 2, limit: 10 })
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('status=open'),
      expect.any(Object)
    )
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('category=other'),
      expect.any(Object)
    )
  })

  it('getSupportTicket fetches single ticket', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockTicket),
      })
    )

    const result = await getSupportTicket('ticket-1')
    expect(result.id).toBe('ticket-1')
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/support/tickets/ticket-1'),
      expect.any(Object)
    )
  })

  it('createSupportTicket sends POST request', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 201,
        json: () => Promise.resolve(mockTicket),
      })
    )

    const result = await createSupportTicket({
      subject: 'Test ticket',
      message: 'Test message',
      category: 'other',
    })
    expect(result.subject).toBe('Test ticket')
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/support/tickets'),
      expect.objectContaining({ method: 'POST' })
    )
  })

  it('addSupportTicketMessage sends POST request', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 201,
        json: () => Promise.resolve({ id: 'msg-1', message: 'Follow-up', sender: 'customer' }),
      })
    )

    const result = await addSupportTicketMessage('ticket-1', 'Follow-up')
    expect(result.message).toBe('Follow-up')
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/support/tickets/ticket-1/messages'),
      expect.objectContaining({ method: 'POST' })
    )
  })

  it('throws on error', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        status: 500,
        json: () => Promise.resolve({ error: 'Server error' }),
      })
    )

    await expect(getSupportTickets()).rejects.toThrow('Server error')
  })
})
