"use client";

import { Button } from "@/global/components";
import { useLogout } from "@/features/auth/hooks";

export default function LogoutPage() {
  const logout = useLogout();

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-80 w-full text-center">
        <h2 className="text-heading text-2xl font-light tracking-tight mb-2">
          Log Out
        </h2>
        <p className="text-body text-sm mb-6">
          Are you sure you want to log out?
        </p>
        <div className="flex gap-3 justify-center">
          <Button
            onClick={() => logout.mutate()}
            disabled={logout.isPending}
          >
            {logout.isPending ? "Logging out..." : "Yes, Log Out"}
          </Button>
          <Button variant="ghost" onClick={() => window.history.back()}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
