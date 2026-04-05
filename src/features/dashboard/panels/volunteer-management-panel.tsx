"use client";

import { TaskTable, JoinVolunteerForm } from "@/features/volunteers";
import { useAuthStore } from "@/global/stores/auth-store";

export function VolunteerManagementPanel() {
  const { user } = useAuthStore();
  const isAdmin = user?.role === "admin";

  return (
    <div className="space-y-10">
      <div>
        <h2 className="text-heading text-2xl font-light tracking-tight mb-6">
          {isAdmin ? "Volunteer Tasks" : "My Tasks"}
        </h2>
        <TaskTable />
      </div>
    </div>
  );
}
