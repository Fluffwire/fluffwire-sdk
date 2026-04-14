/**
 * Example 7: Reaction events
 *
 * Listens for reactions added/removed by users and logs them.
 * Also demonstrates a "poll" pattern — react with 👍 or 👎 to vote,
 * and the bot reports the current tally when asked.
 *
 * Usage:
 *   BOT_TOKEN=your_token npx tsx examples/07-reaction-events.ts
 */

import { FluffwireClient } from '../src/index.js'

const client = new FluffwireClient({
  token: process.env.BOT_TOKEN!,
})

// Track reaction counts per message: messageId → emoji → count
const tally = new Map<string, Map<string, number>>()

function adjust(messageId: string, emoji: string, delta: number) {
  if (!tally.has(messageId)) tally.set(messageId, new Map())
  const counts = tally.get(messageId)!
  counts.set(emoji, (counts.get(emoji) ?? 0) + delta)
}

client.on('ready', () => {
  console.log('Reaction tracker ready!')
})

client.on('reactionAdd', ({ messageId, channelId, userId, emoji }) => {
  console.log(`User ${userId} reacted ${emoji} on message ${messageId}`)
  adjust(messageId, emoji, +1)
})

client.on('reactionRemove', ({ messageId, channelId, userId, emoji }) => {
  console.log(`User ${userId} removed ${emoji} from message ${messageId}`)
  adjust(messageId, emoji, -1)
})

client.on('messageCreate', async (msg) => {
  if (msg.author.isBot) return

  // "!tally <messageId>" prints the reaction counts for that message
  if (msg.content.startsWith('!tally ')) {
    const targetId = msg.content.slice(7).trim()
    const counts = tally.get(targetId)

    if (!counts || counts.size === 0) {
      await client.sendMessage(msg.channelId, `No reactions tracked for message \`${targetId}\`.`)
      return
    }

    const lines = [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([emoji, n]) => `${emoji} × ${n}`)

    await client.sendMessage(msg.channelId, `Reactions on \`${targetId}\`:\n${lines.join('\n')}`)
  }
})

await client.connect()
