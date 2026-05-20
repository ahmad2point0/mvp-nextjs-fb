"use client";

import { useState } from "react";
import {
  X,
  FileText,
  Download,
  MapPin,
  CheckCircle,
  Clock,
} from "lucide-react";
import { Button } from "@/global/components";
import {
  useUserDocuments,
  type DocumentType,
  type UserDocument,
} from "@/features/documents";
import {
  CASH_PAYMENT_METHODS,
  ITEM_DELIVERY_CATEGORIES,
} from "@/features/donations/constants";
import type { AidRequest } from "../hooks";

const TYPE_LABELS: Record<DocumentType, string> = {
  cnic_front: "CNIC Front",
  cnic_back: "CNIC Back",
  student_doc: "Supporting Document",
};

const statusStyle: Record<string, string> = {
  approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
  rejected: "bg-ruby/10 text-ruby border-ruby/30",
  pending: "bg-amber-50 text-amber-700 border-amber-200",
};

interface AidRequestDetailsModalProps {
  request: AidRequest;
  /** "view" = browse only, "confirm" = review + accept the request. */
  mode: "view" | "confirm";
  onClose: () => void;
  /** Called in confirm mode once the donor picks a method and confirms. */
  onConfirm?: (paymentMethod: string) => void;
  isConfirming?: boolean;
}

/**
 * One consolidated popup showing everything a donor needs about an aid
 * request — the request details, document-verification status, and the
 * supporting documents — in a single place. The student's name and phone
 * are deliberately hidden here; they are only revealed after the donor
 * accepts the request (see the donor's "My Supported Requests" list).
 */
export function AidRequestDetailsModal({
  request,
  mode,
  onClose,
  onConfirm,
  isConfirming = false,
}: AidRequestDetailsModalProps) {
  const [paymentMethod, setPaymentMethod] = useState("");
  const [methodError, setMethodError] = useState(false);

  const { data: documents, isLoading, error } = useUserDocuments(
    request.student_id,
    request.id
  );

  const isItem =
    !!request.category && ITEM_DELIVERY_CATEGORIES.has(request.category);

  function handleConfirm() {
    if (!paymentMethod) {
      setMethodError(true);
      return;
    }
    onConfirm?.(paymentMethod);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-lg shadow-elevated max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div className="min-w-0">
            <h3 className="text-heading text-lg font-medium truncate">
              {mode === "confirm" ? "Confirm Support" : "Aid Request Details"}
            </h3>
            <p className="text-body text-sm mt-0.5 truncate">
              {request.aid_type}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded p-1 hover:bg-gray-100 shrink-0"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-body" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Request summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <DetailItem
              label="Category"
              value={request.category ?? "Uncategorised"}
            />
            <DetailItem
              label="Requested On"
              value={new Date(request.created_at).toLocaleDateString()}
            />
            {isItem ? (
              <div className="sm:col-span-2">
                <p className="text-label text-xs uppercase tracking-wide mb-1">
                  Delivery Address
                </p>
                <p className="text-heading text-sm flex items-start gap-1.5">
                  <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <span>{request.delivery_address || "Not provided"}</span>
                </p>
              </div>
            ) : (
              <DetailItem
                label="Requested Amount"
                value={`Rs. ${Number(request.amount).toLocaleString()}`}
              />
            )}
          </div>

          <div>
            <p className="text-label text-xs uppercase tracking-wide mb-1">
              Description
            </p>
            <p className="text-body text-sm leading-relaxed">
              {request.description || "No description provided."}
            </p>
          </div>

          {/* Verification status */}
          {request.documents_verified ? (
            <p className="text-sm text-emerald-700 flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4" /> Documents verified by admin
            </p>
          ) : (
            <p className="text-sm text-amber-700 flex items-center gap-1.5">
              <Clock className="w-4 h-4" /> Documents pending verification
            </p>
          )}

          {/* Supporting documents */}
          <div>
            <p className="text-label text-xs uppercase tracking-wide mb-2">
              Supporting Documents
            </p>
            {isLoading && (
              <p className="text-body text-sm py-4">Loading documents...</p>
            )}
            {error && (
              <p className="text-ruby text-sm py-4">
                Failed to load documents.
              </p>
            )}
            {!isLoading && !error && (documents?.length ?? 0) === 0 && (
              <p className="text-body text-sm py-4">
                No documents uploaded yet.
              </p>
            )}
            {documents && documents.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {documents.map((doc) => (
                  <DocumentCard key={doc.id} doc={doc} />
                ))}
              </div>
            )}
          </div>

          {/* Confirm mode: payment method + accept */}
          {mode === "confirm" && (
            <div className="border-t border-border pt-5 space-y-3">
              <div>
                <label className="text-heading text-sm font-medium mb-1.5 block">
                  Payment Method
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => {
                    setPaymentMethod(e.target.value);
                    setMethodError(false);
                  }}
                  className="w-full px-3 py-2.5 rounded border border-border text-sm text-heading focus:border-primary focus:outline-none"
                >
                  <option value="" disabled>
                    Choose payment method
                  </option>
                  {CASH_PAYMENT_METHODS.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
                {methodError && (
                  <p className="text-ruby text-xs mt-1">
                    Please choose a payment method.
                  </p>
                )}
              </div>

              <p className="text-body text-xs leading-relaxed">
                Accepting assigns this request exclusively to you. The
                student&apos;s contact details will appear in your{" "}
                <b>My Supported Requests</b> list so you can coordinate.
              </p>

              <div className="flex gap-2">
                <Button
                  variant="neutral"
                  onClick={onClose}
                  className="flex-1"
                  disabled={isConfirming}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleConfirm}
                  className="flex-1"
                  disabled={isConfirming}
                >
                  {isConfirming ? "Accepting..." : "Confirm & Accept"}
                </Button>
              </div>
            </div>
          )}

          {/* View mode: just close */}
          {mode === "view" && (
            <div className="border-t border-border pt-4">
              <Button variant="neutral" onClick={onClose} fullWidth>
                Close
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-label text-xs uppercase tracking-wide mb-1">{label}</p>
      <p className="text-heading text-sm">{value}</p>
    </div>
  );
}

function DocumentCard({ doc }: { doc: UserDocument }) {
  const status = doc.verification_status ?? "pending";
  return (
    <div className="rounded border border-border overflow-hidden bg-gray-50 flex flex-col">
      <div className="aspect-[4/3] bg-gray-100 flex items-center justify-center">
        {doc.signed_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={doc.signed_url}
            alt={TYPE_LABELS[doc.document_type]}
            className="w-full h-full object-contain"
          />
        ) : (
          <FileText className="w-10 h-10 text-body" />
        )}
      </div>
      <div className="p-3 flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="text-heading text-sm font-medium truncate">
            {TYPE_LABELS[doc.document_type]}
          </p>
          <p className="text-body text-xs">
            {new Date(doc.uploaded_at).toLocaleDateString()}
          </p>
        </div>
        {doc.signed_url && (
          <a
            href={doc.signed_url}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1 text-xs text-primary hover:underline shrink-0"
          >
            <Download className="w-3.5 h-3.5" />
            View
          </a>
        )}
      </div>
      <div className="px-3 pb-3">
        <span
          className={`inline-block px-2 py-0.5 text-[10px] rounded border self-start ${
            statusStyle[status] ?? statusStyle.pending
          }`}
        >
          {status}
        </span>
      </div>
    </div>
  );
}
