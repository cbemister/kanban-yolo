"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import Link from "next/link";
import toast from "react-hot-toast";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import type { DragStartEvent, DragOverEvent, DragEndEvent } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import type { Column as ColumnType, Card as CardType, ActiveFilters } from "@/types";
import { useBoard } from "@/hooks/useBoard";
import { useBoardChannel } from "@/hooks/useBoardChannel";
import type { SearchResult } from "@/hooks/useSearch";
import Column from "./Column";
import AddCardModal from "./AddCardModal";
import CardDetailModal from "./CardDetailModal";
import BoardToolbar from "./BoardToolbar";
import { isPast, differenceInDays, parseISO } from "date-fns";
import { useHotkeys } from "@/hooks/useHotkeys";
import { useUndoRedo } from "@/hooks/useUndoRedo";
import CommandPalette from "./CommandPalette";
import ShortcutsHelp from "./ShortcutsHelp";
import TitleBlockFooter from "./TitleBlockFooter";

function CardOverlay({ card }: { card: CardType }) {
  return (
    <div
      className="editorial-card p-3 w-64 sm:w-72"
      style={{ opacity: 0.9, transform: "rotate(2deg) scale(1.05)" }}
    >
      <h3
        style={{
          fontFamily: "var(--font-serif)",
          fontSize: 15,
          fontWeight: 400,
          lineHeight: 1.35,
          color: "var(--text-primary)",
          paddingRight: 24,
          marginBottom: 4,
        }}
      >
        {card.title}
      </h3>
      {card.details && (
        <p className="line-clamp-2" style={{ fontSize: 13, color: "var(--text-secondary)" }}>
          {card.details}
        </p>
      )}
    </div>
  );
}

interface BoardProps {
  boardId: string;
}

function applyFilters(columns: ColumnType[], filters: ActiveFilters): ColumnType[] {
  const hasFilters =
    filters.labelIds.length > 0 ||
    filters.assigneeId !== null ||
    filters.dueSoon ||
    filters.overdue;

  if (!hasFilters) return columns;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return columns.map((col) => ({
    ...col,
    cards: col.cards.filter((card) => {
      if (filters.labelIds.length > 0) {
        const cardLabelIds = (card.labels ?? []).map((cl) => cl.labelId);
        if (!filters.labelIds.some((id) => cardLabelIds.includes(id))) return false;
      }

      if (filters.assigneeId) {
        const assigneeIds = (card.assignees ?? []).map((a) => a.userId);
        if (!assigneeIds.includes(filters.assigneeId)) return false;
      }

      if (filters.overdue && card.dueDate) {
        const date = parseISO(card.dueDate);
        if (!isPast(date) || differenceInDays(today, date) === 0) return false;
      }

      if (filters.dueSoon && card.dueDate) {
        const date = parseISO(card.dueDate);
        const diff = differenceInDays(date, today);
        if (diff < 0 || diff > 2) return false;
      }

      return true;
    }),
  }));
}

export default function Board({ boardId }: BoardProps) {
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const { data: boardData, isLoading, error } = useBoard(boardId);
  const serverColumns = boardData?.columns ?? [];
  const [localOverride, setLocalOverride] = useState<ColumnType[] | null>(null);
  const columns = localOverride ?? serverColumns;
  const [activeCard, setActiveCard] = useState<CardType | null>(null);
  const [addCardTarget, setAddCardTarget] = useState<string | null>(null);
  const [viewCard, setViewCard] = useState<CardType | null>(null);
  const searchParams = useSearchParams();
  const router = useRouter();

  const [filters, setFilters] = useState<ActiveFilters>(() => {
    const encoded = searchParams.get("filters");
    if (!encoded) return { labelIds: [], assigneeId: null, dueSoon: false, overdue: false };
    try {
      return JSON.parse(atob(encoded));
    } catch {
      return { labelIds: [], assigneeId: null, dueSoon: false, overdue: false };
    }
  });
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [shortcutsHelpOpen, setShortcutsHelpOpen] = useState(false);

  const { pushAction, undo, redo } = useUndoRedo();

  // Real-time sync
  useBoardChannel(boardId);

  // Clear local DnD override when fresh server data arrives
  useEffect(() => {
    setLocalOverride(null);
  }, [boardData]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  function findCard(id: string): CardType | undefined {
    for (const col of columns) {
      const card = col.cards.find((c) => c.id === id);
      if (card) return card;
    }
    return undefined;
  }

  function findColumnByCardId(cardId: string): ColumnType | undefined {
    return columns.find((col) => col.cards.some((c) => c.id === cardId));
  }

  function isColumnId(id: string): boolean {
    return columns.some((col) => col.id === id);
  }

  function handleDragStart(event: DragStartEvent) {
    const card = findCard(String(event.active.id));
    setActiveCard(card ?? null);
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;

    const activeId = String(active.id);
    const overId = String(over.id);

    if (activeId === overId) return;

    const activeColumn = findColumnByCardId(activeId);
    if (!activeColumn) return;

    const overColumnId = isColumnId(overId) ? overId : findColumnByCardId(overId)?.id;
    if (!overColumnId || overColumnId === activeColumn.id) return;

    const overColumn = columns.find((c) => c.id === overColumnId);
    let insertIndex = overColumn?.cards.length ?? 0;
    if (!isColumnId(overId)) {
      const idx = overColumn?.cards.findIndex((c) => c.id === overId) ?? -1;
      if (idx !== -1) insertIndex = idx;
    }

    const activeColIndex = columns.findIndex((c) => c.id === activeColumn.id);
    const overColIndex = columns.findIndex((c) => c.id === overColumnId);
    const activeCardIndex = columns[activeColIndex].cards.findIndex((c) => c.id === activeId);
    const draggedCard = columns[activeColIndex].cards[activeCardIndex];

    let idx = columns[overColIndex].cards.length;
    if (!isColumnId(overId)) {
      const oIdx = columns[overColIndex].cards.findIndex((c) => c.id === overId);
      if (oIdx !== -1) idx = oIdx;
    }

    setLocalOverride(columns.map((col, i) => {
      if (i === activeColIndex) return { ...col, cards: col.cards.filter((c) => c.id !== activeId) };
      if (i === overColIndex) {
        const newCards = [...col.cards];
        newCards.splice(idx, 0, draggedCard);
        return { ...col, cards: newCards };
      }
      return col;
    }));

    fetch("/api/cards/move", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cardId: activeId, targetColumnId: overColumnId, position: insertIndex }),
    }).catch(() => {
      queryClient.invalidateQueries({ queryKey: ["board", boardId] });
    });
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveCard(null);
    if (!over) return;

    const activeId = String(active.id);
    const overId = String(over.id);

    if (activeId === overId) return;

    const activeCol = columns.find((col) => col.cards.some((c) => c.id === activeId));
    const overCol = isColumnId(overId)
      ? columns.find((c) => c.id === overId)
      : columns.find((col) => col.cards.some((c) => c.id === overId));

    if (!activeCol || !overCol || activeCol.id !== overCol.id) return;

    const oldIndex = activeCol.cards.findIndex((c) => c.id === activeId);
    const newIndex = activeCol.cards.findIndex((c) => c.id === overId);

    if (oldIndex === -1 || newIndex === -1) return;

    const newCards = arrayMove(activeCol.cards, oldIndex, newIndex);

    setLocalOverride(columns.map((col) => (col.id !== activeCol.id ? col : { ...col, cards: newCards })));

    fetch("/api/cards/reorder", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ columnId: activeCol.id, cardIds: newCards.map((c) => c.id) }),
    }).catch(() => {
      queryClient.invalidateQueries({ queryKey: ["board", boardId] });
    });
  }

  async function addCard(columnId: string, title: string, details: string) {
    const res = await fetch("/api/cards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ columnId, title, details }),
    });
    if (!res.ok) { toast.error("Failed to add card"); return; }
    const card: CardType = await res.json();
    setLocalOverride(columns.map((col) => col.id === columnId ? { ...col, cards: [...col.cards, card] } : col));
  }

  const deleteCard = useCallback(async function deleteCard(columnId: string, cardId: string) {
    const col = columns.find((c) => c.id === columnId);
    const card = col?.cards.find((c) => c.id === cardId);
    if (!card) return;

    setLocalOverride(columns.map((c) =>
      c.id === columnId ? { ...c, cards: c.cards.filter((ca) => ca.id !== cardId) } : c
    ));

    const res = await fetch(`/api/cards/${cardId}`, { method: "DELETE" });
    if (!res.ok) {
      toast.error("Failed to delete card");
      queryClient.invalidateQueries({ queryKey: ["board", boardId] });
      return;
    }

    pushAction({
      execute: async () => {
        await fetch(`/api/cards/${cardId}`, { method: "DELETE" });
        queryClient.invalidateQueries({ queryKey: ["board", boardId] });
      },
      undo: async () => {
        await fetch("/api/cards", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ columnId, title: card.title, details: card.details }),
        });
        queryClient.invalidateQueries({ queryKey: ["board", boardId] });
      },
    });

    toast.success("Card deleted -- press Ctrl+Z to undo");
  }, [columns, queryClient, boardId, pushAction]);

  const updateCard = useCallback(async function updateCard(updated: CardType) {
    const res = await fetch(`/api/cards/${updated.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: updated.title, details: updated.details }),
    });
    if (!res.ok) { toast.error("Failed to save card"); return; }
    setLocalOverride(columns.map((col) => ({
      ...col,
      cards: col.cards.map((c) => (c.id === updated.id ? updated : c)),
    })));
    if (viewCard?.id === updated.id) setViewCard(updated);
  }, [viewCard]);

  const renameColumn = useCallback(async function renameColumn(columnId: string, newTitle: string) {
    setLocalOverride(columns.map((col) => (col.id === columnId ? { ...col, title: newTitle } : col)));
    const res = await fetch(`/api/columns/${columnId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newTitle }),
    });
    if (!res.ok) {
      toast.error("Failed to rename column");
      queryClient.invalidateQueries({ queryKey: ["board", boardId] });
    }
  }, [queryClient, boardId, columns]);

  const deleteColumn = useCallback(async function deleteColumn(columnId: string) {
    setLocalOverride(columns.filter((col) => col.id !== columnId));
    const res = await fetch(`/api/columns/${columnId}`, { method: "DELETE" });
    if (!res.ok) {
      toast.error("Failed to delete column");
      queryClient.invalidateQueries({ queryKey: ["board", boardId] });
    }
  }, [queryClient, boardId, columns]);

  async function addColumn() {
    const res = await fetch("/api/columns", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ boardId, title: "New Column" }),
    });
    if (!res.ok) { toast.error("Failed to add column"); return; }
    const newColumn = await res.json();
    setLocalOverride([...columns, { ...newColumn, cards: [] }]);
  }

  function handleFiltersChange(f: ActiveFilters) {
    setFilters(f);
    const hasFilters = f.labelIds.length > 0 || f.assigneeId !== null || f.dueSoon || f.overdue;
    if (hasFilters) {
      router.replace("?" + new URLSearchParams({ filters: btoa(JSON.stringify(f)) }).toString(), { scroll: false });
    } else {
      router.replace(window.location.pathname, { scroll: false });
    }
  }

  function handleSearchResultClick(result: SearchResult) {
    for (const col of columns) {
      const card = col.cards.find((c) => c.id === result.id);
      if (card) { setViewCard(card); return; }
    }
    setViewCard({
      id: result.id,
      title: result.title,
      details: result.details,
      dueDate: result.dueDate,
      labels: result.labels.map((l) => ({ cardId: result.id, labelId: l.labelId, label: l.label })),
      assignees: result.assignees.map((a) => ({ cardId: result.id, userId: a.userId, user: a.user })),
    });
  }

  const stableUndo = useCallback(() => { undo(); }, [undo]);
  const stableRedo = useCallback(() => { redo(); }, [redo]);

  const handleAddCard = useCallback((columnId: string) => setAddCardTarget(columnId), []);
  const handleViewCard = useCallback((card: CardType) => setViewCard(card), []);

  const hotkeys = useMemo(() => [
    {
      key: "n",
      handler: () => {
        if (columns.length > 0) setAddCardTarget(columns[0].id);
      },
    },
    {
      key: "/",
      handler: () => {
        const searchInput = document.querySelector<HTMLInputElement>("[data-search-input]");
        searchInput?.focus();
      },
    },
    {
      key: "k",
      modifiers: ["ctrl"],
      handler: () => setCommandPaletteOpen(true),
      allowInInput: false,
    },
    {
      key: "k",
      modifiers: ["meta"],
      handler: () => setCommandPaletteOpen(true),
      allowInInput: false,
    },
    {
      key: "?",
      handler: () => setShortcutsHelpOpen(true),
    },
    {
      key: "z",
      modifiers: ["ctrl"],
      handler: stableUndo,
      allowInInput: false,
    },
    {
      key: "z",
      modifiers: ["meta"],
      handler: stableUndo,
      allowInInput: false,
    },
    {
      key: "z",
      modifiers: ["ctrl", "shift"],
      handler: stableRedo,
      allowInInput: false,
    },
    {
      key: "z",
      modifiers: ["meta", "shift"],
      handler: stableRedo,
      allowInInput: false,
    },
    {
      key: "Escape",
      handler: () => {
        if (commandPaletteOpen) setCommandPaletteOpen(false);
        else if (shortcutsHelpOpen) setShortcutsHelpOpen(false);
        else if (viewCard) setViewCard(null);
        else if (addCardTarget) setAddCardTarget(null);
      },
      allowInInput: true,
    },
  // eslint-disable-next-line react-hooks/exhaustive-deps
  ], [stableUndo, stableRedo, columns, commandPaletteOpen, shortcutsHelpOpen, viewCard, addCardTarget]);

  useHotkeys(hotkeys);

  const filteredColumns = useMemo(() => applyFilters(columns, filters), [columns, filters]);
  const totalTasks = useMemo(() => columns.reduce((sum, col) => sum + col.cards.length, 0), [columns]);

  if (isLoading) {
    return (
      <div
        className="flex h-dvh items-center justify-center"
        style={{ position: "relative", zIndex: 1 }}
      >
        <span style={{ color: "var(--text-muted)", fontSize: 14 }}>Loading board...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="flex h-dvh items-center justify-center gap-4 flex-col"
        style={{ position: "relative", zIndex: 1 }}
      >
        <span style={{ color: "var(--text-muted)", fontSize: 14 }}>Failed to load board.</span>
        <Link href="/boards" style={{ color: "var(--accent)", fontSize: 14, fontWeight: 500 }}>Back to boards</Link>
      </div>
    );
  }

  const currentUserId = session?.user?.id ?? "";
  const currentUserRole = boardData?.ownerId === currentUserId ? "OWNER" : "EDITOR";

  return (
    <div className="flex flex-col min-h-dvh" style={{ position: "relative", zIndex: 1 }}>
      <BoardToolbar
        boardId={boardId}
        boardTitle={boardData?.title ?? "Board"}
        currentUserId={currentUserId}
        currentUserRole={currentUserRole}
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onSearchResultClick={handleSearchResultClick}
      />

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex-1 overflow-y-auto scrollbar-hide">
          <div className="board-content">
            {filteredColumns.map((col) => (
              <Column
                key={col.id}
                column={col}
                onAddCard={handleAddCard}
                onDeleteCard={deleteCard}
                onRenameColumn={renameColumn}
                onDeleteColumn={deleteColumn}
                onViewCard={handleViewCard}
              />
            ))}
            <div style={{ marginTop: 40, display: "flex", justifyContent: "center" }}>
              <button
                onClick={addColumn}
                style={{
                  border: "2px dashed var(--border-color)",
                  color: "var(--text-muted)",
                  background: "transparent",
                  cursor: "pointer",
                  padding: "12px 32px",
                  fontFamily: "var(--font-sans)",
                  fontSize: "13px",
                  fontWeight: 500,
                  transition: "all var(--transition-fast)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "var(--text-secondary)";
                  e.currentTarget.style.color = "var(--text-primary)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "var(--border-color)";
                  e.currentTarget.style.color = "var(--text-muted)";
                }}
                aria-label="Add column"
              >
                + Add Column
              </button>
            </div>
          </div>
        </div>
        <DragOverlay>
          {activeCard ? <CardOverlay card={activeCard} /> : null}
        </DragOverlay>
      </DndContext>

      <TitleBlockFooter
        projectName={boardData?.title ?? "Board"}
        taskCount={totalTasks}
      />

      {addCardTarget && (
        <AddCardModal
          onClose={() => setAddCardTarget(null)}
          onSubmit={(title, details) => addCard(addCardTarget, title, details)}
        />
      )}
      {viewCard && (
        <CardDetailModal
          card={viewCard}
          boardId={boardId}
          currentUserId={session?.user?.id ?? ""}
          onClose={() => setViewCard(null)}
          onSave={updateCard}
        />
      )}
      {commandPaletteOpen && (
        <CommandPalette
          boardId={boardId}
          columns={columns}
          onClose={() => setCommandPaletteOpen(false)}
          onNewCard={columns.length > 0 ? () => setAddCardTarget(columns[0].id) : undefined}
        />
      )}
      {shortcutsHelpOpen && (
        <ShortcutsHelp onClose={() => setShortcutsHelpOpen(false)} />
      )}
    </div>
  );
}
