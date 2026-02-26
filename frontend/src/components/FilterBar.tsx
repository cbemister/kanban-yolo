"use client";

import { useState, useRef, useEffect } from "react";
import { useLabels } from "@/hooks/useLabels";
import { useMembers } from "@/hooks/useMembers";
import type { ActiveFilters, SavedFilter } from "@/types";
import LabelChip from "./LabelChip";
import UserAvatar from "./UserAvatar";

interface FilterBarProps {
  boardId: string;
  filters: ActiveFilters;
  onChange: (f: ActiveFilters) => void;
}

export default function FilterBar({ boardId, filters, onChange }: FilterBarProps) {
  const [open, setOpen] = useState(false);
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>([]);
  const [savingName, setSavingName] = useState("");
  const [showSaveInput, setShowSaveInput] = useState(false);
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

  useEffect(() => {
    if (!open) return;
    fetch(`/api/boards/${boardId}/saved-filters`)
      .then((r) => r.json())
      .then(setSavedFilters)
      .catch(() => {});
  }, [open, boardId]);

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

  async function saveFilter() {
    const name = savingName.trim();
    if (!name) return;
    const res = await fetch(`/api/boards/${boardId}/saved-filters`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, filters }),
    });
    if (res.ok) {
      const saved: SavedFilter = await res.json();
      setSavedFilters((prev) => [saved, ...prev]);
      setSavingName("");
      setShowSaveInput(false);
    }
  }

  async function deleteFilter(id: string) {
    await fetch(`/api/saved-filters/${id}`, { method: "DELETE" });
    setSavedFilters((prev) => prev.filter((f) => f.id !== id));
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
        <div className="absolute left-0 top-full mt-1 w-72 bg-white border border-gray-200 rounded-lg shadow-lg z-20 p-3 max-h-[80vh] overflow-y-auto">
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
              className="w-full text-center text-xs font-medium py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors mb-3"
              style={{ color: "#888888" }}
            >
              Clear all filters
            </button>
          )}

          {/* Saved Filters */}
          <div className="border-t border-gray-100 pt-3">
            <p className="text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: "#888888" }}>Saved Filters</p>

            {savedFilters.length > 0 && (
              <div className="space-y-1 mb-2">
                {savedFilters.map((sf) => (
                  <div key={sf.id} className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => { onChange(sf.filters); setOpen(false); }}
                      className="flex-1 text-left text-sm px-2 py-1 rounded hover:bg-gray-50 truncate"
                      style={{ color: "#032147" }}
                    >
                      {sf.name}
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteFilter(sf.id)}
                      className="text-xs text-red-400 hover:text-red-600 flex-shrink-0 px-1"
                      aria-label="Delete saved filter"
                    >
                      x
                    </button>
                  </div>
                ))}
              </div>
            )}

            {activeCount > 0 && !showSaveInput && (
              <button
                type="button"
                onClick={() => setShowSaveInput(true)}
                className="w-full text-left text-xs px-2 py-1 rounded hover:bg-gray-50 transition-colors"
                style={{ color: "#209dd7" }}
              >
                + Save current filter
              </button>
            )}

            {showSaveInput && (
              <div className="flex gap-1 mt-1">
                <input
                  autoFocus
                  type="text"
                  value={savingName}
                  onChange={(e) => setSavingName(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") saveFilter(); if (e.key === "Escape") { setShowSaveInput(false); setSavingName(""); } }}
                  placeholder="Filter name"
                  className="flex-1 border border-gray-200 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1"
                  style={{ "--tw-ring-color": "#209dd7" } as React.CSSProperties}
                />
                <button
                  type="button"
                  onClick={saveFilter}
                  className="text-xs px-2 py-1 rounded text-white"
                  style={{ background: "#753991" }}
                >
                  Save
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
