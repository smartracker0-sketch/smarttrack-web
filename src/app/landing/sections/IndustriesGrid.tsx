"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { FiArrowRight } from "react-icons/fi";
import { industries } from "../../industries/industryData";

/* Fallback gradient palettes so we never show a broken image */
const GRADIENTS = [
  "from-blue-900 to-blue-700",
  "from-slate-800 to-slate-600",
  "from-red-900 to-red-700",
  "from-orange-900 to-orange-700",
  "from-yellow-900 to-yellow-700",
  "from-green-900 to-green-700",
  "from-teal-900 to-teal-700",
  "from-cyan-900 to-cyan-700",
  "from-teal-800 to-teal-600",
  "from-violet-900 to-violet-700",
  "from-purple-900 to-purple-700",
  "from-pink-900 to-pink-700",
  "from-rose-900 to-rose-700",
  "from-amber-900 to-amber-700",
  "from-lime-900 to-lime-700",
  "from-emerald-900 to-emerald-700",
];

export default function IndustriesGrid() {
  return (
    <section className="py-24" style={{ background: "#f5f7fa" }} id="industries">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <span
            className="text-xs font-bold tracking-widest uppercase"
            style={{ color: "#1A7A75" }}
          >
            Digital transformation for all sectors
          </span>
          <h2 className="mt-3 text-3xl lg:text-5xl font-black text-gray-900 leading-tight">
            100,000+ Happy Customers<br className="hidden sm:block" /> Across 25+ Industries
          </h2>
        </motion.div>

        {/* Bento grid */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-3 auto-rows-[160px]"
        >
          {industries.map((industry, i) => (
            <Link
              key={industry.name}
              href={`/industries/${industry.slug}`}
              className={`relative rounded-2xl overflow-hidden group cursor-pointer ${industry.span}`}
            >
              {/* Background image with gradient fallback */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${GRADIENTS[i % GRADIENTS.length]}`}
              />
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-cover bg-center opacity-60 group-hover:opacity-40 transition-opacity duration-500"
                style={{ backgroundImage: `url(${industry.imageUrl})` }}
              />

              {/* Dark overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

              {/* Content */}
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <div className="text-white font-bold text-sm lg:text-base leading-tight">
                  {industry.name}
                </div>
                <span
                  className="mt-1.5 inline-flex items-center gap-1 text-xs font-semibold opacity-0 group-hover:opacity-100 transition-all translate-y-1 group-hover:translate-y-0 duration-300" style={{ color: '#B2D4D2' }}
                >
                  Learn More <FiArrowRight size={11} />
                </span>
              </div>
            </Link>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
