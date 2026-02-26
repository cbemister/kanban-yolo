"use client";

import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Card as CardType } from "@/types";
import ConfirmDialog from "./ConfirmDialog";
import LabelChip from "./LabelChip";
import UserAvatar from "./UserAvatar";
import DueDateBadge from "./DueDateBadge";

interface CardProps {
  card: CardType;
  columnId: string;
  onDelete: (columnId: string, cardId: string) => void;
  onClick: (card: CardType) => void;
}

export default function Card({ card, columnId, onDelete, onClick }: CardProps) {
  const [confirmDelete, setConfirmDelete] = useState(false);

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

  const visibleAssignees = (card.assignees ?? []).slice(0, 3);
  const overflowCount = (card.assignees?.length ?? 0) - 3;
  const hasFooter = (card.labels?.length ?? 0) > 0 || (card.assignees?.length ?? 0) > 0 || card.dueDate;

  return (
    <>
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
            setConfirmDelete(true);
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
          <p className="text-xs leading-relaxed line-clamp-2 mb-2" style={{ color: "#888888" }}>
            {card.details}
          </p>
        )}

        {hasFooter && (
          <div className="flex items-center gap-2 flex-wrap mt-1">
            {card.dueDate && <DueDateBadge dueDate={card.dueDate} />}
            {(card.labels ?? []).slice(0, 3).map((cl) => (
              <LabelChip key={cl.labelId} label={cl.label} size="sm" />
            ))}
            {visibleAssignees.length > 0 && (
              <div className="flex -space-x-1 ml-auto">
                {visibleAssignees.map((a) => (
                  <UserAvatar key={a.userId} user={a.user} size="sm" />
                ))}
                {overflowCount > 0 && (
                  <span
                    className="w-6 h-6 rounded-full bg-gray-200 text-gray-600 text-xs flex items-center justify-center font-medium"
                  >
                    +{overflowCount}
                  </span>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {confirmDelete && (
        <ConfirmDialog
          title="Delete card"
          message={`Are you sure you want to delete "${card.title}"?`}
          onConfirm={() => {
            onDelete(columnId, card.id);
            setConfirmDelete(false);
          }}
          onCancel={() => setConfirmDelete(false)}
        />
      )}
    </>
  );
}
