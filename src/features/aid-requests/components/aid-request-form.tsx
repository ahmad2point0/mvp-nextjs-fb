"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { Info, Upload, X, FileText, CheckCircle2, Eye } from "lucide-react";
import { toast } from "sonner";
import { Card, Button } from "@/global/components";
import {
  MAX_DONATION_AMOUNT,
  MIN_DONATION_AMOUNT,
  validateDonationAmount,
  REQUEST_CATEGORIES,
  ITEM_DELIVERY_CATEGORIES,
  CATEGORY_REQUIRED_DOCS,
  type RequestCategory,
} from "@/features/donations/constants";
import { useAuthStore } from "@/global/stores/auth-store";
import { useUploadDocument } from "@/features/documents/hooks";
import { UserDocumentsViewer } from "@/features/documents/components/user-documents-viewer";
import { useCreateAidRequest } from "../hooks";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ACCEPTED_MIME = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
const ACCEPT_ATTR = "image/jpeg,image/png,image/webp,application/pdf";

interface UploadedDoc {
  id: string;
  name: string;
  signed_url: string | null;
  size: number;
}

export function AidRequestForm() {
  const { user } = useAuthStore();
  const [category, setCategory] = useState<RequestCategory | "">("");
  const [aidType, setAidType] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [error, setError] = useState("");
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [uploadedDocs, setUploadedDocs] = useState<UploadedDoc[]>([]);
  const [showDocsViewer, setShowDocsViewer] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadDocument = useUploadDocument();
  const createRequest = useCreateAidRequest();

  const isItemCategory = category
    ? ITEM_DELIVERY_CATEGORIES.has(category)
    : false;
  const requiredDocs = category
    ? CATEGORY_REQUIRED_DOCS[category] ?? ["Supporting Proof"]
    : [];

  function handleFilesPicked(files: FileList | null) {
    if (!files) return;
    const next: File[] = [];
    for (const f of Array.from(files)) {
      if (!ACCEPTED_MIME.includes(f.type)) {
        toast.error(`${f.name}: only images or PDFs are allowed`);
        continue;
      }
      if (f.size > MAX_FILE_SIZE) {
        toast.error(`${f.name}: must be 5MB or smaller`);
        continue;
      }
      next.push(f);
    }
    setPendingFiles((prev) => [...prev, ...next]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function uploadPending() {
    if (!user) {
      toast.error("Please sign in first");
      return;
    }
    if (pendingFiles.length === 0) return;

    for (const file of pendingFiles) {
      try {
        const res = await uploadDocument.mutateAsync({
          file,
          userId: user.id,
          documentType: "student_doc",
          bucket: "student-documents",
        });
        setUploadedDocs((prev) => [
          ...prev,
          {
            id: res.id,
            name: file.name,
            signed_url: res.signed_url,
            size: file.size,
          },
        ]);
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : `Failed to upload ${file.name}`
        );
      }
    }
    setPendingFiles([]);
  }

  function removeUploaded(id: string) {
    setUploadedDocs((prev) => prev.filter((d) => d.id !== id));
  }

  function removePending(idx: number) {
    setPendingFiles((prev) => prev.filter((_, i) => i !== idx));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!category) return setError("Please select a request category");
    if (!aidType.trim()) return setError("Please describe the aid type");
    if (!description.trim()) return setError("Description is required");

    if (isItemCategory) {
      if (deliveryAddress.trim().length < 10) {
        return setError(
          "Delivery address is required for item donations (min 10 characters)."
        );
      }
    } else {
      if (!amount) return setError("Amount is required");
      const numericAmount = parseFloat(amount);
      const amountError = validateDonationAmount(numericAmount);
      if (amountError) return setError(amountError);
    }

    if (pendingFiles.length > 0) {
      return setError(
        "You have files that haven't been uploaded yet. Click 'Upload Documents' first."
      );
    }
    if (uploadedDocs.length === 0) {
      return setError(
        "At least one supporting document is required before submitting."
      );
    }

    createRequest.mutate(
      {
        aid_type: aidType,
        category,
        amount: isItemCategory ? undefined : parseFloat(amount),
        description,
        delivery_address: isItemCategory ? deliveryAddress.trim() : undefined,
        document_ids: uploadedDocs.map((d) => d.id),
      },
      {
        onSuccess: () => {
          toast.success("Aid request submitted!");
          setCategory("");
          setAidType("");
          setAmount("");
          setDescription("");
          setDeliveryAddress("");
          setUploadedDocs([]);
        },
        onError: (err) => toast.error(err.message),
      }
    );
  }

  return (
    <Card bordered className="max-w-[560px] mx-auto">
      <h2 className="text-heading text-2xl font-light tracking-tight text-center mb-5">
        Education Aid Request
      </h2>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as RequestCategory)}
          className="w-full px-3 py-3 rounded border border-border text-sm text-heading focus:border-primary focus:outline-none"
        >
          <option value="" disabled>
            Select Request Category
          </option>
          {REQUEST_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Short title (e.g. Semester 4 tuition fee)"
          value={aidType}
          onChange={(e) => setAidType(e.target.value)}
          className="w-full px-3 py-3 rounded border border-border text-sm text-heading placeholder:text-body focus:border-primary focus:outline-none"
        />

        {!isItemCategory && (
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
              {MAX_DONATION_AMOUNT.toLocaleString()} (5-digit cap)
            </p>
          </div>
        )}

        {isItemCategory && (
          <div>
            <textarea
              placeholder="Delivery address — house, street, city, postal code, contact number"
              rows={3}
              value={deliveryAddress}
              onChange={(e) => setDeliveryAddress(e.target.value)}
              className="w-full px-3 py-3 rounded border border-border text-sm text-heading placeholder:text-body focus:border-primary focus:outline-none resize-none"
            />
            <p className="text-[11px] text-body mt-1 px-1">
              For item donations we display this to the accepted donor so they
              can ship or drop off the items.
            </p>
          </div>
        )}

        <textarea
          placeholder="Explain your need in detail"
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full px-3 py-3 rounded border border-border text-sm text-heading placeholder:text-body focus:border-primary focus:outline-none resize-none"
        />

        {/* Document upload section — placed ABOVE the submit button. */}
        <div className="rounded-lg border border-border bg-canvas p-3.5">
          <div className="flex items-center gap-2 mb-2">
            <Upload className="w-4 h-4 text-primary" />
            <h4 className="text-heading text-sm font-medium">
              Supporting Documents
            </h4>
          </div>

          <div className="mb-3 rounded-md border border-primary/20 bg-primary/4 p-2.5">
            <div className="flex items-center gap-2 mb-1">
              <Info className="w-3.5 h-3.5 text-primary" />
              <h5 className="text-heading text-xs font-medium">
                Documents are mandatory
              </h5>
            </div>
            <p className="text-body text-[11px] leading-relaxed">
              Each request must include supporting proof so donors can verify
              your need. Required documents depend on the category you select
              above.{" "}
              <Link
                href="/upload-documents"
                className="text-primary hover:text-primary-hover underline"
              >
                View revised documents on your profile
              </Link>
              .
            </p>
          </div>

          {requiredDocs.length > 0 && (
            <p className="text-body text-xs mb-3">
              Required for <b>{category}</b>: {requiredDocs.join(", ")}.
              Upload multiple files if needed.
            </p>
          )}

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={ACCEPT_ATTR}
            onChange={(e) => handleFilesPicked(e.target.files)}
            className="block w-full text-xs text-body file:mr-3 file:px-3 file:py-1.5 file:rounded file:border-0 file:text-xs file:bg-primary/10 file:text-primary hover:file:bg-primary/20 file:cursor-pointer"
          />

          {pendingFiles.length > 0 && (
            <div className="mt-3 space-y-1.5">
              <p className="text-xs text-body">
                Selected ({pendingFiles.length}) — not yet uploaded:
              </p>
              <ul className="space-y-1">
                {pendingFiles.map((f, i) => (
                  <li
                    key={`${f.name}-${i}`}
                    className="flex items-center gap-2 text-xs text-body bg-white rounded border border-border px-2 py-1.5"
                  >
                    <FileText className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span className="truncate flex-1">{f.name}</span>
                    <button
                      type="button"
                      onClick={() => removePending(i)}
                      className="text-body hover:text-ruby"
                      aria-label="Remove"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
              <Button
                type="button"
                variant="neutral"
                onClick={uploadPending}
                disabled={uploadDocument.isPending}
                className="text-xs px-3 py-1.5 h-auto"
              >
                {uploadDocument.isPending
                  ? "Uploading..."
                  : `Upload ${pendingFiles.length} Document${
                      pendingFiles.length === 1 ? "" : "s"
                    }`}
              </Button>
            </div>
          )}

          <div className="mt-3 pt-3 border-t border-border">
            <button
              type="button"
              onClick={() => setShowDocsViewer(true)}
              className="inline-flex items-center gap-1.5 text-xs text-primary hover:text-primary-hover hover:underline"
            >
              <Eye className="w-3.5 h-3.5" />
              View Uploaded Documents
            </button>
          </div>

          {uploadedDocs.length > 0 && (
            <div className="mt-3 space-y-1.5">
              <p className="text-xs text-body flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Uploaded ({uploadedDocs.length}) — ready to submit:
              </p>
              <ul className="space-y-1">
                {uploadedDocs.map((d) => (
                  <li
                    key={d.id}
                    className="flex items-center gap-2 text-xs bg-white rounded border border-border px-2 py-1.5"
                  >
                    <FileText className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    {d.signed_url ? (
                      <a
                        href={d.signed_url}
                        target="_blank"
                        rel="noreferrer"
                        className="truncate flex-1 text-primary hover:underline"
                      >
                        {d.name}
                      </a>
                    ) : (
                      <span className="truncate flex-1 text-heading">
                        {d.name}
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => removeUploaded(d.id)}
                      className="text-body hover:text-ruby"
                      aria-label="Remove"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {error && <p className="text-ruby text-xs">{error}</p>}

        <Button type="submit" fullWidth disabled={createRequest.isPending}>
          {createRequest.isPending ? "Submitting..." : "Submit Aid Request"}
        </Button>
      </form>

      {showDocsViewer && user && (
        <UserDocumentsViewer
          userId={user.id}
          userName={user.full_name || user.email}
          onClose={() => setShowDocsViewer(false)}
        />
      )}
    </Card>
  );
}
