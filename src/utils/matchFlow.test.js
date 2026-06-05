import {
  DEFAULT_STARTING_PLAYER,
  getAlternatePlayer,
  getUndoMoveTarget,
  getPlayerForMove,
} from "./matchFlow";

describe("matchFlow", () => {
  test("uses X as the default starting player", () => {
    expect(DEFAULT_STARTING_PLAYER).toBe("X");
  });

  test("alternates between X and O", () => {
    expect(getAlternatePlayer("X")).toBe("O");
    expect(getAlternatePlayer("O")).toBe("X");
  });

  test("derives the next player from the round starter and move count", () => {
    expect(getPlayerForMove("X", 0)).toBe("X");
    expect(getPlayerForMove("X", 1)).toBe("O");
    expect(getPlayerForMove("O", 0)).toBe("O");
    expect(getPlayerForMove("O", 3)).toBe("X");
  });

  test("undoes one move in human vs human mode", () => {
    expect(getUndoMoveTarget(0, "human")).toBeNull();
    expect(getUndoMoveTarget(1, "human")).toBe(0);
    expect(getUndoMoveTarget(4, "human")).toBe(3);
  });

  test("undoes a full human and cpu turn pair in cpu mode", () => {
    expect(getUndoMoveTarget(0, "cpu")).toBeNull();
    expect(getUndoMoveTarget(1, "cpu")).toBeNull();
    expect(getUndoMoveTarget(2, "cpu")).toBe(0);
    expect(getUndoMoveTarget(5, "cpu")).toBe(3);
  });
});
