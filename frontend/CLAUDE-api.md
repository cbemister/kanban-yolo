# API Routes

All routes under `frontend/src/app/api/`. All authenticated routes use `checkBoardPermission` from `src/lib/permissions.ts`. Mutating routes call `broadcastToBoard` for real-time sync.

## Auth

| Method | Path | Description |
|--------|------|-------------|
| GET/POST | `/api/auth/[...nextauth]` | NextAuth handler |
| POST | `/api/auth/register` | Sign up (zod validation, bcrypt, creates default board) |

## Boards

| Method | Path | Permission | Description |
|--------|------|------------|-------------|
| GET | `/api/boards` | authenticated | List user's boards |
| POST | `/api/boards` | authenticated | Create board (5 default columns) |
| GET | `/api/boards/[boardId]` | VIEWER | Full board with columns, cards, labels, assignees |
| PATCH | `/api/boards/[boardId]` | EDITOR | Rename board |
| DELETE | `/api/boards/[boardId]` | OWNER | Delete board |

## Columns

| Method | Path | Permission | Description |
|--------|------|------------|-------------|
| POST | `/api/columns` | EDITOR | Create column on board |
| PATCH | `/api/columns/[columnId]` | EDITOR | Rename / reposition |
| DELETE | `/api/columns/[columnId]` | EDITOR | Delete column |
| PUT | `/api/columns/reorder` | EDITOR | Batch reorder (position array) |

## Cards

| Method | Path | Permission | Description |
|--------|------|------------|-------------|
| POST | `/api/cards` | EDITOR | Create card in column |
| GET | `/api/cards/[cardId]` | VIEWER | Get card |
| PATCH | `/api/cards/[cardId]` | EDITOR | Update title / details / dueDate / columnId |
| DELETE | `/api/cards/[cardId]` | EDITOR | Delete card |
| PUT | `/api/cards/reorder` | EDITOR | Reorder within column |
| PUT | `/api/cards/move` | EDITOR | Move card to different column |

## Labels

| Method | Path | Permission | Description |
|--------|------|------------|-------------|
| GET | `/api/boards/[boardId]/labels` | VIEWER | List board labels |
| POST | `/api/boards/[boardId]/labels` | EDITOR | Create label |
| PATCH | `/api/boards/[boardId]/labels/[labelId]` | EDITOR | Update label |
| DELETE | `/api/boards/[boardId]/labels/[labelId]` | EDITOR | Delete label (cascades CardLabel) |
| POST | `/api/cards/[cardId]/labels` | EDITOR | Attach label to card |
| DELETE | `/api/cards/[cardId]/labels` | EDITOR | Detach label from card |

## Assignees

| Method | Path | Permission | Description |
|--------|------|------------|-------------|
| GET | `/api/cards/[cardId]/assignees` | VIEWER | List card assignees |
| POST | `/api/cards/[cardId]/assignees` | EDITOR | Assign user (must be BoardMember) |
| DELETE | `/api/cards/[cardId]/assignees` | EDITOR | Unassign user |

## Members & Invitations

| Method | Path | Permission | Description |
|--------|------|------------|-------------|
| GET | `/api/boards/[boardId]/members` | VIEWER | List members with user info |
| PATCH | `/api/boards/[boardId]/members/[userId]` | OWNER | Change member role |
| DELETE | `/api/boards/[boardId]/members/[userId]` | OWNER/self | Remove member or self-leave |
| GET | `/api/boards/[boardId]/invitations` | OWNER | List pending invitations |
| POST | `/api/boards/[boardId]/invitations` | OWNER | Invite by email (7-day expiry, sends email) |
| DELETE | `/api/boards/[boardId]/invitations` | OWNER | Cancel invitation |
| POST | `/api/invitations/[token]/accept` | authenticated | Accept invitation, create BoardMember |
| POST | `/api/invitations/[token]/decline` | authenticated | Decline invitation |

## Search

| Method | Path | Permission | Description |
|--------|------|------------|-------------|
| GET | `/api/boards/[boardId]/search` | VIEWER | Search cards. Params: `q`, `labelId`, `assigneeId`, `dueBefore`, `dueAfter` |

## Real-Time

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/pusher/auth` | Authorize presence channel (`presence-board-{boardId}`) |
