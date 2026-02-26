import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { CardAssignee } from "@/types";

export function useAssignees(cardId: string) {
  return useQuery<CardAssignee[]>({
    queryKey: ["assignees", cardId],
    queryFn: async () => {
      const res = await fetch(`/api/cards/${cardId}/assignees`);
      if (!res.ok) throw new Error("Failed to fetch assignees");
      return res.json();
    },
    enabled: !!cardId,
  });
}

export function useAssigneeMutations(cardId: string, boardId: string) {
  const queryClient = useQueryClient();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["assignees", cardId] });
    queryClient.invalidateQueries({ queryKey: ["board", boardId] });
  };

  const assign = useMutation({
    mutationFn: async (userId: string) => {
      const res = await fetch(`/api/cards/${cardId}/assignees`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      if (!res.ok) throw new Error("Failed to assign user");
      return res.json();
    },
    onSuccess: invalidate,
  });

  const unassign = useMutation({
    mutationFn: async (userId: string) => {
      const res = await fetch(`/api/cards/${cardId}/assignees`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      if (!res.ok) throw new Error("Failed to unassign user");
    },
    onSuccess: invalidate,
  });

  return { assign, unassign };
}
