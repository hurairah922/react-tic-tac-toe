import { useCallback, useMemo, useRef, useState } from "react";
import Board from "./Board";
import BoardSizeSelector from "./BoardSizeSelector";
import LearnModal from "./LearnModal";
import MoveHistory from "./MoveHistory";
import StatusPanel from "./StatusPanel";
import {
  calculateWinner,
  createBoardRules,
  createEmptyBoard,
  DEFAULT_BOARD_RULES,
  getMoveLocation,
  isBoardFull,
} from "../utils/gameLogic";

function createInitialEntry(boardSize) {
  return {
    squares: createEmptyBoard(boardSize),
    moveLocation: null,
    player: null,
  };
}

export default function Game() {
  const [boardRules, setBoardRules] = useState(DEFAULT_BOARD_RULES);
  const [history, setHistory] = useState(() => [
    createInitialEntry(DEFAULT_BOARD_RULES.boardSize),
  ]);
  const [currentMove, setCurrentMove] = useState(0);
  const [isAscending, setIsAscending] = useState(true);
  const [isLearnModalOpen, setIsLearnModalOpen] = useState(false);
  const learnButtonRef = useRef(null);

  const currentEntry = history[currentMove];
  const { boardSize, winLength } = boardRules;
  const xIsNext = currentMove % 2 === 0;

  const winnerInfo = useMemo(
    () => calculateWinner(currentEntry.squares, boardRules),
    [boardRules, currentEntry.squares]
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
          moveLocation: getMoveLocation(squareIndex, boardSize),
          player,
        },
      ];

      setHistory(nextHistory);
      setCurrentMove(nextHistory.length - 1);
    },
    [
      boardSize,
      currentEntry.squares,
      currentMove,
      history,
      isDraw,
      winnerInfo,
      xIsNext,
    ]
  );

  const handleJumpTo = useCallback((nextMove) => {
    setCurrentMove(nextMove);
  }, []);

  const handleReset = useCallback(() => {
    setHistory([createInitialEntry(boardSize)]);
    setCurrentMove(0);
    setIsAscending(true);
  }, [boardSize]);

  const handleBoardSizeChange = useCallback((nextBoardSize) => {
    const nextBoardRules = createBoardRules(nextBoardSize);

    setBoardRules(nextBoardRules);
    setHistory([createInitialEntry(nextBoardRules.boardSize)]);
    setCurrentMove(0);
    setIsAscending(true);
  }, []);

  const handleToggleSort = useCallback(() => {
    setIsAscending((previousValue) => !previousValue);
  }, []);

  const handleOpenLearnModal = useCallback(() => {
    setIsLearnModalOpen(true);
  }, []);

  const handleCloseLearnModal = useCallback(() => {
    setIsLearnModalOpen(false);
    window.requestAnimationFrame(() => {
      learnButtonRef.current?.focus();
    });
  }, []);

  return (
    <main className="app-shell">
      <section className="game-card" aria-label="Tic-tac-toe game">
        <StatusPanel
          currentMove={currentMove}
          isDraw={isDraw}
          winner={winnerInfo?.winner ?? null}
          boardSize={boardSize}
          winLength={winLength}
          xIsNext={xIsNext}
        />

        <BoardSizeSelector
          boardRules={boardRules}
          onBoardSizeChange={handleBoardSizeChange}
        />

        <div className="game-layout">
          <div className="board-panel">
            <Board
              squares={currentEntry.squares}
              boardSize={boardSize}
              onPlay={handlePlay}
              winningLine={winnerInfo?.line ?? []}
              isGameOver={Boolean(winnerInfo) || isDraw}
            />
          </div>

          <aside className="sidebar">
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

          </aside>
        </div>


        <div className="learn-callout">
          <div>
            <p className="eyebrow">New here?</p>
            <p className="learn-callout-copy">
              Review the rules, winning lines, draws, move history, and reset.
            </p>
          </div>

          <button
            ref={learnButtonRef}
            type="button"
            className="learn-button"
            onClick={handleOpenLearnModal}
            aria-haspopup="dialog"
            aria-expanded={isLearnModalOpen}
            aria-controls="learn-modal"
          >
            Learn how to play
          </button>
        </div>

        {isLearnModalOpen ? (
          <LearnModal boardRules={boardRules} onClose={handleCloseLearnModal} />
        ) : null}
      </section>
    </main>
  );
}
