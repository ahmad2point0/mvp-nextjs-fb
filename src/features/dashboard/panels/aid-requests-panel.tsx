"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DollarSign } from "lucide-react";
import { AidRequestForm } from "@/features/aid-requests";
import { useAidRequests } from "@/features/aid-requests/hooks";
import { useAuthStore } from "@/global/stores/auth-store";
import { Button, Pagination } from "@/global/components";

const PAGE_SIZE = 10;

const statusColors: Record<string, string> = {
  pending: "bg-[#facc15]/10 text-[#9b6829] border-[#facc15]/30",
  approved: "bg-success/20 text-success-text border-success/40",
  rejected: "bg-ruby/10 text-ruby border-ruby/30",
  fulfilled: "bg-primary/10 text-primary border-primary/30",
};

export function AidRequestsPanel() {
  const { user } = useAuthStore();
  const { data: requests, isLoading } = useAidRequests();
  const [page, setPage] = useState(1);
  const router = useRouter();

  const isDonor = user?.role === "donor";

  const totalPages = Math.ceil((requests?.length ?? 0) / PAGE_SIZE);
  const paginated = requests?.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function handleFundRequest(requestId: string) {
    router.push(`/dashboard?tab=donations&aid_request_id=${requestId}`);
  }

  return (
    <div className="space-y-10">
      {/* Students see the form; donors don't */}
      {!isDonor && <AidRequestForm />}

      <div>
        <h3 className="text-heading text-lg font-light tracking-tight mb-4">
          {isDonor ? "Aid Requests Needing Support" : "Request History"}
        </h3>
        {isLoading ? (
          <p className="text-body text-sm">Loading requests...</p>
        ) : !requests?.length ? (
          <p className="text-body text-sm">
            {isDonor ? "No aid requests at the moment." : "No aid requests yet."}
          </p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full bg-white rounded-lg overflow-hidden shadow-elevated">
                <thead>
                  <tr className="bg-brand-dark text-white text-left text-sm">
                    <th className="px-4 py-3">Aid Type</th>
                    <th className="px-4 py-3">Amount</th>
                    <th className="px-4 py-3">Description</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Date</th>
                    {isDonor && <th className="px-4 py-3">Action</th>}
                  </tr>
                </thead>
                <tbody>
                  {paginated?.map((r) => (
                    <tr key={r.id} className="border-t border-border">
                      <td className="px-4 py-3 text-sm text-heading">
                        {r.aid_type}
                      </td>
                      <td className="px-4 py-3 text-sm text-body">
                        Rs. {Number(r.amount).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-sm text-body max-w-[200px] truncate">
                        {r.description}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-block px-3 py-1 text-xs rounded border ${
                            statusColors[r.status] ?? "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {r.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-body">
                        {new Date(r.created_at).toLocaleDateString()}
                      </td>
                      {isDonor && (
                        <td className="px-4 py-3">
                          {r.status === "pending" || r.status === "approved" ? (
                            <Button
                              variant="neutral"
                              className="text-xs px-3 py-1.5 h-auto"
                              onClick={() => handleFundRequest(r.id)}
                            >
                              <DollarSign className="w-3.5 h-3.5 mr-1" />
                              Fund
                            </Button>
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
