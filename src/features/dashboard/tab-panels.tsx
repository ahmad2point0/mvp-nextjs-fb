"use client";

import type { UserRole } from "@/global/stores/auth-store";
import dynamic from "next/dynamic";
import { TabSkeleton } from "@/global/components/tab-skeleton";
import { TableSkeleton } from "@/global/components/table-skeleton";
import { FormSkeleton } from "@/global/components/form-skeleton";

const AdminOverviewPanel = dynamic(
  () =>
    import("./panels/admin-overview-panel").then(
      (m) => m.AdminOverviewPanel
    ),
  { loading: () => TabSkeleton() }
);

const DonorOverviewPanel = dynamic(
  () =>
    import("./panels/donor-overview-panel").then(
      (m) => m.DonorOverviewPanel
    ),
  { loading: () => TabSkeleton() }
);

const VolunteerOverviewPanel = dynamic(
  () =>
    import("./panels/volunteer-overview-panel").then(
      (m) => m.VolunteerOverviewPanel
    ),
  { loading: () => TabSkeleton() }
);

const StudentOverviewPanel = dynamic(
  () =>
    import("./panels/student-overview-panel").then(
      (m) => m.StudentOverviewPanel
    ),
  { loading: () => TabSkeleton() }
);

const UserManagementPanel = dynamic(
  () =>
    import("./panels/user-management-panel").then(
      (m) => m.UserManagementPanel
    ),
  { loading: () => TableSkeleton() }
);

const DonationsPanel = dynamic(
  () =>
    import("./panels/donations-panel").then((m) => m.DonationsPanel),
  { loading: () => FormSkeleton() }
);

const AidRequestsPanel = dynamic(
  () =>
    import("./panels/aid-requests-panel").then(
      (m) => m.AidRequestsPanel
    ),
  { loading: () => FormSkeleton() }
);

const VolunteerManagementPanel = dynamic(
  () =>
    import("./panels/volunteer-management-panel").then(
      (m) => m.VolunteerManagementPanel
    ),
  { loading: () => TableSkeleton() }
);

const ReportsPanel = dynamic(
  () =>
    import("./panels/reports-panel").then((m) => m.ReportsPanel),
  { loading: () => TabSkeleton() }
);

const NotificationsPanel = dynamic(
  () =>
    import("./panels/notifications-panel").then(
      (m) => m.NotificationsPanel
    ),
  { loading: () => TabSkeleton() }
);

const ProfilePanel = dynamic(
  () =>
    import("./panels/profile-panel").then((m) => m.ProfilePanel),
  { loading: () => TabSkeleton() }
);

const SettingsPanel = dynamic(
  () =>
    import("./panels/settings-panel").then((m) => m.SettingsPanel),
  { loading: () => TabSkeleton() }
);

const ApplyPanel = dynamic(
  () => import("./panels/apply-panel").then((m) => m.ApplyPanel),
  { loading: () => FormSkeleton() }
);

/**
 * Renders the correct panel for a given tab key and user role.
 * Uses static JSX references so React sees stable component identities.
 */
export function PanelRouter({
  tabKey,
  role,
}: {
  tabKey: string;
  role: UserRole;
}) {
  if (tabKey === "overview") {
    switch (role) {
      case "admin":
        return <AdminOverviewPanel />;
      case "donor":
        return <DonorOverviewPanel />;
      case "volunteer":
        return <VolunteerOverviewPanel />;
      default:
        return <StudentOverviewPanel />;
    }
  }

  switch (tabKey) {
    case "users":
      return <UserManagementPanel />;
    case "donations":
      return <DonationsPanel />;
    case "aid-requests":
      return <AidRequestsPanel />;
    case "volunteers":
    case "tasks":
      return <VolunteerManagementPanel />;
    case "reports":
      return <ReportsPanel />;
    case "notifications":
      return <NotificationsPanel />;
    case "profile":
      return <ProfilePanel />;
    case "settings":
      return <SettingsPanel />;
    case "apply":
      return <ApplyPanel />;
    default:
      return <TabSkeleton />;
  }
}
