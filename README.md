# Tic-Tac-Toe Game Platform

This project started from the official React tic-tac-toe tutorial and is now being expanded into a phased, production-ready tic-tac-toe game platform.

The product direction is defined in `specs/constitution.md`: ship small, keep the game playable at every phase, avoid premature backend complexity, and grow from a clean local game into a platform with onboarding, configurable rules, CPU play, records, accounts, and multiplayer.

## Current Scope

The current app is a frontend-only React game with:

- Local two-player tic-tac-toe on one device.
- Immutable move history and time travel.
- Future-history truncation after branching from an earlier move.
- Winner detection, draw detection, and winning-line highlighting.
- Move coordinates in history.
- Reset control.
- History order toggle.
- Accessible status, controls, board labels, and keyboard focus styles.
- Responsive desktop/mobile layout.
- Accessible "Learn how to play" modal with visual winning pattern examples.

No backend, accounts, CPU mode, custom board sizes, records, or multiplayer are implemented yet.

## Game Controls and Status Chips

The game summary/status chip row is the primary place for both viewing and updating active game settings.

The chips show the current game configuration, including the selected mode, board, player state, and CPU difficulty where relevant. Interactive chips let players change those settings directly from the always-visible status area instead of using a separate setup panel.

This keeps the most important game controls in one consistent location, reduces duplicated UI, and makes the game easier to understand while playing.

## Active Feature

The active feature is documented in `specs/features/active.md`.

Current active feature:

- `Learn How to Play Modal`

This modal explains the current 3x3 game, including turns, winning lines, draw condition, move history/time travel, reset behavior, and visual examples of horizontal, vertical, and diagonal wins.

## Product Principles

- Keep every phase playable and deployable.
- Preserve local two-player gameplay, time travel, winner detection, draw detection, accessibility, and responsive layout.
- Implement one active feature at a time.
- Keep frontend-only features frontend-only.
- Do not add backend infrastructure until accounts, cloud records, or multiplayer require it.
- Prefer free-tier infrastructure until real usage justifies paid services.

## Roadmap

Planned growth follows the phased specs:

1. Strengthen the current local game.
2. Add guided UX and onboarding.
3. Add dynamic board rules and supported board sizes.
4. Add CPU play with local algorithms.
5. Add local records.
6. Add optional accounts.
7. Add cloud records.
8. Add invite-link multiplayer.
9. Add real-time multiplayer.
10. Add async turn-based multiplayer.
11. Add rankings, matchmaking, and larger growth features only after core usage validates them.

## Tech Stack

- React 19.
- JavaScript.
- CSS in `src/styles.css`.
- Componentized UI in `src/components`.
- Game logic utilities in `src/utils`.
- Frontend-only architecture for the current phase.

Important files:

- `src/components/Game.js`
- `src/components/Board.js`
- `src/components/Square.js`
- `src/components/StatusPanel.js`
- `src/components/MoveHistory.js`
- `src/components/LearnModal.js`
- `src/utils/gameLogic.js`
- `src/styles.css`
- `specs/constitution.md`
- `specs/roadmap.md`
- `specs/tech-stack.md`
- `specs/phases.md`
- `specs/features/active.md`

## Development

Install dependencies:

```bash
npm install
```

Run locally:

```bash
npm start
```

Run tests:

```bash
npm test
```

Build for production:

```bash
npm run build
```

## Implementation Rules

Before implementing a feature, read:

- `specs/constitution.md`
- `specs/roadmap.md`
- `specs/tech-stack.md`
- `specs/phases.md`
- `specs/features/active.md`

Only implement the active feature unless explicitly instructed otherwise.

Do not add CPU mode, custom board sizes, accounts, saved records, multiplayer, or backend services unless they are the active feature.

## Source

Original learning foundation:

https://react.dev/learn/tutorial-tic-tac-toe
