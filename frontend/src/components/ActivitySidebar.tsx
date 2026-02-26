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
          className="fixed inset-0 z-40"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className="fixed top-0 right-0 h-full w-80 bg-white shadow-2xl z-50 flex flex-col transition-transform duration-300"
        style={{ transform: isOpen ? "translateX(0)" : "translateX(100%)" }}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-shrink-0">
          <h2 className="text-base font-bold" style={{ color: "#032147" }}>
            Activity
          </h2>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full flex items-center justify-center bg-gray-100 hover:bg-gray-200 transition-colors text-gray-500 hover:text-gray-800 text-sm font-bold"
            aria-label="Close activity"
          >
            x
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-3">
          {isLoading && allActivities.length === 0 ? (
            <p className="text-sm" style={{ color: "#888888" }}>Loading activity...</p>
          ) : allActivities.length === 0 ? (
            <p className="text-sm italic" style={{ color: "#888888" }}>No activity yet.</p>
          ) : (
            <>
              {allActivities.map((activity) => (
                <ActivityItem key={activity.id} activity={activity} />
              ))}
              {data?.nextCursor && (
                <button
                  onClick={() => setCursor(data.nextCursor)}
                  className="mt-3 text-sm transition-colors"
                  style={{ color: "#209dd7" }}
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
