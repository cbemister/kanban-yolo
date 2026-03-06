"use client";

import { useBoardChannel } from "@/hooks/useBoardChannel";
import UserAvatar from "./UserAvatar";

interface PresenceIndicatorProps {
  boardId: string;
}

export default function PresenceIndicator({ boardId }: PresenceIndicatorProps) {
  const { onlineUsers } = useBoardChannel(boardId);

  if (onlineUsers.length === 0) return null;

  const visible = onlineUsers.slice(0, 5);
  const overflow = onlineUsers.length - 5;

  return (
    <div className="flex items-center">
      <div className="flex -space-x-1.5">
        {visible.map((user) => (
          <div key={user.id} className="relative">
            <UserAvatar
              user={{ id: user.id, name: user.name, email: user.name ?? user.id, image: user.image }}
              size="sm"
            />
            <span
              className="absolute bottom-0 right-0 w-2 h-2"
              style={{ background: "var(--label-sage)", border: "1px solid var(--bg-base)" }}
            />
          </div>
        ))}
        {overflow > 0 && (
          <span
            className="w-6 h-6 text-xs flex items-center justify-center font-medium"
            style={{ background: "var(--bg-card)", color: "var(--text-muted)", border: "1px solid var(--border-color)" }}
          >
            +{overflow}
          </span>
        )}
      </div>
    </div>
  );
}
