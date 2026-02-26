"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Card as CardType } from "@/types";

interface CardProps {
  card: CardType;
  columnId: string;
  onDelete: (columnId: string, cardId: string) => void;
  onClick: (card: CardType) => void;
}

export default function Card({ card, columnId, onDelete, onClick }: CardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group relative bg-white rounded-lg shadow-sm p-3 cursor-grab active:cursor-grabbing border border-gray-100 hover:shadow-md transition-shadow"
      onClick={() => !isDragging && onClick(card)}
      {...attributes}
      {...listeners}
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete(columnId, card.id);
        }}
        onPointerDown={(e) => e.stopPropagation()}
        className="absolute top-2 right-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity w-5 h-5 rounded-full bg-gray-200 hover:bg-red-100 hover:text-red-600 flex items-center justify-center text-gray-500 text-xs"
        aria-label="Delete card"
      >
        x
      </button>
      <h3 className="font-semibold text-sm text-gray-900 pr-7 mb-1 leading-snug">
        {card.title}
      </h3>
      {card.details && (
        <p
          className="text-xs leading-relaxed line-clamp-2"
          style={{ color: "#888888" }}
        >
          {card.details}
        </p>
      )}
    </div>
  );
}
