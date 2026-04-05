"use client";

import { Card } from "@/global/components";

export function SettingsPanel() {
  return (
    <>
      <h2 className="text-heading text-2xl font-light tracking-tight mb-6">
        System Settings
      </h2>
      <Card bordered className="max-w-[480px] text-center py-12">
        <p className="text-body text-lg">Coming Soon</p>
        <p className="text-body text-sm mt-2">
          System settings will be available in a future update.
        </p>
      </Card>
    </>
  );
}
