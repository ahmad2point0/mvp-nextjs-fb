"use client";

import { ClipboardList, Bell } from "lucide-react";
import { Card } from "@/global/components";
import { StatsCard } from "@/features/reports";
import { useAuthStore } from "@/global/stores/auth-store";
import { useAidRequests } from "@/features/aid-requests/hooks";
import { useTabNavigate } from "../use-tab-navigate";

export function StudentOverviewPanel() {
  const { user } = useAuthStore();
  const { data: requests } = useAidRequests();
  const navigateTab = useTabNavigate();

  const pending = requests?.filter((r) => r.status === "pending").length ?? 0;
  const approved = requests?.filter((r) => r.status === "approved").length ?? 0;
  const total = requests?.length ?? 0;

  return (
    <>
      <h2 className="text-heading text-2xl font-light tracking-tight mb-1">
        Welcome, {user?.full_name || "Student"}!
      </h2>
      <p className="text-body mb-8">
        Here&apos;s a summary of your aid requests.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 max-w-[600px] mb-8">
        <StatsCard title="Pending" value={String(pending)} />
        <StatsCard title="Approved" value={String(approved)} />
        <StatsCard title="Total Requests" value={String(total)} />
      </div>

      <h3 className="text-heading text-lg font-light mb-4">Quick Actions</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-[480px]">
        <Card bordered onClick={() => navigateTab("aid-requests")}>
          <div className="flex items-center gap-3">
            <ClipboardList className="w-5 h-5 text-primary" />
            <span className="text-heading text-sm">Submit Aid Request</span>
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
