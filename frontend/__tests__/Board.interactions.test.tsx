import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Board from "@/components/Board";

// External libraries that don't work well in jsdom
jest.mock("react-day-picker", () => ({
  DayPicker: ({ onDayClick }: { onDayClick?: (d: Date) => void }) => (
    <div data-testid="day-picker" onClick={() => onDayClick?.(new Date())} />
  ),
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

const MOCK_BOARD = {
  id: "board-1",
  title: "My Test Board",
  ownerId: "user-1",
  columns: [
    {
      id: "col-1",
      title: "To Do",
      position: 0,
      cards: [
        {
          id: "card-1",
          title: "First task",
          details: "Some task details here",
          position: 0,
          labels: [],
          assignees: [],
          dueDate: null,
        },
        {
          id: "card-2",
          title: "Second task",
          details: "",
          position: 1,
          labels: [{ cardId: "card-2", labelId: "lbl-1", label: { id: "lbl-1", name: "Bug", color: "#ef4444", boardId: "board-1" } }],
          assignees: [],
          dueDate: null,
        },
      ],
    },
    {
      id: "col-2",
      title: "Done",
      position: 1,
      cards: [],
    },
  ],
};

jest.mock("@/hooks/useBoard", () => ({
  useBoard: () => ({ data: MOCK_BOARD, isLoading: false, error: null }),
}));

jest.mock("@/hooks/useBoardChannel", () => ({
  useBoardChannel: () => ({ onlineUsers: [] }),
}));

jest.mock("@/hooks/useLabels", () => ({
  useLabels: () => ({ data: [{ id: "lbl-1", name: "Bug", color: "#ef4444", boardId: "board-1" }] }),
  useLabelMutations: () => ({ createLabel: {}, updateLabel: {}, deleteLabel: {} }),
}));

jest.mock("@/hooks/useMembers", () => ({
  useMembers: () => ({ data: [] }),
  useMemberMutations: () => ({ updateRole: {}, removeMember: {} }),
}));

jest.mock("@/hooks/useSearch", () => ({
  useSearch: () => ({ data: [] }),
}));

global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ id: "new-id", title: "New Column", position: 2, cards: [] }),
  })
) as jest.Mock;

jest.mock("@dnd-kit/core", () => ({
  DndContext: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  DragOverlay: () => null,
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

describe("Board interactions", () => {
  beforeEach(() => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ id: "new-id", title: "New Column", position: 2, cards: [] }),
    });
  });

  it("opens CardDetailModal when a card is clicked", async () => {
    const user = userEvent.setup();
    renderBoard();

    // "First task" appears once in the card list
    expect(screen.getAllByText("First task")).toHaveLength(1);

    await user.click(screen.getByText("First task"));

    // After modal opens, "First task" appears in both the card and the modal heading
    await waitFor(() => {
      expect(screen.getAllByText("First task").length).toBeGreaterThan(1);
    });
  });

  it("shows card details inside the modal", async () => {
    const user = userEvent.setup();
    renderBoard();

    // Details appear once in the card preview before clicking
    expect(screen.getAllByText("Some task details here")).toHaveLength(1);

    await user.click(screen.getByText("First task"));

    // After opening modal, details appear in both the card and the modal
    await waitFor(() => {
      expect(screen.getAllByText("Some task details here")).toHaveLength(2);
    });
  });

  it("closes CardDetailModal when the close button is clicked", async () => {
    const user = userEvent.setup();
    renderBoard();

    await user.click(screen.getByText("First task"));
    await waitFor(() => expect(screen.getAllByText("First task").length).toBeGreaterThan(1));

    await user.click(screen.getByLabelText("Close"));

    await waitFor(() => {
      expect(screen.getAllByText("First task")).toHaveLength(1);
    });
  });

  it("can add a new column", async () => {
    const user = userEvent.setup();
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ id: "col-new", title: "New Column", position: 2, cards: [] }),
    });

    renderBoard();
    await user.click(screen.getByLabelText("Add column"));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/columns",
        expect.objectContaining({ method: "POST" })
      );
    });
  });

  it("cancels card deletion when Cancel is clicked in confirm dialog", async () => {
    const user = userEvent.setup();
    renderBoard();

    expect(screen.getByText("First task")).toBeInTheDocument();

    await user.click(screen.getAllByLabelText("Delete card")[0]);
    await user.click(screen.getByText("Cancel"));

    expect(screen.getByText("First task")).toBeInTheDocument();
    expect(global.fetch).not.toHaveBeenCalledWith(
      expect.stringContaining("/api/cards/card-1"),
      expect.objectContaining({ method: "DELETE" })
    );
  });

  it("shows card count badge on each column", () => {
    renderBoard();
    expect(screen.getByText("2")).toBeInTheDocument(); // col-1 has 2 cards
    expect(screen.getByText("0")).toBeInTheDocument(); // col-2 has 0 cards
  });

  it("renders label chips on cards that have labels", () => {
    renderBoard();
    expect(screen.getByText("Bug")).toBeInTheDocument();
  });

  it("renders the board title in the toolbar", () => {
    renderBoard();
    expect(screen.getByText("My Test Board")).toBeInTheDocument();
  });

  it("shows an Add Card button for each column", () => {
    renderBoard();
    expect(screen.getAllByText("+ Add Card")).toHaveLength(MOCK_BOARD.columns.length);
  });

  it("shows 'No details provided.' placeholder in modal when card has no details", async () => {
    const user = userEvent.setup();
    renderBoard();

    await user.click(screen.getByText("Second task"));

    await waitFor(() => {
      expect(screen.getByText("No details provided.")).toBeInTheDocument();
    });
  });
});
