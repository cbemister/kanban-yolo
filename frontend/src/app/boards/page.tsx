"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import Link from "next/link";
import toast from "react-hot-toast";
import { useBoards, useBoardMutations } from "@/hooks/useBoards";
import BoardCard from "@/components/BoardCard";

export default function BoardsPage() {
  const { data: boards, isLoading } = useBoards();
  const { createBoard, deleteBoard } = useBoardMutations();
  const [creating, setCreating] = useState(false);
  const [newTitle, setNewTitle] = useState("");

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const title = newTitle.trim();
    if (!title) return;

    createBoard.mutate(title, {
      onSuccess: () => {
        setNewTitle("");
        setCreating(false);
      },
      onError: () => toast.error("Failed to create board"),
    });
  }

  return (
    <div className="min-h-dvh flex flex-col" style={{ background: "#032147" }}>
      <header className="flex items-center justify-between px-6 sm:px-10 py-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-1 h-8 rounded-full" style={{ background: "#ecad0a" }} />
          <h1 className="text-2xl font-bold text-white tracking-tight">Kanban</h1>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="text-sm text-white/60 hover:text-white transition-colors"
        >
          Sign out
        </button>
      </header>

      <main className="flex-1 px-6 sm:px-10 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">Your Boards</h2>
          <button
            onClick={() => setCreating(true)}
            className="px-4 py-2 rounded-lg text-sm font-medium text-white transition-opacity hover:opacity-90"
            style={{ background: "#753991" }}
          >
            + New Board
          </button>
        </div>

        {creating && (
          <form onSubmit={handleCreate} className="mb-6 flex gap-2">
            <input
              autoFocus
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Board name"
              className="flex-1 max-w-xs border border-white/20 rounded-lg px-3 py-2 text-sm bg-white/10 text-white placeholder-white/40 focus:outline-none focus:border-blue-primary"
              required
            />
            <button
              type="submit"
              disabled={createBoard.isPending}
              className="px-4 py-2 rounded-lg text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60"
              style={{ background: "#753991" }}
            >
              {createBoard.isPending ? "Creating..." : "Create"}
            </button>
            <button
              type="button"
              onClick={() => { setCreating(false); setNewTitle(""); }}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-white/10 text-white/70 hover:bg-white/20 transition-colors"
            >
              Cancel
            </button>
          </form>
        )}

        {isLoading ? (
          <div className="text-white/50 text-sm">Loading boards...</div>
        ) : boards?.length === 0 ? (
          <div className="text-white/50 text-sm">
            No boards yet.{" "}
            <button
              onClick={() => setCreating(true)}
              className="underline"
              style={{ color: "#209dd7" }}
            >
              Create your first board
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {boards?.map((board) => (
              <BoardCard
                key={board.id}
                board={board}
                onDelete={(id) =>
                  deleteBoard.mutate(id, {
                    onError: () => toast.error("Failed to delete board"),
                  })
                }
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
