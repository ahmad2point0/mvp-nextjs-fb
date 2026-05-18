"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, Check, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/global/components";
import {
  PASSWORD_MIN_LENGTH,
  PASSWORD_MAX_LENGTH,
  validatePassword,
} from "@/global/lib/password-validation";
import { useRegister } from "../hooks";

const roles = [
  { value: "donor", label: "Donor" },
  { value: "volunteer", label: "Volunteer" },
  { value: "student", label: "Student" },
];

const passwordChecks = [
  {
    label: `Between ${PASSWORD_MIN_LENGTH} and ${PASSWORD_MAX_LENGTH} characters`,
    test: (p: string) =>
      p.length >= PASSWORD_MIN_LENGTH && p.length <= PASSWORD_MAX_LENGTH,
  },
  { label: "One uppercase letter", test: (p: string) => /[A-Z]/.test(p) },
  { label: "One lowercase letter", test: (p: string) => /[a-z]/.test(p) },
  { label: "One number", test: (p: string) => /\d/.test(p) },
  {
    label: "One special character (!@#$%^&*...)",
    test: (p: string) => /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/.test(p),
  },
];

export function RegisterForm() {
  const [role, setRole] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showRequirements, setShowRequirements] = useState(false);
  const [error, setError] = useState("");

  const register = useRegister();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!role) return setError("Please select a role");
    if (!name.trim()) return setError("Full name is required");
    if (!email) return setError("Email is required");
    if (!email.includes("@")) return setError("Enter a valid email");

    const passwordError = validatePassword(password);
    if (passwordError) return setError(passwordError);

    if (!confirm) return setError("Confirm your password");
    if (password !== confirm) return setError("Passwords do not match");

    register.mutate(
      { email, password, full_name: name, phone: phone || undefined, role },
      {
        onError: (err) => toast.error(err.message),
      }
    );
  }

  return (
    <div className="max-w-[380px] w-full mx-auto bg-white border border-border rounded-lg p-8 shadow-elevated">
      <h2 className="text-heading text-2xl font-light tracking-tight text-center mb-2">
        Create Account
      </h2>
      <p className="text-body text-xs text-center mb-6">
        Next you&apos;ll verify your email and upload identity documents.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="w-full px-3 py-3 rounded border border-border text-sm text-heading focus:border-primary focus:outline-none"
        >
          <option value="" disabled>
            Select Role
          </option>
          {roles.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-3 py-3 rounded border border-border text-sm text-heading placeholder:text-body focus:border-primary focus:outline-none"
        />

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-3 py-3 rounded border border-border text-sm text-heading placeholder:text-body focus:border-primary focus:outline-none"
        />

        <input
          type="tel"
          placeholder="Phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full px-3 py-3 rounded border border-border text-sm text-heading placeholder:text-body focus:border-primary focus:outline-none"
        />

        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            maxLength={PASSWORD_MAX_LENGTH}
            onFocus={() => setShowRequirements(true)}
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

        {(showRequirements || password.length > 0) && (
          <ul className="text-xs space-y-1 -mt-1.5 px-1">
            {passwordChecks.map((c) => {
              const ok = c.test(password);
              return (
                <li
                  key={c.label}
                  className={`flex items-center gap-1.5 ${ok ? "text-emerald-600" : "text-body"}`}
                >
                  {ok ? (
                    <Check className="w-3 h-3" />
                  ) : (
                    <X className="w-3 h-3" />
                  )}
                  {c.label}
                </li>
              );
            })}
          </ul>
        )}

        <div className="relative">
          <input
            type={showConfirm ? "text" : "password"}
            placeholder="Confirm Password"
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

        <Button type="submit" fullWidth disabled={register.isPending}>
          {register.isPending ? "Creating account..." : "Register"}
        </Button>
      </form>

      <p className="text-center mt-4 text-sm text-body">
        Already have an account?{" "}
        <Link href="/login" className="text-primary hover:text-primary-hover">
          Login
        </Link>
      </p>
    </div>
  );
}
