"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button, Pagination } from "@/global/components";
import { useAdminUsers, useUpdateUser } from "../hooks";

const PAGE_SIZE = 10;

export function ApprovalTable() {
  const { data: users, isLoading } = useAdminUsers();
  const updateUser = useUpdateUser();
  const [page, setPage] = useState(1);

  if (isLoading) {
    return <p className="text-body text-sm">Loading users...</p>;
  }

  const pendingUsers = users?.filter((u) => !u.approved) ?? [];

  if (!pendingUsers.length) {
    return (
      <div className="text-center py-12 text-body">
        <p className="text-lg">No pending approvals</p>
        <p className="text-sm mt-1">All users have been reviewed.</p>
      </div>
    );
  }

  const totalPages = Math.ceil(pendingUsers.length / PAGE_SIZE);
  const paginated = pendingUsers.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full bg-white rounded-lg overflow-hidden shadow-elevated">
          <thead>
            <tr className="bg-brand-dark text-white text-left text-sm">
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginated.map((user) => (
              <tr key={user.id} className="border-t border-border">
                <td className="px-4 py-3 text-sm text-heading">{user.full_name}</td>
                <td className="px-4 py-3 text-sm text-body capitalize">{user.role}</td>
                <td className="px-4 py-3 text-sm text-body">{user.email}</td>
                <td className="px-4 py-3 flex gap-2">
                  <Button
                    className="text-xs px-3 py-1"
                    onClick={() =>
                      updateUser.mutate(
                        { id: user.id, approved: true },
                        {
                          onSuccess: () => toast.success(`${user.full_name} approved`),
                          onError: (err) => toast.error(err.message),
                        }
                      )
                    }
                    disabled={updateUser.isPending}
                  >
                    Approve
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </>
  );
}
