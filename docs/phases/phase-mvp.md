# Phase MVP -- Client-Side Prototype

**Commit:** 3b0b4b5
**Date:** 2026-02-26
**Status:** Complete

## Goal

Build a pure client-side Kanban board to prove the UI/UX concept and establish the component architecture. No backend, no auth, no persistence.

## What Was Built

- Next.js 15 project scaffold with TypeScript and Tailwind CSS v4
- @dnd-kit drag-and-drop: cross-column card moves and within-column reorder
- 5 fixed columns (renameable via inline edit)
- Add card modal with title and details fields
- Card detail modal for viewing/editing
- Delete card with confirmation dialog
- Hardcoded dummy data in `src/data/` for development
- Jest + React Testing Library unit tests for Board component
- Playwright E2E test covering columns, cards, and basic interactions

## Dependencies

None. This is the root of the dependency graph.

## Parallel Development Opportunities

- Unit tests could be written alongside components (no blocking dependency)
- Tailwind config and color scheme could be finalized in parallel with component scaffold
- E2E test setup (Playwright config) independent of component development

## Key Decisions

- `frontend/` subdirectory to keep application code separate from repo-level docs and config
- @dnd-kit chosen over react-beautiful-dnd (actively maintained, supports React 18+)
- Dummy data isolated in `src/data/` rather than hardcoded in components, making replacement with real data straightforward
- Modal-based card creation and detail view rather than inline editing
- ConfirmDialog as a reusable component from the start

## Known Issues

- No persistence -- all data resets on page refresh (intentionally deferred)
