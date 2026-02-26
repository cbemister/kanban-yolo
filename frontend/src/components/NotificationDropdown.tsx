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
    <div className="absolute right-0 top-full mt-1 w-80 bg-white border border-gray-200 rounded-xl shadow-xl z-30 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <h3 className="font-semibold text-sm" style={{ color: "#032147" }}>Notifications</h3>
        <div className="flex items-center gap-3">
          {unread > 0 && (
            <button onClick={markAllRead} className="text-xs" style={{ color: "#209dd7" }}>
              Mark all read
            </button>
          )}
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-sm font-bold">x</button>
        </div>
      </div>

      <div className="max-h-80 overflow-y-auto">
        {loading ? (
          <p className="text-sm text-center py-6" style={{ color: "#888888" }}>Loading...</p>
        ) : notifications.length === 0 ? (
          <p className="text-sm text-center py-6 italic" style={{ color: "#888888" }}>No notifications</p>
        ) : (
          notifications.map((n) => {
            const content = (
              <div
                className={`flex gap-3 px-4 py-3 border-b border-gray-50 cursor-pointer hover:bg-gray-50 transition-colors ${!n.read ? "bg-blue-50/50" : ""}`}
                onClick={() => !n.read && markRead(n.id)}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: "#032147" }}>{n.title}</p>
                  <p className="text-xs mt-0.5 line-clamp-2" style={{ color: "#888888" }}>{n.body}</p>
                  <p className="text-xs mt-1" style={{ color: "#888888" }}>
                    {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                  </p>
                </div>
                {!n.read && (
                  <div className="w-2 h-2 rounded-full flex-shrink-0 mt-1.5" style={{ background: "#209dd7" }} />
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
