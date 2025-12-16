"use client";

import { motion } from "framer-motion";

export default function Demo() {
  const demoUrl = process.env.NEXT_PUBLIC_DEMO_URL;

  return (
    <section className="relative w-full py-16 sm:py-20 bg-gray-900">
      <div className="max-w-6xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="mb-8 flex items-center justify-between"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-white">See it in action</h2>
          <a 
            href="/research" 
            className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
          >
            Research your idea →
          </a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="rounded-2xl border border-gray-800 bg-gray-900 overflow-hidden"
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
                <div className="aspect-video w-full flex items-center justify-center bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,0.12),transparent_50%)]">
                  <div className="text-center px-6">
                    <div className="mb-3 text-4xl">🎬</div>
                    <h3 className="font-semibold mb-1 text-white">Demo video placeholder</h3>
                    <p className="text-gray-400 text-sm">
                      Set <span className="font-mono">NEXT_PUBLIC_DEMO_URL</span> to embed a product video (YouTube, Loom, etc.).
                    </p>
                  </div>
                </div>
              )}
            </div>
            
            {/* Story (left on desktop, below on mobile) */}
            <div className="order-2 md:order-1 p-6 md:p-8">
              <h3 className="text-xl font-semibold mb-4 text-white">A founder's 2‑minute validation</h3>
              <div className="space-y-4 text-gray-300 text-sm leading-relaxed">
                <p>
                  Priya is exploring an idea for an <span className="text-gray-100 font-medium">AI‑assisted nutrition coach</span>. She opens ScoutAI, types a single sentence,
                  and hits <span className="text-gray-100 font-medium">Research your idea</span>.
                </p>
                <p>
                  In under two minutes, Priya gets a <span className="text-gray-100 font-medium">market overview</span> with a concrete size figure and sources, a
                  <span className="text-gray-100 font-medium"> competitor snapshot</span> listing top players and positioning, and a <span className="text-gray-100 font-medium">5‑year forecast</span> she can drop straight into a chart.
                </p>
                <p>
                  She shares the report with her co‑founder and investor friends. With sources attached and numbers clearly marked as
                  conservative vs optimistic, the conversation moves from "is the market real?" to "how do we win our first niche?".
                </p>
                <p className="text-gray-400 italic">
                  You can do the same for your idea—no spreadsheets, no hours of tab hunting. Try it now and get an investor‑ready brief.
                </p>
                <div className="pt-2">
                  <a 
                    href="/research" 
                    className="inline-block px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 transition-colors text-sm font-medium"
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

