"use client";

import { useState } from "react";
import { Card, Button } from "@/global/components";
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
  const [success, setSuccess] = useState(false);

  const createRequest = useCreateAidRequest();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!aidType) return setError("Please select an aid type");
    if (!amount) return setError("Amount is required");
    if (!description.trim()) return setError("Description is required");

    createRequest.mutate(
      {
        aid_type: aidType,
        amount: parseFloat(amount),
        description,
      },
      {
        onSuccess: () => {
          setSuccess(true);
          setAidType("");
          setAmount("");
          setDescription("");
        },
        onError: (err) => setError(err.message),
      }
    );
  }

  return (
    <Card bordered className="max-w-[500px] mx-auto">
      <h2 className="text-heading text-2xl font-light tracking-tight text-center mb-6">
        Education Aid Request
      </h2>

      {success && (
        <div className="bg-success-bg border border-success-border text-success-text text-sm rounded px-3 py-2 mb-4 text-center">
          Aid request submitted successfully!
        </div>
      )}

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
        <input
          type="number"
          placeholder="Required Amount (Rs)"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full px-3 py-3 rounded border border-border text-sm text-heading placeholder:text-body focus:border-primary focus:outline-none"
        />
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
