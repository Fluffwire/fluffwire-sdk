import { describe, it, expect, vi, beforeEach } from 'vitest'
import { FluffwireClient } from '../client.js'

const mockSendMessage = vi.fn().mockResolvedValue({ id: '1', content: 'hi', channelId: 'c1' })
const mockToggleReaction = vi.fn().mockResolvedValue(undefined)
const mockSendTyping = vi.fn().mockResolvedValue(undefined)
const mockUploadFile = vi.fn().mockResolvedValue({ url: 'https://example.com/file.png' })
const mockRegisterCommand = vi.fn().mockResolvedValue({ id: 'cmd1', name: 'ping' })
const mockListCommands = vi.fn().mockResolvedValue([])
const mockUpdateCommand = vi.fn().mockResolvedValue({ id: 'cmd1', name: 'pong' })
const mockDeleteCommand = vi.fn().mockResolvedValue(undefined)
const mockGatewayConnect = vi.fn()
const mockGatewayDisconnect = vi.fn()

vi.mock('../rest.js', () => ({
  RestClient: vi.fn(function () {
    this.sendMessage = mockSendMessage
    this.toggleReaction = mockToggleReaction
    this.sendTyping = mockSendTyping
    this.uploadFile = mockUploadFile
    this.registerCommand = mockRegisterCommand
    this.listCommands = mockListCommands
    this.updateCommand = mockUpdateCommand
    this.deleteCommand = mockDeleteCommand
  }),
}))

vi.mock('../gateway.js', () => ({
  GatewayClient: vi.fn(function (this: { connect: typeof mockGatewayConnect, disconnect: typeof mockGatewayDisconnect }) {
    this.connect = mockGatewayConnect
    this.disconnect = mockGatewayDisconnect
  }),
}))

describe('FluffwireClient', () => {
  let client: FluffwireClient

  beforeEach(() => {
    vi.clearAllMocks()
    client = new FluffwireClient({ token: 'test-token' })
  })

  it('connects and resolves when ready event fires', async () => {
    mockGatewayConnect.mockImplementationOnce(() => {
      client.emit('ready')
    })
    await expect(client.connect()).resolves.toBeUndefined()
  })

  it('rejects connect if error fires before ready', async () => {
    const err = new Error('auth failed')
    mockGatewayConnect.mockImplementationOnce(() => {
      client.emit('error', err)
    })
    await expect(client.connect()).rejects.toThrow('auth failed')
  })

  it('delegates sendMessage to rest client', async () => {
    const result = await client.sendMessage('c1', 'Hello!')
    expect(mockSendMessage).toHaveBeenCalledWith('c1', 'Hello!')
    expect(result).toEqual({ id: '1', content: 'hi', channelId: 'c1' })
  })

  it('delegates toggleReaction to rest client', async () => {
    await client.toggleReaction('c1', 'm1', '👍')
    expect(mockToggleReaction).toHaveBeenCalledWith('c1', 'm1', '👍')
  })

  it('delegates sendTyping to rest client', async () => {
    await client.sendTyping('c1')
    expect(mockSendTyping).toHaveBeenCalledWith('c1')
  })

  it('delegates uploadFile to rest client', async () => {
    const buf = Buffer.from('data')
    const result = await client.uploadFile(buf, 'file.png')
    expect(mockUploadFile).toHaveBeenCalledWith(buf, 'file.png')
    expect(result).toEqual({ url: 'https://example.com/file.png' })
  })

  it('delegates registerCommand to rest client', async () => {
    const result = await client.registerCommand({ name: 'ping', description: 'Ping', serverId: 's1' })
    expect(mockRegisterCommand).toHaveBeenCalledWith({ name: 'ping', description: 'Ping', serverId: 's1' })
    expect(result).toEqual({ id: 'cmd1', name: 'ping' })
  })

  it('delegates listCommands to rest client', async () => {
    const result = await client.listCommands()
    expect(mockListCommands).toHaveBeenCalled()
    expect(result).toEqual([])
  })

  it('delegates deleteCommand to rest client', async () => {
    await client.deleteCommand('cmd1')
    expect(mockDeleteCommand).toHaveBeenCalledWith('cmd1')
  })

  it('calls gateway disconnect on disconnect()', () => {
    client.disconnect()
    expect(mockGatewayDisconnect).toHaveBeenCalled()
  })

  it('supports typed messageCreate event listeners', () => {
    const handler = vi.fn()
    const msg = { id: '1', channelId: 'c1', content: 'hi', author: { id: 'u1', username: 'user', displayName: 'User' }, attachments: [], reactions: [], timestamp: '' }
    client.on('messageCreate', handler)
    client.emit('messageCreate', msg)
    expect(handler).toHaveBeenCalledWith(msg)
  })

  it('supports once listeners', () => {
    const handler = vi.fn()
    client.once('ready', handler)
    client.emit('ready')
    client.emit('ready')
    expect(handler).toHaveBeenCalledOnce()
  })
})
