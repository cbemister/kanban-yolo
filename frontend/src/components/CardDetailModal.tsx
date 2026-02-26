"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import type { Card } from "@/types";
import LabelPicker from "./LabelPicker";
import LabelChip from "./LabelChip";
import AssigneePicker from "./AssigneePicker";
import UserAvatar from "./UserAvatar";
import DueDatePicker from "./DueDatePicker";
import DueDateBadge from "./DueDateBadge";
import CommentList from "./CommentList";
import CommentInput from "./CommentInput";
import AttachmentList from "./AttachmentList";
import FileUpload from "./FileUpload";

interface CardDetailModalProps {
  card: Card;
  boardId: string;
  currentUserId: string;
  onClose: () => void;
  onSave: (updated: Card) => void;
}

export default function CardDetailModal({ card, boardId, currentUserId, onClose, onSave }: CardDetailModalProps) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(card.title);
  const [details, setDetails] = useState(card.details);
  const [saving, setSaving] = useState(false);
  const [attachRefresh, setAttachRefresh] = useState(0);
  const queryClient = useQueryClient();

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

  async function handleLabelToggle(labelId: string) {
    const isSelected = (card.labels ?? []).some((cl) => cl.labelId === labelId);
    try {
      const res = await fetch(`/api/cards/${card.id}/labels`, {
        method: isSelected ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ labelId }),
      });
      if (!res.ok) throw new Error();
      queryClient.invalidateQueries({ queryKey: ["board", boardId] });
    } catch {
      toast.error("Failed to update label");
    }
  }

  async function handleAssigneeToggle(userId: string) {
    const isAssigned = (card.assignees ?? []).some((a) => a.userId === userId);
    try {
      const res = await fetch(`/api/cards/${card.id}/assignees`, {
        method: isAssigned ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      if (!res.ok) throw new Error();
      queryClient.invalidateQueries({ queryKey: ["board", boardId] });
    } catch {
      toast.error("Failed to update assignee");
    }
  }

  async function handleDueDateChange(date: Date | null) {
    try {
      const res = await fetch(`/api/cards/${card.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dueDate: date ? date.toISOString() : null }),
      });
      if (!res.ok) throw new Error();
      queryClient.invalidateQueries({ queryKey: ["board", boardId] });
    } catch {
      toast.error("Failed to update due date");
    }
  }

  const selectedLabelIds = (card.labels ?? []).map((cl) => cl.labelId);
  const assigneeIds = (card.assignees ?? []).map((a) => a.userId);
  const dueDateValue = card.dueDate ? new Date(card.dueDate) : null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
      onClick={editing ? undefined : onClose}
    >
      <div
        className="bg-white rounded-xl shadow-xl p-4 sm:p-6 w-full max-w-md mx-4 relative max-h-[90dvh] overflow-y-auto"
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
              <p className="text-sm leading-relaxed mb-4" style={{ color: "#888888" }}>
                {card.details}
              </p>
            ) : (
              <p className="text-sm italic mb-4" style={{ color: "#888888" }}>
                No details provided.
              </p>
            )}

            {/* Due Date */}
            <div className="mb-4">
              <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: "#888888" }}>
                Due Date
              </p>
              <div className="flex items-center gap-2">
                {card.dueDate && <DueDateBadge dueDate={card.dueDate} />}
                <DueDatePicker value={dueDateValue} onChange={handleDueDateChange} />
              </div>
            </div>

            {/* Labels */}
            <div className="mb-4">
              <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: "#888888" }}>
                Labels
              </p>
              <div className="flex items-center gap-2 flex-wrap">
                {(card.labels ?? []).map((cl) => (
                  <LabelChip key={cl.labelId} label={cl.label} size="sm" />
                ))}
                <LabelPicker
                  boardId={boardId}
                  cardId={card.id}
                  selectedLabelIds={selectedLabelIds}
                  onToggle={handleLabelToggle}
                />
              </div>
            </div>

            {/* Assignees */}
            <div className="mb-5">
              <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: "#888888" }}>
                Assignees
              </p>
              <div className="flex items-center gap-2 flex-wrap">
                {(card.assignees ?? []).map((a) => (
                  <UserAvatar key={a.userId} user={a.user} size="md" />
                ))}
                <AssigneePicker
                  boardId={boardId}
                  cardId={card.id}
                  assigneeIds={assigneeIds}
                  onToggle={handleAssigneeToggle}
                />
              </div>
            </div>

            <button
              onClick={() => setEditing(true)}
              className="text-sm font-medium transition-colors"
              style={{ color: "#209dd7" }}
            >
              Edit
            </button>

            {/* Comments */}
            <div className="mt-6 border-t border-gray-100 pt-5">
              <p className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: "#888888" }}>
                Comments
              </p>
              <CommentList cardId={card.id} currentUserId={currentUserId} />
              <CommentInput cardId={card.id} />
            </div>

            {/* Attachments */}
            <div className="mt-5 border-t border-gray-100 pt-5">
              <p className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: "#888888" }}>
                Attachments
              </p>
              <AttachmentList cardId={card.id} currentUserId={currentUserId} key={attachRefresh} />
              <div className="mt-2">
                <FileUpload cardId={card.id} onUploaded={() => setAttachRefresh((n) => n + 1)} />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
