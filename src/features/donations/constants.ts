/* Cash donation amount bounds (PKR). Applied to every donation that
   has a monetary `amount`, including the equivalent-value field for
   in-kind donations so admins can rank requests fairly. */
export const MIN_DONATION_AMOUNT = 100;
export const MAX_DONATION_AMOUNT = 1_000_000;

/* Aid-request fulfillment uses a fixed token amount so donors don't
   need to negotiate the price; kept inside the limits above. */
export const FIXED_AID_REQUEST_AMOUNT = 1200;

export type DonationKind = "cash" | "in_kind";

export const DONATION_KIND_LABEL: Record<DonationKind, string> = {
  cash: "Donate Money",
  in_kind: "Donate Items Directly",
};

export const DONATION_KIND_DESCRIPTION: Record<DonationKind, string> = {
  cash: "Send funds and we will purchase the items for the student. We share receipts and proof of purchase in your dashboard.",
  in_kind:
    "Bring books, uniforms, or other items directly to our drop-off point or arrange a pickup. You see exactly what reaches the student.",
};

export const DIRECT_DELIVERY_METHOD = "Direct Delivery";

export const CASH_PAYMENT_METHODS = [
  "Cash Donation",
  "JazzCash",
  "Easypaisa",
] as const;

export const DONATION_CATEGORIES = {
  Money: ["School Fees", "Medical Support", "General Fund"],
  Food: [
    "Rice",
    "Flour",
    "Cooking Oil",
    "Milk / Nutrition Pack",
    "Fruits & Vegetables",
  ],
  Uniform: ["School Shirt", "School Pants", "School Shoes", "School Bag"],
  "Books & Stationery": ["Textbooks", "Notebooks", "Stationery Kit"],
  Clothes: ["Summer Clothes", "Winter Clothes", "Blankets"],
} as const;

/* Categories that can only be donated as cash. Money-only is the
   obvious one — you can't physically deliver "School Fees". */
export const CASH_ONLY_CATEGORIES = new Set(["Money"]);

export function validateDonationAmount(amount: number): string | null {
  if (!Number.isFinite(amount) || amount <= 0)
    return "Amount must be a positive number";
  if (amount < MIN_DONATION_AMOUNT)
    return `Minimum donation amount is Rs. ${MIN_DONATION_AMOUNT.toLocaleString()}`;
  if (amount > MAX_DONATION_AMOUNT)
    return `Maximum donation amount is Rs. ${MAX_DONATION_AMOUNT.toLocaleString()}`;
  return null;
}
