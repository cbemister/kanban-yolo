"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useMembers, useMemberMutations } from "@/hooks/useMembers";
import type { Invitation } from "@/types";
import UserAvatar from "./UserAvatar";
import toast from "react-hot-toast";

interface MemberListProps {
  boardId: string;
  currentUserId: string;
  currentUserRole: string;
  pendingInvitations: Invitation[];
  onCancelInvitation: (invitationId: string) => void;
}

export default function MemberList({
  boardId,
  currentUserId,
  currentUserRole,
  pendingInvitations,
  onCancelInvitation,
}: MemberListProps) {
  const { data: members = [] } = useMembers(boardId);
  const { updateRole, removeMember } = useMemberMutations(boardId);
  const queryClient = useQueryClient();

  async function handleRoleChange(userId: string, role: string) {
    try {
      await updateRole.mutateAsync({ userId, role });
    } catch {
      toast.error("Failed to update role");
    }
  }

  async function handleRemove(userId: string) {
    try {
      await removeMember.mutateAsync(userId);
      queryClient.invalidateQueries({ queryKey: ["members", boardId] });
    } catch {
      toast.error("Failed to remove member");
    }
  }

  return (
    <div className="space-y-1">
      {members.map((member) => (
        <div
          key={member.userId}
          className="flex items-center gap-3 py-2"
          style={{ borderBottom: "1px solid var(--border-light)" }}
        >
          <UserAvatar user={member.user} size="md" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>
              {member.user.name ?? member.user.email}
            </p>
            {member.user.name && (
              <p className="text-xs truncate" style={{ color: "var(--text-muted)" }}>{member.user.email}</p>
            )}
          </div>
          {currentUserRole === "OWNER" && member.role !== "OWNER" ? (
            <select
              value={member.role}
              onChange={(e) => handleRoleChange(member.userId, e.target.value)}
              className="input text-xs"
              style={{ width: "auto", padding: "4px 8px" }}
            >
              <option value="EDITOR">Editor</option>
              <option value="VIEWER">Viewer</option>
            </select>
          ) : (
            <span
              className="text-section-title px-2 py-1"
              style={{ color: "var(--text-muted)" }}
            >
              {member.role}
            </span>
          )}
          {(currentUserRole === "OWNER" && member.role !== "OWNER") ||
           (currentUserId === member.userId && member.role !== "OWNER") ? (
            <button
              onClick={() => handleRemove(member.userId)}
              className="btn-ghost text-xs"
              style={{ color: "var(--accent-danger)" }}
            >
              Remove
            </button>
          ) : null}
        </div>
      ))}

      {pendingInvitations.length > 0 && (
        <div className="mt-3 pt-3" style={{ borderTop: "1px solid var(--border-light)" }}>
          <p className="text-section-title mb-2">
            Pending Invitations
          </p>
          {pendingInvitations.map((inv) => (
            <div
              key={inv.id}
              className="flex items-center gap-3 py-1.5"
              style={{ borderBottom: "1px solid var(--border-light)" }}
            >
              <div
                className="w-8 h-8 flex items-center justify-center text-xs"
                style={{ background: "var(--bg-surface)", color: "var(--text-muted)", border: "1px solid var(--border-light)" }}
              >
                ?
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm truncate" style={{ color: "var(--text-secondary)" }}>{inv.email}</p>
              </div>
              <span
                className="label-chip"
                style={{ color: "var(--accent)", borderColor: "var(--accent)" }}
              >
                {inv.role}
              </span>
              {currentUserRole === "OWNER" && (
                <button
                  onClick={() => onCancelInvitation(inv.id)}
                  className="btn-ghost text-xs"
                  style={{ color: "var(--accent-danger)" }}
                >
                  Cancel
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
