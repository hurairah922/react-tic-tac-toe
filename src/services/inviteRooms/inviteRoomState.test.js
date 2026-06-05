import {
  buildInviteHistory,
  getInviteRoomDisplayNames,
  getInviteRoomEntryState,
  getInviteRoomParticipantSymbol,
  isInviteRoomExpired,
} from "./inviteRoomState";

function createRoom(overrides = {}) {
  return {
    id: "room-1",
    status: "waiting",
    boardSize: 3,
    winLength: 3,
    board: [null, null, null, null, null, null, null, null, null],
    currentPlayer: "X",
    winner: null,
    createdBy: "user-x",
    createdAt: "2026-06-05T10:00:00.000Z",
    updatedAt: "2026-06-05T10:00:00.000Z",
    completedAt: "",
    expiresAt: "2026-06-12T10:00:00.000Z",
    moveCount: 0,
    moves: [],
    players: {
      X: {
        userId: "user-x",
        displayName: "Alex",
        joinedAt: "2026-06-05T10:00:00.000Z",
      },
      O: null,
    },
    isInvalid: false,
    ...overrides,
  };
}

describe("inviteRoomState", () => {
  test("finds the participant symbol for the current player", () => {
    const room = createRoom({
      players: {
        X: { userId: "user-x", displayName: "Alex", joinedAt: "2026-06-05" },
        O: { userId: "user-o", displayName: "Blair", joinedAt: "2026-06-05" },
      },
    });

    expect(getInviteRoomParticipantSymbol(room, "user-x")).toBe("X");
    expect(getInviteRoomParticipantSymbol(room, "user-o")).toBe("O");
    expect(getInviteRoomParticipantSymbol(room, "user-z")).toBeNull();
  });

  test("builds safe display names when the second player is missing", () => {
    expect(getInviteRoomDisplayNames(createRoom())).toEqual({
      X: "Alex",
      O: "Player O",
    });
  });

  test("flags expired rooms based on their timestamp", () => {
    expect(
      isInviteRoomExpired(
        createRoom({ expiresAt: "2026-06-05T10:00:00.000Z" }),
        new Date("2026-06-05T10:00:00.000Z").getTime()
      )
    ).toBe(true);
  });

  test("treats a current participant as already inside the room", () => {
    const result = getInviteRoomEntryState(createRoom(), {
      id: "user-x",
      email: "alex@example.com",
    });

    expect(result).toEqual({
      code: "",
      message: "",
      participantSymbol: "X",
      state: "participant",
    });
  });

  test("blocks full rooms for a third player", () => {
    const result = getInviteRoomEntryState(
      createRoom({
        status: "active",
        players: {
          X: { userId: "user-x", displayName: "Alex", joinedAt: "2026-06-05" },
          O: { userId: "user-o", displayName: "Blair", joinedAt: "2026-06-05" },
        },
      }),
      { id: "user-z", email: "casey@example.com" }
    );

    expect(result).toEqual({
      code: "full",
      message: "This invite room already has two players. Ask the host for a new link.",
      state: "blocked",
    });
  });

  test("allows a second authenticated player to join a waiting room", () => {
    const result = getInviteRoomEntryState(createRoom(), {
      id: "user-o",
      email: "blair@example.com",
    });

    expect(result).toEqual({
      code: "",
      message: "",
      state: "joinable",
    });
  });

  test("rebuilds move history entries from stored invite moves", () => {
    const history = buildInviteHistory(
      createRoom({
        moves: [
          { move: 1, player: "X", row: 1, col: 1, squareIndex: 0 },
          { move: 2, player: "O", row: 2, col: 2, squareIndex: 4 },
        ],
      })
    );

    expect(history).toHaveLength(3);
    expect(history[1]).toEqual({
      squares: ["X", null, null, null, null, null, null, null, null],
      moveLocation: { row: 1, col: 1 },
      player: "X",
    });
    expect(history[2]).toEqual({
      squares: ["X", null, null, null, "O", null, null, null, null],
      moveLocation: { row: 2, col: 2 },
      player: "O",
    });
  });
});
