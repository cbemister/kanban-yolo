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
    <div className="modal-backdrop-overlay" onClick={onClose}>
      <div
        className="modal-panel modal-panel-sm"
        style={{ padding: "28px 32px" }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2
          className="heading-serif"
          style={{ fontSize: "26px", marginBottom: "24px" }}
        >
          Add Card
        </h2>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "16px" }}>
            <label
              className="text-section-title"
              style={{ display: "block", marginBottom: "8px" }}
            >
              Title
            </label>
            <input
              ref={titleRef}
              autoFocus
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input"
              placeholder="Card title"
              required
            />
          </div>
          <div style={{ marginBottom: "28px" }}>
            <label
              className="text-section-title"
              style={{ display: "block", marginBottom: "8px" }}
            >
              Details
            </label>
            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              className="input"
              placeholder="Optional details"
              rows={3}
              style={{ resize: "none" }}
            />
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Add Card
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
