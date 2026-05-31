import { memo, useEffect, useRef } from "react";
import { DEFAULT_BOARD_RULES } from "../utils/gameLogic";

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "textarea:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

const WINNING_PATTERNS = [
  {
    label: "Horizontal win",
    description: "Three X marks fill the top row.",
    cells: ["X", "X", "X", null, "O", null, "O", null, null],
    winningCells: [0, 1, 2],
  },
  {
    label: "Vertical win",
    description: "Three X marks fill the first column.",
    cells: ["X", "O", null, "X", "O", null, "X", null, null],
    winningCells: [0, 3, 6],
  },
  {
    label: "Diagonal win",
    description: "Three X marks connect corner to corner.",
    cells: ["X", "O", null, "O", "X", null, null, null, "X"],
    winningCells: [0, 4, 8],
  },
];

function LearnModal({ boardRules = DEFAULT_BOARD_RULES, onClose }) {
  const dialogRef = useRef(null);
  const closeButtonRef = useRef(null);
  const totalSquares = boardRules.boardSize * boardRules.boardSize;

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== "Tab") {
        return;
      }

      const focusableElements = Array.from(
        dialogRef.current?.querySelectorAll(FOCUSABLE_SELECTOR) ?? []
      );

      if (focusableElements.length === 0) {
        event.preventDefault();
        dialogRef.current?.focus();
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  function handleOverlayMouseDown(event) {
    if (event.target === event.currentTarget) {
      onClose();
    }
  }

  return (
    <div className="modal-overlay" onMouseDown={handleOverlayMouseDown}>
      <section
        id="learn-modal"
        ref={dialogRef}
        className="learn-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="learn-modal-title"
        aria-describedby="learn-modal-description"
        tabIndex="-1"
      >
        <div className="learn-modal-header">
          <div>
            <p className="eyebrow">Quick guide</p>
            <h2 id="learn-modal-title">Learn how to play</h2>
          </div>

          <button
            ref={closeButtonRef}
            type="button"
            className="modal-close-button"
            onClick={onClose}
            aria-label="Close learn how to play guide"
          >
            Close
          </button>
        </div>

        <p id="learn-modal-description" className="learn-modal-intro">
          Tic-tac-toe is a two-player game where X and O race to claim{" "}
          {boardRules.winLength} squares in a straight line on the current{" "}
          {boardRules.boardSize} x {boardRules.boardSize} board.
        </p>

        <div className="learn-sections">
          <section>
            <h3>Taking turns</h3>
            <p>
              X plays first, then O. Pick any empty square on your turn. Filled
              squares cannot be changed unless you jump back in history.
            </p>
          </section>

          <section>
            <h3>Winning lines</h3>
            <p>
              Win by placing {boardRules.winLength} of your marks in one row,
              one column, or one diagonal. The winning squares are highlighted
              when the round ends.
            </p>
          </section>

          <section>
            <h3>Draws and reset</h3>
            <p>
              If all {totalSquares} squares are filled and nobody has a winning
              line, the game is a draw. Use Reset Game to clear the board and
              start over with the selected board size.
            </p>
          </section>

          <section>
            <h3>Move history</h3>
            <p>
              The history panel records every move with its row and column. Jump
              to an earlier move to review the game; playing from there replaces
              the future moves with a new timeline.
            </p>
          </section>
        </div>

        <section
          className="winning-patterns"
          aria-labelledby="winning-patterns-title"
        >
          <div className="winning-patterns-copy">
            <p className="eyebrow">Winning patterns</p>
            <h3 id="winning-patterns-title">Example winning patterns</h3>
            <p>
              These classic 3 x 3 examples show rows, columns, and diagonals. A
              highlighted cell also says WIN, so the example is clear even
              without relying on color.
            </p>
          </div>

          <div className="pattern-grid">
            {WINNING_PATTERNS.map((pattern) => (
              <article className="pattern-card" key={pattern.label}>
                <h4>{pattern.label}</h4>
                <p>{pattern.description}</p>

                <div
                  className="pattern-board"
                  role="img"
                  aria-label={`${pattern.label}: ${pattern.description}`}
                >
                  {pattern.cells.map((cell, index) => {
                    const isWinningCell = pattern.winningCells.includes(index);
                    const cellLabel = cell ?? "";

                    return (
                      <span
                        className={`pattern-cell${
                          isWinningCell ? " pattern-cell-winning" : ""
                        }`}
                        key={index}
                        aria-hidden="true"
                      >
                        <span className="pattern-cell-mark">{cellLabel}</span>
                        {isWinningCell ? (
                          <span className="pattern-cell-badge">WIN</span>
                        ) : null}
                      </span>
                    );
                  })}
                </div>
              </article>
            ))}
          </div>
        </section>
      </section>
    </div>
  );
}

export default memo(LearnModal);
