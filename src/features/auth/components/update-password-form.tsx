"use client";

import { useState } from "react";
import { Eye, EyeOff, Check, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/global/components";
import {
  PASSWORD_MAX_LENGTH,
  validatePassword,
} from "@/global/lib/password-validation";
import { useUpdatePassword } from "../hooks";

const passwordChecks = [
  {
    label: "Between 8 and 64 characters",
    test: (p: string) => p.length >= 8 && p.length <= 64,
  },
  { label: "One uppercase letter", test: (p: string) => /[A-Z]/.test(p) },
  { label: "One lowercase letter", test: (p: string) => /[a-z]/.test(p) },
  { label: "One number", test: (p: string) => /\d/.test(p) },
  {
    label: "One special character (!@#$%^&*...)",
    test: (p: string) => /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/.test(p),
  },
];

export function UpdatePasswordForm() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");

  const updatePassword = useUpdatePassword();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const pwError = validatePassword(password);
    if (pwError) return setError(pwError);
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
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="New Password"
            value={password}
            maxLength={PASSWORD_MAX_LENGTH}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-3 pr-10 rounded border border-border text-sm text-heading placeholder:text-body focus:border-primary focus:outline-none"
          />
          <button
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-body hover:text-primary"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>

        {password.length > 0 && (
          <ul className="text-xs space-y-1 -mt-1.5 px-1">
            {passwordChecks.map((c) => {
              const ok = c.test(password);
              return (
                <li
                  key={c.label}
                  className={`flex items-center gap-1.5 ${ok ? "text-emerald-600" : "text-body"}`}
                >
                  {ok ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                  {c.label}
                </li>
              );
            })}
          </ul>
        )}

        <div className="relative">
          <input
            type={showConfirm ? "text" : "password"}
            placeholder="Confirm New Password"
            value={confirm}
            maxLength={PASSWORD_MAX_LENGTH}
            onChange={(e) => setConfirm(e.target.value)}
            className="w-full px-3 py-3 pr-10 rounded border border-border text-sm text-heading placeholder:text-body focus:border-primary focus:outline-none"
          />
          <button
            type="button"
            onClick={() => setShowConfirm((s) => !s)}
            aria-label={showConfirm ? "Hide password" : "Show password"}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-body hover:text-primary"
          >
            {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>

        {error && <p className="text-ruby text-xs">{error}</p>}

        <Button type="submit" fullWidth disabled={updatePassword.isPending}>
          {updatePassword.isPending ? "Updating..." : "Update Password"}
        </Button>
      </form>
    </div>
  );
}
