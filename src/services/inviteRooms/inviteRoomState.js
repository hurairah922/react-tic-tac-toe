import {
  LOCAL_PLAYER_O_NAME,
  LOCAL_PLAYER_X_NAME,
} from "../../utils/playerIdentity";

export function getInviteRoomParticipantSymbol(room, userId) {
  const normalizedUserId = String(userId ?? "").trim();

  if (!room || !normalizedUserId) {
    return null;
  }

  if (room.players?.X?.userId === normalizedUserId) {
    return "X";
  }

  if (room.players?.O?.userId === normalizedUserId) {
    return "O";
  }

  return null;
}

export function getInviteRoomDisplayNames(room) {
  return {
    X: room?.players?.X?.displayName || LOCAL_PLAYER_X_NAME,
    O: room?.players?.O?.displayName || LOCAL_PLAYER_O_NAME,
  };
}

export function isInviteRoomExpired(room, now = Date.now()) {
  const expiresAt = new Date(room?.expiresAt ?? "").getTime();

  return Number.isFinite(expiresAt) && expiresAt <= now;
}

export function buildInviteHistory(room) {
  const boardSize = Number(room?.boardSize ?? 0);
  const squareCount = boardSize > 0 ? boardSize * boardSize : 0;
  const moves = Array.isArray(room?.moves) ? room.moves : [];
  const initialEntry = {
    squares: Array(squareCount).fill(null),
    moveLocation: null,
    player: null,
  };

  return moves.reduce(
    (historyEntries, move) => {
      const previousSquares =
        historyEntries[historyEntries.length - 1]?.squares ??
        Array(squareCount).fill(null);
      const nextSquares = previousSquares.slice();

      if (
        Number.isInteger(move?.squareIndex) &&
        move.squareIndex >= 0 &&
        move.squareIndex < nextSquares.length &&
        (move?.player === "X" || move?.player === "O")
      ) {
        nextSquares[move.squareIndex] = move.player;
      }

      historyEntries.push({
        squares: nextSquares,
        moveLocation: move?.row && move?.col
          ? { row: move.row, col: move.col }
          : null,
        player: move?.player === "X" || move?.player === "O" ? move.player : null,
      });

      return historyEntries;
    },
    [initialEntry]
  );
}

export function getInviteRoomEntryState(room, authUser) {
  const userId = String(authUser?.id ?? "").trim();
  const participantSymbol = getInviteRoomParticipantSymbol(room, userId);

  if (!room) {
    return {
      code: "not_found",
      message: "That invite room could not be found. Start a new invite match instead.",
      state: "blocked",
    };
  }

  if (!userId) {
    return {
      code: "auth_required",
      message: "Sign in with a Supabase account before joining an invite match.",
      state: "blocked",
    };
  }

  if (room.isInvalid) {
    return {
      code: "invalid",
      message: "This invite room has invalid data and cannot be loaded safely.",
      state: "blocked",
    };
  }

  if (participantSymbol) {
    return {
      code: "",
      message: "",
      participantSymbol,
      state: "participant",
    };
  }

  if (isInviteRoomExpired(room) || room.status === "expired") {
    return {
      code: "expired",
      message: "This invite room has expired. Create a new match to continue.",
      state: "blocked",
    };
  }

  if (room.status === "complete" || room.winner) {
    return {
      code: "complete",
      message: "This invite room is already complete. Start a new match to play again.",
      state: "blocked",
    };
  }

  if (room.players?.O?.userId) {
    return {
      code: "full",
      message: "This invite room already has two players. Ask the host for a new link.",
      state: "blocked",
    };
  }

  if (room.createdBy && room.createdBy === userId) {
    return {
      code: "own_room",
      message: "This is your invite link. Share it with another signed-in player to fill the second seat.",
      state: "blocked",
    };
  }

  return {
    code: "",
    message: "",
    state: "joinable",
  };
}
