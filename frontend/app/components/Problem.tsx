"use client";

import { motion } from "framer-motion";

export default function Problem() {
  return (
    <section className="relative w-full py-16 sm:py-20 bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6">
            Skip the hours of research.
          </h2>
          <p className="text-lg sm:text-xl text-gray-300 leading-relaxed max-w-2xl mx-auto">
            Get instant market analysis, competitor mapping, and revenue forecasts.
          </p>
        </motion.div>
      </div>
    </section>
  );
}

