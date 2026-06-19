"use client";

import { motion } from "framer-motion";

export default function CTABanner() {
  return (
    <section
      className="py-24 relative overflow-hidden"
      id="demo"
      style={{ background: "linear-gradient(135deg, #0D4A47 0%, #1A7A75 100%)" }}
    >
      {/* Decorative circles */}
      <div className="pointer-events-none absolute -top-24 -right-24 w-96 h-96 rounded-full opacity-10 bg-white" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 w-80 h-80 rounded-full opacity-10 bg-white" />

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl lg:text-5xl font-black text-white leading-tight">
            Ready to Transform Your<br className="hidden sm:block" /> Fleet Operations?
          </h2>
          <p className="mt-5 text-lg max-w-2xl mx-auto" style={{ color: '#B2D4D2' }}>
            Join thousands of businesses already using Smart Tracker Telematics to cut costs, improve safety, and operate smarter.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="#"
              className="px-10 py-4 rounded-full text-white font-black text-base shadow-xl hover:brightness-110 active:scale-95 transition-all"
              style={{ background: "#F97316" }}
            >
              Request a Demo
            </a>
            <a
              href="mailto:sales@smarttracker.io"
              className="text-sm font-semibold hover:text-white underline underline-offset-4 transition-colors" style={{ color: 'rgba(255,255,255,0.7)' }}
            >
              Contact Sales
            </a>
          </div>

          {/* Trust signals */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-xs font-semibold" style={{ color: '#B2D4D2' }}>
            {["No credit card required", "14-day free trial", "Setup in under 30 minutes", "24/7 dedicated support"].map((t) => (
              <span key={t} className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: '#22C55E' }} />
                {t}
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
