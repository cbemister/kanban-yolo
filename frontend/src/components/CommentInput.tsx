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
        className="input w-full resize-none"
      />
      <div className="flex justify-end mt-2">
        <button
          type="submit"
          disabled={submitting || !content.trim()}
          className="btn btn-primary"
        >
          {submitting ? "Posting..." : "Comment"}
        </button>
      </div>
    </form>
  );
}
