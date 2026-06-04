import { memo } from "react";

function StatusPanel({
  currentMove,
  isDraw,
  winner,
  boardSize,
  winLength,
  startingPlayer,
  xIsNext,
  gameMode,
  cpuDifficulty,
  isCpuTurn,
  lastMovePlayer,
  lastMoveLocation,
  playerDisplayNames,
}) {
  const isCpuMode = gameMode === "cpu";
  const nextPlayer = xIsNext ? "X" : "O";
  const startingPlayerLabel = `${playerDisplayNames[startingPlayer]} (${startingPlayer})`;
  const cpuDifficultyLabel =
    cpuDifficulty.charAt(0).toUpperCase() + cpuDifficulty.slice(1);
  const lastMoveSummary = lastMoveLocation
    ? `${playerDisplayNames[lastMovePlayer]} (${lastMovePlayer}) played row ${
        lastMoveLocation.row
      }, column ${lastMoveLocation.col}.`
    : null;

  let status = `Next player: ${playerDisplayNames[nextPlayer]} (${nextPlayer})`;
  let detail =
    currentMove === 0
      ? "Choose an empty square to begin the round."
      : "Choose an empty square to continue.";

  if (winner) {
    status = `Winner: ${playerDisplayNames[winner]} (${winner})`;
    detail = "The winning line is highlighted on the board.";
  } else if (isDraw) {
    status = `Draw: ${playerDisplayNames.X} and ${playerDisplayNames.O}`;
    detail = "The board is full, so the round ends in a draw.";
  } else if (currentMove === 0) {
    status = `Starting player: ${startingPlayerLabel}`;
    detail = `${playerDisplayNames[startingPlayer]} makes the first move in this round.`;
  } else if (isCpuMode) {
    status = isCpuTurn
      ? `${playerDisplayNames.O} turn`
      : `${playerDisplayNames.X} turn`;
    detail = isCpuTurn
      ? `${playerDisplayNames.O} is choosing a move. The board is locked until it finishes.`
      : lastMoveSummary ??
        `${playerDisplayNames.X} is playing as X. Choose an empty square to continue.`;
  } else if (lastMoveSummary) {
    detail = `${lastMoveSummary} ${detail}`;
  }

  return (
    <section className="status-panel" aria-label="Game status">
      <div className="status-summary" aria-live="polite">
        <p className="eyebrow">Round status</p>
        <p className="status-text">{status}</p>
        <p className="status-detail">{detail}</p>
      </div>

      <dl className="status-stats" aria-label="Game stats">
        <div>
          <dt>Current move</dt>
          <dd>#{currentMove}</dd>
        </div>
        <div>
          <dt>Round starter</dt>
          <dd>{startingPlayerLabel}</dd>
        </div>
        <div>
          <dt>Mode</dt>
          <dd>{isCpuMode ? "Human vs CPU" : "Human vs Human"}</dd>
        </div>
        {isCpuMode ? (
          <div>
            <dt>CPU level</dt>
            <dd>{cpuDifficultyLabel}</dd>
          </div>
        ) : null}
        <div>
          <dt>Board size</dt>
          <dd>
            {boardSize} x {boardSize}
          </dd>
        </div>
        <div>
          <dt>Win condition</dt>
          <dd>{winLength} in a row</dd>
        </div>
      </dl>
    </section>
  );
}

export default memo(StatusPanel);
