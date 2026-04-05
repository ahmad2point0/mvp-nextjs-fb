"use client";

import {
  StatsCard,
  DonationsChart,
  AidStatusChart,
  UsersByRoleChart,
} from "@/features/reports";
import { useAdminStats, useChartData } from "@/features/admin/hooks";

export function ReportsPanel() {
  const { data: stats, isLoading } = useAdminStats();
  const { data: chartData } = useChartData();

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
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">
        {cards.map((s) => (
          <StatsCard key={s.title} {...s} />
        ))}
      </div>

      {chartData && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <DonationsChart data={chartData.donationsByMonth} />
          <AidStatusChart data={chartData.aidByStatus} />
          <UsersByRoleChart data={chartData.usersByRole} />
        </div>
      )}
    </>
  );
}
