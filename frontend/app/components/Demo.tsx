"use client";

import { motion } from "framer-motion";

export default function Demo() {
  const demoUrl = process.env.NEXT_PUBLIC_DEMO_URL;
  const localDemo = "/demo.mp4";

  return (
    <section className="relative w-full py-16 sm:py-20 bg-[#0A0A0A]">
      <div className="max-w-6xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="mb-8 flex items-center justify-between"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-white">See it in action</h2>
        
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="rounded-2xl border border-[#1F2937] bg-[#111111] overflow-hidden md:border-0 md:bg-transparent"
        >
          <div className="grid md:grid-cols-2">
            {/* Video (first on mobile) */}
            <div className="order-1 md:order-2">
              {demoUrl ? (
                <div className="aspect-video w-full">
                  <iframe
                    src={demoUrl}
                    title="ScoutAI demo"
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              ) : (
                <div className="h-full w-full flex items-center justify-center bg-[radial-gradient(ellipse_at_center,rgba(47,91,255,0.18),transparent_50%)]">
                  <video
                    className="w-full h-full object-contain pointer-events-none"
                    src={localDemo}
                    autoPlay
                    muted
                    loop
                    playsInline
                  />
                </div>
              )}
            </div>
            
            {/* Story (left on desktop, below on mobile) */}
            <div className="order-2 md:order-1 p-6 md:p-8">
              <h3 className="text-xl font-semibold mb-4 text-white">A founder's 2‑minute validation</h3>
              <div className="space-y-4 text-[#94A3B8] text-sm leading-relaxed">
                <p>
                  Priya is exploring an idea for an <span className="text-white font-medium">AI‑powered meal planning app</span>. She opens ScoutAI, types a single sentence,
                  and hits <span className="text-white font-medium">Research your idea</span>.
                </p>
                <p>
                  In under two minutes, Priya gets a <span className="text-white font-medium">market overview</span> with a concrete size figure and sources, a
                  <span className="text-white font-medium"> competitor snapshot</span> listing top players and positioning, and a <span className="text-white font-medium">5‑year forecast</span> she can drop straight into a chart.
                </p>
                <p>
                  She shares the report with her co‑founder and investor friends. With sources attached and numbers clearly marked as
                  conservative vs optimistic, the conversation moves from "is the market real?" to "how do we win our first niche?".
                </p>
                <p className="text-[#94A3B8] italic">
                  You can do the same for your idea—no spreadsheets, no hours of tab hunting. Try it now and get an investor‑ready brief.
                </p>
                <div className="pt-2">
                  <a 
                    href="/research" 
                    className="inline-block px-4 py-2 rounded-xl bg-[#111111] transition-all text-sm font-medium text-white border border-white/20 hover:border-white/40 hover:shadow-[0_10px_22px_rgba(255,255,255,0.18)]"
                  >
                    Research your idea
                  </a>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

