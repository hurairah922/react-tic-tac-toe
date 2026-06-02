import { chooseCpuMove } from "./cpuPlayer";
import { createBoardRules, createEmptyBoard } from "./gameLogic";

describe("cpuPlayer", () => {
  test("returns null when no valid moves remain", () => {
    expect(
      chooseCpuMove({
        squares: ["X", "O", "X", "X"],
        boardRules: createBoardRules(3),
      })
    ).toBeNull();
  });

  test("easy difficulty picks a random empty square only", () => {
    expect(
      chooseCpuMove({
        squares: ["X", null, "O", null],
        boardRules: { boardSize: 2, winLength: 2 },
        difficulty: "easy",
        random: () => 0.99,
      })
    ).toBe(3);
  });

  test("medium difficulty takes a winning move before anything else", () => {
    expect(
      chooseCpuMove({
        squares: ["O", "O", null, "X", "X", null, null, null, null],
        boardRules: createBoardRules(3),
        difficulty: "medium",
        random: () => 0,
      })
    ).toBe(2);
  });

  test("medium difficulty blocks the human when needed", () => {
    expect(
      chooseCpuMove({
        squares: ["X", "X", null, null, "O", null, null, null, null],
        boardRules: createBoardRules(3),
        difficulty: "medium",
        random: () => 0,
      })
    ).toBe(2);
  });

  test("hard difficulty prefers the center on odd-sized boards", () => {
    expect(
      chooseCpuMove({
        squares: createEmptyBoard(3),
        boardRules: createBoardRules(3),
        difficulty: "hard",
        random: () => 0,
      })
    ).toBe(4);
  });

  test("hard difficulty prefers the center region on even-sized boards", () => {
    expect(
      chooseCpuMove({
        squares: createEmptyBoard(4),
        boardRules: createBoardRules(4),
        difficulty: "hard",
        random: () => 0,
      })
    ).toBe(5);
  });

  test("hard difficulty prefers a corner when the center is unavailable", () => {
    const squares = createEmptyBoard(3);
    squares[4] = "X";

    expect(
      chooseCpuMove({
        squares,
        boardRules: createBoardRules(3),
        difficulty: "hard",
        random: () => 0.99,
      })
    ).toBe(8);
  });

  test("hard difficulty respects the current 5x5 win condition", () => {
    const squares = createEmptyBoard(5);
    [0, 1, 2].forEach((squareIndex) => {
      squares[squareIndex] = "X";
    });

    expect(
      chooseCpuMove({
        squares,
        boardRules: createBoardRules(5),
        difficulty: "hard",
        random: () => 0,
      })
    ).toBe(3);
  });
});
