# Scalable WebSocket Journey (Chatter Monorepo)
# Iteration 2: Moving from vanilla to Next.js and implementing monorepo setup

This repository demonstrates a small-scale WebSocket chat system and how to evolve it toward a horizontally-scaled architecture. It contains a Next.js frontend (`app`) and a minimal WebSocket server (`server`). The project is organized as a monorepo using Turborepo and pnpm workspaces.

---

What this repo contains
- `app/` — Next.js frontend (React + `SocketContext` for client-side WebSocket usage).
- `server/` — Minimal TypeScript WebSocket server using `ws`.
- `turbo.json` and root `package.json` — monorepo orchestration scripts and developer workflows.

Goals
- Provide a runnable example of a WebSocket client + server.
- Show patterns for connection lifecycle, heartbeat/ping, and broadcast semantics.
- Serve as a starting point for exploring scaling strategies (load-balancing, pub/sub, sticky sessions, Redis, etc.).

Repository layout

```text
chatter/
├── app/          # Next.js frontend
├── server/       # WebSocket server (TypeScript)
├── turbo.json    # Turborepo configuration
└── package.json  # Monorepo root
```

---

Quickstart (local development)

Prerequisites
- Node.js (recommended v18+)
- pnpm (this repo uses pnpm workspaces)

Install dependencies from the repository root:

```bash
pnpm install
```

Run the full development environment (recommended):

```bash
pnpm dev
```

Notes:
- `pnpm dev` runs Turborepo's `turbo dev` which will start package-level dev scripts.
- You can also run the packages individually:
  - Frontend: `pnpm --filter app dev` (Next.js runs on port 3000 by default)
  - Server: `pnpm --filter server dev` (server uses `tsx` to run `index.ts`)

Server details
- Default WebSocket port: `8080`. Override with an environment variable named `WEBSOCKET_PORT`.
- The server implements a simple heartbeat/ping mechanism to detect dead clients and broadcasts incoming messages to all connected clients.
- Entry point: [server/index.ts](server/index.ts#L1)

Example `.env` (place at repository root):

```env
# .env
WEBSOCKET_PORT=8080
```

Production / build notes
- Build the frontend:

```bash
pnpm --filter app build
```

- Start the Next.js production server from `app/`:

```bash
pnpm --filter app start
```

- The server package currently runs TypeScript source with `tsx` in development (`pnpm --filter server dev`). For production you should transpile the server to JavaScript (e.g., `tsc`) and run it with Node, or use an appropriate runtime that supports shipping TS directly.

Useful scripts
- `pnpm dev` — start monorepo dev (turbo)
- `pnpm build` — run monorepo builds

How the pieces interact
- The Next.js client uses a `SocketContext` to open and manage a single WebSocket connection per browser session and to broadcast/receive chat messages.
- The server accepts connections, responds to `pong` messages for health checks, and echoes/broadcasts incoming messages to all connected clients.

Extending and scaling
- To scale beyond a single server process you'll typically need:
  - A pub/sub layer (Redis, NATS) so multiple server instances can forward messages to all connected clients.
  - A load balancer and a strategy for sticky sessions or an external session store.
  - Horizontal autoscaling and health checks for robust availability.

Contributing
- Open a PR with a clear description of the change. For feature work, include a brief rationale and any manual test steps.

Where to look next
- Frontend socket wiring: [app/context/SocketContext.tsx](app/context/SocketContext.tsx#L1)
- Server: [server/index.ts](server/index.ts#L1)

License
- This repo does not currently include a license file. Add one if you intend to open-source this project.

---