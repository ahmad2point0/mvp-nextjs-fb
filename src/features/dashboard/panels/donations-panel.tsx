"use client";

import { useState } from "react";
import { FileText, Check, X } from "lucide-react";
import { toast } from "sonner";
import { DonationForm } from "@/features/donations";
import { useDonations, useUpdateDonationStatus } from "@/features/donations/hooks";
import { useAuthStore } from "@/global/stores/auth-store";
import { Pagination } from "@/global/components";

const PAGE_SIZE = 10;

const statusColors: Record<string, string> = {
  pending: "bg-[#facc15]/10 text-[#9b6829] border-[#facc15]/30",
  approved: "bg-success/20 text-success-text border-success/40",
  declined: "bg-ruby/10 text-ruby border-ruby/30",
};

export function DonationsPanel() {
  const { user } = useAuthStore();
  const { data: donations, isLoading } = useDonations();
  const updateStatus = useUpdateDonationStatus();
  const [page, setPage] = useState(1);

  const isAdmin = user?.role === "admin";

  const totalPages = Math.ceil((donations?.length ?? 0) / PAGE_SIZE);
  const paginated = donations?.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function handleStatusChange(id: string, status: "approved" | "declined") {
    updateStatus.mutate(
      { id, status },
      {
        onSuccess: () => toast.success(`Donation ${status}`),
        onError: (err) => toast.error(err.message),
      }
    );
  }

  return (
    <div className="space-y-10">
      {/* Donors see the form; admin doesn't need it */}
      {!isAdmin && <DonationForm />}

      <div>
        <h3 className="text-heading text-lg font-light tracking-tight mb-4">
          {isAdmin ? "All Donations" : "Donation History"}
        </h3>
        {isLoading ? (
          <p className="text-body text-sm">Loading donations...</p>
        ) : !donations?.length ? (
          <p className="text-body text-sm">No donations yet.</p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full bg-white rounded-lg overflow-hidden shadow-elevated">
                <thead>
                  <tr className="bg-brand-dark text-white text-left text-sm">
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Amount</th>
                    <th className="px-4 py-3">Payment</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Receipt</th>
                    <th className="px-4 py-3">Date</th>
                    {isAdmin && <th className="px-4 py-3">Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {paginated?.map((d) => (
                    <tr key={d.id} className="border-t border-border">
                      <td className="px-4 py-3 text-sm text-heading">
                        {d.subcategory || d.category}
                      </td>
                      <td className="px-4 py-3 text-sm text-body">
                        Rs. {Number(d.amount).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-sm text-body">
                        {d.payment_method}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-block px-3 py-1 text-xs rounded border ${
                            statusColors[d.status] ?? "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {d.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {d.receipt_url ? (
                          <FileText className="w-4 h-4 text-primary" aria-label="Receipt uploaded" />
                        ) : (
                          <span className="text-xs text-body/50">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-body">
                        {new Date(d.created_at).toLocaleDateString()}
                      </td>
                      {isAdmin && (
                        <td className="px-4 py-3">
                          {d.status === "pending" ? (
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleStatusChange(d.id, "approved")}
                                className="p-1.5 rounded bg-success/10 text-success-text hover:bg-success/20 transition-colors"
                                aria-label="Approve"
                                disabled={updateStatus.isPending}
                              >
                                <Check className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleStatusChange(d.id, "declined")}
                                className="p-1.5 rounded bg-ruby/10 text-ruby hover:bg-ruby/20 transition-colors"
                                aria-label="Decline"
                                disabled={updateStatus.isPending}
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <span className="text-xs text-body/50">-</span>
                          )}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </>
        )}
      </div>
    </div>
  );
}
