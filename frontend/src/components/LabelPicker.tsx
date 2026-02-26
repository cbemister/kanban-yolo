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
        className="text-xs font-medium px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
        style={{ color: "#209dd7" }}
      >
        Labels
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-1 w-52 bg-white border border-gray-200 rounded-lg shadow-lg z-20 py-1">
          {labels.length === 0 && (
            <p className="px-3 py-2 text-xs" style={{ color: "#888888" }}>No labels created yet.</p>
          )}
          {labels.map((label) => (
            <button
              key={label.id}
              type="button"
              onClick={() => onToggle(label.id)}
              className="flex items-center gap-2 w-full px-3 py-2 hover:bg-gray-50 transition-colors"
            >
              <span
                className="w-4 h-4 flex-shrink-0 rounded border border-gray-300 flex items-center justify-center text-xs font-bold"
                style={selectedLabelIds.includes(label.id) ? { background: "#753991", borderColor: "#753991", color: "white" } : {}}
              >
                {selectedLabelIds.includes(label.id) ? "x" : ""}
              </span>
              <LabelChip label={label} size="sm" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
