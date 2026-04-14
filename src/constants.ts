export const DEFAULT_BASE_URL = 'https://app.fluffwire.com/api'
export const DEFAULT_WS_URL = 'wss://app.fluffwire.com/ws'

export const OpCodes = {
  Dispatch: 0,
  Heartbeat: 1,
  Identify: 2,
  Resume: 6,
  Hello: 10,
  HeartbeatAck: 11,
} as const

export const Events = {
  MessageCreate: 'MESSAGE_CREATE',
  MessageUpdate: 'MESSAGE_UPDATE',
  MessageDelete: 'MESSAGE_DELETE',
  ServerMemberAdd: 'SERVER_MEMBER_ADD',
  ServerMemberRemove: 'SERVER_MEMBER_REMOVE',
  PresenceUpdate: 'PRESENCE_UPDATE',
  TypingStart: 'TYPING_START',
  CommandInvoke: 'COMMAND_INVOKE',
} as const
