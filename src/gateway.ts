import WebSocket from 'ws'
import { OpCodes, Events } from './constants.js'
import type { ClientEvents } from './types.js'

type EventCallback<K extends keyof ClientEvents> = (...args: ClientEvents[K]) => void

interface GatewayOptions {
  token: string
  wsURL: string
  emit: <K extends keyof ClientEvents>(event: K, ...args: ClientEvents[K]) => void
}

export class GatewayClient {
  private ws: WebSocket | null = null
  private heartbeatTimer: ReturnType<typeof setInterval> | null = null
  private sessionId: string | null = null
  private seq = 0
  private reconnecting = false

  constructor(private readonly options: GatewayOptions) {}

  connect(): void {
    this.ws = new WebSocket(this.options.wsURL)

    this.ws.on('open', () => {
      // Server sends HELLO first — wait for it
    })

    this.ws.on('message', (data: WebSocket.RawData) => {
      try {
        this.handleMessage(JSON.parse(data.toString()))
      } catch {
        // ignore malformed frames
      }
    })

    this.ws.on('close', (code, reason) => {
      this.cleanup()
      this.options.emit('disconnect', code, reason.toString())
      if (code !== 1000) {
        // Reconnect after 5s for non-clean closes
        setTimeout(() => this.reconnect(), 5000)
      }
    })

    this.ws.on('error', (err) => {
      this.options.emit('error', err)
    })
  }

  disconnect(): void {
    this.reconnecting = false
    this.ws?.close(1000, 'disconnect')
    this.cleanup()
  }

  private reconnect(): void {
    if (this.reconnecting) return
    this.reconnecting = true
    this.connect()
  }

  private cleanup(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer)
      this.heartbeatTimer = null
    }
  }

  private send(payload: unknown): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(payload))
    }
  }

  private handleMessage(msg: {
    op: number
    t?: string
    s?: number
    d?: unknown
  }): void {
    if (msg.s) this.seq = msg.s

    switch (msg.op) {
      case OpCodes.Hello: {
        const { heartbeatInterval } = msg.d as { heartbeatInterval: number }
        this.startHeartbeat(heartbeatInterval)
        if (this.sessionId && this.seq > 0) {
          this.send({
            op: OpCodes.Resume,
            d: { token: `Bot ${this.options.token}`, sessionId: this.sessionId, seq: this.seq },
          })
        } else {
          this.send({
            op: OpCodes.Identify,
            d: { token: `Bot ${this.options.token}` },
          })
        }
        break
      }

      case OpCodes.HeartbeatAck:
        break

      case OpCodes.Dispatch:
        this.reconnecting = false
        this.handleDispatch(msg.t ?? '', msg.d)
        break
    }
  }

  private handleDispatch(event: string, data: unknown): void {
    switch (event) {
      case 'READY': {
        const d = data as { sessionId: string }
        this.sessionId = d.sessionId
        this.options.emit('ready')
        break
      }
      case Events.MessageCreate:
        this.options.emit('messageCreate', data as ClientEvents['messageCreate'][0])
        break
      case Events.MessageUpdate:
        this.options.emit('messageUpdate', data as ClientEvents['messageUpdate'][0])
        break
      case Events.MessageDelete:
        this.options.emit('messageDelete', data as ClientEvents['messageDelete'][0])
        break
      case Events.CommandInvoke:
        this.options.emit('commandInvoke', data as ClientEvents['commandInvoke'][0])
        break
      case Events.PresenceUpdate:
        this.options.emit('presenceUpdate', data as ClientEvents['presenceUpdate'][0])
        break
      case Events.ServerMemberAdd:
        this.options.emit('serverMemberAdd', data as ClientEvents['serverMemberAdd'][0])
        break
      case Events.ServerMemberRemove:
        this.options.emit('serverMemberRemove', data as ClientEvents['serverMemberRemove'][0])
        break
    }
  }

  private startHeartbeat(interval: number): void {
    if (this.heartbeatTimer) clearInterval(this.heartbeatTimer)
    this.heartbeatTimer = setInterval(() => {
      this.send({ op: OpCodes.Heartbeat, d: null })
    }, interval)
  }
}

export type { EventCallback }
