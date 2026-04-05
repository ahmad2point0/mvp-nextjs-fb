"use client";

import type { ComponentType } from "react";
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

// Role-specific overview panels
const OVERVIEW_PANELS: Record<UserRole, ComponentType> = {
  admin: AdminOverviewPanel,
  donor: DonorOverviewPanel,
  volunteer: VolunteerOverviewPanel,
  student: StudentOverviewPanel,
};

// Shared panels keyed by tab key
const SHARED_PANELS: Record<string, ComponentType> = {
  users: UserManagementPanel,
  donations: DonationsPanel,
  "aid-requests": AidRequestsPanel,
  volunteers: VolunteerManagementPanel,
  tasks: VolunteerManagementPanel,
  reports: ReportsPanel,
  notifications: NotificationsPanel,
  profile: ProfilePanel,
  settings: SettingsPanel,
  apply: ApplyPanel,
};

/**
 * Resolve the panel component for a given tab key and user role.
 * The "overview" tab renders a role-specific panel; all others use shared panels.
 */
export function getPanelComponent(
  tabKey: string,
  role: UserRole
): ComponentType | null {
  if (tabKey === "overview") {
    return OVERVIEW_PANELS[role] ?? OVERVIEW_PANELS.student;
  }
  return SHARED_PANELS[tabKey] ?? null;
}
