"use client";

import { NotificationList } from "@/features/notifications";

export function NotificationsPanel() {
  return (
    <>
      <h2 className="text-heading text-2xl font-light tracking-tight mb-6">
        Notifications
      </h2>
      <NotificationList />
    </>
  );
}
