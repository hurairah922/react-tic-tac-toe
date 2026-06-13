# Runtime Product Pause: Multiplayer UI

## Status

Documented

## Summary

This changelog records the temporary product decision to pause multiplayer in the visible UI while keeping the underlying invite-related implementation gated behind an internal flag.

## Changes

- Removed multiplayer from the visible game mode selector.
- Hid invite creation, join, and share-link flows from the main interface.
- Preserved the existing invite/multiplayer implementation behind an internal feature flag instead of deleting it.
- Kept local two-player and CPU modes available as the active gameplay options.
- Kept board size selection available for the active gameplay modes.
- Added a feature-flag comment explaining that multiplayer is paused because real-time room sync, third-player handling, and invite state are not ready.
- Updated the specs to mark multiplayer as paused instead of presenting it as currently available UX.

## Notes

- This is a product pause, not a removal of long-term multiplayer plans.
- Phase 9 planning notes remain in the specs and were intentionally preserved.
- Invite routes now fall back safely instead of surfacing half-ready multiplayer UI.

## Follow-Ups

- Re-enable multiplayer only when room sync, third-player handling, and invite-state behavior are ready for public use.
- Revisit invite-room test coverage when multiplayer work resumes so paused UI and active backend logic stay aligned.
