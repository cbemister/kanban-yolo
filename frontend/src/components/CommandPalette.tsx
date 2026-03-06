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
      className="modal-backdrop-overlay"
      style={{ alignItems: "flex-start", paddingTop: "15vh" }}
      onClick={onClose}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "512px",
          background: "var(--bg-base)",
          border: "1px solid var(--border-color)",
          overflow: "hidden",
          zIndex: "var(--z-modal)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <Command
          style={{
            fontFamily: "var(--font-sans)",
          }}
        >
          <div
            style={{
              borderBottom: "1px solid var(--border-light)",
            }}
          >
            <Command.Input
              autoFocus
              value={query}
              onValueChange={setQuery}
              placeholder="Search boards, cards, actions..."
              style={{
                width: "100%",
                padding: "14px 16px",
                fontSize: "14px",
                color: "var(--text-primary)",
                background: "var(--bg-base)",
                border: "none",
                outline: "none",
                fontFamily: "var(--font-sans)",
              }}
            />
          </div>
          <Command.List
            style={{
              maxHeight: "288px",
              overflowY: "auto",
              padding: "8px",
            }}
          >
            <Command.Empty
              style={{
                padding: "24px",
                textAlign: "center",
                fontSize: "13px",
                color: "var(--text-muted)",
              }}
            >
              No results found.
            </Command.Empty>

            {/* Actions */}
            <Command.Group
              heading="Actions"
              style={
                {
                  "--cmdk-group-heading-color": "var(--text-muted)",
                } as React.CSSProperties
              }
            >
              <style>{`
                [cmdk-group-heading] {
                  font-family: var(--font-sans);
                  font-size: 10px;
                  font-weight: 700;
                  letter-spacing: 0.15em;
                  text-transform: uppercase;
                  color: var(--text-muted);
                  padding: 6px 8px 4px;
                }
                [cmdk-item] {
                  display: flex;
                  align-items: center;
                  gap: 8px;
                  padding: 8px 12px;
                  cursor: pointer;
                  font-size: 13px;
                  color: var(--text-primary);
                  transition: background var(--transition-fast);
                }
                [cmdk-item][aria-selected="true"] {
                  background: var(--bg-card-hover);
                }
              `}</style>
              {onNewCard && (
                <Command.Item
                  onSelect={() => { onNewCard(); onClose(); }}
                >
                  <span style={{ color: "var(--accent)", fontSize: "15px", lineHeight: 1 }}>+</span>
                  New card
                </Command.Item>
              )}
              <Command.Item
                onSelect={() => { router.push("/boards"); onClose(); }}
              >
                All boards
              </Command.Item>
            </Command.Group>

            {/* Cards */}
            {filteredCards.length > 0 && (
              <Command.Group heading="Cards">
                {filteredCards.map((card) => (
                  <Command.Item
                    key={card.id}
                    value={card.title}
                    onSelect={() => { router.push(`/boards/${boardId}?card=${card.id}`); onClose(); }}
                    style={{ justifyContent: "space-between" }}
                  >
                    <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {card.title}
                    </span>
                    <span style={{ fontSize: "11px", color: "var(--text-muted)", flexShrink: 0, marginLeft: "8px" }}>
                      {card.columnTitle}
                    </span>
                  </Command.Item>
                ))}
              </Command.Group>
            )}

            {/* Boards */}
            {filteredBoards.length > 0 && (
              <Command.Group heading="Boards">
                {filteredBoards.map((board: { id: string; title: string }) => (
                  <Command.Item
                    key={board.id}
                    value={board.title}
                    onSelect={() => { router.push(`/boards/${board.id}`); onClose(); }}
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
