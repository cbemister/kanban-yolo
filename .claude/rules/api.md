# API Routes

All routes under `frontend/src/app/api/`. File path pattern: `src/app/api/<path>/route.ts`.
All authenticated routes use `checkBoardPermission` from `src/lib/permissions.ts`. Mutating routes call `broadcastToBoard` for real-time sync.

## Middleware

File: `src/middleware.ts`. Uses edge-compatible `auth` from `src/lib/auth-edge.ts`.

Protected route matchers (unauthenticated → redirect to `/login`; API calls → 401):
- `/boards/:path*`
- `/api/boards/:path*`
- `/api/columns/:path*`
- `/api/cards/:path*`

Not covered by middleware (routes handle their own auth): `/api/auth/*`, `/api/billing/*`, `/api/notifications/*`, `/api/invitations/*`, `/api/users/*`, `/api/pusher/*`, `/api/inngest`, `/api/comments/*`, `/api/attachments/*`, `/api/saved-filters/*`.

## Auth

| Method | Path | File | Description |
|--------|------|------|-------------|
| GET/POST | `/api/auth/[...nextauth]` | `src/app/api/auth/[...nextauth]/route.ts` | NextAuth handler |
| POST | `/api/auth/register` | `src/app/api/auth/register/route.ts` | Sign up (zod validation, bcrypt, creates default board) |
| POST | `/api/auth/dev-login` | `src/app/api/auth/dev-login/route.ts` | Dev-only login bypass (disabled in production) |

## Boards

| Method | Path | Permission | File | Description |
|--------|------|------------|------|-------------|
| GET | `/api/boards` | authenticated | `src/app/api/boards/route.ts` | List user's boards |
| POST | `/api/boards` | authenticated | `src/app/api/boards/route.ts` | Create board (5 default columns); enforces free plan limit via `checkBoardLimit` |
| GET | `/api/boards/[boardId]` | VIEWER | `src/app/api/boards/[boardId]/route.ts` | Full board with columns, cards, labels, assignees |
| PATCH | `/api/boards/[boardId]` | EDITOR | `src/app/api/boards/[boardId]/route.ts` | Rename board |
| DELETE | `/api/boards/[boardId]` | OWNER | `src/app/api/boards/[boardId]/route.ts` | Delete board |

## Columns

| Method | Path | Permission | File | Description |
|--------|------|------------|------|-------------|
| POST | `/api/columns` | EDITOR | `src/app/api/columns/route.ts` | Create column on board |
| PATCH | `/api/columns/[columnId]` | EDITOR | `src/app/api/columns/[columnId]/route.ts` | Rename / reposition |
| DELETE | `/api/columns/[columnId]` | EDITOR | `src/app/api/columns/[columnId]/route.ts` | Delete column |
| PUT | `/api/columns/reorder` | EDITOR | `src/app/api/columns/reorder/route.ts` | Batch reorder (position array) |

## Cards

| Method | Path | Permission | File | Description |
|--------|------|------------|------|-------------|
| POST | `/api/cards` | EDITOR | `src/app/api/cards/route.ts` | Create card in column |
| GET | `/api/cards/[cardId]` | VIEWER | `src/app/api/cards/[cardId]/route.ts` | Get card |
| PATCH | `/api/cards/[cardId]` | EDITOR | `src/app/api/cards/[cardId]/route.ts` | Update title / details / dueDate / columnId |
| DELETE | `/api/cards/[cardId]` | EDITOR | `src/app/api/cards/[cardId]/route.ts` | Delete card |
| PUT | `/api/cards/reorder` | EDITOR | `src/app/api/cards/reorder/route.ts` | Reorder within column |
| PUT | `/api/cards/move` | EDITOR | `src/app/api/cards/move/route.ts` | Move card to different column |

## Comments

| Method | Path | Permission | File | Description |
|--------|------|------------|------|-------------|
| GET | `/api/cards/[cardId]/comments` | VIEWER | `src/app/api/cards/[cardId]/comments/route.ts` | List card comments |
| POST | `/api/cards/[cardId]/comments` | EDITOR | `src/app/api/cards/[cardId]/comments/route.ts` | Add comment to card |
| PATCH | `/api/comments/[commentId]` | EDITOR (own) | `src/app/api/comments/[commentId]/route.ts` | Edit comment |
| DELETE | `/api/comments/[commentId]` | EDITOR (own) | `src/app/api/comments/[commentId]/route.ts` | Delete comment |

## Attachments

| Method | Path | Permission | File | Description |
|--------|------|------------|------|-------------|
| GET | `/api/cards/[cardId]/attachments` | VIEWER | `src/app/api/cards/[cardId]/attachments/route.ts` | List card attachments |
| POST | `/api/cards/[cardId]/attachments` | EDITOR | `src/app/api/cards/[cardId]/attachments/route.ts` | Record attachment metadata after S3 upload |
| POST | `/api/cards/[cardId]/attachments/upload-url` | EDITOR | `src/app/api/cards/[cardId]/attachments/upload-url/route.ts` | Generate presigned S3 upload URL |
| DELETE | `/api/attachments/[id]` | EDITOR | `src/app/api/attachments/[id]/route.ts` | Delete attachment (removes from S3 + DB) |

## Labels

| Method | Path | Permission | File | Description |
|--------|------|------------|------|-------------|
| GET | `/api/boards/[boardId]/labels` | VIEWER | `src/app/api/boards/[boardId]/labels/route.ts` | List board labels |
| POST | `/api/boards/[boardId]/labels` | EDITOR | `src/app/api/boards/[boardId]/labels/route.ts` | Create label |
| PATCH | `/api/boards/[boardId]/labels/[labelId]` | EDITOR | `src/app/api/boards/[boardId]/labels/[labelId]/route.ts` | Update label |
| DELETE | `/api/boards/[boardId]/labels/[labelId]` | EDITOR | `src/app/api/boards/[boardId]/labels/[labelId]/route.ts` | Delete label (cascades CardLabel) |
| POST | `/api/cards/[cardId]/labels` | EDITOR | `src/app/api/cards/[cardId]/labels/route.ts` | Attach label to card |
| DELETE | `/api/cards/[cardId]/labels` | EDITOR | `src/app/api/cards/[cardId]/labels/route.ts` | Detach label from card |

## Assignees

| Method | Path | Permission | File | Description |
|--------|------|------------|------|-------------|
| GET | `/api/cards/[cardId]/assignees` | VIEWER | `src/app/api/cards/[cardId]/assignees/route.ts` | List card assignees |
| POST | `/api/cards/[cardId]/assignees` | EDITOR | `src/app/api/cards/[cardId]/assignees/route.ts` | Assign user (must be BoardMember) |
| DELETE | `/api/cards/[cardId]/assignees` | EDITOR | `src/app/api/cards/[cardId]/assignees/route.ts` | Unassign user |

## Members & Invitations

| Method | Path | Permission | File | Description |
|--------|------|------------|------|-------------|
| GET | `/api/boards/[boardId]/members` | VIEWER | `src/app/api/boards/[boardId]/members/route.ts` | List members with user info |
| PATCH | `/api/boards/[boardId]/members/[userId]` | OWNER | `src/app/api/boards/[boardId]/members/[userId]/route.ts` | Change member role |
| DELETE | `/api/boards/[boardId]/members/[userId]` | OWNER/self | `src/app/api/boards/[boardId]/members/[userId]/route.ts` | Remove member or self-leave |
| GET | `/api/boards/[boardId]/invitations` | OWNER | `src/app/api/boards/[boardId]/invitations/route.ts` | List pending invitations |
| POST | `/api/boards/[boardId]/invitations` | OWNER | `src/app/api/boards/[boardId]/invitations/route.ts` | Invite by email (7-day expiry, sends email); enforces free plan member limit |
| DELETE | `/api/boards/[boardId]/invitations` | OWNER | `src/app/api/boards/[boardId]/invitations/route.ts` | Cancel invitation |
| POST | `/api/invitations/[token]/accept` | authenticated | `src/app/api/invitations/[token]/accept/route.ts` | Accept invitation, create BoardMember |
| POST | `/api/invitations/[token]/decline` | authenticated | `src/app/api/invitations/[token]/decline/route.ts` | Decline invitation |

## Activity

| Method | Path | Permission | File | Description |
|--------|------|------------|------|-------------|
| GET | `/api/boards/[boardId]/activity` | VIEWER | `src/app/api/boards/[boardId]/activity/route.ts` | Board activity feed. Cursor-paginated via `cursor` query param. Returns `{ items, nextCursor }` |

## Search

| Method | Path | Permission | File | Description |
|--------|------|------------|------|-------------|
| GET | `/api/boards/[boardId]/search` | VIEWER | `src/app/api/boards/[boardId]/search/route.ts` | Search cards. Params: `q`, `labelId`, `assigneeId`, `dueBefore`, `dueAfter` |

## Saved Filters

| Method | Path | Permission | File | Description |
|--------|------|------------|------|-------------|
| GET | `/api/boards/[boardId]/saved-filters` | VIEWER | `src/app/api/boards/[boardId]/saved-filters/route.ts` | List user's saved filters for board |
| POST | `/api/boards/[boardId]/saved-filters` | VIEWER | `src/app/api/boards/[boardId]/saved-filters/route.ts` | Save a named filter preset |
| DELETE | `/api/saved-filters/[id]` | owner | `src/app/api/saved-filters/[id]/route.ts` | Delete saved filter |

## Notifications

| Method | Path | File | Description |
|--------|------|------|-------------|
| GET | `/api/notifications` | `src/app/api/notifications/route.ts` | List notifications. Param: `unread=true` for unread-only |
| PATCH | `/api/notifications/[id]` | `src/app/api/notifications/[id]/route.ts` | Mark notification as read |
| DELETE | `/api/notifications/[id]` | `src/app/api/notifications/[id]/route.ts` | Delete notification |
| POST | `/api/notifications/read-all` | `src/app/api/notifications/read-all/route.ts` | Mark all notifications as read |

## Billing (Stripe)

| Method | Path | File | Description |
|--------|------|------|-------------|
| GET | `/api/billing/subscription` | `src/app/api/billing/subscription/route.ts` | Get current subscription status |
| POST | `/api/billing/create-checkout` | `src/app/api/billing/create-checkout/route.ts` | Create Stripe checkout session for pro plan |
| POST | `/api/billing/portal` | `src/app/api/billing/portal/route.ts` | Create Stripe customer portal session |
| POST | `/api/billing/webhook` | `src/app/api/billing/webhook/route.ts` | Stripe webhook handler — updates Subscription model on events |

## Users

| Method | Path | File | Description |
|--------|------|------|-------------|
| GET | `/api/users/me` | `src/app/api/users/me/route.ts` | Get current user profile |
| PATCH | `/api/users/me` | `src/app/api/users/me/route.ts` | Update profile (name, theme) |

## Real-Time

| Method | Path | File | Description |
|--------|------|------|-------------|
| POST | `/api/pusher/auth` | `src/app/api/pusher/auth/route.ts` | Authorize presence channel (`presence-board-{boardId}`) |

## Background Jobs (Inngest)

| Method | Path | File | Description |
|--------|------|------|-------------|
| GET/POST/PUT | `/api/inngest` | `src/app/api/inngest/route.ts` | Inngest webhook receiver |

Inngest functions in `src/inngest/functions/`:
- `send-assignment-notification.ts` — creates Notification when a card is assigned to a user
- `send-due-date-reminders.ts` — scheduled cron, creates Notifications for cards due soon
