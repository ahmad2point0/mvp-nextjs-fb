"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/global/lib/api";

export interface PublicStats {
  totalDonations: number;
  studentsSupported: number;
  activeVolunteers: number;
  tasksCompleted: number;
}

export function usePublicStats() {
  return useQuery<PublicStats>({
    queryKey: ["public", "stats"],
    queryFn: () => api.get("/public/stats"),
    staleTime: 60_000,
  });
}
