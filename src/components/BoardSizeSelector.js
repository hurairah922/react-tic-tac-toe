import { memo } from "react";
import {
  createBoardRules,
  SUPPORTED_BOARD_SIZES,
} from "../utils/gameLogic";

function BoardSizeSelector({ boardRules, onBoardSizeChange }) {
  return (
    <section className="setup-section" aria-labelledby="board-setup-title">
      <div className="setup-section-copy">
        <h3 id="board-setup-title">Choose your board</h3>
        <p>
          Current rule: get {boardRules.winLength} in a row on a{" "}
          {boardRules.boardSize} x {boardRules.boardSize} board to win.
        </p>
      </div>

      <fieldset className="board-size-options">
        <legend>Board size</legend>
        {SUPPORTED_BOARD_SIZES.map((boardSize) => {
          const rules = createBoardRules(boardSize);
          const optionId = `board-size-${boardSize}`;
          const isSelected = boardRules.boardSize === boardSize;

          return (
            <label
              className={`board-size-option${
                isSelected ? " board-size-option-selected" : ""
              }`}
              htmlFor={optionId}
              key={boardSize}
            >
              <input
                id={optionId}
                type="radio"
                name="board-size"
                value={boardSize}
                checked={isSelected}
                onChange={() => onBoardSizeChange(boardSize)}
              />
              <span className="board-size-label">
                {boardSize} x {boardSize}
              </span>
              <span className="board-size-rule">
                {rules.winLength} in a row
              </span>
            </label>
          );
        })}
      </fieldset>
    </section>
  );
}

export default memo(BoardSizeSelector);
