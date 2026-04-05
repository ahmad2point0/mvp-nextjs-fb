import { Card as ShadcnCard } from "@/components/ui/card";
import { cn } from "@/global/lib/utils";
import type { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  bordered?: boolean;
  onClick?: () => void;
}

export function Card({
  children,
  className = "",
  bordered = false,
  onClick,
}: CardProps) {
  return (
    <ShadcnCard
      onClick={onClick}
      className={cn(
        "p-6",
        bordered && "border border-border",
        onClick && "cursor-pointer hover:shadow-deep transition-shadow",
        className
      )}
    >
      {children}
    </ShadcnCard>
  );
}
