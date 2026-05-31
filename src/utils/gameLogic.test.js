import {
  calculateWinner,
  createBoardRules,
  createEmptyBoard,
  getDefaultWinLength,
  getMoveLocation,
  isBoardFull,
} from "./gameLogic";

describe("gameLogic", () => {
  test("creates a board from a dynamic board size", () => {
    expect(createEmptyBoard(3)).toHaveLength(9);
    expect(createEmptyBoard(4)).toHaveLength(16);
    expect(createEmptyBoard(5)).toHaveLength(25);
  });

  test("returns default win lengths for supported board sizes", () => {
    expect(getDefaultWinLength(3)).toBe(3);
    expect(getDefaultWinLength(4)).toBe(4);
    expect(getDefaultWinLength(5)).toBe(4);
  });

  test("creates supported board presets for setup UI", () => {
    expect(createBoardRules(3)).toEqual({ boardSize: 3, winLength: 3 });
    expect(createBoardRules(4)).toEqual({ boardSize: 4, winLength: 4 });
    expect(createBoardRules(5)).toEqual({ boardSize: 5, winLength: 4 });
    expect(createBoardRules(6)).toEqual({ boardSize: 3, winLength: 3 });
  });

  test("detects a 3x3 row winner and winning indexes", () => {
    const squares = ["X", "X", "X", null, "O", null, "O", null, null];

    expect(calculateWinner(squares, { boardSize: 3, winLength: 3 })).toEqual({
      winner: "X",
      line: [0, 1, 2],
    });
  });

  test("detects a 4x4 column winner and winning indexes", () => {
    const squares = createEmptyBoard(4);
    [2, 6, 10, 14].forEach((index) => {
      squares[index] = "O";
    });

    expect(calculateWinner(squares, { boardSize: 4, winLength: 4 })).toEqual({
      winner: "O",
      line: [2, 6, 10, 14],
    });
  });

  test("detects a 5x5 diagonal winner with four in a row", () => {
    const squares = createEmptyBoard(5);
    [6, 12, 18, 24].forEach((index) => {
      squares[index] = "X";
    });

    expect(calculateWinner(squares, { boardSize: 5 })).toEqual({
      winner: "X",
      line: [6, 12, 18, 24],
    });
  });

  test("detects a 5x5 anti-diagonal winner with four in a row", () => {
    const squares = createEmptyBoard(5);
    [8, 12, 16, 20].forEach((index) => {
      squares[index] = "O";
    });

    expect(calculateWinner(squares, { boardSize: 5, winLength: 4 })).toEqual({
      winner: "O",
      line: [8, 12, 16, 20],
    });
  });

  test("preserves dynamic draw and move coordinate helpers", () => {
    expect(isBoardFull(["X", "O", "X"])).toBe(true);
    expect(isBoardFull(["X", null, "O"])).toBe(false);
    expect(getMoveLocation(18, 5)).toEqual({ row: 4, col: 4 });
  });
});
