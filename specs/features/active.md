# Active Feature Spec

## Feature

Game UX Layout, History, and Undo Improvements

## Status

Active

## Goal

Improve the game experience by keeping the main board visible, moving secondary controls into a sidebar, simplifying setup controls, and making history navigation easier to use.

## Problem

The current page shows too much detail above and around the game board. This pushes the board down the page and makes the game harder to understand.

Move history also takes up too much vertical space. Users may not understand that it supports time travel. After a game ends, the New Game button can be too far away, forcing users to scroll.

## Requirements

### Layout

- Move game setup and secondary controls into a sidebar.
- Keep the main game board as the primary focus.
- Keep the board visible in the viewport as much as possible on desktop and mobile.
- Avoid placing long controls above the board.
- Use a responsive layout:
  - Desktop/tablet: board area plus sidebar.
  - Mobile: board first, controls below or in a compact stacked panel.

### Game setup controls

- Replace large selection controls with dropdowns where appropriate.
- Use dropdowns for:
  - Game mode.
  - Board size.
  - CPU difficulty when CPU mode is active.
  - First player/start behavior if currently exposed as a large control.
- Keep helper text short and clear.
- Do not remove existing game configuration behavior.

### Move history and time travel

- Move time travel history into the sidebar.
- Replace the long visible move list with a compact dropdown.
- The dropdown should allow the user to jump to a specific move.
- Include a clear label such as `Jump to move`.
- Show the current move/state clearly.
- Preserve existing time travel behavior.

### Undo

- Add an Undo button.
- In Human vs Human mode:
  - Undo should go back one move.
- In Human vs CPU mode:
  - Undo should go back two moves when possible, removing the human move and CPU response together.
- Disable Undo when there are not enough moves to undo.
- Undo should preserve valid game state.
- Undo should not create invalid turn order.
- Undo should work correctly after time travel.

### Game completion

- When a game is completed, show the New Game button near or above the game board.
- The user should not need to scroll to find the New Game button.
- Keep any existing New Game/reset behavior intact.
- The completed game state should remain clear.

### Mobile UX

- Avoid layout shifts when moves are added.
- Keep the board stable while playing.
- Avoid pushing important controls outside the viewport.
- Make sidebar controls usable on small screens.
- Ensure tap targets remain comfortable.

## Acceptance Criteria

- Game setup controls appear in a sidebar or compact control panel.
- Main board stays visible and prominent during play.
- Large selection sections no longer push the board far down the page.
- Move history is available through a dropdown.
- User can jump to a specific move from the dropdown.
- Undo works one move back in Human vs Human mode.
- Undo works two moves back in Human vs CPU mode when possible.
- Undo is disabled when unavailable.
- New Game button appears near or above the board after game completion.
- Mobile layout remains usable without confusing scroll behavior.
- Existing gameplay, CPU behavior, board sizes, records, and auth behavior remain intact.
