"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import type { ActiveFilters } from "@/types";
import type { SearchResult } from "@/hooks/useSearch";
import { useSearch } from "@/hooks/useSearch";
import SearchBar from "./SearchBar";
import SearchResults from "./SearchResults";
import FilterBar from "./FilterBar";
import PresenceIndicator from "./PresenceIndicator";
import ShareModal from "./ShareModal";

interface BoardToolbarProps {
  boardId: string;
  boardTitle: string;
  currentUserId: string;
  currentUserRole: string;
  filters: ActiveFilters;
  onFiltersChange: (f: ActiveFilters) => void;
  onSearchResultClick: (card: SearchResult) => void;
}

export default function BoardToolbar({
  boardId,
  boardTitle,
  currentUserId,
  currentUserRole,
  filters,
  onFiltersChange,
  onSearchResultClick,
}: BoardToolbarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [shareOpen, setShareOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const { data: searchResults = [] } = useSearch(boardId, searchQuery);

  const showResults = searchQuery.length >= 1;

  function handleSearchResultClick(card: SearchResult) {
    setSearchQuery("");
    onSearchResultClick(card);
  }

  return (
    <>
      <header className="flex items-center gap-3 px-4 sm:px-6 py-3 border-b border-white/10 flex-shrink-0 flex-wrap">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <Link href="/boards" className="text-white/60 hover:text-white transition-colors flex-shrink-0" title="All boards">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </Link>
          <div className="w-1 h-7 rounded-full flex-shrink-0" style={{ background: "#ecad0a" }} />
          <h1 className="text-lg font-bold text-white tracking-tight truncate">
            {boardTitle}
          </h1>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div ref={searchRef} className="relative">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              onClear={() => setSearchQuery("")}
            />
            {showResults && (
              <SearchResults
                results={searchResults}
                query={searchQuery}
                onCardClick={handleSearchResultClick}
              />
            )}
          </div>

          <FilterBar boardId={boardId} filters={filters} onChange={onFiltersChange} />

          <PresenceIndicator boardId={boardId} />

          {currentUserRole === "OWNER" && (
            <button
              type="button"
              onClick={() => setShareOpen(true)}
              className="text-sm font-medium px-3 py-1.5 rounded-lg transition-opacity hover:opacity-90 text-white"
              style={{ background: "#753991" }}
            >
              Share
            </button>
          )}

          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="text-sm text-white/60 hover:text-white transition-colors"
          >
            Sign out
          </button>
        </div>
      </header>

      {shareOpen && (
        <ShareModal
          boardId={boardId}
          currentUserId={currentUserId}
          currentUserRole={currentUserRole}
          onClose={() => setShareOpen(false)}
        />
      )}
    </>
  );
}
