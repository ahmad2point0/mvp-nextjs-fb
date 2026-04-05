"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuthStore, type UserRole } from "@/global/stores/auth-store";
import { useNotifications } from "@/features/notifications/hooks";
import { getTabsForRole, getDefaultTab } from "../tab-config";
import { getPanelComponent } from "../tab-panels";
import { Sidebar } from "@/global/components/sidebar";
import { DashboardHeader } from "./dashboard-header";
import { TabNavigation } from "./tab-navigation";
import { TabPanel } from "./tab-panel";
import { TabSkeleton } from "@/global/components";

export function DashboardShell() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoading } = useAuthStore();
  const { data: notifications } = useNotifications();
  const [roleOverride, setRoleOverride] = useState<UserRole | null>(null);

  const unreadCount =
    notifications?.filter((n: { read: boolean }) => !n.read).length ?? 0;

  // Admin can preview other roles' tab sets
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

  if (isLoading || !user) {
    return (
      <div className="flex min-h-screen">
        <div className="w-60 shrink-0 bg-brand-dark min-h-screen hidden lg:block" />
        <div className="flex flex-col flex-1">
          <div className="bg-white border-b border-border px-6 py-4 h-[65px]" />
          <div className="bg-white border-b border-border px-6 h-[49px] lg:hidden" />
          <div className="p-8 bg-[#f9fafb] flex-1">
            <TabSkeleton />
          </div>
        </div>
      </div>
    );
  }

  const PanelComponent = getPanelComponent(validTab, effectiveRole);

  return (
    <div className="flex min-h-screen">
      <Sidebar
        user={user}
        tabs={tabs}
        activeTab={validTab}
        onTabChange={handleTabChange}
        effectiveRole={effectiveRole}
      />
      <div className="flex flex-col flex-1 min-w-0">
        <DashboardHeader
          user={user}
          unreadCount={unreadCount}
          onNotificationsClick={handleNotificationsClick}
          effectiveRole={effectiveRole}
          onRoleSwitch={handleRoleSwitch}
        />
        {/* Tab bar visible on mobile/tablet only (sidebar hidden) */}
        <div className="lg:hidden">
          <TabNavigation
            tabs={tabs}
            activeTab={validTab}
            onTabChange={handleTabChange}
          />
        </div>
        <TabPanel tabKey={validTab}>
          {PanelComponent ? <PanelComponent /> : <TabSkeleton />}
        </TabPanel>
      </div>
    </div>
  );
}
