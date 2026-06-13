# Multiplayer Pause

## Summary

Pause multiplayer in the user-facing product until the invite and room flow is ready for production use.

## Requirements

- Remove or hide multiplayer mode from the visible game mode selector.
- Do not show invite-link creation or join UI in the main interface.
- Keep any existing multiplayer logic only if it is safely gated behind a feature flag or internal constant.
- Ensure local two-player and CPU modes still work normally.
- Ensure board size selection remains visible and usable for all active modes.
- Do not delete Phase 9 notes.
- Mark multiplayer as paused in the specs.
- Add a comment near the feature flag explaining that multiplayer is paused because real-time room sync, third-player handling, and invite state are not ready.

## UX Requirement

The user should not see multiplayer as an available option until it is fully implemented.

## Notes

- This is a temporary product pause, not a permanent deletion of the multiplayer implementation.
- Invite and room logic may stay in the codebase as long as it is not exposed in the visible UI.
