import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { recordsApi } from "@/lib/api";
import { QUERY_KEYS } from "@/lib/query-keys";
import type { Record } from "@/lib/types";

export function useRecords(tripId: string) {
  return useQuery<Record[]>({
    queryKey: QUERY_KEYS.records.all(tripId),
    queryFn: async () => {
      const { data } = await recordsApi.list(tripId);
      return data;
    },
    enabled: !!tripId,
  });
}

export function useDeleteRecord(tripId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => recordsApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.records.all(tripId) });
    },
  });
}

export function useUpdateRecord(tripId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof recordsApi.update>[1] }) =>
      recordsApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.records.all(tripId) });
    },
  });
}
