import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/global/lib/api";
import type { UserProfile } from "@/global/stores/auth-store";

interface AdminStats {
  totalUsers: number;
  totalDonations: number;
  pendingAidRequests: number;
  activeVolunteers: number;
}

export function useAdminUsers() {
  return useQuery<UserProfile[]>({
    queryKey: ["admin", "users"],
    queryFn: () => api.get("/admin/users"),
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
      approved?: boolean;
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
