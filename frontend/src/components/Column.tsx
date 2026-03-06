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
  onDeleteColumn: (columnId: string) => void;
  onViewCard: (card: CardType) => void;
}

export default function Column({
  column,
  onAddCard,
  onDeleteCard,
  onRenameColumn,
  onDeleteColumn,
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
    <div style={{ marginBottom: 56 }}>
      {/* Category header */}
      <div className="flex items-baseline gap-3 mb-1">
        {isEditing ? (
          <input
            autoFocus
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={saveRename}
            onKeyDown={handleKeyDown}
            className="flex-1 min-w-0 bg-transparent focus:outline-none border-b border-[var(--accent)]"
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: 32,
              fontWeight: 400,
              color: "var(--text-primary)",
              lineHeight: 1.2,
            }}
          />
        ) : (
          <div
            className="category-marker flex items-baseline gap-3 flex-1 min-w-0 cursor-pointer"
            onDoubleClick={() => {
              setEditValue(column.title);
              setIsEditing(true);
            }}
          >
            <h2
              className="truncate"
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: 32,
                fontWeight: 400,
                color: "var(--text-primary)",
                lineHeight: 1.2,
              }}
            >
              {column.title}
            </h2>
            <span
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: 24,
                fontWeight: 400,
                color: "var(--text-muted)",
                lineHeight: 1.2,
                flexShrink: 0,
              }}
            >
              {column.cards.length}
            </span>
          </div>
        )}

        {/* Column controls */}
        <div className="flex items-center gap-0.5 flex-shrink-0 ml-2">
          <button
            onClick={() => {
              setEditValue(column.title);
              setIsEditing(true);
            }}
            className="btn-icon"
            aria-label="Rename column"
            title="Rename column"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </button>
          <button
            onClick={() => onDeleteColumn(column.id)}
            className="btn-icon hover:text-[var(--accent-danger)]"
            aria-label="Delete column"
            title="Delete column"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
              <path d="M10 11v6M14 11v6" />
              <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
            </svg>
          </button>
        </div>
      </div>

      {/* Chain-line divider */}
      <hr className="category-rule" />

      {/* Cards grid */}
      <div ref={setNodeRef} className="card-grid">
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

      {/* Add card link */}
      <div style={{ marginTop: 12 }}>
        <button
          onClick={() => onAddCard(column.id)}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            fontFamily: "var(--font-sans)",
            fontSize: "13px",
            fontWeight: 500,
            color: "var(--text-muted)",
            padding: "4px 0",
            transition: "color var(--transition-fast)",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = "var(--accent)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text-muted)"; }}
        >
          + Add Card
        </button>
      </div>
    </div>
  );
}
