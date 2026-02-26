"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

interface CommentInputProps {
  cardId: string;
}

export default function CommentInput({ cardId }: CommentInputProps) {
  const queryClient = useQueryClient();
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = content.trim();
    if (!trimmed) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/cards/${cardId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: trimmed }),
      });
      if (!res.ok) throw new Error();
      setContent("");
      queryClient.invalidateQueries({ queryKey: ["comments", cardId] });
    } catch {
      toast.error("Failed to post comment");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-3">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={3}
        placeholder="Write a comment..."
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 resize-none"
        style={{ color: "#032147", "--tw-ring-color": "#209dd7" } as React.CSSProperties}
      />
      <div className="flex justify-end mt-2">
        <button
          type="submit"
          disabled={submitting || !content.trim()}
          className="px-4 py-2 rounded-lg text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60"
          style={{ background: "#753991" }}
        >
          {submitting ? "Posting..." : "Comment"}
        </button>
      </div>
    </form>
  );
}
