"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/global/components";
import { useUpdatePassword } from "../hooks";

export function UpdatePasswordForm() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");

  const updatePassword = useUpdatePassword();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!password) return setError("Password is required");
    if (password.length < 6)
      return setError("Password must be at least 6 characters");
    if (!confirm) return setError("Confirm your password");
    if (password !== confirm) return setError("Passwords do not match");

    updatePassword.mutate(password, {
      onSuccess: () => toast.success("Password updated! Please log in."),
      onError: (err) => toast.error(err.message),
    });
  }

  return (
    <div className="max-w-[380px] w-full mx-auto bg-white border border-border rounded-lg p-8 shadow-elevated">
      <h2 className="text-heading text-2xl font-light tracking-tight text-center mb-1">
        Set New Password
      </h2>
      <p className="text-body text-sm text-center mb-6">
        Enter your new password below
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
        <input
          type="password"
          placeholder="New Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-3 py-3 rounded border border-border text-sm text-heading placeholder:text-body focus:border-primary focus:outline-none"
        />

        <input
          type="password"
          placeholder="Confirm New Password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className="w-full px-3 py-3 rounded border border-border text-sm text-heading placeholder:text-body focus:border-primary focus:outline-none"
        />

        {error && <p className="text-ruby text-xs">{error}</p>}

        <Button type="submit" fullWidth disabled={updatePassword.isPending}>
          {updatePassword.isPending ? "Updating..." : "Update Password"}
        </Button>
      </form>
    </div>
  );
}
