# Runtime UX Fix: Board-Priority Layout

## Status

Documented

## Summary

This changelog records the runtime UX adjustments that made the game board appear earlier in the page and consolidated setup controls into a single `Game setup` area.

## Changes

- Set `Human vs CPU` as the default game mode while preserving the local human-vs-human option.
- Reordered the page so the playable board sits higher in the interface.
- Moved move history, local records, and learn/help content below the primary game area.
- Kept round status and reset/new-game actions close to the board.
- Consolidated mode selection and board-size selection into one shared `Game setup` block.
- Stacked the setup subsections vertically inside that shared block so the top area uses less horizontal space.
- Preserved move-history stability by keeping it in a fixed-height scroll region.

## Notes

- This was intentionally kept as a UX/runtime refinement rather than a new feature phase.
- Core gameplay behavior for CPU mode, local mode, and supported board sizes remained unchanged.
- Larger separations such as dedicated records or leaderboard pages are still deferred to later account-related work.
