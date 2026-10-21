"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  Sparkles,
  ShieldCheck,
  HeartHandshake,
  Lock,
  ChevronRight,
  Globe2,
} from "lucide-react";

interface CinematicFinalCTAProps {
  onStartComeback: () => void;
  onOpenLearningHub: () => void;
  onOpenOpportunities?: () => void;
  onOpenRoadmap?: () => void;
  onOpenScoring?: () => void;
  onOpenAdmin?: () => void;
  onOpenGovernmentPilot?: () => void;
}

export function CinematicFinalCTA({
  onStartComeback,
  onOpenLearningHub,
  onOpenOpportunities,
  onOpenRoadmap,
  onOpenScoring,
  onOpenAdmin,
  onOpenGovernmentPilot,
}: CinematicFinalCTAProps) {
  return (
    <section className="relative min-h-screen w-full flex flex-col justify-between pt-28 pb-12 px-6 sm:px-12 md:px-16 lg:px-24 z-10 overflow-hidden">
      {/* Background Radial Amber Halo */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] md:w-[1100px] h-[550px] bg-gradient-to-tr from-[#ea580c]/18 via-[#f59e0b]/10 to-transparent rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] bg-[#9a3412]/15 rounded-full blur-[120px] pointer-events-none" />

      {/* Decorative Editorial Border Top */}
      <div className="w-full h-px bg-gradient-to-r from-transparent via-[#ea580c]/30 to-transparent mb-16" />

      {/* Center Stage Emotional Call To Action */}
      <div className="relative max-w-5xl mx-auto my-auto text-center flex flex-col items-center">
        {/* Subtle Pill */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-[#ea580c]/15 to-[#f59e0b]/15 border border-[#ea580c]/30 text-xs uppercase tracking-widest text-[#fed7aa] font-medium backdrop-blur-md mb-8"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#fb923c]" />
          <span>Your Return Begins Here • 100% Free &amp; Verified</span>
        </motion.div>

        {/* Grand Headline */}
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-serif font-bold tracking-tight text-[#fef3c7] leading-[1.08] mb-8"
        >
          Your break does not <br />
          <span className="italic font-light text-gradient-amber">
            define your limit.
          </span>{" "}
          <br />
          Your ambition does.
        </motion.h2>

        {/* Narrative Emotional Subtext */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="max-w-2xl text-base sm:text-lg md:text-xl text-[#d6d3d1]/85 font-light leading-relaxed mb-12"
        >
          Over 14,200 women across India and beyond have reclaimed their independence,
          salary equity, and professional respect through GFG. No fees, no judgment,
          no automated rejection. Just real skills, tailored roadmaps, and verified returnships.
        </motion.p>

        {/* Dual Primary CTA Action */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 w-full sm:w-auto"
        >
          <button
            onClick={onStartComeback}
            className="w-full sm:w-auto group relative inline-flex items-center justify-center gap-3 px-10 py-5 rounded-full bg-gradient-to-r from-[#ea580c] via-[#f97316] to-[#f59e0b] text-[#0c0a09] font-semibold text-base sm:text-lg shadow-[0_0_50px_rgba(234,88,12,0.5)] hover:shadow-[0_0_70px_rgba(245,158,11,0.7)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
          >
            <span>Start Your Comeback</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform duration-300" />
          </button>

          <button
            onClick={onOpenLearningHub}
            className="w-full sm:w-auto group inline-flex items-center justify-center gap-3 px-8 py-5 rounded-full bg-[#1c1917]/70 hover:bg-[#292524]/80 text-[#fed7aa] font-medium text-base sm:text-lg border border-[#ea580c]/30 hover:border-[#ea580c]/60 backdrop-blur-md transition-all duration-300"
          >
            <BookOpen className="w-5 h-5 text-[#fb923c]" />
            <span>Explore Learning Hub</span>
            <ChevronRight className="w-4 h-4 text-[#78716c] group-hover:text-[#fed7aa] group-hover:translate-x-1 transition-all" />
          </button>
        </motion.div>

        {/* Assurance Badges */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 mt-16 pt-8 border-t border-[#292524]/70 max-w-3xl w-full text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#ea580c]/10 border border-[#ea580c]/30 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4 text-[#fb923c]" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-[#a8a29e] font-medium">100% Free LMS</p>
              <p className="text-sm text-[#f5f5f4] font-medium">Zero Hidden Charges Ever</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#ea580c]/10 border border-[#ea580c]/30 flex items-center justify-center shrink-0">
              <Lock className="w-4 h-4 text-[#fb923c]" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-[#a8a29e] font-medium">Confidential &amp; Safe</p>
              <p className="text-sm text-[#f5f5f4] font-medium">DPDP Act 2023 Compliant</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#ea580c]/10 border border-[#ea580c]/30 flex items-center justify-center shrink-0">
              <HeartHandshake className="w-4 h-4 text-[#fb923c]" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-[#a8a29e] font-medium">Vetted Employers</p>
              <p className="text-sm text-[#f5f5f4] font-medium">120+ Returnship Partners</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Editorial Footer Bottom Band */}
      <footer className="w-full mt-24 pt-12 border-t border-[#292524]/60 text-xs text-[#a8a29e] flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
          <div className="flex items-center gap-2 text-sm font-serif font-bold text-[#fef3c7]">
            <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-tr from-[#ea580c] to-[#f59e0b] inline-block shadow-[0_0_10px_#ea580c]" />
            <span>GFG</span>
            <span className="text-xs text-[#78716c] font-sans font-normal tracking-wide">GAP FOR GOOD</span>
          </div>
          <span className="hidden sm:inline text-[#44403c]">•</span>
          <p className="text-[#78716c]">
            The Career Comeback &amp; Learning Platform for Returning Women.
          </p>
        </div>

        <div className="flex items-center gap-6 text-[#a8a29e] flex-wrap justify-center">
          <button
            onClick={onOpenLearningHub}
            className="hover:text-[#fed7aa] transition-colors"
          >
            Learning Hub
          </button>
          {onOpenRoadmap && (
            <button
              onClick={onOpenRoadmap}
              className="hover:text-[#fed7aa] transition-colors"
            >
              AI Roadmap
            </button>
          )}
          {onOpenOpportunities && (
            <button
              onClick={onOpenOpportunities}
              className="hover:text-[#fed7aa] transition-colors"
            >
              Verified Roles
            </button>
          )}
          {onOpenScoring && (
            <button
              onClick={onOpenScoring}
              className="hover:text-[#fed7aa] transition-colors"
            >
              Scoring Disclosures
            </button>
          )}
          {onOpenAdmin && (
            <button
              onClick={onOpenAdmin}
              className="hover:text-[#fed7aa] transition-colors"
            >
              Governance
            </button>
          )}
          {onOpenGovernmentPilot && (
            <button
              onClick={onOpenGovernmentPilot}
              className="hover:text-[#fed7aa] transition-colors"
            >
              Gov Pilot
            </button>
          )}
          <a href="#mission" className="hover:text-[#fed7aa] transition-colors">
            Our Mission
          </a>
          <span className="text-[#44403c]">•</span>
          <span className="text-[#78716c]">© {new Date().getFullYear()} GFG — All Rights Reserved</span>
        </div>
      </footer>
    </section>
  );
}
