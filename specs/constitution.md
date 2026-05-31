# Tic-Tac-Toe Game Platform Constitution

## 1. Purpose

This project is a production-ready tic-tac-toe game platform built in phases.

The product must start simple, remain shippable at every phase, and grow into a full game platform with local play, CPU play, saved records, invite links, real-time multiplayer, turn-based multiplayer, accounts, and player stats.

The constitution exists to keep every implementation decision clear for Codex, contributors, and future product work.

## 2. Product Direction

The app is not only a tutorial demo.

It must evolve from a clean React game into a production-ready platform with:

- Local two-player mode on one device.
- Single-player mode against CPU.
- CPU difficulty levels with visible behavior differences.
- Dynamic board size support.
- Optional accounts.
- Guest play.
- Player display names per match.
- Invite-link multiplayer.
- Real-time multiplayer.
- Async turn-based multiplayer.
- Player records and match history.
- Accessible onboarding through a "Learn how to play" modal.

The product must be phased so each feature can be implemented independently without rewriting core game logic.

## 3. Core Product Principles

### 3.1 Ship Small, Keep It Playable

Every phase must leave the game playable.

No feature should break:

- Existing local two-player play.
- Existing time-travel history.
- Winner detection.
- Draw detection.
- Accessibility behavior.
- Responsive layout.

### 3.2 Phased Platform Growth

The product must grow in this order:

1. Strengthen the current local game.
2. Add guided UX and onboarding.
3. Add configurable board rules.
4. Add CPU play.
5. Add local records.
6. Add optional accounts.
7. Add cloud records.
8. Add invite multiplayer.
9. Add real-time multiplayer.
10. Add async turn-based multiplayer.
11. Add rankings, matchmaking, and deeper game economy only after usage validates them.

### 3.3 Free-First Infrastructure

The platform must prefer free-tier infrastructure until usage proves the need for paid hosting.

The default stack should support:

- Free frontend hosting.
- Free SSL.
- Free custom subdomains.
- Free or low-cost auth.
- Free database usage for low traffic.
- Free realtime usage for early multiplayer testing.

Paid infrastructure must only be introduced when one of these conditions is true:

- Free-tier limits are repeatedly exceeded.
- The app becomes a client/commercial production app.
- Realtime multiplayer needs stronger reliability.
- Multiple apps need shared server infrastructure.
- Observability, backups, uptime, or team access require paid features.

### 3.4 No Premature Platform Complexity

Do not add backend infrastructure before it is needed.

Frontend-only features must remain frontend-only.

Examples:

- Learn modal: frontend only.
- CPU mode: frontend only.
- Board size selection: frontend only.
- Local records: browser storage first.
- Cloud records: backend only when accounts exist.
- Multiplayer: backend only when invite or real-time play starts.

## 4. Scope Rules

### 4.1 In Scope

The platform scope includes:

- Local two-player mode.
- CPU/single-player mode.
- Invite-link multiplayer.
- Real-time multiplayer.
- Async turn-based multiplayer.
- Optional accounts.
- Guest mode.
- Per-match editable display names.
- Stats and records.
- Match history.
- Board-size-specific stats.
- CPU-difficulty-specific stats.
- Learn how to play modal.
- Customizable board sizes.
- Dynamic game-rule engine.
- Mobile-responsive UI.
- Accessible controls.
- Production deployment through subdomains.

### 4.2 Out of Scope Until Later

The following must not be built before the core platform is stable:

- Public matchmaking.
- Public chat.
- Friend lists.
- Paid accounts.
- In-app purchases.
- Tournaments.
- Spectator mode.
- Moderation dashboards.
- Native mobile apps.
- Complex avatar systems.
- AI-generated coaching.

These may be added later only after core gameplay, records, and multiplayer are reliable.

## 5. Game Modes

### 5.1 Local Two-Player Mode

Two players must be able to play on the same device.

Requirements:

- No account required.
- No backend required.
- X and O alternate turns.
- Game state must use immutable history.
- Time travel must continue to work.
- Reset must clear the current match safely.
- History branching must truncate future moves when a player returns to a previous move and plays again.

### 5.2 Single-Player vs CPU

A player must be able to play against a CPU opponent.

The CPU must not use a paid AI API.

CPU behavior must use deterministic game algorithms and controlled randomness inside the app.

Minimum CPU levels:

- Easy: mostly random valid moves.
- Medium: mixed strategy with deliberate mistakes.
- Hard: optimal or near-optimal play using minimax or equivalent search for supported board sizes.
- Expert: reserved for later; no need to build immediately, but architecture must not block it.

CPU mode must support:

- Player chooses X or O where possible.
- First-turn variation.
- Randomized but valid move timing.
- Difficulty behavior that users can actually feel.
- No impossible delays.
- No backend dependency.

### 5.3 Invite-Link Multiplayer

Players must be able to create a match and invite another player with a share link.

Requirements:

- Guest players allowed.
- Accounts optional.
- Room/match ID must not expose sensitive data.
- Match state must be validated server-side once backend exists.
- Invite links must support active matches.
- Expired, completed, or invalid rooms must show a clear message.

### 5.4 Real-Time Multiplayer

Real-time multiplayer must allow two players on different devices to play the same match live.

Requirements:

- Server-authoritative move validation.
- Realtime board updates.
- Reconnect handling.
- Duplicate move protection.
- Turn validation.
- Match completion persistence.
- Basic stale room cleanup.
- No chat in the first real-time version.

### 5.5 Async Turn-Based Multiplayer

Async multiplayer must allow players to take turns without staying online at the same time.

Requirements:

- Persistent match state.
- Clear current-turn indicator.
- Match resume support.
- Optional account support for better persistence.
- Guest async support only if technically safe and simple.
- X/O first-turn variation.

## 6. Board and Rule Engine

### 6.1 Supported Board Sizes

Initial supported sizes:

- 3x3
- 4x4
- 5x5

The game logic must be dynamic enough to support N x N later.

No code should assume only nine squares.

### 6.2 Win Conditions

Default win condition:

- 3x3: 3 in a row.
- 4x4: 4 in a row.
- 5x5: 4 in a row by default, because 5 in a row can make games slower and less approachable.

The rules engine must support custom win length later.

Win detection must support:

- Rows.
- Columns.
- Diagonals.
- Anti-diagonals.
- Variable board size.
- Variable win length.
- Winning-line highlighting.

### 6.3 Turn Rules

The app must support first-turn variation.

Modes may define who starts:

- Default classic mode: X starts.
- Variant mode: X or O may start.
- Multiplayer mode: starter may be randomly assigned or configured.
- CPU mode: player may choose who starts where supported.

The UI must clearly show who starts and whose turn it is.

## 7. Accounts and Identity

### 7.1 Account Policy

Accounts must be optional.

Users must be able to play without signing in.

Accounts should unlock:

- Saved records.
- Match history.
- Cross-device stats.
- Persistent display name.
- Multiplayer identity.
- Future leaderboards.

### 7.2 Guest Mode

Guest users must be supported.

Guest mode must allow:

- Local play.
- CPU play.
- Basic invite play where possible.
- Temporary display name.

Guest mode may limit:

- Long-term history.
- Cross-device records.
- Leaderboards.
- Async match recovery.

### 7.3 Auth Options

Use free-friendly auth options first.

Preferred options:

- Google OAuth if free under the chosen auth provider.
- GitHub OAuth if free under the chosen auth provider.
- Email magic link if free and reliable.
- Username-only guest mode with no password.

Apple sign-in is optional and should not be prioritized unless the chosen platform supports it cleanly at no extra cost.

### 7.4 Player Names

Players may have:

- A profile name from account identity.
- An editable display name per match.

Per-match display names must not permanently overwrite account profile names unless the user explicitly saves the change.

## 8. Progress, Records, and Stats

The platform must eventually track:

- Wins.
- Losses.
- Draws.
- Win streaks.
- Match history.
- CPU difficulty records.
- Multiplayer records.
- Board-size-specific stats.
- Player symbol stats for X and O.
- First-turn stats.

Stats must distinguish between:

- Local two-player matches.
- CPU matches.
- Invite multiplayer matches.
- Real-time multiplayer matches.
- Async matches.

Local-only records may use browser storage.

Cloud records require account identity or a safe guest identity strategy.

## 9. UX Principles

### 9.1 Simple First Screen

The game must remain easy to start.

The first screen should not overwhelm the user with advanced options.

Recommended entry options:

- Play local.
- Play vs CPU.
- Invite friend.
- Learn how to play.

Advanced options should sit behind settings or mode setup screens.

### 9.2 Learn How to Play

The first immediate feature is the "Learn how to play" modal.

The modal must explain:

- Goal of the game.
- X and O turns.
- How to win.
- Draws.
- Move history.
- Board-size variations, if enabled.
- CPU mode, if enabled later.
- Multiplayer basics, if enabled later.

The modal must be:

- Accessible.
- Keyboard usable.
- Dismissible.
- Mobile-friendly.
- Written in simple language.
- Safe to show before advanced features exist.

### 9.3 Accessibility

The app must preserve and improve accessibility.

Requirements:

- Semantic buttons for squares.
- Clear ARIA labels.
- `aria-live` for status updates.
- Visible keyboard focus states.
- Keyboard playable board.
- Modal focus trap.
- Escape key closes modal.
- Modal returns focus to the opener when closed.
- Color must not be the only way to show state.

### 9.4 Responsive Design

The game must work on:

- Mobile phones.
- Tablets.
- Desktop screens.

Board layout must remain usable for 3x3, 4x4, and 5x5.

## 10. Engineering Principles

### 10.1 Component Boundaries

Core UI should stay componentized.

Existing components:

- `Game`
- `Board`
- `Square`
- `StatusPanel`
- `MoveHistory`

Future components should be added for clear responsibilities:

- `LearnModal`
- `ModeSelector`
- `BoardSizeSelector`
- `CpuDifficultySelector`
- `PlayerSetup`
- `MatchInvitePanel`
- `StatsPanel`

### 10.2 Game Logic Isolation

Game logic must stay outside UI components.

Rules should live in utility modules such as:

- `src/utils/gameLogic.js`
- `src/utils/cpuPlayer.js`
- `src/utils/boardRules.js`
- `src/utils/matchState.js`

UI components must call these utilities instead of duplicating logic.

### 10.3 State Management

Current local state is acceptable for early phases.

State must remain predictable and serializable.

Match state should support future persistence.

The match state model should include:

- Board size.
- Win length.
- Board cells.
- Current player.
- Starting player.
- Move history.
- Winner.
- Winning line.
- Draw status.
- Mode.
- Player identities.
- Timestamps when needed.

### 10.4 Backend Boundary

No backend dependency should be introduced for local-only features.

When backend is added, it should be isolated behind service modules such as:

- `src/services/authService.js`
- `src/services/matchService.js`
- `src/services/statsService.js`
- `src/services/realtimeService.js`

UI must not directly contain backend query details.

### 10.5 No Paid AI for CPU Mode

CPU mode must use local algorithms.

Do not call paid AI APIs for gameplay decisions.

Acceptable CPU strategies:

- Random valid move.
- Win-now detection.
- Block-opponent detection.
- Fork creation.
- Fork blocking.
- Center/corner preference.
- Minimax for 3x3.
- Depth-limited search or heuristics for larger boards.

### 10.6 Performance Rules

The app must stay fast on low-end devices.

Frontend CPU work must avoid blocking the UI.

For 3x3, minimax is safe in the browser.

For 4x4 and 5x5, full minimax may become expensive and should use heuristics or depth limits.

Minimum target client device:

- Modern mobile browser.
- Low-end laptop.
- 2 GB RAM device.

Minimum server target for a small multi-app Lightsail deployment:

- 1 GB RAM recommended minimum.
- 1 vCPU acceptable for low traffic.
- 2 vCPU preferred when hosting multiple apps, Node services, database, and reverse proxy together.
- 512 MB RAM is not recommended for multiple production apps.

## 11. Infrastructure Principles

### 11.1 Default Free-First Stack

Default early stack:

- React frontend.
- Netlify or Vercel for frontend hosting.
- Custom subdomain under existing domains.
- Managed SSL.
- Supabase free tier for optional auth, database, and realtime when backend is needed.

### 11.2 Subdomain Strategy

The app may use subdomains such as:

- `tic-tac-toe.maneuvrez.com`
- `game.maneuvrez.com`
- `play.maneuvrez.com`
- `ttt.abuhurarrah.com`
- `play.abuhurarrah.com`

Subdomain naming must be stable before production launch.

### 11.3 Lightsail Strategy

Lightsail should be treated as a later option, not the first deployment target.

Use Lightsail when:

- Multiple apps need one shared server.
- Fixed monthly cost matters more than managed convenience.
- Custom backend control is required.
- The developer is ready to manage server security, backups, SSL, deploys, monitoring, and recovery.

For multiple small apps, use at least:

- 1 GB RAM for light use.
- 2 GB RAM when running several Node apps plus database.
- Nginx reverse proxy.
- PM2 or equivalent process manager.
- Automated SSL renewal.
- Regular backups.

## 12. Testing Standards

Every feature must include relevant tests or manual verification notes.

Minimum test coverage areas:

- Winner detection.
- Draw detection.
- Winning-line detection.
- Board-size rules.
- Win-length rules.
- Move history.
- Time travel.
- History truncation after branching.
- CPU move validity.
- CPU difficulty behavior.
- Modal accessibility.
- Match state serialization.
- Multiplayer move validation once backend exists.

No feature is complete if it only works in the happy path.

## 13. Release Standards

A feature is production-ready only when:

- It works on mobile and desktop.
- It does not break existing game modes.
- It has clear UI states.
- It handles empty, loading, error, and completed states where relevant.
- It preserves accessibility.
- It has simple user-facing copy.
- It has no console errors.
- It has no dead controls.
- It has no unused major code paths.
- It has clear implementation notes in specs when needed.

## 14. Current Priority

The current active feature is:

`Learn how to play modal`

This feature is selected because it is simple, frontend-only, low risk, and useful for learning the phased development workflow.

It must be completed before CPU mode, custom board size, accounts, or multiplayer work starts.

## 15. Decision Rule

When there is uncertainty, choose the option that keeps the app:

1. Playable.
2. Simple.
3. Free to run at low traffic.
4. Easy for Codex to implement.
5. Easy to test.
6. Ready for phased expansion.

