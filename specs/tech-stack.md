# Tic-Tac-Toe Tech Stack

## Stack Strategy

Use a free-first stack for the early product.

Do not add backend infrastructure until a feature requires it.

The first production-ready version should run at $0/month under low traffic.

## Current Frontend

Required stack:

- React 19.
- JavaScript.
- CSS in `src/styles.css` unless the project intentionally adopts another styling system.
- Componentized UI.
- Utility-based game logic modules.

Current important files/components:

- `src/components/Game.jsx`
- `src/components/Board.jsx`
- `src/components/Square.jsx`
- `src/components/StatusPanel.jsx`
- `src/components/MoveHistory.jsx`
- `src/utils/gameLogic.js`
- `src/styles.css`

Future recommended additions:

- `src/components/LearnModal.jsx`
- `src/components/ModeSelector.jsx`
- `src/components/BoardSizeSelector.jsx`
- `src/components/CpuDifficultySelector.jsx`
- `src/components/PlayerSetup.jsx`
- `src/components/StatsPanel.jsx`
- `src/utils/boardRules.js`
- `src/utils/cpuPlayer.js`
- `src/utils/matchState.js`
- `src/services/authService.js`
- `src/services/matchService.js`
- `src/services/statsService.js`
- `src/services/realtimeService.js`

## Frontend Hosting

Preferred free-first options:

- Netlify.
- Vercel.

Use one of these for:

- Static React deployment.
- Managed HTTPS.
- Custom subdomains.
- Git-based deploys.

Recommended subdomains:

- `tic-tac-toe.maneuvrez.com`
- `game.maneuvrez.com`
- `play.maneuvrez.com`
- `ttt.abuhurarrah.com`
- `play.abuhurarrah.com`

## Backend Strategy

Backend must be introduced only when required.

Backend is not required for:

- Local two-player mode.
- Learn how to play modal.
- Dynamic board sizes.
- CPU opponent.
- Local records.

Backend is required for:

- Optional cloud accounts.
- Cross-device records.
- Invite-link multiplayer.
- Real-time multiplayer.
- Async multiplayer.
- Shared leaderboards.

## Preferred Backend for Early Production

Use Supabase first if it remains free enough for early usage.

Supabase can provide:

- Auth.
- Postgres database.
- Row Level Security.
- Realtime subscriptions.
- Basic storage if later needed.

Use free-tier-friendly auth methods first:

- Google OAuth.
- GitHub OAuth.
- Email magic link.
- Guest mode without account.

Do not require paid auth providers for the initial platform.

## Alternative Backend Options

### Firebase

Good for:

- Auth.
- Realtime database patterns.
- Fast prototyping.

Trade-offs:

- Pricing can become harder to predict.
- Data modeling differs from relational match/history needs.

### Socket.io + Node

Good for:

- Full custom real-time control.
- Hosting many apps on one VPS.
- Direct websocket behavior.

Trade-offs:

- Requires server maintenance.
- Requires deployment setup.
- Requires scaling and uptime management.
- Not the best first backend for this project.

### Convex

Good for:

- Realtime app development.
- Fast developer workflow.

Trade-offs:

- Vendor-specific model.
- Needs pricing review before production commitment.

## Lightsail Strategy

Lightsail is a later option for hosting many apps on one predictable server.

Use Lightsail if:

- You want multiple apps under different subdomains.
- You want fixed monthly hosting cost.
- You want direct backend control.
- You are ready to manage infrastructure.

Recommended minimums:

- 1 GB RAM minimum for small production apps.
- 2 GB RAM preferred for multiple apps plus backend services.
- 512 MB RAM is not recommended for multiple production apps.
- 1 vCPU is acceptable for very low traffic.
- 2 vCPU is better when running several Node apps, database, and proxy.

Recommended Lightsail stack:

- Ubuntu Linux.
- Nginx reverse proxy.
- Node.js.
- PM2.
- Let's Encrypt SSL.
- PostgreSQL or SQLite depending on app needs.
- Automated backups.
- Basic monitoring.

## CPU/AI Strategy

Do not use paid AI APIs for tic-tac-toe gameplay.

CPU opponent must use local algorithms.

Recommended CPU logic:

- Easy: random valid move with light preference variation.
- Medium: win/block logic with intentional mistakes.
- Hard: minimax for 3x3; heuristic or depth-limited search for larger boards.
- Expert: future scope only.

This keeps CPU mode:

- Free.
- Fast.
- Offline-capable.
- Predictable.
- Easy to test.

## Data Model Direction

Future backend tables should likely include:

- `profiles`
- `matches`
- `match_players`
- `moves`
- `player_stats`
- `match_invites`

The match model should store:

- Match ID.
- Mode.
- Board size.
- Win length.
- Starting player.
- Current player.
- Board state.
- Winner.
- Winning line.
- Draw status.
- Player IDs or guest IDs.
- Display names.
- Created timestamp.
- Updated timestamp.
- Completed timestamp.

## Security Rules

Backend implementation must include:

- Server-side move validation.
- Row Level Security if using Supabase.
- Private match access rules.
- No trust in client-submitted winner values.
- Rate limiting where available.
- Safe invite tokens.
- No sensitive data in public URLs.

## Cost Policy

Default target:

- $0/month for MVP and low traffic.

Expected paid upgrades:

- Supabase Pro if backend usage grows.
- Vercel/Netlify paid plan if commercial/team limits require it.
- Lightsail if many apps should share one VPS.

Do not optimize for large-scale traffic before the game has real users.

