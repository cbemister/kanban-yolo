"use client";

import { useRef, useState } from "react";

interface AddCardModalProps {
  onClose: () => void;
  onSubmit: (title: string, details: string) => void;
}

export default function AddCardModal({ onClose, onSubmit }: AddCardModalProps) {
  const [title, setTitle] = useState("");
  const [details, setDetails] = useState("");
  const titleRef = useRef<HTMLInputElement>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;
    onSubmit(trimmed, details.trim());
    onClose();
  }

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-xl p-4 sm:p-6 w-full max-w-md mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-bold mb-4" style={{ color: "#032147" }}>
          Add Card
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1" style={{ color: "#032147" }}>
              Title
            </label>
            <input
              ref={titleRef}
              autoFocus
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2"
              style={{ "--tw-ring-color": "#209dd7" } as React.CSSProperties}
              placeholder="Card title"
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium mb-1" style={{ color: "#032147" }}>
              Details
            </label>
            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 resize-none"
              style={{ "--tw-ring-color": "#209dd7" } as React.CSSProperties}
              placeholder="Optional details"
              rows={3}
            />
          </div>
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 hover:bg-gray-200 transition-colors"
              style={{ color: "#888888" }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg text-sm font-medium text-white transition-opacity hover:opacity-90"
              style={{ background: "#753991" }}
            >
              Add Card
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
