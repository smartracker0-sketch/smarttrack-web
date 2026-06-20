"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { FiLock, FiMail, FiEye, FiEyeOff } from "react-icons/fi";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Invalid credentials");
        return;
      }
      router.replace("/admin/overview");
    } catch {
      setError("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{
        background: "linear-gradient(135deg, #071E1C 0%, #0D4A47 60%, #0A3835 100%)",
      }}
    >
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-3" style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)" }}>
            <FiLock size={28} color="#F97316" />
          </div>
          <h1 className="text-xl font-extrabold text-white tracking-tight">Smart Tracker Telematics</h1>
          <p className="text-xs mt-1 font-semibold tracking-widest uppercase" style={{ color: "#7BBBB8" }}>Platform Administration</p>
        </div>

        {/* Card */}
        <div className="rounded-3xl p-8" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", backdropFilter: "blur(12px)" }}>
          <h2 className="text-lg font-bold text-white mb-6">Sign In to Admin Console</h2>

          {error && (
            <div className="mb-4 rounded-xl px-4 py-3 text-sm font-semibold" style={{ background: "#EF44441a", color: "#EF4444", border: "1px solid #EF444433" }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: "#7BBBB8" }}>Email Address</label>
              <div className="relative">
                <FiMail size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#7BBBB8" }} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="admin@smarttracker.cloud"
                  className="w-full pl-9 pr-4 h-11 rounded-xl text-sm text-white placeholder-gray-500 outline-none focus:ring-2"
                  style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)" }}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: "#7BBBB8" }}>Password</label>
              <div className="relative">
                <FiLock size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#7BBBB8" }} />
                <input
                  type={showPass ? "text" : "password"}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-10 h-11 rounded-xl text-sm text-white placeholder-gray-500 outline-none"
                  style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)" }}
                />
                <button type="button" onClick={() => setShowPass(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: "#7BBBB8" }}>
                  {showPass ? <FiEyeOff size={15} /> : <FiEye size={15} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-xl text-sm font-bold text-white transition-all hover:brightness-110 disabled:opacity-60 mt-2"
              style={{ background: "#F97316" }}
            >
              {loading ? "Signing in…" : "Sign In"}
            </button>
          </form>

          <p className="mt-6 text-center text-xs" style={{ color: "#4A8A87" }}>
            This is a restricted area. All access is logged.
            <br />
            <a href="mailto:platform@smarttracker.cloud" className="underline mt-1 inline-block" style={{ color: "#7BBBB8" }}>
              Contact platform support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
