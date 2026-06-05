# Active Feature Spec

## Phase 8: Cloud Records

**Status:** Active

## Goal

Save records and match history for signed-in users while keeping guest records local.

Signed-in users should see their saved records across devices after logging in.

Guest users should continue using local-only records with no account or cloud dependency.

## Acceptance Criteria

* Guest records remain local.
* Signed-in records persist across devices.
* Match results are validated before saving.
* Stats separate mode, board size, and difficulty.
* Incomplete matches are not saved.
* Duplicate match saves are prevented.
* Cloud save/load failures do not break gameplay.
* Supabase Row Level Security protects each user's data.

## Current Context

The app already supports:

* Guest play
* Optional sign-in
* Local records
* CPU mode
* Local multiplayer mode
* Board sizes: 3x3, 4x4, and 5x5
* CPU difficulties: easy, medium, and hard
* Match completion flow

This phase should extend the existing records system. It should not redesign the whole app.

## Core Requirements

### 1. Preserve Guest Records

Guest users must continue using local records.

Guest records must work without:

* Supabase
* Login
* Network access
* Cloud database writes

If there is no authenticated user, the app should use the existing local records behavior.

### 2. Save Cloud Records for Signed-In Users

When a user is signed in, completed match results should save to Supabase.

Cloud records should persist across:

* Page refreshes
* Browser sessions
* Logout/login cycles
* Different devices

### 3. Save Match History

Each completed signed-in match should create one match history row.

The saved match history should include:

* User ID
* Game mode
* Board size
* CPU difficulty, when applicable
* Result
* Winner, when applicable
* Player names, when available
* Move count
* Moves, if available
* Completed timestamp

Incomplete matches must not be saved.

### 4. Validate Match Results Before Saving

Before saving a match, validate:

* Match is complete.
* Board size is supported: 3, 4, or 5.
* Game mode is supported.
* CPU difficulty is valid for CPU mode.
* Difficulty is null or omitted for local multiplayer mode.
* Move count is valid.
* Winner/result matches the final board state.

Invalid match results must not be saved.

### 5. Prevent Duplicate Saves

A completed match should only save once.

Prevent duplicate saves caused by:

* React re-renders
* Repeated state updates
* Clicking New Game multiple times
* Delayed async save calls

Use a stable match completion ID, save guard, or equivalent mechanism.

### 6. Separate Stats Correctly

Stats must be grouped by:

* Mode
* Board size
* Difficulty

Difficulty applies only to CPU matches.

For local multiplayer matches, difficulty should be `null` or omitted.

### 7. Load the Correct Records Source

The records UI should use:

* Local records for guests
* Cloud records for signed-in users

Do not mix guest records with signed-in cloud records.

Do not add guest-to-account migration in this phase.

### 8. Handle Cloud Loading and Errors

The records UI should handle:

* Loading cloud records
* Empty cloud records
* Cloud load failure
* Cloud save failure

Cloud failures should not block gameplay.

Use a small non-blocking message, existing UI pattern, or console logging.

## Supabase Database Requirement

Add a Supabase SQL migration for a `match_history` table.

The table should include:

```sql
create table if not exists public.match_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,

  mode text not null,
  board_size integer not null,
  difficulty text null,

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
    )
);
```

Add indexes:

```sql
create index if not exists match_history_user_id_idx
  on public.match_history (user_id);

create index if not exists match_history_user_completed_at_idx
  on public.match_history (user_id, completed_at desc);

create index if not exists match_history_stats_group_idx
  on public.match_history (user_id, mode, board_size, difficulty);
```

Enable Row Level Security:

```sql
alter table public.match_history enable row level security;

create policy "Users can read their own match history"
on public.match_history
for select
to authenticated
using (auth.uid() = user_id);

create policy "Users can insert their own match history"
on public.match_history
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "Users can delete their own match history"
on public.match_history
for delete
to authenticated
using (auth.uid() = user_id);
```

## Stats Approach

Prefer deriving stats from `match_history`.

Do not create separate aggregate counters unless the app already has a safe pattern for this.

Derived stats reduce the risk of cloud/local stat drift.

## Recommended Code Organization

Use a records persistence layer.

Recommended structure:

```txt
src/
  services/
    records/
      localRecords.ts
      cloudRecords.ts
      recordsService.ts
      recordValidation.ts
```

Adapt file names to match the current codebase if needed.

Expected responsibility:

* `localRecords.ts`: localStorage record behavior
* `cloudRecords.ts`: Supabase read/write/delete behavior
* `recordsService.ts`: chooses local or cloud based on auth state
* `recordValidation.ts`: validates completed match payloads before save

Avoid placing Supabase calls directly inside UI components.

## Auth Provider Behavior

Use the existing auth provider abstraction.

If `REACT_APP_AUTH_PROVIDER=local`:

* Cloud saving should be disabled.
* Records should remain local.
* The app should not crash if Supabase env vars are empty.

If `REACT_APP_AUTH_PROVIDER=supabase`:

* Signed-in users should use cloud records.
* Guests should still use local records.

## Non-Goals

Do not add:

* Real-time multiplayer
* Global leaderboards
* Public profiles
* Social sharing
* Admin dashboards
* Guest-to-account migration
* Replay viewer
* Complex analytics
* Paid services

## Testing Checklist

Test as guest:

* Play local multiplayer match.
* Play CPU match.
* Confirm records save locally.
* Refresh the page.
* Confirm local records remain.
* Confirm no cloud write is required.

Test as signed-in user:

* Play local multiplayer match.
* Play CPU easy match.
* Play CPU medium match.
* Play CPU hard match.
* Refresh the page.
* Confirm records load from cloud.
* Sign in on another browser/device.
* Confirm records appear there.

Test validation:

* Incomplete match does not save.
* Unsupported board size does not save.
* Invalid mode does not save.
* CPU match without difficulty does not save.
* Local multiplayer match saves with null difficulty.

Test duplicate prevention:

* Complete one match.
* Confirm only one row is created.
* Click New Game repeatedly.
* Confirm no duplicate rows are created.

## Definition of Done

Phase 8 is complete when:

* Guest records still work locally.
* Signed-in users have cloud-persisted match history.
* Signed-in users have cloud-derived stats.
* Stats separate mode, board size, and difficulty.
* Invalid results are rejected.
* Duplicate saves are prevented.
* Cloud errors do not break gameplay.
* Supabase RLS protects user records.
* The app builds successfully.
