"use client";

import { Bell } from "lucide-react";
import { NotificationCard } from "./notification-card";
import { useNotifications, useMarkRead } from "../hooks";

export function NotificationList() {
  const { data: notifications, isLoading } = useNotifications();
  const markRead = useMarkRead();

  if (isLoading) {
    return <p className="text-body text-sm">Loading notifications...</p>;
  }

  if (!notifications?.length) {
    return (
      <div className="text-center py-12 text-body">
        <p className="text-lg">No notifications</p>
        <p className="text-sm mt-1">You&apos;re all caught up!</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {notifications.map((n) => (
        <NotificationCard
          key={n.id}
          icon={<Bell className="w-6 h-6" />}
          title={n.title}
          message={n.message}
          time={new Date(n.created_at).toLocaleDateString()}
          read={n.read}
          onMarkRead={() => markRead.mutate(n.id)}
        />
      ))}
    </div>
  );
}
