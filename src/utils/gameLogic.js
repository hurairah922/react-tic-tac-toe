export const BOARD_SIZE = 3;

const WINNING_LINES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

export function createEmptyBoard() {
  return Array(BOARD_SIZE * BOARD_SIZE).fill(null);
}

export function calculateWinner(squares) {
  // Return both the winner and the exact line so the UI can highlight it.
  for (const [first, second, third] of WINNING_LINES) {
    if (
      squares[first] &&
      squares[first] === squares[second] &&
      squares[first] === squares[third]
    ) {
      return {
        winner: squares[first],
        line: [first, second, third],
      };
    }
  }

  return null;
}

export function isBoardFull(squares) {
  return squares.every(Boolean);
}

export function getMoveLocation(squareIndex) {
  // Convert the internal 0-based square index into the tutorial's 1-based
  // row and column display format for move history.
  return {
    row: Math.floor(squareIndex / BOARD_SIZE) + 1,
    col: (squareIndex % BOARD_SIZE) + 1,
  };
}
