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
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (profile) {
          setUser({
            id: profile.id,
            email: user.email!,
            role: profile.role,
            full_name: profile.full_name,
            phone: profile.phone,
            approved: profile.approved,
          });
        } else {
          setUser(null);
        }
      } else {
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
          .select("*")
          .eq("id", session.user.id)
          .single();

        if (profile) {
          setUser({
            id: profile.id,
            email: session.user.email!,
            role: profile.role,
            full_name: profile.full_name,
            phone: profile.phone,
            approved: profile.approved,
          });
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [setUser, setLoading]);

  return <>{children}</>;
}
