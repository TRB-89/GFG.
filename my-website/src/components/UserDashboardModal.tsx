"use client";

import React from "react";
import { X, LogOut, ArrowRight, CheckCircle2, Briefcase, Award } from "lucide-react";

interface UserDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: any;
  currentRole: "candidate" | "employer";
  onLogout: () => void;
  applications: any[];
  readinessScore?: number;
  onViewPassport?: () => void;
}

export function UserDashboardModal({
  isOpen,
  onClose,
  currentUser,
  currentRole,
  onLogout,
  applications,
  readinessScore = 82,
  onViewPassport,
}: UserDashboardModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 bg-black/80 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-300">
      <div className="relative w-full max-w-4xl bg-[#181818] text-[#F1E7DB] rounded-xl border border-[#D8C2A6]/15 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Top Header */}
        <div className="px-6 md:px-10 py-5 border-b border-[#D8C2A6]/10 flex items-center justify-between bg-[#181818]/90 backdrop-blur-sm sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-[#A56F7C]" />
            <span className="micro-label">CAREER CONTINUITY // DASHBOARD</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 text-xs font-mono uppercase text-[#9A9A9A] hover:text-[#F1E7DB] transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-white/10 text-[#F1E7DB] transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Dashboard Body */}
        <div className="overflow-y-auto px-6 md:px-12 py-8 space-y-10">
          {/* Hero Greeting (Section 13) */}
          <div className="border-b border-[#D8C2A6]/10 pb-8 space-y-2">
            <span className="micro-label text-[#A56F7C]">
              SESSION // {currentUser?.email || "priya.sharma@example.com"}
            </span>
            <h1 className="text-3xl md:text-5xl font-sans font-light uppercase tracking-tight text-[#F1E7DB] leading-tight">
              WELCOME BACK.
              <br />
              LET&apos;S CONTINUE YOUR COMEBACK.
            </h1>
            <p className="font-serif italic text-base text-[#D8C2A6]/80 pt-1">
              {currentRole === "candidate"
                ? "Active career transition track: 14-month maternity sabbatical preserved with verified tenure."
                : "Recruiter terminal: review returning candidate portfolios and shortlist high-compatibility talent."}
            </p>
          </div>

          {/* Calm Big Numbers (Section 13: Large numbers and minimal text) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-4 border-b border-[#D8C2A6]/10">
            <div className="space-y-1">
              <span className="text-4xl md:text-5xl font-light text-[#F1E7DB] tracking-tight">
                {readinessScore}%
              </span>
              <div className="micro-label-muted">CAREER READINESS</div>
              <span className="text-[10px] font-mono text-[#D8C2A6]">TIER 1 • READY TO RETURN</span>
            </div>

            <div className="space-y-1">
              <span className="text-4xl md:text-5xl font-light text-[#D8C2A6] tracking-tight">
                {applications.length || 1}
              </span>
              <div className="micro-label-muted">MATCHED OPPORTUNITIES</div>
              <span className="text-[10px] font-mono text-[#9A9A9A]">NOVA TECHNOLOGIES</span>
            </div>

            <div className="space-y-1">
              <span className="text-4xl md:text-5xl font-light text-[#A56F7C] tracking-tight">
                03
              </span>
              <div className="micro-label-muted">MENTOR SESSIONS</div>
              <span className="text-[10px] font-mono text-[#D8C2A6]">UPCOMING: THURSDAY</span>
            </div>

            <div className="space-y-1">
              <span className="text-4xl md:text-5xl font-light text-[#F1E7DB] tracking-tight">
                63%
              </span>
              <div className="micro-label-muted">LEARNING PROGRESS</div>
              <span className="text-[10px] font-mono text-[#9A9A9A]">WEEK 4 OF 8 DONE</span>
            </div>
          </div>

          {/* Next Recommended Action */}
          <div className="p-6 rounded-xl bg-[#111111] border border-[#D8C2A6]/15 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="micro-label text-[#A56F7C] block mb-1">NEXT RECOMMENDED ACTION</span>
              <div className="text-base font-medium text-[#F1E7DB]">
                Complete Power BI Capstone Milestone to boost role match to 94%
              </div>
              <div className="text-xs text-[#9A9A9A] mt-1">
                Estimated time: 3 hours • Verified on Career Passport upon submission
              </div>
            </div>

            {onViewPassport && (
              <button
                onClick={onViewPassport}
                className="btn-editorial-primary text-xs shrink-0 self-start sm:self-auto"
              >
                <span>View Passport</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
