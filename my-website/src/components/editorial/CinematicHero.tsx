"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Compass,
  Award,
} from "lucide-react";

interface CinematicHeroProps {
  onStartComeback: () => void;
  onOpenLearningHub: () => void;
  onOpenRoadmap: () => void;
  onOpenPassport: () => void;
}

export function CinematicHero({
  onStartComeback,
  onOpenLearningHub,
  onOpenRoadmap,
  onOpenPassport,
}: CinematicHeroProps) {
  // Stagger animation container
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.14,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.85, ease: [0.16, 1, 0.3, 1] as const },
    },
  };

  return (
    <section
      id="home"
      className="relative min-h-screen w-full flex flex-col justify-between pt-32 pb-12 px-6 sm:px-12 md:px-16 lg:px-20 z-10 overflow-hidden"
    >
      {/* Subtle Central Glow Behind Title */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] md:w-[900px] h-[450px] bg-gradient-to-tr from-[#ea580c]/12 via-[#f59e0b]/08 to-transparent rounded-full blur-[140px] pointer-events-none" />

      {/* Main Content Area */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-6xl mx-auto my-auto w-full text-center flex flex-col items-center space-y-8"
      >
        {/* Editorial Eyebrow Tag */}
        <motion.div variants={itemVariants} className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-[#18110c]/80 border border-orange-500/25 backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
          <span className="text-[10px] sm:text-xs font-mono uppercase tracking-[0.26em] text-orange-300 font-semibold">
            01 // WOMEN CAREER COMEBACK PLATFORM
          </span>
          <span className="text-[10px] text-orange-200/50 hidden sm:inline">•</span>
          <span className="text-[10px] font-mono text-orange-100/70 hidden sm:inline tracking-wider">
            ZERO STIGMA • 100% FREE
          </span>
        </motion.div>

        {/* Large Cinematic Headline */}
        <motion.h1
          variants={itemVariants}
          className="text-5xl sm:text-7xl md:text-8xl lg:text-[7.5rem] font-light tracking-tighter leading-[0.92] text-[#fcf8f2] uppercase select-none"
        >
          <span>RESTART. </span>
          <br className="hidden sm:inline" />
          <span>REBUILD. </span>
          <br className="hidden sm:inline" />
          <span className="text-gradient-amber italic font-serif tracking-normal">
            RISE.
          </span>
        </motion.h1>

        {/* Storytelling Subtext */}
        <motion.p
          variants={itemVariants}
          className="text-base sm:text-xl md:text-2xl text-[#d4c6b8] max-w-3xl font-light leading-relaxed text-center px-4"
        >
          Your career break was not a void—it was leadership, resilience, and perspective. 
          GFG de-stigmatizes your pause through AI guidance, authentic skills certification, 
          and dignified pathways back into high-impact work.
        </motion.p>

        {/* Action Button Strip */}
        <motion.div
          variants={itemVariants}
          className="flex flex-wrap items-center justify-center gap-4 pt-4 w-full"
        >
          {/* Primary CTA */}
          <button
            type="button"
            onClick={onStartComeback}
            className="btn-editorial-amber group"
          >
            <span>Start Your Comeback</span>
            <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
          </button>

          {/* Secondary CTA */}
          <a
            href="#mission"
            className="px-8 py-3.5 rounded-full border border-orange-500/30 text-[#fcf8f2] hover:bg-orange-500/10 text-xs font-mono uppercase tracking-wider transition-all hover:border-orange-400"
          >
            <span>Explore GFG Mission</span>
          </a>

          {/* Quick Learning Hub Trigger */}
          <button
            type="button"
            onClick={onOpenLearningHub}
            className="px-7 py-3.5 rounded-full bg-[#18120d]/80 border border-amber-500/25 hover:border-amber-400 text-amber-200 text-xs font-mono uppercase tracking-wider flex items-center gap-2 backdrop-blur-md hover:bg-amber-500/10 transition-all"
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-400" />
            <span>Learning Hub</span>
          </button>
        </motion.div>

        {/* Quick Pillar Jump Pills */}
        <motion.div
          variants={itemVariants}
          className="pt-6 flex flex-wrap items-center justify-center gap-2 text-xs font-mono text-[#a39485]"
        >
          <span className="text-[11px] uppercase tracking-widest text-orange-400/80 mr-2">
            Direct Access:
          </span>
          <button
            type="button"
            onClick={onOpenRoadmap}
            className="px-3 py-1 rounded-lg bg-[#140e0a]/80 border border-white/5 hover:border-orange-500/40 hover:text-white transition-all flex items-center gap-1.5"
          >
            <Compass className="w-3 h-3 text-orange-400" />
            <span>AI Roadmap</span>
          </button>
          <button
            type="button"
            onClick={onOpenPassport}
            className="px-3 py-1 rounded-lg bg-[#140e0a]/80 border border-white/5 hover:border-orange-500/40 hover:text-white transition-all flex items-center gap-1.5"
          >
            <ShieldCheck className="w-3 h-3 text-amber-400" />
            <span>Career Passport</span>
          </button>
          <button
            type="button"
            onClick={onOpenLearningHub}
            className="px-3 py-1 rounded-lg bg-[#140e0a]/80 border border-white/5 hover:border-orange-500/40 hover:text-white transition-all flex items-center gap-1.5"
          >
            <Award className="w-3 h-3 text-orange-300" />
            <span>Verifiable Certificates</span>
          </button>
        </motion.div>
      </motion.div>

      {/* Bottom Architectural Ticker Strip */}
      <div className="w-full max-w-7xl mx-auto pt-8 border-t border-orange-500/15 flex flex-wrap items-center justify-between gap-4 text-[11px] font-mono tracking-widest text-[#9e8f80] uppercase">
        <div className="flex items-center gap-3">
          <span className="w-2 h-2 rounded-full bg-orange-500" />
          <span>SDG 5 & 8 COMPLIANT // GFG SYSTEM</span>
        </div>
        <div className="flex items-center gap-6">
          <span className="hidden sm:inline">TENURE PRESERVED</span>
          <span className="text-orange-500/50 hidden sm:inline">•</span>
          <span>DPDP ACT (INDIA) COMPLIANT</span>
          <span className="text-orange-500/50 hidden md:inline">•</span>
          <span className="text-orange-400 hidden md:inline">100% FREE TO LEARNERS</span>
        </div>
      </div>
    </section>
  );
}
