"use client";

import { isToday, isTomorrow, isPast, differenceInDays, parseISO, format } from "date-fns";

interface DueDateBadgeProps {
  dueDate: string;
}

export default function DueDateBadge({ dueDate }: DueDateBadgeProps) {
  const date = parseISO(dueDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let label: string;
  let color: string;

  if (isToday(date)) {
    label = "Today";
    color = "#ecad0a";
  } else if (isTomorrow(date)) {
    label = "Tomorrow";
    color = "#ecad0a";
  } else if (isPast(date)) {
    label = format(date, "MMM d");
    color = "#ef4444";
  } else if (differenceInDays(date, today) <= 2) {
    label = format(date, "MMM d");
    color = "#ecad0a";
  } else {
    label = format(date, "MMM d");
    color = "#888888";
  }

  return (
    <span
      className="inline-flex items-center text-xs font-medium px-1.5 py-0.5 rounded"
      style={{ color, background: `${color}18` }}
    >
      {label}
    </span>
  );
}
