"use client";

import { FileText, Download, X } from "lucide-react";
import { useUserDocuments, type DocumentType } from "../hooks";

const TYPE_LABELS: Record<DocumentType, string> = {
  cnic_front: "CNIC Front",
  cnic_back: "CNIC Back",
  student_doc: "Student Document",
};

interface UserDocumentsViewerProps {
  userId: string;
  userName?: string;
  onClose?: () => void;
}

export function UserDocumentsViewer({
  userId,
  userName,
  onClose,
}: UserDocumentsViewerProps) {
  const { data: documents, isLoading, error } = useUserDocuments(userId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-lg shadow-elevated max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div>
            <h3 className="text-heading text-lg font-medium">
              Verification Documents
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
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="rounded border border-border overflow-hidden bg-gray-50"
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
                  <div className="p-3 flex items-center justify-between">
                    <div>
                      <p className="text-heading text-sm font-medium">
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
                        className="flex items-center gap-1 text-xs text-primary hover:underline"
                      >
                        <Download className="w-3.5 h-3.5" />
                        View
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
