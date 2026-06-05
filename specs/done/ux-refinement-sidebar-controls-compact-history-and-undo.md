# UX Refinement: Sidebar Controls, Compact History, and Undo

## Status

Done

## Summary

Refined the main game screen so the board stays prominent, setup controls are easier to manage, and history/undo actions feel like part of the current match instead of disconnected page sections.

## What Shipped

- A board-first layout with a compact status strip above the board and round actions embedded in the board card header.
- A sticky desktop sidebar that keeps account settings, match settings, records, and help visible while the main game area scrolls.
- Match settings consolidated into one compact control panel containing game mode, board size, player side, and CPU difficulty when relevant.
- Board-size segmented buttons for `3x3`, `4x4`, and `5x5` with short win-condition guidance.
- Styled dropdown controls for game mode, CPU side, CPU difficulty, and move jumping.
- A compact Time Travel section placed under the board and hidden until at least one move exists.
- An `Undo` action that goes back one move in human-vs-human mode and two moves in CPU mode when a full turn pair exists.
- Profile-name ownership kept inside account/profile settings, with gameplay names derived from saved profile or guest defaults instead of separate match-name editing.

## Acceptance Criteria Covered

- Game setup controls appear in a sidebar or compact control panel.
- The main board stays visible and prominent during play.
- Large selection sections no longer push the board far down the page.
- Move history is available through a dropdown.
- Users can jump to a specific move from the dropdown.
- Undo works one move back in Human vs Human mode.
- Undo works two moves back in Human vs CPU mode when possible.
- Undo is disabled when unavailable.
- `New Game` appears near the board after game completion.
- Mobile layout stays usable without confusing scroll behavior.
- Existing gameplay, CPU behavior, board sizes, records, and auth behavior remain intact.

## Notes

The original feature started as a sidebar/history cleanup and expanded into a broader screen-polish pass so the board, actions, and current-match controls felt more intentional together.

Time Travel now appears only after a move exists, which keeps the opening state simpler without changing the underlying immutable history behavior.

## Follow-Ups

- Choose and document the next active feature in `specs/features/active.md`.
- Remove or repurpose any now-unused UI-only components if a later cleanup pass is desired.
