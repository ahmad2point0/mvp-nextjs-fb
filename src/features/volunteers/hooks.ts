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
  profiles?: { full_name: string; email: string } | null;
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

export function useCreateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: {
      volunteer_id: string;
      student_name: string;
      task_description: string;
      due_date: string;
    }) => api.post("/volunteer-tasks", input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["volunteer-tasks"] });
    },
  });
}

export function useUpdateApplicationStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api.patch(`/volunteer-applications/${id}`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["volunteer-applications"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
  });
}

export function useActiveVolunteers() {
  return useQuery<{ id: string; full_name: string; email: string }[]>({
    queryKey: ["active-volunteers"],
    queryFn: () => api.get("/admin/users?role=volunteer&blocked=false"),
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
