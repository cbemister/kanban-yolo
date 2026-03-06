"use client";

import { useState, useRef, useEffect } from "react";
import { useLabels } from "@/hooks/useLabels";
import LabelChip from "./LabelChip";

interface LabelPickerProps {
  boardId: string;
  cardId: string;
  selectedLabelIds: string[];
  onToggle: (labelId: string) => void;
}

export default function LabelPicker({ boardId, selectedLabelIds, onToggle }: LabelPickerProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { data: labels = [] } = useLabels(boardId);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="btn btn-secondary btn-sm"
      >
        Labels
      </button>

      {open && (
        <div className="dropdown-panel absolute left-0 top-full mt-1 w-52 py-1">
          {labels.length === 0 && (
            <p className="px-3 py-2 text-xs" style={{ color: "var(--text-muted)" }}>No labels created yet.</p>
          )}
          {labels.map((label) => (
            <button
              key={label.id}
              type="button"
              onClick={() => onToggle(label.id)}
              className="flex items-center gap-2 w-full px-3 py-2 transition-colors"
              style={{ background: "transparent" }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "var(--bg-card-hover)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
            >
              <span
                className="w-4 h-4 flex-shrink-0 flex items-center justify-center text-xs font-bold"
                style={
                  selectedLabelIds.includes(label.id)
                    ? { background: "var(--accent)", border: "1px solid var(--accent)", color: "white" }
                    : { border: "1px solid var(--border-color)" }
                }
              >
                {selectedLabelIds.includes(label.id) ? "x" : ""}
              </span>
              <LabelChip label={label} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
