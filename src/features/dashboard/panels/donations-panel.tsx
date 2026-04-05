"use client";

import { DonationForm } from "@/features/donations";
import { useDonations } from "@/features/donations/hooks";

const statusColors: Record<string, string> = {
  pending: "bg-[#facc15]/10 text-[#9b6829] border-[#facc15]/30",
  approved: "bg-success/20 text-success-text border-success/40",
  rejected: "bg-ruby/10 text-ruby border-ruby/30",
};

export function DonationsPanel() {
  const { data: donations, isLoading } = useDonations();

  return (
    <div className="space-y-10">
      <DonationForm />

      <div>
        <h3 className="text-heading text-lg font-light tracking-tight mb-4">
          Donation History
        </h3>
        {isLoading ? (
          <p className="text-body text-sm">Loading donations...</p>
        ) : !donations?.length ? (
          <p className="text-body text-sm">No donations yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full bg-white rounded-lg overflow-hidden shadow-elevated">
              <thead>
                <tr className="bg-brand-dark text-white text-left text-sm">
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Payment</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Date</th>
                </tr>
              </thead>
              <tbody>
                {donations.map((d) => (
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
                    <td className="px-4 py-3 text-sm text-body">
                      {new Date(d.created_at).toLocaleDateString()}
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
