# Testing

Two test layers: Jest (unit/component) and Playwright (e2e). All commands run from `frontend/`.

## Unit & Component Tests (Jest)

**Run:** `npm test`

**Config:** `frontend/jest.config.js`
- Environment: `jsdom`
- Setup: `frontend/jest.setup.ts` (imports `@testing-library/jest-dom`)
- Path alias: `@/` → `src/`
- Transform: `ts-jest` with `react-jsx`
- Test match: `frontend/__tests__/**/*.test.tsx`

**Stack:** Jest 29 + React Testing Library + `@testing-library/user-event`

### Test Files

| File | What it covers |
|------|---------------|
| `__tests__/Board.test.tsx` | Board rendering, add card, delete card (with confirm), rename column |
| `__tests__/Board.interactions.test.tsx` | CardDetailModal open/close/content, add column, cancel delete, label chips, card count badges |
| `__tests__/DueDateBadge.test.tsx` | Color-coding logic: overdue / due-soon / future |
| `__tests__/LabelChip.test.tsx` | Label pill rendering, size variants, contrast text |
| `__tests__/UserAvatar.test.tsx` | Image avatar, initials fallback, size variants |

### Standard Mocks

Every Board test file mocks the same set of dependencies. Copy this pattern when adding new Board tests:

```typescript
jest.mock("next/navigation", () => ({
  useRouter: () => ({ replace: jest.fn() }),
  useSearchParams: () => ({ get: jest.fn(() => null) }),
}));
jest.mock("next-auth/react", () => ({
  signOut: jest.fn(),
  useSession: () => ({ data: { user: { id: "user-1" } } }),
}));
jest.mock("next/link", () => {
  const MockLink = ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  );
  MockLink.displayName = "MockLink";
  return MockLink;
});
jest.mock("react-hot-toast", () => ({
  __esModule: true,
  default: { error: jest.fn(), success: jest.fn() },
}));
// Hook mocks
jest.mock("@/hooks/useBoard", () => ({ useBoard: () => ({ data: MOCK_BOARD, isLoading: false, error: null }) }));
jest.mock("@/hooks/useBoardChannel", () => ({ useBoardChannel: () => ({ onlineUsers: [] }) }));
jest.mock("@/hooks/useLabels", () => ({ useLabels: () => ({ data: [] }), useLabelMutations: () => ({}) }));
jest.mock("@/hooks/useMembers", () => ({ useMembers: () => ({ data: [] }), useMemberMutations: () => ({}) }));
jest.mock("@/hooks/useSearch", () => ({ useSearch: () => ({ data: [] }) }));
jest.mock("@/hooks/useBoards", () => ({ useBoards: () => ({ data: [] }) }));
// Components that use fetch or setInterval must be mocked to null
jest.mock("@/components/NotificationBell", () => { const M = () => null; M.displayName = "NotificationBell"; return { __esModule: true, default: M }; });
// DnD-kit mocks
jest.mock("@dnd-kit/core", () => ({ DndContext: ({ children }: any) => <>{children}</>, DragOverlay: () => null, PointerSensor: class {}, closestCorners: jest.fn(), useSensor: jest.fn(), useSensors: jest.fn(() => []), useDroppable: jest.fn(() => ({ setNodeRef: jest.fn(), isOver: false })) }));
jest.mock("@dnd-kit/sortable", () => ({ SortableContext: ({ children }: any) => <>{children}</>, verticalListSortingStrategy: {}, arrayMove: jest.fn((arr, from, to) => { const r = [...arr]; const [i] = r.splice(from, 1); r.splice(to, 0, i); return r; }), useSortable: () => ({ attributes: {}, listeners: {}, setNodeRef: jest.fn(), transform: null, transition: null, isDragging: false }) }));
jest.mock("@dnd-kit/utilities", () => ({ CSS: { Transform: { toString: jest.fn(() => "") } } }));
global.fetch = jest.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve({}) })) as jest.Mock;
```

**Render helper pattern:**
```typescript
function renderBoard() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <Board boardId="board-1" />
    </QueryClientProvider>
  );
}
```

Components that poll or fetch independently (`NotificationBell`, `CommentList`, `CommentInput`, `AttachmentList`, `FileUpload`) must be mocked to `null` in Board tests to avoid network noise.

---

## E2E Tests (Playwright)

**Run:** `npx playwright test` (starts dev server automatically unless already running)

**Config:** `frontend/playwright.config.ts`
- `testDir`: `./e2e`
- `baseURL`: `http://localhost:3000`
- Browser: Chromium only
- `webServer`: runs `npm run dev`, reuses existing server outside CI

### Test Files

| File | What it covers |
|------|---------------|
| `e2e/auth.spec.ts` | Login, signup, logout flows |
| `e2e/boards.spec.ts` | Board list: create, rename, delete board |
| `e2e/kanban.spec.ts` | Board view: add/delete cards, rename column, open card detail |

### Helpers (`e2e/helpers.ts`)

```typescript
login(page, email?, password?)   // navigates to /login, fills form, waits for /boards
openDemoBoard(page)              // login + click "Demo Board"

// Demo credentials (from seed):
DEMO_EMAIL    = "demo@kanban.dev"
DEMO_PASSWORD = "password123"
DEMO_BOARD    = "Demo Board"
```

E2E tests require a running database with the seed applied (`npx prisma db seed`).
