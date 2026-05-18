"use client";

import { ClipboardList, Bell } from "lucide-react";
import { Card } from "@/global/components";
import { StatsCard } from "@/features/reports";
import { useAuthStore } from "@/global/stores/auth-store";
import { useAidRequests } from "@/features/aid-requests/hooks";
import { useNotifications } from "@/features/notifications/hooks";
import { useTabNavigate } from "../use-tab-navigate";

export function DonorOverviewPanel() {
  const { user } = useAuthStore();
  const { data: openRequests } = useAidRequests();
  const { data: myAccepted } = useAidRequests({ scope: "mine" });
  const { data: notifications } = useNotifications();
  const navigateTab = useTabNavigate();

  const openCount = openRequests?.length ?? 0;
  const acceptedCount = myAccepted?.length ?? 0;
  const unreadCount = notifications?.filter((n) => !n.read).length ?? 0;

  return (
    <>
      <h2 className="text-heading text-2xl font-light tracking-tight mb-1">
        Welcome, {user?.full_name || "Donor"}!
      </h2>
      <p className="text-body mb-8">
        Thank you for your generosity. Pick a request to support below.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 max-w-180 mb-8">
        <StatsCard
          title="Open Aid Requests"
          value={String(openCount)}
        />
        <StatsCard
          title="My Accepted Requests"
          value={String(acceptedCount)}
        />
        <StatsCard
          title="Unread Notifications"
          value={String(unreadCount)}
        />
      </div>

      <h3 className="text-heading text-lg font-light mb-4">Quick Actions</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-120">
        <Card bordered onClick={() => navigateTab("aid-requests")}>
          <div className="flex items-center gap-3">
            <ClipboardList className="w-5 h-5 text-primary" />
            <span className="text-heading text-sm">Browse Aid Requests</span>
          </div>
        </Card>
        <Card bordered onClick={() => navigateTab("notifications")}>
          <div className="flex items-center gap-3">
            <Bell className="w-5 h-5 text-primary" />
            <span className="text-heading text-sm">View Notifications</span>
          </div>
        </Card>
      </div>
    </>
  );
}
