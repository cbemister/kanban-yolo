# Frontend Reference

All code in `frontend/src/`. Components at `src/components/`, hooks at `src/hooks/`, lib at `src/lib/`.

## Pages

| Route | File | Notes |
|-------|------|-------|
| `/` | `src/app/page.tsx` | Redirects to `/boards` or `/login` |
| `/login` | `src/app/login/page.tsx` | Email/password + Google OAuth |
| `/signup` | `src/app/signup/page.tsx` | Name, email, password |
| `/boards` | `src/app/boards/page.tsx` | Board list grid + "Create Board" |
| `/boards/[boardId]` | `src/app/boards/[boardId]/page.tsx` | Board view (`"use client"`, uses `react.use(params)`) |
| `/invitations/[token]` | `src/app/invitations/[token]/page.tsx` | Accept / decline invitation |
| `/pricing` | `src/app/pricing/page.tsx` | Pricing plans with Stripe checkout CTA |
| `/settings/billing` | `src/app/settings/billing/page.tsx` | Subscription status + portal + upgrade |
| `/settings/notifications` | `src/app/settings/notifications/page.tsx` | Notification preferences |

## Components

### Board & Layout
| Component | File | Description |
|-----------|------|-------------|
| `Board.tsx` | `src/components/Board.tsx` | Main board: DnD context, React Query, filters, real-time via `useBoardChannel`, hotkeys via `useHotkeys`, undo/redo via `useUndoRedo`, command palette |
| `BoardToolbar.tsx` | `src/components/BoardToolbar.tsx` | Header bar: back link, board title, SearchBar, FilterBar, PresenceIndicator, NotificationBell, Share button, activity toggle |
| `Column.tsx` | `src/components/Column.tsx` | `useDroppable`, rename (inline edit), delete with confirm |
| `Card.tsx` | `src/components/Card.tsx` | `useSortable`, renders labels/assignees/dueDate in footer, delete with ConfirmDialog |
| `BoardCard.tsx` | `src/components/BoardCard.tsx` | Card on the `/boards` list page with delete button |

### Modals & Dialogs
| Component | File | Description |
|-----------|------|-------------|
| `CardDetailModal.tsx` | `src/components/CardDetailModal.tsx` | View/edit card: title, details, due date, labels, assignees, comments, attachments. `boardId` prop required. |
| `AddCardModal.tsx` | `src/components/AddCardModal.tsx` | New card form (title + details) |
| `ShareModal.tsx` | `src/components/ShareModal.tsx` | Board sharing: InviteForm + MemberList + pending invitations |
| `ConfirmDialog.tsx` | `src/components/ConfirmDialog.tsx` | Reusable confirm/cancel modal |
| `ShortcutsHelp.tsx` | `src/components/ShortcutsHelp.tsx` | Modal table of all keyboard shortcuts. Triggered by `?` hotkey. |
| `CommandPalette.tsx` | `src/components/CommandPalette.tsx` | `cmdk`-based palette (Cmd+K): search boards/cards, quick actions. Props: `boardId?`, `columns?`, `onClose`, `onNewCard?` |
| `UpgradePrompt.tsx` | `src/components/UpgradePrompt.tsx` | Modal shown when a free-plan limit is hit; links to `/pricing` |

### Activity
| Component | File | Description |
|-----------|------|-------------|
| `ActivitySidebar.tsx` | `src/components/ActivitySidebar.tsx` | Slide-in sidebar (right), cursor-paginated activity feed. Props: `boardId`, `isOpen`, `onClose` |
| `ActivityItem.tsx` | `src/components/ActivityItem.tsx` | Single activity row: user avatar, action text, relative timestamp |

### Comments
| Component | File | Description |
|-----------|------|-------------|
| `CommentList.tsx` | `src/components/CommentList.tsx` | List of comments on a card with edit/delete |
| `CommentInput.tsx` | `src/components/CommentInput.tsx` | Textarea + submit button for adding/editing a comment |

### Attachments
| Component | File | Description |
|-----------|------|-------------|
| `AttachmentList.tsx` | `src/components/AttachmentList.tsx` | Card attachments list with download links and delete |
| `FileUpload.tsx` | `src/components/FileUpload.tsx` | S3 presigned-URL file uploader. Fetches upload URL then PUTs directly to S3 |

### Labels
| Component | File | Description |
|-----------|------|-------------|
| `LabelChip.tsx` | `src/components/LabelChip.tsx` | Colored pill. Props: `label`, `size?: "sm" | "md"`. Auto-contrast text. |
| `LabelPicker.tsx` | `src/components/LabelPicker.tsx` | Dropdown checkbox list of board labels. Props: `boardId`, `cardId`, `selectedLabelIds`, `onToggle` |

### Assignees
| Component | File | Description |
|-----------|------|-------------|
| `UserAvatar.tsx` | `src/components/UserAvatar.tsx` | Circle avatar: image or initials. Props: `user`, `size?: "sm" | "md" | "lg"` (24/32/40px) |
| `AssigneePicker.tsx` | `src/components/AssigneePicker.tsx` | Dropdown of board members with checkmarks. Props: `boardId`, `cardId`, `assigneeIds`, `onToggle` |

### Due Dates
| Component | File | Description |
|-----------|------|-------------|
| `DueDatePicker.tsx` | `src/components/DueDatePicker.tsx` | react-day-picker calendar, purple-secondary selected day, "Clear" button |
| `DueDateBadge.tsx` | `src/components/DueDateBadge.tsx` | Color-coded pill: overdue=red, due within 2 days=yellow, later=gray |

### Search & Filter
| Component | File | Description |
|-----------|------|-------------|
| `SearchBar.tsx` | `src/components/SearchBar.tsx` | Debounced input (300ms), Escape clears, blue-primary focus ring |
| `SearchResults.tsx` | `src/components/SearchResults.tsx` | Dropdown with highlighted matches, column badge, label chips |
| `FilterBar.tsx` | `src/components/FilterBar.tsx` | Label multi-select, assignee dropdown, due-date filter (overdue/due-soon), saved filters, active count badge, "Clear all" |

### Members & Sharing
| Component | File | Description |
|-----------|------|-------------|
| `InviteForm.tsx` | `src/components/InviteForm.tsx` | Email + role dropdown + "Invite" button |
| `MemberList.tsx` | `src/components/MemberList.tsx` | Member list with role management (OWNER only), pending invitations |
| `PresenceIndicator.tsx` | `src/components/PresenceIndicator.tsx` | Stacked avatars of online users (max 5 + "+N"), green online dot |

### Notifications
| Component | File | Description |
|-----------|------|-------------|
| `NotificationBell.tsx` | `src/components/NotificationBell.tsx` | Toolbar bell icon with unread count badge (polls every 60s). Toggles NotificationDropdown |
| `NotificationDropdown.tsx` | `src/components/NotificationDropdown.tsx` | Dropdown list of recent notifications with mark-read and "Mark all read" |

### Theme
| Component | File | Description |
|-----------|------|-------------|
| `ThemeProvider.tsx` | `src/components/ThemeProvider.tsx` | Wraps `next-themes` ThemeProvider (`attribute="class"`, `defaultTheme="system"`) |
| `ThemeToggle.tsx` | `src/components/ThemeToggle.tsx` | Button cycling light/dark/system. Persists to `User.theme` via `/api/users/me` |

### Providers
| Component | File | Description |
|-----------|------|-------------|
| `QueryProvider.tsx` | `src/components/QueryProvider.tsx` | Wraps `QueryClientProvider` with shared client from `lib/query-client.ts` |

## Hooks

| Hook | File | Description |
|------|------|-------------|
| `useBoard(boardId)` | `src/hooks/useBoard.ts` | Fetches full board data (columns + cards + labels + assignees). Query key: `["board", boardId]`. |
| `useBoards()` | `src/hooks/useBoards.ts` | Fetches board list. `useBoardMutations()` for create/delete. |
| `useLabels(boardId)` | `src/hooks/useLabels.ts` | Board labels. `useLabelMutations(boardId)` for create/update/delete. |
| `useAssignees(cardId)` | `src/hooks/useAssignees.ts` | Card assignees. `useAssigneeMutations(cardId)` for assign/unassign. |
| `useMembers(boardId)` | `src/hooks/useMembers.ts` | Board members. `useMemberMutations(boardId)` for role change/remove. |
| `useSearch(boardId, query)` | `src/hooks/useSearch.ts` | Search cards. Enabled only when `query.length >= 1`. |
| `useBoardChannel(boardId)` | `src/hooks/useBoardChannel.ts` | Subscribes to Pusher presence channel, invalidates React Query on events, returns `{ onlineUsers }`. |
| `useHotkeys(hotkeys)` | `src/hooks/useHotkeys.ts` | Declarative keyboard shortcut binder. Each entry: `{ key, modifiers?, handler, allowInInput? }`. Fires on `keydown`, skips inputs unless `allowInInput` is set. |
| `useUndoRedo()` | `src/hooks/useUndoRedo.ts` | Action history stack (max 50). Returns `{ pushAction, undo, redo, canUndo, canRedo }`. Each action has `execute` + `undo` callbacks. |

## Library Files

| File | Path | Description |
|------|------|-------------|
| `auth.ts` | `src/lib/auth.ts` | NextAuth full config: PrismaAdapter, JWT strategy, Credentials + Google, id in session |
| `auth-edge.ts` | `src/lib/auth-edge.ts` | Edge-compatible auth (no Prisma/bcrypt) — used by middleware |
| `auth-helpers.ts` | `src/lib/auth-helpers.ts` | `getAuthenticatedUserId()`, `unauthorized()` for API routes |
| `permissions.ts` | `src/lib/permissions.ts` | `checkBoardPermission(boardId, role)`, `getBoardIdFromCard(cardId)` |
| `prisma.ts` | `src/lib/prisma.ts` | PrismaClient singleton (globalThis caching for HMR) |
| `email.ts` | `src/lib/email.ts` | `sendBoardInvitationEmail()` via Resend |
| `pusher-server.ts` | `src/lib/pusher-server.ts` | Pusher server instance |
| `pusher-client.ts` | `src/lib/pusher-client.ts` | Pusher client singleton (`getPusherClient()`) |
| `broadcast.ts` | `src/lib/broadcast.ts` | `broadcastToBoard(boardId, event, data)` — fire-and-forget |
| `activity.ts` | `src/lib/activity.ts` | `logActivity(boardId, userId, action, metadata?, cardId?)` — writes to Activity table |
| `plan-limits.ts` | `src/lib/plan-limits.ts` | `getUserPlan(userId)`, `checkBoardLimit(userId)`, `checkMemberLimit(boardId, userId)` — enforces free/pro limits. Free: 3 boards, 2 members, no attachments. Pro: unlimited. |
| `stripe.ts` | `src/lib/stripe.ts` | Stripe client instance |
| `s3.ts` | `src/lib/s3.ts` | S3 client + `generatePresignedUploadUrl()` for attachment uploads |
| `inngest.ts` | `src/lib/inngest.ts` | Inngest client for dispatching background events |
| `query-client.ts` | `src/lib/query-client.ts` | Shared React Query client configuration |

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

### Keyboard Shortcuts (Board view)
Registered via `useHotkeys` in `Board.tsx`:
- `n` — new card in first column
- `/` — focus search
- `Cmd+K` / `Ctrl+K` — open command palette
- `Ctrl+Z` / `Ctrl+Shift+Z` — undo / redo via `useUndoRedo`
- `?` — open ShortcutsHelp modal

### Plan Limits
`lib/plan-limits.ts` is checked in board creation and invitation routes. Hitting a limit surfaces `UpgradePrompt` linking to `/pricing`.

### Types
All shared types in `src/types/index.ts`: `Card`, `Column`, `Label`, `CardLabel`, `CardAssignee`, `BoardMember`, `Invitation`, `ActiveFilters`, `Comment`, `Activity`, `Attachment`, `SavedFilter`.
