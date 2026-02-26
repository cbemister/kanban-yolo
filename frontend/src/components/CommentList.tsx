"use client";

import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import toast from "react-hot-toast";
import type { Comment } from "@/types";
import UserAvatar from "./UserAvatar";

interface CommentPage {
  items: Comment[];
  nextCursor: string | null;
}

interface CommentListProps {
  cardId: string;
  currentUserId: string;
}

export default function CommentList({ cardId, currentUserId }: CommentListProps) {
  const queryClient = useQueryClient();
  const [cursor, setCursor] = useState<string | null>(null);
  const [allComments, setAllComments] = useState<Comment[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [saving, setSaving] = useState(false);

  const { data, isLoading } = useQuery<CommentPage>({
    queryKey: ["comments", cardId, cursor],
    queryFn: async () => {
      const url = cursor
        ? `/api/cards/${cardId}/comments?cursor=${cursor}`
        : `/api/cards/${cardId}/comments`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch comments");
      return res.json();
    },
  });

  useEffect(() => {
    if (!data) return;
    setAllComments((prev) => {
      const existing = new Set(prev.map((c) => c.id));
      const newItems = data.items.filter((c) => !existing.has(c.id));
      if (newItems.length === 0) return prev;
      return [...prev, ...newItems];
    });
  }, [data]);

  // Reset when card changes
  useEffect(() => {
    setAllComments([]);
    setCursor(null);
  }, [cardId]);

  function startEdit(comment: Comment) {
    setEditingId(comment.id);
    setEditContent(comment.content);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditContent("");
  }

  async function handleSave(commentId: string) {
    if (!editContent.trim()) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/comments/${commentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: editContent.trim() }),
      });
      if (!res.ok) throw new Error();
      const updated: Comment = await res.json();
      setAllComments((prev) => prev.map((c) => (c.id === commentId ? updated : c)));
      setEditingId(null);
      queryClient.invalidateQueries({ queryKey: ["comments", cardId] });
    } catch {
      toast.error("Failed to update comment");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(commentId: string) {
    try {
      const res = await fetch(`/api/comments/${commentId}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setAllComments((prev) => prev.filter((c) => c.id !== commentId));
      queryClient.invalidateQueries({ queryKey: ["comments", cardId] });
    } catch {
      toast.error("Failed to delete comment");
    }
  }

  if (isLoading && allComments.length === 0) {
    return <p className="text-sm" style={{ color: "#888888" }}>Loading comments...</p>;
  }

  if (allComments.length === 0) {
    return <p className="text-sm italic" style={{ color: "#888888" }}>No comments yet.</p>;
  }

  return (
    <div className="space-y-4">
      {allComments.map((comment) => (
        <div key={comment.id} className="flex gap-3">
          <div className="flex-shrink-0">
            <UserAvatar user={comment.user} size="sm" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-sm font-semibold" style={{ color: "#032147" }}>
                {comment.user.name ?? comment.user.email}
              </span>
              <span className="text-xs" style={{ color: "#888888" }}>
                {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
              </span>
            </div>
            {editingId === comment.id ? (
              <div>
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 resize-none"
                  style={{ color: "#032147", "--tw-ring-color": "#209dd7" } as React.CSSProperties}
                />
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => handleSave(comment.id)}
                    disabled={saving || !editContent.trim()}
                    className="px-3 py-1 rounded-lg text-xs font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60"
                    style={{ background: "#753991" }}
                  >
                    {saving ? "Saving..." : "Save"}
                  </button>
                  <button
                    onClick={cancelEdit}
                    className="px-3 py-1 rounded-lg text-xs font-medium bg-gray-100 hover:bg-gray-200 transition-colors"
                    style={{ color: "#888888" }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <p className="text-sm whitespace-pre-wrap break-words" style={{ color: "#032147" }}>
                  {comment.content}
                </p>
                {comment.userId === currentUserId && (
                  <div className="flex gap-3 mt-1">
                    <button
                      onClick={() => startEdit(comment)}
                      className="text-xs transition-colors hover:underline"
                      style={{ color: "#209dd7" }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(comment.id)}
                      className="text-xs transition-colors hover:underline"
                      style={{ color: "#888888" }}
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      ))}
      {data?.nextCursor && (
        <button
          onClick={() => setCursor(data.nextCursor)}
          className="text-sm transition-colors"
          style={{ color: "#209dd7" }}
        >
          Load more
        </button>
      )}
    </div>
  );
}
