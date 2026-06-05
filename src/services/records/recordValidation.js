import { calculateWinner, createBoardRules, isBoardFull } from "../../utils/gameLogic";

export const SUPPORTED_RECORD_MODES = ["cpu", "local", "local_multiplayer"];
export const SUPPORTED_CPU_DIFFICULTIES = ["easy", "medium", "hard"];

function normalizeName(name) {
  const normalizedName = String(name ?? "")
    .trim()
    .replace(/\s+/g, " ")
    .slice(0, 24);

  return normalizedName || null;
}

function normalizeMode(gameMode) {
  if (gameMode === "human") {
    return "local_multiplayer";
  }

  if (SUPPORTED_RECORD_MODES.includes(gameMode)) {
    return gameMode === "local" ? "local_multiplayer" : gameMode;
  }

  return null;
}

function normalizeDifficulty(mode, difficulty) {
  if (mode !== "cpu") {
    return null;
  }

  return SUPPORTED_CPU_DIFFICULTIES.includes(difficulty) ? difficulty : null;
}

function normalizeResult({ winner, isDraw }) {
  if (isDraw) {
    return "draw";
  }

  if (winner === "X") {
    return "x_win";
  }

  if (winner === "O") {
    return "o_win";
  }

  return null;
}

function normalizeWinner(result, winner) {
  if (result === "draw") {
    return null;
  }

  return winner === "X" || winner === "O" ? winner : null;
}

function normalizeMove(move, moveNumber, boardSize) {
  if (!move || typeof move !== "object") {
    return null;
  }

  const row = Number(move.row);
  const col = Number(move.col);
  const squareIndex = Number(move.squareIndex);

  if (
    move.player !== "X" &&
    move.player !== "O" &&
    move.player !== null &&
    move.player !== undefined
  ) {
    return null;
  }

  if (
    !Number.isInteger(row) ||
    !Number.isInteger(col) ||
    row < 1 ||
    col < 1 ||
    row > boardSize ||
    col > boardSize
  ) {
    return null;
  }

  if (
    !Number.isInteger(squareIndex) ||
    squareIndex < 0 ||
    squareIndex >= boardSize * boardSize
  ) {
    return null;
  }

  return {
    move: moveNumber,
    player: move.player === "X" || move.player === "O" ? move.player : null,
    row,
    col,
    squareIndex,
  };
}

function normalizeMoves(moves, boardSize) {
  if (!Array.isArray(moves)) {
    return [];
  }

  return moves.reduce((normalizedMoves, move, index) => {
    const normalizedMove = normalizeMove(move, index + 1, boardSize);

    if (!normalizedMove) {
      return normalizedMoves;
    }

    normalizedMoves.push(normalizedMove);
    return normalizedMoves;
  }, []);
}

function hasValidSquares(finalSquares, boardSize) {
  return (
    Array.isArray(finalSquares) &&
    finalSquares.length === boardSize * boardSize &&
    finalSquares.every(
      (square) => square === null || square === "X" || square === "O"
    )
  );
}

export function getLocalGameModeForRecordMode(mode) {
  return mode === "cpu" ? "cpu" : "human";
}

export function createValidatedMatchRecord({
  gameMode,
  boardSize,
  cpuDifficulty,
  winner,
  isDraw,
  finalSquares,
  playerDisplayNames,
  moves,
  completedAt,
}) {
  const safeBoardSize = Number(boardSize);
  const mode = normalizeMode(gameMode);
  const difficulty = normalizeDifficulty(mode, cpuDifficulty);
  const result = normalizeResult({ winner, isDraw });
  const normalizedWinner = normalizeWinner(result, winner);

  if (!mode || !Number.isInteger(safeBoardSize) || !result) {
    return null;
  }

  if (mode === "cpu" && !difficulty) {
    return null;
  }

  if (mode !== "cpu" && cpuDifficulty != null) {
    return null;
  }

  if (!hasValidSquares(finalSquares, safeBoardSize)) {
    return null;
  }

  const normalizedMoves = normalizeMoves(moves, safeBoardSize);
  const moveCount = normalizedMoves.length;

  if (moveCount < 1 || moveCount !== finalSquares.filter(Boolean).length) {
    return null;
  }

  const winnerInfo = calculateWinner(finalSquares, createBoardRules(safeBoardSize));
  const boardIsFull = isBoardFull(finalSquares);

  if (result === "draw") {
    if (winnerInfo || !boardIsFull || normalizedWinner !== null) {
      return null;
    }
  } else if (!winnerInfo || winnerInfo.winner !== normalizedWinner || isDraw) {
    return null;
  }

  return {
    mode,
    board_size: safeBoardSize,
    difficulty,
    result,
    winner: normalizedWinner,
    player_x_name: normalizeName(playerDisplayNames?.X),
    player_o_name: normalizeName(playerDisplayNames?.O),
    move_count: moveCount,
    moves: normalizedMoves,
    completed_at: new Date(completedAt ?? Date.now()).toISOString(),
  };
}
