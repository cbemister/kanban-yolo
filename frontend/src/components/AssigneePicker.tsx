"use client";

import { useState, useRef, useEffect } from "react";
import { useMembers } from "@/hooks/useMembers";
import UserAvatar from "./UserAvatar";

interface AssigneePickerProps {
  boardId: string;
  cardId: string;
  assigneeIds: string[];
  onToggle: (userId: string) => void;
}

export default function AssigneePicker({ boardId, assigneeIds, onToggle }: AssigneePickerProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { data: members = [] } = useMembers(boardId);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="text-xs font-medium px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
        style={{ color: "#209dd7" }}
      >
        Assignees
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-1 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-20 py-1">
          {members.length === 0 && (
            <p className="px-3 py-2 text-xs" style={{ color: "#888888" }}>No board members yet.</p>
          )}
          {members.map((member) => (
            <button
              key={member.userId}
              type="button"
              onClick={() => onToggle(member.userId)}
              className="flex items-center gap-2 w-full px-3 py-2 hover:bg-gray-50 transition-colors"
            >
              <span
                className="w-4 h-4 flex-shrink-0 rounded border border-gray-300 flex items-center justify-center text-xs font-bold"
                style={assigneeIds.includes(member.userId) ? { background: "#753991", borderColor: "#753991", color: "white" } : {}}
              >
                {assigneeIds.includes(member.userId) ? "x" : ""}
              </span>
              <UserAvatar user={member.user} size="sm" />
              <span className="text-sm text-gray-700 truncate">{member.user.name ?? member.user.email}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
