"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, ApiError } from "@/global/lib/api";

export type DocumentType = "cnic_front" | "cnic_back" | "student_doc";
export type DocumentBucket = "cnic-documents" | "student-documents";

export type VerificationStatus = "pending" | "approved" | "rejected";

export interface UserDocument {
  id: string;
  document_type: DocumentType;
  uploaded_at: string;
  signed_url: string | null;
  verification_status?: VerificationStatus;
  verification_notes?: string | null;
  aid_request_id?: string | null;
}

interface UploadDocumentInput {
  file: File;
  userId: string;
  documentType: DocumentType;
  bucket: DocumentBucket;
  aidRequestId?: string;
}

interface UploadDocumentResponse {
  id: string;
  storage_path: string;
  signed_url: string | null;
}

export function useUploadDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      file,
      documentType,
      bucket,
      aidRequestId,
    }: UploadDocumentInput) => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("document_type", documentType);
      formData.append("bucket", bucket);
      if (aidRequestId) formData.append("aid_request_id", aidRequestId);

      const response = await fetch("/api/documents", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) {
        throw new ApiError(
          response.status,
          data.error || "Upload failed",
          data.code,
          data
        );
      }
      return data as UploadDocumentResponse;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["documents", variables.userId],
      });
    },
  });
}

export function useUserDocuments(
  userId: string | undefined,
  aidRequestId?: string
) {
  const qs = aidRequestId ? `?aid_request_id=${aidRequestId}` : "";
  return useQuery<UserDocument[]>({
    queryKey: ["documents", userId, aidRequestId ?? null],
    queryFn: () => api.get<UserDocument[]>(`/documents/${userId}${qs}`),
    enabled: !!userId,
    staleTime: 9 * 60 * 1000,
  });
}

export function useVerifyDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      verification_status,
      verification_notes,
    }: {
      id: string;
      verification_status: "approved" | "rejected";
      verification_notes?: string;
    }) =>
      api.patch(`/documents/verify/${id}`, {
        verification_status,
        verification_notes,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      queryClient.invalidateQueries({ queryKey: ["aid-requests"] });
    },
  });
}
