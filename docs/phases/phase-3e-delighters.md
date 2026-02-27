# Phase 3e -- Delighters and Polish

**Status:** Not started
**Priority:** Post-core-launch but pre-public-marketing
**Depends on:** All prior phases should be stable

## Goal

Add the "attractive" Kano features that create user excitement, fix the VIEWER role enforcement gap, expand test coverage, and set up CI/CD.

## Items

### 1. Board templates
Pre-built board layouts users can start from when creating a new board.
- Schema option A: `Template` model with `name`, `columns Json` (stored as column name arrays)
- Schema option B: JSON seed data file with template definitions (no schema change)
- UI: template picker in the board creation flow on `/boards` page
- Templates to include: "Blank Board" (current default), "Sprint Board" (Backlog, To Do, In Progress, Review, Done), "Product Roadmap" (Now, Next, Later, Done), "Bug Tracker" (New, Triaging, In Progress, Testing, Resolved)
- Reuse: existing board creation API (create board, then create columns from template)

### 2. Card archive
Non-destructive card hiding instead of permanent delete. Cards can be recovered.
- Schema: add `Card.archivedAt DateTime?` field (new migration)
- API changes:
  - `PATCH /api/cards/[cardId]` -- accept `archived: true/false` to set/clear `archivedAt`
  - `GET /api/boards/[boardId]` -- exclude archived cards by default
  - New: `GET /api/boards/[boardId]/archived-cards` -- list archived cards
  - New: `POST /api/cards/[cardId]/restore` -- clear `archivedAt`
- UI: "Archive" button in `CardDetailModal` (replaces or supplements delete), "Show archived" toggle in board toolbar or filter bar, archived cards list with restore action
- Reuse: existing card PATCH pattern, `broadcastToBoard` for real-time sync

### 3. Public board sharing
Generate a read-only link to share a board without requiring login.
- Schema: add `Board.publicToken String? @unique` field (new migration)
- API:
  - `POST /api/boards/[boardId]/public-link` (OWNER only) -- generate/regenerate token
  - `DELETE /api/boards/[boardId]/public-link` (OWNER only) -- revoke public access
  - `GET /api/public/boards/[token]` -- unauthenticated, returns board data read-only
- New page: `src/app/public/[token]/page.tsx` -- read-only board view (no DnD, no edit controls, no auth required)
- UI: "Copy public link" button in ShareModal (OWNER only), toggle to enable/disable
- Reuse: Board component with `readOnly` prop, existing board data fetching

### 4. VIEWER role UI enforcement
The board UI currently ignores the VIEWER role -- `currentUserRole` falls through to "EDITOR" for non-owners. VIEWERs see edit controls they cannot use (server returns 403).
- File: `src/components/Board.tsx` -- fix role computation to check BoardMember data
- Pattern: derive `canEdit` boolean from role, pass down through Board -> Column -> Card
- Hide when `!canEdit`: add card buttons, delete buttons, rename controls, DnD handles
- Reuse: `BoardMember` data already fetched by `useMembers(boardId)`

### 5. BoardCard metadata expansion
The board list cards only show column count. Add card count, member count, and last activity.
- Update API: `GET /api/boards` response to include `_count: { cards, members }` and `lastActivityAt`
- Update component: `src/components/BoardCard.tsx` to display the counts
- Reuse: Prisma `_count` aggregation

### 6. CI/CD pipeline
No GitHub Actions workflow exists. Set up basic CI.
- New: `.github/workflows/ci.yml`
- Jobs: `lint` (npm run lint), `test` (npm test), `build` (npm run build)
- Trigger: on pull request to main and development branches
- Optional: add Playwright E2E as a separate workflow (requires database)

### 7. Expand E2E test coverage
Current Playwright tests cover auth, board CRUD, and basic card operations only.
- New test files in `frontend/e2e/`:
  - `labels.spec.ts` -- create, assign, remove labels
  - `invitations.spec.ts` -- invite, accept, decline flow
  - `search-filter.spec.ts` -- search, filter bar, saved filters
  - `keyboard.spec.ts` -- hotkeys (n, /, Cmd+K, ?)
  - `comments.spec.ts` -- add, edit, delete comments on cards
- Reuse: existing `e2e/helpers.ts` (login, openDemoBoard)

### 8. Unit tests for hooks and utilities
No tests exist for core hooks and utility functions that are pure or near-pure.
- New test files in `frontend/__tests__/`:
  - `useHotkeys.test.tsx` -- key binding, modifier keys, input field skipping
  - `useUndoRedo.test.tsx` -- push/undo/redo/stack limit
  - `planLimits.test.ts` -- board limit, member limit, attachment gating
  - `applyFilters.test.ts` -- label, assignee, due-date filter logic
- Reuse: existing Jest config and mock patterns from `__tests__/Board.test.tsx`

## Dependencies

- All prior phases should be stable before starting delighter features
- Items 1-3 each require a schema migration (can be combined into one)
- Item 4 (VIEWER role) requires `useMembers` data to be available in Board component
- Items 6-8 (CI/tests) are independent of feature work

## Parallel Development Opportunities

- Items 1, 2, 3 are completely independent features -- can be built in any order or simultaneously
- Item 4 (VIEWER role) is independent of items 1-3
- Item 5 (BoardCard metadata) is a small standalone change
- Items 6-8 (CI/tests) are infrastructure work, fully parallel with feature development
- Maximum parallelism: 5+ independent work streams
- Recommended grouping if working sequentially: (1+2) schema features, then (3) public sharing, then (4+5) role + metadata fixes, with (6-8) CI/tests woven in between
