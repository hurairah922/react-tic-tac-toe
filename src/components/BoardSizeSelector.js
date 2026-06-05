import { memo } from "react";
import {
  createBoardRules,
  SUPPORTED_BOARD_SIZES,
} from "../utils/gameLogic";

function BoardSizeSelector({ boardRules, onBoardSizeChange, disabled = false }) {
  return (
    <section className="setup-section" aria-labelledby="board-setup-title">
      <div className="setup-section-copy">
        <h3 id="board-setup-title">Board size</h3>
        <p>
          {boardRules.boardSize} x {boardRules.boardSize} board. Connect{" "}
          {boardRules.winLength} to win.
        </p>
      </div>

      <div className="board-size-button-row" role="group" aria-label="Board size">
        {SUPPORTED_BOARD_SIZES.map((boardSize) => {
          const rules = createBoardRules(boardSize);
          const isSelected = boardRules.boardSize === boardSize;

          return (
            <button
              type="button"
              className={`board-size-button${
                isSelected ? " board-size-button-selected" : ""
              }`}
              disabled={disabled}
              onClick={() => onBoardSizeChange(boardSize)}
              key={boardSize}
            >
              <span className="board-size-button-label">
                {boardSize} x {boardSize}
              </span>
              <span className="board-size-button-rule">
                Connect {rules.winLength}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

export default memo(BoardSizeSelector);
