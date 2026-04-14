# @fluffwire/bot-sdk

Official TypeScript SDK for building [Fluffwire](https://fluffwire.com) bots.

## Installation

```bash
npm install @fluffwire/bot-sdk
```

Requires Node.js 18+.

## Quick Start

```typescript
import { FluffwireClient } from '@fluffwire/bot-sdk'

const client = new FluffwireClient({
  token: process.env.BOT_TOKEN!,
})

client.on('ready', () => {
  console.log('Bot is ready!')
})

client.on('messageCreate', async (msg) => {
  if (msg.content === '!ping') {
    await client.sendMessage(msg.channelId, 'Pong!')
  }
})

client.on('commandInvoke', async ({ commandName, channelId }) => {
  if (commandName === 'ping') {
    await client.sendMessage(channelId, 'Pong! 🏓')
  }
})

await client.connect()
```

## API

### `new FluffwireClient(options)`

| Option | Type | Required | Description |
|--------|------|----------|-------------|
| `token` | `string` | Yes | Your bot token (with or without `Bot ` prefix) |
| `baseURL` | `string` | No | Override REST API base URL |
| `wsURL` | `string` | No | Override WebSocket gateway URL |

### Events

| Event | Payload | Description |
|-------|---------|-------------|
| `ready` | — | Bot connected and authenticated |
| `messageCreate` | `Message` | A message was sent in a channel |
| `messageUpdate` | `Message` | A message was edited |
| `messageDelete` | `{ id, channelId }` | A message was deleted |
| `commandInvoke` | `CommandInvokePayload` | A user invoked a slash command |
| `presenceUpdate` | `PresenceUpdatePayload` | A user's status changed |
| `serverMemberAdd` | `ServerMemberPayload` | A user joined a server |
| `serverMemberRemove` | `ServerMemberPayload` | A user left a server |
| `error` | `Error` | A connection error occurred |
| `disconnect` | `code, reason` | Gateway connection closed |

### Methods

#### Messages
- `sendMessage(channelId, content)` — Send a message. `content` can be a string or `SendMessageOptions`.
- `toggleReaction(channelId, messageId, emoji)` — Add or remove a reaction.
- `sendTyping(channelId)` — Send a typing indicator.

#### Files
- `uploadFile(file, filename)` — Upload a file and get back a URL for use in message attachments.

#### Slash Commands
- `registerCommand(options)` — Register a slash command in a server.
- `listCommands()` — List all commands registered by this bot.
- `updateCommand(commandId, options)` — Update a command.
- `deleteCommand(commandId)` — Delete a command.

#### Gateway
- `connect()` — Connect to the gateway. Returns a promise that resolves when ready.
- `disconnect()` — Disconnect cleanly.

## Example: Slash Command Bot

```typescript
import { FluffwireClient } from '@fluffwire/bot-sdk'

const client = new FluffwireClient({ token: process.env.BOT_TOKEN! })

client.on('ready', async () => {
  // Register a command on startup
  await client.registerCommand({
    name: 'echo',
    description: 'Repeat your message',
    serverId: process.env.SERVER_ID!,
    options: [
      { name: 'message', description: 'Text to echo', type: 'string', required: true },
    ],
  })
})

client.on('commandInvoke', async ({ commandName, channelId, options }) => {
  if (commandName === 'echo') {
    await client.sendMessage(channelId, String(options.message))
  }
})

await client.connect()
```

## Example: File Upload

```typescript
import { readFile } from 'node:fs/promises'

const file = await readFile('./image.png')
const { url } = await client.uploadFile(file, 'image.png')

await client.sendMessage(channelId, {
  content: 'Here is an image:',
  attachments: [{ url, filename: 'image.png' }],
})
```

## Documentation

Full bot developer reference: **https://fluffwire.com/docs/bots/**

## License

[AGPL-3.0](./LICENSE)
