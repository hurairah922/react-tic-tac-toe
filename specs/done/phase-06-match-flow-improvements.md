# Phase 6: Match Flow Improvements

## Status

Done

## Summary

Improved the local match loop so repeated games feel fairer, post-game restart is clearer, and move history no longer causes the board area to jump around on mobile.

## What Shipped

- Alternating starters between completed matches using explicit round-starter state.
- A visible starting-player indicator before the first move.
- A `New Game` button that appears after wins and draws.
- New rounds that preserve the current board size and game mode.
- New rounds that clear the board and move history without clearing local records.
- A stable move history container with internal scrolling to reduce layout shift on smaller screens.
- A turn notice below the board so the active player is visible close to the squares.
- Learn modal rendering through a portal so the guide opens as a true page-level overlay instead of being constrained by the game card layout.

## Acceptance Criteria Covered

- Player `X` and player `O` alternate as the starting player across completed matches.
- The current starting player is visible before the first move.
- After a win, the `New Game` button appears.
- After a draw, the `New Game` button appears.
- `New Game` starts a clean match with the same board size and mode.
- `New Game` advances to the next alternating starter.
- Move history starts empty for the new match.
- Local records are not reset by `New Game`.
- On mobile, move history grows without visibly shifting the board position.
- The board remains stable while the move list updates.

## Notes

Major setup changes such as board size and game mode still reset the round cleanly, which keeps the flow predictable and avoids carrying stale match state into a new configuration.

The move-history stability fix was kept intentionally small by reserving space and scrolling inside the history card instead of redesigning the full layout.

## Follow-Ups

- If the game later adds player-name setup or side selection, starter messaging may need to move from `X`/`O` wording to player-display-name wording.
- If the Learn guide becomes larger in future phases, it could still be promoted to a dedicated route later, but the current portal-based overlay is enough for this phase.
