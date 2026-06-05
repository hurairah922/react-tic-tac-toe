# Active Feature Spec

## Phase 9: Invite-Link Multiplayer

Status: `Active`

## Goal

Let a player invite another player to a private match using a shareable link.

## Scope

Build invite-link multiplayer for signed-in users, while keeping existing guest, local, CPU, records, and history behavior stable.

This phase should allow one player to create a private match room and another player to join that room through a generated link.

## Acceptance Criteria

* Player can create an invite match.
* App generates a share link.
* Second player can join through the link.
* Both players have display names.
* Invalid rooms show clear errors.

## Functional Requirements

### Invite Match Creation

* Add a clear way to start an invite-link multiplayer match.
* When a player creates an invite match, create a private room record in the cloud database.
* Assign the creator as Player 1.
* Store the creator display name.
* Generate a shareable room link.
* Show the link in the UI with a copy action.

### Join Through Link

* Add route support for joining a room from a shared link.
* When a second player opens the link, load the room data.
* If the room is valid and has space, allow the second player to join.
* Assign the joining player as Player 2.
* Store the joining player's display name.
* Start or unlock the match once both players are present.

### Display Names

* Use the signed-in user's profile display name by default.
* Allow the match display name to be confirmed or edited before joining/creating the room if the current app already supports per-match names.
* Show both player names clearly near the board.
* Avoid anonymous labels unless no display name exists.

### Room Validation

Show clear error states for:

* Room does not exist.
* Room is already full.
* Room was deleted or expired.
* Room data is invalid.
* User cannot join their own room as the second player.
* Required auth or profile data is missing.

### Match State

* Keep board state synced through the cloud database.
* Only the current turn player can make a move.
* Reject invalid moves before saving.
* Prevent moves after the game is complete.
* Show whose turn it is using player display names.
* Preserve existing board size and win-condition behavior.
* Preserve existing local/CPU modes.

### Records

* Do not save invite multiplayer records unless Phase 8 cloud records already supports this safely.
* If saving records, separate invite multiplayer stats from CPU and local modes.
* Validate match result before saving.

## Technical Requirements

* Use the existing auth provider abstraction.
* Use the existing cloud/database provider from Phase 8 if available.
* Keep guest play local.
* Do not break CPU opponent behavior.
* Do not break local records.
* Do not expose private database keys in frontend code.
* Add clear loading, empty, and error states.
* Keep UI responsive on mobile.

## Suggested Room Data Shape

```ts
type InviteRoom = {
  id: string;
  status: "waiting" | "active" | "complete" | "expired";

  boardSize: 3 | 4 | 5;
  winLength: number;

  players: {
    x?: {
      userId: string;
      displayName: string;
      joinedAt: string;
    };
    o?: {
      userId: string;
      displayName: string;
      joinedAt: string;
    };
  };

  board: Array<"X" | "O" | null>;
  currentPlayer: "X" | "O";
  winner: "X" | "O" | "draw" | null;

  createdBy: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
};
```

## Suggested Routes

```txt
/play/invite
/play/invite/:roomId
```

## UI Requirements

* Add an invite multiplayer option without cluttering the main game board.
* Keep match setup controls grouped in the existing match settings area.
* Show share link only after the room is created.
* Show a copy-link button.
* Show room status:

  * Waiting for opponent
  * Opponent joined
  * Your turn
  * Opponent's turn
  * Match complete
* Show clear invalid-room messages with a path back to a new match.

## Out of Scope

* Public matchmaking.
* Friend lists.
* Chat.
* Spectators.
* Multiple opponents.
* Tournament mode.
* Realtime presence indicators beyond basic joined/waiting state.
* Advanced anti-cheat.
* Paid realtime infrastructure unless already configured.

## Definition of Done

* Invite room can be created.
* Share link can be copied.
* Second player can join from the link.
* Both display names appear correctly.
* Turns are enforced.
* Invalid moves are rejected.
* Invalid rooms show useful errors.
* Existing game modes still work.
* Mobile layout remains usable.
* Relevant tests or manual QA notes are added.
