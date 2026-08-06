"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { FiMail, FiLock, FiEye, FiEyeOff, FiArrowRight } from "react-icons/fi";

type FormState = { email: string; password: string };

const FLEET_PHOTOS = [
  { src: "/industries/logistics.png", label: "Delivery trucks" },
  { src: "/industries/passenger-transit.png", label: "Transit buses" },
  { src: "/industries/construction.png", label: "Heavy equipment" },
  { src: "/industries/agriculture.png", label: "Field assets" },
  { src: "/industries/ecommerce.png", label: "Last mile vans" },
  { src: "/industries/emergency-services.png", label: "Emergency fleet" },
];

export default function LoginClient({ nextPath }: { nextPath: string }) {
  const router = useRouter();

  const [form, setForm] = useState<FormState>({ email: "", password: "" });
  const [step, setStep] = useState<"email" | "password">("email");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isSubmitting) return;
    setError("");

    if (step === "email") {
      if (!form.email.trim()) {
        setError("Enter your email address to continue.");
        return;
      }
      setStep("password");
      return;
    }

    if (!form.password) {
      setError("Enter your password to sign in.");
      return;
    }

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
      router.replace(nextPath || "/app/devices");
      router.refresh();
    } catch {
      setError("Network error. Check your connection.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex" style={{ fontFamily: "var(--font-inter), Inter, ui-sans-serif, system-ui, sans-serif" }}>

      {/* ── LEFT PANEL — brand / fleet photography ── */}
      <div
        className="hidden lg:flex lg:w-[52%] min-h-screen flex-col justify-between p-12 relative overflow-hidden bg-[#071A18]"
      >
        <div className="absolute inset-0">
          <Image
            src={FLEET_PHOTOS[0].src}
            alt=""
            fill
            priority
            sizes="52vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-[#061816]/70" />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(5,16,15,0.9)_0%,rgba(5,16,15,0.62)_46%,rgba(5,16,15,0.36)_100%)]" />
        </div>

        {/* Logo */}
        <div className="relative z-10">
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
        <div className="relative z-10 max-w-xl space-y-7">
          <div className="inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-white/85 backdrop-blur">
            Fleet visibility for every asset type
          </div>
          <h2 className="text-5xl font-black text-white leading-[1.05]">
            See every vehicle clearly before the day starts.
          </h2>
          <p className="text-base leading-relaxed max-w-md text-white/78">
            Trucks, vans, buses, field teams, construction equipment, and emergency fleets all come into one live tracking workspace.
          </p>

          <div className="grid max-w-lg grid-cols-3 overflow-hidden rounded-2xl border border-white/15 bg-white/10 backdrop-blur">
            {[["10K+", "Vehicles"], ["25+", "Industries"], ["99.9%", "Uptime"]].map(([v, l]) => (
              <div key={l} className="border-r border-white/10 px-5 py-4 last:border-r-0">
                <div className="text-white font-black text-xl">{v}</div>
                <div className="text-xs text-white/62">{l}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 grid grid-cols-5 gap-3">
          {FLEET_PHOTOS.slice(1).map((photo) => (
            <div key={photo.label} className="group relative h-28 overflow-hidden rounded-2xl border border-white/15 bg-white/10 shadow-2xl">
              <Image
                src={photo.src}
                alt={photo.label}
                fill
                sizes="10vw"
                className="object-cover transition duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-3 pb-3 pt-8">
                <div className="text-[11px] font-bold text-white">{photo.label}</div>
              </div>
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
                    disabled={step === "password"}
                    onChange={(e) => {
                      setError("");
                      setForm((s) => ({ ...s, email: e.target.value }));
                    }}
                    placeholder="you@company.com"
                    className="w-full h-12 pl-10 pr-4 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-900 outline-none transition focus:border-[#1A7A75] focus:bg-white focus:ring-2 focus:ring-[#1A7A75]/20 placeholder:text-gray-400 disabled:bg-gray-100 disabled:text-gray-500"
                  />
                </div>
                {step === "password" && (
                  <button
                    type="button"
                    onClick={() => {
                      setError("");
                      setForm((s) => ({ ...s, password: "" }));
                      setStep("email");
                    }}
                    className="mt-2 text-xs font-semibold hover:underline"
                    style={{ color: "#1A7A75" }}
                  >
                    Change email
                  </button>
                )}
              </div>

              {/* Password */}
              {step === "password" && (
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
                      onChange={(e) => {
                        setError("");
                        setForm((s) => ({ ...s, password: e.target.value }));
                      }}
                      placeholder="Enter your password"
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
              )}

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
                    {step === "email" ? "Continue" : "Sign in"} <FiArrowRight size={16} />
                  </>
                )}
              </button>
            </form>

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
