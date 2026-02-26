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
      <mark style={{ background: "#ecad0a33", color: "inherit" }}>{text.slice(idx, idx + query.length)}</mark>
      {text.slice(idx + query.length)}
    </>
  );
}

export default function SearchResults({ results, query, onCardClick }: SearchResultsProps) {
  if (results.length === 0) {
    return (
      <div className="absolute top-full left-0 mt-1 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-30 p-3">
        <p className="text-sm" style={{ color: "#888888" }}>No results found.</p>
      </div>
    );
  }

  return (
    <div className="absolute top-full left-0 mt-1 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-30 max-h-80 overflow-y-auto">
      {results.map((card) => (
        <button
          key={card.id}
          type="button"
          onClick={() => onCardClick(card)}
          className="w-full text-left px-3 py-2.5 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0"
        >
          <p className="text-sm font-medium text-gray-900 leading-snug">
            {highlightMatch(card.title, query)}
          </p>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className="text-xs px-1.5 py-0.5 rounded bg-gray-100" style={{ color: "#888888" }}>
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
