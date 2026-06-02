# Active Feature Spec

## Phase 6: Match Flow Improvements

Status: `Active`

## Goal

Improve the match flow so both players get fair first-move chances, completed games have a clear restart action, and mobile gameplay stays visually stable while move history updates.

## Scope

This phase updates the local gameplay loop only.

It should not add accounts, backend storage, online multiplayer, paid AI, or persistent cloud history.

## Requirements

### Starting Player

- The app must support fair first-move rotation between matches.
- Use alternating starters by default.
- The starting player must switch after each completed match.
- The starting player should reset only when the user changes major match setup options such as board size or game mode.
- The UI must clearly show whose turn it is at match start.

### New Game Flow

- When a match ends in a win or draw, show a New Game button.
- The New Game button must start a clean match.
- New Game must preserve the current board size.
- New Game must preserve the current game mode.
- New Game must use the next alternating starting player.
- New Game must clear the board.
- New Game must clear current move history for the new match.
- New Game must not clear local records or stats.

### Mobile Layout Stability

- The board must not visually jump or jerk when a player makes a move.
- Move history updates must not push the board or main controls around during play.
- On small screens, reserve space for move history or make move history scroll inside a stable container.
- The game board squares must keep stable dimensions after each move.
- The layout must remain usable below 475px screen width.

## Acceptance Criteria

- Player X and Player O alternate as the starting player across completed matches.
- The current starting player is visible before the first move.
- After a win, the New Game button appears.
- After a draw, the New Game button appears.
- Clicking New Game starts a clean match with the same board size and mode.
- Clicking New Game advances to the next starting player.
- Move history starts empty for the new match.
- Local records are not reset by New Game.
- On mobile, making a move does not cause visible page jump.
- The board remains stable while move history grows.

## Non-Goals

- Do not add online multiplayer.
- Do not add authentication.
- Do not add backend records.
- Do not redesign the whole UI.
- Do not change the phase tracking format.
- Do not remove existing board size behavior.
- Do not clear local records when starting a new game.

## Implementation Notes

- Prefer a small, explicit state value for the next starting player.
- Use the completed match event to rotate the next starter.
- Avoid deriving the starter from move count alone.
- Keep reset behavior separate from New Game behavior.
- New Game should reset match state, not app-wide settings.
- For mobile stability, avoid layout shifts caused by dynamically expanding move history.
- Consider fixed/minimum height or scrollable move history container.