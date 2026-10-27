# Flagora

<p align="center">
  <strong>Fast-paced, competitive flag identification quiz game built natively for the Telegram Mini App ecosystem.</strong>
</p>

<p align="center">
  <a href="https://github.com/Flagora"><img src="https://img.shields.io/badge/version-2.2.0-blue.svg?style=flat-square" alt="Version 2.2.0"></a>
  <a href="https://core.telegram.org/bots/webapps"><img src="https://img.shields.io/badge/Telegram-Mini%20App-0088cc.svg?style=flat-square&logo=telegram" alt="Telegram Mini App"></a>
  <a href="https://react.dev/"><img src="https://img.shields.io/badge/React-18.x-61dafb.svg?style=flat-square&logo=react" alt="React 18"></a>
  <a href="https://nodejs.org/"><img src="https://img.shields.io/badge/Node.js-20%2B-339933.svg?style=flat-square&logo=node.js" alt="Node.js 20+"></a>
  <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-5.8-3178c6.svg?style=flat-square&logo=typescript" alt="TypeScript"></a>
  <a href="https://pnpm.io/"><img src="https://img.shields.io/badge/pnpm-10%2B-f69220.svg?style=flat-square&logo=pnpm" alt="pnpm"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-green.svg?style=flat-square" alt="MIT License"></a>
</p>

---

## Overview

**Flagora** tests players' global geography knowledge under intense time pressure. Guess sovereign flags rapidly, build combo streaks, climb seasonal Elo leaderboards, challenge friends in asynchronous duels, and host live real-time multiplayer battles directly inside Telegram group chats.

Engineered with a server-authoritative backend, real-time WebSockets, and an Apple-inspired native Telegram dark mode interface.

---

## Key Features

### 🎮 Gameplay & Geography

- **194 Sovereign Nations**: Complete international coverage with crisp SVG vector flags.
- **Dynamic Scoring**: Base points, answer speed tier bonuses, combo multipliers (up to 3.0x), and leftover time bonuses.
- **Instant Learning Loop**: Immediate feedback with highlighted correct answers to reinforce geographical knowledge.
- **Server-Authoritative Anti-Cheat**: Questions, answer keys, combo streaks, and time calculations are generated and validated strictly on the backend.

### 🕹️ Game Modes

- **Solo Practice Mode**: Calibrated 60-second runs with dynamic question progression across world regions.
- **Custom Game Mode**: Configurable continent selection (World, Africa, Asia, Europe, Americas, Oceania), question counts (5–30), and durations (15s–300s).
- **Interactive Fantasy Map**: Dynamic camera zoom, regional lore, and country count inspection powered by interactive SVG maps.
- **Daily Challenge**: Synchronized global daily seed with streak tracking and streak-freeze protections.
- **1v1 Friend Challenges**: Generate deep-linked challenge cards to share directly into Telegram direct messages or group chats.
- **Live Group Multiplayer Battles**: Real-time lobbies initiated directly in Telegram group chats with live score streaming, spectator waiting rooms, and animated podium ceremonies.

### 📱 Native Telegram Integration

- **Telegram Theme Engine**: Adapts dynamically to Telegram client color schemes (`bg-tg-bg`, `text-tg-text`, `bg-tg-button`) without harsh borders.
- **Haptic Feedback**: Fine-tuned tactile triggers for selections, correct answers, errors, and button interactions.
- **Telegram Bot Lifecycle**: Compact single-message updates with inline keyboards and automatic message cleanup to keep group chats tidy.
- **Telegram Stars Economy**: Integrated Star payments for Pro verification badges and cosmetic enhancements.

---

## Monorepo Architecture

```
flagora/
├── apps/
│   ├── web/               # Telegram Mini App Frontend (React 18 + Vite + Tailwind CSS)
│   └── server/            # Backend REST API, Bot & WebSockets (Node.js + Express + Socket.IO)
├── packages/
│   └── shared/            # Shared TypeScript contracts, scoring models & flag datasets
├── package.json           # Monorepo root workspace configuration
└── pnpm-workspace.yaml    # Workspace definition
```

### Technology Stack

| Layer                | Technologies                                                                 |
| :------------------- | :--------------------------------------------------------------------------- |
| **Frontend**         | React 18, Vite, TypeScript, Tailwind CSS, Zustand, TanStack Query, Hugeicons |
| **Telegram SDK**     | `@telegram-apps/sdk`, `@telegram-apps/sdk-react`                             |
| **Backend**          | Node.js 20+, Express, TypeScript, Zod                                        |
| **Realtime & Cache** | Socket.IO, Redis (with memory fallback), `@socket.io/redis-adapter`          |
| **Database**         | MongoDB Atlas / Mongoose (with in-memory fallback for local dev)             |
| **Task Queue**       | BullMQ                                                                       |
| **Telegram Bot**     | Telegram Bot API (webhook in production, polling in local dev)               |

---

## Getting Started

### Prerequisites

- **Node.js**: `20.x` or later (tested on Node 20 & 24)
- **pnpm**: `10.x` or later
- **MongoDB**: Local MongoDB instance or MongoDB Atlas URI _(in-memory fallback available for dev)_
- **Redis**: Local Redis instance or Redis Cloud URI _(optional in dev; falls back to in-memory)_

### Installation

Clone the repository and install all workspace dependencies:

```bash
git clone https://github.com/newt-ops/Flagora.git
cd flagora
pnpm install
```

### Environment Configuration

Create a `.env` file in `apps/server/`:

```env
PORT=3001
NODE_ENV=development
BOT_TOKEN=your_telegram_bot_token
BOT_USERNAME=FlagoraBot
MINI_APP_URL=http://localhost:5173
MONGODB_URI=mongodb://localhost:27017/flagora
REDIS_URL=redis://localhost:6379
SESSION_SECRET=your_secure_random_session_secret
```

Create a `.env` file in `apps/web/`:

```env
VITE_API_URL=http://localhost:3001
VITE_BOT_USERNAME=FlagoraBot
```

### Running Locally

To start both the frontend and backend services in parallel:

```bash
pnpm dev
```

Or run services individually:

```bash
# Start backend server (http://localhost:3001)
pnpm --filter @flagora/server dev

# Start web client (http://localhost:5173)
pnpm --filter @flagora/web dev
```

### Browser Testing Mode

You do not need an active Telegram client to test the Mini App locally. Open your browser and navigate to:

```
http://localhost:5173/?browser=true
```

The application will automatically inject mock Telegram user authentication and native theme properties. You can also specify custom player credentials:

```
http://localhost:5173/?browser=true&name=PlayerOne&userId=1001
```

---

## Building & Verification

### Build for Production

```bash
pnpm build
```

This compiles `@flagora/shared`, type-checks `@flagora/server`, and creates the production bundle for `@flagora/web` in `apps/web/dist`.

### Testing

Run the full automated test suite across all packages:

```bash
pnpm test
```

### Code Formatting & Linting

```bash
# Lint all workspaces
pnpm lint

# Check formatting
pnpm format

# Automatically fix formatting issues
pnpm format:fix
```

---

## Deployment Overview

- **Web Frontend**: Deploy `apps/web/dist` as a Single Page Application to [Vercel](https://vercel.com) or [Cloudflare Pages]. The repository includes a preconfigured [vercel.json](vercel.json).
- **Backend API & Bot**: Deploy `apps/server` as a web service on [Render](https://render.com), [Railway](https://railway.app), or Docker containers.

---

## License

This project is licensed under the [MIT License](LICENSE).
