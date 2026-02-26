"use client";

import { useState, useRef, useEffect } from "react";
import { useLabels } from "@/hooks/useLabels";
import { useMembers } from "@/hooks/useMembers";
import type { ActiveFilters } from "@/types";
import LabelChip from "./LabelChip";
import UserAvatar from "./UserAvatar";

interface FilterBarProps {
  boardId: string;
  filters: ActiveFilters;
  onChange: (f: ActiveFilters) => void;
}

export default function FilterBar({ boardId, filters, onChange }: FilterBarProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { data: labels = [] } = useLabels(boardId);
  const { data: members = [] } = useMembers(boardId);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const activeCount =
    filters.labelIds.length +
    (filters.assigneeId ? 1 : 0) +
    (filters.dueSoon ? 1 : 0) +
    (filters.overdue ? 1 : 0);

  function toggleLabel(labelId: string) {
    const newIds = filters.labelIds.includes(labelId)
      ? filters.labelIds.filter((id) => id !== labelId)
      : [...filters.labelIds, labelId];
    onChange({ ...filters, labelIds: newIds });
  }

  function toggleAssignee(userId: string) {
    onChange({ ...filters, assigneeId: filters.assigneeId === userId ? null : userId });
  }

  function clearAll() {
    onChange({ labelIds: [], assigneeId: null, dueSoon: false, overdue: false });
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg border border-white/20 bg-white/10 text-white/80 hover:text-white hover:bg-white/20 transition-colors"
      >
        <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path d="M3 6h18M7 12h10M11 18h2" strokeLinecap="round" />
        </svg>
        Filter
        {activeCount > 0 && (
          <span
            className="w-5 h-5 rounded-full text-white text-xs flex items-center justify-center font-bold"
            style={{ background: "#ecad0a" }}
          >
            {activeCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-1 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-20 p-3">
          {labels.length > 0 && (
            <div className="mb-3">
              <p className="text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: "#888888" }}>Labels</p>
              <div className="flex flex-wrap gap-1.5">
                {labels.map((label) => (
                  <button
                    key={label.id}
                    type="button"
                    onClick={() => toggleLabel(label.id)}
                    className={`transition-opacity ${filters.labelIds.includes(label.id) ? "opacity-100 ring-2 ring-offset-1" : "opacity-60 hover:opacity-90"}`}
                    style={{ "--tw-ring-color": "#753991" } as React.CSSProperties}
                  >
                    <LabelChip label={label} size="sm" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {members.length > 1 && (
            <div className="mb-3">
              <p className="text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: "#888888" }}>Assignee</p>
              <div className="space-y-1">
                {members.map((member) => (
                  <button
                    key={member.userId}
                    type="button"
                    onClick={() => toggleAssignee(member.userId)}
                    className={`flex items-center gap-2 w-full px-2 py-1 rounded-lg transition-colors ${
                      filters.assigneeId === member.userId ? "bg-purple-50" : "hover:bg-gray-50"
                    }`}
                  >
                    <UserAvatar user={member.user} size="sm" />
                    <span className="text-sm text-gray-700 truncate">{member.user.name ?? member.user.email}</span>
                    {filters.assigneeId === member.userId && (
                      <span className="ml-auto text-xs font-bold" style={{ color: "#753991" }}>x</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mb-3">
            <p className="text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: "#888888" }}>Due Date</p>
            <div className="space-y-1">
              <button
                type="button"
                onClick={() => onChange({ ...filters, overdue: !filters.overdue })}
                className={`flex items-center gap-2 w-full px-2 py-1 rounded-lg text-sm transition-colors ${
                  filters.overdue ? "bg-red-50 text-red-600" : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                Overdue
                {filters.overdue && <span className="ml-auto font-bold text-xs">x</span>}
              </button>
              <button
                type="button"
                onClick={() => onChange({ ...filters, dueSoon: !filters.dueSoon })}
                className={`flex items-center gap-2 w-full px-2 py-1 rounded-lg text-sm transition-colors ${
                  filters.dueSoon ? "bg-yellow-50" : "text-gray-700 hover:bg-gray-50"
                }`}
                style={filters.dueSoon ? { color: "#ecad0a" } : {}}
              >
                Due soon (2 days)
                {filters.dueSoon && <span className="ml-auto font-bold text-xs">x</span>}
              </button>
            </div>
          </div>

          {activeCount > 0 && (
            <button
              type="button"
              onClick={clearAll}
              className="w-full text-center text-xs font-medium py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
              style={{ color: "#888888" }}
            >
              Clear all filters
            </button>
          )}
        </div>
      )}
    </div>
  );
}
