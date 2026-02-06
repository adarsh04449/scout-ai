"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function CTA() {
  return (
    <section className="relative w-full py-20 sm:py-28 bg-gradient-to-b from-[#0A0A0A] to-[#111111]">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-8 leading-tight">
            Turn your idea into a market-ready plan.
          </h2>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <Link
              href="/research"
              className="inline-block px-8 py-4 rounded-xl bg-[#111111] transition-all font-semibold text-lg text-white hover:scale-105 transform transition-transform border border-white/20 hover:border-white/40 hover:shadow-[0_12px_26px_rgba(255,255,255,0.2)]"
            >
              Try It Free
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

