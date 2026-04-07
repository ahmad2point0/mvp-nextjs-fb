"use client";

import { UserManagementTable } from "@/features/admin";

export function UserManagementPanel() {
  return (
    <div className="space-y-6">
      <UserManagementTable />
    </div>
  );
}
