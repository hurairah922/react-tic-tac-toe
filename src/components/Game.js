import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import AccountPanel from "./AccountPanel";
import Board from "./Board";
import InviteMatchPanel from "./InviteMatchPanel";
import LearnModal from "./LearnModal";
import LocalRecordsPanel from "./LocalRecordsPanel";
import MoveHistory from "./MoveHistory";
import StatusPanel from "./StatusPanel";
import {
  clearPostLoginRedirectPath,
  getInitialAuthState,
  loadAuthState,
  loadPostLoginRedirectPath,
  saveProfileNameAsync,
  savePostLoginRedirectPath,
  signOutAsync,
  signInWithEmail,
  subscribeToAuthState,
} from "../services/authService";
import {
  buildInviteHistory,
  getInviteRoomDisplayNames,
  getInviteRoomEntryState,
  getInviteRoomParticipantSymbol,
} from "../services/inviteRooms/inviteRoomState";
import {
  canUseInviteMultiplayer,
  createInviteRoom,
  fetchInviteRoom,
  joinInviteRoom,
  playInviteMove,
  restartInviteRoom,
  subscribeToInviteRoom,
} from "../services/inviteRooms/inviteRoomService";
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
  SUPPORTED_BOARD_SIZES,
} from "../utils/gameLogic";
import {
  DEFAULT_STARTING_PLAYER,
  getAlternatePlayer,
  getPlayerForMove,
  getUndoMoveTarget,
} from "../utils/matchFlow";
import {
  createDefaultMatchDisplayNames,
  formatPlayerLabel,
  getProfileDefaultName,
} from "../utils/playerIdentity";
import { chooseCpuMove } from "../utils/cpuPlayer";
import {
  clearRecords,
  loadRecords,
  saveCompletedMatchResult,
  shouldUseCloudRecords,
} from "../services/records/recordsService";
import {
  getCurrentPath,
  navigateToPath,
  navigateHome,
  navigateToInviteLobby,
  navigateToInviteRoom,
  parseInviteRoute,
} from "../utils/inviteRoutes";

const CPU_MOVE_DELAY_MS = 450;
// Multiplayer is paused until real-time room sync, third-player handling,
// and invite state recovery are ready for production use.
const MULTIPLAYER_ENABLED = false;
const GAME_MODE_OPTIONS = [
  {
    value: "human",
    label: "Human vs Human",
    detail: "Two players share the same board.",
  },
  {
    value: "cpu",
    label: "Human vs CPU",
    detail: "Play against a local CPU.",
  },
  {
    value: "invite",
    label: "Invite multiplayer",
    detail: "Create a private share link for a signed-in opponent.",
  },
].filter((option) => MULTIPLAYER_ENABLED || option.value !== "invite");
const CPU_DIFFICULTY_OPTIONS = [
  {
    value: "easy",
    label: "Easy",
    detail: "Random valid moves.",
  },
  {
    value: "medium",
    label: "Medium",
    detail: "Wins or blocks before going random.",
  },
  {
    value: "hard",
    label: "Hard",
    detail: "Wins, blocks, then prefers strong squares.",
  },
];
const CPU_SIDE_OPTIONS = [
  {
    value: "O",
    label: "You are X",
    detail: "You move with crosses and the CPU takes noughts.",
  },
  {
    value: "X",
    label: "You are O",
    detail: "You move with noughts and the CPU takes crosses.",
  },
];

function createInitialEntry(boardSize) {
  return {
    squares: createEmptyBoard(boardSize),
    moveLocation: null,
    player: null,
  };
}

function createInitialInviteRoomState() {
  return {
    room: null,
    isLoading: false,
    isCreating: false,
    isJoining: false,
    isPlaying: false,
    isRestarting: false,
    errorMessage: "",
    statusMessage: "",
    copyStatus: "",
  };
}

function getHumanPlayerSymbol(cpuPlayerSymbol) {
  return cpuPlayerSymbol === "X" ? "O" : "X";
}

export default function Game() {
  const initialAuthState = useMemo(() => getInitialAuthState(), []);
  const [routeState, setRouteState] = useState(() => parseInviteRoute());
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
  const [selectedGameMode, setSelectedGameMode] = useState("cpu");
  const [cpuDifficulty, setCpuDifficulty] = useState("easy");
  const [cpuPlayerSymbol, setCpuPlayerSymbol] = useState("O");
  const [authUser, setAuthUser] = useState(initialAuthState.authUser);
  const [profileName, setProfileName] = useState(initialAuthState.profileName);
  const [authStatusMessage, setAuthStatusMessage] = useState("");
  const [authErrorMessage, setAuthErrorMessage] = useState("");
  const [isAuthBusy, setIsAuthBusy] = useState(false);
  const [isAuthResolved, setIsAuthResolved] = useState(false);
  const [recordsState, setRecordsState] = useState(() => ({
    source: "local",
    records: loadLocalRecords(),
    isLoading: false,
    errorMessage: "",
  }));
  const inviteDefaultName = useMemo(
    () => getProfileDefaultName({ authUser, profileName }),
    [authUser, profileName]
  );
  const [inviteDisplayName, setInviteDisplayName] = useState(inviteDefaultName);
  const [isInviteDisplayNameDirty, setIsInviteDisplayNameDirty] = useState(false);
  const [inviteRoomState, setInviteRoomState] = useState(
    createInitialInviteRoomState
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
  const gameModeRef = useRef(selectedGameMode);
  const cpuDifficultyRef = useRef(cpuDifficulty);
  const cpuPlayerSymbolRef = useRef(cpuPlayerSymbol);
  const humanPlayerSymbolRef = useRef(getHumanPlayerSymbol(cpuPlayerSymbol));
  const startingPlayerRef = useRef(startingPlayer);
  const authUserRef = useRef(authUser);
  const recordsRef = useRef(recordsState.records);
  const recordsSourceRef = useRef(recordsState.source);

  const gameMode =
    MULTIPLAYER_ENABLED && routeState.kind !== "home"
      ? "invite"
      : selectedGameMode;
  const isInviteMode = MULTIPLAYER_ENABLED && gameMode === "invite";
  const isCpuMode = gameMode === "cpu";
  const humanPlayerSymbol = getHumanPlayerSymbol(cpuPlayerSymbol);
  const inviteEnabled = MULTIPLAYER_ENABLED && canUseInviteMultiplayer(authUser);
  const inviteRoom = inviteRoomState.room;
  const inviteParticipantSymbol = useMemo(
    () => getInviteRoomParticipantSymbol(inviteRoom, authUser?.id),
    [authUser?.id, inviteRoom]
  );
  const inviteEntryState = useMemo(
    () => (isInviteMode ? getInviteRoomEntryState(inviteRoom, authUser) : null),
    [authUser, inviteRoom, isInviteMode]
  );
  const effectiveBoardRules =
    isInviteMode && inviteRoom && !inviteRoom.isInvalid
      ? {
          boardSize: inviteRoom.boardSize,
          winLength: inviteRoom.winLength,
        }
      : boardRules;
  const { boardSize, winLength } = effectiveBoardRules;
  const inviteHistory = useMemo(() => {
    if (!isInviteMode || !inviteRoom || inviteRoom.isInvalid) {
      return [createInitialEntry(boardSize)];
    }

    return buildInviteHistory(inviteRoom);
  }, [boardSize, inviteRoom, isInviteMode]);
  const activeHistory = isInviteMode ? inviteHistory : history;
  const activeCurrentMove = isInviteMode
    ? Math.max(0, activeHistory.length - 1)
    : currentMove;
  const currentEntry =
    activeHistory[activeCurrentMove] ?? createInitialEntry(boardSize);
  const currentPlayer = isInviteMode
    ? inviteRoom?.currentPlayer ?? "X"
    : getPlayerForMove(startingPlayer, currentMove);
  const xIsNext = currentPlayer === "X";
  const winnerInfo = useMemo(
    () => calculateWinner(currentEntry.squares, effectiveBoardRules),
    [currentEntry.squares, effectiveBoardRules]
  );
  const winner = isInviteMode
    ? inviteRoom?.winner === "X" || inviteRoom?.winner === "O"
      ? inviteRoom.winner
      : null
    : winnerInfo?.winner ?? null;
  const isDraw = isInviteMode
    ? inviteRoom?.winner === "draw"
    : !winnerInfo && isBoardFull(currentEntry.squares);
  const isCpuTurn =
    !isInviteMode &&
    isCpuMode &&
    currentPlayer === cpuPlayerSymbol &&
    !winnerInfo &&
    !isDraw;
  const defaultMatchDisplayNames = useMemo(
    () =>
      createDefaultMatchDisplayNames({ authUser, profileName, cpuPlayerSymbol }),
    [authUser, cpuPlayerSymbol, profileName]
  );
  const playerDisplayNames = isInviteMode
    ? getInviteRoomDisplayNames(inviteRoom)
    : defaultMatchDisplayNames[gameMode];
  const recordGameMode = gameMode === "invite" ? "human" : gameMode;
  const currentRecordBucket = useMemo(
    () => getRecordBucket(recordsState.records, { gameMode: recordGameMode, boardSize }),
    [boardSize, recordGameMode, recordsState.records]
  );
  const canClearLocalRecords = useMemo(
    () => hasRecordedGames(recordsState.records),
    [recordsState.records]
  );
  const currentTurnChipLabel = useMemo(() => {
    if (winner) {
      return `Winner: ${formatPlayerLabel(playerDisplayNames[winner], winner)}`;
    }

    if (isDraw) {
      return "Result: Draw";
    }

    return `Turn: ${formatPlayerLabel(
      playerDisplayNames[currentPlayer],
      currentPlayer
    )}`;
  }, [currentPlayer, isDraw, playerDisplayNames, winner]);
  const inviteStatusContent = useMemo(() => {
    if (!isInviteMode) {
      return null;
    }

    const statusChips = [
      "Invite match",
      `${boardSize}x${boardSize}`,
      `${winLength} in a row`,
    ];

    if (inviteRoom?.id) {
      statusChips.push(`Room: ${inviteRoom.status}`);
    }

    if (inviteParticipantSymbol) {
      statusChips.push(`You are ${inviteParticipantSymbol}`);
    }

    if (inviteRoomState.isLoading) {
      return {
        status: "Loading invite match",
        detail: "Checking the room link and current player list.",
        chips: statusChips,
      };
    }

    if (!isAuthResolved) {
      return {
        status: "Checking sign-in",
        detail: "Confirming whether this browser already has access to the invite room.",
        chips: statusChips,
      };
    }

    if (inviteRoomState.isRestarting) {
      return {
        status: "Starting next round",
        detail: "Resetting the board for both players.",
        chips: statusChips,
      };
    }

    if (!authUser || !inviteEnabled) {
      return {
        status: "Sign-in required",
        detail:
          "Invite multiplayer needs a signed-in Supabase account before a room can be created or joined.",
        chips: statusChips,
      };
    }

    if (!inviteRoom) {
      return {
        status: "Create an invite room",
        detail:
          "Choose a board, confirm the display name you want to share, and generate a private room link.",
        chips: statusChips,
      };
    }

    if (inviteEntryState?.state === "blocked" && inviteEntryState.message) {
      return {
        status: "Invite unavailable",
        detail: inviteEntryState.message,
        chips: statusChips,
      };
    }

    if (winner) {
      return {
        status: `Winner: ${formatPlayerLabel(playerDisplayNames[winner], winner)}`,
        detail: "The invite match is complete.",
        chips: statusChips,
      };
    }

    if (isDraw) {
      return {
        status: `Draw: ${playerDisplayNames.X} and ${playerDisplayNames.O}`,
        detail: "The room is complete because the board is full.",
        chips: statusChips,
      };
    }

    if (!inviteRoom.players?.O) {
      return {
        status: "Waiting for opponent",
        detail:
          "Share the private link with another signed-in player so they can join the O side.",
        chips: statusChips,
      };
    }

    if (inviteEntryState?.state === "joinable") {
      return {
        status: "Ready to join",
        detail:
          "The room still has space. Review the setup, then join as the second player when you are ready.",
        chips: statusChips,
      };
    }

    if (
      inviteParticipantSymbol &&
      inviteRoom.currentPlayer === inviteParticipantSymbol
    ) {
      return {
        status: `${playerDisplayNames[inviteParticipantSymbol]} turn`,
        detail: "It is your turn. Choose an empty square to continue.",
        chips: statusChips,
      };
    }

    const waitingOnSymbol = inviteParticipantSymbol === "X" ? "O" : "X";

    return {
      status: `${playerDisplayNames[waitingOnSymbol]} turn`,
      detail: "The board will update as soon as your opponent moves.",
      chips: statusChips,
    };
  }, [
    authUser,
    boardSize,
    inviteEnabled,
    inviteEntryState,
    inviteParticipantSymbol,
    inviteRoom,
    isAuthResolved,
    inviteRoomState.isLoading,
    inviteRoomState.isRestarting,
    isDraw,
    isInviteMode,
    playerDisplayNames,
    winner,
    winLength,
  ]);
  const boardTurnNotice = useMemo(() => {
    if (isInviteMode) {
      return inviteStatusContent?.detail || inviteStatusContent?.status || "";
    }

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
  }, [
    currentPlayer,
    inviteStatusContent,
    isDraw,
    isInviteMode,
    playerDisplayNames,
    winner,
  ]);
  const boardHeading = useMemo(() => {
    if (!isInviteMode) {
      return "";
    }

    if (inviteRoomState.isLoading) {
      return "Loading invite match";
    }

    if (!inviteRoom) {
      return "Invite lobby";
    }

    if (winner || isDraw) {
      return "Invite match complete";
    }

    if (!inviteRoom.players?.O) {
      return "Waiting for opponent";
    }

    if (
      inviteParticipantSymbol &&
      inviteRoom.currentPlayer === inviteParticipantSymbol
    ) {
      return "Your turn";
    }

    return "Invite match";
  }, [
    inviteParticipantSymbol,
    inviteRoom,
    inviteRoomState.isLoading,
    isDraw,
    isInviteMode,
    winner,
  ]);
  const isInviteInteractionDisabled =
    !isInviteMode ||
    inviteRoomState.isLoading ||
    inviteRoomState.isPlaying ||
    inviteRoomState.isRestarting ||
    inviteEntryState?.state !== "participant" ||
    !inviteRoom ||
    inviteRoom.status !== "active" ||
    !inviteParticipantSymbol ||
    inviteRoom.currentPlayer !== inviteParticipantSymbol ||
    Boolean(inviteRoom.winner);

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

  useEffect(() => {
    if (!isInviteDisplayNameDirty) {
      setInviteDisplayName(inviteDefaultName);
    }
  }, [inviteDefaultName, isInviteDisplayNameDirty]);

  useEffect(() => {
    if (!inviteRoom || !inviteParticipantSymbol) {
      return;
    }

    const currentParticipantName =
      inviteRoom.players?.[inviteParticipantSymbol]?.displayName;

    if (currentParticipantName) {
      setInviteDisplayName(currentParticipantName);
    }
  }, [inviteParticipantSymbol, inviteRoom]);

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
      if (isInviteMode) {
        if (
          !inviteRoom ||
          inviteRoomState.isPlaying ||
          inviteEntryState?.state !== "participant" ||
          inviteRoom.status !== "active" ||
          inviteRoom.currentPlayer !== inviteParticipantSymbol ||
          currentEntry.squares[squareIndex] ||
          inviteRoom.winner
        ) {
          return;
        }

        setInviteRoomState((previousState) => ({
          ...previousState,
          isPlaying: true,
          errorMessage: "",
          statusMessage: "",
        }));

        playInviteMove({ roomId: inviteRoom.id, squareIndex })
          .then((nextRoom) => {
            setInviteRoomState((previousState) => ({
              ...previousState,
              room: nextRoom,
              isPlaying: false,
              errorMessage: "",
            }));
          })
          .catch((error) => {
            setInviteRoomState((previousState) => ({
              ...previousState,
              isPlaying: false,
              errorMessage:
                error?.message || "Could not save that move right now.",
            }));
          });

        return;
      }

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
      currentPlayer,
      currentMove,
      history,
      inviteEntryState?.state,
      inviteParticipantSymbol,
      inviteRoom,
      inviteRoomState.isPlaying,
      isCpuTurn,
      isDraw,
      isInviteMode,
      winnerInfo,
    ]
  );

  const handleJumpTo = useCallback(
    (nextMove) => {
      if (isInviteMode) {
        return;
      }

      invalidatePendingCpuTurn();
      matchWasTimeTraveledRef.current = true;
      setCurrentMove(nextMove);
    },
    [invalidatePendingCpuTurn, isInviteMode]
  );

  const handleReset = useCallback(() => {
    if (isInviteMode) {
      navigateToInviteLobby();
      return;
    }

    invalidatePendingCpuTurn();
    resetMatch();
  }, [invalidatePendingCpuTurn, isInviteMode, resetMatch]);

  const handleNewGame = useCallback(() => {
    if (isInviteMode) {
      navigateToInviteLobby();
      return;
    }

    invalidatePendingCpuTurn();
    resetMatch({ nextStarter: nextStartingPlayer });
  }, [invalidatePendingCpuTurn, isInviteMode, nextStartingPlayer, resetMatch]);

  const undoMoveTarget = isInviteMode
    ? null
    : getUndoMoveTarget(currentMove, gameMode);
  const canUndo = undoMoveTarget !== null;

  const handleUndo = useCallback(() => {
    if (undoMoveTarget === null) {
      return;
    }

    invalidatePendingCpuTurn();
    matchWasTimeTraveledRef.current = true;
    setHistory((previousHistory) => previousHistory.slice(0, undoMoveTarget + 1));
    setCurrentMove(undoMoveTarget);
  }, [invalidatePendingCpuTurn, undoMoveTarget]);

  const handleBoardSizeChange = useCallback(
    (nextBoardSize) => {
      if (isInviteMode && routeState.kind === "invite-room") {
        return;
      }

      const nextBoardRules = createBoardRules(nextBoardSize);

      invalidatePendingCpuTurn();
      setBoardRules(nextBoardRules);
      setNextStartingPlayer(DEFAULT_STARTING_PLAYER);
      resetMatch({
        nextBoardSize: nextBoardRules.boardSize,
        nextStarter: DEFAULT_STARTING_PLAYER,
      });
    },
    [invalidatePendingCpuTurn, isInviteMode, resetMatch, routeState.kind]
  );

  const handleGameModeChange = useCallback(
    (nextGameMode) => {
      if (nextGameMode === "invite") {
        if (!MULTIPLAYER_ENABLED) {
          return;
        }

        invalidatePendingCpuTurn();
        navigateToInviteLobby();
        return;
      }

      if (routeState.kind !== "home") {
        navigateHome();
      }

      if (nextGameMode === selectedGameMode && routeState.kind === "home") {
        return;
      }

      invalidatePendingCpuTurn();
      setSelectedGameMode(nextGameMode);
      setNextStartingPlayer(DEFAULT_STARTING_PLAYER);
      resetMatch({ nextStarter: DEFAULT_STARTING_PLAYER });
    },
    [invalidatePendingCpuTurn, resetMatch, routeState.kind, selectedGameMode]
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
      resetMatch();
    },
    [cpuPlayerSymbol, invalidatePendingCpuTurn, resetMatch]
  );
  const statusChips = useMemo(() => {
    const isBoardConfigurable = !(isInviteMode && routeState.kind === "invite-room");
    const chips = [
      {
        id: "game-mode",
        label: "",
        labelPrefix: "Mode",
        ariaLabel: "Change game mode",
        isInteractive: true,
        options: GAME_MODE_OPTIONS.map((option) => ({
          value: option.value,
          label: option.label,
          selected: option.value === gameMode,
        })),
        onSelect: handleGameModeChange,
      },
      {
        id: "board-size",
        label: "",
        labelPrefix: "Board",
        ariaLabel: isBoardConfigurable
          ? "Change board size"
          : `Board size locked at ${boardSize} by ${boardSize}`,
        isInteractive: isBoardConfigurable,
        options: SUPPORTED_BOARD_SIZES.map((size) => {
          return {
            value: size,
            label: `${size} x ${size}`,
            selected: size === boardSize,
          };
        }),
        onSelect: handleBoardSizeChange,
      },
      {
        id: "win-rule",
        label: `Goal: Connect ${winLength}`,
      },
      {
        id: "current-turn",
        label: currentTurnChipLabel,
      },
    ];

    if (isInviteMode) {
      if (inviteRoom?.id) {
        chips.push({
          id: "invite-room",
          label: `Room: ${inviteRoom.status}`,
        });
      }

      if (inviteParticipantSymbol) {
        chips.push({
          id: "invite-role",
          label: `You are ${inviteParticipantSymbol}`,
        });
      }

      return chips;
    }

    chips.push({
      id: "starter",
      label: `Starter: ${formatPlayerLabel(
        playerDisplayNames[startingPlayer],
        startingPlayer
      )}`,
    });

    if (isCpuMode) {
      chips.push({
        id: "cpu-side",
        label: "",
        labelPrefix: "Side",
        ariaLabel: "Change which side you play",
        isInteractive: true,
        options: CPU_SIDE_OPTIONS.map((option) => ({
          value: option.value,
          label: option.label,
          selected: option.value === cpuPlayerSymbol,
        })),
        onSelect: handleCpuPlayerSymbolChange,
      });
      chips.push({
        id: "cpu-difficulty",
        label: "",
        labelPrefix: "CPU",
        ariaLabel: "Change CPU difficulty",
        isInteractive: true,
        options: CPU_DIFFICULTY_OPTIONS.map((option) => ({
          value: option.value,
          label: option.label,
          selected: option.value === cpuDifficulty,
        })),
        onSelect: handleCpuDifficultyChange,
      });
    }

    return chips;
  }, [
    boardSize,
    cpuDifficulty,
    cpuPlayerSymbol,
    currentTurnChipLabel,
    gameMode,
    handleBoardSizeChange,
    handleCpuDifficultyChange,
    handleCpuPlayerSymbolChange,
    handleGameModeChange,
    humanPlayerSymbol,
    inviteParticipantSymbol,
    inviteRoom,
    isCpuMode,
    isInviteMode,
    playerDisplayNames,
    routeState.kind,
    startingPlayer,
    winLength,
  ]);

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
        const redirectPath =
          loadPostLoginRedirectPath() ||
          (routeState.kind === "invite-room" ? getCurrentPath() : "");
        const result = await signInWithEmail(email, undefined, redirectPath);

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
    [applyAuthState, routeState.kind]
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

  const handleInviteDisplayNameChange = useCallback((nextValue) => {
    setInviteDisplayName(nextValue);
    setIsInviteDisplayNameDirty(true);
  }, []);

  const handleCreateInviteRoom = useCallback(async () => {
    if (!inviteEnabled) {
      setInviteRoomState((previousState) => ({
        ...previousState,
        errorMessage:
          "Sign in with a Supabase-backed account before creating an invite room.",
      }));
      return;
    }

    setInviteRoomState((previousState) => ({
      ...previousState,
      isCreating: true,
      errorMessage: "",
      statusMessage: "",
      copyStatus: "",
    }));

    try {
      const nextRoom = await createInviteRoom({
        authUser,
        displayName: inviteDisplayName,
        boardRules,
      });

      setInviteRoomState((previousState) => ({
        ...previousState,
        room: nextRoom,
        isCreating: false,
        errorMessage: "",
        statusMessage: "Invite room created. Copy the link and share it.",
      }));
      navigateToInviteRoom(nextRoom.id);
    } catch (error) {
      setInviteRoomState((previousState) => ({
        ...previousState,
        isCreating: false,
        errorMessage:
          error?.message || "Could not create an invite room right now.",
      }));
    }
  }, [authUser, boardRules, inviteDisplayName, inviteEnabled]);

  const handleJoinInviteRoom = useCallback(async () => {
    if (!routeState.roomId) {
      return;
    }

    setInviteRoomState((previousState) => ({
      ...previousState,
      isJoining: true,
      errorMessage: "",
      statusMessage: "",
    }));

    try {
      const nextRoom = await joinInviteRoom({
        roomId: routeState.roomId,
        authUser,
        displayName: inviteDisplayName,
      });

      setInviteRoomState((previousState) => ({
        ...previousState,
        room: nextRoom,
        isJoining: false,
        errorMessage: "",
        statusMessage: "Joined invite room. Your board is now live.",
      }));
    } catch (error) {
      setInviteRoomState((previousState) => ({
        ...previousState,
        isJoining: false,
        errorMessage:
          error?.message || "Could not join that invite room right now.",
      }));
    }
  }, [authUser, inviteDisplayName, routeState.roomId]);

  const canStartInviteRematch = Boolean(
    isInviteMode &&
      inviteRoom &&
      inviteRoom.players?.O &&
      inviteEntryState?.state === "participant" &&
      inviteRoom.winner
  );

  const handleStartInviteRematch = useCallback(async () => {
    if (!inviteRoom?.id || !canStartInviteRematch) {
      return;
    }

    setInviteRoomState((previousState) => ({
      ...previousState,
      isRestarting: true,
      errorMessage: "",
      statusMessage: "",
    }));

    try {
      const nextRoom = await restartInviteRoom({ roomId: inviteRoom.id });

      setInviteRoomState((previousState) => ({
        ...previousState,
        room: nextRoom,
        isRestarting: false,
        errorMessage: "",
        statusMessage: "Next round started.",
      }));
    } catch (error) {
      setInviteRoomState((previousState) => ({
        ...previousState,
        isRestarting: false,
        errorMessage:
          error?.message || "Could not start the next round right now.",
      }));
    }
  }, [canStartInviteRematch, inviteRoom?.id]);

  const handleCopyInviteLink = useCallback(async () => {
    if (!inviteRoom?.id) {
      return;
    }

    const inviteUrl =
      typeof window !== "undefined"
        ? `${window.location.origin}/play/invite/${inviteRoom.id}`
        : "";

    if (!inviteUrl) {
      return;
    }

    try {
      await navigator.clipboard.writeText(inviteUrl);
      setInviteRoomState((previousState) => ({
        ...previousState,
        copyStatus: "Invite link copied.",
        errorMessage: "",
      }));
    } catch {
      setInviteRoomState((previousState) => ({
        ...previousState,
        copyStatus: "",
        errorMessage:
          "Could not copy the link automatically. Select the field and copy it manually.",
      }));
    }
  }, [inviteRoom?.id]);

  const handleBackHome = useCallback(() => {
    navigateHome();
  }, []);

  const handleOpenInviteLobby = useCallback(() => {
    setInviteRoomState(createInitialInviteRoomState());
    navigateToInviteLobby();
  }, []);

  useEffect(() => {
    const handleRouteChange = () => {
      setRouteState(parseInviteRoute());
    };

    handleRouteChange();
    window.addEventListener("popstate", handleRouteChange);

    return () => {
      window.removeEventListener("popstate", handleRouteChange);
    };
  }, []);

  useEffect(() => {
    if (MULTIPLAYER_ENABLED || routeState.kind === "home") {
      return;
    }

    setInviteRoomState(createInitialInviteRoomState());
    navigateHome({ replace: true });
  }, [routeState.kind]);

  useEffect(() => {
    let isMounted = true;

    loadAuthState()
      .then((nextAuthState) => {
        if (!isMounted) {
          return;
        }

        applyAuthState(nextAuthState);
        setIsAuthResolved(true);
      })
      .catch((error) => {
        if (!isMounted) {
          return;
        }

        setIsAuthResolved(true);
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
      setIsAuthResolved(true);
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
    if (!MULTIPLAYER_ENABLED) {
      return;
    }

    if (!isAuthResolved) {
      return;
    }

    if (!authUser) {
      return;
    }

    const pendingRedirectPath = loadPostLoginRedirectPath();

    if (!pendingRedirectPath) {
      return;
    }

    clearPostLoginRedirectPath();

    if (getCurrentPath() !== pendingRedirectPath) {
      navigateToPath(pendingRedirectPath, { replace: true });
    }
  }, [authUser, isAuthResolved]);

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
    if (!isAuthResolved) {
      return;
    }

    if (routeState.kind !== "invite-room") {
      return;
    }

    if (authUser && inviteEnabled) {
      return;
    }

    savePostLoginRedirectPath(getCurrentPath());
    setAuthStatusMessage(
      "Sign in first, then we will bring you straight back to the invite match."
    );
    navigateHome({ replace: true });
  }, [authUser, inviteEnabled, isAuthResolved, routeState.kind]);

  useEffect(() => {
    if (!MULTIPLAYER_ENABLED) {
      setInviteRoomState(createInitialInviteRoomState());
      return;
    }

    if (routeState.kind === "home") {
      setInviteRoomState(createInitialInviteRoomState());
      return;
    }

    if (routeState.kind === "invite-lobby") {
      setInviteRoomState((previousState) => ({
        ...createInitialInviteRoomState(),
        statusMessage: previousState.statusMessage,
      }));
    }
  }, [routeState.kind]);

  useEffect(() => {
    if (!MULTIPLAYER_ENABLED) {
      return undefined;
    }

    if (routeState.kind !== "invite-room") {
      return undefined;
    }

    if (!isAuthResolved) {
      return undefined;
    }

    if (!routeState.roomId) {
      setInviteRoomState((previousState) => ({
        ...previousState,
        room: null,
        isLoading: false,
        isRestarting: false,
        errorMessage:
          "This invite link is missing a room ID. Start a new invite match instead.",
      }));
      return undefined;
    }

    if (!authUser || !inviteEnabled) {
      setInviteRoomState((previousState) => ({
        ...previousState,
        room: null,
        isLoading: false,
        isRestarting: false,
        errorMessage:
          "Sign in with a Supabase-backed account before joining an invite match.",
      }));
      return undefined;
    }

    let isMounted = true;

    setInviteRoomState((previousState) => ({
      ...previousState,
      isLoading: true,
      errorMessage: "",
    }));

    fetchInviteRoom(routeState.roomId)
      .then((room) => {
        if (!isMounted) {
          return;
        }

        if (!room) {
          setInviteRoomState((previousState) => ({
            ...previousState,
            room: null,
            isLoading: false,
            isRestarting: false,
            errorMessage:
              "That invite room could not be found. Start a new invite match instead.",
          }));
          return;
        }

        setInviteRoomState((previousState) => ({
          ...previousState,
          room,
          isLoading: false,
          isRestarting: false,
          errorMessage: room.isInvalid
            ? "This invite room has invalid data and cannot be loaded safely."
            : "",
        }));
      })
      .catch((error) => {
        if (!isMounted) {
          return;
        }

        setInviteRoomState((previousState) => ({
          ...previousState,
          room: null,
          isLoading: false,
          isRestarting: false,
          errorMessage:
            error?.message || "Could not load that invite room right now.",
        }));
      });

    return () => {
      isMounted = false;
    };
  }, [authUser, inviteEnabled, isAuthResolved, routeState.kind, routeState.roomId]);

  useEffect(() => {
    if (!MULTIPLAYER_ENABLED) {
      return undefined;
    }

    if (
      routeState.kind !== "invite-room" ||
      !routeState.roomId ||
      !isAuthResolved ||
      !authUser ||
      !inviteEnabled
    ) {
      return undefined;
    }

    let unsubscribe = () => {};

    try {
      unsubscribe = subscribeToInviteRoom(routeState.roomId, {
        onRoomChange: (nextRoom) => {
          setInviteRoomState((previousState) => ({
            ...previousState,
            room: nextRoom,
            isLoading: false,
            isJoining: false,
            isPlaying: false,
            isRestarting: false,
            errorMessage: nextRoom.isInvalid
              ? "This invite room has invalid data and cannot be loaded safely."
              : "",
          }));
        },
        onRoomDeleted: () => {
          setInviteRoomState((previousState) => ({
            ...previousState,
            room: null,
            isLoading: false,
            isJoining: false,
            isPlaying: false,
            isRestarting: false,
            errorMessage:
              "This invite room is no longer available. Start a new match instead.",
          }));
        },
      });
    } catch {
      return undefined;
    }

    return unsubscribe;
  }, [authUser, inviteEnabled, isAuthResolved, routeState.kind, routeState.roomId]);

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
    if (gameMode === "invite") {
      return;
    }

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

    // Invite multiplayer uses a different cloud room model and is intentionally
    // excluded from Phase 8 records until it has dedicated storage semantics.
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
    history,
    humanPlayerSymbol,
    isDraw,
    playerDisplayNames,
    startingPlayer,
    winner,
  ]);

  const isMatchComplete = isInviteMode
    ? Boolean(inviteRoom?.winner)
    : Boolean(winnerInfo) || isDraw;

  return (
    <main className="app-shell">
      <section className="game-card" aria-label="Tic-tac-toe game">
        <header className="game-header">
          <div className="hero-stack">
            <p className="eyebrow">A Modern</p>
            <h1>Tic-Tac-Toe</h1>
            <p className="game-header-copy">
              Choose a mode, pick a board, and jump straight into the round.
            </p>
          </div>
        </header>

        <div className="game-layout">
          <section className="game-main">
            <StatusPanel
              currentMove={activeCurrentMove}
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
              statusOverride={inviteStatusContent?.status ?? ""}
              detailOverride={inviteStatusContent?.detail ?? ""}
              statusChips={statusChips}
            />

            <Board
              actions={
                isInviteMode ? (
                  canStartInviteRematch ? (
                    <div className="board-toolbar" aria-label="Invite actions">
                      <button
                        type="button"
                        className="new-game-button"
                        onClick={handleStartInviteRematch}
                        disabled={inviteRoomState.isRestarting}
                      >
                        Start next round
                      </button>
                    </div>
                  ) : null
                ) : (
                  <div className="board-toolbar" aria-label="Round actions">
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
                      className="history-sort-button"
                      onClick={handleUndo}
                      disabled={!canUndo}
                    >
                      Undo
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
                )
              }
              squares={currentEntry.squares}
              boardSize={boardSize}
              onPlay={handlePlay}
              winningLine={winnerInfo?.line ?? []}
              isGameOver={isMatchComplete}
              isInteractionDisabled={
                isInviteMode ? isInviteInteractionDisabled : isCpuTurn
              }
              isCpuTurn={isCpuTurn}
              turnNotice={boardTurnNotice}
              headingOverride={boardHeading}
            />

            {activeHistory.length > 1 ? (
              <section className="sidebar-card history-card history-main-card">
                <div className="sidebar-header">
                  <div>
                    <p className="eyebrow">History</p>
                    <h2>{isInviteMode ? "Move log" : "Time travel"}</h2>
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
                  history={activeHistory}
                  currentMove={activeCurrentMove}
                  isAscending={isAscending}
                  onJumpTo={handleJumpTo}
                  playerDisplayNames={playerDisplayNames}
                  isJumpDisabled={isInviteMode}
                />

              </section>
            ) : null}

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
          </section>

          <aside className="game-sidebar">
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

            {MULTIPLAYER_ENABLED && isInviteMode ? (
              <InviteMatchPanel
                authUser={authUser}
                canUseInviteMultiplayer={inviteEnabled}
                inviteDisplayName={inviteDisplayName}
                onInviteDisplayNameChange={handleInviteDisplayNameChange}
                onCreateRoom={handleCreateInviteRoom}
                onJoinRoom={handleJoinInviteRoom}
                onStartNextRound={handleStartInviteRematch}
                onCopyLink={handleCopyInviteLink}
                onBackHome={handleBackHome}
                onOpenInviteLobby={handleOpenInviteLobby}
                inviteRoom={inviteRoom}
                inviteEntryState={inviteEntryState}
                isLoading={inviteRoomState.isLoading}
                isCreating={inviteRoomState.isCreating}
                isJoining={inviteRoomState.isJoining}
                isPlaying={inviteRoomState.isPlaying}
                isRestarting={inviteRoomState.isRestarting}
                errorMessage={
                  inviteRoomState.errorMessage ||
                  (inviteEntryState?.state === "blocked"
                    ? inviteEntryState.message
                    : "")
                }
                statusMessage={inviteRoomState.statusMessage}
                copyStatus={inviteRoomState.copyStatus}
                participantSymbol={inviteParticipantSymbol}
                canStartNextRound={canStartInviteRematch}
              />
            ) : (
              <LocalRecordsPanel
                gameMode={recordGameMode}
                boardSize={boardSize}
                records={currentRecordBucket}
                source={recordsState.source}
                isLoading={recordsState.isLoading}
                errorMessage={recordsState.errorMessage}
                onClear={handleClearRecords}
                isClearDisabled={!canClearLocalRecords || recordsState.isLoading}
              />
            )}

          </aside>
        </div>

        {isLearnModalOpen ? (
          <LearnModal boardRules={effectiveBoardRules} onClose={handleCloseLearnModal} />
        ) : null}
      </section>
    </main>
  );
}
