import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Label } from "@/types";

export function useLabels(boardId: string, options?: { enabled?: boolean }) {
  return useQuery<Label[]>({
    queryKey: ["labels", boardId],
    queryFn: async () => {
      const res = await fetch(`/api/boards/${boardId}/labels`);
      if (!res.ok) throw new Error("Failed to fetch labels");
      return res.json();
    },
    enabled: !!boardId && options?.enabled !== false,
    staleTime: 30_000,
  });
}

export function useLabelMutations(boardId: string) {
  const queryClient = useQueryClient();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["labels", boardId] });
    queryClient.invalidateQueries({ queryKey: ["board", boardId] });
  };

  const createLabel = useMutation({
    mutationFn: async (data: { name: string; color: string }) => {
      const res = await fetch(`/api/boards/${boardId}/labels`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create label");
      return res.json();
    },
    onSuccess: invalidate,
  });

  const updateLabel = useMutation({
    mutationFn: async ({ labelId, ...data }: { labelId: string; name?: string; color?: string }) => {
      const res = await fetch(`/api/boards/${boardId}/labels/${labelId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update label");
      return res.json();
    },
    onSuccess: invalidate,
  });

  const deleteLabel = useMutation({
    mutationFn: async (labelId: string) => {
      const res = await fetch(`/api/boards/${boardId}/labels/${labelId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete label");
    },
    onSuccess: invalidate,
  });

  return { createLabel, updateLabel, deleteLabel };
}
