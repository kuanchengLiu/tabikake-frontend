import axios, { AxiosError } from "axios";

// All requests go through the Next.js proxy so the server can attach
// the httpOnly auth_token cookie as an Authorization header.
const BASE_URL = "/api/proxy";

export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
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
    api.post<import("./types").ParsedReceipt>("/records/parse", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  create: (data: {
    store: string;
    amount_jpy: number;
    tax_jpy: number;
    payment: string;
    category: string;
    items: { name_jp: string; name_zh: string; price: number }[];
    date: string;
    trip_id: string;
    paid_by: string;
    paid_by_name: string;
    split_with: string[];
  }) => api.post<import("./types").Record>("/records", data),
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
  create: (data: { name: string; start_date: string; end_date: string }) =>
    api.post<import("./types").Trip>("/trips", data),
};

// Split export endpoint
export const splitApi = {
  export: (tripId: string) =>
    api.post(`/split/export/${tripId}`),
};
