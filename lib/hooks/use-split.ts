import { useMutation, useQueryClient } from "@tanstack/react-query";
import { splitApi, getErrorMessage } from "@/lib/api";
import { QUERY_KEYS } from "@/lib/query-keys";

export function useSplitExport(tripId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => splitApi.export(tripId),
    onSuccess: () => {
      // Invalidate dashboard to reflect updated settlements
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.dashboard.data(tripId),
      });
    },
    onError: (err) => {
      console.error("Split export failed:", getErrorMessage(err));
    },
  });
}
