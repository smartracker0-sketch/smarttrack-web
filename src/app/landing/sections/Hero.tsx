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
      className="relative min-h-screen flex flex-col justify-center overflow-hidden bg-[#071E1C]"
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-cover bg-center opacity-65"
        style={{ backgroundImage: "url('/videos/tracking-system-hero.gif')" }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[#071E1C]/80 via-[#071E1C]/58 to-[#071E1C]/88" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#071E1C]/85 via-transparent to-[#071E1C]/45" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-28 text-center">
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
            href="/tracking"
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
