import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/global/lib/api";
import { createClient } from "@/global/lib/supabase";

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
  receipt_url: string | null;
  status: string;
  created_at: string;
}

interface CreateDonationInput {
  category: string;
  subcategory?: string;
  amount: number;
  beneficiary_id?: string;
  aid_request_id?: string;
  payment_method: string;
  transaction_id?: string;
  message?: string;
  receipt_url?: string;
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

export function useUpdateDonationStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api.patch<Donation>(`/donations/${id}`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["donations"] });
    },
  });
}

export function useUploadReceipt() {
  return useMutation({
    mutationFn: async ({ file, userId }: { file: File; userId: string }) => {
      const supabase = createClient();
      const timestamp = Date.now();
      const path = `${userId}/${timestamp}_${file.name}`;
      const { error } = await supabase.storage
        .from("donation-receipts")
        .upload(path, file);
      if (error) throw error;
      return path;
    },
  });
}
