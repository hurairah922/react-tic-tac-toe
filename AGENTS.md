# Agent Instructions

## Project

This is a production-ready tic-tac-toe game platform built in phases.

Always read these files before implementation:

- specs/constitution.md
- specs/roadmap.md
- specs/tech-stack.md
- specs/phases.md
- specs/features/active.md

## Scope Control

Implement only the feature described in `specs/features/active.md`.

Do not implement future features unless explicitly requested.

Future features may include:

- CPU opponent
- Custom board sizes
- Accounts
- Invite links
- Real-time multiplayer
- Async multiplayer
- Stats and leaderboards

Do not start these unless they are the active feature.

## Engineering Rules

- Preserve existing behavior unless the active spec requires a change.
- Keep React components small and focused.
- Keep game logic separate from UI where practical.
- Use immutable state updates.
- Do not add dependencies unless necessary.
- Prefer accessible native HTML patterns.
- Keep CSS responsive and maintainable.
- Run available verification commands before finishing.

## Final Response Format

After completing a task, report:

- Files changed
- What was implemented
- What was verified
- Any known limitations