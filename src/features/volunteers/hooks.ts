import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/global/lib/api";

interface VolunteerTask {
  id: string;
  volunteer_id: string;
  student_name: string;
  task_description: string;
  due_date: string;
  status: string;
}

interface VolunteerApplication {
  id: string;
  user_id: string;
  role: string;
  motivation: string;
  status: string;
  created_at: string;
}

export function useVolunteerTasks(status?: string) {
  const params = status ? `?status=${status}` : "";
  return useQuery<VolunteerTask[]>({
    queryKey: ["volunteer-tasks", status],
    queryFn: () => api.get(`/volunteer-tasks${params}`),
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...body }: { id: string; status: string }) =>
      api.patch(`/volunteer-tasks/${id}`, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["volunteer-tasks"] });
    },
  });
}

export function useVolunteerApplications() {
  return useQuery<VolunteerApplication[]>({
    queryKey: ["volunteer-applications"],
    queryFn: () => api.get("/volunteer-applications"),
  });
}

export function useApplyVolunteer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: { role: string; motivation: string }) =>
      api.post("/volunteer-applications", input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["volunteer-applications"] });
    },
  });
}
