import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { BoardMember } from "@/types";

export function useMembers(boardId: string, options?: { enabled?: boolean }) {
  return useQuery<BoardMember[]>({
    queryKey: ["members", boardId],
    queryFn: async () => {
      const res = await fetch(`/api/boards/${boardId}/members`);
      if (!res.ok) throw new Error("Failed to fetch members");
      return res.json();
    },
    enabled: !!boardId && options?.enabled !== false,
  });
}

export function useMemberMutations(boardId: string) {
  const queryClient = useQueryClient();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["members", boardId] });
  };

  const updateRole = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      const res = await fetch(`/api/boards/${boardId}/members/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      if (!res.ok) throw new Error("Failed to update role");
      return res.json();
    },
    onSuccess: invalidate,
  });

  const removeMember = useMutation({
    mutationFn: async (userId: string) => {
      const res = await fetch(`/api/boards/${boardId}/members/${userId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to remove member");
    },
    onSuccess: invalidate,
  });

  return { updateRole, removeMember };
}
