/* Cash donation amount bounds (PKR). Capped at 5 digits per product spec. */
export const MIN_DONATION_AMOUNT = 100;
export const MAX_DONATION_AMOUNT = 99_999;

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

/* Payment methods (no more Bank Transfer / JazzCash). */
export const CASH_PAYMENT_METHODS = [
  "Online Payment via Bank",
  "Self Payment",
] as const;

/* Single source of truth for request/donation categories. Used by
   Student aid request form, Donor donation form, and Admin filters
   so portals stay synchronized. */
export const REQUEST_CATEGORIES = [
  "Fee",
  "Medical",
  "Books & Stationery",
  "Uniform",
  "Food",
  "Clothes",
  "Other",
] as const;
export type RequestCategory = (typeof REQUEST_CATEGORIES)[number];

export const DONATION_CATEGORIES: Record<string, readonly string[]> = {
  Fee: ["School Fees", "College Fees", "University Fees"],
  Medical: ["Medical Treatment", "Medicines", "Lab/Tests"],
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
  Other: ["Other Support"],
};

/* Categories that can only be donated as cash. */
export const CASH_ONLY_CATEGORIES = new Set(["Fee", "Medical"]);

/* Categories that ship as physical items — donors need the student's
   delivery address rather than an amount. */
export const ITEM_DELIVERY_CATEGORIES = new Set([
  "Books & Stationery",
  "Uniform",
  "Food",
  "Clothes",
  "Other",
]);

/* Required document types per category for submission validation. */
export const CATEGORY_REQUIRED_DOCS: Record<string, readonly string[]> = {
  Fee: ["Fee Challan / Slip", "Institute Fee Proof"],
  Medical: [
    "Prescription / Medical Report",
    "Doctor Certificate (optional)",
  ],
  "Books & Stationery": ["Supporting Proof"],
  Uniform: ["Supporting Proof"],
  Food: ["Supporting Proof"],
  Clothes: ["Supporting Proof"],
  Other: ["Supporting Proof"],
};

export function validateDonationAmount(amount: number): string | null {
  if (!Number.isFinite(amount) || amount <= 0)
    return "Amount must be a positive number";
  if (amount < MIN_DONATION_AMOUNT)
    return `Minimum donation amount is Rs. ${MIN_DONATION_AMOUNT.toLocaleString()}`;
  if (amount > MAX_DONATION_AMOUNT)
    return `Maximum donation amount is Rs. ${MAX_DONATION_AMOUNT.toLocaleString()}`;
  return null;
}
