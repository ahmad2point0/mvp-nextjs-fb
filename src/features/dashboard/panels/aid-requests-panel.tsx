"use client";

import { useState } from "react";
import { CheckCircle, FileText, MapPin } from "lucide-react";
import { toast } from "sonner";
import { AidRequestForm } from "@/features/aid-requests";
import {
  useAidRequests,
  useAcceptAidRequest,
  type AidRequest,
} from "@/features/aid-requests/hooks";
import { UserDocumentsViewer } from "@/features/documents";
import { useAuthStore } from "@/global/stores/auth-store";
import { Button, Pagination } from "@/global/components";
import {
  CASH_PAYMENT_METHODS,
  ITEM_DELIVERY_CATEGORIES,
} from "@/features/donations/constants";

const PAGE_SIZE = 10;

const statusColors: Record<string, string> = {
  pending: "bg-[#facc15]/10 text-[#9b6829] border-[#facc15]/30",
  approved: "bg-success/20 text-success-text border-success/40",
  rejected: "bg-ruby/10 text-ruby border-ruby/30",
  fulfilled: "bg-primary/10 text-primary border-primary/30",
};

export function AidRequestsPanel() {
  const { user } = useAuthStore();
  const isDonor = user?.role === "donor";

  const { data: requests, isLoading } = useAidRequests();
  const accept = useAcceptAidRequest();

  const [page, setPage] = useState(1);
  const [viewingDocsFor, setViewingDocsFor] = useState<AidRequest | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<Record<string, string>>(
    {}
  );

  const totalPages = Math.ceil((requests?.length ?? 0) / PAGE_SIZE);
  const paginated = requests?.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function handleAccept(request: AidRequest) {
    const method = paymentMethods[request.id];
    if (!method) {
      toast.error("Choose a payment method first");
      return;
    }
    accept.mutate(
      { requestId: request.id, payment_method: method },
      {
        onSuccess: () =>
          toast.success(
            "Request accepted! It is now assigned exclusively to you."
          ),
        onError: (err) => toast.error(err.message),
      }
    );
  }

  return (
    <div className="space-y-10">
      {!isDonor && <AidRequestForm />}

      <div>
        <h3 className="text-heading text-lg font-light tracking-tight mb-4">
          {isDonor ? "Aid Requests Needing Support" : "Request History"}
        </h3>
        {isLoading ? (
          <p className="text-body text-sm">Loading requests...</p>
        ) : !requests?.length ? (
          <p className="text-body text-sm">
            {isDonor
              ? "No open aid requests at the moment."
              : "No aid requests yet."}
          </p>
        ) : isDonor ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {paginated?.map((r) => {
                const isItem = !!r.category && ITEM_DELIVERY_CATEGORIES.has(r.category);
                return (
                  <div
                    key={r.id}
                    className="rounded-lg border border-border bg-white p-4 flex flex-col gap-3 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-heading text-sm font-medium truncate">
                          {r.aid_type}
                        </p>
                        <p className="text-body text-[11px] mt-0.5">
                          {r.category ?? "Uncategorised"} ·{" "}
                          {new Date(r.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <span
                        className={`inline-block px-2 py-0.5 text-[10px] rounded border ${
                          statusColors[r.status] ?? "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {r.status}
                      </span>
                    </div>

                    <p className="text-body text-xs leading-relaxed line-clamp-3">
                      {r.description}
                    </p>

                    {isItem ? (
                      r.delivery_address ? (
                        <div className="text-xs text-body flex items-start gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                          <span className="leading-relaxed">
                            {r.delivery_address}
                          </span>
                        </div>
                      ) : null
                    ) : (
                      <p className="text-xs text-heading">
                        Requested amount:{" "}
                        <b>Rs. {Number(r.amount).toLocaleString()}</b>
                      </p>
                    )}

                    {r.documents_verified ? (
                      <p className="text-[11px] text-emerald-700 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> Documents verified
                        by admin
                      </p>
                    ) : (
                      <p className="text-[11px] text-amber-700">
                        Documents pending verification
                      </p>
                    )}

                    <Button
                      variant="neutral"
                      onClick={() =>
                        setViewingDocsFor(r)
                      }
                      className="text-xs px-3 py-1.5 h-auto justify-center"
                    >
                      <FileText className="w-3.5 h-3.5 mr-1" />
                      View Supporting Documents
                    </Button>

                    <div className="flex flex-col gap-1.5">
                      <select
                        value={paymentMethods[r.id] ?? ""}
                        onChange={(e) =>
                          setPaymentMethods((prev) => ({
                            ...prev,
                            [r.id]: e.target.value,
                          }))
                        }
                        className="w-full px-2 py-1.5 rounded border border-border text-xs text-heading focus:border-primary focus:outline-none"
                      >
                        <option value="" disabled>
                          Choose payment method
                        </option>
                        {CASH_PAYMENT_METHODS.map((m) => (
                          <option key={m} value={m}>
                            {m}
                          </option>
                        ))}
                      </select>

                      <Button
                        fullWidth
                        onClick={() => handleAccept(r)}
                        disabled={accept.isPending}
                        className="text-xs px-3 py-1.5 h-auto"
                      >
                        {accept.isPending ? "Accepting..." : "Accept Request"}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
            <Pagination
              page={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full bg-white rounded-lg overflow-hidden shadow-elevated">
                <thead>
                  <tr className="bg-brand-dark text-white text-left text-sm">
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Title</th>
                    <th className="px-4 py-3">Detail</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated?.map((r) => {
                    const isItem =
                      !!r.category && ITEM_DELIVERY_CATEGORIES.has(r.category);
                    return (
                      <tr key={r.id} className="border-t border-border">
                        <td className="px-4 py-3 text-sm text-heading">
                          {r.category ?? r.aid_type}
                        </td>
                        <td className="px-4 py-3 text-sm text-body">
                          {r.aid_type}
                        </td>
                        <td className="px-4 py-3 text-sm text-body max-w-[240px]">
                          {isItem
                            ? r.delivery_address ?? "—"
                            : `Rs. ${Number(r.amount).toLocaleString()}`}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-block px-3 py-1 text-xs rounded border ${
                              statusColors[r.status] ??
                              "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {r.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-body">
                          {new Date(r.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <Pagination
              page={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </>
        )}
      </div>

      {viewingDocsFor && (
        <UserDocumentsViewer
          userId={viewingDocsFor.student_id}
          userName={`Aid Request — ${viewingDocsFor.aid_type}`}
          aidRequestId={viewingDocsFor.id}
          onClose={() => setViewingDocsFor(null)}
        />
      )}
    </div>
  );
}
