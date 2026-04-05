"use client";

import { DollarSign, Bell } from "lucide-react";
import { Card } from "@/global/components";
import { StatsCard } from "@/features/reports";
import { useAuthStore } from "@/global/stores/auth-store";
import { useDonations } from "@/features/donations/hooks";
import { useNotifications } from "@/features/notifications/hooks";
import { useTabNavigate } from "../use-tab-navigate";

export function DonorOverviewPanel() {
  const { user } = useAuthStore();
  const { data: donations } = useDonations();
  const { data: notifications } = useNotifications();
  const navigateTab = useTabNavigate();

  const donationCount = donations?.length ?? 0;
  const unreadCount = notifications?.filter((n) => !n.read).length ?? 0;

  return (
    <>
      <h2 className="text-heading text-2xl font-light tracking-tight mb-1">
        Welcome, {user?.full_name || "Donor"}!
      </h2>
      <p className="text-body mb-8">
        Thank you for your generosity. Here&apos;s your donation summary.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-[480px] mb-8">
        <StatsCard title="My Donations" value={String(donationCount)} />
        <StatsCard title="Unread Notifications" value={String(unreadCount)} />
      </div>

      <h3 className="text-heading text-lg font-light mb-4">Quick Actions</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-[480px]">
        <Card bordered onClick={() => navigateTab("donations")}>
          <div className="flex items-center gap-3">
            <DollarSign className="w-5 h-5 text-primary" />
            <span className="text-heading text-sm">Make a Donation</span>
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
