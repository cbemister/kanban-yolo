# Phase 3c -- User Experience

**Status:** Not started
**Priority:** Should fix before launch
**Depends on:** Phase 3b (SettingsLayout must exist for profile page)

## Goal

Fill in the user management and error handling gaps: profile page, error boundaries, loading states, accessibility fixes, and a polished empty state.

## Items

### 1. User profile page + API expansion
Users currently cannot change their name, email, or password. The `/api/users/me` endpoint only supports PATCH for the `theme` field.
- New page: `src/app/settings/profile/page.tsx`
- Update API: `src/app/api/users/me/route.ts`
  - Add `GET` handler returning `{ id, name, email, image, theme, hasPassword }`
  - Expand `PATCH` schema to accept `name`, `email`, `currentPassword`, `newPassword`
- Page sections: profile form (name, email), change password form (only for Credentials users, not Google OAuth), danger zone (delete account with confirmation)
- Reuse: `SettingsLayout` from Phase 3b, `ConfirmDialog` for delete account

### 2. Error boundary
Unhandled rendering errors currently show a blank white page.
- New: `src/app/error.tsx` (`"use client"` component with `error` and `reset` props)
- Display: minimal error message, "Try again" button calling `reset()`, link to `/boards`

### 3. 404 page
Unknown routes show Next.js default blank page.
- New: `src/app/not-found.tsx`
- Display: "404" heading, "Page not found" message, link to `/boards`
- Style: consistent with auth pages (navy background, centered card)

### 4. Board loading skeleton
The board page has `<Suspense>` with no fallback -- shows blank during initial load.
- New: `src/components/BoardSkeleton.tsx` (grey column placeholders matching board layout)
- Update: `src/app/boards/[boardId]/page.tsx` (pass skeleton as Suspense fallback)

### 5. Expand middleware matcher
Settings pages and several API routes are not in the middleware matcher. Unauthenticated users hitting `/settings/billing` see a broken page instead of redirecting to login.
- File: `src/middleware.ts`
- Add to matcher: `/settings/:path*`, `/admin/:path*`, `/api/admin/:path*`, `/api/users/:path*`, `/api/billing/:path*`, `/api/saved-filters/:path*`

### 6. Fix form label accessibility
Login and signup pages have `<label>` elements without `htmlFor` attributes and `<input>` elements without `id` attributes. Screen readers cannot associate them.
- Files: `src/app/login/page.tsx`, `src/app/signup/page.tsx`
- Fix: add matching `id`/`htmlFor` pairs (e.g., `id="email"` + `htmlFor="email"`)

### 7. Improved empty state on boards page
When no boards exist, the current empty state is minimal. Add a more helpful first-time experience.
- File: `src/app/boards/page.tsx`
- Show: brief description of what the app does, prominent "Create your first board" CTA
- Note: avoid a full onboarding tour (Kano reverse -- power users find them patronizing)

### 8. Favicon and OG metadata
No `public/` directory exists. No favicon, OG image, or Apple touch icon.
- New: `public/favicon.ico`, `public/apple-touch-icon.png`
- Update: `src/app/layout.tsx` metadata -- add `openGraph` fields (title, description, URL), update generic "Kanban Board" title to actual product name

### 9. Make seed idempotent
`prisma/seed.ts` uses `create()` for the board -- re-running creates duplicate Demo Boards.
- File: `prisma/seed.ts`
- Fix: check if a board with `title: "Demo Board"` exists for the user before creating

## Dependencies

- Phase 3b: SettingsLayout must exist before the profile page (item 1) integrates
- Item 5 (middleware) should include `/admin/:path*` for Phase 3d readiness
- All other items are independent of each other

## Parallel Development Opportunities

- Items 2-3 (error/404 pages) are ~15 minutes each, can be done anytime
- Items 5-6 (middleware + accessibility) are tiny config fixes, can be done anytime
- Item 1 (profile page) is the largest item, requires API changes
- Items 4, 7, 8 are independent UI work with no API dependencies
- Item 9 is standalone seed fix
- Maximum parallelism: 5 independent work streams (profile, error pages, config fixes, UI polish, seed)
