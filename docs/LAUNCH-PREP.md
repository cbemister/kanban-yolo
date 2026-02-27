# Launch Prep

Phased checklist for everything needed before launch. Complete phases in order.
Detailed plans for each phase live in `docs/phases/phase-3*.md`.

## Phase Dependency Graph

```
Phase 3a (Critical Fixes)
    |
    +---> Phase 3b (Core Pages)
    |         |
    |         +---> Phase 3c (UX + Errors)
    |                   |
    +-------------------+---> Phase 3d (Admin)
                                  |
                                  +---> Phase 3e (Delighters + Polish)
```

Phases 3b and 3d can overlap -- 3b is frontend-heavy, 3d is backend-heavy.

---

## Phase 3a: Critical Fixes

Must complete before any real user traffic. See `docs/phases/phase-3a-critical-fixes.md`.

- [ ] Wire `checkBoardLimit` into `POST /api/boards`
- [ ] Wire `checkMemberLimit` into `POST /api/boards/[boardId]/invitations`
- [ ] Render UpgradePrompt on 403 limit errors
- [ ] Complete `.env.example` with all required variables
- [ ] Replace `noreply@yourdomain.com` email sender placeholder
- [ ] Schema migration: password reset + admin fields on User
- [ ] Build password reset flow (2 pages, 2 API routes, email template)
- [ ] Add forgot password link to login page
- [ ] Fix notification settings stub (replace fake badges with honest copy)
- [ ] Build AppHeader + UserMenu for settings navigation

---

## Phase 3b: Core Pages

Public-facing and auth-completion pages. See `docs/phases/phase-3b-core-pages.md`.

- [ ] Build full marketing landing page at `/`
- [ ] Build settings layout with sidebar nav
- [ ] Add Google OAuth buttons to login and signup pages
- [ ] Create Terms of Service and Privacy Policy pages
- [ ] Add ToS/Privacy links to signup page
- [ ] Add invitation context (board name, inviter, role) to accept page
- [ ] Add yearly billing toggle to pricing page
- [ ] Make pricing page auth-aware (hide upgrade CTA for Pro users)

---

## Phase 3c: User Experience

Profile, error handling, and polish. See `docs/phases/phase-3c-user-experience.md`.

- [ ] Build user profile page + expand `/api/users/me`
- [ ] Add error boundary (`error.tsx`)
- [ ] Add 404 page (`not-found.tsx`)
- [ ] Add board loading skeleton (Suspense fallback)
- [ ] Expand middleware matcher for settings and admin routes
- [ ] Fix form label accessibility (htmlFor/id pairs)
- [ ] Improve empty state on boards page
- [ ] Add favicon and OG metadata
- [ ] Make seed file idempotent

---

## Phase 3d: Admin Foundation

Admin dashboard and user management. See `docs/phases/phase-3d-admin.md`.

- [ ] Create `requireAdmin()` auth guard helper
- [ ] Build admin layout with auth check and sidebar nav
- [ ] Build stats API endpoint
- [ ] Build admin dashboard page (stat cards + recent activity)
- [ ] Build users list API (paginated, searchable)
- [ ] Build admin users list page
- [ ] Build user detail API (GET, PATCH, DELETE)
- [ ] Build user detail page with ban/unban
- [ ] Build plan override API
- [ ] Build admin boards list (API + page)
- [ ] Build admin subscriptions page
- [ ] Update seed: set demo user as admin

---

## Phase 3e: Delighters and Polish

Attractive features and infrastructure. See `docs/phases/phase-3e-delighters.md`.

- [ ] Board templates (Sprint Board, Product Roadmap, Bug Tracker)
- [ ] Card archive (non-destructive hide + restore)
- [ ] Public board sharing (read-only link)
- [ ] VIEWER role UI enforcement
- [ ] BoardCard metadata expansion (card count, member count)
- [ ] CI/CD pipeline (GitHub Actions)
- [ ] Expand E2E test coverage
- [ ] Unit tests for hooks and utilities
