"use client";

import { useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import type { Column as ColumnType, Card as CardType } from "@/types";
import Card from "./Card";

interface ColumnProps {
  column: ColumnType;
  onAddCard: (columnId: string) => void;
  onDeleteCard: (columnId: string, cardId: string) => void;
  onRenameColumn: (columnId: string, newTitle: string) => void;
  onViewCard: (card: CardType) => void;
}

export default function Column({
  column,
  onAddCard,
  onDeleteCard,
  onRenameColumn,
  onViewCard,
}: ColumnProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(column.title);

  const { setNodeRef } = useDroppable({ id: column.id });

  function saveRename() {
    const trimmed = editValue.trim();
    if (trimmed) {
      onRenameColumn(column.id, trimmed);
    } else {
      setEditValue(column.title);
    }
    setIsEditing(false);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") saveRename();
    if (e.key === "Escape") {
      setEditValue(column.title);
      setIsEditing(false);
    }
  }

  const cardIds = column.cards.map((c) => c.id);

  return (
    <div
      className="flex flex-col w-[85vw] sm:w-72 flex-shrink-0 rounded-xl shadow-lg overflow-hidden snap-center h-full"
      style={{ background: "#f8f9fa" }}
    >
      {/* Yellow accent top bar */}
      <div className="h-1 w-full flex-shrink-0" style={{ background: "#ecad0a" }} />

      {/* Column header */}
      <div className="px-4 pt-3 pb-2 flex items-center justify-between flex-shrink-0">
        {isEditing ? (
          <input
            autoFocus
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={saveRename}
            onKeyDown={handleKeyDown}
            className="font-semibold text-sm uppercase tracking-wide border-b border-blue-400 bg-transparent focus:outline-none flex-1 mr-2"
            style={{ color: "#032147" }}
          />
        ) : (
          <div
            className="flex items-center gap-2 cursor-pointer flex-1 min-w-0"
            onDoubleClick={() => {
              setEditValue(column.title);
              setIsEditing(true);
            }}
          >
            <h2
              className="font-semibold text-sm uppercase tracking-wide truncate"
              style={{ color: "#032147" }}
            >
              {column.title}
            </h2>
            <span className="text-xs px-1.5 py-0.5 rounded-full bg-gray-200 text-gray-600 flex-shrink-0">
              {column.cards.length}
            </span>
          </div>
        )}
        <button
          onClick={() => {
            setEditValue(column.title);
            setIsEditing(true);
          }}
          className="ml-2 flex-shrink-0 p-1 rounded hover:bg-gray-200 transition-colors opacity-0 hover:opacity-100 group-hover:opacity-100"
          aria-label="Rename column"
          title="Rename column"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#888888"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
        </button>
      </div>

      {/* Cards area */}
      <div
        ref={setNodeRef}
        className="flex-1 overflow-y-auto scrollbar-hide px-3 py-2 flex flex-col gap-2"
      >
        <SortableContext items={cardIds} strategy={verticalListSortingStrategy}>
          {column.cards.map((card) => (
            <Card
              key={card.id}
              card={card}
              columnId={column.id}
              onDelete={onDeleteCard}
              onClick={onViewCard}
            />
          ))}
        </SortableContext>
      </div>

      {/* Add card button */}
      <div className="p-3 border-t border-gray-200 flex-shrink-0">
        <button
          onClick={() => onAddCard(column.id)}
          className="w-full py-2 rounded-lg text-sm font-medium text-white transition-opacity hover:opacity-90"
          style={{ background: "#753991" }}
        >
          + Add Card
        </button>
      </div>
    </div>
  );
}
