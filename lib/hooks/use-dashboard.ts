import { useQuery } from "@tanstack/react-query";
import { dashboardApi } from "@/lib/api";
import { QUERY_KEYS } from "@/lib/query-keys";
import type { DashboardData, Record, User } from "@/lib/types";

type BackendDashboardData = {
  total_jpy?: number;
  total_twd?: number;
  by_person?: { user_id: string; name: string; amount: number }[];
  by_member?: { user: User; paid_jpy: number; percentage: number }[];
  by_category?: { category: string; amount?: number; amount_jpy?: number }[];
  records?: Record[];
};

function normalizeDashboard(data: BackendDashboardData): DashboardData {
  return {
    total_jpy: data.total_jpy ?? 0,
    total_twd: data.total_twd ?? 0,
    by_person:
      data.by_person ??
      data.by_member?.map((item) => ({
        user_id: item.user.id,
        name: item.user.name,
        amount: item.paid_jpy ?? 0,
      })) ??
      [],
    by_category:
      data.by_category?.map((item) => ({
        category: item.category || "未分類",
        amount: item.amount ?? item.amount_jpy ?? 0,
      })) ?? [],
    records: data.records ?? [],
  };
}

export function useDashboard(tripId: string) {
  return useQuery<DashboardData>({
    queryKey: QUERY_KEYS.dashboard.data(tripId),
    queryFn: async () => {
      const { data } = await dashboardApi.get(tripId);
      return normalizeDashboard(data);
    },
    enabled: !!tripId,
  });
}
