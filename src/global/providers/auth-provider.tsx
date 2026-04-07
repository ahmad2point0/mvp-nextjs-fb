"use client";

import { useEffect, type ReactNode } from "react";
import { createClient } from "@/global/lib/supabase";
import { useAuthStore } from "@/global/stores/auth-store";

export function AuthProvider({ children }: { children: ReactNode }) {
  const { setUser, setLoading } = useAuthStore();

  useEffect(() => {
    const supabase = createClient();

    async function getSession() {
      setLoading(true);
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("id, role, full_name, phone, is_blocked")
            .eq("id", user.id)
            .single();

          if (profile) {
            setUser({
              id: profile.id,
              email: user.email!,
              role: profile.role,
              full_name: profile.full_name,
              phone: profile.phone,
              is_blocked: profile.is_blocked,
              is_verified: !!user.email_confirmed_at,
            });
          } else {
            setUser(null);
          }
        } else {
          setUser(null);
        }
      } catch {
        setUser(null);
      }
    }

    getSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_OUT" || !session) {
        setUser(null);
        return;
      }
      if (session?.user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("id, role, full_name, phone, is_blocked")
          .eq("id", session.user.id)
          .single();

        if (profile) {
          setUser({
            id: profile.id,
            email: session.user.email!,
            role: profile.role,
            full_name: profile.full_name,
            phone: profile.phone,
            is_blocked: profile.is_blocked,
            is_verified: !!session.user.email_confirmed_at,
          });
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [setUser, setLoading]);

  return <>{children}</>;
}
