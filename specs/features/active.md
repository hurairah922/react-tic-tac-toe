# README Update Prompt

Update the README to clearly document the new UX direction for the game settings/status controls.

## Important UX Clarification

Do **not** move the game information/status section into the game board area.

The section that currently displays game information, such as:

```html
<div class="status-chip-row" aria-label="Game summary">
  <span class="status-...
```

should remain the single, always-visible place where users can view and control the game state.

## Required README Changes

Document that the game now uses the **status chip row** as the primary control surface for game configuration.

The following displayed game information should become clickable directly from the status chip row:

- Selected board
- Current player / player turn information
- Difficulty level
- Any other game configuration currently duplicated elsewhere in settings

## UX Goal

The goal is to avoid having multiple settings locations.

Instead of having a separate settings/options panel for these controls, users should be able to control the game from one consistent place that stays visible in the viewport.

This creates a simpler, less confusing UX.

## README Wording to Add

Add a section similar to this:

### Game Controls and Status Chips

The game summary/status chip row is the primary place for both viewing and updating active game settings.

The chips show the current game configuration, including the selected board, player state, and difficulty level. These chips are interactive, so users can change those settings directly from the always-visible status area instead of opening a separate settings panel.

This keeps the most important game controls in one consistent location, reduces duplicated UI, and makes the game easier to understand while playing.

## Notes

- Do not describe this as moving controls into the board.
- Do not add a second settings area.
- Do not document the removed settings/options UI as still existing.
- Preserve the existing README style, heading hierarchy, spacing, and formatting.