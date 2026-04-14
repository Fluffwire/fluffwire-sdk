/**
 * Example 8: Error handling
 *
 * Shows how to handle connection errors, API errors, and graceful shutdown.
 *
 * Usage:
 *   BOT_TOKEN=your_token CHANNEL_ID=your_channel_id npx tsx examples/08-error-handling.ts
 */

import { FluffwireClient } from '../src/index.js'

const client = new FluffwireClient({
  token: process.env.BOT_TOKEN!,
})

// Listen for gateway/connection errors
client.on('error', (err) => {
  console.error('Gateway error:', err.message)
  // The SDK will attempt to reconnect automatically for transient errors.
  // You may want to alert here (e.g. push to a monitoring service).
})

client.on('ready', async () => {
  console.log('Connected!')

  const channelId = process.env.CHANNEL_ID!

  // --- API errors ---
  // sendMessage rejects if the API returns a non-2xx response.
  // Wrap calls in try/catch to handle them gracefully.
  try {
    await client.sendMessage('000000000000000000', 'This channel does not exist')
  } catch (err) {
    // err.message contains the API error text, e.g. "channel not found"
    console.error('Expected error caught:', (err as Error).message)
  }

  // --- Partial failure in a batch ---
  const channels = [channelId, 'bad-id-1', 'bad-id-2']
  const results = await Promise.allSettled(
    channels.map((id) => client.sendMessage(id, 'Batch message')),
  )

  for (const [i, result] of results.entries()) {
    if (result.status === 'fulfilled') {
      console.log(`Channel ${channels[i]}: sent message ${result.value.id}`)
    } else {
      console.error(`Channel ${channels[i]}: failed — ${result.reason.message}`)
    }
  }
})

// --- Graceful shutdown ---
// Disconnect cleanly on SIGINT (Ctrl+C) or SIGTERM
async function shutdown(signal: string) {
  console.log(`\nReceived ${signal}, disconnecting...`)
  client.disconnect()
  process.exit(0)
}

process.on('SIGINT', () => shutdown('SIGINT'))
process.on('SIGTERM', () => shutdown('SIGTERM'))

await client.connect()
