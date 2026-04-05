import type { ReactNode } from "react";
import { Bell } from "lucide-react";
import { IconCircle } from "@/global/components";

interface NotificationCardProps {
  icon: ReactNode;
  title: string;
  message: string;
  time: string;
  read?: boolean;
  onMarkRead?: () => void;
}

export function NotificationCard({
  icon,
  title,
  message,
  time,
  read,
  onMarkRead,
}: NotificationCardProps) {
  const iconContent =
    typeof icon === "string" ? (
      <Bell className="w-6 h-6" />
    ) : (
      icon
    );

  return (
    <div
      className={`bg-white border rounded-md p-5 flex items-center gap-5 shadow-ambient ${
        read ? "border-border opacity-70" : "border-primary-light"
      }`}
    >
      <IconCircle className="shrink-0">{iconContent}</IconCircle>
      <div className="flex-1">
        <h4 className="text-primary text-sm font-normal">{title}</h4>
        <p className="text-body text-sm mt-1">{message}</p>
        <small className="text-body/60 text-xs">{time}</small>
      </div>
      {!read && onMarkRead && (
        <button
          onClick={onMarkRead}
          className="text-xs text-primary hover:text-primary-hover shrink-0"
        >
          Mark read
        </button>
      )}
    </div>
  );
}
