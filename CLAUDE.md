# Fluffwire Bot SDK (@fluffwire/bot-sdk)

Official TypeScript SDK for building Fluffwire bots. Published to npm as `@fluffwire/bot-sdk`.

## Related Repositories

- **SDK** (THIS REPO): `/home/cryo/fluffwire-sdk` — npm package
- **App** (`fluffwire-app`): `/home/cryo/fluffwire-app` — Vue 3 SPA at app.fluffwire.com
- **Backend** (`fluffwire-server`): `/home/cryo/fluffwire-server` — Go API + WebSocket server
- **Website** (`fluffwire-web`): `/home/cryo/fluffwire-web` — Marketing site + docs at fluffwire.com

## Tech Stack

- TypeScript 5.9, Node.js 18+
- `ws` for WebSocket (Node.js)
- `tsup` for dual ESM/CJS build
- `vitest` for tests

## Commands

```bash
npm run build       # Build ESM + CJS + types to dist/
npm run dev         # Build in watch mode
npm run test        # Run tests with vitest
npm run test:watch  # Run tests in watch mode
```

## Project Structure

```
src/
  index.ts       # Public exports
  client.ts      # FluffwireClient (EventEmitter, REST + gateway wrapper)
  rest.ts        # RestClient — all HTTP methods
  gateway.ts     # GatewayClient — WebSocket connection + event dispatch
  types.ts       # TypeScript interfaces
  constants.ts   # API URLs, opcodes, event names
  __tests__/     # Vitest tests
```

## Before Committing ⚠️

1. Run `npm run build` — must compile without errors
2. Run `npm run test` — zero failures required
3. If the change exposes new API surface, update the docs at `/home/cryo/fluffwire-web/docs/bots/`
4. Only then commit and push

## API Contract

The SDK wraps the Fluffwire bot API. See:
- REST + WebSocket reference: `https://fluffwire.com/docs/bots/`
- Backend source: `/home/cryo/fluffwire-server/internal/handler/`

## Publishing

Not yet set up for npm publish. When ready:
1. Bump version in `package.json`
2. Run `npm run build`
3. Run `npm publish --access public`
