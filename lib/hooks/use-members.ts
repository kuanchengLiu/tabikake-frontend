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

export function useCreateMember(tripId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; avatar_color: string }) =>
      membersApi.create(tripId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.members.list(tripId) });
    },
  });
}
