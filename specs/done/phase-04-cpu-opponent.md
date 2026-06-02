# Phase 4: CPU Opponent

## Status

Done

## Summary

Added a browser-only CPU opponent with selectable difficulty levels while preserving the existing local two-player game flow.

## What Shipped

- A game mode selector for `Human vs Human` and `Human vs CPU`.
- CPU difficulty controls for `Easy`, `Medium`, and `Hard`.
- A pure CPU move-selection helper kept outside the UI layer.
- Local-only CPU turns with no backend, API, or external service dependency.
- Valid CPU move selection that only targets empty squares.
- CPU turn locking so the human cannot play while the CPU is deciding.
- Short delayed CPU turns with stale-turn protection after reset or match-setting changes.
- Status updates for human turn, CPU turn, win state, and draw state.
- Continued support for dynamic board rules:
  - `3x3` uses `3 in a row`
  - `4x4` uses `4 in a row`
  - `5x5` uses `4 in a row`

## Acceptance Criteria Covered

- User can choose `Human vs Human` or `Human vs CPU` mode.
- User can choose CPU difficulty: `Easy`, `Medium`, or `Hard`.
- CPU makes valid moves only.
- CPU never plays on an occupied square.
- CPU only moves when the game is in CPU mode.
- CPU moves after the human player finishes a valid move.
- Human cannot make a move during the CPU turn.
- CPU difficulty behavior differs by level.
- CPU does not require backend, paid AI, or external API.
- Starting a new match keeps the selected mode and difficulty unless the user changes them.
- Changing board size starts a clean match.
- Changing game mode starts a clean match.
- Changing CPU difficulty starts a clean match if CPU mode is active.
- Existing Human vs Human behavior still works.
- Win and draw detection still works with CPU mode enabled.
- Move history still works for the current match.
- Layout remains usable on supported board sizes.

## Notes

The CPU logic reuses the existing winner evaluation and board-rule helpers instead of duplicating game-state analysis in the component layer.

The implemented difficulty behavior is:

- `Easy`: random valid move
- `Medium`: win now, otherwise block, otherwise random
- `Hard`: win now, otherwise block, otherwise prefer center, then corner, then random

## Follow-Ups

- Future phases can expand CPU strength further with deeper search or optional first-player selection.
- Local records and future cloud records should track CPU matches by difficulty and board size.
