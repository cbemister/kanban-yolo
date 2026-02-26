"use client";

import { useState } from "react";
import type { Card } from "@/types";

interface CardDetailModalProps {
  card: Card;
  onClose: () => void;
  onSave: (updated: Card) => void;
}

export default function CardDetailModal({ card, onClose, onSave }: CardDetailModalProps) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(card.title);
  const [details, setDetails] = useState(card.details);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) return;
    setSaving(true);
    await onSave({ ...card, title: trimmedTitle, details: details.trim() });
    setSaving(false);
    setEditing(false);
  }

  function handleCancel() {
    setTitle(card.title);
    setDetails(card.details);
    setEditing(false);
  }

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
      onClick={editing ? undefined : onClose}
    >
      <div
        className="bg-white rounded-xl shadow-xl p-4 sm:p-6 w-full max-w-md mx-4 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-7 h-7 rounded-full flex items-center justify-center bg-gray-100 hover:bg-gray-200 transition-colors text-gray-500 hover:text-gray-800 text-sm font-bold"
          aria-label="Close"
        >
          x
        </button>

        {editing ? (
          <>
            <div className="mb-4 pr-8">
              <label className="block text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: "#888888" }}>
                Title
              </label>
              <input
                autoFocus
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 font-semibold"
                style={{ color: "#032147", "--tw-ring-color": "#209dd7" } as React.CSSProperties}
              />
            </div>
            <div className="mb-5">
              <label className="block text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: "#888888" }}>
                Details
              </label>
              <textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                rows={5}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 resize-none"
                style={{ color: "#032147", "--tw-ring-color": "#209dd7" } as React.CSSProperties}
                placeholder="Add details..."
              />
            </div>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 hover:bg-gray-200 transition-colors"
                style={{ color: "#888888" }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving || !title.trim()}
                className="px-4 py-2 rounded-lg text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60"
                style={{ background: "#753991" }}
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </>
        ) : (
          <>
            <h2
              className="text-xl font-bold mb-3 pr-8 leading-snug"
              style={{ color: "#032147" }}
            >
              {card.title}
            </h2>
            {card.details ? (
              <p className="text-sm leading-relaxed mb-5" style={{ color: "#888888" }}>
                {card.details}
              </p>
            ) : (
              <p className="text-sm italic mb-5" style={{ color: "#888888" }}>
                No details provided.
              </p>
            )}
            <button
              onClick={() => setEditing(true)}
              className="text-sm font-medium transition-colors"
              style={{ color: "#209dd7" }}
            >
              Edit
            </button>
          </>
        )}
      </div>
    </div>
  );
}
