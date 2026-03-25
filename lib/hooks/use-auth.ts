import { useQuery } from "@tanstack/react-query";
import { authApi } from "@/lib/api";
import { QUERY_KEYS } from "@/lib/query-keys";
import type { User } from "@/lib/types";

export function useAuth() {
  return useQuery<User>({
    queryKey: QUERY_KEYS.auth.me,
    queryFn: async () => {
      const { data } = await authApi.me();
      return data;
    },
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
}
