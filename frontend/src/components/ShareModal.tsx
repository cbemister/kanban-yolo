"use client";

import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { Invitation } from "@/types";
import InviteForm from "./InviteForm";
import MemberList from "./MemberList";
import toast from "react-hot-toast";

interface ShareModalProps {
  boardId: string;
  currentUserId: string;
  currentUserRole: string;
  onClose: () => void;
}

export default function ShareModal({ boardId, currentUserId, currentUserRole, onClose }: ShareModalProps) {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (currentUserRole !== "OWNER") return;
    fetch(`/api/boards/${boardId}/invitations`)
      .then((r) => r.json())
      .then(setInvitations)
      .catch(() => {});
  }, [boardId, currentUserRole]);

  async function handleCancelInvitation(invitationId: string) {
    try {
      const res = await fetch(`/api/boards/${boardId}/invitations`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invitationId }),
      });
      if (!res.ok) throw new Error();
      setInvitations((prev) => prev.filter((i) => i.id !== invitationId));
    } catch {
      toast.error("Failed to cancel invitation");
    }
  }

  function handleInviteSuccess() {
    // Refresh invitations list
    if (currentUserRole !== "OWNER") return;
    fetch(`/api/boards/${boardId}/invitations`)
      .then((r) => r.json())
      .then(setInvitations)
      .catch(() => {});
    queryClient.invalidateQueries({ queryKey: ["members", boardId] });
  }

  return (
    <div className="modal-backdrop-overlay" onClick={onClose}>
      <div
        className="modal-panel"
        style={{ padding: "28px 32px" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            marginBottom: "24px",
          }}
        >
          <div>
            <h2
              className="heading-serif"
              style={{ fontSize: "28px", marginBottom: "6px" }}
            >
              Share Board
            </h2>
            <div className="title-rule" />
          </div>
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
          >
            [X] CLOSE
          </button>
        </div>

        {currentUserRole === "OWNER" && (
          <div style={{ marginBottom: "28px" }}>
            <p
              className="text-section-title"
              style={{
                borderBottom: "1px solid var(--border-light)",
                paddingBottom: "8px",
                marginBottom: "14px",
              }}
            >
              Invite by Email
            </p>
            <InviteForm boardId={boardId} onSuccess={handleInviteSuccess} />
          </div>
        )}

        <div>
          <p
            className="text-section-title"
            style={{
              borderBottom: "1px solid var(--border-light)",
              paddingBottom: "8px",
              marginBottom: "14px",
            }}
          >
            Members
          </p>
          <MemberList
            boardId={boardId}
            currentUserId={currentUserId}
            currentUserRole={currentUserRole}
            pendingInvitations={invitations}
            onCancelInvitation={handleCancelInvitation}
          />
        </div>
      </div>
    </div>
  );
}
