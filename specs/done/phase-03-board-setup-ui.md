# Phase 3: Board Setup UI

## Status

Done

## Summary

Added the user-facing controls that expose supported board sizes and their matching win conditions.

## What Shipped

- A board size selector with `3x3`, `4x4`, and `5x5` options.
- Clear UI text for the active win condition.
- Clean match reset when board size changes.
- Dynamic board rendering for supported sizes.
- Dynamic winning-line highlighting for supported sizes.
- Dynamic draw detection for supported sizes.
- Move coordinates based on the selected board size.
- Responsive support for larger boards on smaller screens.

## Acceptance Criteria Covered

- User can select `3x3`, `4x4`, or `5x5`.
- UI explains the current win condition.
- Changing board size starts a clean match.
- Reset preserves the selected board size.
- `3x3` uses `3 in a row`.
- `4x4` uses `4 in a row`.
- `5x5` uses `4 in a row`.
- Winner detection works for all supported board sizes.
- Winning-line highlighting works for all supported board sizes.
- Draw detection works for all supported board sizes.
- Move history works after selecting a board size.
- Time travel works after selecting a board size.
- Future-history truncation still works after branching.
- Learn How to Play modal still works.
- Layout stays usable on mobile.
- App builds successfully.

## Notes

The detailed in-progress feature write-up for this work already exists in `specs/features/active.md`, so this record acts as the completed summary.

## Follow-Ups

- Future CPU and record-tracking phases should respect the selected board size and win-condition rules introduced here.
