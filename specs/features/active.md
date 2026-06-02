# Active Feature Spec

## Phase 5: Local Records

Status: `Done`

## Goal

Track local game records before user accounts exist.

Records should persist in the browser using local storage and should not require a backend, database, login, account system, or external service.

## User Value

Users can see their local progress across matches.

The records should help users understand how they perform across:

* Human vs Human mode
* Human vs CPU mode
* different board sizes

## Acceptance Criteria

* Wins, losses, and draws are stored locally.
* Win streak is tracked.
* Records separate CPU and local modes.
* Records separate board sizes.
* User can clear local records.
* Records persist after page refresh.
* Records do not require backend, account, database, or paid service.
* Existing gameplay still works.
* Existing CPU mode still works.
* Existing board size behavior still works.

## Supported Record Groups

Records must be separated by game mode and board size.

Game modes:

* Human vs Human
* Human vs CPU

Board sizes:

* 3 x 3
* 4 x 4
* 5 x 5

Each game mode and board size combination should have its own record bucket.

Example buckets:

* Human vs Human / 3 x 3
* Human vs Human / 4 x 4
* Human vs Human / 5 x 5
* Human vs CPU / 3 x 3
* Human vs CPU / 4 x 4
* Human vs CPU / 5 x 5

## Record Data

Each record bucket should track:

* wins
* losses
* draws
* current win streak
* best win streak
* total games

For Human vs CPU mode:

* A human win counts as a win.
* A CPU win counts as a loss.
* A draw counts as a draw.
* Win streak increases only when the human wins.
* Win streak resets when the human loses or draws.

For Human vs Human mode:

* Track wins by player if the current implementation supports player-specific results.
* If player-specific local records would create too much complexity, track:

  * X wins
  * O wins
  * draws
  * total games

Human vs Human mode should not incorrectly label one player as the user's loss.

## Recommended Human vs Human Record Shape

For Human vs Human buckets, use:

* xWins
* oWins
* draws
* totalGames

Win streak is optional for Human vs Human unless it can be clearly assigned to X or O.

## Recommended Human vs CPU Record Shape

For Human vs CPU buckets, use:

* wins
* losses
* draws
* currentWinStreak
* bestWinStreak
* totalGames

## Local Storage Requirements

* Use browser localStorage.
* Use one stable localStorage key.
* Version the stored data if practical.
* Handle missing localStorage data safely.
* Handle malformed localStorage data safely.
* Do not crash if localStorage is unavailable.
* Do not write records until a match ends.
* Do not double-count the same completed match.

Suggested key:

`tic-tac-toe-local-records`

## Match Counting Rules

A match should be recorded only once.

Record a match when:

* the game ends with a winner
* the game ends in a draw

Do not record when:

* user changes board size mid-match
* user changes mode mid-match
* user changes CPU difficulty mid-match
* user resets before the match ends
* user time-travels through move history
* game state re-renders after a result was already recorded

## UI Requirements

Add a local records section.

The section should show records for the current selected mode and board size.

For Human vs CPU mode, show:

* wins
* losses
* draws
* current win streak
* best win streak
* total games

For Human vs Human mode, show:

* X wins
* O wins
* draws
* total games

Add a clear records action.

The clear records action should:

* clearly say what it clears
* clear local records from localStorage
* reset the visible record UI
* not reset the current active match unless needed
* avoid accidental clearing where practical

A simple browser confirm is acceptable for this phase.

## Implementation Requirements

* Keep record logic separate from UI where practical.
* Add a small helper/module for local records if the project structure supports it.
* Do not mix localStorage read/write logic deeply into board click handlers if avoidable.
* Use existing game result detection.
* Do not duplicate winner logic.
* Preserve existing Human vs Human behavior.
* Preserve existing Human vs CPU behavior.
* Preserve existing board size behavior.
* Keep UI changes minimal.
* Do not do a full UI refactor in this phase.

## Suggested Helper Functions

The implementation may include helper functions like:

* `loadLocalRecords`
* `saveLocalRecords`
* `getRecordBucket`
* `updateRecordsForResult`
* `clearLocalRecords`
* `createDefaultRecords`

The exact names should follow the existing code style.

## Edge Cases

Handle these cases:

* user refreshes after records exist
* user clears records
* localStorage has no record data
* localStorage has malformed record data
* game ends and component re-renders
* user changes board size after a game ends
* user changes mode after a game ends
* CPU wins
* human wins against CPU
* draw in CPU mode
* X wins in Human vs Human
* O wins in Human vs Human
* draw in Human vs Human

## Testing Checklist

Manual checks:

* Play Human vs CPU on 3 x 3 and win. Confirm wins increase.
* Play Human vs CPU and lose. Confirm losses increase.
* Play Human vs CPU and draw. Confirm draws increase.
* Confirm current win streak increases after human wins.
* Confirm current win streak resets after loss.
* Confirm current win streak resets after draw.
* Confirm best win streak updates correctly.
* Confirm records persist after refresh.
* Confirm records are separate between 3 x 3, 4 x 4, and 5 x 5.
* Confirm records are separate between Human vs Human and Human vs CPU.
* Confirm Human vs Human tracks X wins, O wins, and draws.
* Confirm clearing records resets visible stats.
* Confirm clearing records removes localStorage data.
* Confirm resetting mid-match does not add a record.
* Confirm changing board size mid-match does not add a record.
* Confirm changing game mode mid-match does not add a record.
* Confirm a completed match is not double-counted.
* Confirm existing move history still works.
* Confirm existing CPU behavior still works.

## Non-Goals

* Do not add user accounts.
* Do not add backend storage.
* Do not add database storage.
* Do not add cloud sync.
* Do not add leaderboards.
* Do not add analytics.
* Do not add export/import.
* Do not do a full UI redesign.
* Do not change the core game rules.
