import { createValidatedMatchRecord } from "./recordValidation";

describe("recordValidation", () => {
  test("creates a normalized match record for a completed CPU win", () => {
    const matchRecord = createValidatedMatchRecord({
      gameMode: "cpu",
      boardSize: 3,
      cpuDifficulty: "medium",
      humanPlayer: "X",
      cpuPlayer: "O",
      winner: "X",
      isDraw: false,
      finalSquares: ["X", "X", "X", "O", "O", null, null, null, null],
      playerDisplayNames: {
        X: "Alex",
        O: "CPU",
      },
      moves: [
        { player: "X", row: 1, col: 1, squareIndex: 0 },
        { player: "O", row: 2, col: 1, squareIndex: 3 },
        { player: "X", row: 1, col: 2, squareIndex: 1 },
        { player: "O", row: 2, col: 2, squareIndex: 4 },
        { player: "X", row: 1, col: 3, squareIndex: 2 },
      ],
      completedAt: "2026-06-04T12:00:00.000Z",
    });

    expect(matchRecord).toEqual({
        mode: "cpu",
        board_size: 3,
        difficulty: "medium",
        human_symbol: "X",
        result: "x_win",
        winner: "X",
      player_x_name: "Alex",
      player_o_name: "CPU",
      move_count: 5,
      moves: [
        { move: 1, player: "X", row: 1, col: 1, squareIndex: 0 },
        { move: 2, player: "O", row: 2, col: 1, squareIndex: 3 },
        { move: 3, player: "X", row: 1, col: 2, squareIndex: 1 },
        { move: 4, player: "O", row: 2, col: 2, squareIndex: 4 },
        { move: 5, player: "X", row: 1, col: 3, squareIndex: 2 },
      ],
      completed_at: "2026-06-04T12:00:00.000Z",
    });
  });

  test("rejects invalid completed matches", () => {
    expect(
      createValidatedMatchRecord({
        gameMode: "human",
        boardSize: 3,
        cpuDifficulty: null,
        winner: "X",
        isDraw: true,
        finalSquares: ["X", "X", "X", null, null, null, null, null, null],
        playerDisplayNames: { X: "Riley", O: "Jordan" },
        moves: [{ player: "X", row: 1, col: 1, squareIndex: 0 }],
      })
    ).toBeNull();

    expect(
      createValidatedMatchRecord({
        gameMode: "cpu",
        boardSize: 3,
        cpuDifficulty: "expert",
        humanPlayer: "X",
        cpuPlayer: "O",
        winner: "X",
        isDraw: false,
        finalSquares: ["X", "X", "X", "O", "O", null, null, null, null],
        playerDisplayNames: { X: "Riley", O: "CPU" },
        moves: [
          { player: "X", row: 1, col: 1, squareIndex: 0 },
          { player: "O", row: 2, col: 1, squareIndex: 3 },
          { player: "X", row: 1, col: 2, squareIndex: 1 },
          { player: "O", row: 2, col: 2, squareIndex: 4 },
          { player: "X", row: 1, col: 3, squareIndex: 2 },
        ],
      })
    ).toBeNull();

    expect(
      createValidatedMatchRecord({
        gameMode: "cpu",
        boardSize: 3,
        cpuDifficulty: "easy",
        humanPlayer: "O",
        cpuPlayer: "O",
        winner: "O",
        isDraw: false,
        finalSquares: ["X", "X", "X", "O", "O", null, null, null, null],
        playerDisplayNames: { X: "CPU", O: "Riley" },
        moves: [
          { player: "X", row: 1, col: 1, squareIndex: 0 },
          { player: "O", row: 2, col: 1, squareIndex: 3 },
          { player: "X", row: 1, col: 2, squareIndex: 1 },
          { player: "O", row: 2, col: 2, squareIndex: 4 },
          { player: "X", row: 1, col: 3, squareIndex: 2 },
        ],
      })
    ).toBeNull();
  });
});
