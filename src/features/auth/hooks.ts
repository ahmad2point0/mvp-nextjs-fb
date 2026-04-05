"use client";

import { useMutation } from "@tanstack/react-query";
import { api } from "@/global/lib/api";
import { useAuthStore, type UserProfile } from "@/global/stores/auth-store";
import { useRouter } from "next/navigation";

interface LoginInput {
  email: string;
  password: string;
}

interface RegisterInput {
  email: string;
  password: string;
  full_name: string;
  phone?: string;
  role: string;
}

export function useLogin() {
  const { setUser } = useAuthStore();
  const router = useRouter();

  return useMutation({
    mutationFn: (input: LoginInput) =>
      api.post<{ user: unknown; session: unknown }>("/auth/login", input),
    onSuccess: async () => {
      const profile = await api.get<UserProfile>("/auth/me");
      setUser(profile);
      router.push("/dashboard");
    },
  });
}

export function useRegister() {
  const router = useRouter();

  return useMutation({
    mutationFn: (input: RegisterInput) =>
      api.post<{ user: unknown }>("/auth/register", input),
    onSuccess: () => {
      router.push("/login?registered=true");
    },
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: (email: string) =>
      api.post("/auth/reset-password", { email }),
  });
}

export function useUpdatePassword() {
  const router = useRouter();

  return useMutation({
    mutationFn: (password: string) =>
      api.post("/auth/update-password", { password }),
    onSuccess: () => {
      router.push("/login");
    },
  });
}

export function useLogout() {
  const { logout } = useAuthStore();
  const router = useRouter();

  return useMutation({
    mutationFn: () => api.post("/auth/logout"),
    onSuccess: () => {
      logout();
      router.push("/");
    },
  });
}
