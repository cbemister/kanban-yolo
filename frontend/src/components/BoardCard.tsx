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
      <div className="relative group bg-white/10 hover:bg-white/15 border border-white/10 rounded-xl p-5 transition-colors">
        <div className="h-0.5 w-8 rounded-full mb-4" style={{ background: "#ecad0a" }} />
        <Link href={`/boards/${board.id}`}>
          <h3 className="text-white font-semibold text-base mb-1 hover:underline leading-snug">
            {board.title}
          </h3>
        </Link>
        <p className="text-xs mt-2" style={{ color: "#888888" }}>
          {board._count.columns} column{board._count.columns !== 1 ? "s" : ""}
        </p>
        <button
          onClick={() => setConfirmDelete(true)}
          onPointerDown={(e) => e.stopPropagation()}
          className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity w-6 h-6 rounded-full bg-white/10 hover:bg-red-500/20 hover:text-red-400 flex items-center justify-center text-white/50 text-xs"
          aria-label="Delete board"
        >
          x
        </button>
      </div>

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
