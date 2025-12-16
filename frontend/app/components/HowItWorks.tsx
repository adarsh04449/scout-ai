"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

const steps = [
  {
    number: "1",
    title: "Describe your idea",
    description: "Tell ScoutAI about your startup in a simple sentence. No complex forms or lengthy questionnaires."
  },
  {
    number: "2",
    title: "AI runs deep market scans",
    description: "Our AI agents research market size, competitors, trends, and generate comprehensive insights."
  },
  {
    number: "3",
    title: "You get a polished report in minutes",
    description: "Receive an executive-ready report with forecasts, competitor analysis, and actionable insights."
  }
];

export default function HowItWorks() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end center"]
  });

  // Animate steps based on scroll progress
  const step1Opacity = useTransform(scrollYProgress, [0, 0.33, 0.66], [0, 1, 1]);
  const step1Y = useTransform(scrollYProgress, [0, 0.33, 0.66], [30, 0, 0]);
  
  const step2Opacity = useTransform(scrollYProgress, [0.2, 0.5, 0.8], [0, 1, 1]);
  const step2Y = useTransform(scrollYProgress, [0.2, 0.5, 0.8], [30, 0, 0]);
  
  const step3Opacity = useTransform(scrollYProgress, [0.4, 0.7, 1], [0, 1, 1]);
  const step3Y = useTransform(scrollYProgress, [0.4, 0.7, 1], [30, 0, 0]);

  // Line progress
  const lineProgress = useTransform(scrollYProgress, [0, 1], [0, 100]);

  return (
    <section 
      ref={containerRef}
      className="relative w-full py-16 sm:py-20 bg-gray-900"
    >
      <div className="max-w-4xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            How it works
          </h2>
          <p className="text-gray-400 text-lg">
            Three simple steps to market insights
          </p>
        </motion.div>

        <div className="relative">
          {/* Vertical connector line */}
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-700 hidden md:block">
            <motion.div
              className="absolute top-0 left-0 w-full bg-gradient-to-b from-blue-600 to-purple-600"
              style={{ height: `${lineProgress}%` }}
            />
          </div>

          <div className="space-y-12 md:space-y-16">
            {steps.map((step, index) => {
              let opacity, y;
              if (index === 0) {
                opacity = step1Opacity;
                y = step1Y;
              } else if (index === 1) {
                opacity = step2Opacity;
                y = step2Y;
              } else {
                opacity = step3Opacity;
                y = step3Y;
              }

              return (
                <motion.div
                  key={index}
                  style={{ opacity, y }}
                  className="relative flex items-start gap-6 md:gap-8"
                >
                  {/* Step number circle */}
                  <div className="relative z-10 flex-shrink-0">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-500/50">
                      {step.number}
                    </div>
                  </div>

                  {/* Step content */}
                  <div className="flex-1 pt-2">
                    <h3 className="text-2xl font-semibold text-white mb-3">
                      {step.title}
                    </h3>
                    <p className="text-gray-300 text-lg leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

