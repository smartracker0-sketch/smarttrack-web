"use client";

import { motion } from "framer-motion";
import { FiArrowRight } from "react-icons/fi";

const INDUSTRIES = [
  { name: "Oil & Gas", keyword: "oil-refinery", span: "col-span-2 row-span-1" },
  { name: "Supply Chain & Logistics", keyword: "logistics-warehouse", span: "col-span-1 row-span-2" },
  { name: "Emergency Services", keyword: "ambulance", span: "col-span-1 row-span-1" },
  { name: "Food & Beverage", keyword: "food-delivery", span: "col-span-1 row-span-1" },
  { name: "Construction", keyword: "construction-site", span: "col-span-1 row-span-1" },
  { name: "School Bus", keyword: "school-bus", span: "col-span-1 row-span-1" },
  { name: "Consumer Goods", keyword: "retail-store", span: "col-span-1 row-span-1" },
  { name: "Pharmaceutical", keyword: "laboratory", span: "col-span-2 row-span-1" },
  { name: "Passenger Transit", keyword: "bus-transit", span: "col-span-1 row-span-1" },
  { name: "Agriculture", keyword: "agriculture-farm", span: "col-span-1 row-span-1" },
  { name: "Mining", keyword: "mining", span: "col-span-1 row-span-1" },
  { name: "eCommerce", keyword: "ecommerce-delivery", span: "col-span-1 row-span-1" },
  { name: "Telecom", keyword: "telecommunications", span: "col-span-1 row-span-1" },
  { name: "Banking", keyword: "bank-finance", span: "col-span-1 row-span-1" },
  { name: "Vehicle Leasing", keyword: "car-rental", span: "col-span-1 row-span-1" },
  { name: "Mobility as a Service", keyword: "ride-sharing", span: "col-span-2 row-span-1" },
];

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
          {INDUSTRIES.map((industry, i) => (
            <div
              key={industry.name}
              className={`relative rounded-2xl overflow-hidden group cursor-pointer ${industry.span}`}
            >
              {/* Background image via Unsplash – with gradient fallback */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${GRADIENTS[i % GRADIENTS.length]}`}
              />
              <img
                src={`https://images.unsplash.com/photo-${1500000000000 + i * 7654321}?auto=format&fit=crop&w=800&q=70`}
                alt={industry.name}
                className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity duration-500"
                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
              />

              {/* Dark overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

              {/* Content */}
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <div className="text-white font-bold text-sm lg:text-base leading-tight">
                  {industry.name}
                </div>
                <a
                  href="#"
                  className="mt-1.5 inline-flex items-center gap-1 text-xs font-semibold opacity-0 group-hover:opacity-100 transition-all translate-y-1 group-hover:translate-y-0 duration-300" style={{ color: '#B2D4D2' }}
                >
                  Learn More <FiArrowRight size={11} />
                </a>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
