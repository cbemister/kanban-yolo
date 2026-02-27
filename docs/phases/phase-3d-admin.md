# Phase 3d -- Admin Foundation

**Status:** Not started
**Priority:** Pre-launch requirement
**Depends on:** Phase 3a (isAdmin field from migration), Phase 3c (middleware covers /admin/*)

## Goal

Build the admin dashboard for managing users, monitoring subscriptions, and operating the app. This is the minimum viable admin tooling for a solo operator.

## Schema Changes

Added in Phase 3a migration:
- `User.isAdmin Boolean @default(false)`
- `User.bannedAt DateTime?`

No additional schema changes needed for this phase.

## Items

### 1. Admin auth guard helper
Create a `requireAdmin()` function matching the pattern of existing `checkBoardPermission()`.
- New: `src/lib/admin-helpers.ts`
- Pattern: check session via `getAuthenticatedUserId()`, then query `user.isAdmin`, return 403 if not admin
- Reuse: `getAuthenticatedUserId()` from `src/lib/auth-helpers.ts`, response helpers

### 2. Admin layout with auth check and sidebar
Server component that guards all `/admin/*` pages and provides navigation.
- New: `src/app/admin/layout.tsx`
- Auth check: if no session or not admin, redirect to `/boards`
- Sidebar nav: Dashboard, Users, Boards, Subscriptions
- Content slot for child pages

### 3. Stats API endpoint
Aggregate counts for the dashboard. Read-only, no PII in response.
- New: `src/app/api/admin/stats/route.ts`
- Returns: `{ totalUsers, proSubscribers, totalBoards, monthlyRecurringRevenue, recentSignups }`
- Queries: `prisma.user.count()`, `prisma.subscription.count({ where: { plan: "pro" } })`, `prisma.board.count()`
- MRR: count active pro subscriptions and multiply by price (or sum from Stripe data)

### 4. Admin dashboard page
Stat cards and recent activity overview.
- New: `src/app/admin/dashboard/page.tsx`
- Display: stat cards (Total Users, Pro Subscribers, Total Boards, MRR), recent signups table (last 10), recent activity log (last 20 entries across all boards)
- Reuse: `ActivityItem` component pattern for activity display

### 5. Users list API (paginated with search)
Paginated user listing with search by name/email and filter by plan.
- New: `src/app/api/admin/users/route.ts`
- Params: `page`, `limit`, `search`, `plan` (all/free/pro)
- Returns: `{ users, total, page, totalPages }`
- Join: `Subscription` to determine plan, count boards per user

### 6. Users list page
Searchable, filterable user table.
- New: `src/app/admin/users/page.tsx`
- Display: table with name, email, plan, board count, joined date, banned status
- Actions: link to user detail, quick ban/unban

### 7. User detail API
Full user detail with related data.
- New: `src/app/api/admin/users/[userId]/route.ts`
- GET: return user profile + subscription + boards (with card/member counts) + recent activity
- PATCH: update name, email, isAdmin, bannedAt
- DELETE: hard delete with cascade (all boards, cards, members, etc.)

### 8. User detail page with ban/unban
Comprehensive user management view.
- New: `src/app/admin/users/[userId]/page.tsx`
- Sections: profile info, subscription status, boards list, ban/unban controls
- Ban: sets `bannedAt` timestamp, user's sessions remain valid until expiry (JWT) but API calls should check `bannedAt`
- Reuse: `ConfirmDialog` for destructive actions (delete, ban)

### 9. Plan override API
Allow admin to manually set a user's plan without going through Stripe. For customer support situations.
- New: `src/app/api/admin/subscriptions/[userId]/route.ts`
- PATCH: accepts `{ plan: "free" | "pro" }`, upserts Subscription record
- Note: this bypasses Stripe -- use only for overrides, not normal billing

### 10. Boards list API and page
All boards across all users for admin visibility.
- New API: `src/app/api/admin/boards/route.ts` (paginated, searchable, with owner info)
- New page: `src/app/admin/boards/page.tsx`
- Display: board title, owner name/email, member count, card count, created date
- Action: delete any board (with confirmation)

### 11. Subscriptions page
View and manage all subscriptions.
- New: `src/app/admin/subscriptions/page.tsx`
- Display: table with user, plan, status, Stripe customer ID, current period end
- Action: plan override link to user detail
- Reuse: data from users API (subscription is joined)

### 12. Update seed: set demo user as admin
For local development and testing.
- File: `prisma/seed.ts`
- Add: `isAdmin: true` to the demo user upsert

## First Admin User (Production)

No UI exists to promote the first admin. Use a one-time database command:
```sql
UPDATE "User" SET "isAdmin" = true WHERE email = 'your@email.com';
```

## Dependencies

- Phase 3a: `isAdmin` and `bannedAt` fields must exist in schema (migration 3a.6)
- Phase 3c: middleware must include `/admin/:path*` (item 3c.5)
- Items 1-2 (guard + layout) must be built before any pages
- Items 7-8 (user detail) depend on items 5-6 (user list) for navigation
- Items 3-4 (stats dashboard) are independent of items 5-11

## Parallel Development Opportunities

- Once items 1-2 are built, all page work can proceed in parallel:
  - Stream A: items 3-4 (stats dashboard)
  - Stream B: items 5-6 (user list) then 7-8 (user detail)
  - Stream C: items 10-11 (boards + subscriptions pages)
  - Item 9 (plan override API) is standalone
- Item 12 (seed update) can be done anytime
- Maximum parallelism after guard/layout: 3 independent streams + 1 standalone API

## What to Defer Post-Launch

- Detailed activity log viewer (per-user, per-board drill-down)
- Impersonation / login-as-user capability
- Email blast to all users
- Export user data (GDPR data portability)
- Admin audit log (track admin actions separately)
