"use client";

import { useState } from "react";
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
import { initialColumns } from "@/data/dummy";
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

export default function Board() {
  const [columns, setColumns] = useState<ColumnType[]>(initialColumns);
  const [activeCard, setActiveCard] = useState<CardType | null>(null);
  const [addCardTarget, setAddCardTarget] = useState<string | null>(null);
  const [viewCard, setViewCard] = useState<CardType | null>(null);

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

    setColumns((cols) => {
      const activeColIndex = cols.findIndex((c) => c.id === activeColumn.id);
      const overColIndex = cols.findIndex((c) => c.id === overColumnId);

      const activeCardIndex = cols[activeColIndex].cards.findIndex(
        (c) => c.id === activeId
      );
      const draggedCard = cols[activeColIndex].cards[activeCardIndex];

      let insertIndex = cols[overColIndex].cards.length;
      if (!isColumnId(overId)) {
        const overCardIndex = cols[overColIndex].cards.findIndex(
          (c) => c.id === overId
        );
        if (overCardIndex !== -1) insertIndex = overCardIndex;
      }

      const newCols = cols.map((col, i) => {
        if (i === activeColIndex) {
          return {
            ...col,
            cards: col.cards.filter((c) => c.id !== activeId),
          };
        }
        if (i === overColIndex) {
          const newCards = [...col.cards];
          newCards.splice(insertIndex, 0, draggedCard);
          return { ...col, cards: newCards };
        }
        return col;
      });

      return newCols;
    });
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveCard(null);
    if (!over) return;

    const activeId = String(active.id);
    const overId = String(over.id);

    if (activeId === overId) return;

    setColumns((cols) => {
      const activeCol = cols.find((col) =>
        col.cards.some((c) => c.id === activeId)
      );
      const overCol = isColumnId(overId)
        ? cols.find((c) => c.id === overId)
        : cols.find((col) => col.cards.some((c) => c.id === overId));

      if (!activeCol || !overCol || activeCol.id !== overCol.id) return cols;

      const oldIndex = activeCol.cards.findIndex((c) => c.id === activeId);
      const newIndex = activeCol.cards.findIndex((c) => c.id === overId);

      if (oldIndex === -1 || newIndex === -1) return cols;

      return cols.map((col) => {
        if (col.id !== activeCol.id) return col;
        return { ...col, cards: arrayMove(col.cards, oldIndex, newIndex) };
      });
    });
  }

  function addCard(columnId: string, title: string, details: string) {
    const newCard: CardType = {
      id: `card-${Date.now()}`,
      title,
      details,
    };
    setColumns((cols) =>
      cols.map((col) =>
        col.id === columnId ? { ...col, cards: [...col.cards, newCard] } : col
      )
    );
  }

  function deleteCard(columnId: string, cardId: string) {
    setColumns((cols) =>
      cols.map((col) =>
        col.id === columnId
          ? { ...col, cards: col.cards.filter((c) => c.id !== cardId) }
          : col
      )
    );
  }

  function renameColumn(columnId: string, newTitle: string) {
    setColumns((cols) =>
      cols.map((col) =>
        col.id === columnId ? { ...col, title: newTitle } : col
      )
    );
  }

  return (
    <div className="flex flex-col h-dvh" style={{ background: "#032147" }}>
      {/* Header */}
      <header className="flex items-center px-4 sm:px-8 py-4 border-b border-white/10 flex-shrink-0">
        <div
          className="w-1 h-8 rounded-full mr-3"
          style={{ background: "#ecad0a" }}
        />
        <h1 className="text-2xl font-bold text-white tracking-tight">
          Kanban Board
        </h1>
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
                onViewCard={(card) => setViewCard(card)}
              />
            ))}
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
        />
      )}
    </div>
  );
}
