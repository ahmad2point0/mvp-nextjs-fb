"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore, type UserRole } from "@/global/stores/auth-store";
import { useNotifications } from "@/features/notifications/hooks";
import { useRealtimeNotifications } from "@/features/notifications/use-realtime-notifications";
import { api } from "@/global/lib/api";
import { getTabsForRole, getDefaultTab } from "../tab-config";
import { PanelRouter } from "../tab-panels";
import { Sidebar } from "@/global/components/sidebar";
import { DashboardHeader } from "./dashboard-header";
import { TabNavigation } from "./tab-navigation";
import { TabPanel } from "./tab-panel";

export function DashboardShell() {
  useRealtimeNotifications();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoading, setUser } = useAuthStore();
  const queryClient = useQueryClient();
  const { data: notifications } = useNotifications();
  const [roleOverride, setRoleOverride] = useState<UserRole | null>(null);
  const authReady = !isLoading && !!user;

  // Fast-path: fetch /api/auth/me on mount (uses cookie auth, single
  // request) to populate the auth store before the slower client-side
  // Supabase getUser() + profiles query in AuthProvider finishes.
  // Also prefetches dashboard data so panel caches are warm.
  useEffect(() => {
    let cancelled = false;

    api
      .get<{
        id: string;
        email: string;
        role: string;
        full_name: string;
        phone: string | null;
        is_blocked: boolean;
        is_verified: boolean;
      }>("/auth/me")
      .then((profile) => {
        if (cancelled) return;
        setUser({
          id: profile.id,
          email: profile.email,
          role: profile.role as UserRole,
          full_name: profile.full_name,
          phone: profile.phone,
          is_blocked: profile.is_blocked,
          is_verified: profile.is_verified,
        });
        // Auth confirmed — prefetch dashboard data
        queryClient.prefetchQuery({
          queryKey: ["notifications"],
          queryFn: () => api.get("/notifications"),
        });
        queryClient.prefetchQuery({
          queryKey: ["donations", undefined],
          queryFn: () => api.get("/donations"),
        });
        queryClient.prefetchQuery({
          queryKey: ["aid-requests", undefined],
          queryFn: () => api.get("/aid-requests"),
        });
        queryClient.prefetchQuery({
          queryKey: ["volunteer-tasks", undefined],
          queryFn: () => api.get("/volunteer-tasks"),
        });
      })
      .catch(() => {
        // 401 or network error — AuthProvider will handle redirect
      });

    return () => {
      cancelled = true;
    };
  }, [setUser, queryClient]);

  // Redirect to login if auth resolved but no user
  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/login");
    }
  }, [isLoading, user, router]);

  const unreadCount =
    notifications?.filter((n: { read: boolean }) => !n.read).length ?? 0;

  const effectiveRole =
    user?.role === "admin" && roleOverride
      ? roleOverride
      : (user?.role ?? "student");
  const tabs = getTabsForRole(effectiveRole);
  const activeTab = searchParams.get("tab") || getDefaultTab();
  const validTab = tabs.find((t) => t.key === activeTab)
    ? activeTab
    : tabs[0]?.key ?? "overview";

  function handleTabChange(tabKey: string) {
    router.push(`/dashboard?tab=${tabKey}`, { scroll: false });
  }

  function handleNotificationsClick() {
    handleTabChange("notifications");
  }

  function handleRoleSwitch(role: UserRole | null) {
    setRoleOverride(role);
    router.push("/dashboard?tab=overview", { scroll: false });
  }

  return (
    <div className="flex min-h-screen">
      {authReady ? (
        <Sidebar
          user={user}
          tabs={tabs}
          activeTab={validTab}
          onTabChange={handleTabChange}
          effectiveRole={effectiveRole}
        />
      ) : (
        <div className="w-60 shrink-0 bg-brand-dark min-h-screen hidden lg:block" />
      )}

      <div className="flex flex-col flex-1 min-w-0">
        {authReady ? (
          <DashboardHeader
            user={user}
            unreadCount={unreadCount}
            onNotificationsClick={handleNotificationsClick}
            effectiveRole={effectiveRole}
            onRoleSwitch={handleRoleSwitch}
          />
        ) : (
          <div className="bg-white border-b border-border px-6 py-4 h-[65px]" />
        )}

        {authReady ? (
          <div className="lg:hidden">
            <TabNavigation
              tabs={tabs}
              activeTab={validTab}
              onTabChange={handleTabChange}
            />
          </div>
        ) : (
          <div className="bg-white border-b border-border px-6 h-[49px] lg:hidden" />
        )}

        <TabPanel tabKey={validTab}>
          <PanelRouter tabKey={validTab} role={effectiveRole} />
        </TabPanel>
      </div>
    </div>
  );
}
