"use client";

import Link from "next/link";
import { useState } from "react";
import type { BoardSummary } from "@/hooks/useBoards";
import ConfirmDialog from "./ConfirmDialog";

interface BoardCardProps {
  board: BoardSummary;
  onDelete: (id: string) => void;
}

export default function BoardCard({ board, onDelete }: BoardCardProps) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <>
      <Link
        href={`/boards/${board.id}`}
        className="editorial-card group relative block"
        style={{ textDecoration: "none" }}
      >
        <div style={{ padding: "20px 24px", height: "100%", display: "flex", flexDirection: "column" }}>
          {/* Delete button */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setConfirmDelete(true);
            }}
            onPointerDown={(e) => e.stopPropagation()}
            className="btn-icon absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity w-6 h-6 flex items-center justify-center text-xs hover:text-[var(--accent-danger)]"
            aria-label="Delete board"
          >
            x
          </button>

          {/* Board title */}
          <h3
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: 20,
              fontWeight: 400,
              lineHeight: 1.25,
              color: "var(--text-primary)",
              marginBottom: 8,
              paddingRight: 24,
            }}
          >
            {board.title}
          </h3>

          {/* Metadata */}
          <div
            style={{
              marginTop: "auto",
              paddingTop: 12,
              borderTop: "1px solid var(--border-light)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <span
              className="text-section-title"
              style={{ fontSize: 10 }}
            >
              {board._count.columns} column{board._count.columns !== 1 ? "s" : ""}
            </span>
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ color: "var(--text-muted)", transition: "color var(--transition-fast)" }}
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </Link>

      {confirmDelete && (
        <ConfirmDialog
          title="Delete board"
          message={`Are you sure you want to delete "${board.title}"? All columns and cards will be permanently removed.`}
          onConfirm={() => {
            onDelete(board.id);
            setConfirmDelete(false);
          }}
          onCancel={() => setConfirmDelete(false)}
        />
      )}
    </>
  );
}
