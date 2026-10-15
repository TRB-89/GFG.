"use client";

import React from "react";
import {
  Compass,
  BookOpen,
  Briefcase,
  HeartHandshake,
  DollarSign,
  Users,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { useTranslation, AiTranslationDisclaimer } from "@/lib/i18n/LanguageContext";

interface GuidedAssistanceSectionProps {
  onRoute: (action: string) => void;
}

export function GuidedAssistanceSection({ onRoute }: GuidedAssistanceSectionProps) {
  const { t } = useTranslation();

  const PATHWAYS = [
    {
      id: "opt1",
      icon: Compass,
      title: t("guided.opt1.title"),
      badge: t("guided.opt1.badge"),
      desc: t("guided.opt1.desc"),
      action: t("guided.opt1.action"),
      target: "open_onboarding",
      highlightColor: "text-amber-300",
      borderColor: "hover:border-amber-400/40",
      accentBg: "bg-amber-400/10",
    },
    {
      id: "opt2",
      icon: BookOpen,
      title: t("guided.opt2.title"),
      badge: t("guided.opt2.badge"),
      desc: t("guided.opt2.desc"),
      action: t("guided.opt2.action"),
      target: "open_roadmap",
      highlightColor: "text-[#D8C2A6]",
      borderColor: "hover:border-[#D8C2A6]/50",
      accentBg: "bg-[#D8C2A6]/10",
    },
    {
      id: "opt3",
      icon: Briefcase,
      title: t("guided.opt3.title"),
      badge: t("guided.opt3.badge"),
      desc: t("guided.opt3.desc"),
      action: t("guided.opt3.action"),
      target: "open_opportunities",
      highlightColor: "text-emerald-300",
      borderColor: "hover:border-emerald-400/40",
      accentBg: "bg-emerald-400/10",
    },
    {
      id: "opt4",
      icon: HeartHandshake,
      title: t("guided.opt4.title"),
      badge: t("guided.opt4.badge"),
      desc: t("guided.opt4.desc"),
      action: t("guided.opt4.action"),
      target: "open_flexible_filter",
      highlightColor: "text-[#A56F7C]",
      borderColor: "hover:border-[#A56F7C]/50",
      accentBg: "bg-[#A56F7C]/10",
    },
    {
      id: "opt5",
      icon: DollarSign,
      title: t("guided.opt5.title"),
      badge: t("guided.opt5.badge"),
      desc: t("guided.opt5.desc"),
      action: t("guided.opt5.action"),
      target: "open_entrepreneurship",
      highlightColor: "text-[#F1E7DB]",
      borderColor: "hover:border-[#F1E7DB]/40",
      accentBg: "bg-[#F1E7DB]/10",
    },
    {
      id: "opt6",
      icon: Users,
      title: t("guided.opt6.title"),
      badge: t("guided.opt6.badge"),
      desc: t("guided.opt6.desc"),
      action: t("guided.opt6.action"),
      target: "open_mentorship",
      highlightColor: "text-rose-300",
      borderColor: "hover:border-rose-400/40",
      accentBg: "bg-rose-400/10",
    },
  ];

  return (
    <section
      id="guided-assistance"
      aria-labelledby="guided-assistance-heading"
      className="py-16 md:py-24 relative overflow-hidden bg-[#131313] border-y border-[#D8C2A6]/10"
    >
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[300px] bg-[#A56F7C]/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="flex items-center justify-center gap-2 mb-3">
            <span className="micro-label text-[10px] text-[#A56F7C] tracking-[0.24em]">
              {t("guided.title")}
            </span>
            <AiTranslationDisclaimer />
          </div>
          <h2
            id="guided-assistance-heading"
            className="text-2xl sm:text-4xl md:text-5xl font-serif text-[#F1E7DB] tracking-tight leading-tight"
          >
            {t("guided.question")}
          </h2>
          <p className="mt-4 text-xs sm:text-sm text-[#9A9A9A] max-w-xl mx-auto leading-relaxed">
            {t("guided.subtitle")}
          </p>
        </div>

        {/* 6 Prominent Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {PATHWAYS.map((p) => {
            const Icon = p.icon;
            return (
              <div
                key={p.id}
                className={`group relative rounded-2xl p-6 sm:p-7 bg-[#181818]/90 border border-[#D8C2A6]/15 ${p.borderColor} transition-all duration-300 hover:-translate-y-1 hover:shadow-xl flex flex-col justify-between`}
              >
                <div>
                  {/* Badge & Icon Row */}
                  <div className="flex items-center justify-between mb-4">
                    <span
                      className={`text-[10px] font-mono uppercase tracking-wider px-2.5 py-1 rounded-full ${p.accentBg} ${p.highlightColor} border border-[#D8C2A6]/10`}
                    >
                      {p.badge}
                    </span>
                    <div
                      className={`w-9 h-9 rounded-full ${p.accentBg} flex items-center justify-center ${p.highlightColor}`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>

                  {/* Question Title */}
                  <h3 className="text-base sm:text-lg font-serif text-[#F1E7DB] mb-2.5 group-hover:text-[#D8C2A6] transition-colors">
                    {p.title}
                  </h3>

                  {/* Empathetic Description */}
                  <p className="text-xs text-[#9A9A9A] leading-relaxed mb-6">
                    {p.desc}
                  </p>
                </div>

                {/* Direct Action Button */}
                <button
                  type="button"
                  onClick={() => onRoute(p.target)}
                  aria-label={`${p.action} for ${p.title}`}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#222] hover:bg-[#D8C2A6] hover:text-[#111111] border border-[#D8C2A6]/20 text-[#D8C2A6] text-xs font-semibold uppercase tracking-wider transition-all flex items-center justify-between group-hover:border-[#D8C2A6]"
                >
                  <span>{p.action}</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
