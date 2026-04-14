/**
 * Example 9: Managing slash commands
 *
 * Lists existing commands, updates one, and deletes another.
 * Run this as a one-shot admin script, not a persistent bot.
 *
 * Usage:
 *   BOT_TOKEN=your_token npx tsx examples/09-manage-commands.ts
 */

import { FluffwireClient } from '../src/index.js'

const client = new FluffwireClient({
  token: process.env.BOT_TOKEN!,
})

client.on('ready', async () => {
  // List all registered commands for this bot
  const commands = await client.listCommands()
  console.log(`Found ${commands.length} registered command(s):`)
  for (const cmd of commands) {
    console.log(`  /${cmd.name} [${cmd.id}] — ${cmd.description}`)
  }

  if (commands.length === 0) {
    console.log('No commands to manage. Register some with example 04 first.')
    await client.disconnect()
    return
  }

  // Update the first command's description
  const [first] = commands
  const updated = await client.updateCommand(first.id, {
    description: `${first.description} (updated)`,
  })
  console.log(`Updated /${updated.name}: "${updated.description}"`)

  // Delete the last command (if there's more than one)
  if (commands.length > 1) {
    const last = commands[commands.length - 1]
    await client.deleteCommand(last.id)
    console.log(`Deleted /${last.name}`)
  }

  await client.disconnect()
})

await client.connect()
