# Phase 2 -- Depth and Polish

**Commit:** ba6db17
**Date:** 2026-02-26
**Status:** Complete

## Goal

Add deep features for a production-ready experience: comments, activity tracking, file attachments, notifications, saved filters, billing, dark mode, and keyboard-driven UX.

## What Was Built

- New Prisma models: Comment, Activity, Attachment, Notification, SavedFilter, Subscription
- Migration: `20260226202635_phase2_depth_and_polish`
- **Comments**: CommentList, CommentInput components, full CRUD API for card comments
- **Activity feed**: `logActivity()` utility, cursor-paginated API endpoint, ActivitySidebar with infinite scroll, ActivityItem component
- **File attachments**: S3 presigned upload URLs, FileUpload component (direct browser-to-S3), AttachmentList with download/delete
- **Notifications**: Inngest background jobs for assignment and due-date reminders, NotificationBell with unread count badge (60s polling), NotificationDropdown with mark-read actions
- **Saved filters**: SavedFilter model, save/load in FilterBar, per-user per-board filter presets
- **Stripe billing**: Subscription model, checkout session creation, customer portal, webhook handler for subscription lifecycle events
- **Plan limits**: `checkBoardLimit()` and `checkMemberLimit()` utilities, UpgradePrompt component, `/pricing` page with plan comparison
- **Dark mode**: ThemeProvider (next-themes), ThemeToggle cycling light/dark/system, `User.theme` persisted via API
- **Keyboard shortcuts**: `useHotkeys` hook (n=new card, /=search, Cmd+K=palette, Ctrl+Z/Shift+Z=undo/redo, ?=help), ShortcutsHelp modal
- **Command palette**: cmdk-based CommandPalette (Cmd+K) for searching boards/cards and quick actions
- **Undo/redo**: `useUndoRedo` hook with action history stack (max 50 entries)
- **User settings**: profile update API, notification preferences page, billing settings page
- **Dev login bypass**: `POST /api/auth/dev-login` for testing (disabled in production)

## Dependencies

- Requires Phase 1: all collaboration models, permissions, Pusher real-time infrastructure
- Stripe billing requires Subscription model and env vars (STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, price IDs)
- S3 attachments require AWS credentials (S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY, S3_BUCKET)
- Inngest requires its SDK and hosting/local dev setup
- UpgradePrompt depends on plan limits being wired into routes to have any effect

## Parallel Development Opportunities

- Comments system entirely independent of Activity feed
- Attachments (S3) independent of Comments and Activity
- Notifications (Inngest) independent of all other Phase 2 features
- Saved filters independent of billing
- Dark mode / theming independent of all feature work
- Keyboard shortcuts / command palette independent of data features
- Undo/redo independent of billing and notifications
- Stripe billing integration independent of all non-billing features

## Key Decisions

- Inngest for background jobs over simple cron: provides retry logic, local dev tooling, and observability without infrastructure
- S3 presigned URLs: client uploads directly to S3, backend only records metadata -- avoids proxying large files through Next.js
- Subscription model is one-to-one with User (not Board) -- billing is per-user
- Activity logging is fire-and-forget (failure does not block the API response)
- Cursor-based pagination for activity feed to handle large boards efficiently
- `useUndoRedo` uses execute/undo callback pairs with a max stack of 50

## Known Issues (Carried to Launch Prep)

- `checkBoardLimit` never called in `POST /api/boards` -- free-tier board limits unenforced
- `checkMemberLimit` never called in `POST /api/boards/[boardId]/invitations` -- member limits unenforced
- UpgradePrompt component exists but is never rendered anywhere
- `.env.example` still missing S3 variables and others from Phase 1
- No `error.tsx` error boundaries at any route level
- `<Suspense>` on board page has no fallback (blank during load)
- `/settings/*` pages not protected by middleware (shows broken state for unauthenticated users)
- No favicon, OG image, or Apple touch icon
- Yearly pricing configured in env but pricing page only shows monthly
