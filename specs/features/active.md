# Active Feature: Learn How to Play Modal

## Feature Status

Status: `Active`

## Feature Goal

Add a simple, accessible "Learn how to play" modal to help users understand the current game before adding more complex features.

This is the first active feature because it is frontend-only, low risk, and useful for establishing the phased development workflow.

## User Story

As a new player, I want to open a short guide that explains how tic-tac-toe works so I can understand the goal, turns, winning, draws, and move history without leaving the game.

## Scope

Build a modal that explains:

- The goal of tic-tac-toe.
- X and O turn-taking.
- How to win with a row, column, or diagonal.
- What a draw means.
- How reset works.
- How move history and time travel work in this app.

## Out of Scope

Do not build these in this feature:

- CPU mode.
- Board size selector.
- User accounts.
- Saved records.
- Invite links.
- Real-time multiplayer.
- Async multiplayer.
- Backend services.

## UX Requirements

The feature must include:

- A visible "Learn how to play" button or link.
- A modal title.
- Short instructional sections.
- A clear close button.
- Simple language.
- Mobile-friendly layout.
- No disruption to active game state.

Recommended modal sections:

1. Goal of the game.
2. Taking turns.
3. How to win.
4. Draws.
5. Move history.
6. Tips.

## Accessibility Requirements

The modal must:

- Use an accessible dialog pattern.
- Move focus into the modal when opened.
- Return focus to the opener when closed.
- Close with Escape.
- Have a clear accessible name.
- Prevent keyboard focus from moving behind the modal while open.
- Use semantic buttons.
- Avoid relying on color alone.

## Suggested Component Plan

Add:

- `src/components/LearnModal.jsx`

Update:

- `src/components/Game.jsx` or the appropriate parent component to manage modal open state.
- `src/styles.css` for modal layout and responsive styling.

Optional supporting utility:

- `src/hooks/useFocusTrap.js` only if the focus behavior becomes too large for the component.

## Suggested State

Use local React state only:

```js
const [isLearnModalOpen, setIsLearnModalOpen] = useState(false);
```

Do not add global state.

Do not add backend state.

Do not persist modal state unless there is a clear reason later.

## Acceptance Criteria

The feature is complete when:

- User can open the modal.
- User can close the modal with the close button.
- User can close the modal with Escape.
- Focus enters the modal when opened.
- Focus returns to the opener when closed.
- Modal has a clear heading.
- Modal explains the current game accurately.
- Modal works on mobile.
- Modal works on desktop.
- Opening and closing the modal does not reset the game.
- No console errors are introduced.

## Manual Test Checklist

- Start a new game.
- Make at least one move.
- Open the modal.
- Confirm the board does not change.
- Close the modal.
- Confirm the board still has the same moves.
- Open the modal with keyboard navigation.
- Close it with Escape.
- Confirm focus returns correctly.
- Test on a narrow mobile viewport.
- Test after a win.
- Test after a draw.
- Test after using time travel.

## Implementation Notes for Codex

Keep the change small.

Do not refactor unrelated game logic.

Do not add dependencies unless absolutely required.

Do not modify CPU, board-size, account, or multiplayer logic in this feature.

Use existing styling patterns from `src/styles.css`.

Preserve all current gameplay behavior.


## Change Request: Visual Winning Pattern Examples

The Learn how to play modal must include visual examples of winning patterns.

Acceptance criteria:

- The modal shows a small 3x3 example board for a horizontal win.
- The modal shows a small 3x3 example board for a vertical win.
- The modal shows a small 3x3 example board for a diagonal win.
- Winning cells are visually highlighted.
- Each pattern has a clear label.
- The examples work on mobile screens.
- The explanation does not rely only on color.
- No unrelated game mode, CPU, auth, multiplayer, or backend work is included.