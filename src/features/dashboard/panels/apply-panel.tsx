"use client";

import { JoinVolunteerForm } from "@/features/volunteers";

export function ApplyPanel() {
  return (
    <>
      <h2 className="text-heading text-2xl font-light tracking-tight mb-6">
        Apply as Volunteer
      </h2>
      <JoinVolunteerForm />
    </>
  );
}
