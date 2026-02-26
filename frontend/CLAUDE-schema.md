# Database Schema

Prisma 6 + Neon PostgreSQL. Schema at `frontend/prisma/schema.prisma`.

## Models

### User
Core auth model. `passwordHash` for credentials login. Relations to boards, board memberships, card assignments, invitations.

### Board
Owned by a `User` (via `userId`). Has `columns`, `labels`, `members` (BoardMember), `invitations`.

### Column
Belongs to a `Board`. Has `position: Int` for ordering. Contains `cards`.

### Card
Belongs to a `Column`. Fields: `title`, `details`, `position`, `dueDate?`. Has `labels` (CardLabel[]) and `assignees` (CardAssignee[]).

### Label
Board-scoped. `name` + `color`. Unique per board (`@@unique([boardId, name])`). Junction: `CardLabel`.

### CardLabel
Junction table: `@@id([cardId, labelId])`.

### CardAssignee
Junction table: `@@id([cardId, userId])`. User must be a BoardMember to be assigned.

### BoardMember
Junction: `@@id([boardId, userId])`. Role enum: `OWNER | EDITOR | VIEWER`. Board creator is always OWNER (stored in `Board.userId`, not in this table).

### Invitation
Token-based board invitations. `status: PENDING | ACCEPTED | DECLINED`. `expiresAt` = 7 days from creation. `token` is unique cuid, used in accept/decline URLs.

### NextAuth models
`Account`, `Session`, `VerificationToken` — standard NextAuth v5 Prisma adapter models.

## Migration Notes

- Run `npx prisma migrate dev --name <name>` from `frontend/` after schema changes.
- Run `npx prisma generate` after generate changes (or it runs automatically after migrate).
- Seed: `npx prisma db seed` creates `demo@kanban.dev` with a demo board.
- Node 20.10 is incompatible with Prisma 7.x — stay on Prisma 6.x.
