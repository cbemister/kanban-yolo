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
  const { data: labels = [] } = useLabels(boardId, { enabled: open });
  const { data: members = [] } = useMembers(boardId, { enabled: open });

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
    <div ref={ref} style={{ position: "relative" }}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="btn btn-secondary btn-sm"
        style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
      >
        <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path d="M3 6h18M7 12h10M11 18h2" strokeLinecap="round" />
        </svg>
        Filter
        {activeCount > 0 && (
          <span
            style={{
              width: "16px",
              height: "16px",
              background: "var(--accent)",
              color: "#ffffff",
              fontSize: "10px",
              fontWeight: 700,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            {activeCount}
          </span>
        )}
      </button>

      {open && (
        <div
          className="dropdown-panel"
          style={{
            top: "100%",
            left: 0,
            marginTop: "4px",
            width: "288px",
            padding: "12px",
            maxHeight: "80vh",
            overflowY: "auto",
          }}
        >
          {labels.length > 0 && (
            <div style={{ marginBottom: "12px" }}>
              <p className="text-section-title" style={{ marginBottom: "8px" }}>Labels</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {labels.map((label) => (
                  <button
                    key={label.id}
                    type="button"
                    onClick={() => toggleLabel(label.id)}
                    style={{
                      background: "transparent",
                      border: "none",
                      padding: 0,
                      cursor: "pointer",
                      opacity: filters.labelIds.includes(label.id) ? 1 : 0.5,
                      outline: filters.labelIds.includes(label.id) ? "2px solid var(--accent)" : "none",
                      outlineOffset: "2px",
                      transition: "opacity var(--transition-fast)",
                    }}
                  >
                    <LabelChip label={label} size="sm" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {members.length > 1 && (
            <div style={{ marginBottom: "12px" }}>
              <p className="text-section-title" style={{ marginBottom: "8px" }}>Assignee</p>
              <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                {members.map((member) => (
                  <button
                    key={member.userId}
                    type="button"
                    onClick={() => toggleAssignee(member.userId)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      width: "100%",
                      padding: "6px 8px",
                      background: filters.assigneeId === member.userId ? "var(--bg-card-hover)" : "transparent",
                      border: "none",
                      cursor: "pointer",
                      transition: "background var(--transition-fast)",
                      textAlign: "left",
                    }}
                  >
                    <UserAvatar user={member.user} size="sm" />
                    <span style={{ fontSize: "13px", color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {member.user.name ?? member.user.email}
                    </span>
                    {filters.assigneeId === member.userId && (
                      <span style={{ marginLeft: "auto", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", flexShrink: 0 }}>x</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div style={{ marginBottom: "12px" }}>
            <p className="text-section-title" style={{ marginBottom: "8px" }}>Due Date</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
              <button
                type="button"
                onClick={() => onChange({ ...filters, overdue: !filters.overdue })}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  width: "100%",
                  padding: "6px 8px",
                  background: filters.overdue ? "color-mix(in srgb, var(--accent-danger) 15%, transparent)" : "transparent",
                  color: filters.overdue ? "var(--accent-danger)" : "var(--text-secondary)",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "13px",
                  textAlign: "left",
                  transition: "background var(--transition-fast), color var(--transition-fast)",
                }}
              >
                Overdue
                {filters.overdue && <span style={{ marginLeft: "auto", fontWeight: 700, fontSize: "11px" }}>x</span>}
              </button>
              <button
                type="button"
                onClick={() => onChange({ ...filters, dueSoon: !filters.dueSoon })}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  width: "100%",
                  padding: "6px 8px",
                  background: filters.dueSoon ? "color-mix(in srgb, var(--accent) 15%, transparent)" : "transparent",
                  color: filters.dueSoon ? "var(--accent)" : "var(--text-secondary)",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "13px",
                  textAlign: "left",
                  transition: "background var(--transition-fast), color var(--transition-fast)",
                }}
              >
                Due soon (2 days)
                {filters.dueSoon && <span style={{ marginLeft: "auto", fontWeight: 700, fontSize: "11px" }}>x</span>}
              </button>
            </div>
          </div>

          {activeCount > 0 && (
            <button
              type="button"
              onClick={clearAll}
              className="btn btn-ghost btn-sm"
              style={{ width: "100%", marginBottom: "12px" }}
            >
              Clear all filters
            </button>
          )}

          {/* Saved Filters */}
          <div style={{ borderTop: "1px solid var(--border-light)", paddingTop: "12px" }}>
            <p className="text-section-title" style={{ marginBottom: "8px" }}>Saved Filters</p>

            {savedFilters.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: "2px", marginBottom: "8px" }}>
                {savedFilters.map((sf) => (
                  <div key={sf.id} style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                    <button
                      type="button"
                      onClick={() => { onChange(sf.filters); setOpen(false); }}
                      style={{
                        flex: 1,
                        textAlign: "left",
                        fontSize: "13px",
                        color: "var(--text-primary)",
                        padding: "4px 8px",
                        background: "transparent",
                        border: "none",
                        cursor: "pointer",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        transition: "background var(--transition-fast)",
                      }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "var(--bg-card-hover)"; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
                    >
                      {sf.name}
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteFilter(sf.id)}
                      className="btn-icon"
                      style={{ color: "var(--accent-danger)", flexShrink: 0, fontSize: "11px", fontWeight: 700 }}
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
                className="btn btn-ghost btn-sm"
                style={{ width: "100%", textAlign: "left", justifyContent: "flex-start" }}
              >
                + Save current filter
              </button>
            )}

            {showSaveInput && (
              <div style={{ display: "flex", gap: "4px", marginTop: "4px" }}>
                <input
                  autoFocus
                  type="text"
                  value={savingName}
                  onChange={(e) => setSavingName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") saveFilter();
                    if (e.key === "Escape") { setShowSaveInput(false); setSavingName(""); }
                  }}
                  placeholder="Filter name"
                  className="input"
                  style={{ fontSize: "12px", padding: "4px 8px" }}
                />
                <button
                  type="button"
                  onClick={saveFilter}
                  className="btn btn-primary btn-sm"
                  style={{ flexShrink: 0 }}
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
