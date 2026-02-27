# Phase 0 -- Full-Stack Foundation

**Commit:** 6bb64de
**Date:** 2026-02-26
**Status:** Complete

## Goal

Replace dummy data with a real database. Add user authentication. Make all board, column, and card operations persist across sessions.

## What Was Built

- Prisma 6 schema with User, Board, Column, Card models (+ NextAuth adapter models)
- First migration: `20260226182913_init`
- Neon PostgreSQL database connection
- NextAuth v5 with JWT sessions, Credentials provider, Google OAuth config
- Middleware auth guard protecting `/boards/:path*` and core API routes
- Full CRUD API routes for boards, columns (with batch reorder), and cards (with reorder + cross-column move)
- React Query v5 data layer: `useBoard` and `useBoards` hooks with mutation helpers
- Login page with email/password and Google OAuth button
- Signup page with name, email, password registration
- Board list page (`/boards`) with create board and board cards
- Seed file creating `demo@kanban.dev / password123` with a Demo Board and sample cards
- Centralized auth helpers: `getAuthenticatedUserId()`, `checkBoardPermission()`

## Dependencies

- Requires Phase MVP: Board, Column, Card, AddCardModal, CardDetailModal, ConfirmDialog components

## Parallel Development Opportunities

- Database schema design could run in parallel with NextAuth configuration
- API route implementation independent of React Query hooks (hooks only need route contracts)
- Login/signup UI pages could be built in parallel with auth API endpoints
- Seed file development independent of all other work

## Key Decisions

- JWT sessions instead of database sessions -- simpler, edge-compatible for middleware
- `checkBoardPermission()` centralized in `lib/permissions.ts` from day one, even though only single-user at this point (designed for multi-user from the start)
- Board creator stored as `Board.userId` rather than as a BoardMember row -- avoids needing to seed a special OWNER member record
- Prisma singleton pattern with `globalThis` caching for HMR compatibility
- Edge-compatible auth config (`auth-edge.ts`) separated from full auth config (`auth.ts`) to support middleware

## Known Issues

- Seed file uses `upsert` on User but `create` on Board -- not fully idempotent. Re-running creates duplicate Demo Boards.
