import { isUsingSupabaseAuth } from "../authService";
import { supabase } from "../supabaseClient";
import { createBoardRules } from "../../utils/gameLogic";
import { normalizeDisplayName } from "../../utils/playerIdentity";

export const INVITE_ROOM_TABLE = "invite_rooms";

const INVITE_ROOM_SELECT = `
  id,
  status,
  board_size,
  win_length,
  board,
  current_player,
  winner,
  created_by,
  created_at,
  updated_at,
  completed_at,
  expires_at,
  move_count,
  moves,
  players_x_user_id,
  players_x_name,
  players_x_joined_at,
  players_o_user_id,
  players_o_name,
  players_o_joined_at
`;

function requireSupabaseClient() {
  if (!supabase) {
    throw new Error("Invite multiplayer requires a configured Supabase project.");
  }

  return supabase;
}

function getRpcResultRow(data) {
  if (Array.isArray(data)) {
    return data[0] ?? null;
  }

  return data ?? null;
}

function normalizeMove(move) {
  if (!move || typeof move !== "object") {
    return null;
  }

  const squareIndex = Number(move.squareIndex);
  const row = Number(move.row);
  const col = Number(move.col);
  const moveNumber = Number(move.move);
  const player = move.player === "X" || move.player === "O" ? move.player : null;

  if (
    !player ||
    !Number.isInteger(squareIndex) ||
    !Number.isInteger(row) ||
    !Number.isInteger(col) ||
    !Number.isInteger(moveNumber)
  ) {
    return null;
  }

  return {
    move: moveNumber,
    player,
    row,
    col,
    squareIndex,
  };
}

function mapInviteRoomRecord(record) {
  if (!record || typeof record !== "object") {
    return null;
  }

  const rules = createBoardRules(record.board_size);
  const board =
    Array.isArray(record.board) && record.board.length === rules.boardSize * rules.boardSize
      ? record.board.map((square) =>
          square === "X" || square === "O" ? square : null
        )
      : null;

  if (!board || rules.winLength !== Number(record.win_length)) {
    return {
      id: String(record.id ?? ""),
      isInvalid: true,
    };
  }

  const moves = Array.isArray(record.moves)
    ? record.moves
        .map(normalizeMove)
        .filter(Boolean)
        .sort((left, right) => left.move - right.move)
    : [];

  return {
    id: String(record.id),
    status: String(record.status ?? "waiting"),
    boardSize: rules.boardSize,
    winLength: rules.winLength,
    board,
    currentPlayer:
      record.current_player === "O" ? "O" : "X",
    winner:
      record.winner === "X" || record.winner === "O" || record.winner === "draw"
        ? record.winner
        : null,
    createdBy: String(record.created_by ?? ""),
    createdAt: String(record.created_at ?? ""),
    updatedAt: String(record.updated_at ?? ""),
    completedAt: record.completed_at ? String(record.completed_at) : "",
    expiresAt: record.expires_at ? String(record.expires_at) : "",
    moveCount: Number.isInteger(Number(record.move_count))
      ? Number(record.move_count)
      : moves.length,
    moves,
    players: {
      X: {
        userId: String(record.players_x_user_id ?? ""),
        displayName:
          normalizeDisplayName(record.players_x_name) || "Player X",
        joinedAt: String(record.players_x_joined_at ?? ""),
      },
      O:
        record.players_o_user_id || record.players_o_name
          ? {
              userId: String(record.players_o_user_id ?? ""),
              displayName:
                normalizeDisplayName(record.players_o_name) || "Player O",
              joinedAt: String(record.players_o_joined_at ?? ""),
            }
          : null,
    },
    isInvalid: false,
  };
}

function normalizeInviteErrorMessage(error) {
  const message = String(error?.message ?? "").trim().toUpperCase();

  if (!message) {
    return "Invite multiplayer is temporarily unavailable. Try again in a moment.";
  }

  switch (message) {
    case "AUTH_REQUIRED":
      return "Sign in with a Supabase account before using invite multiplayer.";
    case "PROFILE_REQUIRED":
      return "Add a display name before creating or joining an invite match.";
    case "ROOM_NOT_FOUND":
      return "That invite room could not be found.";
    case "ROOM_FULL":
      return "That invite room is already full.";
    case "ROOM_COMPLETE":
      return "That invite room is already complete.";
    case "ROOM_EXPIRED":
      return "That invite room has expired.";
    case "ROOM_WAITING":
      return "Waiting for the second player to join.";
    case "ROOM_ACTIVE":
      return "This invite match is still in progress.";
    case "ROOM_UNAVAILABLE":
      return "That invite room is unavailable right now.";
    case "NOT_A_PARTICIPANT":
      return "Only room participants can play in this invite match.";
    case "NOT_YOUR_TURN":
      return "Wait for your turn before making a move.";
    case "SQUARE_OCCUPIED":
      return "That square is already taken.";
    case "MOVE_OUT_OF_RANGE":
      return "That move is outside the board.";
    default:
      return error?.message ||
        "Invite multiplayer is temporarily unavailable. Try again in a moment.";
  }
}

export function canUseInviteMultiplayer(authUser) {
  return Boolean(
    authUser &&
      authUser.provider &&
      authUser.provider !== "local" &&
      isUsingSupabaseAuth()
  );
}

export async function createInviteRoom({ authUser, displayName, boardRules }) {
  const client = requireSupabaseClient();
  const safeDisplayName = normalizeDisplayName(displayName);
  const safeRules = createBoardRules(boardRules?.boardSize ?? boardRules);

  if (!canUseInviteMultiplayer(authUser)) {
    throw new Error("AUTH_REQUIRED");
  }

  if (!safeDisplayName) {
    throw new Error("PROFILE_REQUIRED");
  }

  const { data, error } = await client.rpc("create_invite_room", {
    p_board_size: safeRules.boardSize,
    p_win_length: safeRules.winLength,
    p_display_name: safeDisplayName,
  });

  if (error) {
    throw new Error(normalizeInviteErrorMessage(error));
  }

  const room = mapInviteRoomRecord(getRpcResultRow(data));

  if (!room) {
    throw new Error("Could not create an invite room right now.");
  }

  return room;
}

export async function fetchInviteRoom(roomId) {
  const client = requireSupabaseClient();
  const normalizedRoomId = String(roomId ?? "").trim();

  if (!normalizedRoomId) {
    return null;
  }

  const { data, error } = await client
    .from(INVITE_ROOM_TABLE)
    .select(INVITE_ROOM_SELECT)
    .eq("id", normalizedRoomId)
    .maybeSingle();

  if (error) {
    throw new Error(normalizeInviteErrorMessage(error));
  }

  if (!data) {
    return null;
  }

  return mapInviteRoomRecord(data);
}

export async function joinInviteRoom({ roomId, authUser, displayName }) {
  const client = requireSupabaseClient();
  const safeDisplayName = normalizeDisplayName(displayName);

  if (!canUseInviteMultiplayer(authUser)) {
    throw new Error("AUTH_REQUIRED");
  }

  if (!safeDisplayName) {
    throw new Error("PROFILE_REQUIRED");
  }

  const { data, error } = await client.rpc("join_invite_room", {
    p_room_id: String(roomId ?? "").trim(),
    p_display_name: safeDisplayName,
  });

  if (error) {
    throw new Error(normalizeInviteErrorMessage(error));
  }

  const room = mapInviteRoomRecord(getRpcResultRow(data));

  if (!room) {
    throw new Error("Could not join that invite room right now.");
  }

  return room;
}

export async function playInviteMove({ roomId, squareIndex }) {
  const client = requireSupabaseClient();
  const { data, error } = await client.rpc("play_invite_move", {
    p_room_id: String(roomId ?? "").trim(),
    p_square_index: Number(squareIndex),
  });

  if (error) {
    throw new Error(normalizeInviteErrorMessage(error));
  }

  const room = mapInviteRoomRecord(getRpcResultRow(data));

  if (!room) {
    throw new Error("Could not save that move right now.");
  }

  return room;
}

export async function restartInviteRoom({ roomId }) {
  const client = requireSupabaseClient();
  const { data, error } = await client.rpc("restart_invite_room", {
    p_room_id: String(roomId ?? "").trim(),
  });

  if (error) {
    throw new Error(normalizeInviteErrorMessage(error));
  }

  const room = mapInviteRoomRecord(getRpcResultRow(data));

  if (!room) {
    throw new Error("Could not start the next round right now.");
  }

  return room;
}

export function subscribeToInviteRoom(roomId, { onRoomChange, onRoomDeleted }) {
  const client = requireSupabaseClient();
  const normalizedRoomId = String(roomId ?? "").trim();

  if (!normalizedRoomId) {
    return () => {};
  }

  const channel = client
    .channel(`invite-room-${normalizedRoomId}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: INVITE_ROOM_TABLE,
        filter: `id=eq.${normalizedRoomId}`,
      },
      (payload) => {
        if (payload.eventType === "DELETE") {
          onRoomDeleted?.();
          return;
        }

        const room = mapInviteRoomRecord(payload.new);

        if (room) {
          onRoomChange?.(room);
        } else {
          onRoomDeleted?.();
        }
      }
    )
    .subscribe();

  return () => {
    client.removeChannel(channel);
  };
}
