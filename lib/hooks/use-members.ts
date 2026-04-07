import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { membersApi } from "@/lib/api";
import { QUERY_KEYS } from "@/lib/query-keys";
import type { Member } from "@/lib/types";

export function useMembers(tripId: string | null) {
  return useQuery<Member[]>({
    queryKey: QUERY_KEYS.members.list(tripId ?? ""),
    queryFn: async () => {
      const { data } = await membersApi.list(tripId!);
      return data;
    },
    enabled: !!tripId,
  });
}

export function useRemoveMember(tripId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => membersApi.delete(tripId, userId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.members.list(tripId) });
    },
  });
}
