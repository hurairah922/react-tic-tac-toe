import { memo } from "react";
import Square from "./Square";
import { DEFAULT_BOARD_RULES } from "../utils/gameLogic";

function Board({
  squares,
  boardSize = DEFAULT_BOARD_RULES.boardSize,
  onPlay,
  winningLine,
  isGameOver,
}) {
  const rowStyle = {
    gridTemplateColumns: `repeat(${boardSize}, minmax(0, 1fr))`,
  };

  const rows = Array.from({ length: boardSize }, (_, rowIndex) => {
    const columns = Array.from({ length: boardSize }, (_, columnIndex) => {
      const squareIndex = rowIndex * boardSize + columnIndex;
      const isWinningSquare = winningLine.includes(squareIndex);

      return (
        <Square
          key={squareIndex}
          index={squareIndex}
          boardSize={boardSize}
          value={squares[squareIndex]}
          isWinning={isWinningSquare}
          isDisabled={Boolean(squares[squareIndex]) || isGameOver}
          onClick={() => onPlay(squareIndex)}
        />
      );
    });

    return (
      <div className="board-row" role="row" style={rowStyle} key={rowIndex}>
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

      <div
        className="board-grid"
        role="grid"
        aria-label="Tic-tac-toe board"
      >
        {rows}
      </div>
    </section>
  );
}

export default memo(Board);
