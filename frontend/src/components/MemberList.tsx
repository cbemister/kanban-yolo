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
        <div key={member.userId} className="flex items-center gap-3 py-2">
          <UserAvatar user={member.user} size="md" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {member.user.name ?? member.user.email}
            </p>
            {member.user.name && (
              <p className="text-xs truncate" style={{ color: "#888888" }}>{member.user.email}</p>
            )}
          </div>
          {currentUserRole === "OWNER" && member.role !== "OWNER" ? (
            <select
              value={member.role}
              onChange={(e) => handleRoleChange(member.userId, e.target.value)}
              className="text-xs border border-gray-200 rounded px-2 py-1 focus:outline-none"
            >
              <option value="EDITOR">Editor</option>
              <option value="VIEWER">Viewer</option>
            </select>
          ) : (
            <span className="text-xs px-2 py-1 rounded bg-gray-100" style={{ color: "#888888" }}>
              {member.role}
            </span>
          )}
          {(currentUserRole === "OWNER" && member.role !== "OWNER") ||
           (currentUserId === member.userId && member.role !== "OWNER") ? (
            <button
              onClick={() => handleRemove(member.userId)}
              className="text-xs text-red-500 hover:text-red-700 transition-colors ml-1"
            >
              Remove
            </button>
          ) : null}
        </div>
      ))}

      {pendingInvitations.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: "#888888" }}>
            Pending Invitations
          </p>
          {pendingInvitations.map((inv) => (
            <div key={inv.id} className="flex items-center gap-3 py-1.5">
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs text-gray-400">
                ?
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-600 truncate">{inv.email}</p>
              </div>
              <span className="text-xs px-2 py-1 rounded" style={{ background: "#ecad0a22", color: "#ecad0a" }}>
                {inv.role}
              </span>
              {currentUserRole === "OWNER" && (
                <button
                  onClick={() => onCancelInvitation(inv.id)}
                  className="text-xs text-red-500 hover:text-red-700 transition-colors ml-1"
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
