# Runtime UX Fix: Status Chip Controls

## Status

Documented

## Summary

This changelog records the runtime UX adjustments that turned the always-visible status chip row into the primary place for viewing and changing active match settings.

## Changes

- Kept the game summary/status area above the board instead of moving it into the board card.
- Converted the configurable summary fields into interactive controls for game mode, board size, CPU side, and CPU difficulty when relevant.
- Removed the duplicate sidebar setup panel so the same settings are no longer editable in two different places.
- Kept read-only round information such as win condition, current turn, and move count visible as non-interactive chips.
- Made the full interactive chip surface clickable so the control opens from the whole chip instead of a smaller inner target.
- Replaced the custom floating dropdown behavior with native select-based controls to keep dropdown positioning reliable across desktop and mobile browsers.
- Added stronger chip hover, focus, active, spacing, and rounded-container styling so the status controls match the rest of the site more closely.
- Preserved existing match logic, invite restrictions, CPU behavior, and board reset behavior when settings change.

## Notes

- This was intentionally kept as a UX/runtime refinement rather than a new phase-level feature.
- Native select menus improve placement reliability, but the opened menu appearance still depends partly on the browser and operating system.
- There is no separate repository-level `CHANGELOG.md` at the moment, so this `specs/done` entry is the managed record of the change.

## Follow-Ups

- If a future refinement needs fully custom-styled open menus, it should be weighed against the responsiveness and positioning issues that native selects avoided here.
- Remove or repurpose any now-unused setup-only components in a later cleanup pass if the team wants to reduce dormant UI code.
