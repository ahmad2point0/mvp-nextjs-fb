"use client";

import { useMutation } from "@tanstack/react-query";
import { api, ApiError } from "@/global/lib/api";
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

interface VerifyOtpInput {
  email: string;
  token: string;
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
    onError: (err, variables) => {
      if (err instanceof ApiError && err.code === "unverified") {
        router.push(
          `/verify-otp?email=${encodeURIComponent(variables.email)}`
        );
      }
    },
  });
}

export function useRegister() {
  const router = useRouter();

  return useMutation({
    mutationFn: (input: RegisterInput) =>
      api.post<{ user: unknown }>("/auth/register", input),
    onSuccess: (_data, variables) => {
      router.push(`/verify-otp?email=${encodeURIComponent(variables.email)}`);
    },
  });
}

export function useVerifyOtp() {
  const { setUser } = useAuthStore();
  const router = useRouter();

  return useMutation({
    mutationFn: (input: VerifyOtpInput) =>
      api.post<{ user: unknown; session: unknown }>("/auth/verify-otp", input),
    onSuccess: async () => {
      // Hydrate the auth store BEFORE navigating so the upload form
      // sees a valid user immediately on mount.
      try {
        const profile = await api.get<UserProfile>("/auth/me");
        setUser(profile);
      } catch {
        // ignore — auth provider will sync on next mount
      }
      router.push("/upload-documents");
    },
  });
}

export function useResendOtp() {
  return useMutation({
    mutationFn: (email: string) =>
      api.post<{ ok: boolean }>("/auth/resend-otp", { email }),
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
