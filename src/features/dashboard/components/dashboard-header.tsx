"use client";

import { Bell, LogOut } from "lucide-react";
import { RoleBadge } from "@/global/components";
import { useLogout } from "@/features/auth/hooks";
import type { UserProfile, UserRole } from "@/global/stores/auth-store";

interface DashboardHeaderProps {
  user: UserProfile;
  unreadCount: number;
  onNotificationsClick: () => void;
  effectiveRole: UserRole;
  onRoleSwitch?: (role: UserRole | null) => void;
}

const ALL_ROLES: UserRole[] = ["admin", "donor", "volunteer", "student"];

export function DashboardHeader({
  user,
  unreadCount,
  onNotificationsClick,
  effectiveRole,
  onRoleSwitch,
}: DashboardHeaderProps) {
  const logout = useLogout();
  const isAdmin = user.role === "admin";
  const isOverridden = effectiveRole !== user.role;

  return (
    <header className="bg-white border-b border-border px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <h1 className="text-heading text-lg font-light tracking-tight">
          CSEAS
        </h1>
        <span className="text-border">|</span>
        <span className="text-body text-sm">Dashboard</span>
      </div>

      <div className="flex items-center gap-4">
        {isAdmin && onRoleSwitch && (
          <div className="flex items-center gap-2">
            <label className="text-body text-xs">View as:</label>
            <select
              value={isOverridden ? effectiveRole : ""}
              onChange={(e) => {
                const val = e.target.value;
                onRoleSwitch(val ? (val as UserRole) : null);
              }}
              className="px-2 py-1 text-xs rounded border border-border text-heading focus:border-primary focus:outline-none"
            >
              <option value="">
                {user.role.charAt(0).toUpperCase() + user.role.slice(1)} (You)
              </option>
              {ALL_ROLES.filter((r) => r !== user.role).map((r) => (
                <option key={r} value={r}>
                  {r.charAt(0).toUpperCase() + r.slice(1)}
                </option>
              ))}
            </select>
          </div>
        )}

        <button
          onClick={onNotificationsClick}
          className="relative p-2 text-body hover:text-heading transition-colors"
          aria-label="Notifications"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 bg-ruby text-white text-[10px] font-normal w-4.5 h-4.5 flex items-center justify-center rounded-full">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>

        <RoleBadge role={effectiveRole} />

        <span className="text-heading text-sm">{user.full_name}</span>

        <button
          onClick={() => logout.mutate()}
          disabled={logout.isPending}
          className="text-body text-sm hover:text-heading transition-colors flex items-center gap-1.5"
        >
          <LogOut className="w-3.5 h-3.5" />
          {logout.isPending ? "..." : "Logout"}
        </button>
      </div>
    </header>
  );
}
