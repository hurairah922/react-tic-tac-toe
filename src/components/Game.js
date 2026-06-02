import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Board from "./Board";
import BoardSizeSelector from "./BoardSizeSelector";
import GameModeSelector from "./GameModeSelector";
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
import { chooseCpuMove } from "../utils/cpuPlayer";

const CPU_MOVE_DELAY_MS = 450;

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
  const [gameMode, setGameMode] = useState("human");
  const [cpuDifficulty, setCpuDifficulty] = useState("easy");
  const learnButtonRef = useRef(null);
  const cpuTimeoutRef = useRef(null);
  const cpuTurnVersionRef = useRef(0);
  const historyRef = useRef(history);
  const currentMoveRef = useRef(currentMove);
  const boardRulesRef = useRef(boardRules);
  const gameModeRef = useRef(gameMode);
  const cpuDifficultyRef = useRef(cpuDifficulty);

  const currentEntry = history[currentMove];
  const { boardSize, winLength } = boardRules;
  const xIsNext = currentMove % 2 === 0;
  const isCpuMode = gameMode === "cpu";

  const winnerInfo = useMemo(
    () => calculateWinner(currentEntry.squares, boardRules),
    [boardRules, currentEntry.squares]
  );
  const isDraw = !winnerInfo && isBoardFull(currentEntry.squares);
  const isCpuTurn = isCpuMode && !xIsNext && !winnerInfo && !isDraw;

  historyRef.current = history;
  currentMoveRef.current = currentMove;
  boardRulesRef.current = boardRules;
  gameModeRef.current = gameMode;
  cpuDifficultyRef.current = cpuDifficulty;

  const invalidatePendingCpuTurn = useCallback(() => {
    cpuTurnVersionRef.current += 1;

    if (cpuTimeoutRef.current) {
      window.clearTimeout(cpuTimeoutRef.current);
      cpuTimeoutRef.current = null;
    }
  }, []);

  const resetMatch = useCallback(
    (nextBoardSize = boardSize) => {
      setHistory([createInitialEntry(nextBoardSize)]);
      setCurrentMove(0);
      setIsAscending(true);
    },
    [boardSize]
  );

  const handlePlay = useCallback(
    (squareIndex) => {
      if (
        isCpuTurn ||
        currentEntry.squares[squareIndex] ||
        winnerInfo ||
        isDraw
      ) {
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
      isCpuTurn,
      isDraw,
      winnerInfo,
      xIsNext,
    ]
  );

  const handleJumpTo = useCallback(
    (nextMove) => {
      invalidatePendingCpuTurn();
      setCurrentMove(nextMove);
    },
    [invalidatePendingCpuTurn]
  );

  const handleReset = useCallback(() => {
    invalidatePendingCpuTurn();
    resetMatch();
  }, [invalidatePendingCpuTurn, resetMatch]);

  const handleBoardSizeChange = useCallback(
    (nextBoardSize) => {
      const nextBoardRules = createBoardRules(nextBoardSize);

      invalidatePendingCpuTurn();
      setBoardRules(nextBoardRules);
      resetMatch(nextBoardRules.boardSize);
    },
    [invalidatePendingCpuTurn, resetMatch]
  );

  const handleGameModeChange = useCallback(
    (nextGameMode) => {
      if (nextGameMode === gameMode) {
        return;
      }

      invalidatePendingCpuTurn();
      setGameMode(nextGameMode);
      resetMatch();
    },
    [gameMode, invalidatePendingCpuTurn, resetMatch]
  );

  const handleCpuDifficultyChange = useCallback(
    (nextCpuDifficulty) => {
      setCpuDifficulty(nextCpuDifficulty);

      if (isCpuMode) {
        invalidatePendingCpuTurn();
        resetMatch();
      }
    },
    [invalidatePendingCpuTurn, isCpuMode, resetMatch]
  );

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

  useEffect(() => {
    if (!isCpuTurn) {
      invalidatePendingCpuTurn();
      return undefined;
    }

    const turnVersion = cpuTurnVersionRef.current;

    cpuTimeoutRef.current = window.setTimeout(() => {
      if (cpuTurnVersionRef.current !== turnVersion) {
        return;
      }

      const latestHistory = historyRef.current;
      const latestCurrentMove = currentMoveRef.current;
      const latestEntry = latestHistory[latestCurrentMove];
      const latestBoardRules = boardRulesRef.current;
      const latestSquares = latestEntry?.squares;

      if (!latestSquares) {
        return;
      }

      const latestWinnerInfo = calculateWinner(latestSquares, latestBoardRules);
      const latestIsDraw =
        !latestWinnerInfo && isBoardFull(latestSquares);
      const latestIsCpuTurn =
        gameModeRef.current === "cpu" &&
        latestCurrentMove % 2 === 1 &&
        !latestWinnerInfo &&
        !latestIsDraw;

      if (!latestIsCpuTurn) {
        return;
      }

      const cpuMove = chooseCpuMove({
        squares: latestSquares,
        boardRules: latestBoardRules,
        difficulty: cpuDifficultyRef.current,
      });

      if (cpuMove === null || latestSquares[cpuMove]) {
        return;
      }

      const nextSquares = latestSquares.slice();
      nextSquares[cpuMove] = "O";

      const nextHistory = [
        ...latestHistory.slice(0, latestCurrentMove + 1),
        {
          squares: nextSquares,
          moveLocation: getMoveLocation(cpuMove, latestBoardRules.boardSize),
          player: "O",
        },
      ];

      setHistory(nextHistory);
      setCurrentMove(nextHistory.length - 1);
      cpuTimeoutRef.current = null;
    }, CPU_MOVE_DELAY_MS);

    return () => {
      if (cpuTimeoutRef.current) {
        window.clearTimeout(cpuTimeoutRef.current);
        cpuTimeoutRef.current = null;
      }
    };
  }, [invalidatePendingCpuTurn, isCpuTurn]);

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
          gameMode={gameMode}
          cpuDifficulty={cpuDifficulty}
          isCpuTurn={isCpuTurn}
          lastMovePlayer={currentEntry.player}
          lastMoveLocation={currentEntry.moveLocation}
        />

        <GameModeSelector
          gameMode={gameMode}
          cpuDifficulty={cpuDifficulty}
          onGameModeChange={handleGameModeChange}
          onCpuDifficultyChange={handleCpuDifficultyChange}
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
              isInteractionDisabled={isCpuTurn}
              isCpuTurn={isCpuTurn}
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
