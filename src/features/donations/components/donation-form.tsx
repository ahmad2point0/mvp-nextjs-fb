"use client";

import { useState, useRef } from "react";
import { Upload } from "lucide-react";
import { toast } from "sonner";
import { Card, Button } from "@/global/components";
import { useCreateDonation, useUploadReceipt } from "../hooks";
import { useAuthStore } from "@/global/stores/auth-store";

const categories = {
  Money: ["School Fees", "Medical Support", "General Fund"],
  Food: ["Rice", "Flour", "Cooking Oil", "Milk / Nutrition Pack", "Fruits & Vegetables"],
  Uniform: ["School Shirt", "School Pants", "School Shoes", "School Bag"],
  "Books & Stationery": ["Textbooks", "Notebooks", "Stationery Kit"],
  Clothes: ["Summer Clothes", "Winter Clothes", "Blankets"],
};

const paymentMethods = ["Cash Donation", "JazzCash", "Easypaisa"];

export function DonationForm() {
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!category) return setError("Please select a category");
    if (!amount) return setError("Amount is required");
    if (!payment) return setError("Payment method is required");

    let parentCategory = "";
    for (const [group, items] of Object.entries(categories)) {
      if (items.includes(category)) {
        parentCategory = group;
        break;
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
        subcategory: category,
        amount: parseFloat(amount),
        payment_method: payment,
        transaction_id: transactionId || undefined,
        message: message || undefined,
        receipt_url: receiptUrl,
      },
      {
        onSuccess: () => {
          toast.success("Donation submitted successfully!");
          setCategory("");
          setAmount("");
          setPayment("");
          setTransactionId("");
          setMessage("");
          setReceiptFile(null);
          if (fileInputRef.current) fileInputRef.current.value = "";
        },
        onError: (err) => toast.error(err.message),
      }
    );
  }

  const isPending = createDonation.isPending || uploadReceipt.isPending;

  return (
    <Card bordered className="max-w-[480px] mx-auto">
      <h2 className="text-heading text-2xl font-light tracking-tight text-center mb-6">
        Make a Donation
      </h2>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
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

        <input
          type="number"
          placeholder="Amount (Rs)"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full px-3 py-3 rounded border border-border text-sm text-heading placeholder:text-body focus:border-primary focus:outline-none"
        />

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
          {isPending ? "Submitting..." : "Confirm Donation"}
        </Button>
      </form>
    </Card>
  );
}
