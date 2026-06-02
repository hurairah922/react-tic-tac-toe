import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Board from "./Board";
import BoardSizeSelector from "./BoardSizeSelector";
import GameModeSelector from "./GameModeSelector";
import LearnModal from "./LearnModal";
import LocalRecordsPanel from "./LocalRecordsPanel";
import MoveHistory from "./MoveHistory";
import StatusPanel from "./StatusPanel";
import {
  clearLocalRecords,
  createDefaultLocalRecords,
  getRecordBucket,
  hasRecordedGames,
  loadLocalRecords,
  saveLocalRecords,
  updateRecordsForResult,
} from "../utils/localRecords";
import {
  calculateWinner,
  createBoardRules,
  createEmptyBoard,
  DEFAULT_BOARD_RULES,
  getMoveLocation,
  isBoardFull,
} from "../utils/gameLogic";
import {
  DEFAULT_STARTING_PLAYER,
  getAlternatePlayer,
  getPlayerForMove,
} from "../utils/matchFlow";
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
  const [startingPlayer, setStartingPlayer] = useState(DEFAULT_STARTING_PLAYER);
  const [nextStartingPlayer, setNextStartingPlayer] = useState(
    DEFAULT_STARTING_PLAYER
  );
  const [isAscending, setIsAscending] = useState(true);
  const [isLearnModalOpen, setIsLearnModalOpen] = useState(false);
  const [gameMode, setGameMode] = useState("human");
  const [cpuDifficulty, setCpuDifficulty] = useState("easy");
  const [localRecords, setLocalRecords] = useState(() => loadLocalRecords());
  const learnButtonRef = useRef(null);
  const cpuTimeoutRef = useRef(null);
  const cpuTurnVersionRef = useRef(0);
  const activeMatchIdRef = useRef(0);
  const recordedMatchIdRef = useRef(null);
  const matchWasTimeTraveledRef = useRef(false);
  const historyRef = useRef(history);
  const currentMoveRef = useRef(currentMove);
  const boardRulesRef = useRef(boardRules);
  const gameModeRef = useRef(gameMode);
  const cpuDifficultyRef = useRef(cpuDifficulty);
  const startingPlayerRef = useRef(startingPlayer);

  const currentEntry = history[currentMove];
  const { boardSize, winLength } = boardRules;
  const currentPlayer = getPlayerForMove(startingPlayer, currentMove);
  const xIsNext = currentPlayer === "X";
  const isCpuMode = gameMode === "cpu";

  const winnerInfo = useMemo(
    () => calculateWinner(currentEntry.squares, boardRules),
    [boardRules, currentEntry.squares]
  );
  const winner = winnerInfo?.winner ?? null;
  const isDraw = !winnerInfo && isBoardFull(currentEntry.squares);
  const isCpuTurn = isCpuMode && !xIsNext && !winnerInfo && !isDraw;
  const currentRecordBucket = useMemo(
    () => getRecordBucket(localRecords, { gameMode, boardSize }),
    [boardSize, gameMode, localRecords]
  );
  const canClearLocalRecords = useMemo(
    () => hasRecordedGames(localRecords),
    [localRecords]
  );

  historyRef.current = history;
  currentMoveRef.current = currentMove;
  boardRulesRef.current = boardRules;
  gameModeRef.current = gameMode;
  cpuDifficultyRef.current = cpuDifficulty;
  startingPlayerRef.current = startingPlayer;

  const invalidatePendingCpuTurn = useCallback(() => {
    cpuTurnVersionRef.current += 1;

    if (cpuTimeoutRef.current) {
      window.clearTimeout(cpuTimeoutRef.current);
      cpuTimeoutRef.current = null;
    }
  }, []);

  const resetMatch = useCallback(
    ({
      nextBoardSize = boardSize,
      nextStarter = startingPlayer,
      resetSort = true,
    } = {}) => {
      activeMatchIdRef.current += 1;
      recordedMatchIdRef.current = null;
      matchWasTimeTraveledRef.current = false;
      setStartingPlayer(nextStarter);
      setHistory([createInitialEntry(nextBoardSize)]);
      setCurrentMove(0);
      if (resetSort) {
        setIsAscending(true);
      }
    },
    [boardSize, startingPlayer]
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
      const player = currentPlayer;

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
      currentPlayer,
      currentEntry.squares,
      currentMove,
      history,
      isCpuTurn,
      isDraw,
      winnerInfo,
    ]
  );

  const handleJumpTo = useCallback(
    (nextMove) => {
      invalidatePendingCpuTurn();
      matchWasTimeTraveledRef.current = true;
      setCurrentMove(nextMove);
    },
    [invalidatePendingCpuTurn]
  );

  const handleReset = useCallback(() => {
    invalidatePendingCpuTurn();
    resetMatch();
  }, [invalidatePendingCpuTurn, resetMatch]);

  const handleNewGame = useCallback(() => {
    invalidatePendingCpuTurn();
    resetMatch({ nextStarter: nextStartingPlayer });
  }, [invalidatePendingCpuTurn, nextStartingPlayer, resetMatch]);

  const handleBoardSizeChange = useCallback(
    (nextBoardSize) => {
      const nextBoardRules = createBoardRules(nextBoardSize);

      invalidatePendingCpuTurn();
      setBoardRules(nextBoardRules);
      setNextStartingPlayer(DEFAULT_STARTING_PLAYER);
      resetMatch({
        nextBoardSize: nextBoardRules.boardSize,
        nextStarter: DEFAULT_STARTING_PLAYER,
      });
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
      setNextStartingPlayer(DEFAULT_STARTING_PLAYER);
      resetMatch({ nextStarter: DEFAULT_STARTING_PLAYER });
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

  const handleClearRecords = useCallback(() => {
    const shouldClear =
      typeof window === "undefined" || typeof window.confirm !== "function"
        ? true
        : window.confirm(
            "Clear all local Tic-Tac-Toe records stored in this browser?"
          );

    if (!shouldClear) {
      return;
    }

    clearLocalRecords();
    setLocalRecords(createDefaultLocalRecords());
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
      const latestIsDraw = !latestWinnerInfo && isBoardFull(latestSquares);
      const latestCurrentPlayer = getPlayerForMove(
        startingPlayerRef.current,
        latestCurrentMove
      );
      const latestIsCpuTurn =
        gameModeRef.current === "cpu" &&
        latestCurrentPlayer === "O" &&
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

  useEffect(() => {
    if (!winner && !isDraw) {
      return;
    }

    if (currentMove !== history.length - 1) {
      return;
    }

    if (matchWasTimeTraveledRef.current) {
      return;
    }

    if (recordedMatchIdRef.current === activeMatchIdRef.current) {
      return;
    }

    recordedMatchIdRef.current = activeMatchIdRef.current;
    setNextStartingPlayer(getAlternatePlayer(startingPlayer));
    setLocalRecords((previousRecords) =>
      saveLocalRecords(
        updateRecordsForResult(previousRecords, {
          gameMode,
          boardSize,
          winner,
          isDraw,
        })
      )
    );
  }, [boardSize, currentMove, gameMode, history.length, isDraw, startingPlayer, winner]);

  const isMatchComplete = Boolean(winnerInfo) || isDraw;

  return (
    <main className="app-shell">
      <section className="game-card" aria-label="Tic-tac-toe game">
        <StatusPanel
          currentMove={currentMove}
          isDraw={isDraw}
          winner={winner}
          boardSize={boardSize}
          winLength={winLength}
          startingPlayer={startingPlayer}
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
              isGameOver={isMatchComplete}
              isInteractionDisabled={isCpuTurn}
              isCpuTurn={isCpuTurn}
            />
          </div>

          <aside className="sidebar">
            <div className="sidebar-card sidebar-actions">
              <div>
                <p className="eyebrow">Controls</p>
                <h2>{isMatchComplete ? "Next round" : "Start again"}</h2>
              </div>

              <div className="sidebar-action-buttons">
                {isMatchComplete ? (
                  <button
                    type="button"
                    className="new-game-button"
                    onClick={handleNewGame}
                  >
                    New Game
                  </button>
                ) : null}

                <button
                  type="button"
                  className="reset-button"
                  onClick={handleReset}
                  disabled={history.length === 1}
                >
                  Reset Game
                </button>
              </div>
            </div>

            <LocalRecordsPanel
              gameMode={gameMode}
              boardSize={boardSize}
              records={currentRecordBucket}
              onClear={handleClearRecords}
              isClearDisabled={!canClearLocalRecords}
            />

            <div className="sidebar-card history-card">
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
