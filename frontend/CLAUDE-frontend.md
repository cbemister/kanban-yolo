# Frontend Reference

All code in `frontend/src/`.

## Pages

| Route | File | Notes |
|-------|------|-------|
| `/` | `app/page.tsx` | Redirects to `/boards` or `/login` |
| `/login` | `app/login/page.tsx` | Email/password + Google OAuth |
| `/signup` | `app/signup/page.tsx` | Name, email, password |
| `/boards` | `app/boards/page.tsx` | Board list grid + "Create Board" |
| `/boards/[boardId]` | `app/boards/[boardId]/page.tsx` | Board view (`"use client"`, uses `react.use(params)`) |
| `/invitations/[token]` | `app/invitations/[token]/page.tsx` | Accept / decline invitation |

## Components

### Board & Layout
| Component | Description |
|-----------|-------------|
| `Board.tsx` | Main board: DnD context, React Query, filters, real-time via `useBoardChannel` |
| `BoardToolbar.tsx` | Header bar: back link, board title, SearchBar, FilterBar, PresenceIndicator, Share button |
| `Column.tsx` | `useDroppable`, rename (inline edit), delete with confirm |
| `Card.tsx` | `useSortable`, renders labels/assignees/dueDate in footer, delete with ConfirmDialog |
| `BoardCard.tsx` | Card on the `/boards` list page with delete button |

### Modals & Dialogs
| Component | Description |
|-----------|-------------|
| `CardDetailModal.tsx` | View/edit card: title, details, due date, labels, assignees. `boardId` prop required. |
| `AddCardModal.tsx` | New card form (title + details) |
| `ShareModal.tsx` | Board sharing: InviteForm + MemberList + pending invitations |
| `ConfirmDialog.tsx` | Reusable confirm/cancel modal |

### Labels
| Component | Description |
|-----------|-------------|
| `LabelChip.tsx` | Colored pill. Props: `label`, `size?: "sm" | "md"`. Auto-contrast text. |
| `LabelPicker.tsx` | Dropdown checkbox list of board labels. Props: `boardId`, `cardId`, `selectedLabelIds`, `onToggle` |

### Assignees
| Component | Description |
|-----------|-------------|
| `UserAvatar.tsx` | Circle avatar: image or initials. Props: `user`, `size?: "sm" | "md" | "lg"` (24/32/40px) |
| `AssigneePicker.tsx` | Dropdown of board members with checkmarks. Props: `boardId`, `cardId`, `assigneeIds`, `onToggle` |

### Due Dates
| Component | Description |
|-----------|-------------|
| `DueDatePicker.tsx` | react-day-picker calendar, purple-secondary selected day, "Clear" button |
| `DueDateBadge.tsx` | Color-coded pill: overdue=red, due within 2 days=yellow, later=gray |

### Search & Filter
| Component | Description |
|-----------|-------------|
| `SearchBar.tsx` | Debounced input (300ms), Escape clears, blue-primary focus ring |
| `SearchResults.tsx` | Dropdown with highlighted matches, column badge, label chips |
| `FilterBar.tsx` | Label multi-select, assignee dropdown, due-date filter (overdue/due-soon), active count badge, "Clear all" |

### Members & Sharing
| Component | Description |
|-----------|-------------|
| `InviteForm.tsx` | Email + role dropdown + "Invite" button |
| `MemberList.tsx` | Member list with role management (OWNER only), pending invitations |
| `PresenceIndicator.tsx` | Stacked avatars of online users (max 5 + "+N"), green online dot |

### Providers
| Component | Description |
|-----------|-------------|
| `QueryProvider.tsx` | Wraps `QueryClientProvider` for React Query |

## Hooks

| Hook | Description |
|------|-------------|
| `useBoard(boardId)` | Fetches full board data (columns + cards + labels + assignees). Query key: `["board", boardId]`. |
| `useBoards()` | Fetches board list. `useBoardMutations()` for create/delete. |
| `useLabels(boardId)` | Board labels. `useLabelMutations(boardId)` for create/update/delete. |
| `useAssignees(cardId)` | Card assignees. `useAssigneeMutations(cardId)` for assign/unassign. |
| `useMembers(boardId)` | Board members. `useMemberMutations(boardId)` for role change/remove. |
| `useSearch(boardId, query)` | Search cards. Enabled only when `query.length >= 1`. |
| `useBoardChannel(boardId)` | Subscribes to Pusher presence channel, invalidates React Query on events, returns `{ onlineUsers }`. |

## Library Files

| File | Description |
|------|-------------|
| `lib/auth.ts` | NextAuth full config: PrismaAdapter, JWT strategy, Credentials + Google, id in session |
| `lib/auth-edge.ts` | Edge-compatible auth (no Prisma/bcrypt) — used by middleware |
| `lib/auth-helpers.ts` | `getAuthenticatedUserId()`, `unauthorized()` for API routes |
| `lib/permissions.ts` | `checkBoardPermission(boardId, role)`, `getBoardIdFromCard(cardId)` |
| `lib/prisma.ts` | PrismaClient singleton (globalThis caching for HMR) |
| `lib/email.ts` | `sendBoardInvitationEmail()` via Resend |
| `lib/pusher-server.ts` | Pusher server instance |
| `lib/pusher-client.ts` | Pusher client singleton (`getPusherClient()`) |
| `lib/broadcast.ts` | `broadcastToBoard(boardId, event, data)` — fire-and-forget |

## Key Patterns

### DnD (drag-and-drop)
- Cross-column moves: optimistic state update in `handleDragOver`, API call fire-and-forget, invalidate on error.
- Within-column reorder: state update in `handleDragEnd`, same pattern.
- Local `columns` state synced from `useBoard` query via `useEffect`.

### Auth in API Routes
```typescript
const perm = await checkBoardPermission(boardId, "EDITOR");
if (!perm.authorized) return perm.response;
// perm.userId and perm.role are available
```

### Real-Time
All mutating API routes call `broadcastToBoard(boardId, "event:name", data)` after success.
`useBoardChannel` on the client subscribes and invalidates the board query on any event.

### Client-Side Filtering
`applyFilters(columns, filters)` in `Board.tsx` — pure function, runs before render. No server round-trip for filter changes.

### Types
All shared types in `src/types/index.ts`: `Card`, `Column`, `Label`, `CardLabel`, `CardAssignee`, `BoardMember`, `Invitation`, `ActiveFilters`.
