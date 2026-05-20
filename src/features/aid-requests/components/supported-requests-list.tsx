"use client";

import { Phone, MapPin } from "lucide-react";
import { useAidRequests } from "../hooks";
import { ITEM_DELIVERY_CATEGORIES } from "@/features/donations/constants";

const statusColors: Record<string, string> = {
  pending: "bg-[#facc15]/10 text-[#9b6829] border-[#facc15]/30",
  approved: "bg-success/20 text-success-text border-success/40",
  rejected: "bg-ruby/10 text-ruby border-ruby/30",
  fulfilled: "bg-primary/10 text-primary border-primary/30",
};

/**
 * The requests a donor has accepted, shown in their "My Donations" tab.
 * Because the donor has committed to these, the student's name and phone
 * are revealed here so the two sides can coordinate delivery/payment.
 */
export function SupportedRequestsList() {
  const { data: requests, isLoading } = useAidRequests({ scope: "mine" });

  return (
    <div>
      <h3 className="text-heading text-lg font-light tracking-tight mb-4">
        My Supported Requests
      </h3>

      {isLoading ? (
        <p className="text-body text-sm">Loading your supported requests...</p>
      ) : !requests?.length ? (
        <p className="text-body text-sm">
          You haven&apos;t accepted any aid requests yet. Browse open requests
          under the Aid Requests tab.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full bg-white rounded-lg overflow-hidden shadow-elevated">
            <thead>
              <tr className="bg-brand-dark text-white text-left text-sm">
                <th className="px-4 py-3">Student</th>
                <th className="px-4 py-3">Contact</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Amount / Delivery</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Accepted</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((r) => {
                const isItem =
                  !!r.category && ITEM_DELIVERY_CATEGORIES.has(r.category);
                return (
                  <tr key={r.id} className="border-t border-border align-top">
                    <td className="px-4 py-3 text-sm text-heading">
                      {r.student?.full_name || "Student"}
                    </td>
                    <td className="px-4 py-3 text-sm text-body">
                      {r.student?.phone ? (
                        <a
                          href={`tel:${r.student.phone}`}
                          className="inline-flex items-center gap-1 text-primary hover:underline"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          {r.student.phone}
                        </a>
                      ) : (
                        <span className="text-body/50">Not provided</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-heading">
                      {r.category ?? r.aid_type}
                    </td>
                    <td className="px-4 py-3 text-sm text-body max-w-[240px]">
                      {isItem ? (
                        <span className="inline-flex items-start gap-1">
                          <MapPin className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                          {r.delivery_address ?? "—"}
                        </span>
                      ) : (
                        `Rs. ${Number(r.amount).toLocaleString()}`
                      )}
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
                      {new Date(
                        r.accepted_at ?? r.created_at
                      ).toLocaleDateString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
