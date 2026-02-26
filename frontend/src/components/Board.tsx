"use client";

import { useState, useEffect, useCallback } from "react";
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

function CardOverlay({ card }: { card: CardType }) {
  return (
    <div
      className="bg-white rounded-lg shadow-xl p-3 border border-gray-100 rotate-2 scale-105 w-[85vw] sm:w-72"
      style={{ opacity: 0.9 }}
    >
      <h3 className="font-semibold text-sm text-gray-900 pr-6 mb-1 leading-snug">
        {card.title}
      </h3>
      {card.details && (
        <p className="text-xs leading-relaxed line-clamp-2" style={{ color: "#888888" }}>
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
  const [columns, setColumns] = useState<ColumnType[]>([]);
  const [activeCard, setActiveCard] = useState<CardType | null>(null);
  const [addCardTarget, setAddCardTarget] = useState<string | null>(null);
  const [viewCard, setViewCard] = useState<CardType | null>(null);
  const searchParams = useSearchParams();
  const router = useRouter();

  const initialFilters: ActiveFilters = (() => {
    const encoded = searchParams.get("filters");
    if (!encoded) return { labelIds: [], assigneeId: null, dueSoon: false, overdue: false };
    try {
      return JSON.parse(atob(encoded));
    } catch {
      return { labelIds: [], assigneeId: null, dueSoon: false, overdue: false };
    }
  })();

  const [filters, setFilters] = useState<ActiveFilters>(initialFilters);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [shortcutsHelpOpen, setShortcutsHelpOpen] = useState(false);

  const { pushAction, undo, redo } = useUndoRedo();

  // Real-time sync
  useBoardChannel(boardId);

  useEffect(() => {
    if (boardData) setColumns(boardData.columns);
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

    setColumns((cols) => {
      const activeColIndex = cols.findIndex((c) => c.id === activeColumn.id);
      const overColIndex = cols.findIndex((c) => c.id === overColumnId);
      const activeCardIndex = cols[activeColIndex].cards.findIndex((c) => c.id === activeId);
      const draggedCard = cols[activeColIndex].cards[activeCardIndex];

      let idx = cols[overColIndex].cards.length;
      if (!isColumnId(overId)) {
        const oIdx = cols[overColIndex].cards.findIndex((c) => c.id === overId);
        if (oIdx !== -1) idx = oIdx;
      }

      return cols.map((col, i) => {
        if (i === activeColIndex) return { ...col, cards: col.cards.filter((c) => c.id !== activeId) };
        if (i === overColIndex) {
          const newCards = [...col.cards];
          newCards.splice(idx, 0, draggedCard);
          return { ...col, cards: newCards };
        }
        return col;
      });
    });

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

    setColumns((cols) =>
      cols.map((col) => (col.id !== activeCol.id ? col : { ...col, cards: newCards }))
    );

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
    setColumns((cols) =>
      cols.map((col) => col.id === columnId ? { ...col, cards: [...col.cards, card] } : col)
    );
  }

  async function deleteCard(columnId: string, cardId: string) {
    const col = columns.find((c) => c.id === columnId);
    const card = col?.cards.find((c) => c.id === cardId);
    if (!card) return;

    setColumns((cols) =>
      cols.map((c) =>
        c.id === columnId ? { ...c, cards: c.cards.filter((ca) => ca.id !== cardId) } : c
      )
    );

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

    toast.success("Card deleted — press Ctrl+Z to undo");
  }

  async function updateCard(updated: CardType) {
    const res = await fetch(`/api/cards/${updated.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: updated.title, details: updated.details }),
    });
    if (!res.ok) { toast.error("Failed to save card"); return; }
    setColumns((cols) =>
      cols.map((col) => ({
        ...col,
        cards: col.cards.map((c) => (c.id === updated.id ? updated : c)),
      }))
    );
    if (viewCard?.id === updated.id) setViewCard(updated);
  }

  async function renameColumn(columnId: string, newTitle: string) {
    setColumns((cols) =>
      cols.map((col) => (col.id === columnId ? { ...col, title: newTitle } : col))
    );
    const res = await fetch(`/api/columns/${columnId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newTitle }),
    });
    if (!res.ok) {
      toast.error("Failed to rename column");
      queryClient.invalidateQueries({ queryKey: ["board", boardId] });
    }
  }

  async function deleteColumn(columnId: string) {
    setColumns((cols) => cols.filter((col) => col.id !== columnId));
    const res = await fetch(`/api/columns/${columnId}`, { method: "DELETE" });
    if (!res.ok) {
      toast.error("Failed to delete column");
      queryClient.invalidateQueries({ queryKey: ["board", boardId] });
    }
  }

  async function addColumn() {
    const res = await fetch("/api/columns", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ boardId, title: "New Column" }),
    });
    if (!res.ok) { toast.error("Failed to add column"); return; }
    const newColumn = await res.json();
    setColumns((cols) => [...cols, { ...newColumn, cards: [] }]);
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
    // Find the card in the columns
    for (const col of columns) {
      const card = col.cards.find((c) => c.id === result.id);
      if (card) { setViewCard(card); return; }
    }
    // If filtered out, open with the result data mapped to Card type
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

  useHotkeys([
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
  ]);

  if (isLoading) {
    return (
      <div className="flex h-dvh items-center justify-center" style={{ background: "#032147" }}>
        <span className="text-white/60 text-sm">Loading board...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-dvh items-center justify-center gap-4 flex-col" style={{ background: "#032147" }}>
        <span className="text-white/60 text-sm">Failed to load board.</span>
        <Link href="/boards" className="text-sm font-medium" style={{ color: "#209dd7" }}>Back to boards</Link>
      </div>
    );
  }

  const currentUserId = session?.user?.id ?? "";
  // Determine current user role: if board owner, OWNER; else check members
  const currentUserRole = boardData?.ownerId === currentUserId ? "OWNER" : "EDITOR";

  const filteredColumns = applyFilters(columns, filters);

  return (
    <div className="flex flex-col h-dvh" style={{ background: "#032147" }}>
      <BoardToolbar
        boardId={boardId}
        boardTitle={boardData?.title ?? "Board"}
        currentUserId={currentUserId}
        currentUserRole={currentUserRole}
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onSearchResultClick={handleSearchResultClick}
      />

      {/* Board */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex-1 overflow-x-auto overflow-y-hidden scrollbar-hide snap-x snap-mandatory">
          <div className="flex gap-4 sm:gap-5 p-4 sm:p-6 h-full items-stretch">
            {filteredColumns.map((col) => (
              <Column
                key={col.id}
                column={col}
                onAddCard={(columnId) => setAddCardTarget(columnId)}
                onDeleteCard={deleteCard}
                onRenameColumn={renameColumn}
                onDeleteColumn={deleteColumn}
                onViewCard={(card) => setViewCard(card)}
              />
            ))}
            <div className="flex-shrink-0 flex items-start pt-1 snap-center">
              <button
                onClick={addColumn}
                className="flex flex-col items-center justify-center w-16 h-16 rounded-xl border-2 border-dashed border-white/30 text-white/70 hover:border-white/60 hover:text-white transition-colors"
                aria-label="Add column"
              >
                <span className="text-2xl leading-none">+</span>
                <span className="text-xs mt-1">Column</span>
              </button>
            </div>
          </div>
        </div>
        <DragOverlay>
          {activeCard ? <CardOverlay card={activeCard} /> : null}
        </DragOverlay>
      </DndContext>

      {/* Modals */}
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
