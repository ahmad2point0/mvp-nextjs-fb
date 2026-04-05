"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";

interface TabPanelProps {
  children: ReactNode;
  tabKey: string;
  className?: string;
}

export function TabPanel({ children, tabKey, className = "" }: TabPanelProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(false);
    const id = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(id);
  }, [tabKey]);

  return (
    <div
      role="tabpanel"
      className={`p-8 bg-[#f9fafb] flex-1 overflow-y-auto transition-opacity duration-200 ${
        visible ? "opacity-100" : "opacity-0"
      } ${className}`}
    >
      {children}
    </div>
  );
}
