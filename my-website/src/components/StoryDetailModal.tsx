"use client";

import React from "react";
import Image from "next/image";
import { X, Calendar, Award, CheckCircle, ArrowRight } from "lucide-react";
import { DataClassificationBadge } from "./DataClassificationBadge";

interface StoryDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function StoryDetailModal({ isOpen, onClose }: StoryDetailModalProps) {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="story-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 bg-black/80 backdrop-blur-sm overflow-y-auto animate-in fade-in"
    >
      <div className="w-full max-w-3xl bg-[#181818] text-[#F1E7DB] rounded-2xl border border-[#D8C2A6]/20 p-6 sm:p-10 relative max-h-[90vh] overflow-y-auto font-sans shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full hover:bg-white/10 text-[#F1E7DB] transition-colors"
          aria-label="Close story detail"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="border-b border-[#D8C2A6]/10 pb-6 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="micro-label text-[#A56F7C]">EDITORIAL CASE STUDY // 06</span>
            <DataClassificationBadge type="simulated_demonstration" size="sm" />
          </div>
          <h2 id="story-modal-title" className="text-3xl sm:text-4xl font-serif italic text-[#F1E7DB]">
            &ldquo;I returned to technology after a four-year career break.&rdquo;
          </h2>
          <div className="text-xs font-mono text-[#D8C2A6] mt-2">
            ELENA ROSTOVA • SENIOR DATA ANALYST @ NOVA TECHNOLOGIES
          </div>
        </div>

        <div className="space-y-6 text-xs font-light leading-relaxed text-[#9A9A9A]">
          <p className="text-sm font-sans text-[#F1E7DB] leading-relaxed">
            Elena stepped away from enterprise Java development in 2020 for maternity and family caregiving. After a 48-month hiatus, the barrier to re-entry seemed insurmountable until she was matched into GFG&apos;s returnship cohort.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-[#111111] border border-[#D8C2A6]/10 font-mono text-[11px] text-[#F1E7DB]">
            <div>
              <span className="text-[#9A9A9A] block uppercase">Pre-Break Tenure</span>
              <span className="font-semibold text-sm">4.0 Years</span>
            </div>
            <div>
              <span className="text-[#9A9A9A] block uppercase">Break Duration</span>
              <span className="font-semibold text-sm text-[#A56F7C]">48 Months</span>
            </div>
            <div>
              <span className="text-[#9A9A9A] block uppercase">Calibrated Prep</span>
              <span className="font-semibold text-sm text-[#D8C2A6]">14 Weeks</span>
            </div>
            <div>
              <span className="text-[#9A9A9A] block uppercase">Returnship Outcome</span>
              <span className="font-semibold text-sm text-emerald-400">Converted Full-time</span>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[#F1E7DB] font-mono">
              Key Transition Pillars
            </h3>
            <div className="space-y-2">
              <div className="p-3 rounded-lg bg-[#111111] border border-[#D8C2A6]/10 flex items-start gap-3">
                <CheckCircle className="w-4 h-4 text-[#D8C2A6] shrink-0 mt-0.5" />
                <div>
                  <span className="text-[#F1E7DB] font-medium font-sans">Tenure Preservation:</span>
                  <span className="text-[#9A9A9A] font-sans ml-1">
                    Her four years of legacy Java architecture were fully recognized by Nova Technologies, preventing demotion to junior status.
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-[#111111] border border-[#D8C2A6]/10 flex items-start gap-3">
                <CheckCircle className="w-4 h-4 text-[#A56F7C] shrink-0 mt-0.5" />
                <div>
                  <span className="text-[#F1E7DB] font-medium font-sans">Precision Upskilling:</span>
                  <span className="text-[#9A9A9A] font-sans ml-1">
                    Instead of re-learning computer science basics, Elena focused strictly on SQL window functions, Pandas dataframes, and Power BI dashboards.
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#111111] border border-[#D8C2A6]/10 font-mono text-[11px] text-[#D8C2A6]">
            &ldquo;The most critical asset was the Career Continuity Passport. Having an audited document stating my pre-break accomplishments gave me the confidence to negotiate from strength.&rdquo;
          </div>
        </div>

        <div className="mt-8 pt-4 border-t border-[#D8C2A6]/10 flex justify-end">
          <button onClick={onClose} className="btn-editorial-primary text-xs">
            Close Case Study
          </button>
        </div>
      </div>
    </div>
  );
}
