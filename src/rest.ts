import type {
  Message,
  SendMessageOptions,
  RegisterCommandOptions,
  BotCommand,
  UploadResult,
} from './types.js'

export class RestClient {
  private readonly baseURL: string
  private readonly token: string

  constructor(token: string, baseURL: string) {
    this.token = token.startsWith('Bot ') ? token : `Bot ${token}`
    this.baseURL = baseURL.replace(/\/$/, '')
  }

  private async request<T>(
    method: string,
    path: string,
    body?: unknown,
  ): Promise<T> {
    const res = await fetch(`${this.baseURL}${path}`, {
      method,
      headers: {
        Authorization: this.token,
        ...(body ? { 'Content-Type': 'application/json' } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: res.statusText }))
      throw new Error(
        `Fluffwire API error ${res.status}: ${(err as { error?: string }).error ?? res.statusText}`,
      )
    }

    if (res.status === 204) return undefined as T
    return res.json() as Promise<T>
  }

  // ── Messages ──────────────────────────────────────────────

  async sendMessage(channelId: string, options: SendMessageOptions | string): Promise<Message> {
    const body = typeof options === 'string' ? { content: options } : options
    return this.request<Message>('POST', `/channels/${channelId}/messages`, body)
  }

  async toggleReaction(channelId: string, messageId: string, emoji: string): Promise<void> {
    return this.request('PUT', `/channels/${channelId}/messages/${messageId}/reactions/${encodeURIComponent(emoji)}`)
  }

  async sendTyping(channelId: string): Promise<void> {
    return this.request('POST', `/channels/${channelId}/typing`)
  }

  // ── Files ─────────────────────────────────────────────────

  async uploadFile(file: Blob | Buffer, filename: string): Promise<UploadResult> {
    const form = new FormData()
    form.append('file', new Blob([file]), filename)

    const res = await fetch(`${this.baseURL}/upload`, {
      method: 'POST',
      headers: { Authorization: this.token },
      body: form,
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: res.statusText }))
      throw new Error(
        `Fluffwire API error ${res.status}: ${(err as { error?: string }).error ?? res.statusText}`,
      )
    }

    return res.json() as Promise<UploadResult>
  }

  // ── Commands ──────────────────────────────────────────────

  async registerCommand(options: RegisterCommandOptions): Promise<BotCommand> {
    return this.request<BotCommand>('POST', '/bot/commands', options)
  }

  async listCommands(): Promise<BotCommand[]> {
    return this.request<BotCommand[]>('GET', '/bot/commands')
  }

  async updateCommand(
    commandId: string,
    options: Partial<Omit<RegisterCommandOptions, 'serverId'>>,
  ): Promise<BotCommand> {
    return this.request<BotCommand>('PATCH', `/bot/commands/${commandId}`, options)
  }

  async deleteCommand(commandId: string): Promise<void> {
    return this.request('DELETE', `/bot/commands/${commandId}`)
  }
}
