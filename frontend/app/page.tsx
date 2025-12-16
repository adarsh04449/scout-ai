"use client";

import { useScrollProgress } from "./hooks/useScrollEffects";
import Hero from "./components/Hero";
import Problem from "./components/Problem";
import Features from "./components/Features";
import HowItWorks from "./components/HowItWorks";
import Demo from "./components/Demo";
import CTA from "./components/CTA";

export default function Home() {
  // Scroll progress
  const scrollProgress = useScrollProgress();

  return (
    <div className="bg-gray-900 text-white min-h-screen relative overflow-x-hidden">
      {/* Scroll Progress Indicator */}
      <div 
        className="scroll-progress" 
        style={{ width: `${scrollProgress}%` }}
      />

      {/* Navbar */}
      <nav className="border-b border-gray-800 bg-gray-900/80 backdrop-blur supports-[backdrop-filter]:bg-gray-900/60 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-white font-semibold">ScoutAI</span>
              <span className="text-xs text-gray-400">Market Research Assistant</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <a href="/research" className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 transition-colors text-sm font-medium">
              Research your idea
            </a>
          </div>
        </div>
      </nav>

      {/* Hero Section with Parallax Laptop */}
      <Hero />

      {/* Problem Section */}
      <Problem />

      {/* Features Section */}
      <Features />

      {/* How It Works Section */}
      <HowItWorks />

      {/* Demo Section */}
      <Demo />

      {/* CTA Section */}
      <CTA />

      {/* Footer */}
      <footer className="border-t border-gray-800 bg-gray-900">
        <div className="max-w-6xl mx-auto px-4 py-8 flex items-center justify-between">
          <p className="text-gray-400 text-sm">© {new Date().getFullYear()} ScoutAI</p>
          <a href="/research" className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 transition-colors text-sm font-medium">
            Research your idea
          </a>
        </div>
      </footer>
    </div>
  );
}
