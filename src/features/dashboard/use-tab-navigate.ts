"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";

export function useTabNavigate() {
  const router = useRouter();

  return useCallback(
    (tabKey: string) => {
      router.push(`/dashboard?tab=${tabKey}`, { scroll: false });
    },
    [router]
  );
}
