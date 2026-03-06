"use client";

import { useState, useRef, useEffect } from "react";
import { DayPicker } from "react-day-picker";
import { format } from "date-fns";
import "react-day-picker/style.css";

interface DueDatePickerProps {
  value: Date | null;
  onChange: (date: Date | null) => void;
}

export default function DueDatePicker({ value, onChange }: DueDatePickerProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function handleSelect(date: Date | undefined) {
    onChange(date ?? null);
    setOpen(false);
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="btn btn-secondary btn-sm"
      >
        {value ? format(value, "MMM d, yyyy") : "Set due date"}
      </button>

      {open && (
        <div
          className="dropdown-panel absolute left-0 top-full mt-1 p-2"
          style={{ zIndex: "var(--z-dropdown)" }}
        >
          <DayPicker
            mode="single"
            selected={value ?? undefined}
            onSelect={handleSelect}
            modifiersStyles={{
              selected: { background: "var(--accent)", color: "white" },
              today: { fontWeight: "bold", color: "var(--accent)" },
            }}
          />
          {value && (
            <div className="px-2 pb-2">
              <button
                type="button"
                onClick={() => { onChange(null); setOpen(false); }}
                className="btn btn-ghost btn-sm w-full"
              >
                Clear due date
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
