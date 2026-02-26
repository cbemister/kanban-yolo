import { useQuery } from "@tanstack/react-query";
import type { Column } from "@/types";

export interface BoardDetail {
  id: string;
  title: string;
  ownerId: string;
  columns: Column[];
}

export function useBoard(boardId: string) {
  return useQuery<BoardDetail>({
    queryKey: ["board", boardId],
    queryFn: async () => {
      const res = await fetch(`/api/boards/${boardId}`);
      if (!res.ok) throw new Error("Failed to fetch board");
      return res.json();
    },
    enabled: !!boardId,
  });
}
