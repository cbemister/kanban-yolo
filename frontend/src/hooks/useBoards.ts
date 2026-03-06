import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface BoardSummary {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  _count: { columns: number };
}

export function useBoards() {
  return useQuery<BoardSummary[]>({
    queryKey: ["boards"],
    queryFn: async () => {
      const res = await fetch("/api/boards");
      if (!res.ok) throw new Error("Failed to fetch boards");
      return res.json();
    },
  });
}

export function useBoardMutations() {
  const queryClient = useQueryClient();

  const createBoard = useMutation({
    mutationFn: async ({ title, templateId }: { title: string; templateId?: string }) => {
      const res = await fetch("/api/boards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, templateId }),
      });
      if (!res.ok) throw new Error("Failed to create board");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["boards"] });
    },
  });

  const deleteBoard = useMutation({
    mutationFn: async (boardId: string) => {
      const res = await fetch(`/api/boards/${boardId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete board");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["boards"] });
    },
  });

  return { createBoard, deleteBoard };
}
