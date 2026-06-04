# Active Feature Spec

## Phase 7: Optional Accounts

Status: `Active`

Goal:

Add optional sign-in while preserving guest play.

## Acceptance Criteria

* Guest play still works.
* User can sign in with free-friendly auth.
* User can sign out.
* Signed-in user can have a profile name.
* User can set display name per match.
* Guest users can still set display names per match.
* Auth state does not block the game.
* Existing local records continue to work.
* Existing CPU and local modes continue to work.
* Existing board size selection continues to work.

## Product Rules

* Accounts must be optional.
* Guest play must remain the default accessible path.
* The user should never be forced to sign in before starting a match.
* Sign-in should improve identity/profile behavior, not gate the game.
* The app should clearly show whether the user is playing as guest or signed in.
* Display name per match should be separate from the saved profile name.
* Match display names should be editable before or during match setup.
* Sign-out should return the user to guest mode without breaking the current app state.

## Auth Requirements

Use a free-friendly auth approach.

Preferred options:

1. Supabase Auth
2. Firebase Auth
3. Local mock auth only if the project does not currently have backend/auth setup

Do not add paid services.

Do not add complex account features yet.

Do not add cloud record sync in this phase unless already trivial from the selected auth provider.

## UI Requirements

Add a small account/profile area that supports:

* Guest state
* Signed-in state
* Sign-in action
* Sign-out action
* Profile name display
* Profile name editing

Add match display name controls that support:

* Player X display name
* Player O display name
* Human player name in CPU mode
* CPU display name fallback

Suggested defaults:

* Guest player: `Guest`
* Local player X: `Player X`
* Local player O: `Player O`
* CPU opponent: `CPU`

## State Requirements

Add clear state separation for:

* Auth user
* Profile display name
* Per-match display names
* Guest identity
* Current game state

The app must not reset unrelated state unnecessarily when auth changes.

Changing a match display name should not corrupt records, turns, board state, or CPU behavior.

## Guest Mode Requirements

Guest play must work exactly as before.

Guest users must be able to:

* Start a match
* Choose CPU or local mode
* Choose board size
* Make moves
* Complete games
* Start a new game
* Use local records
* Clear local records
* Set display names per match

## Signed-In Mode Requirements

Signed-in users must be able to:

* See their signed-in state
* Set or update a profile name
* Use their profile name as a default match display name
* Override display name per match
* Sign out and continue as guest

## Non-Goals

Do not implement online multiplayer.

Do not implement matchmaking.

Do not implement cloud-synced game history unless it already exists and requires minimal wiring.

Do not add paid auth providers.

Do not require sign-in to play.

Do not redesign the whole app.

Do not remove local records.

Do not change CPU difficulty behavior unless needed to display names correctly.

## Validation Checklist

* App loads with guest play available.
* User can start a match without signing in.
* Default game mode still works.
* User can switch between CPU and local mode.
* User can choose 3x3, 4x4, and 5x5 boards.
* User can enter match display names.
* Match display names appear in game status, win messages, and history where relevant.
* CPU mode uses the human display name and CPU display name correctly.
* Local mode uses Player X and Player O display names correctly.
* User can sign in using the selected free-friendly auth method.
* Signed-in user can set a profile name.
* Profile name can be used as the default match display name.
* User can override display name per match.
* User can sign out.
* After sign-out, guest play still works.
* Existing local records still work.
* Existing clear records action still works.
* No auth action breaks the active board.
* No layout overflow occurs on mobile screens.
