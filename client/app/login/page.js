"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { API_BASE } from "@/lib/config";

const ROLES = ["Fleet Manager", "Driver", "Safety Officer", "Financial Analyst"];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error?.message || "Invalid credentials.");
      }
      router.replace("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Brand panel — fleet photo with a dark scrim so the light text stays legible */}
      <div className="relative hidden overflow-hidden border-r border-slate-800 lg:block">
        <Image
          src="/login.png"
          alt="TransitOps fleet at a depot"
          fill
          priority
          sizes="(min-width: 1024px) 50vw, 0px"
          className="object-cover object-center"
        />
        {/* Scrim: darker at top and bottom where the text sits, lighter through the middle */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-slate-950/50 to-slate-950/85" />

        <div className="relative flex min-h-screen flex-col justify-between p-12 [text-shadow:0_1px_3px_rgb(2_6_23_/_0.6)]">
          <div className="flex items-center gap-3">
            <Image
              src="/logo-mark.png"
              alt=""
              width={203}
              height={203}
              className="h-11 w-11 drop-shadow-md"
            />
            <div>
              <h1 className="text-xl font-semibold text-white">TransitOps</h1>
              <p className="text-sm text-white/70">
                Smart Transport Operations Platform
              </p>
            </div>
          </div>
          <div>
            <p className="mb-3 text-sm font-medium text-white/80">
              One login, four roles:
            </p>
            <ul className="space-y-2">
              {ROLES.map((r) => (
                <li key={r} className="flex items-center gap-2 text-white/90">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                  {r}
                </li>
              ))}
            </ul>
          </div>
          <p className="text-xs text-white/60">TransitOps © 2026 · RBAC enabled</p>
        </div>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center p-6">
        <form onSubmit={onSubmit} className="w-full max-w-sm space-y-5">
          <div className="mx-auto w-fit rounded-2xl bg-white px-6 py-4 shadow-sm ring-1 ring-slate-200/70">
            <Image
              src="/logo.png"
              alt="TransitOps"
              width={502}
              height={346}
              priority
              className="h-auto w-40"
            />
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-slate-100">
              Sign in to your account
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Enter your credentials to continue.
            </p>
          </div>

          {error && (
            <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-400">
              {error}
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[11px] uppercase tracking-wider text-slate-500">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="fleet@transitops.local"
              className="w-full rounded-lg border border-slate-800 bg-slate-900/60 px-4 py-2.5 text-sm text-slate-200 placeholder:text-slate-500 focus:border-amber-500/50 focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] uppercase tracking-wider text-slate-500">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-lg border border-slate-800 bg-slate-900/60 px-4 py-2.5 text-sm text-slate-200 placeholder:text-slate-500 focus:border-amber-500/50 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-amber-500 px-4 py-2.5 text-sm font-semibold text-slate-950 transition-colors hover:bg-amber-400 disabled:opacity-60"
          >
            {loading ? "Signing in…" : "Sign In"}
          </button>

          <p className="rounded-lg border border-slate-800 bg-slate-900/40 px-3 py-2 text-xs text-slate-500">
            Demo: <span className="text-slate-300">fleet@transitops.local</span> ·
            password <span className="text-slate-300">Passw0rd!</span>
          </p>
        </form>
      </div>
    </div>
  );
}
