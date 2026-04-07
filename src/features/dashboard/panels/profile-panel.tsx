"use client";

import { Card, RoleBadge } from "@/global/components";
import { useAuthStore } from "@/global/stores/auth-store";

export function ProfilePanel() {
  const { user } = useAuthStore();

  if (!user) return null;

  return (
    <>
      <h2 className="text-heading text-2xl font-light tracking-tight mb-6">
        My Profile
      </h2>
      <Card bordered className="max-w-[480px]">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-2xl text-primary">
            {user.full_name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="text-heading text-lg font-light">
              {user.full_name}
            </h3>
            <RoleBadge role={user.role} className="mt-1" />
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-label text-xs uppercase tracking-wide">
              Email
            </label>
            <p className="text-heading text-sm mt-1">{user.email}</p>
          </div>
          <div>
            <label className="text-label text-xs uppercase tracking-wide">
              Phone
            </label>
            <p className="text-heading text-sm mt-1">
              {user.phone || "Not provided"}
            </p>
          </div>
          <div>
            <label className="text-label text-xs uppercase tracking-wide">
              Status
            </label>
            <div className="flex items-center gap-2 mt-1">
              {user.is_verified ? (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-700">
                  Verified
                </span>
              ) : (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-700">
                  Unverified
                </span>
              )}
              {user.is_blocked && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-700">
                  Blocked
                </span>
              )}
            </div>
          </div>
        </div>
      </Card>
    </>
  );
}
