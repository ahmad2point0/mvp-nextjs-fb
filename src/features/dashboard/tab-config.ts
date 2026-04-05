import type { ComponentType } from "react";
import type { UserRole } from "@/global/stores/auth-store";
import {
  BarChart3,
  Users,
  DollarSign,
  ClipboardList,
  Handshake,
  TrendingUp,
  Bell,
  Settings,
  CheckCircle,
  FileText,
  User,
} from "lucide-react";

export interface TabDefinition {
  key: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
}

function tab(
  key: string,
  label: string,
  icon: ComponentType<{ className?: string }>
): TabDefinition {
  return { key, label, icon };
}

export const ROLE_TABS: Record<UserRole, TabDefinition[]> = {
  admin: [
    tab("overview", "Overview", BarChart3),
    tab("users", "User Management", Users),
    tab("donations", "Donations", DollarSign),
    tab("aid-requests", "Aid Requests", ClipboardList),
    tab("volunteers", "Volunteers", Handshake),
    tab("reports", "Reports", TrendingUp),
    tab("notifications", "Notifications", Bell),
    tab("settings", "Settings", Settings),
  ],
  donor: [
    tab("overview", "Overview", BarChart3),
    tab("aid-requests", "Aid Requests", ClipboardList),
    tab("donations", "My Donations", DollarSign),
    tab("notifications", "Notifications", Bell),
    tab("profile", "Profile", User),
  ],
  volunteer: [
    tab("overview", "Overview", BarChart3),
    tab("tasks", "My Tasks", CheckCircle),
    tab("apply", "Apply", FileText),
    tab("notifications", "Notifications", Bell),
    tab("profile", "Profile", User),
  ],
  student: [
    tab("overview", "Overview", BarChart3),
    tab("aid-requests", "My Aid Requests", ClipboardList),
    tab("notifications", "Notifications", Bell),
    tab("profile", "Profile", User),
  ],
};

export function getDefaultTab() {
  return "overview";
}

export function getTabsForRole(role: UserRole): TabDefinition[] {
  return ROLE_TABS[role] ?? ROLE_TABS.student;
}
