"use client";

import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { signOut } from "next-auth/react";
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
import type { Column as ColumnType, Card as CardType } from "@/types";
import { useBoard } from "@/hooks/useBoard";
import Column from "./Column";
import AddCardModal from "./AddCardModal";
import CardDetailModal from "./CardDetailModal";

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

export default function Board({ boardId }: BoardProps) {
  const queryClient = useQueryClient();
  const { data: boardData, isLoading, error } = useBoard(boardId);
  const [columns, setColumns] = useState<ColumnType[]>([]);
  const [activeCard, setActiveCard] = useState<CardType | null>(null);
  const [addCardTarget, setAddCardTarget] = useState<string | null>(null);
  const [viewCard, setViewCard] = useState<CardType | null>(null);

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
    setColumns((cols) =>
      cols.map((col) =>
        col.id === columnId ? { ...col, cards: col.cards.filter((c) => c.id !== cardId) } : col
      )
    );
    const res = await fetch(`/api/cards/${cardId}`, { method: "DELETE" });
    if (!res.ok) {
      toast.error("Failed to delete card");
      queryClient.invalidateQueries({ queryKey: ["board", boardId] });
    }
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

  return (
    <div className="flex flex-col h-dvh" style={{ background: "#032147" }}>
      {/* Header */}
      <header className="flex items-center justify-between px-4 sm:px-8 py-4 border-b border-white/10 flex-shrink-0">
        <div className="flex items-center gap-3">
          <Link href="/boards" className="text-white/60 hover:text-white transition-colors mr-1" title="All boards">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </Link>
          <div className="w-1 h-8 rounded-full" style={{ background: "#ecad0a" }} />
          <h1 className="text-xl font-bold text-white tracking-tight truncate max-w-xs sm:max-w-md">
            {boardData?.title ?? "Board"}
          </h1>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="text-sm text-white/60 hover:text-white transition-colors"
        >
          Sign out
        </button>
      </header>

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
            {columns.map((col) => (
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
          onClose={() => setViewCard(null)}
          onSave={updateCard}
        />
      )}
    </div>
  );
}
