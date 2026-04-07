import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/global/lib/api";
import type { UserProfile } from "@/global/stores/auth-store";

interface AdminStats {
  totalUsers: number;
  totalDonations: number;
  pendingAidRequests: number;
  activeVolunteers: number;
}

export interface AdminUserFilters {
  role?: string;
  verified?: boolean;
  blocked?: boolean;
}

function toQueryString(filters?: AdminUserFilters) {
  if (!filters) return "";
  const params = new URLSearchParams();
  if (filters.role) params.set("role", filters.role);
  if (filters.verified !== undefined)
    params.set("verified", String(filters.verified));
  if (filters.blocked !== undefined)
    params.set("blocked", String(filters.blocked));
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

export function useAdminUsers(filters?: AdminUserFilters) {
  return useQuery<UserProfile[]>({
    queryKey: ["admin", "users", filters ?? {}],
    queryFn: () => api.get(`/admin/users${toQueryString(filters)}`),
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      ...body
    }: {
      id: string;
      is_blocked?: boolean;
      role?: string;
    }) => api.patch(`/admin/users/${id}`, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
  });
}

export function useAdminStats() {
  return useQuery<AdminStats>({
    queryKey: ["admin", "stats"],
    queryFn: () => api.get("/admin/stats"),
  });
}

interface ChartData {
  donationsByMonth: { month: string; amount: number; count: number }[];
  aidByStatus: { status: string; count: number }[];
  usersByRole: { role: string; count: number }[];
}

export function useChartData() {
  return useQuery<ChartData>({
    queryKey: ["admin", "chart-data"],
    queryFn: () => api.get("/admin/chart-data"),
  });
}
