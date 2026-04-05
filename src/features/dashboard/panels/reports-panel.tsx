"use client";

import { StatsCard } from "@/features/reports";
import { useAdminStats } from "@/features/admin/hooks";

export function ReportsPanel() {
  const { data: stats, isLoading } = useAdminStats();

  const cards = [
    {
      title: "Total Donations",
      value: isLoading
        ? "..."
        : `Rs. ${(stats?.totalDonations ?? 0).toLocaleString()}`,
    },
    {
      title: "Active Volunteers",
      value: isLoading ? "..." : String(stats?.activeVolunteers ?? 0),
    },
    {
      title: "Total Users",
      value: isLoading ? "..." : String(stats?.totalUsers ?? 0),
    },
    {
      title: "Pending Aid Requests",
      value: isLoading ? "..." : String(stats?.pendingAidRequests ?? 0),
    },
  ];

  return (
    <>
      <h2 className="text-heading text-2xl font-light tracking-tight mb-6">
        Reports & Statistics
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {cards.map((s) => (
          <StatsCard key={s.title} {...s} />
        ))}
      </div>
    </>
  );
}
