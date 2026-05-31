import { memo } from "react";

function Square({ index, boardSize, value, isWinning, isDisabled, onClick }) {
  const row = Math.floor(index / boardSize) + 1;
  const column = (index % boardSize) + 1;
  const squareState = value ? `occupied by ${value}` : "empty";

  return (
    <button
      type="button"
      className={`square${isWinning ? " square-winning" : ""}`}
      onClick={onClick}
      disabled={isDisabled}
      aria-label={`Row ${row}, column ${column}, ${squareState}`}
    >
      <span className="square-value" aria-hidden="true">
        {value}
      </span>
      {isWinning ? (
        <span className="square-indicator" aria-hidden="true">
          WIN
        </span>
      ) : null}
    </button>
  );
}

export default memo(Square);
