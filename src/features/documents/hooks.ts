"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, ApiError } from "@/global/lib/api";

export type DocumentType = "cnic_front" | "cnic_back" | "student_doc";
export type DocumentBucket = "cnic-documents" | "student-documents";

export interface UserDocument {
  id: string;
  document_type: DocumentType;
  uploaded_at: string;
  signed_url: string | null;
}

interface UploadDocumentInput {
  file: File;
  userId: string;
  documentType: DocumentType;
  bucket: DocumentBucket;
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
    }: UploadDocumentInput) => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("document_type", documentType);
      formData.append("bucket", bucket);

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

export function useUserDocuments(userId: string | undefined) {
  return useQuery<UserDocument[]>({
    queryKey: ["documents", userId],
    queryFn: () => api.get<UserDocument[]>(`/documents/${userId}`),
    enabled: !!userId,
    staleTime: 9 * 60 * 1000, // signed URLs expire after 10 min
  });
}
