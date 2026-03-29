import axios, { AxiosError } from "axios";
import { useTripStore } from "@/store/trip-store";

// All requests go through the Next.js proxy so the server can attach
// the httpOnly auth_token cookie as an Authorization header.
const BASE_URL = "/api/proxy";

export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor: attach X-Member-ID from Zustand store
api.interceptors.request.use((config) => {
  const memberId = useTripStore.getState().currentMemberID;
  if (memberId) {
    config.headers["X-Member-ID"] = memberId;
  }
  return config;
});

// Response interceptor: on 401 redirect to login
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

// Helper to extract error message from API error
export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string } | undefined;
    return data?.message ?? error.message;
  }
  if (error instanceof Error) return error.message;
  return "An unexpected error occurred";
}

// Auth endpoints
export const authApi = {
  me: () => api.get<import("./types").User>("/auth/me"),
  notionCallback: (code: string) =>
    api.post<{ token: string; user: import("./types").User }>(
      "/auth/notion/callback",
      { code }
    ),
  logout: () => api.post("/auth/logout"),
};

// Records endpoints
export const recordsApi = {
  parse: (formData: FormData) =>
    api.post<import("./types").ParsedReceipt>("/parse", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  create: (data: {
    store: string;
    amount_jpy: number;
    amount_twd?: number;
    tax_jpy: number;
    payment: string;
    category: string;
    items: { name_jp: string; name_zh: string; price: number }[];
    date: string;
    trip_id: string;
    paid_by_member_id: string;
    split_with: string[];
  }) => api.post<import("./types").Record>("/records", data),
  update: (
    id: string,
    data: Partial<{
      store: string;
      amount_jpy: number;
      tax_jpy: number;
      payment: string;
      category: string;
      items: { name_jp: string; name_zh: string; price: number }[];
      date: string;
      paid_by_member_id: string;
      split_with: string[];
    }>
  ) => api.patch<import("./types").Record>(`/records/${id}`, data),
  delete: (id: string) => api.delete(`/records/${id}`),
  list: (tripId: string) =>
    api.get<import("./types").Record[]>("/records", {
      params: { trip_id: tripId },
    }),
};

// Dashboard endpoint
export const dashboardApi = {
  get: (tripId: string) =>
    api.get<import("./types").DashboardData>(`/dashboard/${tripId}`),
};

// Trips endpoints
export const tripsApi = {
  list: () => api.get<import("./types").Trip[]>("/trips"),
  get: (id: string) => api.get<import("./types").Trip>(`/trips/${id}`),
  create: (data: {
    name: string;
    start_date: string;
    end_date: string;
    owner_name: string;
    owner_avatar_color: string;
  }) =>
    api.post<{ trip: import("./types").Trip; owner: import("./types").Member }>(
      "/trips",
      data
    ),
};

// Members endpoints
export const membersApi = {
  list: (tripId: string) =>
    api.get<import("./types").Member[]>(`/trips/${tripId}/members`),
  create: (tripId: string, data: { name: string; avatar_color: string }) =>
    api.post<import("./types").Member>(`/trips/${tripId}/members`, data),
  delete: (tripId: string, memberId: string) =>
    api.delete(`/trips/${tripId}/members/${memberId}`),
};

// Settlement endpoint
export const settlementApi = {
  get: (tripId: string) =>
    api.get<import("./types").SettlementResult>(`/trips/${tripId}/settlement`),
};

// Join trip endpoints
export const joinApi = {
  info: (code: string) =>
    api.get<import("./types").JoinInfo>(`/trips/join-info?code=${code}`),
  join: (data: { invite_code: string; name: string; avatar_color: string }) =>
    api.post<{ trip: import("./types").Trip; member: import("./types").Member }>(
      "/trips/join",
      data
    ),
};

// Split export endpoint
export const splitApi = {
  export: (tripId: string) => api.post(`/split/export/${tripId}`),
};
