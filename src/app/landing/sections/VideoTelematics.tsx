"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  FiAlertTriangle,
  FiZap,
  FiEye,
  FiActivity,
  FiSmartphone,
  FiArrowRight,
} from "react-icons/fi";

const EVENTS = [
  {
    icon: FiAlertTriangle,
    title: "Forward Collision Warning",
    desc: "AI detects unsafe following distances and alerts drivers in real time before impact.",
    color: "#ef4444",
    bg: "#fef2f2",
  },
  {
    icon: FiZap,
    title: "Speed Limit Violation",
    desc: "Automatic geo-fenced speed alerts trigger notifications the moment a limit is breached.",
    color: "#f97316",
    bg: "#fff7ed",
  },
  {
    icon: FiEye,
    title: "Driver Fatigue Detection",
    desc: "DMS cameras analyse eye movement and head pose to detect drowsiness 24/7.",
    color: "#8b5cf6",
    bg: "#f5f3ff",
  },
  {
    icon: FiActivity,
    title: "Harsh Driving Events",
    desc: "3-axis accelerometers capture harsh braking, acceleration, and cornering automatically.",
    color: "#f59e0b",
    bg: "#fffbeb",
  },
  {
    icon: FiSmartphone,
    title: "Mobile Phone Usage",
    desc: "In-cab AI camera detects phone handling while driving and triggers immediate alerts.",
    color: "#1A7A75",
    bg: "#E8F4F3",
  },
];

export default function VideoTelematics() {
  const [active, setActive] = useState(0);
  const activeEvent = EVENTS[active];

  return (
    <section className="py-24 overflow-hidden" id="video" style={{ background: "#E8F4F3" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span
            className="text-xs font-bold tracking-widest uppercase"
            style={{ color: "#1A7A75" }}
          >
            Unparalleled Visibility
          </span>
          <h2 className="mt-3 text-3xl lg:text-5xl font-black leading-tight" style={{ color: '#0D4A47' }}>
            Advanced Video Telematics
          </h2>
          <p className="mt-4 text-lg text-gray-500 max-w-2xl mx-auto">
            AI-powered cameras that don&apos;t just record — they actively prevent accidents and protect your fleet.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left: event tabs + active video card */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            {/* Tab list */}
            <div className="flex gap-2 overflow-x-auto pb-2 mb-6 snap-x">
              {EVENTS.map((e, i) => (
                <button
                  key={e.title}
                  onClick={() => setActive(i)}
                  className={`flex-shrink-0 snap-start flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold transition-all border ${
                    active === i
                      ? "text-white border-transparent shadow-md"
                      : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                  }`}
                  style={active === i ? { background: e.color, borderColor: e.color } : {}}
                >
                  <e.icon size={14} />
                  <span className="hidden sm:block">{e.title.split(" ").slice(0, 2).join(" ")}</span>
                </button>
              ))}
            </div>

            {/* Active event card */}
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="rounded-2xl overflow-hidden border border-gray-200 shadow-lg"
            >
              {/* Mock video area */}
              <div
                className="relative flex items-center justify-center"
                style={{ background: "#0D4A47", minHeight: 220 }}
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  {/* Fake camera feed UI */}
                  <div className="relative w-full h-full">
                    <div className="absolute inset-0 opacity-20"
                      style={{
                        background: `radial-gradient(circle at 40% 50%, ${activeEvent.color}55, transparent 60%)`
                      }}
                    />
                    <div className="absolute top-3 left-3 flex items-center gap-1.5">
                      <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                      <span className="text-[10px] text-white font-semibold tracking-wider">REC</span>
                    </div>
                    <div className="absolute top-3 right-3 text-[10px] text-gray-400">CAM 1 · Forward</div>
                    {/* Animated alert box */}
                    <div
                      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border-2 rounded-lg px-6 py-3 text-center"
                      style={{ borderColor: activeEvent.color }}
                    >
                      <activeEvent.icon size={28} className="mx-auto mb-2" style={{ color: activeEvent.color }} />
                      <p className="text-white text-xs font-bold">{activeEvent.title}</p>
                    </div>
                    <div className="absolute bottom-3 left-3 text-[10px] text-gray-500">Lagos, Nigeria · 14:32:07</div>
                  </div>
                </div>
              </div>

              {/* Card footer */}
              <div className="p-5" style={{ background: activeEvent.bg }}>
                <div className="flex items-center gap-2 mb-2">
                  <activeEvent.icon size={18} style={{ color: activeEvent.color }} />
                  <h3 className="font-bold text-base" style={{ color: '#0D4A47' }}>{activeEvent.title}</h3>
                </div>
                <p className="text-sm leading-relaxed" style={{ color: '#0A3835' }}>{activeEvent.desc}</p>
              </div>
            </motion.div>
          </motion.div>

          {/* Right: feature text */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <h3 className="text-2xl lg:text-3xl font-black leading-tight mb-6" style={{ color: '#0D4A47' }}>
              AI-driven safety that prevents incidents before they happen
            </h3>
            <div className="space-y-5">
              {[
                { title: "360° Camera Coverage", desc: "Front, rear, side, and in-cab cameras give complete visibility of every journey." },
                { title: "Real-time Event Alerts", desc: "Dispatchers get instant push notifications for every safety event across the fleet." },
                { title: "Evidence-based Insurance", desc: "Cloud-stored video footage exonerates innocent drivers and accelerates claims." },
                { title: "Driver Coaching Reports", desc: "Weekly score cards and video evidence help managers coach improvement effectively." },
              ].map((f) => (
                <div key={f.title} className="flex gap-4">
                  <div
                    className="flex-shrink-0 w-5 h-5 rounded-full mt-0.5"
                    style={{ background: "#1A7A75" }}
                  />
                  <div>
                    <div className="font-bold text-gray-900">{f.title}</div>
                    <div className="text-sm text-gray-500 mt-0.5">{f.desc}</div>
                  </div>
                </div>
              ))}
            </div>
            <a
              href="#"
              className="mt-8 inline-flex items-center gap-2 font-bold text-sm hover:gap-3 transition-all"
              style={{ color: "#1A7A75" }}
            >
              Explore Video Telematics <FiArrowRight size={16} />
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
