import {
  DEFAULT_STARTING_PLAYER,
  getAlternatePlayer,
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
});
