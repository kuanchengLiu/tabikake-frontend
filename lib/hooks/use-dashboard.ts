import { useQuery } from "@tanstack/react-query";
import { dashboardApi } from "@/lib/api";
import { QUERY_KEYS } from "@/lib/query-keys";
import type { DashboardData } from "@/lib/types";

export function useDashboard(tripId: string) {
  return useQuery<DashboardData>({
    queryKey: QUERY_KEYS.dashboard.data(tripId),
    queryFn: async () => {
      const { data } = await dashboardApi.get(tripId);
      return data;
    },
    enabled: !!tripId,
  });
}
