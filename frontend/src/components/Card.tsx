"use client";

import { memo, useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { isPast, isToday, isTomorrow, differenceInDays, parseISO } from "date-fns";
import type { Card as CardType } from "@/types";
import ConfirmDialog from "./ConfirmDialog";
import LabelChip from "./LabelChip";
import UserAvatar from "./UserAvatar";
import DueDateBadge from "./DueDateBadge";

const paddingMap = {
  "card-sm": "12px 16px",
  "card-md": "16px 20px",
  "card-lg": "24px 28px",
};

const titleSizeMap = {
  "card-sm": 15,
  "card-md": 18,
  "card-lg": 18,
};

function getCardSize(card: CardType): "card-sm" | "card-md" | "card-lg" {
  const hasDescription = !!card.details?.trim();
  const labelCount = card.labels?.length ?? 0;
  const descLength = card.details?.length ?? 0;

  if (hasDescription && descLength > 100) return "card-lg";
  if (hasDescription || labelCount >= 2) return "card-md";
  return "card-sm";
}

interface CardProps {
  card: CardType;
  columnId: string;
  onDelete: (columnId: string, cardId: string) => void;
  onClick: (card: CardType) => void;
}

function isUrgentDate(dueDate: string | null | undefined): boolean {
  if (!dueDate) return false;
  const date = parseISO(dueDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return isPast(date) || isToday(date) || isTomorrow(date) || differenceInDays(date, today) <= 2;
}

function Card({ card, columnId, onDelete, onClick }: CardProps) {
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
  const urgent = isUrgentDate(card.dueDate);
  const cardSize = getCardSize(card);

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        className={`${cardSize} editorial-card group relative cursor-grab active:cursor-grabbing flex flex-col${urgent ? " editorial-card-urgent" : ""}`}
        onClick={() => !isDragging && onClick(card)}
        {...attributes}
        {...listeners}
      >
        <div
          className="editorial-card-inner flex flex-col"
          style={{ padding: paddingMap[cardSize], height: "100%" }}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              setConfirmDelete(true);
            }}
            onPointerDown={(e) => e.stopPropagation()}
            className="btn-icon absolute top-2 right-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity w-5 h-5 flex items-center justify-center text-xs hover:text-[var(--accent-danger)]"
            aria-label="Delete card"
            style={{ zIndex: 2 }}
          >
            x
          </button>

          {/* Labels */}
          {(card.labels?.length ?? 0) > 0 && (
            <div className="flex gap-2 flex-wrap mb-2">
              {(card.labels ?? []).slice(0, 3).map((cl) => (
                <LabelChip key={cl.labelId} label={cl.label} size="sm" />
              ))}
            </div>
          )}

          <h3
            className="mb-1"
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: titleSizeMap[cardSize],
              fontWeight: 400,
              lineHeight: cardSize === "card-sm" ? 1.35 : 1.3,
              color: "var(--text-primary)",
              paddingRight: 24,
            }}
          >
            {card.title}
          </h3>

          {card.details && (
            <p
              className="editorial-card-description line-clamp-2 mb-2"
              style={{
                fontSize: 13,
                color: "var(--text-secondary)",
                lineHeight: 1.6,
                flex: cardSize === "card-lg" ? 1 : undefined,
              }}
            >
              {card.details}
            </p>
          )}

          {hasFooter && (
            <div
              className="flex items-center gap-2 flex-wrap mt-auto"
              style={{
                borderTop: cardSize === "card-sm" ? "none" : "1px solid var(--border-light)",
                paddingTop: cardSize === "card-sm" ? 6 : 10,
                marginTop: cardSize === "card-sm" ? 4 : 10,
              }}
            >
              {card.dueDate && <DueDateBadge dueDate={card.dueDate} />}
              {visibleAssignees.length > 0 && (
                <div className="flex -space-x-1 ml-auto">
                  {visibleAssignees.map((a) => (
                    <UserAvatar key={a.userId} user={a.user} size="sm" />
                  ))}
                  {overflowCount > 0 && (
                    <span
                      className="flex items-center justify-center font-medium select-none"
                      style={{
                        width: 24,
                        height: 24,
                        fontSize: 10,
                        background: "var(--bg-surface)",
                        color: "var(--text-muted)",
                        border: "1px solid var(--border-color)",
                      }}
                    >
                      +{overflowCount}
                    </span>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
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

export default memo(Card);
