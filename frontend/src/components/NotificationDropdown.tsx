"use client";
import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";

interface Notification {
  id: string;
  type: string;
  title: string;
  body: string;
  linkUrl: string | null;
  read: boolean;
  createdAt: string;
}

interface Props {
  onClose: () => void;
  onReadAll: () => void;
}

export default function NotificationDropdown({ onClose, onReadAll }: Props) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/notifications")
      .then((r) => r.json())
      .then(setNotifications)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function markRead(id: string) {
    await fetch(`/api/notifications/${id}`, { method: "PATCH" });
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
  }

  async function markAllRead() {
    await fetch("/api/notifications/read-all", { method: "POST" });
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    onReadAll();
  }

  const unread = notifications.filter((n) => !n.read).length;

  return (
    <div
      className="dropdown-panel"
      style={{
        right: 0,
        top: "100%",
        marginTop: "4px",
        width: "320px",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "12px 16px",
          borderBottom: "1px solid var(--border-light)",
        }}
      >
        <h3 style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)", fontFamily: "var(--font-sans)" }}>
          Notifications
        </h3>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {unread > 0 && (
            <button
              onClick={markAllRead}
              className="btn btn-ghost btn-sm"
              style={{ padding: "2px 6px" }}
            >
              Mark all read
            </button>
          )}
          <button
            onClick={onClose}
            className="btn-icon"
            aria-label="Close notifications"
            style={{ fontSize: "13px", fontWeight: 700 }}
          >
            x
          </button>
        </div>
      </div>

      <div style={{ maxHeight: "320px", overflowY: "auto" }}>
        {loading ? (
          <p style={{ fontSize: "13px", textAlign: "center", padding: "24px", color: "var(--text-muted)" }}>
            Loading...
          </p>
        ) : notifications.length === 0 ? (
          <p style={{ fontSize: "13px", textAlign: "center", padding: "24px", fontStyle: "italic", color: "var(--text-muted)" }}>
            No notifications
          </p>
        ) : (
          notifications.map((n) => {
            const content = (
              <div
                style={{
                  display: "flex",
                  gap: "12px",
                  padding: "12px 16px",
                  borderBottom: "1px solid var(--border-light)",
                  cursor: "pointer",
                  background: !n.read ? "var(--bg-card-hover)" : "transparent",
                  transition: "background var(--transition-fast)",
                }}
                onClick={() => !n.read && markRead(n.id)}
                onMouseEnter={(e) => {
                  if (n.read) (e.currentTarget as HTMLDivElement).style.background = "var(--bg-surface)";
                }}
                onMouseLeave={(e) => {
                  if (n.read) (e.currentTarget as HTMLDivElement).style.background = "transparent";
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: "13px", fontWeight: 500, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {n.title}
                  </p>
                  <p style={{ fontSize: "11px", marginTop: "2px", color: "var(--text-secondary)", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" } as React.CSSProperties}>
                    {n.body}
                  </p>
                  <p style={{ fontSize: "11px", marginTop: "4px", color: "var(--text-muted)" }}>
                    {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                  </p>
                </div>
                {!n.read && (
                  <div
                    style={{
                      width: "6px",
                      height: "6px",
                      background: "var(--accent)",
                      flexShrink: 0,
                      marginTop: "6px",
                    }}
                  />
                )}
              </div>
            );
            return n.linkUrl ? (
              <Link key={n.id} href={n.linkUrl} onClick={onClose}>{content}</Link>
            ) : (
              <div key={n.id}>{content}</div>
            );
          })
        )}
      </div>
    </div>
  );
}
