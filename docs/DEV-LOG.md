# Dev Log

Running session journal. Add new entries at the top.
Each entry: date, what was worked on, decisions made, what is next.

---

## 2026-02-26 -- Session 3: Comprehensive Launch Planning

### Worked on
- Full audit of every page in the app (9 pages, all line counts and gap analysis)
- Identified 13 missing pages and navigation architecture gaps
- Designed admin dashboard plan (schema changes, auth guard, 6 API routes, 5 pages)
- Completed Kano model analysis (14 Must-Be, 9 Performance, 6 Attractive, 5 Reverse)
- Expanded LAUNCH-PREP from 18 items to 47 items across 5 phases
- Created phase planning docs: 3a (critical fixes), 3b (core pages), 3c (UX), 3d (admin), 3e (delighters)
- Created `docs/kano-analysis.md`

### Decisions
- Admin dashboard is a pre-launch requirement (not post-launch)
- Landing page will be full marketing page (hero, features, pricing teaser, footer)
- Board templates, card archive, and public board sharing selected as delighter features
- Use `isAdmin Boolean` on User, not a UserRole enum (simpler, avoids Prisma enum migration pain)
- `bannedAt DateTime?` for account suspension (preserves timestamp, avoids status enum)
- Password reset is a Must-Be blocker (users get permanently locked out without it)
- Notification settings stub should be fixed with honest copy first, real toggles later
- Avoid reverse-Kano features: aggressive upgrade modals, mandatory email verification, onboarding tours

### Next
- Begin Phase 3a implementation: plan limits, password reset, navigation, env fixes
- Phase 3a has 4 parallel work streams: limits, config, password reset, navigation

---

## 2026-02-26 -- Session 2: Planning and Review

### Worked on
- Created retroactive planning documentation for all 4 development phases
- Audited codebase for launch readiness
- Identified 5 blockers, 6 should-fix items, and 7 polish items
- Created CHANGELOG, DEV-LOG, and LAUNCH-PREP tracking documents
- Set up Claude memory for cross-session context

### Decisions
- Planning docs live in `docs/` at repo root, separate from `frontend/` app code
- Phase documents follow a fixed template: goal, what was built, dependencies, parallel opportunities, key decisions, known issues
- Launch prep uses three-tier priority: Blockers > Should Fix > Polish
- DEV-LOG uses append-at-top ordering so most recent session is always visible

### Next
- Work through LAUNCH-PREP blockers in priority order
- Wire plan limits into API routes (most critical)
- Fix .env.example and email placeholder
- Consider CI/CD setup

---

## 2026-02-26 -- Session 1: Initial Build

### Worked on
- Built entire application from client-side MVP through Phase 2 in a single session
- Phase MVP: component architecture, @dnd-kit drag-and-drop, dummy data
- Phase 0: Prisma + Neon database, NextAuth v5 auth, full CRUD API, React Query
- Phase 1: collaboration (roles, invitations, Pusher real-time, labels, assignees, due dates, search, filters)
- Phase 2: comments, activity feed, S3 attachments, Inngest notifications, Stripe billing, dark mode, keyboard shortcuts, command palette, undo/redo
- Migrated Claude reference docs from `frontend/CLAUDE-*.md` to `.claude/rules/`

### Decisions
- JWT sessions over database sessions for edge compatibility
- Board owner stored in `Board.userId`, not in BoardMember table
- `broadcastToBoard` is fire-and-forget (real-time failure never blocks API)
- Inngest for background jobs over simple cron (retry logic, local dev tooling)
- S3 presigned URLs for direct browser upload (avoids proxying through Next.js)
- Subscription is per-user, not per-board
- Plan limits defined but left unwired during rapid build -- easier to connect once full flow is visible

### Next
- Wire `checkBoardLimit` and `checkMemberLimit` into API routes
- Replace email sender placeholder `noreply@yourdomain.com`
- Complete `.env.example` with all required variables
- Add error boundaries and loading states
