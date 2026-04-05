"use client";

import { CheckCircle, FileText } from "lucide-react";
import { Card } from "@/global/components";
import { StatsCard } from "@/features/reports";
import { useAuthStore } from "@/global/stores/auth-store";
import { useVolunteerTasks } from "@/features/volunteers/hooks";
import { useTabNavigate } from "../use-tab-navigate";

export function VolunteerOverviewPanel() {
  const { user } = useAuthStore();
  const { data: tasks } = useVolunteerTasks();
  const navigateTab = useTabNavigate();

  const assigned = tasks?.filter((t) => t.status === "assigned").length ?? 0;
  const inProgress =
    tasks?.filter((t) => t.status === "in_progress").length ?? 0;
  const completed = tasks?.filter((t) => t.status === "completed").length ?? 0;

  return (
    <>
      <h2 className="text-heading text-2xl font-light tracking-tight mb-1">
        Welcome, {user?.full_name || "Volunteer"}!
      </h2>
      <p className="text-body mb-8">
        Here&apos;s an overview of your volunteer activities.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 max-w-[600px] mb-8">
        <StatsCard title="Assigned" value={String(assigned)} />
        <StatsCard title="In Progress" value={String(inProgress)} />
        <StatsCard title="Completed" value={String(completed)} />
      </div>

      <h3 className="text-heading text-lg font-light mb-4">Quick Actions</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-[480px]">
        <Card bordered onClick={() => navigateTab("tasks")}>
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-primary" />
            <span className="text-heading text-sm">View My Tasks</span>
          </div>
        </Card>
        <Card bordered onClick={() => navigateTab("apply")}>
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 text-primary" />
            <span className="text-heading text-sm">Apply for Role</span>
          </div>
        </Card>
      </div>
    </>
  );
}
