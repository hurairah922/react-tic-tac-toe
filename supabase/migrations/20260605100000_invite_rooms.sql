create or replace function public.invite_room_board_values_valid(board text[])
returns boolean
language sql
immutable
as $$
  select coalesce(
    bool_and(cell is null or cell in ('X', 'O')),
    true
  )
  from unnest(board) as cell
$$;

create or replace function public.normalize_invite_display_name(raw_name text)
returns text
language sql
immutable
as $$
  select nullif(
    left(
      regexp_replace(trim(coalesce(raw_name, '')), '\s+', ' ', 'g'),
      24
    ),
    ''
  )
$$;

create or replace function public.is_invite_board_full(board text[])
returns boolean
language sql
immutable
as $$
  select not exists (
    select 1
    from unnest(board) as cell
    where cell is null
  )
$$;

create or replace function public.get_invite_room_winner(
  board text[],
  board_size integer,
  win_length integer
)
returns text
language plpgsql
immutable
as $$
declare
  row_index integer;
  column_index integer;
  direction_index integer;
  offset_index integer;
  row_step integer;
  column_step integer;
  last_row integer;
  last_column integer;
  start_square integer;
  test_square integer;
  candidate text;
  line_matches boolean;
  row_steps integer[] := array[0, 1, 1, 1];
  column_steps integer[] := array[1, 0, 1, -1];
begin
  for row_index in 0..board_size - 1 loop
    for column_index in 0..board_size - 1 loop
      start_square := row_index * board_size + column_index + 1;
      candidate := board[start_square];

      if candidate is null then
        continue;
      end if;

      for direction_index in 1..4 loop
        row_step := row_steps[direction_index];
        column_step := column_steps[direction_index];
        last_row := row_index + row_step * (win_length - 1);
        last_column := column_index + column_step * (win_length - 1);

        if
          last_row < 0 or last_row >= board_size or
          last_column < 0 or last_column >= board_size
        then
          continue;
        end if;

        line_matches := true;

        for offset_index in 1..win_length - 1 loop
          test_square := (
            (row_index + row_step * offset_index) * board_size +
            (column_index + column_step * offset_index) +
            1
          );

          if board[test_square] is distinct from candidate then
            line_matches := false;
            exit;
          end if;
        end loop;

        if line_matches then
          return candidate;
        end if;
      end loop;
    end loop;
  end loop;

  return null;
end;
$$;

create table if not exists public.invite_rooms (
  id uuid primary key default gen_random_uuid(),
  status text not null default 'waiting',
  board_size integer not null,
  win_length integer not null,
  board text[] not null,
  current_player text not null default 'X',
  winner text null,
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz null,
  expires_at timestamptz not null default (now() + interval '7 days'),
  move_count integer not null default 0,
  moves jsonb not null default '[]'::jsonb,
  players_x_user_id uuid not null references auth.users(id) on delete cascade,
  players_x_name text not null,
  players_x_joined_at timestamptz not null default now(),
  players_o_user_id uuid null references auth.users(id) on delete set null,
  players_o_name text null,
  players_o_joined_at timestamptz null,

  constraint invite_rooms_status_check
    check (status in ('waiting', 'active', 'complete', 'expired')),

  constraint invite_rooms_board_size_check
    check (board_size in (3, 4, 5)),

  constraint invite_rooms_win_length_check
    check (
      (board_size = 3 and win_length = 3) or
      (board_size = 4 and win_length = 4) or
      (board_size = 5 and win_length = 4)
    ),

  constraint invite_rooms_board_length_check
    check (array_length(board, 1) = board_size * board_size),

  constraint invite_rooms_board_values_check
    check (public.invite_room_board_values_valid(board)),

  constraint invite_rooms_current_player_check
    check (current_player in ('X', 'O')),

  constraint invite_rooms_winner_check
    check (winner is null or winner in ('X', 'O', 'draw')),

  constraint invite_rooms_move_count_check
    check (move_count >= 0),

  constraint invite_rooms_player_o_shape_check
    check (
      (players_o_user_id is null and players_o_name is null and players_o_joined_at is null) or
      (players_o_user_id is not null and players_o_name is not null and players_o_joined_at is not null)
    )
);

create index if not exists invite_rooms_created_by_idx
  on public.invite_rooms (created_by);

create index if not exists invite_rooms_status_idx
  on public.invite_rooms (status, updated_at desc);

alter table public.invite_rooms enable row level security;

drop policy if exists "Authenticated users can read invite rooms" on public.invite_rooms;
create policy "Authenticated users can read invite rooms"
on public.invite_rooms
for select
to authenticated
using (auth.uid() is not null);

create or replace function public.create_invite_room(
  p_board_size integer,
  p_win_length integer,
  p_display_name text
)
returns public.invite_rooms
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  normalized_name text := public.normalize_invite_display_name(p_display_name);
  created_room public.invite_rooms;
begin
  if current_user_id is null then
    raise exception 'AUTH_REQUIRED';
  end if;

  if normalized_name is null then
    raise exception 'PROFILE_REQUIRED';
  end if;

  if not (
    (p_board_size = 3 and p_win_length = 3) or
    (p_board_size = 4 and p_win_length = 4) or
    (p_board_size = 5 and p_win_length = 4)
  ) then
    raise exception 'ROOM_INVALID';
  end if;

  insert into public.invite_rooms (
    status,
    board_size,
    win_length,
    board,
    current_player,
    winner,
    created_by,
    move_count,
    moves,
    players_x_user_id,
    players_x_name,
    players_x_joined_at
  )
  values (
    'waiting',
    p_board_size,
    p_win_length,
    array_fill(null::text, array[p_board_size * p_board_size]),
    'X',
    null,
    current_user_id,
    0,
    '[]'::jsonb,
    current_user_id,
    normalized_name,
    now()
  )
  returning * into created_room;

  return created_room;
end;
$$;

create or replace function public.join_invite_room(
  p_room_id uuid,
  p_display_name text
)
returns public.invite_rooms
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  normalized_name text := public.normalize_invite_display_name(p_display_name);
  room public.invite_rooms;
begin
  if current_user_id is null then
    raise exception 'AUTH_REQUIRED';
  end if;

  if normalized_name is null then
    raise exception 'PROFILE_REQUIRED';
  end if;

  select * into room
  from public.invite_rooms
  where id = p_room_id
  for update;

  if not found then
    raise exception 'ROOM_NOT_FOUND';
  end if;

  if room.expires_at <= now() or room.status = 'expired' then
    update public.invite_rooms
    set status = 'expired', updated_at = now()
    where id = p_room_id;
    raise exception 'ROOM_EXPIRED';
  end if;

  if room.players_x_user_id = current_user_id or room.players_o_user_id = current_user_id then
    select * into room
    from public.invite_rooms
    where id = p_room_id;

    return room;
  end if;

  if room.status = 'complete' or room.winner is not null then
    raise exception 'ROOM_COMPLETE';
  end if;

  if room.players_o_user_id is not null then
    raise exception 'ROOM_FULL';
  end if;

  update public.invite_rooms
  set
    players_o_user_id = current_user_id,
    players_o_name = normalized_name,
    players_o_joined_at = now(),
    status = 'active',
    updated_at = now()
  where id = p_room_id
  returning * into room;

  return room;
end;
$$;

create or replace function public.play_invite_move(
  p_room_id uuid,
  p_square_index integer
)
returns public.invite_rooms
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  room public.invite_rooms;
  player_symbol text;
  next_board text[];
  next_winner text;
  next_status text;
  next_completed_at timestamptz;
  row_number integer;
  column_number integer;
  move_entry jsonb;
begin
  if current_user_id is null then
    raise exception 'AUTH_REQUIRED';
  end if;

  select * into room
  from public.invite_rooms
  where id = p_room_id
  for update;

  if not found then
    raise exception 'ROOM_NOT_FOUND';
  end if;

  if room.expires_at <= now() or room.status = 'expired' then
    update public.invite_rooms
    set status = 'expired', updated_at = now()
    where id = p_room_id;
    raise exception 'ROOM_EXPIRED';
  end if;

  if room.status = 'waiting' or room.players_o_user_id is null then
    raise exception 'ROOM_WAITING';
  end if;

  if room.status = 'complete' or room.winner is not null then
    raise exception 'ROOM_COMPLETE';
  end if;

  if room.players_x_user_id = current_user_id then
    player_symbol := 'X';
  elsif room.players_o_user_id = current_user_id then
    player_symbol := 'O';
  else
    raise exception 'NOT_A_PARTICIPANT';
  end if;

  if room.current_player <> player_symbol then
    raise exception 'NOT_YOUR_TURN';
  end if;

  if p_square_index < 0 or p_square_index >= room.board_size * room.board_size then
    raise exception 'MOVE_OUT_OF_RANGE';
  end if;

  if room.board[p_square_index + 1] is not null then
    raise exception 'SQUARE_OCCUPIED';
  end if;

  next_board := room.board;
  next_board[p_square_index + 1] := player_symbol;
  row_number := floor(p_square_index / room.board_size)::integer + 1;
  column_number := mod(p_square_index, room.board_size) + 1;
  next_winner := public.get_invite_room_winner(
    next_board,
    room.board_size,
    room.win_length
  );
  next_status := 'active';
  next_completed_at := null;

  if next_winner is not null then
    next_status := 'complete';
    next_completed_at := now();
  elsif public.is_invite_board_full(next_board) then
    next_winner := 'draw';
    next_status := 'complete';
    next_completed_at := now();
  end if;

  move_entry := jsonb_build_object(
    'move', room.move_count + 1,
    'player', player_symbol,
    'row', row_number,
    'col', column_number,
    'squareIndex', p_square_index
  );

  update public.invite_rooms
  set
    board = next_board,
    current_player = case when next_status = 'complete' then room.current_player else case when player_symbol = 'X' then 'O' else 'X' end end,
    winner = next_winner,
    status = next_status,
    completed_at = next_completed_at,
    move_count = room.move_count + 1,
    moves = room.moves || jsonb_build_array(move_entry),
    updated_at = now()
  where id = p_room_id
  returning * into room;

  return room;
end;
$$;

grant execute on function public.create_invite_room(integer, integer, text) to authenticated;
grant execute on function public.join_invite_room(uuid, text) to authenticated;
grant execute on function public.play_invite_move(uuid, integer) to authenticated;

alter publication supabase_realtime add table public.invite_rooms;
