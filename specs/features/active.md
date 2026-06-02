# Active Feature Spec

## Phase 4: CPU Opponent

Status: `Active`

## Goal

Add a single-player mode where the user can play against a free local CPU opponent.

The CPU must run fully in the browser. It must not require a backend, API key, paid AI model, server action, or external service.

## User Value

Users can play Tic-Tac-Toe alone without needing a second human player.

The CPU should feel different across difficulty levels. It should not only pick random moves. Higher difficulty levels should try to win and block the human player.

## Acceptance Criteria

* User can choose Human vs Human or Human vs CPU mode.
* User can choose CPU difficulty: Easy, Medium, or Hard.
* CPU makes valid moves only.
* CPU never plays on an occupied square.
* CPU only moves when the game is in CPU mode.
* CPU moves after the human player finishes a valid move.
* Human cannot make a move during the CPU turn.
* CPU difficulty behavior differs by level.
* CPU does not require backend, paid AI, or external API.
* Starting a new match keeps the selected mode and difficulty unless the user changes them.
* Changing board size starts a clean match.
* Changing game mode starts a clean match.
* Changing CPU difficulty starts a clean match if CPU mode is active.
* Existing Human vs Human behavior still works.

## CPU Difficulty Rules

### Easy

Easy CPU should mostly play randomly.

Required behavior:

* Choose a random valid empty square.
* No win detection required.
* No blocking required.

### Medium

Medium CPU should make simple tactical decisions.

Required behavior priority:

1. If CPU can win on this move, make the winning move.
2. Else if the human can win on their next move, block that move.
3. Else choose a random valid empty square.

### Hard

Hard CPU should play stronger than Medium.

Required behavior priority:

1. If CPU can win on this move, make the winning move.
2. Else if the human can win on their next move, block that move.
3. Else prefer the center square if available.
4. Else prefer a corner square if available.
5. Else choose a random valid empty square.

For larger boards, use the same idea based on the current win condition.

Supported boards:

* 3 x 3: 3 in a row
* 4 x 4: 4 in a row
* 5 x 5: 4 in a row

## Implementation Requirements

* Keep CPU logic local and deterministic where practical.
* Extract CPU move selection into a small pure function or module.
* Avoid mixing CPU decision logic directly into render/UI code.
* Reuse existing winner/win-condition logic where possible.
* Do not duplicate board evaluation logic if a shared helper can be used.
* Keep existing game state behavior intact.
* Do not add persistence in this phase.
* Do not add local stats/history in this phase.
* Do not redesign the full UI in this phase.
* Do not use AI APIs or remote services.

## Suggested State Additions

The implementation may add state similar to:

* `gameMode`: `"human"` or `"cpu"`
* `cpuDifficulty`: `"easy" | "medium" | "hard"`
* `isCpuTurn`: derived from current player, game mode, and game status

The exact naming can follow the existing code style.

## UI Requirements

Add controls for:

* Game mode:

  * Human vs Human
  * Human vs CPU

* CPU difficulty:

  * Easy
  * Medium
  * Hard

Difficulty controls should only be shown or enabled when CPU mode is selected.

The status area should clearly show when:

* It is the human player's turn.
* It is the CPU's turn.
* The CPU has selected a move.
* The game is won or drawn.

## Board Interaction Rules

* Human can click empty squares only on a valid human turn.
* Human cannot click while CPU is choosing or making a move.
* Human cannot click after the game is over.
* CPU cannot move after the game is over.
* CPU cannot make more than one move per turn.
* CPU should not move if the board changes because of reset, board size change, mode change, or difficulty change.

## Timing

A short CPU delay is allowed to make the turn feel natural.

Recommended delay:

* 300ms to 600ms

The delay must not create duplicate CPU moves or stale moves after reset.

## Testing Checklist

Manual checks:

* Human vs Human still works.
* Human vs CPU mode starts correctly.
* Easy CPU makes valid random moves.
* Medium CPU takes winning moves.
* Medium CPU blocks obvious human wins.
* Hard CPU takes winning moves.
* Hard CPU blocks obvious human wins.
* Hard CPU prefers center when available.
* Hard CPU prefers corners when center is unavailable.
* Human cannot click during CPU turn.
* CPU does not move after reset.
* CPU does not move after board size change.
* CPU does not move after game mode change.
* CPU works on 3 x 3, 4 x 4, and 5 x 5 boards.
* Win and draw detection still works.
* Move history still works for the current match.
* Layout remains usable on mobile.

## Non-Goals

* Do not add persistent local storage.
* Do not add match statistics.
* Do not add full UI refactor.
* Do not add animations.
* Do not add online multiplayer.
* Do not add backend services.
* Do not add paid AI logic.
* Do not update the visual design beyond what is needed for the new controls.
