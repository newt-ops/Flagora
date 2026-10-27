# Changelog

All notable changes to the Flagora project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [2.2.0] - 2026-10-27

### 🌟 Alive Animated UI, Fantasy World Map & Custom Group Lobbies

Flagora v2.2 introduces an alive, responsive UI animation engine, dynamic zooming fantasy continent maps, customizable multiplayer group lobby presets, simplified Elo battle rating, and complete elimination of harsh white borders in favor of native Telegram dark mode tokens.

### Key Features & Capabilities

#### 🗺️ Custom Group Battle Lobbies & Fantasy Map

- **Custom Group Battle Settings (`GroupBattleCustomModal`)**:
  - Hosts can configure match parameters before launching: continent selection (`world`, `africa`, `asia`, `europe`, `americas`, `oceania`), flag count (5 to 30 flags), and match duration (15s to 300s).
  - Server validation and persistence of custom battle presets in MongoDB and Redis sessions.
- **Fantasy Interactive World Map (`ContinentMap`)**:
  - Dynamic continent camera zoom with smooth SVG projection translations (`center` and `scale`).
  - Interactive continent selection HUD detailing sovereign country counts, regional lore, and localized highlights.
  - Atmospheric ambient aura glow and reactive styling for selected geographic zones.

#### 🎨 Alive UI Engine & Micro-Animations

- **Canvas Confetti Particle System (`ConfettiCanvas`)**:
  - Native 60fps canvas particle confetti engine with velocity, gravity, wobble, and decay for match completions, personal bests, and podium finishes.
- **Micro-Animation Framework**:
  - High-performance CSS micro-animations: `animate-coin-bounce`, `animate-flame-flicker`, `animate-pulse-subtle`, `animate-rays-rotate`, `animate-shake`, and `animate-float`.
  - Rolling numerical ticker (`AnimatedCounter`) for smooth score and rating increments.
- **Unified Animated Modal & Notification System**:
  - Base `AnimatedModal` with backdrop blur, spring entry (`animate-modal-in`), and full reduced-motion accessibility support.
  - Specialized modal implementations: `ConfirmationModal`, `RewardModal`, `ProUpgradeModal`, and `CustomGameModal`.
  - Redesigned pill-style `ToastNotification`: Compact floating badge with Telegram blur effects, spring slide-down animation, automatic copy-to-clipboard detection, and non-blocking interaction.
  - Centered dot-pulse loader (`ButtonLoader` & `loading-dots-container`) to replace distorted full-icon rotation during async actions.

#### 🏆 Ranked System Simplification & Visual Polish

- **Direct Elo Battle Rating**:
  - Completely removed artificial league tier brackets (`Bronze`, `Silver`, `Gold`, `Platinum`, `Diamond`, `Legend`) and tier badge visuals across frontend and backend.
  - Streamlined ranked progression to focus strictly on pure **numerical Battle Rating (Elo)** and global **Leaderboard Rank**.
- **Apple UI & Native Telegram Border Overhaul**:
  - Eliminated all harsh white borders (`border-white`, `border-white/80`) across modals, lobby screens, and profile cards.
  - Replaced with Telegram theme variables (`border-tg-secondary-bg`, `border-tg-section`) for seamless native Apple UI dark mode integration.
  - Modernized Profile and Results screens with native Telegram tokens, dedicated SVG metric icons, and high-contrast typography.

#### 🧪 Developer Experience & Testing Infrastructure

- **Seamless Browser Testing Mode**:
  - Mini App can be loaded directly in browser with `?browser=true` or localhost hostname.
  - Automatic injection of Telegram theme custom properties (`applyBrowserMockTheme`) and mock user profile query parameters (`userId`, `name`).
  - In-memory MongoDB server fallback (`mongodb-memory-server`) during local development and testing when external database is unreachable.

---

## [2.1.0] - 2026-10-11

### ⚔️ Telegram Group Multiplayer Battles & Real-Time Sync

Flagora v2.1 delivers real-time group multiplayer battles natively integrated into Telegram group chats, supported by live WebSockets, race-safe lobby management, and interactive winner podiums.

### Key Features & Capabilities

#### 🎮 Real-Time Group Multiplayer Engine

- **Group Multiplayer Battle Lobbies**:
  - Real-time battles supporting multiple players (up to 10+ participants) initiated directly in Telegram group chats.
  - Race-safe MongoDB atomic operations and Redis locks preventing double-joins or concurrent state corruption.
  - Synchronized question generation ensuring all group participants face the identical flag sequence and distractors.
- **Live Waiting & Spectator Screen**:
  - Live participant progress tracking displaying completed flags, live scores, and finished status in real-time.
  - Dedicated spectator view for participants waiting for other players to finish their runs before final results.
- **Interactive Multiplayer Podium (`BattleResultScreen`)**:
  - Dynamic 1st, 2nd, and 3rd place animated podium celebrating top performers.
  - Detailed score breakdown, individual participant statistics, and tiered Pin currency payouts.

#### 🤖 Telegram Bot Group Lifecycle Management

- **Group Command Registration**:
  - Dedicated group commands: `/battle`, `/battle_custom`, `/stats`, `/leaderboard`.
  - Group mention handling (`@FlagoraBot battle`).
- **Single-Message Lifecycle & Anti-Spam**:
  - Updates existing group chat announcements in-place to prevent notification spam, automatically cleaning up finished battle messages.
  - Silent alert notifications (`disable_notification: true`) for non-intrusive group updates.

#### 🛡️ Reliability & Compliance

- **Race Condition Fixes**:
  - Fixed edge cases in group battle finalization when multiple participants submit their final flag simultaneously.
  - Fixed active run persistence to prevent duplicate run IDs or dangling sessions.
- **Zero-Emoji Compliance**:
  - Enforced strict zero-emoji policy across all web mini app multiplayer battle interfaces, replacing all emojis with Hugeicons Stroke-Rounded icons.

---

## [1.0.0] - 2026-10-10

### 🏁 Flagora v1.0 — Initial Official Release

Flagora v1.0 is the complete, production-grade release of the fast-paced, competitive country-flag identification quiz game natively built for the **Telegram Mini App** ecosystem.

### Key Features & Capabilities

#### 🎮 Core Gameplay Engine

- **194 Sovereign Countries**: Full international coverage with authentic SVG vector flag rendering across 4 calibrated difficulty tiers.
- **Server-Authoritative Anti-Cheat**: Questions, answer keys, combo multipliers, and leftover time bonuses are resolved securely on the backend.
- **Fluid Timer & Live Combos**: Continuous countdown with instant feedback, showing the correct answer alongside incorrect choices for seamless learning.
- **Multi-Factor Scoring**: Base points, speed tier bonuses, combo multipliers (up to 3.0x), and leftover time bonuses.

#### 🕹️ Game Modes

- **Solo Practice Mode**: Standard 60-second calibrated run with dynamic question progression across world tiers.
- **Custom Mode**: Configurable continent selection (Americas, Europe, Africa, Asia, Oceania, World), customizable question counts, and flexible durations (30s, 60s, 90s, 120s).
- **Daily Challenge**: Unified daily synchronized seed for all global players, awarding bonus XP, pins, and daily streak progression with deduplicated single-attempt tracking.
- **1v1 Asynchronous Friend Challenges**: Generate deep-linked challenge cards to share directly with friends via Telegram chats.
- **Live Real-Time Multiplayer Battles**: Head-to-head live matches orchestrated over WebSockets (Socket.IO) backed by Redis presence tracking and real-time score streaming.

#### 🏆 Ranked Seasons & Leaderboards

- **Elo-Based Rating System**: Skill rating system with dynamic tier categorization (Bronze, Silver, Gold, Platinum, Diamond, Legend).
- **Multiple Leaderboards**: Global all-time, Seasonal ranked, and Daily Challenge leaderboards with pinned user rank deduplication.
- **Promotion Detection**: Visual fanfare and notifications when promoting to higher leagues.

#### 💎 Economy, Retention & Monetization

- **Currency System**: Earn Pins and XP through runs, challenges, and daily activities.
- **Daily Login Streaks & Streak Saves**: Track consecutive active days with streak-freeze protections (costing pins or free for Pro members).
- **Telegram Star Store**: Integrated Star payments via Telegram Stars for Pro verification checkmarks and premium cosmetic packs.
- **Verified Pro Status**: Star-shaped verified checkmark badge with gold gradient styling and exclusive perks.
- **Cosmetic Personalization**: Avatar frames, player titles, customizable badge showcases, and achievement pins.

#### 📱 Native Telegram Integration

- **Apple UI / Telegram Guidelines**: Seamless theming using Telegram CSS tokens (`bg-tg-bg`, `bg-tg-button`, `text-tg-button-text`, etc.) without harsh borders or non-native colors.
- **Haptic Feedback**: Fine-tuned haptic triggers (`impact`, `notification`, `selection`) across answer choices and button interactions.
- **Safe Area & Fullscreen Adaptation**: Responsive top and bottom notch padding adapting dynamically to mobile and desktop Telegram clients.

#### ⚙️ Infrastructure & Reliability

- **Monorepo Architecture**: Clean separation into `@flagora/server`, `@flagora/web`, and `@flagora/shared`.
- **Horizontal Scalability**: Stateless API design ready for multi-instance scaling via Render and Redis adapters.
- **Comprehensive Test Suites**: Over 360 unit and integration tests passing across server and web clients, backed by k6 load test scenarios.
