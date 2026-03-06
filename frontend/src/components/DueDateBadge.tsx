"use client";

import { memo } from "react";
import { isToday, isTomorrow, isPast, differenceInDays, parseISO, format } from "date-fns";

interface DueDateBadgeProps {
  dueDate: string;
}

function DueDateBadge({ dueDate }: DueDateBadgeProps) {
  const date = parseISO(dueDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let label: string;
  let isUrgent = false;

  if (isToday(date)) {
    label = "Today";
    isUrgent = true;
  } else if (isTomorrow(date)) {
    label = "Tomorrow";
    isUrgent = true;
  } else if (isPast(date)) {
    label = `${format(date, "MMM d")} -- Overdue`;
    isUrgent = true;
  } else if (differenceInDays(date, today) <= 2) {
    label = format(date, "MMM d");
    isUrgent = true;
  } else {
    label = format(date, "MMM d");
  }

  return (
    <span
      style={{
        fontFamily: "var(--font-sans)",
        fontSize: 11,
        fontWeight: isUrgent ? 600 : 500,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        color: isUrgent ? "var(--accent)" : "var(--text-muted)",
      }}
    >
      {label}
    </span>
  );
}

export default memo(DueDateBadge);
