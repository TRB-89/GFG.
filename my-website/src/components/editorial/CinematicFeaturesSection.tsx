"use client";

import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import {
  Brain,
  BookOpen,
  FileCheck2,
  Briefcase,
  Users,
  Award,
  ArrowRight,
  Sparkles,
} from "lucide-react";

interface CinematicFeaturesSectionProps {
  onOpenRoadmap: () => void;
  onOpenLearningHub: () => void;
  onOpenPassport: () => void;
  onOpenJobs: () => void;
  onOpenCommunity: (tab?: any) => void;
}

export function CinematicFeaturesSection({
  onOpenRoadmap,
  onOpenLearningHub,
  onOpenPassport,
  onOpenJobs,
  onOpenCommunity,
}: CinematicFeaturesSectionProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 35 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.75, ease: [0.16, 1, 0.3, 1] as const },
    },
  };

  const FEATURES = [
    {
      id: "roadmap",
      num: "01",
      icon: Brain,
      title: "AI Career Roadmap",
      subtitle: "Non-Punitive Skill Calibration",
      desc: "Our intelligent engine analyzes your past tenure and current market gaps, creating custom microlearning paths that skip concepts you already know.",
      actionText: "Generate Roadmap",
      action: onOpenRoadmap,
      badge: "Adaptive Engine",
      glowColor: "from-orange-500/15 via-amber-500/05",
    },
    {
      id: "learning",
      num: "02",
      icon: BookOpen,
      title: "Learning Hub & Academy",
      subtitle: "Free, Authentic Practical Courses",
      desc: "Complete structured curricula in Workplace Digital Skills, Modern Excel & Data Analysis, and Career Comeback Readiness with video guidance and worksheets.",
      actionText: "Enter Learning Hub",
      action: onOpenLearningHub,
      badge: "Free Courses",
      glowColor: "from-amber-500/15 via-orange-500/05",
    },
    {
      id: "passport",
      num: "03",
      icon: FileCheck2,
      title: "Resume Rebuild & Passport",
      subtitle: "Tamper-Evident Career Passport",
      desc: "Reframe your break into a skills-first dossier. Fully compliant with India's DPDP Act 2023, granting you complete privacy consent controls.",
      actionText: "View Career Passport",
      action: onOpenPassport,
      badge: "DPDP Protected",
      glowColor: "from-orange-600/15 via-rose-500/05",
    },
    {
      id: "opportunities",
      num: "04",
      icon: Briefcase,
      title: "Verified Opportunities",
      subtitle: "Protected Returnships & Flexible Roles",
      desc: "Explore curated returnship tracks with transparent stipends, flexible work agreements (remote, hybrid, flexible hours), and genuine paths to full tenure.",
      actionText: "Browse Opportunities",
      action: onOpenJobs,
      badge: "Fair Compensation",
      glowColor: "from-amber-600/15 via-yellow-500/05",
    },
    {
      id: "mentorship",
      num: "05",
      icon: Users,
      title: "Executive Mentorship",
      subtitle: "1:1 Guidance & Comeback Circles",
      desc: "Connect with verified senior leaders who successfully navigated career hiatuses. Join peer circles for mock interviews, salary negotiation, and moral support.",
      actionText: "Connect with Mentors",
      action: () => onOpenCommunity("mentors"),
      badge: "Verified Leaders",
      glowColor: "from-orange-500/15 via-amber-600/05",
    },
    {
      id: "certificates",
      num: "06",
      icon: Award,
      title: "Certificate System",
      subtitle: "Authentic GFG-Issued Credentials",
      desc: "Earn high-resolution A4 landscape PDF certificates backed by server-side quiz scoring, mentor-approved projects, and public QR verification routes.",
      actionText: "Verify Certificates",
      action: onOpenLearningHub,
      badge: "Tamper-Proof QR",
      glowColor: "from-amber-500/15 via-orange-500/05",
    },
  ];

  return (
    <section
      id="features"
      ref={ref}
      className="relative min-h-screen w-full flex flex-col justify-center py-28 px-6 sm:px-12 md:px-16 lg:px-20 z-10 border-t border-orange-500/15 overflow-hidden"
    >
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 right-1/4 w-[600px] h-[600px] bg-amber-500/08 rounded-full blur-[170px] pointer-events-none" />

      <div className="max-w-7xl mx-auto w-full space-y-16">
        {/* Section Header */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="space-y-4 max-w-3xl"
        >
          <motion.div variants={itemVariants} className="flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-orange-500" />
            <span className="text-[11px] font-mono uppercase tracking-[0.26em] text-orange-400 font-semibold">
              03 // COMPREHENSIVE ARCHITECTURE
            </span>
          </motion.div>

          <motion.h2
            variants={itemVariants}
            className="text-4xl sm:text-6xl md:text-7xl font-light tracking-tight text-[#fcf8f2] leading-[1.02]"
          >
            THE SIX PILLARS OF YOUR{" "}
            <span className="text-gradient-amber italic font-serif">
              CAREER COMEBACK.
            </span>
          </motion.h2>

          <motion.p
            variants={itemVariants}
            className="text-base sm:text-lg text-[#b8a796] font-light leading-relaxed"
          >
            Every tool on GFG is intentionally engineered to eliminate the friction, stigma, and vulnerability 
            of returning to the workforce.
          </motion.p>
        </motion.div>

        {/* 6 Spacious Luxury Feature Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8"
        >
          {FEATURES.map((feature) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.id}
                variants={itemVariants}
                className="card-editorial-glow rounded-3xl p-8 sm:p-9 flex flex-col justify-between space-y-8 relative overflow-hidden group hover:border-orange-500/40"
              >
                {/* Ambient Top Glow */}
                <div
                  className={`absolute -top-16 -right-16 w-48 h-48 bg-gradient-to-br ${feature.glowColor} to-transparent rounded-full blur-2xl group-hover:scale-125 transition-transform duration-700 pointer-events-none`}
                />

                <div className="space-y-6 relative z-10">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono tracking-widest text-orange-400 font-semibold">
                      {feature.num} //
                    </span>
                    <span className="px-3 py-1 rounded-full text-[10px] font-mono tracking-wider bg-orange-500/10 border border-orange-500/20 text-orange-300">
                      {feature.badge}
                    </span>
                  </div>

                  <div className="w-14 h-14 rounded-2xl bg-[#1d140e] border border-orange-500/25 flex items-center justify-center text-orange-400 group-hover:border-orange-400 group-hover:scale-105 transition-all duration-300">
                    <Icon className="w-7 h-7" />
                  </div>

                  <div className="space-y-1.5">
                    <h3 className="text-2xl font-serif text-[#fcf8f2] tracking-wide group-hover:text-amber-200 transition-colors">
                      {feature.title}
                    </h3>
                    <div className="text-[11px] font-mono text-orange-300/80 uppercase tracking-wider">
                      {feature.subtitle}
                    </div>
                  </div>

                  <p className="text-sm text-[#b5a596] leading-relaxed font-light">
                    {feature.desc}
                  </p>
                </div>

                <div className="pt-4 border-t border-white/5 relative z-10">
                  <button
                    type="button"
                    onClick={feature.action}
                    className="w-full py-3 px-4 rounded-xl bg-[#1c130d] hover:bg-orange-500/15 border border-orange-500/25 hover:border-orange-400 text-xs font-mono uppercase tracking-wider text-orange-200 hover:text-white transition-all flex items-center justify-between group/btn"
                  >
                    <span>{feature.actionText}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-orange-400 group-hover/btn:translate-x-1 transition-transform" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
