"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import { Upload, BookOpen, HandCoins } from "lucide-react";
import { toast } from "sonner";
import { Card, Button } from "@/global/components";
import { useCreateDonation, useUploadReceipt } from "../hooks";
import { useAuthStore } from "@/global/stores/auth-store";
import { useAidRequests } from "@/features/aid-requests/hooks";
import {
  CASH_ONLY_CATEGORIES,
  CASH_PAYMENT_METHODS,
  DIRECT_DELIVERY_METHOD,
  DONATION_CATEGORIES,
  DONATION_KIND_DESCRIPTION,
  DONATION_KIND_LABEL,
  FIXED_AID_REQUEST_AMOUNT,
  MAX_DONATION_AMOUNT,
  MIN_DONATION_AMOUNT,
  type DonationKind,
  validateDonationAmount,
} from "../constants";

/* For free-form donations, infer the donor's parent category from the
   subcategory they pick. */

interface DonationFormProps {
  aidRequestId?: string | null;
  onDonated?: () => void;
}

export function DonationForm({ aidRequestId, onDonated }: DonationFormProps) {
  const [kind, setKind] = useState<DonationKind>("cash");
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [payment, setPayment] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [message, setMessage] = useState("");
  const [pickupDetails, setPickupDetails] = useState("");
  const [error, setError] = useState("");
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { user } = useAuthStore();
  const createDonation = useCreateDonation();
  const uploadReceipt = useUploadReceipt();

  const { data: aidRequests } = useAidRequests();
  const linkedRequest = aidRequestId
    ? aidRequests?.find((r) => r.id === aidRequestId)
    : null;
  const isLinked = !!linkedRequest;

  /* Identify parent category from the chosen subcategory. Needed to
     decide whether in-kind delivery is meaningful. */
  const parentCategory = useMemo(() => {
    if (isLinked) return "Money";
    for (const [group, items] of Object.entries(DONATION_CATEGORIES)) {
      if ((items as readonly string[]).includes(category)) return group;
    }
    return "";
  }, [category, isLinked]);

  const isCashOnly = CASH_ONLY_CATEGORIES.has(parentCategory);

  /* If user picks a cash-only category (e.g. School Fees), force the
     donation kind back to cash so they don't get stuck in an
     impossible "deliver fees in person" state. */
  useEffect(() => {
    if (isCashOnly && kind === "in_kind") setKind("cash");
  }, [isCashOnly, kind]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const effectiveCategory = isLinked ? "General Fund" : category;
    const effectiveAmount = isLinked
      ? FIXED_AID_REQUEST_AMOUNT
      : parseFloat(amount);

    if (!isLinked && !effectiveCategory)
      return setError("Please select a category");
    if (!isLinked) {
      if (!amount) return setError("Amount is required");
      const amountError = validateDonationAmount(effectiveAmount);
      if (amountError) return setError(amountError);
    }

    if (kind === "cash" && !payment)
      return setError("Payment method is required");
    if (kind === "in_kind" && !pickupDetails.trim())
      return setError(
        "Please share pickup or drop-off details so we can coordinate"
      );

    const finalCategory = isLinked ? "Money" : parentCategory || "Money";

    let receiptUrl: string | undefined;
    if (kind === "cash" && receiptFile && user) {
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

    const composedMessage = [
      kind === "in_kind"
        ? `Direct item donation. Pickup/Drop-off: ${pickupDetails.trim()}`
        : null,
      message.trim() || null,
    ]
      .filter(Boolean)
      .join("\n");

    createDonation.mutate(
      {
        category: finalCategory,
        subcategory: effectiveCategory,
        amount: effectiveAmount,
        aid_request_id: linkedRequest?.id,
        payment_method: kind === "in_kind" ? DIRECT_DELIVERY_METHOD : payment,
        transaction_id: transactionId || undefined,
        message: composedMessage || undefined,
        receipt_url: receiptUrl,
      },
      {
        onSuccess: () => {
          toast.success(
            isLinked
              ? "Donation submitted! The aid request has been fulfilled."
              : kind === "in_kind"
                ? "Thank you! We'll contact you to arrange pickup/drop-off."
                : "Donation submitted successfully!"
          );
          setCategory("");
          setAmount("");
          setPayment("");
          setTransactionId("");
          setMessage("");
          setPickupDetails("");
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
      <h2 className="text-heading text-2xl font-light tracking-tight text-center mb-2">
        {isLinked ? "Fund Aid Request" : "Make a Donation"}
      </h2>

      {!isLinked && (
        <p className="text-body text-xs text-center mb-5 max-w-[380px] mx-auto">
          Wondering how your donation is used? Choose <b>Donate Items Directly</b> to
          deliver books, uniforms, or supplies yourself, or <b>Donate Money</b> and
          we will purchase the listed items on your behalf with receipts.
        </p>
      )}

      {isLinked && (
        <div className="bg-primary/5 border border-primary/20 rounded p-4 mb-6 space-y-1.5">
          <p className="text-sm text-heading font-medium">
            Aid Type: {linkedRequest.aid_type}
          </p>
          <p className="text-sm text-body">{linkedRequest.description}</p>
          <p className="text-sm text-heading">
            Fixed Donation:{" "}
            <span className="font-medium">
              Rs. {FIXED_AID_REQUEST_AMOUNT.toLocaleString()}
            </span>
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
        {/* Donation kind toggle — only for free-form donations */}
        {!isLinked && (
          <div className="grid grid-cols-2 gap-2">
            {(["cash", "in_kind"] as DonationKind[]).map((k) => {
              const Icon = k === "cash" ? HandCoins : BookOpen;
              const active = kind === k;
              const disabled = k === "in_kind" && isCashOnly;
              return (
                <button
                  key={k}
                  type="button"
                  disabled={disabled}
                  onClick={() => setKind(k)}
                  className={`flex flex-col items-start gap-1 rounded-lg border p-3 text-left transition-colors ${
                    active
                      ? "border-primary bg-primary/5 text-heading"
                      : "border-border text-body hover:border-primary/40"
                  } ${disabled ? "opacity-40 cursor-not-allowed" : ""}`}
                >
                  <Icon
                    className={`w-4 h-4 ${active ? "text-primary" : "text-body"}`}
                  />
                  <span className="text-sm font-medium">
                    {DONATION_KIND_LABEL[k]}
                  </span>
                  <span className="text-[11px] leading-tight text-body">
                    {DONATION_KIND_DESCRIPTION[k]}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* Category — hidden when funding an aid request */}
        {!isLinked && (
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-3 py-3 rounded border border-border text-sm text-heading focus:border-primary focus:outline-none"
          >
            <option value="" disabled>
              Select Donation Category
            </option>
            {Object.entries(DONATION_CATEGORIES).map(([group, items]) => (
              <optgroup key={group} label={group}>
                {items.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        )}

        {/* Amount — read-only when funding an aid request */}
        {isLinked ? (
          <input
            type="text"
            value={`Rs. ${FIXED_AID_REQUEST_AMOUNT.toLocaleString()}`}
            readOnly
            className="w-full px-3 py-3 rounded border border-border text-sm text-heading bg-gray-50 cursor-not-allowed"
          />
        ) : (
          <div>
            <input
              type="number"
              min={MIN_DONATION_AMOUNT}
              max={MAX_DONATION_AMOUNT}
              step="1"
              placeholder={
                kind === "in_kind"
                  ? `Estimated value (Rs ${MIN_DONATION_AMOUNT.toLocaleString()}–${MAX_DONATION_AMOUNT.toLocaleString()})`
                  : `Amount (Rs ${MIN_DONATION_AMOUNT.toLocaleString()}–${MAX_DONATION_AMOUNT.toLocaleString()})`
              }
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-3 py-3 rounded border border-border text-sm text-heading placeholder:text-body focus:border-primary focus:outline-none"
            />
            <p className="text-[11px] text-body mt-1 px-1">
              Minimum Rs. {MIN_DONATION_AMOUNT.toLocaleString()} · Maximum Rs.{" "}
              {MAX_DONATION_AMOUNT.toLocaleString()}
            </p>
          </div>
        )}

        {kind === "in_kind" && !isLinked ? (
          <textarea
            placeholder="Pickup or drop-off details (address, preferred time, contact number)"
            rows={3}
            value={pickupDetails}
            onChange={(e) => setPickupDetails(e.target.value)}
            className="w-full px-3 py-3 rounded border border-border text-sm text-heading placeholder:text-body focus:border-primary focus:outline-none resize-none"
          />
        ) : (
          <>
            <h4 className="text-primary text-sm font-normal mt-1">
              Payment Method
            </h4>

            <select
              value={payment}
              onChange={(e) => setPayment(e.target.value)}
              className="w-full px-3 py-3 rounded border border-border text-sm text-heading focus:border-primary focus:outline-none"
            >
              <option value="" disabled>
                Select Payment Method
              </option>
              {CASH_PAYMENT_METHODS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>

            {payment === "Self Payment" && (
              <p className="text-[11px] text-body -mt-1.5 px-1">
                Note: TCS delivery/processing charges apply on top of your
                donation, so the minimum amount is Rs.{" "}
                {MIN_DONATION_AMOUNT.toLocaleString()}.
              </p>
            )}

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
          </>
        )}

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
              ? `Donate Rs. ${FIXED_AID_REQUEST_AMOUNT.toLocaleString()}`
              : kind === "in_kind"
                ? "Submit Item Donation"
                : "Confirm Donation"}
        </Button>
      </form>
    </Card>
  );
}
