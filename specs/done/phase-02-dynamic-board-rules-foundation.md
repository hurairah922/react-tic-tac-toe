# Phase 2: Dynamic Board Rules Foundation

## Status

Done

## Summary

Refactored the game logic so board size and win length are configurable instead of fixed to the original classic board.

## What Shipped

- Dynamic board-size support in core gameplay rules.
- Configurable win-length handling.
- Winner detection that works beyond `3x3`.
- Winning-line highlighting for supported boards.
- Draw detection for supported boards.
- Time-travel compatibility with the updated rules.

## Acceptance Criteria Covered

- `3x3` still works exactly as before.
- `4x4` can detect `4 in a row`.
- `5x5` can detect `4 in a row` by default.
- Winning-line highlighting works.
- Draw detection works.
- Time travel works.

## Notes

This phase laid the logic foundation required for the board setup UI and future CPU modes.

## Follow-Ups

- Keep new UI layers wired into these shared board rules instead of duplicating logic.
