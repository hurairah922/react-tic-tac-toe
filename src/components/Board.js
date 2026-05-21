import { memo } from "react";
import Square from "./Square";
import { BOARD_SIZE } from "../utils/gameLogic";

function Board({ squares, onPlay, winningLine, isGameOver }) {
  const rows = Array.from({ length: BOARD_SIZE }, (_, rowIndex) => {
    const columns = Array.from({ length: BOARD_SIZE }, (_, columnIndex) => {
      const squareIndex = rowIndex * BOARD_SIZE + columnIndex;
      const isWinningSquare = winningLine.includes(squareIndex);

      return (
        <Square
          key={squareIndex}
          index={squareIndex}
          value={squares[squareIndex]}
          isWinning={isWinningSquare}
          isDisabled={Boolean(squares[squareIndex]) || isGameOver}
          onClick={() => onPlay(squareIndex)}
        />
      );
    });

    return (
      <div className="board-row" role="row" key={rowIndex}>
        {columns}
      </div>
    );
  });

  return (
    <section className="board-card" aria-labelledby="board-heading">
      <div className="board-copy">
        <p className="eyebrow">Board</p>
        <h2 id="board-heading">Make your move</h2>
      </div>

      <div className="board-grid" role="grid" aria-label="Tic-tac-toe board">
        {rows}
      </div>
    </section>
  );
}

export default memo(Board);
