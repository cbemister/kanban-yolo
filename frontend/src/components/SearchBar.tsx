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
        className="absolute left-0 w-3.5 h-3.5 pointer-events-none"
        style={{ color: "var(--text-muted)" }}
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
        className="input-underline pl-5 pr-6 w-40 focus:w-56 transition-all"
        data-search-input
      />
      {localValue && (
        <button
          type="button"
          onClick={() => { setLocalValue(""); onChange(""); onClear(); }}
          className="absolute right-0 text-xs"
          style={{ color: "var(--text-muted)" }}
          aria-label="Clear search"
        >
          x
        </button>
      )}
    </div>
  );
}
