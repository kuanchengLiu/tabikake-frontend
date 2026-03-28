import { useQuery } from "@tanstack/react-query";
import { settlementApi } from "@/lib/api";
import { QUERY_KEYS } from "@/lib/query-keys";
import type { SettlementResult } from "@/lib/types";

export function useSettlement(tripId: string | null) {
  return useQuery<SettlementResult>({
    queryKey: QUERY_KEYS.settlement.data(tripId ?? ""),
    queryFn: async () => {
      const { data } = await settlementApi.get(tripId!);
      return data;
    },
    enabled: !!tripId,
  });
}
