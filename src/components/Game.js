import { useCallback, useMemo, useState } from "react";
import Board from "./Board";
import MoveHistory from "./MoveHistory";
import StatusPanel from "./StatusPanel";
import {
  calculateWinner,
  createEmptyBoard,
  getMoveLocation,
  isBoardFull,
} from "../utils/gameLogic";

const INITIAL_ENTRY = {
  squares: createEmptyBoard(),
  moveLocation: null,
  player: null,
};

export default function Game() {
  const [history, setHistory] = useState([INITIAL_ENTRY]);
  const [currentMove, setCurrentMove] = useState(0);
  const [isAscending, setIsAscending] = useState(true);

  const currentEntry = history[currentMove];
  const xIsNext = currentMove % 2 === 0;

  const winnerInfo = useMemo(
    () => calculateWinner(currentEntry.squares),
    [currentEntry.squares]
  );
  const isDraw = !winnerInfo && isBoardFull(currentEntry.squares);

  const handlePlay = useCallback(
    (squareIndex) => {
      if (currentEntry.squares[squareIndex] || winnerInfo || isDraw) {
        return;
      }

      const nextSquares = currentEntry.squares.slice();
      const player = xIsNext ? "X" : "O";

      nextSquares[squareIndex] = player;

      // If the user time-traveled earlier, discard the "future" branch before
      // recording the newly chosen move so history stays linear.
      const nextHistory = [
        ...history.slice(0, currentMove + 1),
        {
          squares: nextSquares,
          moveLocation: getMoveLocation(squareIndex),
          player,
        },
      ];

      setHistory(nextHistory);
      setCurrentMove(nextHistory.length - 1);
    },
    [currentEntry.squares, currentMove, history, isDraw, winnerInfo, xIsNext]
  );

  const handleJumpTo = useCallback((nextMove) => {
    setCurrentMove(nextMove);
  }, []);

  const handleReset = useCallback(() => {
    setHistory([INITIAL_ENTRY]);
    setCurrentMove(0);
    setIsAscending(true);
  }, []);

  const handleToggleSort = useCallback(() => {
    setIsAscending((previousValue) => !previousValue);
  }, []);

  return (
    <main className="app-shell">
      <section className="game-card" aria-label="Tic-tac-toe game">
        <StatusPanel
          currentMove={currentMove}
          isDraw={isDraw}
          winner={winnerInfo?.winner ?? null}
          xIsNext={xIsNext}
        />

        <div className="game-layout">
          <div className="board-panel">
            <Board
              squares={currentEntry.squares}
              onPlay={handlePlay}
              winningLine={winnerInfo?.line ?? []}
              isGameOver={Boolean(winnerInfo) || isDraw}
            />
          </div>

          <aside className="sidebar">
            <div className="sidebar-card">
              <div className="sidebar-header">
                <div>
                  <p className="eyebrow">History</p>
                  <h2>Time travel</h2>
                </div>

                <button
                  type="button"
                  className="history-sort-button"
                  onClick={handleToggleSort}
                  aria-pressed={!isAscending}
                  aria-label={`Show moves in ${
                    isAscending ? "descending" : "ascending"
                  } order`}
                >
                  {isAscending ? "Newest first" : "Oldest first"}
                </button>
              </div>

              <MoveHistory
                history={history}
                currentMove={currentMove}
                isAscending={isAscending}
                onJumpTo={handleJumpTo}
              />
            </div>

            <div className="sidebar-card sidebar-actions">
              <div>
                <p className="eyebrow">Controls</p>
                <h2>Start again</h2>
              </div>

              <button
                type="button"
                className="reset-button"
                onClick={handleReset}
                disabled={history.length === 1}
              >
                Reset Game
              </button>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
