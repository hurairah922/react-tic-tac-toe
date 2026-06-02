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
}) {
  const isCpuMode = gameMode === "cpu";
  const nextPlayer = xIsNext ? "X" : "O";
  const startingPlayerLabel = isCpuMode
    ? startingPlayer === "X"
      ? "You (X)"
      : "CPU (O)"
    : `Player ${startingPlayer}`;
  const cpuDifficultyLabel =
    cpuDifficulty.charAt(0).toUpperCase() + cpuDifficulty.slice(1);
  const lastMoveSummary = lastMoveLocation
    ? `${
        isCpuMode && lastMovePlayer === "O" ? "CPU" : `Player ${lastMovePlayer}`
      } played row ${lastMoveLocation.row}, column ${lastMoveLocation.col}.`
    : null;

  let status = `Next player: ${nextPlayer}`;
  let detail =
    currentMove === 0
      ? "Choose an empty square to begin the round."
      : "Choose an empty square to continue.";

  if (winner) {
    status =
      isCpuMode && winner === "X"
        ? "You win!"
        : isCpuMode && winner === "O"
        ? "CPU wins!"
        : `Winner: ${winner}`;
    detail = "The winning line is highlighted on the board.";
  } else if (isDraw) {
    status = "Draw: no winner";
    detail = "The board is full, so the round ends in a draw.";
  } else if (currentMove === 0) {
    status = `Starting player: ${startingPlayerLabel}`;
    detail = isCpuMode
      ? startingPlayer === "X"
        ? "You make the first move in this round."
        : "CPU makes the first move in this round."
      : `Player ${startingPlayer} makes the first move in this round.`;
  } else if (isCpuMode) {
    status = isCpuTurn ? "CPU turn" : "Your turn";
    detail = isCpuTurn
      ? "CPU is choosing a move. The board is locked until it finishes."
      : lastMoveSummary ?? "You are X. Choose an empty square to continue.";
  } else if (lastMoveSummary) {
    detail = `${lastMoveSummary} ${detail}`;
  }

  return (
    <header className="status-panel">
      <div>
        <p className="eyebrow">A Modern</p>
        <h1>Tic-Tac-Toe</h1>
      </div>

      <div className="status-summary" aria-live="polite">
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
    </header>
  );
}

export default memo(StatusPanel);
