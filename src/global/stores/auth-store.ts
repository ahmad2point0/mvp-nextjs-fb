import { create } from "zustand";

export type UserRole = "admin" | "donor" | "volunteer" | "student";

export interface UserProfile {
  id: string;
  email: string;
  role: UserRole;
  full_name: string;
  phone: string | null;
  approved: boolean;
}

interface AuthState {
  user: UserProfile | null;
  isLoading: boolean;
  setUser: (user: UserProfile | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  setUser: (user) => set({ user, isLoading: false }),
  setLoading: (isLoading) => set({ isLoading }),
  logout: () => set({ user: null, isLoading: false }),
}));
