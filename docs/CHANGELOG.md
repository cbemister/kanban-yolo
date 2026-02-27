# Changelog

All notable changes to the Kanban YOLO project, organized by development phase.

---

## 2026-02-26 -- Planning: Launch Roadmap

Comprehensive audit of all pages, features, and launch readiness. Identified 13
missing pages, broken navigation (orphaned settings pages), no password reset,
no admin concept, VIEWER role ignored in UI, and notification settings stub.
Created 5-phase launch roadmap (3a-3e), Kano model analysis, and expanded
LAUNCH-PREP with 47 tracked items across critical fixes, core pages, UX,
admin dashboard, and delighter features.

## 2026-02-26 -- Phase 2: Depth and Polish (ba6db17)

Comments, activity feed, S3 file attachments, in-app notifications via Inngest,
saved filters, Stripe billing with free/pro plan limits, dark mode with system
preference support, keyboard shortcuts (n, /, Cmd+K, Ctrl+Z, ?), command palette,
undo/redo, user settings pages, and dev login bypass for testing.

## 2026-02-26 -- Phase 1: Collaboration (475c5d5)

Multi-user boards with OWNER/EDITOR/VIEWER roles, board invitations by email
(Resend), Pusher real-time sync with presence indicators, labels with color
picker, card assignees from board members, due dates with color-coded badges,
search with multi-field filtering, filter bar with saved filter presets,
share modal, and invitation accept/decline page.

## 2026-02-26 -- Phase 0: Full-Stack Foundation (6bb64de)

Database persistence with Prisma 6 and Neon PostgreSQL. NextAuth v5
authentication with JWT sessions, Credentials and Google OAuth providers.
Full CRUD API for boards, columns, and cards with reorder and cross-column
move. React Query v5 data layer. Login and signup pages. Seed data with
demo account. Middleware auth guard.

## 2026-02-26 -- MVP: Client-Side Prototype (3b0b4b5)

Next.js 15 project scaffold with TypeScript and Tailwind CSS v4. @dnd-kit
drag-and-drop with cross-column moves and within-column reorder. 5-column
board, add/delete cards, card detail modal, confirm dialog. Jest unit tests
and Playwright E2E tests. No persistence.
