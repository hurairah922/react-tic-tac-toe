import { calculateWinner, DEFAULT_BOARD_RULES } from "./gameLogic";

export const CPU_DIFFICULTIES = Object.freeze(["easy", "medium", "hard"]);

function getEmptySquareIndexes(squares) {
  return squares.reduce((indexes, value, index) => {
    if (!value) {
      indexes.push(index);
    }

    return indexes;
  }, []);
}

function pickRandomMove(indexes, random) {
  if (!indexes.length) {
    return null;
  }

  return indexes[Math.floor(random() * indexes.length)];
}

function findImmediateMove(squares, boardRules, player) {
  const emptySquareIndexes = getEmptySquareIndexes(squares);

  for (const squareIndex of emptySquareIndexes) {
    const nextSquares = squares.slice();
    nextSquares[squareIndex] = player;

    if (calculateWinner(nextSquares, boardRules)?.winner === player) {
      return squareIndex;
    }
  }

  return null;
}

function getCenterSquareIndexes(boardSize) {
  const middleIndex = Math.floor(boardSize / 2);

  if (boardSize % 2 === 1) {
    return [middleIndex * boardSize + middleIndex];
  }

  return [
    (middleIndex - 1) * boardSize + (middleIndex - 1),
    (middleIndex - 1) * boardSize + middleIndex,
    middleIndex * boardSize + (middleIndex - 1),
    middleIndex * boardSize + middleIndex,
  ];
}

function getCornerSquareIndexes(boardSize) {
  const lastIndex = boardSize - 1;

  return [
    0,
    lastIndex,
    lastIndex * boardSize,
    lastIndex * boardSize + lastIndex,
  ];
}

export function chooseCpuMove({
  squares,
  boardRules = DEFAULT_BOARD_RULES,
  difficulty = "easy",
  cpuPlayer = "O",
  humanPlayer = "X",
  random = Math.random,
}) {
  const emptySquareIndexes = getEmptySquareIndexes(squares);

  if (!emptySquareIndexes.length) {
    return null;
  }

  if (difficulty === "easy") {
    return pickRandomMove(emptySquareIndexes, random);
  }

  const winningMove = findImmediateMove(squares, boardRules, cpuPlayer);
  if (winningMove !== null) {
    return winningMove;
  }

  const blockingMove = findImmediateMove(squares, boardRules, humanPlayer);
  if (blockingMove !== null) {
    return blockingMove;
  }

  if (difficulty === "medium") {
    return pickRandomMove(emptySquareIndexes, random);
  }

  const preferredCenterMove = pickRandomMove(
    getCenterSquareIndexes(boardRules.boardSize).filter((squareIndex) =>
      emptySquareIndexes.includes(squareIndex)
    ),
    random
  );

  if (preferredCenterMove !== null) {
    return preferredCenterMove;
  }

  const preferredCornerMove = pickRandomMove(
    getCornerSquareIndexes(boardRules.boardSize).filter((squareIndex) =>
      emptySquareIndexes.includes(squareIndex)
    ),
    random
  );

  if (preferredCornerMove !== null) {
    return preferredCornerMove;
  }

  return pickRandomMove(emptySquareIndexes, random);
}
