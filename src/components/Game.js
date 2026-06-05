import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import AccountPanel from "./AccountPanel";
import Board from "./Board";
import BoardSizeSelector from "./BoardSizeSelector";
import GameModeSelector from "./GameModeSelector";
import LearnModal from "./LearnModal";
import LocalRecordsPanel from "./LocalRecordsPanel";
import MatchDisplayNamePanel from "./MatchDisplayNamePanel";
import MoveHistory from "./MoveHistory";
import StatusPanel from "./StatusPanel";
import {
  getInitialAuthState,
  loadAuthState,
  saveProfileNameAsync,
  signOutAsync,
  signInWithEmail,
  subscribeToAuthState,
} from "../services/authService";
import {
  createDefaultLocalRecords,
  getRecordBucket,
  hasRecordedGames,
  loadLocalRecords,
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
import {
  DISPLAY_NAME_LIMIT,
  createDefaultMatchDisplayNames,
  formatPlayerLabel,
  normalizeDisplayName,
} from "../utils/playerIdentity";
import { chooseCpuMove } from "../utils/cpuPlayer";
import {
  clearRecords,
  loadRecords,
  saveCompletedMatchResult,
  shouldUseCloudRecords,
} from "../services/records/recordsService";

const CPU_MOVE_DELAY_MS = 450;

function createInitialEntry(boardSize) {
  return {
    squares: createEmptyBoard(boardSize),
    moveLocation: null,
    player: null,
  };
}

function createMatchNameCustomizationState() {
  return {
    cpu: { X: false, O: false },
    human: { X: false, O: false },
  };
}

function getHumanPlayerSymbol(cpuPlayerSymbol) {
  return cpuPlayerSymbol === "X" ? "O" : "X";
}

function swapCpuMarkerValues(markerValues) {
  return {
    X: markerValues.O,
    O: markerValues.X,
  };
}

function syncMatchDisplayNames(previousNames, customizedNames, defaultNames) {
  return {
    cpu: {
      X: customizedNames.cpu.X ? previousNames.cpu.X : defaultNames.cpu.X,
      O: customizedNames.cpu.O ? previousNames.cpu.O : defaultNames.cpu.O,
    },
    human: {
      X: customizedNames.human.X ? previousNames.human.X : defaultNames.human.X,
      O: customizedNames.human.O ? previousNames.human.O : defaultNames.human.O,
    },
  };
}

export default function Game() {
  const initialAuthState = useMemo(() => getInitialAuthState(), []);
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
  const [gameMode, setGameMode] = useState("cpu");
  const [cpuDifficulty, setCpuDifficulty] = useState("easy");
  const [cpuPlayerSymbol, setCpuPlayerSymbol] = useState("O");
  const [authUser, setAuthUser] = useState(initialAuthState.authUser);
  const [profileName, setProfileName] = useState(initialAuthState.profileName);
  const [authStatusMessage, setAuthStatusMessage] = useState("");
  const [authErrorMessage, setAuthErrorMessage] = useState("");
  const [isAuthBusy, setIsAuthBusy] = useState(false);
  const [recordsState, setRecordsState] = useState(() => ({
    source: "local",
    records: loadLocalRecords(),
    isLoading: false,
    errorMessage: "",
  }));
  const [customizedNames, setCustomizedNames] = useState(
    createMatchNameCustomizationState
  );
  const [matchDisplayNames, setMatchDisplayNames] = useState(() =>
    createDefaultMatchDisplayNames(initialAuthState)
  );
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
  const cpuPlayerSymbolRef = useRef(cpuPlayerSymbol);
  const humanPlayerSymbolRef = useRef(getHumanPlayerSymbol(cpuPlayerSymbol));
  const startingPlayerRef = useRef(startingPlayer);
  const authUserRef = useRef(authUser);
  const recordsRef = useRef(recordsState.records);
  const recordsSourceRef = useRef(recordsState.source);

  const currentEntry = history[currentMove];
  const { boardSize, winLength } = boardRules;
  const currentPlayer = getPlayerForMove(startingPlayer, currentMove);
  const xIsNext = currentPlayer === "X";
  const isCpuMode = gameMode === "cpu";
  const humanPlayerSymbol = getHumanPlayerSymbol(cpuPlayerSymbol);

  const winnerInfo = useMemo(
    () => calculateWinner(currentEntry.squares, boardRules),
    [boardRules, currentEntry.squares]
  );
  const winner = winnerInfo?.winner ?? null;
  const isDraw = !winnerInfo && isBoardFull(currentEntry.squares);
  const isCpuTurn =
    isCpuMode && currentPlayer === cpuPlayerSymbol && !winnerInfo && !isDraw;
  const defaultMatchDisplayNames = useMemo(
    () => createDefaultMatchDisplayNames({ authUser, profileName, cpuPlayerSymbol }),
    [authUser, cpuPlayerSymbol, profileName]
  );
  const resolvedMatchDisplayNames = useMemo(
    () => ({
      cpu: {
        X:
          normalizeDisplayName(matchDisplayNames.cpu.X) ||
          defaultMatchDisplayNames.cpu.X,
        O:
          normalizeDisplayName(matchDisplayNames.cpu.O) ||
          defaultMatchDisplayNames.cpu.O,
      },
      human: {
        X:
          normalizeDisplayName(matchDisplayNames.human.X) ||
          defaultMatchDisplayNames.human.X,
        O:
          normalizeDisplayName(matchDisplayNames.human.O) ||
          defaultMatchDisplayNames.human.O,
      },
    }),
    [defaultMatchDisplayNames, matchDisplayNames]
  );
  const playerDisplayNames = resolvedMatchDisplayNames[gameMode];
  const currentRecordBucket = useMemo(
    () => getRecordBucket(recordsState.records, { gameMode, boardSize }),
    [boardSize, gameMode, recordsState.records]
  );
  const canClearLocalRecords = useMemo(
    () => hasRecordedGames(recordsState.records),
    [recordsState.records]
  );
  const boardTurnNotice = useMemo(() => {
    if (winner) {
      return `Winner: ${formatPlayerLabel(playerDisplayNames[winner], winner)}`;
    }

    if (isDraw) {
      return `Draw: ${playerDisplayNames.X} and ${playerDisplayNames.O} filled the board.`;
    }

    return `Current player: ${formatPlayerLabel(
      playerDisplayNames[currentPlayer],
      currentPlayer
    )}`;
  }, [currentPlayer, isDraw, playerDisplayNames, winner]);

  historyRef.current = history;
  currentMoveRef.current = currentMove;
  boardRulesRef.current = boardRules;
  gameModeRef.current = gameMode;
  cpuDifficultyRef.current = cpuDifficulty;
  cpuPlayerSymbolRef.current = cpuPlayerSymbol;
  humanPlayerSymbolRef.current = humanPlayerSymbol;
  startingPlayerRef.current = startingPlayer;
  authUserRef.current = authUser;
  recordsRef.current = recordsState.records;
  recordsSourceRef.current = recordsState.source;

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

  const handleCpuPlayerSymbolChange = useCallback(
    (nextCpuPlayerSymbol) => {
      if (nextCpuPlayerSymbol === cpuPlayerSymbol) {
        return;
      }

      invalidatePendingCpuTurn();
      setCpuPlayerSymbol(nextCpuPlayerSymbol);
      setMatchDisplayNames((previousNames) => ({
        ...previousNames,
        cpu: swapCpuMarkerValues(previousNames.cpu),
      }));
      setCustomizedNames((previousState) => ({
        ...previousState,
        cpu: swapCpuMarkerValues(previousState.cpu),
      }));
      resetMatch();
    },
    [cpuPlayerSymbol, invalidatePendingCpuTurn, resetMatch]
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
    const isCloudSource = recordsSourceRef.current === "cloud";
    const shouldClear =
      typeof window === "undefined" || typeof window.confirm !== "function"
        ? true
        : window.confirm(
            isCloudSource
              ? "Clear all cloud Tic-Tac-Toe records saved to this account?"
              : "Clear all local Tic-Tac-Toe records stored in this browser?"
          );

    if (!shouldClear) {
      return;
    }

    setRecordsState((previousState) => ({
      ...previousState,
      isLoading: isCloudSource,
      errorMessage: "",
    }));

    clearRecords({ authUser: authUserRef.current })
      .then((nextRecordsState) => {
        setRecordsState({
          ...nextRecordsState,
          isLoading: false,
          errorMessage: "",
        });
      })
      .catch((error) => {
        setRecordsState((previousState) => ({
          ...previousState,
          isLoading: false,
          errorMessage:
            error?.message ||
            "Could not clear cloud records right now. Gameplay is still available.",
        }));
      });
  }, []);

  const applyAuthState = useCallback((nextAuthState) => {
    setAuthUser(nextAuthState?.authUser ?? null);
    setProfileName(nextAuthState?.profileName ?? "");
  }, []);

  const handleSaveProfileName = useCallback(
    async (nextProfileName) => {
      if (!authUser) {
        return;
      }

      setIsAuthBusy(true);
      setAuthErrorMessage("");

      try {
        const result = await saveProfileNameAsync(authUser, nextProfileName);
        applyAuthState(result);
        setAuthStatusMessage(result.message ?? "Profile updated.");
      } catch (error) {
        setAuthErrorMessage(
          error?.message ||
            "Could not save your profile name. Guest play is still available."
        );
      } finally {
        setIsAuthBusy(false);
      }
    },
    [applyAuthState, authUser]
  );

  const handleSignIn = useCallback(
    async (email) => {
      setIsAuthBusy(true);
      setAuthErrorMessage("");

      try {
        const result = await signInWithEmail(email);

        if (result?.authUser !== undefined || result?.profileName !== undefined) {
          applyAuthState(result);
        }

        setAuthStatusMessage(
          result?.message ||
            "Sign-in started. Guest play is still available while you continue."
        );
      } catch (error) {
        setAuthErrorMessage(
          error?.message ||
            "Could not start sign-in. You can keep playing as a guest."
        );
      } finally {
        setIsAuthBusy(false);
      }
    },
    [applyAuthState]
  );

  const handleSignOut = useCallback(async () => {
    setIsAuthBusy(true);
    setAuthErrorMessage("");

    try {
      const result = await signOutAsync();
      applyAuthState(result);
      setAuthStatusMessage(
        result.message || "Signed out. Guest play is still available."
      );
    } catch (error) {
      setAuthErrorMessage(
        error?.message || "Could not sign out right now. Please try again."
      );
    } finally {
      setIsAuthBusy(false);
    }
  }, [applyAuthState]);

  const handleDisplayNameChange = useCallback(
    (mode, player, nextValue) => {
      const safeValue = nextValue.slice(0, DISPLAY_NAME_LIMIT);
      const defaultValue = defaultMatchDisplayNames[mode][player];
      const isCustomized =
        safeValue === ""
          ? true
          : normalizeDisplayName(safeValue) !== normalizeDisplayName(defaultValue);

      setMatchDisplayNames((previousNames) => ({
        ...previousNames,
        [mode]: {
          ...previousNames[mode],
          [player]: safeValue,
        },
      }));
      setCustomizedNames((previousState) => ({
        ...previousState,
        [mode]: {
          ...previousState[mode],
          [player]: isCustomized,
        },
      }));
    },
    [defaultMatchDisplayNames]
  );

  const handleDisplayNameBlur = useCallback(
    (mode, player) => {
      const currentValue = matchDisplayNames[mode][player];
      const defaultValue = defaultMatchDisplayNames[mode][player];
      const normalizedValue = normalizeDisplayName(currentValue);
      const resolvedValue = normalizedValue || defaultValue;

      setMatchDisplayNames((previousNames) => ({
        ...previousNames,
        [mode]: {
          ...previousNames[mode],
          [player]: resolvedValue,
        },
      }));
      setCustomizedNames((previousState) => ({
        ...previousState,
        [mode]: {
          ...previousState[mode],
          [player]:
            normalizedValue !== "" &&
            normalizedValue !== normalizeDisplayName(defaultValue),
        },
      }));
    },
    [defaultMatchDisplayNames, matchDisplayNames]
  );

  const handleDisplayNameReset = useCallback(
    (mode, player) => {
      const defaultValue = defaultMatchDisplayNames[mode][player];

      setMatchDisplayNames((previousNames) => ({
        ...previousNames,
        [mode]: {
          ...previousNames[mode],
          [player]: defaultValue,
        },
      }));
      setCustomizedNames((previousState) => ({
        ...previousState,
        [mode]: {
          ...previousState[mode],
          [player]: false,
        },
      }));
    },
    [defaultMatchDisplayNames]
  );

  useEffect(() => {
    setMatchDisplayNames((previousNames) =>
      syncMatchDisplayNames(
        previousNames,
        customizedNames,
        defaultMatchDisplayNames
      )
    );
  }, [customizedNames, defaultMatchDisplayNames]);

  useEffect(() => {
    let isMounted = true;

    loadAuthState()
      .then((nextAuthState) => {
        if (!isMounted) {
          return;
        }

        applyAuthState(nextAuthState);
      })
      .catch((error) => {
        if (!isMounted) {
          return;
        }

        setAuthErrorMessage(
          error?.message ||
            "Could not load account details. Guest play is still available."
        );
      });

    const unsubscribe = subscribeToAuthState((nextAuthState, event) => {
      if (!isMounted) {
        return;
      }

      applyAuthState(nextAuthState);
      setAuthErrorMessage("");

      if (event === "SIGNED_IN") {
        setAuthStatusMessage("Signed in successfully.");
      } else if (event === "SIGNED_OUT") {
        setAuthStatusMessage("Signed out. Guest play is still available.");
      } else if (event === "USER_UPDATED") {
        setAuthStatusMessage("Profile name saved.");
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [applyAuthState]);

  useEffect(() => {
    let isMounted = true;
    const nextSource = shouldUseCloudRecords(authUser) ? "cloud" : "local";

    setRecordsState((previousState) => ({
      ...previousState,
      source: nextSource,
      isLoading: nextSource === "cloud",
      errorMessage: "",
    }));

    loadRecords({ authUser })
      .then((nextRecordsState) => {
        if (!isMounted) {
          return;
        }

        setRecordsState({
          ...nextRecordsState,
          isLoading: false,
          errorMessage: "",
        });
      })
      .catch((error) => {
        if (!isMounted) {
          return;
        }

        setRecordsState({
          source: nextSource,
          records: createDefaultLocalRecords(),
          isLoading: false,
          errorMessage:
            error?.message ||
            "Could not load cloud records right now. Gameplay is still available.",
        });
      });

    return () => {
      isMounted = false;
    };
  }, [authUser]);

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
        latestCurrentPlayer === cpuPlayerSymbolRef.current &&
        !latestWinnerInfo &&
        !latestIsDraw;

      if (!latestIsCpuTurn) {
        return;
      }

      const cpuMove = chooseCpuMove({
        squares: latestSquares,
        boardRules: latestBoardRules,
        difficulty: cpuDifficultyRef.current,
        cpuPlayer: cpuPlayerSymbolRef.current,
        humanPlayer: humanPlayerSymbolRef.current,
      });

      if (cpuMove === null || latestSquares[cpuMove]) {
        return;
      }

      const nextSquares = latestSquares.slice();
      nextSquares[cpuMove] = cpuPlayerSymbolRef.current;

      const nextHistory = [
        ...latestHistory.slice(0, latestCurrentMove + 1),
        {
          squares: nextSquares,
          moveLocation: getMoveLocation(cpuMove, latestBoardRules.boardSize),
          player: cpuPlayerSymbolRef.current,
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
    const matchMoves = history.slice(1).map((entry, index) => ({
      move: index + 1,
      player: entry.player,
      row: entry.moveLocation?.row,
      col: entry.moveLocation?.col,
      squareIndex:
        entry.moveLocation?.row && entry.moveLocation?.col
          ? (entry.moveLocation.row - 1) * boardSize + (entry.moveLocation.col - 1)
          : null,
    }));
    const authUserAtSave = authUser;
    const sourceAtSave = shouldUseCloudRecords(authUserAtSave) ? "cloud" : "local";
    const saveKey = `${activeMatchIdRef.current}:${authUserAtSave?.id ?? "guest"}`;

    saveCompletedMatchResult({
      authUser: authUserAtSave,
      currentRecords: recordsRef.current,
      matchData: {
        gameMode,
        boardSize,
        cpuDifficulty: gameMode === "cpu" ? cpuDifficulty : null,
        humanPlayer: gameMode === "cpu" ? humanPlayerSymbol : null,
        cpuPlayer: gameMode === "cpu" ? cpuPlayerSymbol : null,
        winner,
        isDraw,
        finalSquares: currentEntry.squares,
        playerDisplayNames,
        moves: matchMoves,
        completedAt: Date.now(),
      },
      saveKey,
    }).then((saveResult) => {
      if (!saveResult.didSave) {
        if (
          saveResult.errorMessage &&
          sourceAtSave === "cloud" &&
          recordsSourceRef.current === "cloud" &&
          authUserRef.current?.id === authUserAtSave?.id
        ) {
          setRecordsState((previousState) => ({
            ...previousState,
            errorMessage: saveResult.errorMessage,
          }));
        }

        return;
      }

      if (sourceAtSave === "cloud") {
        if (
          recordsSourceRef.current !== "cloud" ||
          authUserRef.current?.id !== authUserAtSave?.id
        ) {
          return;
        }
      } else if (recordsSourceRef.current !== "local") {
        return;
      }

      setRecordsState((previousState) => ({
        ...previousState,
        source: saveResult.source,
        records: saveResult.records,
        errorMessage: "",
      }));
    });
  }, [
    authUser,
    boardSize,
    cpuDifficulty,
    cpuPlayerSymbol,
    currentEntry.squares,
    currentMove,
    gameMode,
    humanPlayerSymbol,
    history,
    history.length,
    isDraw,
    playerDisplayNames,
    startingPlayer,
    winner,
  ]);

  const isMatchComplete = Boolean(winnerInfo) || isDraw;

  return (
    <main className="app-shell">
      <section className="game-card" aria-label="Tic-tac-toe game">
        <header className="game-header">
          <div>
            <p className="eyebrow">A Modern</p>
            <h1>Tic-Tac-Toe</h1>
            <p className="game-header-copy">
              Choose a mode, pick a board, and jump straight into the round.
            </p>
          </div>

          <AccountPanel
            authUser={authUser}
            profileName={profileName}
            onSignIn={handleSignIn}
            onSignOut={handleSignOut}
            onSaveProfileName={handleSaveProfileName}
            authStatusMessage={authStatusMessage}
            authErrorMessage={authErrorMessage}
            isAuthBusy={isAuthBusy}
          />
        </header>

        <section className="board-setup game-setup-panel" aria-labelledby="game-setup-title">
          <div className="board-setup-copy">
            <p className="eyebrow">Game setup</p>
            <h2 id="game-setup-title">Choose your match settings</h2>
            <p>
              Pick who plays and the board size before jumping into the round.
            </p>
          </div>

          <div className="setup-layout">
            <GameModeSelector
              gameMode={gameMode}
              cpuDifficulty={cpuDifficulty}
              cpuPlayerSymbol={cpuPlayerSymbol}
              onGameModeChange={handleGameModeChange}
              onCpuDifficultyChange={handleCpuDifficultyChange}
              onCpuPlayerSymbolChange={handleCpuPlayerSymbolChange}
            />

            <BoardSizeSelector
              boardRules={boardRules}
              onBoardSizeChange={handleBoardSizeChange}
            />

            <MatchDisplayNamePanel
              gameMode={gameMode}
              cpuPlayerSymbol={cpuPlayerSymbol}
              matchDisplayNames={matchDisplayNames}
              defaultMatchDisplayNames={defaultMatchDisplayNames}
              customizedNames={customizedNames}
              onDisplayNameChange={handleDisplayNameChange}
              onDisplayNameBlur={handleDisplayNameBlur}
              onDisplayNameReset={handleDisplayNameReset}
            />
          </div>
        </section>

        <div className="primary-layout">
          <div className="board-panel">
            <Board
              squares={currentEntry.squares}
              boardSize={boardSize}
              onPlay={handlePlay}
              winningLine={winnerInfo?.line ?? []}
              isGameOver={isMatchComplete}
              isInteractionDisabled={isCpuTurn}
              isCpuTurn={isCpuTurn}
              turnNotice={boardTurnNotice}
            />
          </div>

          <aside className="primary-sidebar">
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
              humanPlayerSymbol={humanPlayerSymbol}
              cpuPlayerSymbol={cpuPlayerSymbol}
              isCpuTurn={isCpuTurn}
              lastMovePlayer={currentEntry.player}
              lastMoveLocation={currentEntry.moveLocation}
              playerDisplayNames={playerDisplayNames}
            />

            <section className="sidebar-card sidebar-actions" aria-label="Round actions">
              <div>
                <p className="eyebrow">Controls</p>
                <h2>{isMatchComplete ? "Next round" : "Start again"}</h2>
              </div>

              <div className="sidebar-action-buttons">
                <button
                  type="button"
                  className={`new-game-button${
                    isMatchComplete ? "" : " action-button-hidden"
                  }`}
                  onClick={handleNewGame}
                  disabled={!isMatchComplete}
                  aria-hidden={!isMatchComplete}
                  tabIndex={isMatchComplete ? 0 : -1}
                >
                  New Game
                </button>

                <button
                  type="button"
                  className="reset-button"
                  onClick={handleReset}
                  disabled={history.length === 1}
                >
                  Reset Game
                </button>
              </div>
            </section>
          </aside>
        </div>

        <div className="secondary-layout">
          <div className="secondary-main">
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
                playerDisplayNames={playerDisplayNames}
              />
            </div>
          </div>

          <aside className="secondary-sidebar">
            <LocalRecordsPanel
              gameMode={gameMode}
              boardSize={boardSize}
              records={currentRecordBucket}
              source={recordsState.source}
              isLoading={recordsState.isLoading}
              errorMessage={recordsState.errorMessage}
              onClear={handleClearRecords}
              isClearDisabled={!canClearLocalRecords || recordsState.isLoading}
            />

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
          </aside>
        </div>

        {isLearnModalOpen ? (
          <LearnModal boardRules={boardRules} onClose={handleCloseLearnModal} />
        ) : null}
      </section>
    </main>
  );
}
