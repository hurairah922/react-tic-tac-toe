create extension if not exists pgcrypto;

create table if not exists public.match_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,

  mode text not null,
  board_size integer not null,
  difficulty text null,
  human_symbol text null,

  result text not null,
  winner text null,

  player_x_name text null,
  player_o_name text null,

  move_count integer not null,
  moves jsonb null,

  completed_at timestamptz not null default now(),
  created_at timestamptz not null default now(),

  constraint match_history_mode_check
    check (mode in ('local', 'cpu', 'local_multiplayer')),

  constraint match_history_board_size_check
    check (board_size in (3, 4, 5)),

  constraint match_history_difficulty_check
    check (difficulty is null or difficulty in ('easy', 'medium', 'hard')),

  constraint match_history_human_symbol_check
    check (human_symbol is null or human_symbol in ('X', 'O')),

  constraint match_history_result_check
    check (result in ('x_win', 'o_win', 'draw')),

  constraint match_history_winner_check
    check (winner is null or winner in ('X', 'O')),

  constraint match_history_move_count_check
    check (move_count > 0),

  constraint match_history_cpu_difficulty_check
    check (
      (mode = 'cpu' and difficulty in ('easy', 'medium', 'hard'))
      or
      (mode <> 'cpu' and difficulty is null)
    ),

  constraint match_history_cpu_symbol_check
    check (
      (mode = 'cpu' and human_symbol in ('X', 'O'))
      or
      (mode <> 'cpu' and human_symbol is null)
    )
);

create index if not exists match_history_user_id_idx
  on public.match_history (user_id);

create index if not exists match_history_user_completed_at_idx
  on public.match_history (user_id, completed_at desc);

create index if not exists match_history_stats_group_idx
  on public.match_history (user_id, mode, board_size, difficulty);

alter table public.match_history enable row level security;

drop policy if exists "Users can read their own match history" on public.match_history;
create policy "Users can read their own match history"
on public.match_history
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can insert their own match history" on public.match_history;
create policy "Users can insert their own match history"
on public.match_history
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own match history" on public.match_history;
create policy "Users can delete their own match history"
on public.match_history
for delete
to authenticated
using (auth.uid() = user_id);
