"use client";

import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Problem from "./components/Problem";
import Features from "./components/Features";
import HowItWorks from "./components/HowItWorks";
import Demo from "./components/Demo";
import CTA from "./components/CTA";

export default function Home() {
  return (
    <div className="bg-[#0A0A0A] text-[#E5E7EB] min-h-screen relative overflow-x-hidden">
      {/* Navbar */}
      <Navbar />

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
      <footer className="border-t border-[#1F2937] bg-[#0A0A0A]">
        <div className="max-w-6xl mx-auto px-4 py-8 flex items-center justify-between">
          <p className="text-[#94A3B8] text-sm">© {new Date().getFullYear()} ScoutAI</p>
        </div>
      </footer>
    </div>
  );
}
