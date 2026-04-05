"use client";

import { LogOut } from "lucide-react";
import { useLogout } from "@/features/auth/hooks";
import type { UserProfile, UserRole } from "@/global/stores/auth-store";
import type { TabDefinition } from "@/features/dashboard/tab-config";

interface SidebarProps {
  user: UserProfile;
  tabs: TabDefinition[];
  activeTab: string;
  onTabChange: (tabKey: string) => void;
  effectiveRole: UserRole;
}

export function Sidebar({
  user,
  tabs,
  activeTab,
  onTabChange,
  effectiveRole,
}: SidebarProps) {
  const logout = useLogout();

  return (
    <aside className="w-60 shrink-0 bg-brand-dark text-white min-h-screen p-5 hidden lg:block">
      <h3 className="text-lg font-light tracking-tight mb-2">CSEAS</h3>
      <p className="text-white/50 text-xs mb-6 capitalize">
        {user.full_name} &middot; {effectiveRole}
      </p>

      <nav className="flex flex-col gap-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => onTabChange(tab.key)}
              className={`flex items-center gap-2.5 w-full text-left px-3 py-2.5 rounded text-sm transition-colors ${
                activeTab === tab.key
                  ? "bg-white/20 text-white"
                  : "text-white/80 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}

        <button
          onClick={() => logout.mutate()}
          disabled={logout.isPending}
          className="flex items-center gap-2.5 w-full text-left px-3 py-2.5 rounded text-sm text-white/60 hover:bg-white/10 hover:text-white transition-colors mt-4"
        >
          <LogOut className="w-4 h-4" />
          {logout.isPending ? "Logging out..." : "Logout"}
        </button>
      </nav>
    </aside>
  );
}
