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
  humanPlayerSymbol,
  cpuPlayerSymbol,
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
      ? `${playerDisplayNames[cpuPlayerSymbol]} turn`
      : `${playerDisplayNames[humanPlayerSymbol]} turn`;
    detail = isCpuTurn
      ? `${playerDisplayNames[cpuPlayerSymbol]} is choosing a move. The board is locked until it finishes.`
      : lastMoveSummary ??
        `${playerDisplayNames[humanPlayerSymbol]} is playing as ${humanPlayerSymbol}. Choose an empty square to continue.`;
  } else if (lastMoveSummary) {
    detail = `${lastMoveSummary} ${detail}`;
  }

  const statusChips = [
    `${isCpuMode ? "Human vs CPU" : "Human vs Human"}`,
    `${boardSize}x${boardSize}`,
    `${winLength} in a row`,
    `Starter: ${playerDisplayNames[startingPlayer]} (${startingPlayer})`,
  ];

  if (isCpuMode) {
    statusChips.push(`You are ${humanPlayerSymbol}`);
    statusChips.push(`CPU: ${cpuDifficultyLabel}`);
  }

  return (
    <section className="status-strip" aria-label="Game status">
      <div className="status-summary" aria-live="polite">
        <p className="eyebrow">Round status</p>
        <p className="status-text">{status}</p>
        <p className="status-detail">{detail}</p>
      </div>

      <div className="status-chip-row" aria-label="Game summary">
        {statusChips.map((chip) => (
          <span className="status-chip" key={chip}>
            {chip}
          </span>
        ))}
        <span className="status-chip status-chip-strong">Move #{currentMove}</span>
      </div>
    </section>
  );
}

export default memo(StatusPanel);
