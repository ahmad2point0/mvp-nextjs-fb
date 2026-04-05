"use client";

import { useState } from "react";
import { Card, Button } from "@/global/components";
import { useApplyVolunteer } from "../hooks";

const volunteerRoles = [
  "Teaching / Tutoring",
  "Mentorship",
  "Donation Distribution",
  "Event Support",
];

export function JoinVolunteerForm() {
  const [role, setRole] = useState("");
  const [motivation, setMotivation] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const apply = useApplyVolunteer();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!role) return setError("Please select a role");
    if (!motivation.trim()) return setError("Motivation is required");

    apply.mutate(
      { role, motivation },
      {
        onSuccess: () => {
          setSuccess(true);
          setRole("");
          setMotivation("");
        },
        onError: (err) => setError(err.message),
      }
    );
  }

  return (
    <Card bordered className="max-w-125 mx-auto">
      <h2 className="text-heading text-2xl font-light tracking-tight text-center mb-6">
        Join as Volunteer
      </h2>

      {success && (
        <div className="bg-success-bg border border-success-border text-success-text text-sm rounded px-3 py-2 mb-4 text-center">
          Application submitted! We&apos;ll review it shortly.
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="w-full px-3 py-3 rounded border border-border text-sm text-heading focus:border-primary focus:outline-none"
        >
          <option value="" disabled>Select Volunteer Role</option>
          {volunteerRoles.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
        <textarea
          placeholder="Why do you want to join as a volunteer?"
          rows={4}
          value={motivation}
          onChange={(e) => setMotivation(e.target.value)}
          className="w-full px-3 py-3 rounded border border-border text-sm text-heading placeholder:text-body focus:border-primary focus:outline-none resize-none"
        />

        {error && <p className="text-ruby text-xs">{error}</p>}

        <Button type="submit" fullWidth disabled={apply.isPending}>
          {apply.isPending ? "Submitting..." : "Submit Application"}
        </Button>
      </form>
    </Card>
  );
}
