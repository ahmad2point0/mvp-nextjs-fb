"use client";

import { useState } from "react";
import { Button } from "@/global/components";
import { ApprovalTable } from "@/features/admin";
import { useAdminUsers, useUpdateUser } from "@/features/admin/hooks";
import type { UserRole } from "@/global/stores/auth-store";

const roles: UserRole[] = ["admin", "donor", "volunteer", "student"];

export function UserManagementPanel() {
  const { data: users, isLoading } = useAdminUsers();
  const updateUser = useUpdateUser();
  const [roleFilter, setRoleFilter] = useState<string>("all");

  const filteredUsers =
    roleFilter === "all"
      ? users
      : users?.filter((u) => u.role === roleFilter);

  return (
    <div className="space-y-10">
      <div>
        <h2 className="text-heading text-2xl font-light tracking-tight mb-6">
          Pending Approvals
        </h2>
        <ApprovalTable />
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-heading text-2xl font-light tracking-tight">
            All Users
          </h2>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 rounded border border-border text-sm text-heading focus:border-primary focus:outline-none"
          >
            <option value="all">All Roles</option>
            {roles.map((r) => (
              <option key={r} value={r} className="capitalize">
                {r.charAt(0).toUpperCase() + r.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {isLoading ? (
          <p className="text-body text-sm">Loading users...</p>
        ) : !filteredUsers?.length ? (
          <p className="text-body text-sm">No users found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full bg-white rounded-lg overflow-hidden shadow-elevated">
              <thead>
                <tr className="bg-brand-dark text-white text-left text-sm">
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="border-t border-border">
                    <td className="px-4 py-3 text-sm text-heading">
                      {u.full_name}
                    </td>
                    <td className="px-4 py-3 text-sm text-body">{u.email}</td>
                    <td className="px-4 py-3">
                      <select
                        value={u.role}
                        onChange={(e) =>
                          updateUser.mutate({
                            id: u.id,
                            role: e.target.value,
                          })
                        }
                        disabled={updateUser.isPending}
                        className="px-2 py-1 text-xs rounded border border-border text-heading focus:border-primary focus:outline-none"
                      >
                        {roles.map((r) => (
                          <option key={r} value={r}>
                            {r.charAt(0).toUpperCase() + r.slice(1)}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block px-3 py-1 text-xs rounded border ${
                          u.approved
                            ? "bg-success/20 text-success-text border-success/40"
                            : "bg-[#facc15]/10 text-[#9b6829] border-[#facc15]/30"
                        }`}
                      >
                        {u.approved ? "Approved" : "Pending"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {!u.approved && (
                        <Button
                          className="text-xs px-3 py-1"
                          onClick={() =>
                            updateUser.mutate({ id: u.id, approved: true })
                          }
                          disabled={updateUser.isPending}
                        >
                          Approve
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
