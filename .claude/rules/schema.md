# Database Schema

Prisma 6 + Neon PostgreSQL. Schema at `frontend/prisma/schema.prisma`.

## Models

### User
`frontend/prisma/schema.prisma` — Core auth model. Fields: `passwordHash` (credentials login), `theme` (light/dark/system preference). Relations: boards (owned), boardMembers, assignedCards, comments, activities, attachments, notifications, savedFilters, subscription, invitations (sent + received).

### Board
Owned by a `User` (via `userId`). Has `columns`, `labels`, `members` (BoardMember), `invitations`, `activities`, `savedFilters`.

### Column
Belongs to a `Board`. Has `position: Int` for ordering. Contains `cards`.

### Card
Belongs to a `Column`. Fields: `title`, `details`, `position`, `dueDate?`. Has `labels` (CardLabel[]), `assignees` (CardAssignee[]), `comments` (Comment[]), `attachments` (Attachment[]).

### Label
Board-scoped. `name` + `color`. Unique per board (`@@unique([boardId, name])`). Junction: `CardLabel`.

### CardLabel
Junction table: `@@id([cardId, labelId])`.

### CardAssignee
Junction table: `@@id([cardId, userId])`. User must be a BoardMember to be assigned.

### BoardMember
Junction: `@@id([boardId, userId])`. Role enum: `OWNER | EDITOR | VIEWER`. Board creator is always OWNER (stored in `Board.userId`, not in this table).

### Invitation
Token-based board invitations. `status: PENDING | ACCEPTED | DECLINED`. `expiresAt` = 7 days from creation. `token` is unique cuid, used in accept/decline URLs. `invitedById` + optional `userId` (set on accept).

### Comment
Belongs to a `Card` and `User`. Fields: `content: Text`, `createdAt`, `updatedAt`. Indexed by `cardId` and `userId`.

### Activity
Board-level audit log. Fields: `boardId`, `cardId?`, `userId`, `action: String`, `metadata: Json`. Written via `logActivity()` in `lib/activity.ts`. Indexed by `boardId`, `cardId`, `userId`.

### Attachment
File attached to a `Card`, uploaded to S3. Fields: `fileName`, `fileUrl`, `fileSize: Int`, `mimeType`. Presigned upload URL generated via `lib/s3.ts`.

### Notification
Per-user in-app notification. Fields: `type`, `title`, `body`, `linkUrl?`, `read: Boolean`. Created by Inngest background functions. Indexed by `userId` and `(userId, read)`.

### SavedFilter
Named filter preset per user per board. Fields: `name`, `filters: Json` (serialized `ActiveFilters`). Junction: `@@index([boardId, userId])`.

### Subscription
One-to-one with `User`. Fields: `stripeCustomerId`, `stripeSubscriptionId?`, `plan` (free/pro), `status`, `currentPeriodEnd?`. Used by `lib/plan-limits.ts` to gate features.

### NextAuth models
`Account`, `Session`, `VerificationToken` — standard NextAuth v5 Prisma adapter models.

## Migration Notes

- Run `npx prisma migrate dev --name <name>` from `frontend/` after schema changes.
- Run `npx prisma generate` after generate changes (or it runs automatically after migrate).
- Seed: `npx prisma db seed` creates `demo@kanban.dev` with a demo board.
- Node 20.10 is incompatible with Prisma 7.x — stay on Prisma 6.x.
