"use client";

import { useState, useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { signOut } from "next-auth/react";
import type { ActiveFilters } from "@/types";
import type { SearchResult } from "@/hooks/useSearch";
import { useSearch } from "@/hooks/useSearch";
import SearchBar from "./SearchBar";
import SearchResults from "./SearchResults";
import FilterBar from "./FilterBar";
import PresenceIndicator from "./PresenceIndicator";
import { ThemeToggle } from "./ThemeToggle";
import NotificationBell from "./NotificationBell";

const ShareModal = dynamic(() => import("./ShareModal"), { ssr: false });
const ActivitySidebar = dynamic(() => import("./ActivitySidebar"), { ssr: false });

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
  const [activityOpen, setActivityOpen] = useState(false);
  const [compact, setCompact] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const { data: searchResults = [] } = useSearch(boardId, searchQuery);

  const showResults = searchQuery.length >= 1;

  useEffect(() => {
    let ticking = false;

    function onScroll() {
      if (!ticking) {
        requestAnimationFrame(() => {
          setCompact(window.scrollY > 100);
          ticking = false;
        });
        ticking = true;
      }
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function handleSearchResultClick(card: SearchResult) {
    setSearchQuery("");
    onSearchResultClick(card);
  }

  return (
    <>
      <header className={`sticky-toolbar${compact ? " compact" : ""}`}>
        {/* Left: back link + board title */}
        <div className="toolbar-left">
          <Link
            href="/boards"
            className="toolbar-back"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "12px",
              color: "var(--text-muted)",
              transition: "color var(--transition-fast)",
              marginBottom: "12px",
            }}
            title="All boards"
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-primary)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ flexShrink: 0 }}
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            <span className="text-section-title">All boards</span>
          </Link>

          <h1
            className="heading-serif toolbar-title"
            style={{
              fontSize: "clamp(32px, 5vw, 48px)",
              letterSpacing: "-0.03em",
              lineHeight: 1.1,
              transition: "font-size var(--transition-fast)",
            }}
          >
            {boardTitle}
          </h1>
          <hr className="title-rule" style={{ marginTop: "10px" }} />
        </div>

        {/* Right: search + presence + actions */}
        <div style={{ display: "flex", alignItems: "center", gap: "20px", flexWrap: "wrap" }}>
          {/* Search */}
          <div ref={searchRef} style={{ position: "relative" }}>
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

          {/* Activity toggle */}
          <button
            type="button"
            onClick={() => setActivityOpen(true)}
            className="btn-icon"
            title="Activity feed"
            aria-label="Activity feed"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </button>

          <NotificationBell />

          {/* Share link */}
          {currentUserRole === "OWNER" && (
            <button
              type="button"
              onClick={() => setShareOpen(true)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: "13px",
                fontWeight: 500,
                color: "var(--accent)",
                padding: "4px 0",
                position: "relative",
                transition: "color var(--transition-fast)",
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget.querySelector("span") as HTMLElement | null;
                if (el) el.style.width = "100%";
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget.querySelector("span") as HTMLElement | null;
                if (el) el.style.width = "0%";
              }}
            >
              Share
              <span
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  height: "1px",
                  width: "0%",
                  background: "var(--accent)",
                  transition: "width var(--transition-fast)",
                  display: "block",
                }}
              />
            </button>
          )}

          <ThemeToggle />

          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="btn-ghost text-section-title"
            style={{ fontSize: "10px" }}
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

      {activityOpen && (
        <ActivitySidebar
          boardId={boardId}
          isOpen={activityOpen}
          onClose={() => setActivityOpen(false)}
        />
      )}
    </>
  );
}
