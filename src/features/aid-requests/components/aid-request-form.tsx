"use client";

import { useState } from "react";
import Link from "next/link";
import { Info } from "lucide-react";
import { toast } from "sonner";
import { Card, Button } from "@/global/components";
import {
  MAX_DONATION_AMOUNT,
  MIN_DONATION_AMOUNT,
  validateDonationAmount,
} from "@/features/donations/constants";
import { useCreateAidRequest } from "../hooks";

const aidTypes = [
  "School Fees",
  "Books",
  "Uniform",
  "Stationery",
  "School Bag",
  "Transport Support",
  "Food Support",
  "Medical Support",
];

export function AidRequestForm() {
  const [aidType, setAidType] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");

  const createRequest = useCreateAidRequest();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!aidType) return setError("Please select an aid type");
    if (!amount) return setError("Amount is required");
    const numericAmount = parseFloat(amount);
    const amountError = validateDonationAmount(numericAmount);
    if (amountError) return setError(amountError);
    if (!description.trim()) return setError("Description is required");

    createRequest.mutate(
      {
        aid_type: aidType,
        amount: numericAmount,
        description,
      },
      {
        onSuccess: () => {
          toast.success("Aid request submitted!");
          setAidType("");
          setAmount("");
          setDescription("");
        },
        onError: (err) => toast.error(err.message),
      }
    );
  }

  return (
    <Card bordered className="max-w-[500px] mx-auto">
      <h2 className="text-heading text-2xl font-light tracking-tight text-center mb-3">
        Education Aid Request
      </h2>

      <div className="mb-5 rounded-lg border border-primary/20 bg-primary/[0.03] p-3.5">
        <div className="flex items-center gap-2 mb-2">
          <Info className="w-4 h-4 text-primary" />
          <h3 className="text-heading text-sm font-medium">
            Documents required to qualify
          </h3>
        </div>
        <p className="text-body text-xs leading-relaxed">
          Donors fund requests that have verified proof of need. Please make
          sure your account has at least one of: <b>Student ID / Enrollment
          Letter</b>, <b>Recent Fee Challan</b>, <b>Proof of Financial Need</b>{" "}
          (salary slip, BISP letter, school principal&apos;s letter, etc.), and{" "}
          <b>CNIC or B-Form</b>.{" "}
          <Link
            href="/upload-documents"
            className="text-primary hover:text-primary-hover underline"
          >
            Upload or update your documents
          </Link>
          .
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
        <select
          value={aidType}
          onChange={(e) => setAidType(e.target.value)}
          className="w-full px-3 py-3 rounded border border-border text-sm text-heading focus:border-primary focus:outline-none"
        >
          <option value="" disabled>Select Aid Type</option>
          {aidTypes.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        <div>
          <input
            type="number"
            min={MIN_DONATION_AMOUNT}
            max={MAX_DONATION_AMOUNT}
            step="1"
            placeholder={`Required Amount (Rs ${MIN_DONATION_AMOUNT.toLocaleString()}–${MAX_DONATION_AMOUNT.toLocaleString()})`}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full px-3 py-3 rounded border border-border text-sm text-heading placeholder:text-body focus:border-primary focus:outline-none"
          />
          <p className="text-[11px] text-body mt-1 px-1">
            Minimum Rs. {MIN_DONATION_AMOUNT.toLocaleString()} · Maximum Rs.{" "}
            {MAX_DONATION_AMOUNT.toLocaleString()}
          </p>
        </div>
        <textarea
          placeholder="Explain your need"
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full px-3 py-3 rounded border border-border text-sm text-heading placeholder:text-body focus:border-primary focus:outline-none resize-none"
        />

        {error && <p className="text-ruby text-xs">{error}</p>}

        <Button type="submit" fullWidth disabled={createRequest.isPending}>
          {createRequest.isPending ? "Submitting..." : "Submit Aid Request"}
        </Button>
      </form>
    </Card>
  );
}
