import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/global/lib/api";

interface Donation {
  id: string;
  donor_id: string;
  category: string;
  subcategory: string | null;
  amount: number;
  beneficiary_id: string | null;
  payment_method: string;
  transaction_id: string | null;
  message: string | null;
  status: string;
  created_at: string;
}

interface CreateDonationInput {
  category: string;
  subcategory?: string;
  amount: number;
  beneficiary_id?: string;
  payment_method: string;
  transaction_id?: string;
  message?: string;
}

export function useDonations(status?: string) {
  const params = status ? `?status=${status}` : "";
  return useQuery<Donation[]>({
    queryKey: ["donations", status],
    queryFn: () => api.get(`/donations${params}`),
  });
}

export function useCreateDonation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateDonationInput) =>
      api.post<Donation>("/donations", input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["donations"] });
    },
  });
}
