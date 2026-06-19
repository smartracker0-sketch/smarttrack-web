"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

const TESTIMONIALS = [
  {
    quote: "Smart Tracker Telematics transformed how we manage our 400-vehicle fleet. Real-time visibility and automated alerts cut our incident rate by 35% in the first quarter.",
    name: "Adebayo Okonkwo",
    title: "Fleet Operations Director",
    company: "PanAfrica Logistics Ltd",
    initials: "AO",
    rating: 5,
  },
  {
    quote: "The fuel monitoring module alone paid for our subscription in two months. We detected a pilferage ring and saved over ₦8 million in losses.",
    name: "Ngozi Eze",
    title: "Head of Transport",
    company: "SafeHaul Freight Services",
    initials: "NE",
    rating: 5,
  },
  {
    quote: "Our drivers' safety scores improved by 28% after we rolled out the DMS coaching reports. The leaderboard gamification really works.",
    name: "Emeka Obi",
    title: "Safety & Compliance Manager",
    company: "West Africa Oil Transport",
    initials: "EO",
    rating: 5,
  },
  {
    quote: "We evaluated four platforms. Smart Tracker stood out for its depth of features, API flexibility, and the quality of local support in our region.",
    name: "Tunde Adesanya",
    title: "CTO",
    company: "Rideon Mobility Technologies",
    initials: "TA",
    rating: 5,
  },
  {
    quote: "Geofencing and automated schedule compliance tracking gave our school district the parent confidence we needed. Zero missed route violations in 6 months.",
    name: "Fatima Al-Hassan",
    title: "Director of Student Transport",
    company: "Abuja Metro Schools",
    initials: "FA",
    rating: 5,
  },
  {
    quote: "The white-label reseller program was a game changer. We've onboarded 80 SME clients under our own brand with minimal overhead.",
    name: "Chidi Nwoye",
    title: "CEO",
    company: "FleetEdge Nigeria",
    initials: "CN",
    rating: 5,
  },
];

function StarRating({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: count }).map((_, i) => (
        <svg key={i} className="w-4 h-4" fill="#f97316" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

export default function Testimonials() {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const total = TESTIMONIALS.length;
  const visibleCount = 3; // desktop shows 3

  const next = useCallback(() => setCurrent((c) => (c + 1) % total), [total]);
  const prev = useCallback(() => setCurrent((c) => (c - 1 + total) % total), [total]);

  useEffect(() => {
    if (paused) return;
    timerRef.current = setInterval(next, 4000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [paused, next]);

  // Get 3 cards to show on desktop, 1 on mobile
  const getVisible = () => {
    return [0, 1, 2].map((offset) => TESTIMONIALS[(current + offset) % total]);
  };

  return (
    <section className="py-24 overflow-hidden" id="testimonials" style={{ background: "#0D4A47" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <span className="text-xs font-bold tracking-widest uppercase" style={{ color: "#B2D4D2" }}>
            Customer Stories
          </span>
          <h2 className="mt-3 text-3xl lg:text-5xl font-black text-white">
            What Our Happy Customers Say
          </h2>
        </motion.div>

        {/* Carousel */}
        <div
          className="relative"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          {/* Desktop: 3 cards */}
          <div className="hidden md:grid grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {getVisible().map((t, i) => (
                <motion.div
                  key={`${t.name}-${current}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                  className="rounded-2xl p-6 flex flex-col gap-4" style={{ background: '#0A3835', border: '1px solid rgba(26,122,117,0.3)' }}
                >
                  <StarRating count={t.rating} />
                  <p className="text-sm leading-relaxed flex-1" style={{ color: '#B2D4D2' }}>&ldquo;{t.quote}&rdquo;</p>
                  <div className="flex items-center gap-3 pt-3 border-t" style={{ borderColor: 'rgba(26,122,117,0.25)' }}>
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                      style={{ background: "#1A7A75" }}
                    >
                      {t.initials}
                    </div>
                    <div>
                      <div className="font-bold text-gray-900 text-sm">{t.name}</div>
                      <div className="text-xs text-gray-500">{t.title}, {t.company}</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Mobile: 1 card */}
          <div className="md:hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={current}
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.35 }}
                className="rounded-2xl p-6 flex flex-col gap-4"
                style={{ background: '#0A3835', border: '1px solid rgba(26,122,117,0.3)' }}
              >
                <StarRating count={TESTIMONIALS[current].rating} />
                <p className="text-sm leading-relaxed" style={{ color: '#B2D4D2' }}>&ldquo;{TESTIMONIALS[current].quote}&rdquo;</p>
                <div className="flex items-center gap-3 pt-3 border-t" style={{ borderColor: 'rgba(26,122,117,0.25)' }}>
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                    style={{ background: "#1A7A75" }}
                  >
                    {TESTIMONIALS[current].initials}
                  </div>
                  <div>
                    <div className="font-bold text-white text-sm">{TESTIMONIALS[current].name}</div>
                    <div className="text-xs" style={{ color: '#B2D4D2' }}>{TESTIMONIALS[current].title}</div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation arrows */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <button
              onClick={prev}
              className="w-10 h-10 rounded-full flex items-center justify-center transition-colors"
              style={{ border: '1px solid rgba(178,212,210,0.3)', color: '#B2D4D2' }}
            >
              <FiChevronLeft size={18} />
            </button>

            {/* Dot indicators */}
            <div className="flex gap-2">
              {TESTIMONIALS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    i === current ? "w-6" : "w-2 bg-gray-300"
                  }`}
                  style={i === current ? { background: "#F97316", width: 24 } : { background: 'rgba(178,212,210,0.3)' }}
                />
              ))}
            </div>

            <button
              onClick={next}
              className="w-10 h-10 rounded-full flex items-center justify-center transition-colors"
              style={{ border: '1px solid rgba(178,212,210,0.3)', color: '#B2D4D2' }}
            >
              <FiChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
