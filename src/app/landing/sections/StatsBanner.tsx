"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

const STATS = [
  { value: 10000, suffix: "+", label: "Vehicles Tracked", prefix: "" },
  { value: 99.9, suffix: "%", label: "Uptime SLA", prefix: "" },
  { value: 50, suffix: "+", label: "Countries", prefix: "" },
  { value: 24, suffix: "/7", label: "Support", prefix: "" },
];

function useCountUp(target: number, active: boolean, duration = 1600) {
  const [count, setCount] = useState(0);
  const rafRef = useRef<number | null>(null);
  const startedRef = useRef(false);

  useEffect(() => {
    if (!active || startedRef.current) return;
    startedRef.current = true;

    let start: number | null = null;
    const step = (ts: number) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      // ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(parseFloat((eased * target).toFixed(1)));
      if (progress < 1) rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [active, target, duration]);

  return count;
}

function StatItem({
  value,
  suffix,
  label,
  prefix,
  active,
}: {
  value: number;
  suffix: string;
  label: string;
  prefix: string;
  active: boolean;
}) {
  const count = useCountUp(value, active);
  const display = Number.isInteger(value) ? Math.round(count).toLocaleString() : count.toFixed(1);

  return (
    <div className="text-center px-4">
      <div className="text-4xl lg:text-5xl font-black" style={{ color: '#F97316' }}>
        {prefix}{display}{suffix}
      </div>
      <div className="mt-2 text-sm font-semibold tracking-wide" style={{ color: '#B2D4D2' }}>{label}</div>
    </div>
  );
}

export default function StatsBanner() {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.4 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={ref}
      className="py-20"
      style={{ background: "#072E2C" }}
      id="stats"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-10 divide-y-2 lg:divide-y-0 lg:divide-x-2" style={{ borderColor: 'rgba(26,122,117,0.3)' }}
        >
          {STATS.map((s) => (
            <StatItem key={s.label} {...s} active={visible} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
