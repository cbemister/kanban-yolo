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
    <div ref={ref} style={{ position: "relative" }}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="btn-icon"
        aria-label="Notifications"
        style={{ position: "relative", color: "var(--text-secondary)" }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>
        {unreadCount > 0 && (
          <span
            style={{
              position: "absolute",
              top: "-2px",
              right: "-2px",
              width: "14px",
              height: "14px",
              background: "var(--accent)",
              color: "#ffffff",
              fontSize: "9px",
              fontWeight: 700,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
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
