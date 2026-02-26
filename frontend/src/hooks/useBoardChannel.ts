"use client";

import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getPusherClient } from "@/lib/pusher-client";

interface OnlineUser {
  id: string;
  name: string | null;
  image: string | null;
}

export function useBoardChannel(boardId: string) {
  const queryClient = useQueryClient();
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);

  useEffect(() => {
    if (!boardId || !process.env.NEXT_PUBLIC_PUSHER_KEY || process.env.NEXT_PUBLIC_PUSHER_KEY === "placeholder") {
      return;
    }

    const pusher = getPusherClient();
    const channel = pusher.subscribe(`presence-board-${boardId}`) as ReturnType<typeof pusher.subscribe> & {
      members: {
        me: { id: string; info: { name: string | null; image: string | null } };
        each: (cb: (member: { id: string; info: { name: string | null; image: string | null } }) => void) => void;
      };
    };

    function invalidateBoard() {
      queryClient.invalidateQueries({ queryKey: ["board", boardId] });
    }

    channel.bind("pusher:subscription_succeeded", () => {
      const users: OnlineUser[] = [];
      channel.members.each((member) => {
        users.push({ id: member.id, name: member.info.name, image: member.info.image });
      });
      setOnlineUsers(users);
    });

    channel.bind("pusher:member_added", (member: { id: string; info: { name: string | null; image: string | null } }) => {
      setOnlineUsers((prev) => {
        if (prev.some((u) => u.id === member.id)) return prev;
        return [...prev, { id: member.id, name: member.info.name, image: member.info.image }];
      });
    });

    channel.bind("pusher:member_removed", (member: { id: string }) => {
      setOnlineUsers((prev) => prev.filter((u) => u.id !== member.id));
    });

    const dataEvents = [
      "card:created", "card:updated", "card:deleted", "card:moved",
      "column:created", "column:updated", "column:deleted",
      "label:created", "label:updated", "label:deleted",
      "member:added", "member:removed",
    ];

    for (const event of dataEvents) {
      channel.bind(event, invalidateBoard);
    }

    return () => {
      for (const event of dataEvents) {
        channel.unbind(event, invalidateBoard);
      }
      pusher.unsubscribe(`presence-board-${boardId}`);
    };
  }, [boardId, queryClient]);

  return { onlineUsers };
}
