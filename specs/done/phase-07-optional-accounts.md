# Phase 7: Optional Accounts

## Status

Done

## Summary

Added optional account support without interrupting guest play, using Supabase-ready authentication with a safe local fallback and separate per-match display names.

## What Shipped

- A compact account area that shows guest state, signed-in state, sign-in status, and sign-out controls.
- Real Supabase email magic-link auth wiring through environment-configured project values.
- A local auth fallback path so the app can still run without backend auth during development or misconfiguration.
- Profile name editing for signed-in users.
- Profile name persistence through Supabase auth metadata when Supabase auth is enabled.
- Separate per-match display name controls for:
  - human player in CPU mode
  - CPU opponent label
  - player X in local mode
  - player O in local mode
- Match display names flowing through round status, winner messaging, draw messaging, board turn notice, and move history.
- Auth state handling that does not reset the active board, current turn, records, or game mode.
- Environment-based auth configuration for Supabase URL, publishable key, redirect URL, and provider selection.

## Acceptance Criteria Covered

- Guest play still works.
- User can sign in with a free-friendly auth provider.
- User can sign out.
- Signed-in user can have a profile name.
- User can set display name per match.
- Guest users can still set display names per match.
- Auth state does not block the game.
- Existing local records continue to work.
- Existing CPU and local modes continue to work.
- Existing board size selection continues to work.

## Notes

Supabase auth was implemented with email magic links, which keeps the provider free-friendly and small in scope for this phase.

Guest play remains the default and immediate experience. Even when Supabase is configured, users can ignore sign-in and keep using all local gameplay features.

Profile names and per-match names remain intentionally separate. Changing a profile name updates future defaults, while per-match overrides stay local to the current setup.

## Follow-Ups

- Phase 8 can build on this auth foundation to sync records and match history for signed-in users.
- If additional auth providers are needed later, they should be added through the same auth service abstraction rather than directly in UI components.
- If Supabase profile data expands beyond auth metadata, a dedicated `profiles` table can be introduced in a later backend-focused phase.
