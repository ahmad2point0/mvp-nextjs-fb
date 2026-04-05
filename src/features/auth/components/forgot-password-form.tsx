"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/global/components";
import { useResetPassword } from "../hooks";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  const resetPassword = useResetPassword();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!email) return setError("Email is required");
    if (!email.includes("@")) return setError("Enter a valid email");

    resetPassword.mutate(email, {
      onSuccess: () => {
        setSent(true);
        toast.success("Password reset email sent!");
      },
      onError: (err) => toast.error(err.message),
    });
  }

  if (sent) {
    return (
      <div className="max-w-[380px] w-full mx-auto bg-white border border-border rounded-lg p-8 shadow-elevated text-center">
        <h2 className="text-heading text-2xl font-light tracking-tight mb-2">
          Check Your Email
        </h2>
        <p className="text-body text-sm mb-6">
          We sent a password reset link to <strong>{email}</strong>. Click the link in the email to reset your password.
        </p>
        <Link
          href="/login"
          className="text-sm text-primary hover:text-primary-hover"
        >
          Back to login
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-[380px] w-full mx-auto bg-white border border-border rounded-lg p-8 shadow-elevated">
      <h2 className="text-heading text-2xl font-light tracking-tight text-center mb-1">
        Forgot Password
      </h2>
      <p className="text-body text-sm text-center mb-6">
        Enter your email to receive a reset link
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-3 py-3 rounded border border-border text-sm text-heading placeholder:text-body focus:border-primary focus:outline-none"
        />

        {error && <p className="text-ruby text-xs">{error}</p>}

        <Button type="submit" fullWidth disabled={resetPassword.isPending}>
          {resetPassword.isPending ? "Sending..." : "Send Reset Link"}
        </Button>
      </form>

      <p className="text-center mt-4 text-sm text-body">
        <Link href="/login" className="text-primary hover:text-primary-hover">
          Back to login
        </Link>
      </p>
    </div>
  );
}
