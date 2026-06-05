import { memo, useMemo } from "react";

function MoveHistory({
  history,
  currentMove,
  isAscending,
  onJumpTo,
  playerDisplayNames,
}) {
  const orderedMoves = useMemo(() => {
    const indexes = history.map((_, move) => move);
    // Reverse only the rendered move list so the underlying history indexes
    // still map to the same game states during time travel.
    return isAscending ? indexes : indexes.reverse();
  }, [history, isAscending]);

  const currentEntry = history[currentMove];
  const currentSummary = currentEntry?.player
    ? `${playerDisplayNames[currentEntry.player]} (${currentEntry.player}) played row ${
        currentEntry.moveLocation.row
      }, column ${currentEntry.moveLocation.col}.`
    : "Viewing the initial board state.";

  return (
    <div className="history-dropdown-panel" aria-label="Move history">
      <label className="control-field" htmlFor="move-history-select">
        <span>Jump to move</span>
        <select
          id="move-history-select"
          className="control-select"
          value={currentMove}
          onChange={(event) => onJumpTo(Number(event.target.value))}
        >
          {orderedMoves.map((move) => {
            const entry = history[move];
            const optionLabel =
              move === 0
                ? "Game start"
                : `Move ${move} · ${playerDisplayNames[entry.player]} (${entry.player}) · Row ${entry.moveLocation.row}, Column ${entry.moveLocation.col}`;

            return (
              <option key={move} value={move}>
                {optionLabel}
              </option>
            );
          })}
        </select>
      </label>

      <div className="history-current" aria-live="polite" aria-current="step">
        <span>{currentMove === 0 ? "Current move: Game start" : `Current move: #${currentMove}`}</span>
        <span className="history-meta">{currentSummary}</span>
      </div>
    </div>
  );
}

export default memo(MoveHistory);
