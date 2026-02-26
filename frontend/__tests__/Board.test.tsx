import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Board from "@/components/Board";

// Mock next-auth/react
jest.mock("next-auth/react", () => ({
  signOut: jest.fn(),
  useSession: () => ({ data: { user: { id: "user-1" } } }),
}));

// Mock next/link
jest.mock("next/link", () => {
  const MockLink = ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  );
  MockLink.displayName = "MockLink";
  return MockLink;
});

// Mock react-hot-toast
jest.mock("react-hot-toast", () => ({
  __esModule: true,
  default: { error: jest.fn(), success: jest.fn() },
}));

// Mock useBoard hook
const MOCK_BOARD = {
  id: "board-1",
  title: "Test Board",
  columns: [
    {
      id: "col-1",
      title: "Backlog",
      position: 0,
      cards: [
        { id: "card-1", title: "Design system audit", details: "Some details", position: 0 },
        { id: "card-2", title: "Mobile responsive layout", details: "", position: 1 },
      ],
    },
    { id: "col-2", title: "In Progress", position: 1, cards: [
      { id: "card-3", title: "User authentication flow", details: "", position: 0 },
    ] },
    { id: "col-3", title: "In Review", position: 2, cards: [] },
    { id: "col-4", title: "Testing", position: 3, cards: [] },
    { id: "col-5", title: "Done", position: 4, cards: [] },
  ],
};

jest.mock("@/hooks/useBoard", () => ({
  useBoard: () => ({ data: MOCK_BOARD, isLoading: false, error: null }),
}));

jest.mock("@/hooks/useBoardChannel", () => ({
  useBoardChannel: () => ({ onlineUsers: [] }),
}));

jest.mock("@/hooks/useLabels", () => ({
  useLabels: () => ({ data: [] }),
  useLabelMutations: () => ({ createLabel: {}, updateLabel: {}, deleteLabel: {} }),
}));

jest.mock("@/hooks/useMembers", () => ({
  useMembers: () => ({ data: [] }),
  useMemberMutations: () => ({ updateRole: {}, removeMember: {} }),
}));

jest.mock("@/hooks/useSearch", () => ({
  useSearch: () => ({ data: [] }),
}));

// Mock fetch globally
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ id: `card-new-${Date.now()}`, title: "", details: "", position: 0 }),
  })
) as jest.Mock;

// Mock dnd-kit
jest.mock("@dnd-kit/core", () => ({
  DndContext: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  DragOverlay: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  PointerSensor: class PointerSensor {},
  closestCorners: jest.fn(),
  useSensor: jest.fn(),
  useSensors: jest.fn(() => []),
  useDroppable: jest.fn(() => ({ setNodeRef: jest.fn(), isOver: false })),
}));

jest.mock("@dnd-kit/sortable", () => ({
  SortableContext: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  verticalListSortingStrategy: {},
  arrayMove: jest.fn((arr: unknown[], from: number, to: number) => {
    const result = [...arr];
    const [item] = result.splice(from, 1);
    result.splice(to, 0, item);
    return result;
  }),
  useSortable: () => ({
    attributes: {},
    listeners: {},
    setNodeRef: jest.fn(),
    transform: null,
    transition: null,
    isDragging: false,
  }),
}));

jest.mock("@dnd-kit/utilities", () => ({
  CSS: { Transform: { toString: jest.fn(() => "") } },
}));

function renderBoard() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <Board boardId="board-1" />
    </QueryClientProvider>
  );
}

describe("Board", () => {
  it("renders board data showing all 5 column titles", () => {
    renderBoard();
    const headings = screen.getAllByRole("heading", { level: 2 });
    const headingTexts = headings.map((h) => h.textContent?.toLowerCase() ?? "");
    expect(headingTexts.some((t) => t.includes("backlog"))).toBe(true);
    expect(headingTexts.some((t) => t.includes("in progress"))).toBe(true);
    expect(headingTexts.some((t) => t.includes("in review"))).toBe(true);
    expect(headingTexts.some((t) => t.includes("testing"))).toBe(true);
    expect(headingTexts.some((t) => t.includes("done"))).toBe(true);
  });

  it("can add a card to a column", async () => {
    const user = userEvent.setup();
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ id: "card-new", title: "My New Test Card", details: "", position: 2 }),
    });

    renderBoard();

    const addButtons = screen.getAllByText("+ Add Card");
    await user.click(addButtons[0]);

    const titleInput = screen.getByPlaceholderText("Card title");
    await user.type(titleInput, "My New Test Card");

    const form = titleInput.closest("form") as HTMLFormElement;
    const submitButton = form.querySelector('button[type="submit"]') as HTMLButtonElement;
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("My New Test Card")).toBeInTheDocument();
    });
  });

  it("can delete a card after confirming", async () => {
    const user = userEvent.setup();
    renderBoard();

    const cardTitle = "Design system audit";
    expect(screen.getByText(cardTitle)).toBeInTheDocument();

    const deleteButtons = screen.getAllByLabelText("Delete card");
    await user.click(deleteButtons[0]);

    // ConfirmDialog should appear — click the confirm button
    const confirmButton = screen.getByText("Delete");
    await user.click(confirmButton);

    await waitFor(() => {
      expect(screen.queryByText(cardTitle)).not.toBeInTheDocument();
    });
  });

  it("can rename a column by double-clicking the title", async () => {
    const user = userEvent.setup();
    renderBoard();

    const headings = screen.getAllByRole("heading", { level: 2 });
    const backlogHeading = headings.find(
      (h) => h.textContent?.toLowerCase() === "backlog"
    );
    expect(backlogHeading).toBeTruthy();

    const clickableArea = backlogHeading!.closest("[class*='cursor-pointer']") as HTMLElement;
    await user.dblClick(clickableArea);

    const input = screen.getByDisplayValue(/backlog/i) as HTMLInputElement;
    await user.clear(input);
    await user.type(input, "New Column Name");
    await user.keyboard("{Enter}");

    await waitFor(() => {
      const updatedHeadings = screen.getAllByRole("heading", { level: 2 });
      const texts = updatedHeadings.map((h) => h.textContent?.toLowerCase() ?? "");
      expect(texts.some((t) => t.includes("new column name"))).toBe(true);
    });
  });
});
