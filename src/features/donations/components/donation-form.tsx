"use client";

import { useState, useRef } from "react";
import { Upload } from "lucide-react";
import { toast } from "sonner";
import { Card, Button } from "@/global/components";
import { useCreateDonation, useUploadReceipt } from "../hooks";
import { useAuthStore } from "@/global/stores/auth-store";
import { useAidRequests } from "@/features/aid-requests/hooks";

const FIXED_DONATION_AMOUNT = 1200;

const categories = {
  Money: ["School Fees", "Medical Support", "General Fund"],
  Food: ["Rice", "Flour", "Cooking Oil", "Milk / Nutrition Pack", "Fruits & Vegetables"],
  Uniform: ["School Shirt", "School Pants", "School Shoes", "School Bag"],
  "Books & Stationery": ["Textbooks", "Notebooks", "Stationery Kit"],
  Clothes: ["Summer Clothes", "Winter Clothes", "Blankets"],
};

const paymentMethods = ["Cash Donation", "JazzCash", "Easypaisa"];

interface DonationFormProps {
  aidRequestId?: string | null;
  onDonated?: () => void;
}

export function DonationForm({ aidRequestId, onDonated }: DonationFormProps) {
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [payment, setPayment] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { user } = useAuthStore();
  const createDonation = useCreateDonation();
  const uploadReceipt = useUploadReceipt();

  // If funding an aid request, look it up from cached data
  const { data: aidRequests } = useAidRequests();
  const linkedRequest = aidRequestId
    ? aidRequests?.find((r) => r.id === aidRequestId)
    : null;

  const isLinked = !!linkedRequest;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const effectiveCategory = isLinked ? "General Fund" : category;
    const effectiveAmount = isLinked ? FIXED_DONATION_AMOUNT : parseFloat(amount);

    if (!isLinked && !effectiveCategory) return setError("Please select a category");
    if (!isLinked && !amount) return setError("Amount is required");
    if (!payment) return setError("Payment method is required");

    let parentCategory = "Money";
    if (!isLinked) {
      for (const [group, items] of Object.entries(categories)) {
        if (items.includes(effectiveCategory)) {
          parentCategory = group;
          break;
        }
      }
    }

    let receiptUrl: string | undefined;
    if (receiptFile && user) {
      try {
        receiptUrl = await uploadReceipt.mutateAsync({
          file: receiptFile,
          userId: user.id,
        });
      } catch {
        toast.error("Failed to upload receipt");
        return;
      }
    }

    createDonation.mutate(
      {
        category: parentCategory,
        subcategory: effectiveCategory,
        amount: effectiveAmount,
        aid_request_id: linkedRequest?.id,
        payment_method: payment,
        transaction_id: transactionId || undefined,
        message: message || undefined,
        receipt_url: receiptUrl,
      },
      {
        onSuccess: () => {
          toast.success(
            isLinked
              ? "Donation submitted! The aid request has been fulfilled."
              : "Donation submitted successfully!"
          );
          setCategory("");
          setAmount("");
          setPayment("");
          setTransactionId("");
          setMessage("");
          setReceiptFile(null);
          if (fileInputRef.current) fileInputRef.current.value = "";
          onDonated?.();
        },
        onError: (err) => toast.error(err.message),
      }
    );
  }

  const isPending = createDonation.isPending || uploadReceipt.isPending;

  return (
    <Card bordered className="max-w-[480px] mx-auto">
      <h2 className="text-heading text-2xl font-light tracking-tight text-center mb-6">
        {isLinked ? "Fund Aid Request" : "Make a Donation"}
      </h2>

      {isLinked && (
        <div className="bg-primary/5 border border-primary/20 rounded p-4 mb-6 space-y-1.5">
          <p className="text-sm text-heading font-medium">
            Aid Type: {linkedRequest.aid_type}
          </p>
          <p className="text-sm text-body">{linkedRequest.description}</p>
          <p className="text-sm text-heading">
            Fixed Donation: <span className="font-medium">Rs. {FIXED_DONATION_AMOUNT.toLocaleString()}</span>
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
        {/* Category — hidden when funding an aid request */}
        {!isLinked && (
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-3 py-3 rounded border border-border text-sm text-heading focus:border-primary focus:outline-none"
          >
            <option value="" disabled>Select Donation Category</option>
            {Object.entries(categories).map(([group, items]) => (
              <optgroup key={group} label={group}>
                {items.map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </optgroup>
            ))}
          </select>
        )}

        {/* Amount — read-only when funding an aid request */}
        {isLinked ? (
          <input
            type="text"
            value={`Rs. ${FIXED_DONATION_AMOUNT.toLocaleString()}`}
            readOnly
            className="w-full px-3 py-3 rounded border border-border text-sm text-heading bg-gray-50 cursor-not-allowed"
          />
        ) : (
          <input
            type="number"
            placeholder="Amount (Rs)"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full px-3 py-3 rounded border border-border text-sm text-heading placeholder:text-body focus:border-primary focus:outline-none"
          />
        )}

        <h4 className="text-primary text-sm font-normal mt-1">Payment Method</h4>

        <select
          value={payment}
          onChange={(e) => setPayment(e.target.value)}
          className="w-full px-3 py-3 rounded border border-border text-sm text-heading focus:border-primary focus:outline-none"
        >
          <option value="" disabled>Select Payment Method</option>
          {paymentMethods.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Transaction ID / Reference No"
          value={transactionId}
          onChange={(e) => setTransactionId(e.target.value)}
          className="w-full px-3 py-3 rounded border border-border text-sm text-heading placeholder:text-body focus:border-primary focus:outline-none"
        />

        <div>
          <label className="flex items-center gap-2 text-sm text-heading mb-1.5">
            <Upload className="w-4 h-4 text-primary" />
            Receipt (optional)
          </label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,.pdf"
            onChange={(e) => setReceiptFile(e.target.files?.[0] ?? null)}
            className="w-full text-sm text-body file:mr-3 file:px-3 file:py-1.5 file:rounded file:border-0 file:text-sm file:bg-primary/10 file:text-primary hover:file:bg-primary/20 file:cursor-pointer"
          />
        </div>

        <textarea
          placeholder="Additional Message (optional)"
          rows={3}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full px-3 py-3 rounded border border-border text-sm text-heading placeholder:text-body focus:border-primary focus:outline-none resize-none"
        />

        {error && <p className="text-ruby text-xs">{error}</p>}

        <Button type="submit" fullWidth disabled={isPending}>
          {isPending
            ? "Submitting..."
            : isLinked
              ? `Donate Rs. ${FIXED_DONATION_AMOUNT.toLocaleString()}`
              : "Confirm Donation"}
        </Button>
      </form>
    </Card>
  );
}
