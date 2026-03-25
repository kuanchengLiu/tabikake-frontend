import { useQuery } from "@tanstack/react-query";
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
