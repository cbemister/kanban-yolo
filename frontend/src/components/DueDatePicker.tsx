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
        className="text-xs font-medium px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
        style={{ color: "#209dd7" }}
      >
        {value ? format(value, "MMM d, yyyy") : "Set due date"}
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 p-2">
          <DayPicker
            mode="single"
            selected={value ?? undefined}
            onSelect={handleSelect}
            modifiersStyles={{
              selected: { background: "#753991", color: "white", borderRadius: "6px" },
              today: { fontWeight: "bold", color: "#209dd7" },
            }}
          />
          {value && (
            <div className="px-2 pb-2">
              <button
                type="button"
                onClick={() => { onChange(null); setOpen(false); }}
                className="text-xs font-medium px-3 py-1.5 rounded-lg w-full border border-gray-200 hover:bg-gray-50 transition-colors"
                style={{ color: "#888888" }}
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
