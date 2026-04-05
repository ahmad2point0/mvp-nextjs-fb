"use client";

import { Users, DollarSign, TrendingUp } from "lucide-react";
import { Card } from "@/global/components";
import { StatsCard } from "@/features/reports";
import { useAdminStats } from "@/features/admin/hooks";
import { useNotifications } from "@/features/notifications/hooks";
import { NotificationCard } from "@/features/notifications";
import { useTabNavigate } from "../use-tab-navigate";

const quickActions = [
  { label: "Manage Users", tab: "users", icon: Users },
  { label: "View Donations", tab: "donations", icon: DollarSign },
  { label: "View Reports", tab: "reports", icon: TrendingUp },
];

export function AdminOverviewPanel() {
  const { data: stats, isLoading } = useAdminStats();
  const { data: notifications } = useNotifications();
  const navigateTab = useTabNavigate();

  const recentNotifications = (notifications ?? []).slice(0, 5);

  const statCards = [
    {
      title: "Total Donations",
      value: isLoading
        ? "..."
        : `Rs. ${(stats?.totalDonations ?? 0).toLocaleString()}`,
    },
    {
      title: "Total Users",
      value: isLoading ? "..." : String(stats?.totalUsers ?? 0),
    },
    {
      title: "Active Volunteers",
      value: isLoading ? "..." : String(stats?.activeVolunteers ?? 0),
    },
    {
      title: "Pending Aid Requests",
      value: isLoading ? "..." : String(stats?.pendingAidRequests ?? 0),
    },
  ];

  return (
    <>
      <h2 className="text-heading text-2xl font-light tracking-tight mb-6">
        Admin Overview
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
        {statCards.map((s) => (
          <StatsCard key={s.title} {...s} />
        ))}
      </div>

      <h3 className="text-heading text-lg font-light mb-4">Quick Actions</h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <Card
              key={action.tab}
              bordered
              onClick={() => navigateTab(action.tab)}
            >
              <div className="flex items-center gap-3">
                <Icon className="w-5 h-5 text-primary" />
                <span className="text-heading text-sm">{action.label}</span>
              </div>
            </Card>
          );
        })}
      </div>

      {recentNotifications.length > 0 && (
        <>
          <h3 className="text-heading text-lg font-light mb-4">
            Recent Notifications
          </h3>
          <div className="flex flex-col gap-3">
            {recentNotifications.map((n) => (
              <NotificationCard
                key={n.id}
                icon={n.icon || "bell"}
                title={n.title}
                message={n.message}
                time={new Date(n.created_at).toLocaleDateString()}
                read={n.read}
              />
            ))}
          </div>
        </>
      )}
    </>
  );
}
