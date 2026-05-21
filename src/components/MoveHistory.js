import { memo, useMemo } from "react";

function MoveHistory({ history, currentMove, isAscending, onJumpTo }) {
  const orderedMoves = useMemo(() => {
    const indexes = history.map((_, move) => move);
    // Reverse only the rendered move list so the underlying history indexes
    // still map to the same game states during time travel.
    return isAscending ? indexes : indexes.reverse();
  }, [history, isAscending]);

  return (
    <ol className="history-list">
      {orderedMoves.map((move) => {
        const entry = history[move];
        const isCurrentMove = move === currentMove;
        const locationText = entry.moveLocation
          ? ` (${entry.moveLocation.row}, ${entry.moveLocation.col})`
          : "";

        const moveLabel =
          move === 0 ? "Go to game start" : `Go to move #${move}${locationText}`;

        const currentLabel =
          move === 0 ? "You are at move #0" : `You are at move #${move}`;

        return (
          <li key={move} className="history-entry">
            {isCurrentMove ? (
              <div
                className="history-current"
                aria-current="step"
                aria-label={currentLabel}
              >
                <span>{currentLabel}</span>
                {entry.player ? (
                  <span className="history-meta">
                    {entry.player} played at row {entry.moveLocation.row}, column{" "}
                    {entry.moveLocation.col}
                  </span>
                ) : (
                  <span className="history-meta">Initial board state</span>
                )}
              </div>
            ) : (
              <button
                type="button"
                className="history-button"
                onClick={() => onJumpTo(move)}
              >
                <span>{moveLabel}</span>
                {entry.player ? (
                  <span className="history-meta">Played by {entry.player}</span>
                ) : (
                  <span className="history-meta">Initial board state</span>
                )}
              </button>
            )}
          </li>
        );
      })}
    </ol>
  );
}

export default memo(MoveHistory);
