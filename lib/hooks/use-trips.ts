import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { tripsApi } from "@/lib/api";
import { QUERY_KEYS } from "@/lib/query-keys";
import type { Trip } from "@/lib/types";

export function useTrips() {
  return useQuery<Trip[]>({
    queryKey: QUERY_KEYS.trips.all,
    queryFn: async () => {
      const { data } = await tripsApi.list();
      return data;
    },
  });
}

export function useTrip(id: string | null) {
  return useQuery<Trip>({
    queryKey: QUERY_KEYS.trips.one(id ?? ""),
    queryFn: async () => {
      const { data } = await tripsApi.get(id!);
      return data;
    },
    enabled: !!id,
  });
}

export function useCreateTrip() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      name: string;
      start_date: string;
      end_date: string;
      budget_jpy?: number;
      budget_suica?: number;
    }) => tripsApi.create(data).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.trips.all });
    },
  });
}
