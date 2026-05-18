"use client";

import { useState } from "react";
import { FileText, Download, X, Check, XCircle } from "lucide-react";
import { toast } from "sonner";
import { useUserDocuments, useVerifyDocument, type DocumentType } from "../hooks";
import { useAuthStore } from "@/global/stores/auth-store";

const TYPE_LABELS: Record<DocumentType, string> = {
  cnic_front: "CNIC Front",
  cnic_back: "CNIC Back",
  student_doc: "Supporting Document",
};

interface UserDocumentsViewerProps {
  userId: string;
  userName?: string;
  aidRequestId?: string;
  onClose?: () => void;
}

export function UserDocumentsViewer({
  userId,
  userName,
  aidRequestId,
  onClose,
}: UserDocumentsViewerProps) {
  const { user } = useAuthStore();
  const isAdmin = user?.role === "admin";

  const {
    data: documents,
    isLoading,
    error,
  } = useUserDocuments(userId, aidRequestId);
  const verify = useVerifyDocument();

  const [rejectNotesFor, setRejectNotesFor] = useState<string | null>(null);
  const [rejectNote, setRejectNote] = useState("");

  function handleApprove(id: string) {
    verify.mutate(
      { id, verification_status: "approved" },
      {
        onSuccess: () => toast.success("Document approved"),
        onError: (err) => toast.error(err.message),
      }
    );
  }

  function handleReject(id: string) {
    verify.mutate(
      {
        id,
        verification_status: "rejected",
        verification_notes: rejectNote.trim() || undefined,
      },
      {
        onSuccess: () => {
          toast.success("Document rejected");
          setRejectNotesFor(null);
          setRejectNote("");
        },
        onError: (err) => toast.error(err.message),
      }
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-lg shadow-elevated max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div>
            <h3 className="text-heading text-lg font-medium">
              {aidRequestId
                ? "Supporting Documents"
                : "Verification Documents"}
            </h3>
            {userName && (
              <p className="text-body text-sm mt-0.5">{userName}</p>
            )}
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="rounded p-1 hover:bg-gray-100"
              aria-label="Close"
            >
              <X className="w-5 h-5 text-body" />
            </button>
          )}
        </div>

        <div className="p-5">
          {isLoading && (
            <p className="text-body text-sm text-center py-8">
              Loading documents...
            </p>
          )}
          {error && (
            <p className="text-ruby text-sm text-center py-8">
              Failed to load documents
            </p>
          )}
          {!isLoading && !error && (documents?.length ?? 0) === 0 && (
            <p className="text-body text-sm text-center py-8">
              No documents uploaded yet.
            </p>
          )}
          {documents && documents.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {documents.map((doc) => {
                const status = doc.verification_status ?? "pending";
                const statusStyle =
                  status === "approved"
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : status === "rejected"
                      ? "bg-ruby/10 text-ruby border-ruby/30"
                      : "bg-amber-50 text-amber-700 border-amber-200";
                return (
                  <div
                    key={doc.id}
                    className="rounded border border-border overflow-hidden bg-gray-50 flex flex-col"
                  >
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
                    <div className="px-3 pb-3 flex flex-col gap-2">
                      <span
                        className={`inline-block px-2 py-0.5 text-[10px] rounded border self-start ${statusStyle}`}
                      >
                        {status}
                      </span>
                      {doc.verification_notes && (
                        <p className="text-[11px] text-body italic leading-snug">
                          “{doc.verification_notes}”
                        </p>
                      )}
                      {isAdmin && status === "pending" && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleApprove(doc.id)}
                            disabled={verify.isPending}
                            className="flex-1 inline-flex items-center justify-center gap-1 rounded bg-emerald-600 text-white text-xs py-1.5 hover:bg-emerald-700 disabled:opacity-50"
                          >
                            <Check className="w-3.5 h-3.5" /> Approve
                          </button>
                          <button
                            onClick={() => {
                              setRejectNotesFor(doc.id);
                              setRejectNote("");
                            }}
                            disabled={verify.isPending}
                            className="flex-1 inline-flex items-center justify-center gap-1 rounded bg-ruby text-white text-xs py-1.5 hover:opacity-90 disabled:opacity-50"
                          >
                            <XCircle className="w-3.5 h-3.5" /> Reject
                          </button>
                        </div>
                      )}
                      {isAdmin && rejectNotesFor === doc.id && (
                        <div className="flex flex-col gap-1.5 pt-1">
                          <textarea
                            value={rejectNote}
                            onChange={(e) => setRejectNote(e.target.value)}
                            placeholder="Reason for rejection (optional)"
                            rows={2}
                            className="w-full px-2 py-1.5 rounded border border-border text-xs text-heading placeholder:text-body focus:border-primary focus:outline-none resize-none"
                          />
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => handleReject(doc.id)}
                              disabled={verify.isPending}
                              className="flex-1 rounded bg-ruby text-white text-xs py-1.5"
                            >
                              Confirm Reject
                            </button>
                            <button
                              type="button"
                              onClick={() => setRejectNotesFor(null)}
                              className="flex-1 rounded border border-border text-xs py-1.5 text-body"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
