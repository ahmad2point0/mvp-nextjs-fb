import { Badge } from "@/components/ui/badge";
import { cn } from "@/global/lib/utils";
import type { UserRole } from "@/global/stores/auth-store";

const roleStyles: Record<UserRole, string> = {
  admin: "bg-primary/10 text-primary border-primary/30",
  donor: "bg-[#facc15]/10 text-[#9b6829] border-[#facc15]/30",
  volunteer: "bg-success/20 text-success-text border-success/40",
  student: "bg-[#2874ad]/10 text-[#2874ad] border-[#2874ad]/30",
};

interface RoleBadgeProps {
  role: UserRole;
  className?: string;
}

export function RoleBadge({ role, className = "" }: RoleBadgeProps) {
  return (
    <Badge variant="outline" className={cn(roleStyles[role], className)}>
      {role}
    </Badge>
  );
}
