export const QUERY_KEYS = {
  auth: {
    me: ["auth", "me"] as const,
  },
  trips: {
    all: ["trips"] as const,
    one: (id: string) => ["trips", id] as const,
  },
  records: {
    all: (tripId: string) => ["records", tripId] as const,
  },
  dashboard: {
    data: (tripId: string) => ["dashboard", tripId] as const,
  },
} as const;
