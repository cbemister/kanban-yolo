import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Board from "@/components/Board";

// Mock dnd-kit to avoid needing pointer events in jsdom
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
  CSS: {
    Transform: {
      toString: jest.fn(() => ""),
    },
  },
}));

describe("Board", () => {
  it("renders with dummy data showing all 5 column titles", () => {
    render(<Board />);
    // Use heading role to target column h2 elements specifically
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
    render(<Board />);

    // Click the first "Add Card" button (Backlog column)
    const addButtons = screen.getAllByText("+ Add Card");
    await user.click(addButtons[0]);

    // Modal should be open — find the title input
    const titleInput = screen.getByPlaceholderText("Card title");
    await user.type(titleInput, "My New Test Card");

    // Find the submit button inside the form
    const form = titleInput.closest("form") as HTMLFormElement;
    const submitButton = form.querySelector('button[type="submit"]') as HTMLButtonElement;
    await user.click(submitButton);

    // Card should appear in the board
    await waitFor(() => {
      expect(screen.getByText("My New Test Card")).toBeInTheDocument();
    });
  });

  it("can delete a card", async () => {
    const user = userEvent.setup();
    render(<Board />);

    // "Design system audit" is the first card in Backlog
    const cardTitle = "Design system audit";
    expect(screen.getByText(cardTitle)).toBeInTheDocument();

    const deleteButtons = screen.getAllByLabelText("Delete card");
    await user.click(deleteButtons[0]);

    await waitFor(() => {
      expect(screen.queryByText(cardTitle)).not.toBeInTheDocument();
    });
  });

  it("can rename a column by double-clicking the title", async () => {
    const user = userEvent.setup();
    render(<Board />);

    // Find the Backlog h2 heading
    const headings = screen.getAllByRole("heading", { level: 2 });
    const backlogHeading = headings.find(
      (h) => h.textContent?.toLowerCase() === "backlog"
    );
    expect(backlogHeading).toBeTruthy();

    // Double-click the parent div that handles dblClick
    const clickableArea = backlogHeading!.closest("[class*='cursor-pointer']") as HTMLElement;
    await user.dblClick(clickableArea);

    // An input should appear
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
