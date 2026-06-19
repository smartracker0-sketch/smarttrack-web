"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { FiMail, FiLock, FiEye, FiEyeOff, FiArrowRight } from "react-icons/fi";

type FormState = { email: string; password: string };

const FEATURES = [
  { icon: "🗺️", title: "Live Fleet Map", desc: "Real-time GPS tracking across all vehicles on a dark interactive map." },
  { icon: "🔔", title: "Smart Alerts", desc: "Instant notifications for speeding, geofence breaches, and SOS events." },
  { icon: "⛽", title: "Fuel Analytics", desc: "Monitor consumption, detect pilferage, and optimise fuel costs." },
  { icon: "📊", title: "Reports & Exports", desc: "Trip summaries, driver scorecards, and scheduled PDF/CSV exports." },
];

export default function LoginClient({ nextPath }: { nextPath: string }) {
  const router = useRouter();

  const [form, setForm] = useState<FormState>({ email: "admin@trackpro.local", password: "admin123!" });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isSubmitting) return;
    setError("");
    setIsSubmitting(true);
    try {
      const resp = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email: form.email.trim(), password: form.password }),
      });
      if (!resp.ok) {
        const data = (await resp.json().catch(() => null)) as { message?: string } | null;
        setError(data?.message ?? "Invalid email or password.");
        return;
      }
      router.replace(nextPath || "/app");
      router.refresh();
    } catch {
      setError("Network error. Check your connection.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex" style={{ fontFamily: "var(--font-inter), Inter, ui-sans-serif, system-ui, sans-serif" }}>

      {/* ── LEFT PANEL — brand / features ── */}
      <div
        className="hidden lg:flex lg:w-[52%] flex-col justify-between p-12 relative overflow-hidden"
        style={{ background: "radial-gradient(ellipse at 60% 40%, #1A7A75 0%, #0D4A47 50%, #072E2C 100%)" }}
      >
        {/* Grid background */}
        <div className="absolute inset-0 pointer-events-none opacity-10">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="lgrid" width="56" height="56" patternUnits="userSpaceOnUse">
                <path d="M 56 0 L 0 0 0 56" fill="none" stroke="white" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#lgrid)" />
          </svg>
        </div>
        {/* Glow orbs */}
        <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full blur-3xl opacity-20" style={{ background: "#1A7A75" }} />
        <div className="absolute top-20 -right-20 w-72 h-72 rounded-full blur-3xl opacity-10" style={{ background: "#f97316" }} />

        {/* Logo */}
        <div className="relative">
          <Link href="/" className="inline-flex items-center gap-3">
            <Image
              src="/logo.png"
              alt="Smart Tracker Telematics"
              width={48}
              height={48}
              className="rounded-full flex-shrink-0"
            />
            <div className="leading-tight">
              <div className="text-white font-bold text-lg">Smart Tracker</div>
              <div className="text-sm font-normal" style={{ color: '#B2D4D2' }}>Telematics</div>
            </div>
          </Link>
        </div>

        {/* Headline */}
        <div className="relative space-y-6">
          <h2 className="text-4xl font-black text-white leading-tight">
            Your fleet,<br />
            <span style={{ color: "#f97316" }}>fully in control.</span>
          </h2>
          <p className="text-base leading-relaxed max-w-sm" style={{ color: '#B2D4D2' }}>
            Monitor every vehicle, driver, and asset in real time — from a single powerful dashboard.
          </p>

          {/* Feature list */}
          <div className="grid grid-cols-1 gap-4 pt-2">
            {FEATURES.map((f) => (
              <div key={f.title} className="flex items-start gap-4">
                <div
                  className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                  style={{ background: "rgba(255,255,255,0.1)" }}
                >
                  {f.icon}
                </div>
                <div>
                  <div className="text-white font-semibold text-sm">{f.title}</div>
                  <div className="text-xs mt-0.5 leading-relaxed" style={{ color: '#B2D4D2' }}>{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom stat bar */}
        <div className="relative flex items-center gap-8 pt-4 border-t border-white/10">
          {[["10K+", "Vehicles"], ["50+", "Countries"], ["99.9%", "Uptime"]].map(([v, l]) => (
            <div key={l}>
              <div className="text-white font-black text-lg">{v}</div>
              <div className="text-xs" style={{ color: '#B2D4D2' }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── RIGHT PANEL — form ── */}
      <div className="flex-1 flex flex-col min-h-screen bg-white">
        {/* Mobile logo */}
        <div className="lg:hidden px-6 pt-6">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <Image
              src="/logo.png"
              alt="Smart Tracker Telematics"
              width={36}
              height={36}
              className="rounded-full flex-shrink-0"
            />
            <span className="font-bold text-sm text-gray-900">Smart Tracker Telematics</span>
          </Link>
        </div>

        {/* Form centred */}
        <div className="flex-1 flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-md">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-black text-gray-900">Welcome back</h1>
              <p className="mt-2 text-gray-500 text-sm">Sign in to your fleet dashboard</p>
            </div>

            {/* Error banner */}
            {error && (
              <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
                <span className="mt-0.5 text-red-500 text-base">⚠</span>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <form onSubmit={onSubmit} className="space-y-5">
              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Email address
                </label>
                <div className="relative">
                  <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="email"
                    autoComplete="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))}
                    placeholder="you@company.com"
                    className="w-full h-12 pl-10 pr-4 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-900 outline-none transition focus:border-[#1A7A75] focus:bg-white focus:ring-2 focus:ring-[#1A7A75]/20 placeholder:text-gray-400"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-sm font-semibold text-gray-700">Password</label>
                  <a href="#" className="text-xs font-semibold hover:underline" style={{ color: "#1A7A75" }}>
                    Forgot password?
                  </a>
                </div>
                <div className="relative">
                  <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    value={form.password}
                    onChange={(e) => setForm((s) => ({ ...s, password: e.target.value }))}
                    placeholder="••••••••"
                    className="w-full h-12 pl-10 pr-12 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-900 outline-none transition focus:border-[#1A7A75] focus:bg-white focus:ring-2 focus:ring-[#1A7A75]/20 placeholder:text-gray-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-12 rounded-xl text-white text-sm font-bold flex items-center justify-center gap-2 transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
                style={{ background: isSubmitting ? "rgba(26,122,117,0.6)" : "#0D4A47" }}
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Signing in…
                  </>
                ) : (
                  <>
                    Sign in <FiArrowRight size={16} />
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="my-6 flex items-center gap-3">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-xs text-gray-400 font-medium">or</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            {/* Demo hint */}
            <div className="rounded-xl border p-4" style={{ borderColor: '#B2D4D2', background: '#E8F4F3' }}>
              <p className="text-xs font-semibold mb-2" style={{ color: '#0D4A47' }}>Demo credentials</p>
              <div className="space-y-1 text-xs font-mono" style={{ color: '#1A7A75' }}>
                <div>admin@trackpro.local</div>
                <div>admin123!</div>
              </div>
            </div>

            {/* Footer */}
            <p className="mt-8 text-center text-xs text-gray-400">
              Don&apos;t have an account?{" "}
              <a href="#" className="font-semibold hover:underline" style={{ color: "#1A7A75" }}>
                Request access
              </a>
            </p>
            <p className="mt-3 text-center text-xs text-gray-300">
              © {new Date().getFullYear()} Smart Tracker Telematics
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

