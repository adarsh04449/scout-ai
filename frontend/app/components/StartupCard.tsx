"use client";

import { motion, MotionValue, useMotionValue, useSpring, useTransform  } from "framer-motion";
import Image from "next/image";
import { useState } from "react";
import type { Startup } from "./startupData";

interface StartupCardProps {
  startup: Startup;
  translateX: MotionValue<number>;
  translateY: MotionValue<number>;
  rotate: MotionValue<number>;
  opacity: MotionValue<number>;
}

export default function StartupCard({ startup, translateX, translateY, rotate, opacity }: StartupCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  
  // Mouse position tracking for 3D tilt effect
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [10, -10]), { stiffness: 150, damping: 15 });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-10, 10]), { stiffness: 150, damping: 15 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    mouseX.set(x - 0.5);
    mouseY.set(y - 0.5);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
    setIsHovered(false);
  };

  return (
    <motion.div
      style={{
        x: translateX,
        y: translateY,
        rotate: rotate,
        opacity: opacity,
        transformStyle: "preserve-3d",
      }}
      className="absolute -left-4 -top-4 flex h-full w-full items-center justify-center overflow-visible rounded-2xl will-change-transform cursor-pointer group"
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
    >
      {/* Glow effect background - visible on hover */}
      <motion.div 
        className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/30 via-purple-500/30 to-pink-500/30 blur-2xl"
        animate={{
          opacity: isHovered ? 0.8 : 0,
          scale: isHovered ? 1.2 : 1,
        }}
        transition={{ duration: 0.3 }}
        style={{ zIndex: -1 }}
      />
      
      {/* Main card container with 3D tilt */}
      <motion.div
        style={{
          rotateX: isHovered ? rotateX : 0,
          rotateY: isHovered ? rotateY : 0,
          scale: isHovered ? 1.08 : 1,
        }}
        className="relative h-full w-full rounded-2xl bg-gray-800 border border-gray-700/50 shadow-2xl overflow-hidden"
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        {/* Shine/reflection effect */}
        <motion.div 
          className="absolute inset-0 bg-gradient-to-br from-white/0 via-white/0 to-white/20 pointer-events-none z-10"
          animate={{
            opacity: isHovered ? 1 : 0,
          }}
          transition={{ duration: 0.3 }}
        />
        
        {/* Animated border glow */}
        <motion.div 
          className="absolute -inset-[2px] rounded-2xl bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 blur-sm"
          animate={{
            opacity: isHovered ? 0.6 : 0,
          }}
          transition={{ duration: 0.3 }}
          style={{ zIndex: -1 }}
        />
        
        <div className="relative h-full w-full">
          <motion.div
            animate={{
              scale: isHovered ? 1.1 : 1,
            }}
            transition={{ duration: 0.5 }}
            className="relative h-full w-full"
          >
            <Image
              src={startup.thumbnail}
              alt={startup.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 200px, 450px"
              loading="lazy"
              quality={90}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                if (target.parentElement) {
                  target.parentElement.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
                }
              }}
            />
          </motion.div>
          
          {/* Enhanced gradient overlay */}
          <motion.div 
            className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/15 to-transparent"
            animate={{
              background: isHovered 
                ? "linear-gradient(to top, rgba(0,0,0,0.45), rgba(0,0,0,0.15), transparent)"
                : "linear-gradient(to top, rgba(0,0,0,0.6), rgba(0,0,0,0.15), transparent)"
            }}
            transition={{ duration: 0.3 }}
          />
          
          {/* Animated shimmer effect */}
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
          
          {/* Title with enhanced styling */}
          <div className="absolute bottom-4 left-4 right-4 z-10">
            <motion.div 
              className="backdrop-blur-sm bg-black/30 rounded-lg px-3 py-2 border border-white/10"
              animate={{
                backgroundColor: isHovered ? "rgba(0,0,0,0.5)" : "rgba(0,0,0,0.3)",
                borderColor: isHovered ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.1)",
              }}
              transition={{ duration: 0.3 }}
            >
              <motion.h3 
                className="text-white font-semibold text-sm drop-shadow-lg"
                animate={{
                  color: isHovered ? "#93c5fd" : "#ffffff",
                }}
                transition={{ duration: 0.3 }}
              >
                {startup.title}
              </motion.h3>
            </motion.div>
          </div>
          
          {/* Corner accent */}
          <motion.div 
            className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-500/40 to-transparent rounded-bl-full"
            animate={{
              opacity: isHovered ? 1 : 0,
            }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </motion.div>
    </motion.div>
  );
}

