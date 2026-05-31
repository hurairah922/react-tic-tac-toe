# Active Feature: Board Setup UI

## Status

Active

## Phase

Phase 3: Board Setup UI

## Goal

Allow users to choose supported board sizes before or during play.

This phase exposes the dynamic board rules created in Phase 2 through a simple user-facing setup control.

## User Value

Players can choose a board size that fits the type of game they want to play:

* `3x3` for the classic quick game.
* `4x4` for a longer game with more space.
* `5x5` for a larger board with a 4-in-a-row win condition.

## Scope

Implement:

* A board size selector with supported options:

  * `3x3`
  * `4x4`
  * `5x5`
* Clear UI text that explains the active win condition.
* A clean match reset when the board size changes.
* Dynamic board rendering based on selected board size.
* Dynamic winning-line highlighting for all supported sizes.
* Dynamic draw detection for all supported sizes.
* Move coordinates based on selected board size.
* Responsive layout for larger boards on mobile screens.

## Board Rules

### 3x3

* Board size: `3x3`
* Total cells: `9`
* Win condition: `3 in a row`

### 4x4

* Board size: `4x4`
* Total cells: `16`
* Win condition: `4 in a row`

### 5x5

* Board size: `5x5`
* Total cells: `25`
* Win condition: `4 in a row`

## UX Requirements

* The selected board size must be visible to the user.
* The active win condition must be explained near the selector or status area.
* Changing board size must start a clean match.
* Reset must preserve the selected board size.
* Controls must be easy to use on desktop and mobile.
* The board must stay inside the viewport on small screens.
* The layout must not overflow horizontally.
* The game must remain beginner-friendly.

## Accessibility Requirements

* Board size controls must have accessible labels.
* The selected option must be clear for keyboard and screen-reader users.
* Focus styles must remain visible.
* Status updates must continue to work with existing `aria-live` behavior.
* Changing board size must not trap focus or break keyboard navigation.

## Technical Requirements

* Use the existing dynamic board logic from Phase 2.
* Do not duplicate hardcoded winner logic inside UI components.
* Keep board-size configuration clear and easy to extend.
* Preserve immutable game history behavior.
* Preserve current-move tracking.
* Preserve future-history truncation after branching.
* Preserve winner detection.
* Preserve draw detection.
* Preserve winning-line highlighting.
* Preserve reset behavior.
* Preserve the Learn How to Play modal.

## Suggested Configuration

Use a simple config structure similar to:

```js
const BOARD_OPTIONS = [
  { size: 3, winLength: 3, label: "3x3" },
  { size: 4, winLength: 4, label: "4x4" },
  { size: 5, winLength: 4, label: "5x5" },
];
```

The exact implementation may differ if the existing project structure suggests a cleaner approach.

## Out of Scope

Do not implement:

* CPU opponent.
* Difficulty levels.
* Local records.
* Accounts.
* Auth.
* Invite links.
* Real-time multiplayer.
* Async multiplayer.
* Backend services.
* Leaderboards.
* Public matchmaking.
* New dependencies unless absolutely necessary.

## Acceptance Criteria

* User can select `3x3`, `4x4`, or `5x5`.
* UI explains the current win condition.
* Changing board size starts a clean match.
* Reset preserves the selected board size.
* `3x3` uses 3 in a row.
* `4x4` uses 4 in a row.
* `5x5` uses 4 in a row.
* Winner detection works for all supported board sizes.
* Winning-line highlighting works for all supported board sizes.
* Draw detection works for all supported board sizes.
* Move history works after selecting a board size.
* Time travel works after selecting a board size.
* Future-history truncation still works after branching.
* Learn How to Play modal still works.
* Layout stays usable on mobile.
* App builds successfully.

## Testing Notes

Manual checks:

* Select `3x3` and complete a horizontal win.
* Select `3x3` and complete a vertical win.
* Select `3x3` and complete a diagonal win.
* Select `4x4` and complete a 4-in-row win.
* Select `5x5` and complete a 4-in-row win.
* Confirm draw detection works.
* Confirm winning squares highlight correctly.
* Confirm reset preserves selected board size.
* Confirm changing board size clears the current match.
* Confirm move history works.
* Confirm time travel works.
* Confirm branching after time travel removes future moves.
* Confirm mobile layout does not overflow.
* Confirm Learn How to Play modal still opens and closes.


## Phase 3 Polish Notes

- Board size selector options must not show native radio button circles.
- Selected board size should be shown through custom button/card styling.
- Board squares must keep a stable 1:1 aspect ratio.
- Move history growth must not change board square height.
- 3x3, 4x4, and 5x5 layouts must remain stable on desktop and mobile.