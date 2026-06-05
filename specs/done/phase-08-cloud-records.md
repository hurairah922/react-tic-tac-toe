# Phase 8: Cloud Records

## Status

Done

## Summary

Added signed-in cloud record syncing and match-history persistence through Supabase while preserving the existing guest-first local record flow.

## What Shipped

- A records persistence layer that chooses browser-local records for guests and Supabase-backed records for signed-in users.
- Supabase match-history loading for authenticated users, with stats derived from saved match rows instead of duplicated aggregate counters.
- Completed-match validation before saving, including mode, board size, difficulty, move count, and final-board winner or draw consistency.
- Duplicate-save protection so completed matches are not written more than once because of re-renders, delayed async work, or repeated round actions.
- Non-blocking cloud loading and save failure handling so gameplay continues even when Supabase is unavailable.
- A records panel that reflects whether the current source is local or cloud.
- A Supabase SQL migration for `public.match_history`, including constraints, indexes, row-level security, and per-user access policies.
- CPU match-history support that stores the human symbol so wins and losses remain accurate even when the human chooses `X` or `O`.

## Acceptance Criteria Covered

- Guest records remain local.
- Signed-in records persist across devices once the Supabase table is created and the user is authenticated.
- Match results are validated before saving.
- Stats stay separated by mode, board size, and difficulty.
- Incomplete matches are not saved.
- Duplicate match saves are prevented.
- Cloud load and save failures do not break gameplay.
- Supabase Row Level Security protects each user's match-history rows.

## Notes

The browser app does not create the Supabase table automatically. The migration in `supabase/migrations/20260604120000_match_history.sql` must be applied in the Supabase project before cloud records can be saved.

Guest-to-account record migration was intentionally left out of this phase so the local and cloud sources stay cleanly separated.

Cloud records are currently used to derive stats and persist match history, but there is not yet a dedicated UI for browsing full historical match entries.

## Follow-Ups

- Add a match-history browser or recent-matches panel if users need to inspect individual saved rounds.
- If the `match_history` table was already created from an older version of the migration, add a follow-up `ALTER TABLE` migration for newer columns such as `human_symbol`.
- Select and document the next active feature in `specs/features/active.md` when Phase 9 begins.
