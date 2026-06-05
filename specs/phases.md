# Tic-Tac-Toe Phase Tracking

## Phase Tracking Rules

Each phase must have:

- Clear goal.
- Small scope.
- Explicit out-of-scope items.
- Acceptance criteria.
- Testing notes.
- Current status.

Only one feature should be active at a time unless a dependency requires a small supporting change.

When a phase moves to `Done`, add a matching summary file under `specs/done/` so completed work stays easy to review.

The `specs/done/` directory is shared project documentation. It is not agent-only or manually locked to one person. You and the agent can both update it whenever completed feature details need to be recorded.

## Status Legend

- `Not Started`
- `Active`
- `Blocked`
- `In Review`
- `Done`

## Phase 0: Specs and Baseline

Status: `Done`

Goal:

Document the project direction and preserve the current working baseline.

Deliverables:

- `specs/constitution.md`
- `specs/roadmap.md`
- `specs/tech-stack.md`
- `specs/phases.md`
- `specs/features/active.md`

Acceptance criteria:

- Specs define phased product direction.
- Current app remains playable.
- No gameplay code change required for this phase.

## Phase 1: Learn How to Play Modal

Status: `Done`

Goal:

Add an accessible "Learn how to play" modal.

Scope:

- Add a visible trigger button or link.
- Add modal component.
- Add simple game instructions.
- Add accessible open/close behavior.
- Add mobile-friendly styling.

Out of scope:

- CPU implementation.
- Board-size implementation.
- Accounts.
- Backend.
- Multiplayer.

Acceptance criteria:

- User can open the modal.
- User can close the modal with a close button.
- User can close the modal with Escape.
- Focus moves into the modal when opened.
- Focus returns to the trigger when closed.
- Modal has a clear heading.
- Modal content explains the current game accurately.
- Modal does not reset or mutate game state.
- Modal works on mobile and desktop.

Testing notes:

- Test keyboard-only usage.
- Test screen-reader-friendly labels.
- Test opening during an active match.
- Test closing without changing the board.

## Phase 2: Dynamic Board Rules Foundation

Status: `Done`

Goal:

Refactor core game logic so board sizes and win lengths are dynamic.

Acceptance criteria:

- 3x3 still works exactly as before.
- 4x4 can detect 4 in a row.
- 5x5 can detect 4 in a row by default.
- Winning-line highlighting works.
- Draw detection works.
- Time travel works.

## Phase 3: Board Setup UI

Status: `Done`

Goal:

Allow users to choose supported board sizes.

Acceptance criteria:

- User can select 3x3, 4x4, or 5x5.
- UI explains win condition.
- Changing board size starts a clean match.
- Layout stays usable on mobile.

## Phase 4: CPU Opponent

Status: `Done`

Goal:

Add single-player mode against a free local CPU algorithm.

Acceptance criteria:

- User can choose vs CPU mode.
- User can choose Easy, Medium, or Hard.
- CPU makes valid moves only.
- CPU difficulty behavior differs by level.
- Human cannot move during CPU turn.
- CPU does not require backend or paid AI.

## Phase 5: Local Records

Status: `Done`

Goal:

Track records locally before accounts exist.

Acceptance criteria:

- Wins, losses, and draws are stored locally.
- Win streak is tracked.
- Records separate CPU and local modes.
- Records separate board sizes.
- User can clear local records.

## Phase 6: Match Flow Improvements

Status: `Done`

Goal:

Improve match fairness and post-game flow.

Acceptance criteria:

- Starting player can alternate between matches or be selected randomly.
- Both players get a fair chance to make the first move across repeated games.
- The current starting player is clear before the match begins.
- After a win or draw, a New Game button appears.
- New Game starts a clean match using the current board size and mode.
- Mobile layout does not jump or jerk when move history updates.
- Move history updates without changing the visible board position during play.

## Phase 7: Optional Accounts

Status: `Done`

Goal:

Add optional sign-in while preserving guest play.

Acceptance criteria:

- Guest play still works.
- User can sign in with free-friendly auth.
- User can have profile name.
- User can set display name per match.

## Phase 8: Cloud Records

Status: `Done`

Goal:

Save records and match history for signed-in users.

Acceptance criteria:

- Signed-in records persist across devices.
- Guest records remain local.
- Match results are validated before saving.
- Stats separate mode, board size, and difficulty.


## UX Refinement: Sidebar Controls, Compact History, and Undo

Status: `Active`

Goal:

Improve game usability by keeping the board visible, moving secondary controls into a sidebar, and simplifying time travel.

Acceptance criteria:

- Setup controls and all move into a sidebar or compact panel.
- Setup selections use dropdowns.
- Move history uses a dropdown.
- Undo works for Human vs Human and Human vs CPU.
- New Game appears near the board after game completion.
- Mobile layout keeps the board easy to access.

## Phase 9: Invite-Link Multiplayer

Status: `Not Started`

Goal:

Let a player invite another player to a private match.

Acceptance criteria:

- Player can create an invite match.
- App generates a share link.
- Second player can join through the link.
- Both players have display names.
- Invalid rooms show clear errors.

## Phase 10: Real-Time Multiplayer

Status: `Not Started`

Goal:

Sync active multiplayer matches live across devices.

Acceptance criteria:

- Moves appear live on both devices.
- Server validates turns.
- Reconnect works without corrupting game state.
- Completed match state is saved.

## Phase 11: Async Turn-Based Multiplayer

Status: `Not Started`

Goal:

Allow players to take turns over time.

Acceptance criteria:

- Match can be resumed later.
- Current-turn player is clear.
- Starting player may vary between X and O.
- Completed match is saved.

## Phase 12: Growth Features

Status: `Not Started`

Goal:

Add larger platform features only after core multiplayer works.

Possible future features:

- Leaderboards.
- Public matchmaking.
- Rematches.
- Friend lists.
- Tournaments.
- Spectator mode.

Entry criteria:

- Multiplayer is stable.
- Records are reliable.
- Infrastructure costs are understood.
- Real users justify the feature.
