"use client";

import type { SearchResult } from "@/hooks/useSearch";
import LabelChip from "./LabelChip";

interface SearchResultsProps {
  results: SearchResult[];
  query: string;
  onCardClick: (card: SearchResult) => void;
}

function highlightMatch(text: string, query: string): React.ReactNode {
  if (!query) return text;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark style={{ background: "color-mix(in srgb, var(--accent) 18%, transparent)", color: "inherit" }}>{text.slice(idx, idx + query.length)}</mark>
      {text.slice(idx + query.length)}
    </>
  );
}

export default function SearchResults({ results, query, onCardClick }: SearchResultsProps) {
  if (results.length === 0) {
    return (
      <div
        className="dropdown-panel absolute top-full left-0 mt-1 w-80 p-3"
        style={{ zIndex: "var(--z-dropdown)" }}
      >
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>No results found.</p>
      </div>
    );
  }

  return (
    <div
      className="dropdown-panel absolute top-full left-0 mt-1 w-80 max-h-80 overflow-y-auto"
      style={{ zIndex: "var(--z-dropdown)" }}
    >
      {results.map((card) => (
        <button
          key={card.id}
          type="button"
          onClick={() => onCardClick(card)}
          className="w-full text-left px-3 py-2.5 transition-colors"
          style={{
            borderBottom: "1px solid var(--border-light)",
            color: "inherit",
            background: "transparent",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-card-hover)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
        >
          <p className="text-sm font-medium leading-snug" style={{ color: "var(--text-primary)" }}>
            {highlightMatch(card.title, query)}
          </p>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span
              className="text-section-title"
              style={{ letterSpacing: "0.08em" }}
            >
              {card.column.title}
            </span>
            {card.labels.slice(0, 3).map((cl) => (
              <LabelChip key={cl.labelId} label={cl.label} size="sm" />
            ))}
          </div>
        </button>
      ))}
    </div>
  );
}
