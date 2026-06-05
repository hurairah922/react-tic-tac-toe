import { supabase } from "../supabaseClient";

export const MATCH_HISTORY_TABLE = "match_history";

function requireSupabaseClient() {
  if (!supabase) {
    throw new Error("Supabase is not configured for cloud records.");
  }

  return supabase;
}

export async function fetchCloudMatchHistory(authUser) {
  const client = requireSupabaseClient();
  const userId = String(authUser?.id ?? "").trim();

  if (!userId) {
    return [];
  }

  const { data, error } = await client
    .from(MATCH_HISTORY_TABLE)
    .select(
      "id, mode, board_size, difficulty, result, winner, player_x_name, player_o_name, move_count, moves, completed_at, created_at"
    )
    .eq("user_id", userId)
    .order("completed_at", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    throw error;
  }

  return Array.isArray(data) ? data : [];
}

export async function insertCloudMatchHistory(authUser, matchRecord) {
  const client = requireSupabaseClient();
  const userId = String(authUser?.id ?? "").trim();

  if (!userId) {
    throw new Error("Signed-in user ID is required for cloud records.");
  }

  const { error } = await client.from(MATCH_HISTORY_TABLE).insert([
    {
      ...matchRecord,
      user_id: userId,
    },
  ]);

  if (error) {
    throw error;
  }
}

export async function clearCloudMatchHistory(authUser) {
  const client = requireSupabaseClient();
  const userId = String(authUser?.id ?? "").trim();

  if (!userId) {
    return;
  }

  const { error } = await client
    .from(MATCH_HISTORY_TABLE)
    .delete()
    .eq("user_id", userId);

  if (error) {
    throw error;
  }
}
