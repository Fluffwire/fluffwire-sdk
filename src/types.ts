export interface ClientOptions {
  /** Bot token — include the "Bot " prefix or it will be added automatically. */
  token: string
  /** Override the REST API base URL. Defaults to https://app.fluffwire.com/api */
  baseURL?: string
  /** Override the WebSocket gateway URL. Defaults to wss://app.fluffwire.com/ws */
  wsURL?: string
}

export interface Message {
  id: string
  channelId: string
  content: string
  author: MessageAuthor
  webhookId?: string
  attachments: Attachment[]
  reactions: Reaction[]
  timestamp: string
  editedAt?: string
}

export interface MessageAuthor {
  id: string
  username: string
  displayName: string
  avatar?: string
  isBot?: boolean
}

export interface Attachment {
  url: string
  filename: string
  size?: number
  contentType?: string
}

export interface Reaction {
  emoji: string
  count: number
  me: boolean
}

export interface SendMessageOptions {
  content: string
  attachments?: Pick<Attachment, 'url' | 'filename'>[]
}

export interface CommandOption {
  name: string
  description: string
  type: 'string' | 'integer' | 'boolean' | 'user' | 'channel' | 'label'
  required?: boolean
}

export interface RegisterCommandOptions {
  name: string
  description: string
  serverId: string
  minTier?: 'member' | 'moderator' | 'admin' | 'owner'
  options?: CommandOption[]
}

export interface BotCommand {
  id: string
  botId: string
  serverId: string
  name: string
  description: string
  minTier: string
  options: CommandOption[]
  enabled: boolean
  createdAt: string
}

export interface CommandInvokePayload {
  commandId: string
  commandName: string
  channelId: string
  serverId: string
  userId: string
  options: Record<string, unknown>
}

export interface PresenceUpdatePayload {
  userId: string
  status: 'online' | 'idle' | 'dnd' | 'offline'
}

export interface ServerMemberPayload {
  userId: string
  serverId: string
}

export interface UploadResult {
  url: string
}

/** Maps SDK event names to their payload types */
export interface ClientEvents {
  ready: []
  messageCreate: [message: Message]
  messageUpdate: [message: Message]
  messageDelete: [payload: { id: string; channelId: string }]
  commandInvoke: [payload: CommandInvokePayload]
  presenceUpdate: [payload: PresenceUpdatePayload]
  serverMemberAdd: [payload: ServerMemberPayload]
  serverMemberRemove: [payload: ServerMemberPayload]
  error: [error: Error]
  disconnect: [code: number, reason: string]
}
