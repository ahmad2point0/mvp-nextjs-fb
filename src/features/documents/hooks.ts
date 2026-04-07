"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/global/lib/api";
import { createClient } from "@/global/lib/supabase";

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

export function useUploadDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      file,
      userId,
      documentType,
      bucket,
    }: UploadDocumentInput) => {
      const supabase = createClient();
      const timestamp = Date.now();
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const path = `${userId}/${documentType}_${timestamp}_${safeName}`;

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(path, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Record metadata in the documents table
      const doc = await api.post<{ id: string; storage_path: string }>(
        "/documents",
        {
          document_type: documentType,
          storage_path: path,
          bucket,
        }
      );

      return doc;
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
