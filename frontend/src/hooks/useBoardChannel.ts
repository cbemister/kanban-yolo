"use client";

import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { getPusherClient } from "@/lib/pusher-client";

interface OnlineUser {
  id: string;
  name: string | null;
  image: string | null;
}

export function useBoardChannel(boardId: string) {
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);

  useEffect(() => {
    if (!boardId || !process.env.NEXT_PUBLIC_PUSHER_KEY || process.env.NEXT_PUBLIC_PUSHER_KEY === "placeholder") {
      return;
    }

    const currentUserId = session?.user?.id;
    const pusher = getPusherClient();
    const channel = pusher.subscribe(`presence-board-${boardId}`) as ReturnType<typeof pusher.subscribe> & {
      members: {
        me: { id: string; info: { name: string | null; image: string | null } };
        each: (cb: (member: { id: string; info: { name: string | null; image: string | null } }) => void) => void;
      };
    };

    function invalidateBoard(eventData?: { userId?: string }) {
      if (eventData?.userId && currentUserId && eventData.userId === currentUserId) return;
      queryClient.invalidateQueries({ queryKey: ["board", boardId] });
    }

    function invalidateLabels(eventData?: { userId?: string }) {
      if (eventData?.userId && currentUserId && eventData.userId === currentUserId) return;
      queryClient.invalidateQueries({ queryKey: ["labels", boardId] });
      queryClient.invalidateQueries({ queryKey: ["board", boardId] });
    }

    function invalidateMembers(eventData?: { userId?: string }) {
      if (eventData?.userId && currentUserId && eventData.userId === currentUserId) return;
      queryClient.invalidateQueries({ queryKey: ["members", boardId] });
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

    const cardColumnEvents = [
      "card:created", "card:updated", "card:deleted", "card:moved",
      "column:created", "column:updated", "column:deleted",
    ];

    const labelEvents = ["label:created", "label:updated", "label:deleted"];
    const memberEvents = ["member:added", "member:removed"];

    for (const event of cardColumnEvents) {
      channel.bind(event, invalidateBoard);
    }
    for (const event of labelEvents) {
      channel.bind(event, invalidateLabels);
    }
    for (const event of memberEvents) {
      channel.bind(event, invalidateMembers);
    }

    return () => {
      for (const event of cardColumnEvents) {
        channel.unbind(event, invalidateBoard);
      }
      for (const event of labelEvents) {
        channel.unbind(event, invalidateLabels);
      }
      for (const event of memberEvents) {
        channel.unbind(event, invalidateMembers);
      }
      pusher.unsubscribe(`presence-board-${boardId}`);
    };
  }, [boardId, queryClient, session?.user?.id]);

  return { onlineUsers };
}
