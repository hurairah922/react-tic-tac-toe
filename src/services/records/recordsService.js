import { isUsingSupabaseAuth } from "../authService";
import {
  clearLocalRecords,
  createDefaultLocalRecords,
  loadLocalRecords,
  saveLocalRecords,
  updateRecordsForResult,
} from "../../utils/localRecords";
import {
  clearCloudMatchHistory,
  fetchCloudMatchHistory,
  insertCloudMatchHistory,
} from "./cloudRecords";
import {
  createValidatedMatchRecord,
  getLocalGameModeForRecordMode,
} from "./recordValidation";

const completedMatchSaveGuards = new Set();
const inFlightCompletedMatchSaves = new Set();

function applyMatchResult(records, matchRecord) {
  return updateRecordsForResult(records, {
    gameMode: getLocalGameModeForRecordMode(matchRecord.mode),
    boardSize: matchRecord.board_size,
    winner: matchRecord.winner,
    isDraw: matchRecord.result === "draw",
    humanPlayer: matchRecord.human_symbol ?? "X",
    cpuPlayer: (matchRecord.human_symbol ?? "X") === "X" ? "O" : "X",
  });
}

function sortMatchHistoryRows(matchHistoryRows) {
  return [...matchHistoryRows].sort((leftRow, rightRow) => {
    const completedDifference =
      new Date(leftRow.completed_at).getTime() -
      new Date(rightRow.completed_at).getTime();

    if (completedDifference !== 0) {
      return completedDifference;
    }

    return (
      new Date(leftRow.created_at ?? leftRow.completed_at).getTime() -
      new Date(rightRow.created_at ?? rightRow.completed_at).getTime()
    );
  });
}

export function shouldUseCloudRecords(authUser) {
  return Boolean(
    authUser &&
      authUser.provider &&
      authUser.provider !== "local" &&
      isUsingSupabaseAuth()
  );
}

export function deriveRecordsFromMatchHistory(matchHistoryRows = []) {
  return sortMatchHistoryRows(
    Array.isArray(matchHistoryRows) ? matchHistoryRows : []
  ).reduce((records, row) => applyMatchResult(records, row), createDefaultLocalRecords());
}

export async function loadRecords({ authUser, storage } = {}) {
  if (!shouldUseCloudRecords(authUser)) {
    return {
      source: "local",
      records: loadLocalRecords(storage),
    };
  }

  const matchHistoryRows = await fetchCloudMatchHistory(authUser);

  return {
    source: "cloud",
    records: deriveRecordsFromMatchHistory(matchHistoryRows),
  };
}

export async function clearRecords({ authUser, storage } = {}) {
  if (!shouldUseCloudRecords(authUser)) {
    clearLocalRecords(storage);

    return {
      source: "local",
      records: createDefaultLocalRecords(),
    };
  }

  await clearCloudMatchHistory(authUser);

  return {
    source: "cloud",
    records: createDefaultLocalRecords(),
  };
}

export function resetCompletedMatchSaveGuardsForTests() {
  completedMatchSaveGuards.clear();
  inFlightCompletedMatchSaves.clear();
}

export async function saveCompletedMatchResult({
  authUser,
  storage,
  currentRecords,
  matchData,
  saveKey,
} = {}) {
  const safeCurrentRecords =
    currentRecords ?? (shouldUseCloudRecords(authUser)
      ? createDefaultLocalRecords()
      : loadLocalRecords(storage));
  const matchRecord = createValidatedMatchRecord(matchData);
  const source = shouldUseCloudRecords(authUser) ? "cloud" : "local";

  if (!matchRecord) {
    return {
      didSave: false,
      source,
      records: safeCurrentRecords,
    };
  }

  if (saveKey && (completedMatchSaveGuards.has(saveKey) || inFlightCompletedMatchSaves.has(saveKey))) {
    return {
      didSave: false,
      source,
      records: safeCurrentRecords,
      isDuplicate: true,
    };
  }

  if (source === "local") {
    const nextRecords = saveLocalRecords(
      applyMatchResult(safeCurrentRecords, matchRecord),
      storage
    );

    if (saveKey) {
      completedMatchSaveGuards.add(saveKey);
    }

    return {
      didSave: true,
      source,
      records: nextRecords,
    };
  }

  if (saveKey) {
    inFlightCompletedMatchSaves.add(saveKey);
  }

  try {
    await insertCloudMatchHistory(authUser, matchRecord);

    if (saveKey) {
      completedMatchSaveGuards.add(saveKey);
    }

    return {
      didSave: true,
      source,
      records: applyMatchResult(safeCurrentRecords, matchRecord),
    };
  } catch (error) {
    return {
      didSave: false,
      source,
      records: safeCurrentRecords,
      errorMessage:
        error?.message ||
        "Could not save cloud records right now. Gameplay is still available.",
    };
  } finally {
    if (saveKey) {
      inFlightCompletedMatchSaves.delete(saveKey);
    }
  }
}
