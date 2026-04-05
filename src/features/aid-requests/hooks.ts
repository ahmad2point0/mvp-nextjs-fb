import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/global/lib/api";

interface AidRequest {
  id: string;
  student_id: string;
  aid_type: string;
  amount: number;
  description: string;
  status: string;
  created_at: string;
}

interface CreateAidRequestInput {
  aid_type: string;
  amount: number;
  description: string;
}

export function useAidRequests(status?: string) {
  const params = status ? `?status=${status}` : "";
  return useQuery<AidRequest[]>({
    queryKey: ["aid-requests", status],
    queryFn: () => api.get(`/aid-requests${params}`),
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
