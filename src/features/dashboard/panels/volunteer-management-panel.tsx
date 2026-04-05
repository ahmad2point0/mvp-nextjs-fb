"use client";

import { useState } from "react";
import { Check, X } from "lucide-react";
import { toast } from "sonner";
import { TaskTable } from "@/features/volunteers";
import { TaskAssignmentForm } from "@/features/volunteers/components/task-assignment-form";
import {
  useVolunteerApplications,
  useUpdateApplicationStatus,
} from "@/features/volunteers/hooks";
import { useAuthStore } from "@/global/stores/auth-store";
import { Pagination } from "@/global/components";

const PAGE_SIZE = 10;

const statusColors: Record<string, string> = {
  pending: "bg-[#facc15]/10 text-[#9b6829] border-[#facc15]/30",
  approved: "bg-success/20 text-success-text border-success/40",
  rejected: "bg-ruby/10 text-ruby border-ruby/30",
};

export function VolunteerManagementPanel() {
  const { user } = useAuthStore();
  const isAdmin = user?.role === "admin";

  return (
    <div className="space-y-10">
      {isAdmin && <ApplicationsSection />}
      {isAdmin && <TaskAssignmentForm />}

      <div>
        <h2 className="text-heading text-2xl font-light tracking-tight mb-6">
          {isAdmin ? "All Volunteer Tasks" : "My Tasks"}
        </h2>
        <TaskTable />
      </div>
    </div>
  );
}

function ApplicationsSection() {
  const { data: applications, isLoading } = useVolunteerApplications();
  const updateStatus = useUpdateApplicationStatus();
  const [page, setPage] = useState(1);

  const pendingApps = applications?.filter((a) => a.status === "pending") ?? [];
  const totalPages = Math.ceil(pendingApps.length / PAGE_SIZE);
  const paginated = pendingApps.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function handleAction(id: string, status: "approved" | "rejected") {
    updateStatus.mutate(
      { id, status },
      {
        onSuccess: () => toast.success(`Application ${status}`),
        onError: (err) => toast.error(err.message),
      }
    );
  }

  return (
    <div>
      <h2 className="text-heading text-2xl font-light tracking-tight mb-6">
        Pending Volunteer Applications
      </h2>

      {isLoading ? (
        <p className="text-body text-sm">Loading applications...</p>
      ) : !pendingApps.length ? (
        <p className="text-body text-sm">No pending applications.</p>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full bg-white rounded-lg overflow-hidden shadow-elevated">
              <thead>
                <tr className="bg-brand-dark text-white text-left text-sm">
                  <th className="px-4 py-3">Applicant</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Motivation</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((app) => (
                  <tr key={app.id} className="border-t border-border">
                    <td className="px-4 py-3 text-sm text-heading">
                      {app.profiles?.full_name ?? "Unknown"}
                    </td>
                    <td className="px-4 py-3 text-sm text-body">{app.role}</td>
                    <td className="px-4 py-3 text-sm text-body max-w-[200px] truncate">
                      {app.motivation}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block px-3 py-1 text-xs rounded border ${
                          statusColors[app.status] ?? "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {app.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-body">
                      {new Date(app.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleAction(app.id, "approved")}
                          className="p-1.5 rounded bg-success/10 text-success-text hover:bg-success/20 transition-colors"
                          aria-label="Approve"
                          disabled={updateStatus.isPending}
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleAction(app.id, "rejected")}
                          className="p-1.5 rounded bg-ruby/10 text-ruby hover:bg-ruby/20 transition-colors"
                          aria-label="Reject"
                          disabled={updateStatus.isPending}
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}
