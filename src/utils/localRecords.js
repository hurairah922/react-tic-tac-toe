import { SUPPORTED_BOARD_SIZES } from "./gameLogic";

export const LOCAL_RECORDS_STORAGE_KEY = "tic-tac-toe-local-records";
export const LOCAL_RECORDS_VERSION = 1;

const DEFAULT_GAME_MODE = "human";
const DEFAULT_CPU_RECORDS = Object.freeze({
  wins: 0,
  losses: 0,
  draws: 0,
  currentWinStreak: 0,
  bestWinStreak: 0,
  totalGames: 0,
});
const DEFAULT_HUMAN_RECORDS = Object.freeze({
  xWins: 0,
  oWins: 0,
  draws: 0,
  totalGames: 0,
});

function getStorage(storage) {
  if (storage) {
    return storage;
  }

  if (typeof window === "undefined") {
    return null;
  }

  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function createCpuRecordBucket() {
  return { ...DEFAULT_CPU_RECORDS };
}

function createHumanRecordBucket() {
  return { ...DEFAULT_HUMAN_RECORDS };
}

function createModeBuckets(gameMode) {
  const createBucket =
    gameMode === "cpu" ? createCpuRecordBucket : createHumanRecordBucket;

  return SUPPORTED_BOARD_SIZES.reduce((buckets, boardSize) => {
    buckets[String(boardSize)] = createBucket();
    return buckets;
  }, {});
}

function getSafeCount(value) {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue) || numericValue < 0) {
    return 0;
  }

  return Math.floor(numericValue);
}

function normalizeBoardSize(boardSize) {
  const numericBoardSize = Number(boardSize);

  return SUPPORTED_BOARD_SIZES.includes(numericBoardSize)
    ? String(numericBoardSize)
    : String(SUPPORTED_BOARD_SIZES[0]);
}

function normalizeCpuBucket(bucket = {}) {
  const wins = getSafeCount(bucket.wins);
  const losses = getSafeCount(bucket.losses);
  const draws = getSafeCount(bucket.draws);
  const currentWinStreak = getSafeCount(bucket.currentWinStreak);
  const bestWinStreak = Math.max(
    getSafeCount(bucket.bestWinStreak),
    currentWinStreak
  );
  const totalGames = Math.max(getSafeCount(bucket.totalGames), wins + losses + draws);

  return {
    wins,
    losses,
    draws,
    currentWinStreak,
    bestWinStreak,
    totalGames,
  };
}

function normalizeHumanBucket(bucket = {}) {
  const xWins = getSafeCount(bucket.xWins);
  const oWins = getSafeCount(bucket.oWins);
  const draws = getSafeCount(bucket.draws);
  const totalGames = Math.max(getSafeCount(bucket.totalGames), xWins + oWins + draws);

  return {
    xWins,
    oWins,
    draws,
    totalGames,
  };
}

function normalizeModeBuckets(sourceBuckets = {}, gameMode) {
  return SUPPORTED_BOARD_SIZES.reduce((buckets, boardSize) => {
    const boardKey = String(boardSize);
    buckets[boardKey] =
      gameMode === "cpu"
        ? normalizeCpuBucket(sourceBuckets[boardKey])
        : normalizeHumanBucket(sourceBuckets[boardKey]);
    return buckets;
  }, {});
}

function cloneModeBuckets(modeBuckets) {
  return SUPPORTED_BOARD_SIZES.reduce((buckets, boardSize) => {
    const boardKey = String(boardSize);
    buckets[boardKey] = { ...modeBuckets[boardKey] };
    return buckets;
  }, {});
}

function cloneLocalRecords(records) {
  return {
    version: LOCAL_RECORDS_VERSION,
    buckets: {
      human: cloneModeBuckets(records.buckets.human),
      cpu: cloneModeBuckets(records.buckets.cpu),
    },
  };
}

export function createDefaultLocalRecords() {
  return {
    version: LOCAL_RECORDS_VERSION,
    buckets: {
      human: createModeBuckets("human"),
      cpu: createModeBuckets("cpu"),
    },
  };
}

export function normalizeLocalRecords(records) {
  const safeRecords =
    records && typeof records === "object" ? records : createDefaultLocalRecords();
  const sourceBuckets =
    safeRecords.buckets && typeof safeRecords.buckets === "object"
      ? safeRecords.buckets
      : {};

  return {
    version: LOCAL_RECORDS_VERSION,
    buckets: {
      human: normalizeModeBuckets(sourceBuckets.human, "human"),
      cpu: normalizeModeBuckets(sourceBuckets.cpu, "cpu"),
    },
  };
}

export function loadLocalRecords(storage) {
  const safeStorage = getStorage(storage);

  if (!safeStorage) {
    return createDefaultLocalRecords();
  }

  try {
    const storedValue = safeStorage.getItem(LOCAL_RECORDS_STORAGE_KEY);

    if (!storedValue) {
      return createDefaultLocalRecords();
    }

    return normalizeLocalRecords(JSON.parse(storedValue));
  } catch {
    return createDefaultLocalRecords();
  }
}

export function saveLocalRecords(records, storage) {
  const normalizedRecords = normalizeLocalRecords(records);
  const safeStorage = getStorage(storage);

  if (!safeStorage) {
    return normalizedRecords;
  }

  try {
    safeStorage.setItem(
      LOCAL_RECORDS_STORAGE_KEY,
      JSON.stringify(normalizedRecords)
    );
  } catch {
    return normalizedRecords;
  }

  return normalizedRecords;
}

export function clearLocalRecords(storage) {
  const safeStorage = getStorage(storage);

  if (!safeStorage) {
    return;
  }

  try {
    safeStorage.removeItem(LOCAL_RECORDS_STORAGE_KEY);
  } catch {
    // Ignore unavailable storage so the game stays playable.
  }
}

export function getRecordBucket(records, { gameMode, boardSize }) {
  const normalizedRecords = normalizeLocalRecords(records);
  const modeKey = gameMode === "cpu" ? "cpu" : DEFAULT_GAME_MODE;
  const boardKey = normalizeBoardSize(boardSize);

  return normalizedRecords.buckets[modeKey][boardKey];
}

export function hasRecordedGames(records) {
  const normalizedRecords = normalizeLocalRecords(records);

  return ["human", "cpu"].some((gameMode) =>
    SUPPORTED_BOARD_SIZES.some(
      (boardSize) =>
        normalizedRecords.buckets[gameMode][String(boardSize)].totalGames > 0
    )
  );
}

export function updateRecordsForResult(
  records,
  { gameMode, boardSize, winner, isDraw, humanPlayer = "X", cpuPlayer = "O" }
) {
  if (!isDraw && winner !== "X" && winner !== "O") {
    return normalizeLocalRecords(records);
  }

  const normalizedRecords = normalizeLocalRecords(records);
  const nextRecords = cloneLocalRecords(normalizedRecords);
  const modeKey = gameMode === "cpu" ? "cpu" : DEFAULT_GAME_MODE;
  const boardKey = normalizeBoardSize(boardSize);
  const bucket = nextRecords.buckets[modeKey][boardKey];

  bucket.totalGames += 1;

  if (modeKey === "cpu") {
    if (isDraw) {
      bucket.draws += 1;
      bucket.currentWinStreak = 0;
      return nextRecords;
    }

    if (winner === humanPlayer) {
      bucket.wins += 1;
      bucket.currentWinStreak += 1;
      bucket.bestWinStreak = Math.max(
        bucket.bestWinStreak,
        bucket.currentWinStreak
      );
      return nextRecords;
    }

    if (winner === cpuPlayer) {
      bucket.losses += 1;
      bucket.currentWinStreak = 0;
    }

    return nextRecords;
  }

  if (isDraw) {
    bucket.draws += 1;
  } else if (winner === "X") {
    bucket.xWins += 1;
  } else {
    bucket.oWins += 1;
  }

  return nextRecords;
}
