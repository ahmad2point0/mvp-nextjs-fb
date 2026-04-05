import type { ReactNode } from "react";

interface IconCircleProps {
  children: ReactNode;
  className?: string;
}

export function IconCircle({ children, className = "" }: IconCircleProps) {
  return (
    <div
      className={`w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-2xl text-primary ${className}`}
    >
      {children}
    </div>
  );
}
