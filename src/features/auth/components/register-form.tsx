"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/global/components";
import { useRegister } from "../hooks";

const roles = [
  { value: "donor", label: "Donor" },
  { value: "volunteer", label: "Volunteer" },
  { value: "student", label: "Student" },
];

export function RegisterForm() {
  const [role, setRole] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");

  const register = useRegister();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!role) return setError("Please select a role");
    if (!name.trim()) return setError("Full name is required");
    if (!email) return setError("Email is required");
    if (!email.includes("@")) return setError("Enter a valid email");
    if (!password) return setError("Password is required");
    if (password.length < 6)
      return setError("Password must be at least 6 characters");
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
      <h2 className="text-heading text-2xl font-light tracking-tight text-center mb-6">
        Create Account
      </h2>

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
          placeholder="Phone (optional)"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full px-3 py-3 rounded border border-border text-sm text-heading placeholder:text-body focus:border-primary focus:outline-none"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-3 py-3 rounded border border-border text-sm text-heading placeholder:text-body focus:border-primary focus:outline-none"
        />

        <input
          type="password"
          placeholder="Confirm Password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className="w-full px-3 py-3 rounded border border-border text-sm text-heading placeholder:text-body focus:border-primary focus:outline-none"
        />

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
