"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Card, Button } from "@/global/components";
import { useResendOtp, useVerifyOtp } from "../hooks";

const RESEND_COOLDOWN_SECONDS = 30;

export function OtpVerifyForm() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";

  const [token, setToken] = useState("");
  const [error, setError] = useState("");
  const [cooldown, setCooldown] = useState(0);

  const verifyOtp = useVerifyOtp();
  const resendOtp = useResendOtp();

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(id);
  }, [cooldown]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!email) return setError("Missing email. Please register again.");
    if (token.length < 6) return setError("Enter the verification code");

    verifyOtp.mutate(
      { email, token },
      {
        onError: (err) => {
          setError(err.message);
          toast.error(err.message);
        },
      }
    );
  }

  function handleResend() {
    if (!email || cooldown > 0) return;
    resendOtp.mutate(email, {
      onSuccess: () => {
        toast.success("New code sent to your email");
        setCooldown(RESEND_COOLDOWN_SECONDS);
      },
      onError: (err) => toast.error(err.message),
    });
  }

  return (
    <Card bordered className="max-w-[420px] mx-auto">
      <StepIndicator currentStep={2} />

      <h2 className="text-heading text-2xl font-light tracking-tight text-center mb-2">
        Verify Your Email
      </h2>
      <p className="text-body text-sm text-center mb-6">
        We sent a verification code to{" "}
        <span className="text-heading">{email || "your email"}</span>. Enter it
        below to activate your account.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={8}
          placeholder="12345678"
          value={token}
          onChange={(e) => setToken(e.target.value.replace(/\D/g, ""))}
          className="w-full px-3 py-3 rounded border border-border text-center text-lg tracking-[0.3em] text-heading placeholder:text-body focus:border-primary focus:outline-none"
        />

        {error && <p className="text-ruby text-xs text-center">{error}</p>}

        <Button type="submit" fullWidth disabled={verifyOtp.isPending}>
          {verifyOtp.isPending ? "Verifying..." : "Verify Email"}
        </Button>
      </form>

      <div className="mt-4 text-center">
        <button
          type="button"
          onClick={handleResend}
          disabled={cooldown > 0 || resendOtp.isPending || !email}
          className="text-sm text-primary hover:text-primary-hover disabled:text-body disabled:cursor-not-allowed"
        >
          {cooldown > 0
            ? `Resend in ${cooldown}s`
            : resendOtp.isPending
              ? "Sending..."
              : "Resend code"}
        </button>
      </div>
    </Card>
  );
}

function StepIndicator({ currentStep }: { currentStep: number }) {
  const steps = [
    { n: 1, label: "Register" },
    { n: 2, label: "Verify Email" },
    { n: 3, label: "Upload Docs" },
  ];

  return (
    <div className="flex items-center justify-center gap-2 mb-6">
      {steps.map((s, i) => {
        const isActive = s.n === currentStep;
        const isDone = s.n < currentStep;
        return (
          <div key={s.n} className="flex items-center gap-2">
            <div
              className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-medium ${
                isActive
                  ? "bg-primary text-white"
                  : isDone
                    ? "bg-emerald-500 text-white"
                    : "bg-gray-200 text-body"
              }`}
            >
              {isDone ? "\u2713" : s.n}
            </div>
            <span
              className={`text-xs ${isActive ? "text-heading font-medium" : "text-body"}`}
            >
              {s.label}
            </span>
            {i < steps.length - 1 && (
              <div className="w-6 h-px bg-border mx-1" />
            )}
          </div>
        );
      })}
    </div>
  );
}
