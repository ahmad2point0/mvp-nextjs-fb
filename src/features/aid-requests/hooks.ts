import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/global/lib/api";

export interface AidRequest {
  id: string;
  student_id: string;
  aid_type: string;
  category: string | null;
  amount: number;
  description: string;
  delivery_address: string | null;
  status: string;
  accepted_donor_id: string | null;
  accepted_at: string | null;
  documents_verified: boolean;
  created_at: string;
}

interface CreateAidRequestInput {
  aid_type: string;
  category: string;
  amount?: number;
  description: string;
  delivery_address?: string;
  document_ids: string[];
}

export function useAidRequests(params?: {
  status?: string;
  scope?: "available" | "mine";
}) {
  const qs = new URLSearchParams();
  if (params?.status) qs.set("status", params.status);
  if (params?.scope) qs.set("scope", params.scope);
  const suffix = qs.toString() ? `?${qs.toString()}` : "";
  return useQuery<AidRequest[]>({
    queryKey: ["aid-requests", params ?? {}],
    queryFn: () => api.get(`/aid-requests${suffix}`),
  });
}

export function useCreateAidRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateAidRequestInput) =>
      api.post<AidRequest>("/aid-requests", input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["aid-requests"] });
    },
  });
}

export interface AidRequestApplication {
  id: string;
  donor_id: string;
  status: "pending" | "accepted" | "rejected" | "withdrawn";
  payment_method: string | null;
  message: string | null;
  created_at: string;
  profiles?: { full_name: string | null; email: string | null } | null;
}

export function useAidRequestApplications(requestId: string | undefined) {
  return useQuery<AidRequestApplication[]>({
    queryKey: ["aid-request-applications", requestId],
    queryFn: () => api.get(`/aid-requests/${requestId}/applications`),
    enabled: !!requestId,
  });
}

export function useApplyForAidRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      requestId,
      payment_method,
      message,
    }: {
      requestId: string;
      payment_method: string;
      message?: string;
    }) =>
      api.post(`/aid-requests/${requestId}/applications`, {
        payment_method,
        message,
      }),
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: ["aid-requests"] });
      queryClient.invalidateQueries({
        queryKey: ["aid-request-applications", vars.requestId],
      });
    },
  });
}

export function useAcceptAidRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      requestId,
      payment_method,
    }: {
      requestId: string;
      payment_method: string;
    }) =>
      api.post(`/aid-requests/${requestId}/accept`, { payment_method }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["aid-requests"] });
    },
  });
}
