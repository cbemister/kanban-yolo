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
    <div
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-xl p-6 w-full max-w-lg mx-4 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-7 h-7 rounded-full flex items-center justify-center bg-gray-100 hover:bg-gray-200 transition-colors text-gray-500 text-sm font-bold"
        >
          x
        </button>

        <h2 className="text-lg font-bold mb-1" style={{ color: "#032147" }}>Share Board</h2>

        {currentUserRole === "OWNER" && (
          <div className="mb-6">
            <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: "#888888" }}>
              Invite by Email
            </p>
            <InviteForm boardId={boardId} onSuccess={handleInviteSuccess} />
          </div>
        )}

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: "#888888" }}>
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
