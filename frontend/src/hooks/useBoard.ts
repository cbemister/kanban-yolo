import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { Column } from "@/types";

export interface BoardDetail {
  id: string;
  title: string;
  ownerId: string;
  columns: Column[];
  labels?: { id: string; name: string; color: string }[];
}

export function useBoard(boardId: string) {
  const queryClient = useQueryClient();

  return useQuery<BoardDetail>({
    queryKey: ["board", boardId],
    queryFn: async () => {
      const res = await fetch(`/api/boards/${boardId}`);
      if (!res.ok) throw new Error("Failed to fetch board");
      const data: BoardDetail = await res.json();

      // Seed labels cache from board response to avoid a separate fetch
      if (data.labels) {
        queryClient.setQueryData(["labels", boardId], data.labels);
      }

      return data;
    },
    enabled: !!boardId,
  });
}
