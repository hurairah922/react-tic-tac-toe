export const SUPPORTED_BOARD_SIZES = [3, 4, 5];
export const DEFAULT_BOARD_SIZE = 3;

export function getDefaultWinLength(boardSize = DEFAULT_BOARD_SIZE) {
  return boardSize === 5 ? 4 : boardSize;
}

export function createBoardRules(boardSize = DEFAULT_BOARD_SIZE) {
  const numericBoardSize = Number(boardSize);
  const safeBoardSize = SUPPORTED_BOARD_SIZES.includes(numericBoardSize)
    ? numericBoardSize
    : DEFAULT_BOARD_SIZE;

  return {
    boardSize: safeBoardSize,
    winLength: getDefaultWinLength(safeBoardSize),
  };
}

export const DEFAULT_BOARD_RULES = Object.freeze({
  ...createBoardRules(DEFAULT_BOARD_SIZE),
});

function normalizeBoardRules(boardRules = DEFAULT_BOARD_RULES) {
  const boardSize = boardRules.boardSize ?? DEFAULT_BOARD_RULES.boardSize;
  const winLength = boardRules.winLength ?? getDefaultWinLength(boardSize);

  return { boardSize, winLength };
}

function isWithinBoard(row, column, boardSize) {
  return row >= 0 && row < boardSize && column >= 0 && column < boardSize;
}

function getSquareIndex(row, column, boardSize) {
  return row * boardSize + column;
}

export function createEmptyBoard(boardSize = DEFAULT_BOARD_RULES.boardSize) {
  return Array(boardSize * boardSize).fill(null);
}

export function calculateWinner(squares, boardRules = DEFAULT_BOARD_RULES) {
  const { boardSize, winLength } = normalizeBoardRules(boardRules);
  const directions = [
    [0, 1],
    [1, 0],
    [1, 1],
    [1, -1],
  ];

  for (let row = 0; row < boardSize; row += 1) {
    for (let column = 0; column < boardSize; column += 1) {
      const squareIndex = getSquareIndex(row, column, boardSize);
      const player = squares[squareIndex];

      if (!player) {
        continue;
      }

      for (const [rowStep, columnStep] of directions) {
        const lastRow = row + rowStep * (winLength - 1);
        const lastColumn = column + columnStep * (winLength - 1);

        if (!isWithinBoard(lastRow, lastColumn, boardSize)) {
          continue;
        }

        const line = [];
        let hasWinningLine = true;

        for (let offset = 0; offset < winLength; offset += 1) {
          const nextRow = row + rowStep * offset;
          const nextColumn = column + columnStep * offset;
          const nextIndex = getSquareIndex(nextRow, nextColumn, boardSize);

          if (squares[nextIndex] !== player) {
            hasWinningLine = false;
            break;
          }

          line.push(nextIndex);
        }

        if (hasWinningLine) {
          return { winner: player, line };
        }
      }
    }
  }

  return null;
}

export function isBoardFull(squares) {
  return squares.every(Boolean);
}

export function getMoveLocation(
  squareIndex,
  boardSize = DEFAULT_BOARD_RULES.boardSize
) {
  return {
    row: Math.floor(squareIndex / boardSize) + 1,
    col: (squareIndex % boardSize) + 1,
  };
}
