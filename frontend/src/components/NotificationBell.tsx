"use client";
import { useState, useRef, useEffect } from "react";
import NotificationDropdown from "./NotificationDropdown";

interface Props {
  initialUnreadCount?: number;
}

export default function NotificationBell({ initialUnreadCount = 0 }: Props) {
  const [open, setOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(initialUnreadCount);
  const ref = useRef<HTMLDivElement>(null);

  // Poll for unread count every 60s
  useEffect(() => {
    function fetchUnread() {
      fetch("/api/notifications?unread=true")
        .then((r) => r.json())
        .then((data: unknown[]) => setUnreadCount(data.length))
        .catch(() => {});
    }
    fetchUnread();
    const interval = setInterval(fetchUnread, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative p-2 rounded-md hover:bg-white/10 transition-colors text-white/70 hover:text-white"
        aria-label="Notifications"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>
        {unreadCount > 0 && (
          <span
            className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full text-white text-[10px] flex items-center justify-center font-bold"
            style={{ background: "#753991" }}
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>
      {open && (
        <NotificationDropdown
          onClose={() => setOpen(false)}
          onReadAll={() => setUnreadCount(0)}
        />
      )}
    </div>
  );
}
