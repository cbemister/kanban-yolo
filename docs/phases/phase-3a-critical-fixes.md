# Phase 3a -- Critical Fixes

**Status:** Not started
**Priority:** Must complete before any real user traffic

## Goal

Fix the blockers that would cause immediate user-facing failures: unenforced billing limits, broken email sender, missing password recovery, orphaned settings pages, and incomplete environment configuration.

## Items

### 1. Wire plan limits into board creation
`POST /api/boards` must call `checkBoardLimit(userId)` from `lib/plan-limits.ts` after authentication. Return 403 with `{ error: "Board limit reached", upgradeRequired: true }` when limit hit.
- File: `src/app/api/boards/route.ts`
- Reuse: `checkBoardLimit` from `src/lib/plan-limits.ts`

### 2. Wire plan limits into invitations
`POST /api/boards/[boardId]/invitations` must call `checkMemberLimit(boardId, userId)` before creating the invitation. Same 403 pattern.
- File: `src/app/api/boards/[boardId]/invitations/route.ts`
- Reuse: `checkMemberLimit` from `src/lib/plan-limits.ts`

### 3. Render UpgradePrompt on limit errors
Catch 403 `upgradeRequired` responses and display the existing `UpgradePrompt` component.
- Files: `src/app/boards/page.tsx` (board creation), `src/components/ShareModal.tsx` (invitation)
- Reuse: `src/components/UpgradePrompt.tsx` (exists but is never imported)

### 4. Complete .env.example
Add all missing variables: `PUSHER_APP_ID`, `PUSHER_SECRET`, `NEXT_PUBLIC_PUSHER_KEY`, `NEXT_PUBLIC_PUSHER_CLUSTER`, `RESEND_API_KEY`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, `S3_BUCKET`, `S3_REGION`, `NEXT_PUBLIC_APP_URL`.
- File: `frontend/.env.example`
- Reference: `.claude/rules/env.md` for the full variable list

### 5. Replace email sender placeholder
Replace `noreply@yourdomain.com` with a verified Resend sender domain. Requires Resend domain verification before deployment.
- File: `src/lib/email.ts` (line 19)

### 6. Schema migration: add password reset and admin fields
Add to User model: `passwordResetToken String? @unique`, `passwordResetExpiry DateTime?`, `isAdmin Boolean @default(false)`, `bannedAt DateTime?`.
- File: `prisma/schema.prisma`
- Migration name: `add_admin_and_reset_fields`

### 7. Password reset flow
Build the full forgot/reset password flow: two pages, two API routes, one email template.
- New pages: `src/app/forgot-password/page.tsx`, `src/app/reset-password/[token]/page.tsx`
- New API routes: `src/app/api/auth/forgot-password/route.ts`, `src/app/api/auth/reset-password/route.ts`
- Update: `src/lib/email.ts` (add `sendPasswordResetEmail()`)
- Reuse: existing Resend integration in `lib/email.ts`, existing auth page styling

### 8. Add forgot password link to login page
Add a "Forgot password?" link below the sign-in button pointing to `/forgot-password`.
- File: `src/app/login/page.tsx`

### 9. Fix notification settings stub
Replace the fake "Enabled" badges with honest copy: "All notifications are currently enabled. Customization coming soon." Remove the misleading toggle-like UI.
- File: `src/app/settings/notifications/page.tsx`

### 10. Add settings navigation
Build `AppHeader` and `UserMenu` components. Replace the bare "Sign out" button on the boards page with a user dropdown containing Profile, Billing, Notifications links and sign out.
- New: `src/components/AppHeader.tsx`, `src/components/UserMenu.tsx`
- Update: `src/app/boards/page.tsx` (replace inline header)
- Reuse: existing `NotificationBell`, `ThemeToggle` components (currently only in BoardToolbar)

## Dependencies

- Item 6 (migration) must complete before item 7 (password reset needs the schema fields)
- All other items are independent of each other

## Parallel Development Opportunities

- Items 1-3 (plan limits + UpgradePrompt) are one unit, no external dependencies
- Items 4-5 (env config + email sender) are 20-minute tasks, can be done anytime
- Item 7 (password reset) is fully independent once the migration runs
- Item 10 (navigation components) is independent of all API work
- Item 9 is a single-file, 5-minute fix
- Maximum parallelism: 4 independent work streams (limits, config, password reset, navigation)
