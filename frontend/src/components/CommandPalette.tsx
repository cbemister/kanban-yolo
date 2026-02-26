"use client";

import { Command } from "cmdk";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useBoards } from "@/hooks/useBoards";
import type { Column, Card } from "@/types";

interface CommandPaletteProps {
  boardId?: string;
  columns?: Column[];
  onClose: () => void;
  onNewCard?: () => void;
}

export default function CommandPalette({ boardId, columns, onClose, onNewCard }: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const router = useRouter();
  const { data: boards = [] } = useBoards();

  // Flatten all cards from columns for search
  const allCards: (Card & { columnTitle: string })[] = (columns ?? []).flatMap((col) =>
    col.cards.map((card) => ({ ...card, columnTitle: col.title }))
  );

  const filteredCards = query
    ? allCards.filter((c) => c.title.toLowerCase().includes(query.toLowerCase()))
    : allCards.slice(0, 5);

  const filteredBoards = query
    ? boards.filter((b: { id: string; title: string }) => b.title.toLowerCase().includes(query.toLowerCase()))
    : boards.slice(0, 3);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 flex items-start justify-center pt-[15vh] z-50 px-4"
      style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-white rounded-xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <Command className="[&_[cmdk-input-wrapper]]:border-b [&_[cmdk-input-wrapper]]:border-gray-100">
          <Command.Input
            autoFocus
            value={query}
            onValueChange={setQuery}
            placeholder="Search boards, cards, actions..."
            className="w-full px-4 py-3.5 text-sm outline-none placeholder-gray-400"
            style={{ color: "#032147" }}
          />
          <Command.List className="max-h-72 overflow-y-auto p-2">
            <Command.Empty className="py-6 text-center text-sm" style={{ color: "#888888" }}>
              No results found.
            </Command.Empty>

            {/* Actions */}
            <Command.Group
              heading="Actions"
              className="[&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wide"
              style={{ color: "#888888" }}
            >
              {onNewCard && (
                <Command.Item
                  onSelect={() => { onNewCard(); onClose(); }}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer text-sm aria-selected:bg-blue-50"
                  style={{ color: "#032147" }}
                >
                  <span style={{ color: "#209dd7" }}>+</span> New card
                </Command.Item>
              )}
              <Command.Item
                onSelect={() => { router.push("/boards"); onClose(); }}
                className="flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer text-sm aria-selected:bg-blue-50"
                style={{ color: "#032147" }}
              >
                All boards
              </Command.Item>
            </Command.Group>

            {/* Cards */}
            {filteredCards.length > 0 && (
              <Command.Group
                heading="Cards"
                className="[&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wide"
                style={{ color: "#888888" }}
              >
                {filteredCards.map((card) => (
                  <Command.Item
                    key={card.id}
                    value={card.title}
                    onSelect={() => { router.push(`/boards/${boardId}?card=${card.id}`); onClose(); }}
                    className="flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer text-sm aria-selected:bg-blue-50"
                    style={{ color: "#032147" }}
                  >
                    <span className="truncate">{card.title}</span>
                    <span className="text-xs flex-shrink-0 ml-2" style={{ color: "#888888" }}>{card.columnTitle}</span>
                  </Command.Item>
                ))}
              </Command.Group>
            )}

            {/* Boards */}
            {filteredBoards.length > 0 && (
              <Command.Group
                heading="Boards"
                className="[&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wide"
                style={{ color: "#888888" }}
              >
                {filteredBoards.map((board: { id: string; title: string }) => (
                  <Command.Item
                    key={board.id}
                    value={board.title}
                    onSelect={() => { router.push(`/boards/${board.id}`); onClose(); }}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer text-sm aria-selected:bg-blue-50"
                    style={{ color: "#032147" }}
                  >
                    {board.title}
                  </Command.Item>
                ))}
              </Command.Group>
            )}
          </Command.List>
        </Command>
      </div>
    </div>
  );
}
