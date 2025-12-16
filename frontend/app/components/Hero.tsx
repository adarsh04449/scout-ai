"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import Link from "next/link";
import StartupCard from "./StartupCard";
import { startups } from "./startupData";

export default function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  // Parallax transforms for text (subtle fade on scroll)
  const textOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const textY = useTransform(scrollYProgress, [0, 0.5], [0, -30]);

  return (
    <section 
      ref={containerRef}
      className="relative w-full min-h-screen flex items-center justify-center overflow-hidden bg-gray-900"
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(59,130,246,0.15),transparent_50%),radial-gradient(ellipse_at_bottom,rgba(147,51,234,0.12),transparent_50%)]" />
      
      {/* Startup Cards Background - Parallax Effect */}
      <div className="absolute inset-0 z-0">
        {/* Desktop: Show all cards */}
        {startups.map((startup, index) => {
          // Different parallax speeds for each card
          const speed = startup.speed || 0.5;
          const translateY = useTransform(
            scrollYProgress,
            [0, 1],
            [0, -150 * speed]
          );
          const translateX = useTransform(
            scrollYProgress,
            [0, 1],
            [0, 100 * speed]
          );
          const rotate = useTransform(
            scrollYProgress,
            [0, 1],
            [startup.initialRotate || 0, (startup.initialRotate || 0) - 60 * speed],
            { clamp: false }
          );
          const opacity = useTransform(
            scrollYProgress,
            [0, 0.5, 1],
            [0.7, 0.7, 0.3]
          );

          // Special positioning for Vercel card - to the right of the button
          let leftPercent, topPercent;
          if (startup.title === "Vercel") {
            // Position to the right of the centered button (button is at ~50% center)
            // Button area is roughly at center, so position Vercel at ~65-70% from left
            leftPercent = 65;
            topPercent = 65; // Position it near the button level (button is around 60-70% from top)
          } else {
            // Position other cards in a grid-like pattern
            const row = Math.floor(index / 3);
            const col = index % 3;
            leftPercent = 10 + col * 30 + (startup.initialX || 0) / 10;
            topPercent = 10 + row * 30 + (startup.initialY || 0) / 10;
          }

          return (
            <div
              key={startup.title}
              style={{
                position: "absolute",
                left: `${leftPercent}%`,
                top: `${topPercent}%`,
                width: "450px",
                height: "300px",
              }}
              className="hidden md:block"
            >
              <StartupCard 
                startup={startup} 
                translateX={translateX}
                translateY={translateY}
                rotate={rotate}
                opacity={opacity}
              />
            </div>
          );
        })}
        
        {/* Mobile: Show fewer cards */}
        {startups.slice(0, 4).map((startup, index) => {
          const speed = startup.speed || 0.5;
          const translateY = useTransform(
            scrollYProgress,
            [0, 1],
            [0, -100 * speed]
          );
          const translateX = useTransform(
            scrollYProgress,
            [0, 1],
            [0, 50 * speed]
          );
          const rotate = useTransform(
            scrollYProgress,
            [0, 1],
            [startup.initialRotate || 0, (startup.initialRotate || 0) - 40 * speed],
            { clamp: false }
          );
          const opacity = useTransform(
            scrollYProgress,
            [0, 0.5, 1],
            [0.6, 0.6, 0.2]
          );

          const positions = [
            { left: "5%", top: "15%" },
            { left: "55%", top: "20%" },
            { left: "10%", top: "60%" },
            { left: "60%", top: "65%" },
          ];

          return (
            <div
              key={`mobile-${startup.title}`}
              style={{
                position: "absolute",
                ...positions[index],
                width: "200px",
                height: "140px",
              }}
              className="block md:hidden"
            >
              <StartupCard 
                startup={startup} 
                translateX={translateX}
                translateY={translateY}
                rotate={rotate}
                opacity={opacity}
              />
            </div>
          );
        })}
      </div>

      {/* Overlay for better text readability */}
      <div className="absolute inset-0 z-[1] bg-gradient-to-b from-gray-900/60 via-gray-900/40 to-gray-900/80" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32">
        <div className="flex flex-col items-center text-center">
          {/* Hero Text */}
          <motion.div
            style={{
              opacity: textOpacity,
              y: textY
            }}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="w-full max-w-5xl"
          >
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-8 leading-tight drop-shadow-lg">
              Every idea begins with a vision worth chasing. We help you understand the market behind it.
            </h1>
          </motion.div>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="mt-8"
          >
            <Link
              href="/research"
              className="inline-block px-8 py-4 rounded-xl bg-blue-600 hover:bg-blue-700 transition-colors font-semibold text-lg shadow-lg shadow-blue-500/50 hover:shadow-xl hover:shadow-blue-500/50"
            >
              Start Researching
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
