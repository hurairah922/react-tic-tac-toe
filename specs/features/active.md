# Active Feature: Dynamic Board Rules Foundation

## Status

Active

## Phase

Phase 2: Dynamic Board Rules Foundation

## Goal

Refactor the core tic-tac-toe game logic so board sizes and win lengths can be dynamic.

This phase prepares the app for future 4x4 and 5x5 board support, but it does not add the board-size selection UI yet.

## User Value

The current 3x3 game keeps working exactly as before, while the codebase becomes ready for larger boards and custom win rules in future phases.

## Scope

Implement:

- Dynamic board-size support in game logic.
- Dynamic win-length support in game logic.
- A reusable winner calculation function that works for:
  - 3x3 with 3 in a row.
  - 4x4 with 4 in a row.
  - 5x5 with 4 in a row by default.
- Dynamic draw detection.
- Winning-line detection that returns the exact winning cell indexes.
- Board rendering that can support dynamic square counts.
- Internal constants/config for current board settings.
- Preserve the current visible game as 3x3 only.

## Current Runtime Behavior

The app should still behave like the current 3x3 game.

Do not add a board-size selector yet.

Use default config:

```txt
boardSize = 3
winLength = 3