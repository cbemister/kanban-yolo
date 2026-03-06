"use client";

import { useState, useEffect } from "react";
import { signOut } from "next-auth/react";
import Link from "next/link";
import toast from "react-hot-toast";
import { useBoards, useBoardMutations } from "@/hooks/useBoards";
import BoardCard from "@/components/BoardCard";
import { ThemeToggle } from "@/components/ThemeToggle";
import NotificationBell from "@/components/NotificationBell";
import TitleBlockFooter from "@/components/TitleBlockFooter";
import TemplatePicker from "@/components/TemplatePicker";

export default function BoardsPage() {
  const { data: boards, isLoading } = useBoards();
  const { createBoard, deleteBoard } = useBoardMutations();
  const [creating, setCreating] = useState(false);
  const [compact, setCompact] = useState(false);

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

  function handleCreate(title: string, templateId: string) {
    createBoard.mutate({ title, templateId }, {
      onSuccess: () => {
        setCreating(false);
      },
      onError: () => toast.error("Failed to create board"),
    });
  }

  const boardCount = boards?.length ?? 0;

  return (
    <div
      className="min-h-dvh flex flex-col"
      style={{ position: "relative", zIndex: 1 }}
    >
      {/* Sticky toolbar */}
      <header className={`sticky-toolbar${compact ? " compact" : ""}`}>
        {/* Left: title block */}
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
              marginBottom: "12px",
            }}
          >
            <span className="text-section-title">Kanban</span>
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
            Your Boards
          </h1>
          <hr className="title-rule" style={{ marginTop: "10px" }} />
        </div>

        {/* Right: actions */}
        <div style={{ display: "flex", alignItems: "center", gap: "20px", flexWrap: "wrap" }}>
          <button
            onClick={() => setCreating(true)}
            className="btn btn-secondary"
            style={{
              fontSize: "11px",
              fontWeight: 700,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              padding: "6px 14px",
            }}
          >
            + New Board
          </button>

          <NotificationBell />
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

      {/* Board content */}
      <main className="flex-1 overflow-y-auto">
        <div className="board-content">
          {creating && (
            <TemplatePicker
              isPending={createBoard.isPending}
              onSubmit={handleCreate}
              onCancel={() => setCreating(false)}
            />
          )}

          {isLoading ? (
            <div className="text-sm" style={{ color: "var(--text-muted)" }}>Loading boards...</div>
          ) : boards?.length === 0 ? (
            <div style={{ textAlign: "center", paddingTop: 80 }}>
              <p
                className="heading-serif"
                style={{ fontSize: 24, marginBottom: 12, color: "var(--text-secondary)" }}
              >
                No boards yet
              </p>
              <p className="text-sm" style={{ color: "var(--text-muted)", marginBottom: 24 }}>
                Create your first board to get started.
              </p>
              <button
                onClick={() => setCreating(true)}
                className="btn btn-primary"
              >
                + New Board
              </button>
            </div>
          ) : (
            <div className="card-grid">
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
        </div>
      </main>

      <TitleBlockFooter
        projectName="Kanban"
        taskCount={boardCount}
      />
    </div>
  );
}
