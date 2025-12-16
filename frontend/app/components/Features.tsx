"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useState } from "react";

const features = [
  {
    title: "Competitor Intelligence",
    description: "Comprehensive analysis of your competitive landscape with detailed positioning and market share insights.",
    icon: "🔍",
    color: "blue"
  },
  {
    title: "5-Year Revenue Forecasts",
    description: "Data-driven projections with conservative and optimistic scenarios to guide your business planning.",
    icon: "📈",
    color: "purple"
  },
  {
    title: "Market Size & Trends",
    description: "Deep dive into market opportunities, growth trajectories, and emerging trends in your industry.",
    icon: "📊",
    color: "emerald"
  },
  {
    title: "Founder-friendly summaries",
    description: "Executive reports written in plain language, perfect for sharing with co-founders and investors.",
    icon: "✨",
    color: "pink"
  }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut"
    }
  }
};

const colorClasses: Record<string, string> = {
  blue: "bg-blue-600/20 text-blue-300 border-blue-500/30",
  purple: "bg-purple-600/20 text-purple-300 border-purple-500/30",
  emerald: "bg-emerald-600/20 text-emerald-300 border-emerald-500/30",
  pink: "bg-pink-600/20 text-pink-300 border-pink-500/30"
};

export default function Features() {
  return (
    <section className="relative w-full py-16 sm:py-20 bg-gray-900">
      <div className="max-w-6xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Everything you need to validate your idea
          </h2>
          <p className="text-gray-400 text-lg">
            Powerful insights in minutes, not weeks
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {features.map((feature, index) => {
            const [isHovered, setIsHovered] = useState(false);
            const mouseX = useMotionValue(0);
            const mouseY = useMotionValue(0);
            
            const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [8, -8]), { stiffness: 150, damping: 15 });
            const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-8, 8]), { stiffness: 150, damping: 15 });

            const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const x = (e.clientX - rect.left) / rect.width;
              const y = (e.clientY - rect.top) / rect.height;
              mouseX.set(x - 0.5);
              mouseY.set(y - 0.5);
            };

            const glowColor = feature.color === 'blue' ? 'bg-blue-500/30' :
                             feature.color === 'purple' ? 'bg-purple-500/30' :
                             feature.color === 'emerald' ? 'bg-emerald-500/30' :
                             'bg-pink-500/30';
            
            const borderGlowColor = feature.color === 'blue' ? 'bg-blue-500' :
                                    feature.color === 'purple' ? 'bg-purple-500' :
                                    feature.color === 'emerald' ? 'bg-emerald-500' :
                                    'bg-pink-500';
            
            const accentColor = feature.color === 'blue' ? 'bg-blue-500/30' :
                               feature.color === 'purple' ? 'bg-purple-500/30' :
                               feature.color === 'emerald' ? 'bg-emerald-500/30' :
                               'bg-pink-500/30';
            
            const textHoverColor = feature.color === 'blue' ? '#93c5fd' :
                                  feature.color === 'purple' ? '#c4b5fd' :
                                  feature.color === 'emerald' ? '#6ee7b7' :
                                  '#f9a8d4';

            return (
              <motion.div
                key={index}
                variants={itemVariants}
                onMouseMove={handleMouseMove}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => {
                  setIsHovered(false);
                  mouseX.set(0);
                  mouseY.set(0);
                }}
                className="relative overflow-visible"
              >
                {/* Glow effect background */}
                <motion.div 
                  className={`absolute inset-0 rounded-2xl blur-xl -z-10 ${glowColor}`}
                  animate={{
                    opacity: isHovered ? 0.8 : 0,
                    scale: isHovered ? 1.2 : 1,
                  }}
                  transition={{ duration: 0.3 }}
                />
                
                {/* Main card with 3D tilt */}
                <motion.div
                  style={{
                    rotateX: isHovered ? rotateX : 0,
                    rotateY: isHovered ? rotateY : 0,
                    scale: isHovered ? 1.05 : 1,
                    transformStyle: "preserve-3d",
                  }}
                  className={`rounded-2xl border ${colorClasses[feature.color]} bg-gray-900 p-6 relative overflow-hidden transition-all duration-300 h-full flex flex-col`}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  {/* Shine effect */}
                  <motion.div 
                    className="absolute inset-0 bg-gradient-to-br from-white/0 via-white/0 to-white/10 pointer-events-none z-10"
                    animate={{
                      opacity: isHovered ? 1 : 0,
                    }}
                    transition={{ duration: 0.3 }}
                  />
                  
                  {/* Border glow */}
                  <motion.div 
                    className={`absolute -inset-[2px] rounded-2xl blur-sm -z-10 ${borderGlowColor}`}
                    animate={{
                      opacity: isHovered ? 0.6 : 0,
                    }}
                    transition={{ duration: 0.3 }}
                  />
                  
                  {/* Shimmer effect */}
                  <motion.div 
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    animate={{
                      x: isHovered ? ["-100%", "100%"] : "-100%",
                    }}
                    transition={{
                      x: {
                        duration: 1.5,
                        repeat: isHovered ? Infinity : 0,
                        repeatDelay: 0.5,
                        ease: "easeInOut",
                      }
                    }}
                    style={{ transform: "translateX(-100%)" }}
                  />
                  
                  <motion.div
                    animate={{
                      scale: isHovered ? 1.1 : 1,
                    }}
                    transition={{ duration: 0.3 }}
                    className="text-4xl mb-4"
                  >
                    {feature.icon}
                  </motion.div>
                  
                  <motion.h3 
                    className="text-xl font-semibold text-white mb-3"
                    animate={{
                      color: isHovered ? textHoverColor : '#ffffff',
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    {feature.title}
                  </motion.h3>
                  
                  <p className="text-gray-300 text-sm leading-relaxed relative z-0 flex-grow">
                    {feature.description}
                  </p>
                  
                  {/* Corner accent */}
                  <motion.div 
                    className={`absolute top-0 right-0 w-16 h-16 rounded-bl-full ${accentColor}`}
                    animate={{
                      opacity: isHovered ? 1 : 0,
                    }}
                    transition={{ duration: 0.3 }}
                  />
                </motion.div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}

