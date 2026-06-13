# Tic-Tac-Toe Roadmap

## Roadmap Goal

Build the tic-tac-toe app into a production-ready game platform through small, safe, Codex-friendly phases.

Each phase must leave the app playable and deployable.

## Phase 0: Current Baseline

Status: mostly complete.

Current baseline includes:

- React 19 tic-tac-toe app.
- Componentized structure.
- Local two-player play.
- Immutable game history.
- Time travel.
- Future-history truncation after branching.
- Winner detection.
- Draw detection.
- Move coordinate display.
- Winning-line highlighting.
- Reset control.
- History order toggle.
- Accessibility improvements.
- Responsive layout.
- Early `specs` folder.

Exit criteria:

- Constitution and specs exist.
- Current app still runs.
- Existing gameplay is not broken.

## Phase 1: Learn How to Play Modal

Priority: active.

Goal:

Add an accessible modal that teaches the user how to play.

Scope:

- Add "Learn how to play" trigger.
- Add modal component.
- Explain classic tic-tac-toe rules.
- Explain turns, winning, draw, reset, and move history.
- Keep copy simple.
- Support keyboard navigation.
- Trap focus while modal is open.
- Close with button, backdrop where appropriate, and Escape key.
- Return focus to opener after close.
- Keep the modal mobile-friendly.

Out of scope:

- CPU mode explanation beyond a placeholder if CPU is not built.
- Multiplayer explanation beyond a placeholder if multiplayer is not built.
- Accounts.
- Backend.

Exit criteria:

- Modal opens and closes reliably.
- Modal is keyboard accessible.
- Modal does not break game state.
- Modal works on mobile and desktop.
- No backend is introduced.

## Phase 2: Dynamic Board Rules Foundation

Goal:

Prepare the game for board sizes beyond 3x3.

Scope:

- Refactor game logic to support dynamic board size.
- Support 3x3, 4x4, and 5x5.
- Support configurable win length internally.
- Keep 3x3 as default.
- Preserve move history and time travel.
- Preserve winning-line highlighting.
- Preserve draw detection.

Default rules:

- 3x3 uses 3 in a row.
- 4x4 uses 4 in a row.
- 5x5 uses 4 in a row by default.

Exit criteria:

- All supported board sizes are playable.
- Winner detection works for rows, columns, diagonals, and anti-diagonals.
- Move history works with all supported board sizes.
- UI remains usable on mobile.

## Phase 3: Board Setup UI

Goal:

Let users choose board size and rule presets.

Scope:

- Add board size selector.
- Add clear display of selected rules.
- Reset match safely when board size changes.
- Keep advanced custom rules hidden until needed.

Out of scope:

- Fully custom N x N UI.
- Custom win-length UI unless simple and safe.

Exit criteria:

- User can choose 3x3, 4x4, or 5x5.
- App explains the win condition.
- Existing game mode still works.

## Phase 4: CPU Opponent

Goal:

Add single-player mode against a local CPU opponent.

Scope:

- Add mode selection: local two-player or vs CPU.
- Add difficulty selection.
- Add Easy difficulty.
- Add Medium difficulty.
- Add Hard difficulty.
- Add CPU move delay.
- Prevent human moves while CPU is thinking.
- Keep CPU fully free with local algorithms.

Difficulty behavior:

- Easy: mostly random valid moves.
- Medium: sometimes blocks and wins, sometimes makes mistakes.
- Hard: optimal for 3x3 where feasible; heuristic/depth-limited for larger boards.

Out of scope:

- Paid AI APIs.
- Expert mode implementation.
- Cloud CPU service.

Exit criteria:

- CPU always makes valid moves.
- Difficulty levels feel different.
- CPU mode does not break local two-player mode.
- CPU mode works for supported board sizes with safe performance.

## Phase 5: Local Records

Goal:

Track basic records without accounts or backend.

Scope:

- Store records in browser storage.
- Track wins, losses, draws.
- Track win streaks.
- Track CPU difficulty records.
- Track board-size-specific stats.
- Add reset-local-records control.

Out of scope:

- Cloud records.
- Account sync.
- Global leaderboards.

Exit criteria:

- Records persist after refresh on the same browser.
- Users can clear records.
- Stats distinguish mode, board size, and difficulty.

## Phase 6: Optional Accounts

Goal:

Add optional user accounts for saved records and identity.

Scope:

- Add guest mode preservation.
- Add free-friendly auth provider.
- Add Google/GitHub/email magic link depending on provider support.
- Add account profile name.
- Add editable display name per match.

Out of scope:

- Required login.
- Paid auth provider.
- Complex profiles.
- Avatars unless simple.

Exit criteria:

- User can play without account.
- User can sign in optionally.
- Signed-in records can be saved later.
- Per-match display name works.

## Phase 7: Cloud Records

Goal:

Sync records for signed-in users.

Scope:

- Save match result to backend.
- Save match history.
- Save CPU records.
- Save multiplayer records later.
- Save board-size-specific stats.

Out of scope:

- Public leaderboards.
- Complex ranking systems.

Exit criteria:

- Signed-in user records persist across devices.
- Guest local records remain supported.
- Backend writes are validated.

## Phase 8: Invite-Link Multiplayer

Status: paused for now.

Goal:

Let users invite a friend to a private match.

Scope:

- Create match room.
- Generate invite link.
- Join match from link.
- Allow guest names.
- Validate turns server-side.
- Persist final match result.

Out of scope:

- Public matchmaking.
- Chat.
- Spectators.

Exit criteria:

- Player A can invite Player B.
- Both players see correct board state.
- Invalid or completed rooms show useful messages.

Pause note:

- Hide multiplayer from the user-facing UI until room sync, third-player handling, and invite state recovery are ready.
- Keep any existing implementation behind an internal feature flag instead of exposing partial UX.

## Phase 9: Real-Time Multiplayer

Goal:

Make invite matches update live across devices.

Scope:

- Realtime board updates.
- Presence-lite state.
- Reconnect handling.
- Duplicate move prevention.
- Server-side validation.
- Match completion broadcast.

Out of scope:

- Chat.
- Public matchmaking.
- Anti-cheat beyond move validation.

Exit criteria:

- Moves appear on the other device without manual refresh.
- Reconnect does not corrupt state.
- Invalid moves are rejected.

## Phase 10: Async Turn-Based Multiplayer

Goal:

Allow players to take turns over time.

Scope:

- Persistent active matches.
- Current-turn status.
- Resume match screen.
- First-turn variation.
- Match expiration rules.

Out of scope:

- Push notifications unless free and simple.
- Email notifications unless free and reliable.

Exit criteria:

- Users can leave and resume an async match.
- Current player is clear.
- Completed matches save correctly.

## Phase 11: Growth Features

Goal:

Add features only after core gameplay and multiplayer work.

Potential scope:

- Leaderboards.
- Public matchmaking.
- Rematches.
- Friend lists.
- Player badges.
- Tournaments.
- Spectator mode.
- Chat.

Entry criteria:

- Core gameplay is stable.
- Auth and records are reliable.
- Multiplayer has real usage.
- Infrastructure cost is understood.
