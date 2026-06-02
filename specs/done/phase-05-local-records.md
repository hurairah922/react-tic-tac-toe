# Phase 5: Local Records

## Status

Done

## Summary

Added browser-persisted local record tracking so players can see match results over time without needing accounts, backend services, or cloud storage.

## What Shipped

- Local records persisted with browser `localStorage`.
- Record buckets separated by game mode and board size.
- Human vs CPU records that track wins, losses, draws, streaks, and total games.
- Human vs Human records that track `X` wins, `O` wins, draws, and total games.
- A records panel for the currently selected mode and board size.
- A clear-records action that resets saved local stats.
- Safe handling for missing or malformed stored record data.
- Match-result recording only when a game ends, avoiding resets or in-progress state changes from being counted.

## Acceptance Criteria Covered

- Wins, losses, and draws are stored locally.
- Win streak is tracked.
- Records separate CPU and local modes.
- Records separate board sizes.
- User can clear local records.
- Records persist after page refresh.
- Records do not require backend, account, database, or paid service.
- Existing gameplay still works.
- Existing CPU mode still works.
- Existing board size behavior still works.

## Notes

This phase builds on the earlier CPU and dynamic board phases, so records stay scoped to the currently selected mode and board size instead of mixing all matches together.

The detailed implementation spec remains in `specs/features/active.md`, which now reflects that the phase is done until the next active phase replaces it.

## Follow-Ups

- Future cloud-sync phases should preserve the same bucket separation by mode and board size.
- If CPU difficulty-specific records become important later, that can extend this structure without changing the local-only foundation.
