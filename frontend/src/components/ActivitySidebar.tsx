"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import type { Activity } from "@/types";
import ActivityItem from "./ActivityItem";

interface ActivityPage {
  items: Activity[];
  nextCursor: string | null;
}

interface ActivitySidebarProps {
  boardId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function ActivitySidebar({ boardId, isOpen, onClose }: ActivitySidebarProps) {
  const [cursor, setCursor] = useState<string | null>(null);
  const [allActivities, setAllActivities] = useState<Activity[]>([]);

  const { data, isLoading } = useQuery<ActivityPage>({
    queryKey: ["activity", boardId, cursor],
    queryFn: async () => {
      const url = cursor
        ? `/api/boards/${boardId}/activity?cursor=${cursor}`
        : `/api/boards/${boardId}/activity`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch activity");
      return res.json();
    },
    enabled: isOpen,
  });

  useEffect(() => {
    if (!data) return;
    setAllActivities((prev) => {
      const existing = new Set(prev.map((a) => a.id));
      const newItems = data.items.filter((a) => !existing.has(a.id));
      if (newItems.length === 0) return prev;
      return [...prev, ...newItems];
    });
  }, [data]);

  // Reset when sidebar opens
  useEffect(() => {
    if (!isOpen) {
      setAllActivities([]);
      setCursor(null);
    }
  }, [isOpen]);

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: "var(--z-sidebar)" as unknown as number,
          }}
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          height: "100%",
          width: "320px",
          background: "var(--bg-base)",
          borderLeft: "1px solid var(--border-color)",
          zIndex: "calc(var(--z-sidebar) + 1)" as unknown as number,
          display: "flex",
          flexDirection: "column",
          transform: isOpen ? "translateX(0)" : "translateX(100%)",
          transition: "transform 300ms linear",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "20px 20px 16px",
            borderBottom: "1px solid var(--border-light)",
            flexShrink: 0,
          }}
        >
          <h2
            className="heading-serif"
            style={{ fontSize: "28px", lineHeight: 1.1 }}
          >
            Activity
          </h2>
          <button
            onClick={onClose}
            className="btn-icon"
            aria-label="Close activity"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px" }}>
          {isLoading && allActivities.length === 0 ? (
            <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>Loading activity...</p>
          ) : allActivities.length === 0 ? (
            <p style={{ fontSize: "13px", fontStyle: "italic", color: "var(--text-muted)" }}>No activity yet.</p>
          ) : (
            <>
              {allActivities.map((activity) => (
                <ActivityItem key={activity.id} activity={activity} />
              ))}
              {data?.nextCursor && (
                <button
                  onClick={() => setCursor(data.nextCursor)}
                  className="btn btn-ghost"
                  style={{ marginTop: "12px", width: "100%" }}
                >
                  Load more
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
