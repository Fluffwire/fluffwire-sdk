import { EventEmitter } from 'node:events'
import { RestClient } from './rest.js'
import { GatewayClient } from './gateway.js'
import { DEFAULT_BASE_URL, DEFAULT_WS_URL } from './constants.js'
import type {
  ClientOptions,
  ClientEvents,
  Message,
  SendMessageOptions,
  RegisterCommandOptions,
  BotCommand,
  UploadResult,
} from './types.js'

export class FluffwireClient extends EventEmitter {
  private readonly rest: RestClient
  private readonly gateway: GatewayClient

  constructor(options: ClientOptions) {
    super()

    const token = options.token.startsWith('Bot ')
      ? options.token.slice(4)
      : options.token

    this.rest = new RestClient(token, options.baseURL ?? DEFAULT_BASE_URL)

    this.gateway = new GatewayClient({
      token,
      wsURL: options.wsURL ?? DEFAULT_WS_URL,
      emit: (event, ...args) => this.emit(event, ...args),
    })
  }

  // ── Typed EventEmitter overrides ─────────────────────────

  on<K extends keyof ClientEvents>(
    event: K,
    listener: (...args: ClientEvents[K]) => void,
  ): this {
    return super.on(event, listener as (...args: unknown[]) => void)
  }

  once<K extends keyof ClientEvents>(
    event: K,
    listener: (...args: ClientEvents[K]) => void,
  ): this {
    return super.once(event, listener as (...args: unknown[]) => void)
  }

  off<K extends keyof ClientEvents>(
    event: K,
    listener: (...args: ClientEvents[K]) => void,
  ): this {
    return super.off(event, listener as (...args: unknown[]) => void)
  }

  emit<K extends keyof ClientEvents>(event: K, ...args: ClientEvents[K]): boolean {
    return super.emit(event, ...args)
  }

  // ── Gateway ───────────────────────────────────────────────

  /**
   * Connect to the Fluffwire gateway and start receiving events.
   * Resolves when the bot is ready.
   */
  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.once('ready', resolve)
      this.once('error', reject)
      this.gateway.connect()
    })
  }

  /** Disconnect from the gateway. */
  disconnect(): void {
    this.gateway.disconnect()
  }

  // ── Messages ──────────────────────────────────────────────

  /**
   * Send a message to a channel.
   * @param channelId - The channel to post in.
   * @param content - Message text, or a {@link SendMessageOptions} object.
   */
  sendMessage(channelId: string, content: string | SendMessageOptions): Promise<Message> {
    return this.rest.sendMessage(channelId, content)
  }

  /**
   * Toggle a reaction on a message. Adds if not present, removes if already added.
   */
  toggleReaction(channelId: string, messageId: string, emoji: string): Promise<void> {
    return this.rest.toggleReaction(channelId, messageId, emoji)
  }

  /** Send a typing indicator to a channel. */
  sendTyping(channelId: string): Promise<void> {
    return this.rest.sendTyping(channelId)
  }

  // ── Files ─────────────────────────────────────────────────

  /** Upload a file and return its URL, which can be used in message attachments. */
  uploadFile(file: Blob | Buffer, filename: string): Promise<UploadResult> {
    return this.rest.uploadFile(file, filename)
  }

  // ── Commands ──────────────────────────────────────────────

  /** Register a slash command in a server. */
  registerCommand(options: RegisterCommandOptions): Promise<BotCommand> {
    return this.rest.registerCommand(options)
  }

  /** List all commands registered by this bot. */
  listCommands(): Promise<BotCommand[]> {
    return this.rest.listCommands()
  }

  /** Update an existing command. */
  updateCommand(
    commandId: string,
    options: Partial<Omit<RegisterCommandOptions, 'serverId'>>,
  ): Promise<BotCommand> {
    return this.rest.updateCommand(commandId, options)
  }

  /** Delete a command. */
  deleteCommand(commandId: string): Promise<void> {
    return this.rest.deleteCommand(commandId)
  }
}
