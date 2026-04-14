import { describe, it, expect, vi, beforeEach } from 'vitest'
import { RestClient } from '../rest.js'

const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

function mockResponse(body: unknown, status = 200) {
  mockFetch.mockResolvedValueOnce({
    ok: status >= 200 && status < 300,
    status,
    statusText: 'OK',
    json: () => Promise.resolve(body),
  })
}

const TOKEN = 'test-token'
const BASE = 'https://app.fluffwire.com/api'

describe('RestClient', () => {
  let client: RestClient

  beforeEach(() => {
    vi.clearAllMocks()
    client = new RestClient(TOKEN, BASE)
  })

  it('prepends "Bot " prefix to token automatically', async () => {
    mockResponse({ id: '1', content: 'hi', channelId: 'c1', author: {}, attachments: [], reactions: [], timestamp: '' })
    await client.sendMessage('c1', 'hi')
    expect(mockFetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ headers: expect.objectContaining({ Authorization: 'Bot test-token' }) }),
    )
  })

  it('does not double-prefix "Bot " if already present', async () => {
    const c = new RestClient('Bot test-token', BASE)
    mockResponse({ id: '1', content: 'hi', channelId: 'c1', author: {}, attachments: [], reactions: [], timestamp: '' })
    await c.sendMessage('c1', 'hi')
    expect(mockFetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ headers: expect.objectContaining({ Authorization: 'Bot test-token' }) }),
    )
  })

  describe('sendMessage', () => {
    it('sends a message with string content', async () => {
      const msg = { id: '1', channelId: 'c1', content: 'Hello!', author: {}, attachments: [], reactions: [], timestamp: '' }
      mockResponse(msg)
      const result = await client.sendMessage('c1', 'Hello!')
      expect(mockFetch).toHaveBeenCalledWith(
        `${BASE}/channels/c1/messages`,
        expect.objectContaining({ method: 'POST', body: JSON.stringify({ content: 'Hello!' }) }),
      )
      expect(result).toEqual(msg)
    })

    it('sends a message with SendMessageOptions', async () => {
      const msg = { id: '1', channelId: 'c1', content: 'Hi', author: {}, attachments: [], reactions: [], timestamp: '' }
      mockResponse(msg)
      await client.sendMessage('c1', { content: 'Hi', attachments: [{ url: 'http://x', filename: 'x.png' }] })
      expect(mockFetch).toHaveBeenCalledWith(
        `${BASE}/channels/c1/messages`,
        expect.objectContaining({
          body: JSON.stringify({ content: 'Hi', attachments: [{ url: 'http://x', filename: 'x.png' }] }),
        }),
      )
    })

    it('throws on API error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false, status: 403, statusText: 'Forbidden',
        json: () => Promise.resolve({ error: 'not a member' }),
      })
      await expect(client.sendMessage('c1', 'hi')).rejects.toThrow('403')
    })
  })

  describe('toggleReaction', () => {
    it('sends PUT to correct URL with encoded emoji', async () => {
      mockFetch.mockResolvedValueOnce({ ok: true, status: 200, json: () => Promise.resolve({}) })
      await client.toggleReaction('c1', 'm1', '👍')
      expect(mockFetch).toHaveBeenCalledWith(
        `${BASE}/channels/c1/messages/m1/reactions/${encodeURIComponent('👍')}`,
        expect.objectContaining({ method: 'PUT' }),
      )
    })
  })

  describe('sendTyping', () => {
    it('sends POST to typing endpoint', async () => {
      mockFetch.mockResolvedValueOnce({ ok: true, status: 204, json: () => Promise.resolve(undefined) })
      await client.sendTyping('c1')
      expect(mockFetch).toHaveBeenCalledWith(
        `${BASE}/channels/c1/typing`,
        expect.objectContaining({ method: 'POST' }),
      )
    })
  })

  describe('commands', () => {
    it('registers a command', async () => {
      const cmd = { id: 'cmd1', name: 'ping', description: 'Ping', serverId: 's1', botId: 'b1', minTier: 'member', options: [], enabled: true, createdAt: '' }
      mockResponse(cmd, 201)
      const result = await client.registerCommand({ name: 'ping', description: 'Ping', serverId: 's1' })
      expect(mockFetch).toHaveBeenCalledWith(
        `${BASE}/bot/commands`,
        expect.objectContaining({ method: 'POST' }),
      )
      expect(result).toEqual(cmd)
    })

    it('lists commands', async () => {
      mockResponse([])
      const result = await client.listCommands()
      expect(mockFetch).toHaveBeenCalledWith(`${BASE}/bot/commands`, expect.objectContaining({ method: 'GET' }))
      expect(result).toEqual([])
    })

    it('deletes a command', async () => {
      mockFetch.mockResolvedValueOnce({ ok: true, status: 204, json: () => Promise.resolve(undefined) })
      await client.deleteCommand('cmd1')
      expect(mockFetch).toHaveBeenCalledWith(
        `${BASE}/bot/commands/cmd1`,
        expect.objectContaining({ method: 'DELETE' }),
      )
    })
  })
})
