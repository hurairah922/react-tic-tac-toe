jest.mock("../authService", () => ({
  isUsingSupabaseAuth: jest.fn(),
}));

jest.mock("./cloudRecords", () => ({
  clearCloudMatchHistory: jest.fn(),
  fetchCloudMatchHistory: jest.fn(),
  insertCloudMatchHistory: jest.fn(),
}));

import { isUsingSupabaseAuth } from "../authService";
import {
  clearCloudMatchHistory,
  fetchCloudMatchHistory,
  insertCloudMatchHistory,
} from "./cloudRecords";
import {
  clearRecords,
  deriveRecordsFromMatchHistory,
  loadRecords,
  resetCompletedMatchSaveGuardsForTests,
  saveCompletedMatchResult,
} from "./recordsService";
import {
  createDefaultLocalRecords,
  getRecordBucket,
  loadLocalRecords,
} from "../../utils/localRecords";

function createMemoryStorage(initialEntries = {}) {
  const storage = { ...initialEntries };

  return {
    getItem(key) {
      return Object.prototype.hasOwnProperty.call(storage, key)
        ? storage[key]
        : null;
    },
    setItem(key, value) {
      storage[key] = String(value);
    },
    removeItem(key) {
      delete storage[key];
    },
  };
}

function createCompletedMatch(overrides = {}) {
  return {
    gameMode: "cpu",
    boardSize: 3,
    cpuDifficulty: "easy",
    winner: "X",
    isDraw: false,
    finalSquares: ["X", "X", "X", "O", "O", null, null, null, null],
    playerDisplayNames: { X: "Alex", O: "CPU" },
    moves: [
      { player: "X", row: 1, col: 1, squareIndex: 0 },
      { player: "O", row: 2, col: 1, squareIndex: 3 },
      { player: "X", row: 1, col: 2, squareIndex: 1 },
      { player: "O", row: 2, col: 2, squareIndex: 4 },
      { player: "X", row: 1, col: 3, squareIndex: 2 },
    ],
    completedAt: "2026-06-04T12:00:00.000Z",
    ...overrides,
  };
}

describe("recordsService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetCompletedMatchSaveGuardsForTests();
    isUsingSupabaseAuth.mockReturnValue(false);
  });

  test("derives grouped stats from cloud match history", () => {
    const derivedRecords = deriveRecordsFromMatchHistory([
      {
        mode: "cpu",
        board_size: 3,
        difficulty: "easy",
        result: "x_win",
        winner: "X",
        completed_at: "2026-06-01T10:00:00.000Z",
        created_at: "2026-06-01T10:00:00.000Z",
      },
      {
        mode: "cpu",
        board_size: 3,
        difficulty: "easy",
        result: "x_win",
        winner: "X",
        completed_at: "2026-06-02T10:00:00.000Z",
        created_at: "2026-06-02T10:00:00.000Z",
      },
      {
        mode: "cpu",
        board_size: 3,
        difficulty: "easy",
        result: "draw",
        winner: null,
        completed_at: "2026-06-03T10:00:00.000Z",
        created_at: "2026-06-03T10:00:00.000Z",
      },
      {
        mode: "local_multiplayer",
        board_size: 5,
        difficulty: null,
        result: "o_win",
        winner: "O",
        completed_at: "2026-06-04T10:00:00.000Z",
        created_at: "2026-06-04T10:00:00.000Z",
      },
    ]);

    expect(getRecordBucket(derivedRecords, { gameMode: "cpu", boardSize: 3 })).toEqual({
      wins: 2,
      losses: 0,
      draws: 1,
      currentWinStreak: 0,
      bestWinStreak: 2,
      totalGames: 3,
    });
    expect(
      getRecordBucket(derivedRecords, { gameMode: "human", boardSize: 5 })
    ).toEqual({
      xWins: 0,
      oWins: 1,
      draws: 0,
      totalGames: 1,
    });
  });

  test("keeps guest records local when saving a completed match", async () => {
    const storage = createMemoryStorage();
    const result = await saveCompletedMatchResult({
      authUser: null,
      storage,
      currentRecords: createDefaultLocalRecords(),
      matchData: createCompletedMatch(),
      saveKey: "guest:1",
    });

    expect(result.didSave).toBe(true);
    expect(result.source).toBe("local");
    expect(
      getRecordBucket(loadLocalRecords(storage), { gameMode: "cpu", boardSize: 3 })
    ).toEqual({
      wins: 1,
      losses: 0,
      draws: 0,
      currentWinStreak: 1,
      bestWinStreak: 1,
      totalGames: 1,
    });
  });

  test("loads cloud records for signed-in Supabase users", async () => {
    isUsingSupabaseAuth.mockReturnValue(true);
    fetchCloudMatchHistory.mockResolvedValue([
      {
        mode: "local_multiplayer",
        board_size: 4,
        difficulty: null,
        result: "x_win",
        winner: "X",
        completed_at: "2026-06-04T10:00:00.000Z",
        created_at: "2026-06-04T10:00:00.000Z",
      },
    ]);

    const result = await loadRecords({
      authUser: {
        id: "user-1",
        email: "player@example.com",
        provider: "email",
      },
    });

    expect(result.source).toBe("cloud");
    expect(
      getRecordBucket(result.records, { gameMode: "human", boardSize: 4 })
    ).toEqual({
      xWins: 1,
      oWins: 0,
      draws: 0,
      totalGames: 1,
    });
  });

  test("prevents duplicate cloud saves for the same completed match", async () => {
    isUsingSupabaseAuth.mockReturnValue(true);

    let resolveInsert;
    insertCloudMatchHistory.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveInsert = resolve;
        })
    );

    const authUser = {
      id: "user-1",
      email: "player@example.com",
      provider: "email",
    };

    const firstSavePromise = saveCompletedMatchResult({
      authUser,
      currentRecords: createDefaultLocalRecords(),
      matchData: createCompletedMatch(),
      saveKey: "user-1:match-42",
    });
    const duplicateSaveResult = await saveCompletedMatchResult({
      authUser,
      currentRecords: createDefaultLocalRecords(),
      matchData: createCompletedMatch(),
      saveKey: "user-1:match-42",
    });

    expect(duplicateSaveResult.didSave).toBe(false);
    expect(duplicateSaveResult.isDuplicate).toBe(true);
    expect(insertCloudMatchHistory).toHaveBeenCalledTimes(1);

    resolveInsert();
    const firstSaveResult = await firstSavePromise;

    expect(firstSaveResult.didSave).toBe(true);
    expect(firstSaveResult.source).toBe("cloud");
  });

  test("clears cloud records for signed-in Supabase users", async () => {
    isUsingSupabaseAuth.mockReturnValue(true);

    const result = await clearRecords({
      authUser: {
        id: "user-1",
        email: "player@example.com",
        provider: "email",
      },
    });

    expect(clearCloudMatchHistory).toHaveBeenCalledTimes(1);
    expect(result).toEqual({
      source: "cloud",
      records: createDefaultLocalRecords(),
    });
  });
});
