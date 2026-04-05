"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/global/components";
import { useLogin } from "../hooks";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const searchParams = useSearchParams();
  const registered = searchParams.get("registered");

  const login = useLogin();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!email) return setError("Email is required");
    if (!email.includes("@")) return setError("Enter a valid email");
    if (!password) return setError("Password is required");
    if (password.length < 6)
      return setError("Password must be at least 6 characters");

    login.mutate(
      { email, password },
      {
        onError: (err) => toast.error(err.message),
      }
    );
  }

  return (
    <div className="max-w-[380px] w-full mx-auto bg-white border border-border rounded-lg p-8 shadow-elevated">
      <h2 className="text-heading text-2xl font-light tracking-tight text-center mb-1">
        Welcome Back
      </h2>
      <p className="text-body text-sm text-center mb-6">
        Login to your CSEAS account
      </p>

      {registered && (
        <div className="bg-success-bg border border-success-border text-success-text text-sm rounded px-3 py-2 mb-4 text-center">
          Account created! Please log in.
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-3 py-3 rounded border border-border text-sm text-heading placeholder:text-body focus:border-primary focus:outline-none"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-3 py-3 rounded border border-border text-sm text-heading placeholder:text-body focus:border-primary focus:outline-none"
        />

        {error && <p className="text-ruby text-xs">{error}</p>}

        <Button type="submit" fullWidth disabled={login.isPending}>
          {login.isPending ? "Logging in..." : "Login"}
        </Button>
      </form>

      <div className="flex items-center justify-between mt-4">
        <Link
          href="/forgot-password"
          className="text-sm text-primary hover:text-primary-hover"
        >
          Forgot password?
        </Link>
        <p className="text-sm text-body">
          <Link href="/register" className="text-primary hover:text-primary-hover">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
