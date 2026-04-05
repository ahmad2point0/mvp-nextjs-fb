import { Suspense } from "react";
import { DashboardShell } from "@/features/dashboard/components/dashboard-shell";
import { TabSkeleton } from "@/global/components/tab-skeleton";

function DashboardLayoutSkeleton() {
  return (
    <div className="flex flex-col min-h-screen">
      <div className="bg-white border-b border-border px-6 py-4 h-[65px]" />
      <div className="bg-white border-b border-border px-6 h-[49px]" />
      <div className="p-8 bg-[#f9fafb] flex-1">
        <TabSkeleton />
      </div>
    </div>
  );
}

export default function DashboardLayout() {
  return (
    <Suspense fallback={<DashboardLayoutSkeleton />}>
      <DashboardShell />
    </Suspense>
  );
}
