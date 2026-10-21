"use client";

import React, { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowRight, BookOpen, Users, Briefcase, Award, CheckCircle2, Sparkles, Compass } from "lucide-react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface PinnedEditorialStoryProps {
  onOpenLearningHub: () => void;
  onOpenMentorship: () => void;
  onOpenJobs: () => void;
  onStartComeback: () => void;
}

interface EditorialPanel {
  id: string;
  chapterNumber: string;
  chapterTag: string;
  headline: string;
  subheadline: string;
  body: string;
  highlightStat: string;
  highlightLabel: string;
  actionText: string;
  actionType: "learning" | "mentorship" | "jobs" | "comeback";
  accentColor: string;
}

const PANELS: EditorialPanel[] = [
  {
    id: "panel-1",
    chapterNumber: "01",
    chapterTag: "ARCHIVE // THE FOUNDATION",
    headline: "YOUR PAST IS YOUR FOUNDATION.",
    subheadline: "CELEBRATE YOUR HARD-WON MASTERY.",
    body: "Years of engineering architecture, financial modeling, team leadership, and creative problem-solving do not vanish. They remain the bedrock upon which your comeback is built.",
    highlightStat: "100%",
    highlightLabel: "Verified Pre-Break Tenure Preserved",
    actionText: "Activate Career Continuity Passport",
    actionType: "comeback",
    accentColor: "#D8B58C",
  },
  {
    id: "panel-2",
    chapterNumber: "02",
    chapterTag: "REFRAME // THE SABBATICAL",
    headline: "A PAUSE DOESN'T ERASE POTENTIAL.",
    subheadline: "RESILIENCE AND PERSPECTIVE HONED.",
    body: "Maternity, caregiving, and health sabbaticals are masterclasses in crisis management, endurance, and empathy. At GFG, career pauses are treated with complete dignity and zero algorithmic penalties.",
    highlightStat: "0%",
    highlightLabel: "Career Gap Penalties in AI Matching",
    actionText: "Explore GFG Dignity Charter",
    actionType: "comeback",
    accentColor: "#B66C4B",
  },
  {
    id: "panel-3",
    chapterNumber: "03",
    chapterTag: "ACCELERATE // THE HUB",
    headline: "LEARN AT YOUR OWN PACE.",
    subheadline: "MODERN STACKS MADE ACCESSIBLE.",
    body: "Update your technical muscle memory with compact crash courses, live code sandboxes, and government-recognized micro-credentials designed for flexible schedules.",
    highlightStat: "18+ Hrs",
    highlightLabel: "Interactive Practical Labs & Video Curricula",
    actionText: "Launch GFG Learning Hub",
    actionType: "learning",
    accentColor: "#D8B58C",
  },
  {
    id: "panel-4",
    chapterNumber: "04",
    chapterTag: "ALLIANCE // COMMUNITY",
    headline: "GUIDANCE THAT MOVES WITH YOU.",
    subheadline: "1:1 SESSIONS WITH LEADERS WHO RETURNED.",
    body: "Work directly with accomplished executive mentors who made the journey back themselves. Receive unvarnished portfolio feedback, narrative coaching, and mock interview drills.",
    highlightStat: "1:1",
    highlightLabel: "Dedicated Executive Alumna Mentorship",
    actionText: "Connect with Verified Mentors",
    actionType: "mentorship",
    accentColor: "#B66C4B",
  },
  {
    id: "panel-5",
    chapterNumber: "05",
    chapterTag: "TRIUMPH // OPPORTUNITIES",
    headline: "OPPORTUNITIES THAT SEE YOUR VALUE.",
    subheadline: "VERIFIED RETURNSHIPS WITH PARITY.",
    body: "Access direct applications to structured returnships with vetted employer partners who commit to transparent stipends, supportive team cohorts, and permanent retention.",
    highlightStat: "94%",
    highlightLabel: "Average Conversion to Permanent Offers",
    actionText: "Browse Returnship Opportunities",
    actionType: "jobs",
    accentColor: "#F4EDE3",
  },
];

export function PinnedEditorialStory({
  onOpenLearningHub,
  onOpenMentorship,
  onOpenJobs,
  onStartComeback,
}: PinnedEditorialStoryProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const panelsWrapperRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState<number>(0);

  useEffect(() => {
    const container = containerRef.current;
    const panelsWrapper = panelsWrapperRef.current;
    if (!container || !panelsWrapper) return;

    let st: ScrollTrigger | null = null;
    const ctx = gsap.context(() => {
      st = ScrollTrigger.create({
        trigger: container,
        start: "top top",
        end: "+=360%",
        pin: true,
        scrub: 0.8,
        onUpdate: (self) => {
          const progress = self.progress;
          const totalPanels = PANELS.length;
          const index = Math.min(totalPanels - 1, Math.floor(progress * totalPanels));
          setActiveIndex(index);
        },
      });
    }, container);

    return () => {
      if (st) st.kill();
      ctx.revert();
    };
  }, []);

  const handleAction = (type: "learning" | "mentorship" | "jobs" | "comeback") => {
    switch (type) {
      case "learning":
        onOpenLearningHub();
        break;
      case "mentorship":
        onOpenMentorship();
        break;
      case "jobs":
        onOpenJobs();
        break;
      case "comeback":
        onStartComeback();
        break;
    }
  };

  const currentPanel = PANELS[activeIndex];

  return (
    <section
      ref={containerRef}
      id="editorial-story"
      className="relative w-full h-screen overflow-hidden bg-[#171310] select-none flex items-center justify-center"
    >
      {/* Background Architectural Geometry Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(216,181,140,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(216,181,140,0.03)_1px,transparent_1px)] bg-[size:100px_100px] pointer-events-none" />

      {/* Atmospheric Radial Gradient */}
      <div
        className="absolute w-[800px] h-[800px] rounded-full blur-[160px] pointer-events-none transition-all duration-700"
        style={{
          background: `radial-gradient(circle, ${currentPanel.accentColor}18 0%, transparent 70%)`,
          top: "30%",
          left: activeIndex % 2 === 0 ? "15%" : "55%",
        }}
      />

      {/* Main Pinned Content Display */}
      <div
        ref={panelsWrapperRef}
        className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-12 lg:px-16 h-full flex flex-col justify-between py-16 sm:py-20"
      >
        {/* Top Header & Chapter Pill */}
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-[#221B17]/90 border border-[#D8B58C]/30 backdrop-blur-md">
            <span
              className="w-2 h-2 rounded-full animate-pulse"
              style={{ backgroundColor: currentPanel.accentColor }}
            />
            <span className="text-[10px] sm:text-xs font-mono uppercase tracking-[0.22em] text-[#D8B58C] font-semibold">
              {currentPanel.chapterTag}
            </span>
          </div>

          <div className="text-[11px] font-mono text-[#A89B90] tracking-widest hidden sm:block">
            CHAPTER {currentPanel.chapterNumber} // 05
          </div>
        </div>

        {/* Center Editorial Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center my-auto">
          {/* Left Column: Narrative Headline & Text */}
          <div className="lg:col-span-7 space-y-6">
            <div className="space-y-2">
              <span className="text-xs font-mono uppercase tracking-[0.24em] text-[#B66C4B] font-semibold block">
                {currentPanel.subheadline}
              </span>
              <h2
                key={currentPanel.headline}
                className="text-4xl sm:text-5xl md:text-6xl lg:text-[4.2rem] font-light tracking-tighter leading-[0.96] text-[#F4EDE3] uppercase transition-all duration-500 animate-fadeIn"
              >
                {currentPanel.headline}
              </h2>
            </div>

            <p
              key={currentPanel.body}
              className="text-sm sm:text-base md:text-lg text-[#A89B90] font-light leading-relaxed max-w-xl transition-all duration-500 delay-100 animate-fadeIn"
            >
              {currentPanel.body}
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-4">
              <button
                onClick={() => handleAction(currentPanel.actionType)}
                className="px-7 py-3.5 rounded-full bg-[#D8B58C] hover:bg-[#F4EDE3] text-[#171310] font-bold text-xs uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(216,181,140,0.3)] flex items-center gap-2 hover:scale-[1.03]"
              >
                <span>{currentPanel.actionText}</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>
          </div>

          {/* Right Column: Sculptural Metric & Editorial Highlight Card */}
          <div className="lg:col-span-5 flex justify-center">
            <div
              key={currentPanel.id}
              className="w-full max-w-md p-8 sm:p-10 rounded-2xl bg-[#221B17]/80 border border-[#D8B58C]/25 backdrop-blur-xl shadow-2xl relative overflow-hidden transition-all duration-500 animate-fadeIn"
            >
              {/* Corner Watermark */}
              <div className="absolute top-4 right-6 text-6xl font-light text-[#D8B58C]/10 font-mono select-none">
                {currentPanel.chapterNumber}
              </div>

              <div className="space-y-4">
                <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#D8B58C] block">
                  QUANTIFIED IMPACT //
                </span>

                <div
                  className="text-5xl sm:text-6xl font-light tracking-tight transition-all duration-500 font-mono"
                  style={{ color: currentPanel.accentColor }}
                >
                  {currentPanel.highlightStat}
                </div>

                <p className="text-xs sm:text-sm text-[#F4EDE3] font-medium leading-relaxed">
                  {currentPanel.highlightLabel}
                </p>

                <div className="pt-4 border-t border-[#3A2A22] flex items-center justify-between text-[11px] font-mono text-[#A89B90]">
                  <span>GFG VERIFIED STANDARD</span>
                  <Sparkles className="w-3.5 h-3.5 text-[#D8B58C]" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Editorial Chapter Rail */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-[#A89B90] pb-1">
            <span>INDEX // FIVE EDITORIAL CHAPTERS</span>
            <span>{Math.round(((activeIndex + 1) / PANELS.length) * 100)}% EXPLORED</span>
          </div>

          <div className="grid grid-cols-5 gap-2 sm:gap-3">
            {PANELS.map((p, idx) => {
              const isCurrent = activeIndex === idx;
              const isPast = activeIndex > idx;
              return (
                <div
                  key={p.id}
                  className={`h-1.5 rounded-full transition-all duration-500 ${
                    isCurrent
                      ? "bg-[#D8B58C] shadow-[0_0_10px_#D8B58C]"
                      : isPast
                      ? "bg-[#59382D]"
                      : "bg-[#2A201B]"
                  }`}
                />
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
