Here is your updated `README.md`. I have revised the iteration log, project state, and technology checklist to accurately reflect the newly added **Firebase Auth**, **Cloud Firestore contact tracking**, **Shadcn UI dialogs/menus**, and **Lottie animations**.

```markdown
# Scalable WebSocket Journey (Chatter Monorepo)
# Iteration 4: Firebase Authentication, Contact Discovery, and Rich Interactive UI

This repository demonstrates a small-scale WebSocket chat system and how to evolve it toward a horizontally-scaled architecture. It contains a Next.js frontend (`app`) and a minimal WebSocket server (`server`). The project is organized as a monorepo using Turborepo and pnpm workspaces.

---
- [x] **Iteration 0: The Core Proof of Concept**
  - Simple local Node.js `ws` server echoing messages back to a basic HTML/JS client.
  
- [x] **Iteration 1: Robust Single-Instance**
  - Patched form submission state bugs on the client.
  - Implemented heartbeat mechanisms (`ping`/`pong`) to prune dead connections and conserve server memory.
  - Added binary/text runtime data handling safety blocks to avoid server crashes.

- [x] **Iteration 2: Migration to Modern Frontend Framework**
  - Migrated the vanilla client into a clean Next.js application ecosystem.
  - Built a scalable `SocketContext` layer using a `useRef` architecture to keep a unified state across client views.
  - Configured robust cleanup logic inside functional lifecycles to handle React Strict Mode duplicate connection mounts gracefully.

- [x] **Iteration 3: Targeted Routing & Identity**
  - Upgraded raw stream strings to structured JSON frame packets (`BROADCAST`, `PRIVATE_MESSAGE`).
  - Added connection identity maps to uniquely target client frames by session identifier IDs.

- [x] **Iteration 4: Secure Authentication & Discovery Layers**
  - Integrated **Firebase Authentication** alongside a client-side `AuthContext` provider to protect the socket boundary.
  - Bound the local `WebSocket` client lifecycle entirely to user authentication states (`ws://localhost:8080?userId=${user.uid}`).
  - Implemented real-time contact synchronization using **Cloud Firestore** snapshots (`onSnapshot`).
  - Added user discovery features allowing clients to look up and append new contacts by email.
  - Polished the layout with **Shadcn UI (Dialog / Dropdown Menus)**, Lucide React iconography, smooth auto-scrolling, and interactive JSON splash animations via a dynamically imported **LottiePlayer**.

---

## What this repo contains
- `app/` — Next.js frontend (React + `SocketContext` + `AuthContext` using Firebase + Tailwind CSS).
- `server/` — Minimal TypeScript WebSocket server using `ws` (tracks active `userId` query parameters).
- `turbo.json` and root `package.json` — monorepo orchestration scripts and developer workflows.

## Goals
- Provide a runnable example of an authenticated WebSocket client + server.
- Show patterns for connection lifecycle, heartbeat/ping, and targeted 1-on-1 messaging streams.
- Handle state cleanup cleanly on user sign-out events.
- Serve as a starting point for exploring scaling strategies (load-balancing, pub/sub, sticky sessions, Redis, etc.).

## Repository layout

```text
chatter/
├── app/                  # Next.js frontend
│   ├── animations/       # Lottie JSON files
│   ├── components/       # Radix/Shadcn UI elements
│   ├── context/          # SocketContext & AuthContext layers
│   └── lib/              # Firebase initialization & Firestore helpers
├── server/               # WebSocket server (TypeScript)
├── turbo.json            # Turborepo configuration
└── package.json          # Monorepo root

```

---

## Quickstart (local development)

### Prerequisites

* Node.js (recommended v18+)
* pnpm (this repo uses pnpm workspaces)

### Configuration

1. Create a `.env` file at the repository root for your server configuration:
```env
WEBSOCKET_PORT=8080

```


2. Ensure your Firebase Configuration environment variables or `lib/firebase.ts` settings are configured within the `app` workspace to enable authentication and Firestore contact lookups.

Install dependencies from the repository root:

```bash
pnpm install

```

Run the full development environment (recommended):

```bash
pnpm dev

```

### Notes:

* `pnpm dev` runs Turborepo's `turbo dev` which will start package-level dev scripts.
* You can also run the packages individually:
* Frontend: `pnpm --filter app dev` (Next.js runs on port 3000 by default)
* Server: `pnpm --filter server dev` (server uses `tsx` to run `index.ts`)



## Server details

* Default WebSocket port: `8080`. Override with an environment variable named `WEBSOCKET_PORT`.
* The server expects a `userId` query parameter during the handshake to map connection instances to users.
* Implements a heartbeat/ping mechanism to prune dead client connections.

## Production / build notes

* Build the frontend:

```bash
pnpm --filter app build

```

* Start the Next.js production server from `app/`:

```bash
pnpm --filter app start

```

## Useful scripts

* `pnpm dev` — start monorepo dev (turbo)
* `pnpm build` — run monorepo builds

## How the pieces interact

1. **Auth Guard:** The client-side `AuthContextProvider` tracks real-time Firebase login states.
2. **Dynamic Socket Lifespans:** The `SocketProvider` automatically spins up a WebSocket handshake when an authenticated `user` is detected, supplying their distinct `uid` down to the backend. If the user logs out, the socket is systematically terminated.
3. **Data Flows:** Public interactions/actions (like searching users or fetching contacts) run through Firestore. Active text message frames bypass standard DB overhead and pass directly through live WebSockets via custom `PRIVATE_MESSAGE` JSON blocks.

## Extending and scaling

* To scale beyond a single server process you'll typically need:
* A pub/sub layer (Redis, NATS) so multiple server instances can forward messages to all connected clients.
* A load balancer and a strategy for sticky sessions or an external session store.
* Horizontal autoscaling and health checks for robust availability.



## Contributing

* Open a PR with a clear description of the change. For feature work, include a brief rationale and any manual test steps.

## Where to look next

* Frontend UI Dashboard: `app/chat-dashboard/page.tsx` (or your layout entrypoint)
* Frontend socket wiring: [app/context/SocketContext.tsx](https://www.google.com/search?q=app/context/SocketContext.tsx%23L1)
* Auth middleware context: `app/context/AuthContext.tsx`
* Server: [server/index.ts](https://www.google.com/search?q=server/index.ts%23L1)

## License

* This repo does not currently include a license file. Add one if you intend to open-source this project.

```

```