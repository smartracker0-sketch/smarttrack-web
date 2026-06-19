"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { FiPlay } from "react-icons/fi";

const STATS = [
  { value: 25, suffix: "+", label: "Industries Served" },
  { value: 50, suffix: "+", label: "Countries" },
  { value: "1Bn", suffix: "+", label: "Data Points Daily" },
];

function useCountUp(target: number, duration = 1800) {
  const [count, setCount] = useState(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    let start: number | null = null;
    const step = (ts: number) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      setCount(Math.floor(progress * target));
      if (progress < 1) rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [target, duration]);

  return count;
}

function StatCounter({ value, suffix, label }: { value: number | string; suffix: string; label: string }) {
  const numericValue = typeof value === "number" ? value : 0;
  const count = useCountUp(numericValue, 2000);
  const display = typeof value === "string" ? value : count;

  return (
    <div className="text-center">
      <div className="text-3xl lg:text-4xl font-black text-white">
        {display}{suffix}
      </div>
      <div className="text-sm mt-1 font-medium" style={{ color: '#B2D4D2' }}>{label}</div>
    </div>
  );
}

export default function Hero() {
  return (
    <section
      className="relative min-h-screen flex flex-col justify-center overflow-hidden"
      style={{ background: "radial-gradient(ellipse at 60% 40%, #1A7A75 0%, #0D4A47 50%, #072E2C 100%)" }}
    >
      {/* Animated grid background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <svg
          className="absolute inset-0 w-full h-full opacity-10"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 60" fill="none" stroke="white" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
        {/* Glowing orbs */}
        <div
          className="absolute top-1/4 -left-40 w-96 h-96 rounded-full blur-3xl opacity-20"
          style={{ background: "#1A7A75" }}
        />
        <div
          className="absolute bottom-1/4 -right-40 w-96 h-96 rounded-full blur-3xl opacity-20"
          style={{ background: "#F97316" }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-24 text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 bg-white/10 backdrop-blur border border-white/20 rounded-full px-4 py-1.5 text-xs font-semibold mb-8" style={{ color: '#B2D4D2' }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          Trusted by 100,000+ vehicles across 50+ countries
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black text-white leading-tight max-w-5xl mx-auto"
        >
          The Future of Fleet Operations Management is{" "}
          <span style={{ color: "#f97316" }}>Here</span>
        </motion.h1>

        {/* Subheading */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-6 text-lg lg:text-xl max-w-3xl mx-auto leading-relaxed" style={{ color: '#B2D4D2' }}
        >
          Single platform to track, monitor, and manage your vehicles, assets, fuel, expenses and more.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <a
            href="#demo"
            className="flex items-center gap-2 px-8 py-4 rounded-full text-white font-bold text-base shadow-lg hover:brightness-110 active:scale-95 transition-all"
            style={{ background: "#F97316" }}
          >
            Request a Demo
          </a>
          <a
            href="#video"
            className="flex items-center gap-2 px-8 py-4 rounded-full text-white font-semibold text-base border-2 border-white/30 hover:bg-white/10 transition-all"
          >
            <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center">
              <FiPlay size={12} className="ml-0.5" />
            </div>
            Watch How It Works
          </a>
        </motion.div>

        {/* Stat counters */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="mt-16 grid grid-cols-3 gap-8 max-w-lg mx-auto"
        >
          {STATS.map((s) => (
            <StatCounter key={s.label} {...s} />
          ))}
        </motion.div>

        {/* Dashboard mockup hint */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="mt-20 max-w-5xl mx-auto rounded-2xl overflow-hidden border border-white/10 shadow-2xl"
          style={{ background: "#072E2C" }}
        >
          <div className="flex items-center gap-1.5 px-4 py-3 border-b border-white/10">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="ml-4 text-xs text-gray-500">Smart Tracker Telematics — Live Dashboard</span>
          </div>
          <div className="grid grid-cols-4 gap-0 p-4 text-left">
            <div className="col-span-3 rounded-xl mr-3" style={{ background: "#0A3835", minHeight: 200 }}>
              <div className="p-3 border-b border-white/10 text-xs font-semibold" style={{ color: '#B2D4D2' }}>Live Map — Lagos, Nigeria</div>
              <div className="relative p-4" style={{ minHeight: 160 }}>
                {/* Fake map dots */}
                {[
                  { top: "30%", left: "25%", color: "#22c55e" },
                  { top: "50%", left: "55%", color: "#22c55e" },
                  { top: "65%", left: "35%", color: "#eab308" },
                  { top: "20%", left: "70%", color: "#ef4444" },
                  { top: "75%", left: "75%", color: "#6b7280" },
                ].map((dot, i) => (
                  <span
                    key={i}
                    className="absolute w-3 h-3 rounded-full border-2 border-white"
                    style={{ top: dot.top, left: dot.left, background: dot.color }}
                  />
                ))}
                <div className="absolute bottom-2 right-2 text-[10px] text-gray-600">OpenStreetMap</div>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              {[
                { label: "Moving", count: 5, color: "#22c55e" },
                { label: "Stopped", count: 3, color: "#ef4444" },
                { label: "Idle", count: 2, color: "#eab308" },
                { label: "Offline", count: 2, color: "#6b7280" },
              ].map((s) => (
                <div key={s.label} className="rounded-xl p-3" style={{ background: "#0A3835" }}>
                  <div className="text-xl font-black text-white">{s.count}</div>
                  <div className="text-xs font-semibold mt-0.5" style={{ color: s.color }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Wave divider */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0,40 C360,80 1080,0 1440,40 L1440,80 L0,80 Z" fill="#FFFFFF" />
        </svg>
      </div>
    </section>
  );
}
