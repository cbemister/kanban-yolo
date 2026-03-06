"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import type { Card } from "@/types";
import LabelPicker from "./LabelPicker";
import LabelChip from "./LabelChip";
import AssigneePicker from "./AssigneePicker";
import UserAvatar from "./UserAvatar";
import DueDateBadge from "./DueDateBadge";

const DueDatePicker = dynamic(() => import("./DueDatePicker"), { ssr: false });
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
  const isOverdue = card.dueDate ? new Date(card.dueDate) < new Date() : false;

  return (
    <div
      className="modal-backdrop-overlay"
      onClick={editing ? undefined : onClose}
    >
      <div
        className="modal-panel modal-panel-lg"
        style={{
          padding: "32px 36px",
          borderLeft: isOverdue ? `4px solid var(--accent-danger)` : "2px solid var(--border-color)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            marginBottom: "28px",
            gap: "16px",
          }}
        >
          {editing ? (
            <div style={{ flex: 1 }}>
              <label
                className="text-section-title"
                style={{ display: "block", marginBottom: "8px" }}
              >
                Title
              </label>
              <input
                autoFocus
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="input"
                style={{ fontSize: "20px", fontFamily: "var(--font-serif)", fontWeight: 400 }}
              />
            </div>
          ) : (
            <div style={{ flex: 1 }}>
              <h2
                style={{
                  fontFamily: "var(--font-serif)",
                  fontSize: "32px",
                  fontWeight: 400,
                  lineHeight: 1.2,
                  color: "var(--text-primary)",
                  marginBottom: "8px",
                }}
              >
                {card.title}
              </h2>
              <div className="title-rule" />
            </div>
          )}
          <button
            onClick={onClose}
            className="btn btn-ghost"
            style={{
              fontSize: "11px",
              fontWeight: 700,
              letterSpacing: "0.1em",
              color: "var(--accent)",
              flexShrink: 0,
            }}
            aria-label="Close"
          >
            [X] CLOSE
          </button>
        </div>

        {editing ? (
          <>
            {/* Details edit */}
            <div style={{ marginBottom: "24px" }}>
              <label
                className="text-section-title"
                style={{ display: "block", marginBottom: "8px" }}
              >
                Details
              </label>
              <textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                rows={5}
                className="input"
                style={{ resize: "none" }}
                placeholder="Add details..."
              />
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
              <button type="button" className="btn btn-secondary" onClick={handleCancel}>
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleSave}
                disabled={saving || !title.trim()}
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </>
        ) : (
          <>
            {/* Description */}
            <div style={{ marginBottom: "28px" }}>
              <p
                className="text-section-title"
                style={{
                  borderBottom: "1px solid var(--border-light)",
                  paddingBottom: "8px",
                  marginBottom: "14px",
                }}
              >
                Description
              </p>
              {card.details ? (
                <p
                  style={{
                    fontSize: "14px",
                    lineHeight: 1.7,
                    color: "var(--text-secondary)",
                  }}
                >
                  {card.details}
                </p>
              ) : (
                <p
                  style={{
                    fontSize: "14px",
                    fontStyle: "italic",
                    color: "var(--text-muted)",
                  }}
                >
                  No details provided.
                </p>
              )}
            </div>

            {/* Meta grid: due date + labels + assignees */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "24px",
                marginBottom: "28px",
              }}
            >
              {/* Due Date */}
              <div>
                <p
                  className="text-section-title"
                  style={{
                    borderBottom: "1px solid var(--border-light)",
                    paddingBottom: "8px",
                    marginBottom: "14px",
                  }}
                >
                  Due Date
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                  {card.dueDate && <DueDateBadge dueDate={card.dueDate} />}
                  <DueDatePicker value={dueDateValue} onChange={handleDueDateChange} />
                </div>
              </div>

              {/* Labels */}
              <div>
                <p
                  className="text-section-title"
                  style={{
                    borderBottom: "1px solid var(--border-light)",
                    paddingBottom: "8px",
                    marginBottom: "14px",
                  }}
                >
                  Labels
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
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
              <div>
                <p
                  className="text-section-title"
                  style={{
                    borderBottom: "1px solid var(--border-light)",
                    paddingBottom: "8px",
                    marginBottom: "14px",
                  }}
                >
                  Assignees
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
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
            </div>

            {/* Edit button */}
            <button
              onClick={() => setEditing(true)}
              className="btn btn-secondary btn-sm"
              style={{ marginBottom: "28px" }}
            >
              Edit
            </button>

            {/* Comments */}
            <div
              style={{
                borderTop: "1px solid var(--border-light)",
                paddingTop: "24px",
                marginBottom: "24px",
              }}
            >
              <p
                className="text-section-title"
                style={{
                  borderBottom: "1px solid var(--border-light)",
                  paddingBottom: "8px",
                  marginBottom: "14px",
                }}
              >
                Comments
              </p>
              <CommentList cardId={card.id} currentUserId={currentUserId} />
              <CommentInput cardId={card.id} />
            </div>

            {/* Attachments */}
            <div
              style={{
                borderTop: "1px solid var(--border-light)",
                paddingTop: "24px",
              }}
            >
              <p
                className="text-section-title"
                style={{
                  borderBottom: "1px solid var(--border-light)",
                  paddingBottom: "8px",
                  marginBottom: "14px",
                }}
              >
                Attachments
              </p>
              <AttachmentList cardId={card.id} currentUserId={currentUserId} key={attachRefresh} />
              <div style={{ marginTop: "10px" }}>
                <FileUpload cardId={card.id} onUploaded={() => setAttachRefresh((n) => n + 1)} />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
