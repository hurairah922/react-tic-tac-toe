import {
  LOCAL_RECORDS_STORAGE_KEY,
  clearLocalRecords,
  createDefaultLocalRecords,
  getRecordBucket,
  hasRecordedGames,
  loadLocalRecords,
  saveLocalRecords,
  updateRecordsForResult,
} from "./localRecords";

function createMemoryStorage(initialValue) {
  const storage = {};

  if (initialValue !== undefined) {
    storage[LOCAL_RECORDS_STORAGE_KEY] = initialValue;
  }

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

describe("localRecords", () => {
  test("creates default record buckets for every mode and board size", () => {
    const records = createDefaultLocalRecords();

    expect(records.buckets.human["3"]).toEqual({
      xWins: 0,
      oWins: 0,
      draws: 0,
      totalGames: 0,
    });
    expect(records.buckets.cpu["5"]).toEqual({
      wins: 0,
      losses: 0,
      draws: 0,
      currentWinStreak: 0,
      bestWinStreak: 0,
      totalGames: 0,
    });
  });

  test("tracks cpu wins, losses, draws, and streaks separately by board size", () => {
    let records = createDefaultLocalRecords();

    records = updateRecordsForResult(records, {
      gameMode: "cpu",
      boardSize: 3,
      winner: "X",
      isDraw: false,
    });
    records = updateRecordsForResult(records, {
      gameMode: "cpu",
      boardSize: 3,
      winner: "X",
      isDraw: false,
    });
    records = updateRecordsForResult(records, {
      gameMode: "cpu",
      boardSize: 3,
      winner: null,
      isDraw: true,
    });
    records = updateRecordsForResult(records, {
      gameMode: "cpu",
      boardSize: 4,
      winner: "O",
      isDraw: false,
    });

    expect(getRecordBucket(records, { gameMode: "cpu", boardSize: 3 })).toEqual({
      wins: 2,
      losses: 0,
      draws: 1,
      currentWinStreak: 0,
      bestWinStreak: 2,
      totalGames: 3,
    });
    expect(getRecordBucket(records, { gameMode: "cpu", boardSize: 4 })).toEqual({
      wins: 0,
      losses: 1,
      draws: 0,
      currentWinStreak: 0,
      bestWinStreak: 0,
      totalGames: 1,
    });
  });

  test("tracks human records without assigning losses to either player", () => {
    let records = createDefaultLocalRecords();

    records = updateRecordsForResult(records, {
      gameMode: "human",
      boardSize: 5,
      winner: "X",
      isDraw: false,
    });
    records = updateRecordsForResult(records, {
      gameMode: "human",
      boardSize: 5,
      winner: "O",
      isDraw: false,
    });
    records = updateRecordsForResult(records, {
      gameMode: "human",
      boardSize: 5,
      winner: null,
      isDraw: true,
    });

    expect(getRecordBucket(records, { gameMode: "human", boardSize: 5 })).toEqual({
      xWins: 1,
      oWins: 1,
      draws: 1,
      totalGames: 3,
    });
  });

  test("loads safe defaults when storage is malformed or unavailable", () => {
    const malformedStorage = createMemoryStorage("{not-json");
    const throwingStorage = {
      getItem() {
        throw new Error("unavailable");
      },
    };

    expect(loadLocalRecords(malformedStorage)).toEqual(createDefaultLocalRecords());
    expect(loadLocalRecords(throwingStorage)).toEqual(
      createDefaultLocalRecords()
    );
  });

  test("normalizes malformed stored data and keeps clear/save safe", () => {
    const storage = createMemoryStorage(
      JSON.stringify({
        version: 999,
        buckets: {
          cpu: {
            3: {
              wins: 2,
              losses: -5,
              draws: "3",
              currentWinStreak: 4,
              bestWinStreak: 2,
            },
          },
          human: {
            4: {
              xWins: 1,
              oWins: "2",
            },
          },
        },
      })
    );

    const records = loadLocalRecords(storage);

    expect(getRecordBucket(records, { gameMode: "cpu", boardSize: 3 })).toEqual({
      wins: 2,
      losses: 0,
      draws: 3,
      currentWinStreak: 4,
      bestWinStreak: 4,
      totalGames: 5,
    });
    expect(getRecordBucket(records, { gameMode: "human", boardSize: 4 })).toEqual({
      xWins: 1,
      oWins: 2,
      draws: 0,
      totalGames: 3,
    });

    saveLocalRecords(records, storage);
    expect(hasRecordedGames(loadLocalRecords(storage))).toBe(true);

    clearLocalRecords(storage);
    expect(loadLocalRecords(storage)).toEqual(createDefaultLocalRecords());
  });
});
