import { memo } from "react";

function StatusPanel({ currentMove, isDraw, winner, xIsNext }) {
  let status = `Next player: ${xIsNext ? "X" : "O"}`;
  let detail = "Choose an empty square to continue.";

  if (winner) {
    status = `Winner: ${winner}`;
    detail = "The winning line is highlighted on the board.";
  } else if (isDraw) {
    status = "Draw: no winner";
    detail = "The board is full, so the round ends in a draw.";
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
          <dt>Board size</dt>
          <dd>3 x 3</dd>
        </div>
      </dl>
    </header>
  );
}

export default memo(StatusPanel);
