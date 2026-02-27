# Phase 1 -- Collaboration

**Commit:** 475c5d5
**Date:** 2026-02-26
**Status:** Complete

## Goal

Enable multi-user collaboration: board sharing with role-based permissions, real-time sync, labels, assignees, due dates, search, and filtering.

## What Was Built

- New Prisma models: Label, CardLabel, CardAssignee, BoardMember, Invitation
- Migration: `20260226191218_phase1_collaboration`
- Role-based permissions: OWNER / EDITOR / VIEWER enforced via `checkBoardPermission()`
- Board invitation system: email-based invites with 7-day expiry tokens, accept/decline flow
- Pusher real-time: server instance, client singleton, `broadcastToBoard()` on all mutations, `useBoardChannel()` hook that invalidates React Query on events
- Resend email integration for invitation notifications
- Labels: board-scoped labels with color, CRUD API, LabelChip and LabelPicker components
- Assignees: card assignment from board members, AssigneePicker component
- Due dates: DueDatePicker (react-day-picker), DueDateBadge with color-coded status
- Search: API endpoint with query/label/assignee/date filters, SearchBar with debounce, SearchResults dropdown
- FilterBar: label multi-select, assignee dropdown, due-date filter, active filter count badge
- ShareModal: InviteForm + MemberList + pending invitations management
- PresenceIndicator: stacked avatars showing online board members via Pusher presence channel
- BoardToolbar: header bar consolidating search, filters, presence, share, and navigation
- Invitation accept/decline page
- Extended E2E tests for auth and board flows

## Dependencies

- Requires Phase 0: auth system, permissions framework, board/column/card API and data layer
- Pusher requires env vars (PUSHER_APP_ID, NEXT_PUBLIC_PUSHER_KEY, PUSHER_SECRET, NEXT_PUBLIC_PUSHER_CLUSTER) configured before real-time works
- Resend requires RESEND_API_KEY for invitation emails

## Parallel Development Opportunities

- Labels API + components fully independent of Assignees API + components
- Pusher server config independent of Pusher client hook
- SearchBar/SearchResults UI independent of search API route
- DueDatePicker and DueDateBadge independent of API integration
- InviteForm/MemberList independent of invitation accept/decline page
- FilterBar independent of SearchBar (different filtering mechanisms)

## Key Decisions

- Board owner is NOT in the BoardMember table; `checkBoardPermission` handles owner separately by checking `Board.userId === userId`
- Invitation tokens are cuid-generated, used directly in accept/decline URLs (no separate lookup table)
- `broadcastToBoard` is fire-and-forget: real-time failure never fails the API request
- Client-side filtering via `applyFilters()` pure function -- no server round-trip for filter changes
- Invitation emails sent via Resend rather than building a custom SMTP integration

## Known Issues

- `email.ts` has hardcoded `noreply@yourdomain.com` placeholder sender address
- `.env.example` does not list Pusher, Resend, or `NEXT_PUBLIC_APP_URL` variables
- `checkBoardLimit` and `checkMemberLimit` are defined in `plan-limits.ts` but not yet called in any route
