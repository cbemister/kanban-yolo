"use client";

import { useEffect, useRef, useState } from "react";

interface SearchBarProps {
  value: string;
  onChange: (v: string) => void;
  onClear: () => void;
}

export default function SearchBar({ value, onChange, onClear }: SearchBarProps) {
  const [localValue, setLocalValue] = useState(value);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  function handleChange(v: string) {
    setLocalValue(v);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      onChange(v);
    }, 300);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") {
      setLocalValue("");
      onChange("");
      onClear();
    }
  }

  return (
    <div className="relative flex items-center">
      <svg
        className="absolute left-3 w-4 h-4 pointer-events-none"
        style={{ color: "#888888" }}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        strokeWidth={2}
      >
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.35-4.35" strokeLinecap="round" />
      </svg>
      <input
        type="text"
        value={localValue}
        onChange={(e) => handleChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Search cards..."
        className="pl-9 pr-8 py-1.5 text-sm border border-white/20 rounded-lg bg-white/10 text-white placeholder-white/40 focus:outline-none focus:ring-2 w-48 focus:w-64 transition-all"
        style={{ "--tw-ring-color": "#209dd7" } as React.CSSProperties}
      />
      {localValue && (
        <button
          type="button"
          onClick={() => { setLocalValue(""); onChange(""); onClear(); }}
          className="absolute right-2 text-white/50 hover:text-white transition-colors text-xs"
        >
          x
        </button>
      )}
    </div>
  );
}
