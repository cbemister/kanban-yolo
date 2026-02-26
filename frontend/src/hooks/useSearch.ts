import { useQuery } from "@tanstack/react-query";

export interface SearchResult {
  id: string;
  title: string;
  details: string;
  dueDate: string | null;
  column: { id: string; title: string };
  labels: Array<{ labelId: string; label: { id: string; name: string; color: string; boardId: string } }>;
  assignees: Array<{ userId: string; user: { id: string; name: string | null; email: string; image: string | null } }>;
}

export function useSearch(boardId: string, query: string) {
  return useQuery<SearchResult[]>({
    queryKey: ["search", boardId, query],
    queryFn: async () => {
      const params = new URLSearchParams({ q: query });
      const res = await fetch(`/api/boards/${boardId}/search?${params}`);
      if (!res.ok) throw new Error("Search failed");
      return res.json();
    },
    enabled: !!boardId && query.length >= 1,
  });
}
