"use client";

import React, { useState } from "react";
import { X, LogOut, ArrowRight, Shield, Lock, Eye, EyeOff, CheckCircle, Download, Trash2, RotateCcw, AlertTriangle, FileCode, Sparkles } from "lucide-react";
import { DEMO_PERSONA, DEMO_METRICS } from "@/lib/demoPersona";
import { DataClassificationBadge } from "./DataClassificationBadge";
import { privacyApi, responsibleAiApi } from "@/lib/api";

interface UserDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: { id?: string; full_name?: string; email?: string; role?: string } | null;
  currentRole: string;
  onLogout: () => void;
  applications: Array<{ id: string; title?: string; status: string }>;
  readinessScore?: number;
  onViewPassport?: () => void;
  onOpenOnboarding?: () => void;
  onOpenDigitalTwin?: () => void;
  onOpenSimulator?: () => void;
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
  onOpenOnboarding,
  onOpenDigitalTwin,
  onOpenSimulator,
}: UserDashboardModalProps) {
  const [profileVisibility, setProfileVisibility] = useState<"private" | "employers">(
    DEMO_PERSONA.privacy.profile_visibility === "public" ? "employers" : DEMO_PERSONA.privacy.profile_visibility
  );
  const [passportConsent, setPassportConsent] = useState(DEMO_PERSONA.privacy.passport_sharing_consent);
  const [shareBreakReason, setShareBreakReason] = useState(DEMO_PERSONA.privacy.career_break_optional_shared);
  const [privacySaved, setPrivacySaved] = useState(false);
  const [privacyMessage, setPrivacyMessage] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [optOutRanking, setOptOutRanking] = useState(false);
  const [erasurePending, setErasurePending] = useState(false);

  if (!isOpen) return null;

  const handleSavePrivacy = async () => {
    setPrivacySaved(true);
    await privacyApi.updateConsentSettings({
      career_break_visibility: profileVisibility,
      allow_mentor_sharing: passportConsent,
      allow_ai_matching: !optOutRanking
    });
    setPrivacyMessage("Consent preferences updated and logged per DPDP Act 2023.");
    setTimeout(() => {
      setPrivacySaved(false);
      setPrivacyMessage(null);
    }, 4000);
  };

  const handleExportData = async () => {
    setIsExporting(true);
    try {
      const res = await privacyApi.exportData();
      const exportJson = JSON.stringify(res.data || res, null, 2);
      const blob = new Blob([exportJson], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `gfg_personal_data_export_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setPrivacyMessage("Data portability bundle generated and downloaded successfully.");
    } catch {
      setPrivacyMessage("Export failed or network offline.");
    } finally {
      setIsExporting(false);
      setTimeout(() => setPrivacyMessage(null), 4000);
    }
  };

  const handleRevokeAll = async () => {
    await privacyApi.revokeAllConsent();
    setProfileVisibility("private");
    setPassportConsent(false);
    setShareBreakReason(false);
    setOptOutRanking(true);
    setPrivacyMessage("All external data sharing consents revoked immediately. Status set to private.");
    setTimeout(() => setPrivacyMessage(null), 5000);
  };

  const handleErasureRequest = async () => {
    await privacyApi.submitErasureRequest("Candidate requested account deletion per DPDP Act.");
    setErasurePending(true);
    setPrivacyMessage("Account deletion & data erasure request logged with Data Grievance Officer (SLA: 7 business days).");
    setTimeout(() => setPrivacyMessage(null), 5000);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="dashboard-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 bg-black/80 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-300"
    >
      <div className="relative w-full max-w-4xl bg-[#181818] text-[#F1E7DB] rounded-2xl border border-[#D8C2A6]/15 overflow-hidden my-auto max-h-[92vh] flex flex-col font-sans shadow-2xl">
        {/* Top Header */}
        <div className="px-6 md:px-10 py-5 border-b border-[#D8C2A6]/10 flex items-center justify-between bg-[#181818]/90 backdrop-blur-sm sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-[#A56F7C]" />
            <span className="micro-label">CAREER CONTINUITY // DASHBOARD</span>
            <DataClassificationBadge type="simulated_demonstration" size="sm" />
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
          {/* Hero Greeting */}
          <div className="border-b border-[#D8C2A6]/10 pb-8 space-y-2">
            <span className="micro-label text-[#A56F7C]">
              SESSION // {currentUser?.email || DEMO_PERSONA.email}
            </span>
            <h1 id="dashboard-modal-title" className="text-3xl md:text-5xl font-sans font-light uppercase tracking-tight text-[#F1E7DB] leading-tight">
              WELCOME BACK, {currentUser?.full_name ? currentUser.full_name.split(" ")[0].toUpperCase() : "ANANYA"}.
              <br />
              <span className="text-[#D8C2A6] italic font-serif lowercase">let&apos;s continue your comeback.</span>
            </h1>
            <p className="font-serif italic text-base text-[#D8C2A6]/80 pt-1">
              {currentRole === "candidate"
                ? `Active transition track: ${DEMO_METRICS.preBreakFormatted} pre-break tenure preserved across ${DEMO_METRICS.breakDurationFormatted} sabbatical.`
                : "Recruiter desk: review returning candidate portfolios and shortlist high-compatibility talent."}
            </p>
          </div>

          {/* Calm Big Numbers */}
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
              <span className="text-[10px] font-mono text-[#D8C2A6]">DR. MEERA IYER</span>
            </div>

            <div className="space-y-1">
              <span className="text-4xl md:text-5xl font-light text-[#F1E7DB] tracking-tight">
                63%
              </span>
              <div className="micro-label-muted">LEARNING PROGRESS</div>
              <span className="text-[10px] font-mono text-[#9A9A9A]">WEEK 4 OF 8 DONE</span>
            </div>
          </div>

          {/* Privacy & Consent Panel (Task 7) */}
          <div className="p-6 rounded-xl bg-[#111111] border border-[#D8C2A6]/15 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-[#D8C2A6]" />
                <span className="micro-label text-[#F1E7DB]">PRIVACY & CONSENT SETTINGS</span>
              </div>
              {privacySaved && (
                <span className="text-xs font-mono text-emerald-400 flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" /> Saved
                </span>
              )}
            </div>

            <p className="text-xs text-[#9A9A9A] font-light">
              Your profile is private by default. Control exactly who can view your credentials, verified passport, and career break context.
            </p>

            <div className="space-y-3 font-mono text-xs pt-2">
              <label className="flex items-center justify-between p-3 rounded-lg bg-[#181818] border border-[#D8C2A6]/10 cursor-pointer">
                <div>
                  <span className="text-[#F1E7DB] block font-medium">Profile Visibility</span>
                  <span className="text-[11px] text-[#9A9A9A]">
                    {profileVisibility === "private"
                      ? "Private — Only visible to you"
                      : "Shared with Verified Returnship Employers"}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const next = profileVisibility === "private" ? "employers" : "private";
                    setProfileVisibility(next);
                    handleSavePrivacy();
                  }}
                  className={`px-3 py-1 rounded-full text-[10px] font-semibold transition-all ${
                    profileVisibility === "private"
                      ? "bg-[#242424] text-[#D8C2A6] border border-[#D8C2A6]/30"
                      : "bg-emerald-950 text-emerald-300 border border-emerald-500/40"
                  }`}
                >
                  {profileVisibility === "private" ? "PRIVATE (DEFAULT)" : "SHARED WITH PARTNERS"}
                </button>
              </label>

              <label className="flex items-center justify-between p-3 rounded-lg bg-[#181818] border border-[#D8C2A6]/10 cursor-pointer">
                <div>
                  <span className="text-[#F1E7DB] block font-medium">Career Passport Employer Sharing</span>
                  <span className="text-[11px] text-[#9A9A9A]">
                    Explicit consent required to transmit verified pre-break tenure & capstone records.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={passportConsent}
                  onChange={(e) => {
                    setPassportConsent(e.target.checked);
                    handleSavePrivacy();
                  }}
                  className="w-4 h-4 accent-[#A56F7C] cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-lg bg-[#181818] border border-[#D8C2A6]/10 cursor-pointer">
                <div>
                  <span className="text-[#F1E7DB] block font-medium">Career Break Reason (Optional)</span>
                  <span className="text-[11px] text-[#9A9A9A]">
                    Keep sensitive caregiving or medical reasons private during employer review.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={shareBreakReason}
                  onChange={(e) => {
                    setShareBreakReason(e.target.checked);
                    handleSavePrivacy();
                  }}
                  className="w-4 h-4 accent-[#A56F7C] cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-lg bg-[#181818] border border-[#D8C2A6]/10 cursor-pointer">
                <div>
                  <span className="text-[#F1E7DB] block font-medium">Algorithmic Recommendation Transparency</span>
                  <span className="text-[11px] text-[#9A9A9A]">
                    Opt-out of automated ranking to view all opportunities chronologically without scoring algorithms.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={optOutRanking}
                  onChange={(e) => {
                    setOptOutRanking(e.target.checked);
                    handleSavePrivacy();
                  }}
                  className="w-4 h-4 accent-[#A56F7C] cursor-pointer"
                />
              </label>

              {/* DPDP Act 2023 Rights Action Strip */}
              <div className="pt-3 border-t border-[#D8C2A6]/15 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={handleExportData}
                    disabled={isExporting}
                    className="px-3 py-1.5 rounded-lg bg-[#242424] hover:bg-[#2e2e2e] border border-[#D8C2A6]/30 text-[#D8C2A6] hover:text-[#F1E7DB] flex items-center gap-1.5 font-mono text-[11px] transition-all disabled:opacity-50"
                    title="DPDP Act Section 12: Export complete personal records as JSON"
                  >
                    <Download className={`w-3.5 h-3.5 ${isExporting ? "animate-bounce" : ""}`} />
                    <span>{isExporting ? "Exporting..." : "Export Data (JSON)"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleRevokeAll}
                    className="px-3 py-1.5 rounded-lg bg-amber-950/40 hover:bg-amber-950/70 border border-amber-500/30 text-amber-300 flex items-center gap-1.5 font-mono text-[11px] transition-all"
                    title="DPDP Act Section 6(4): One-click revocation of all active consents"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Revoke All Consents</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleErasureRequest}
                    disabled={erasurePending}
                    className="px-3 py-1.5 rounded-lg bg-red-950/30 hover:bg-red-950/60 border border-red-500/30 text-red-300 flex items-center gap-1.5 font-mono text-[11px] transition-all disabled:opacity-50"
                    title="DPDP Act Section 12: Right to correction and erasure"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{erasurePending ? "Erasure Pending" : "Request Account Erasure"}</span>
                  </button>
                </div>

                <span className="text-[10px] font-mono text-[#888]">
                  DPDP Act 2023 Compliant • Grievance Officer: privacy@gfg-platform.org
                </span>
              </div>

              {privacyMessage && (
                <div className="p-2.5 rounded bg-emerald-950/80 border border-emerald-500/40 text-emerald-200 text-xs font-mono flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
                  <span>{privacyMessage}</span>
                </div>
              )}
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

            <div className="flex flex-wrap items-center gap-2">
              {onOpenDigitalTwin && (
                <button
                  onClick={() => {
                    onClose();
                    onOpenDigitalTwin();
                  }}
                  className="btn-editorial-secondary text-xs shrink-0 border-blue-500/30 text-blue-200 hover:border-blue-400"
                >
                  <span>AI Digital Twin</span>
                </button>
              )}
              {onOpenSimulator && (
                <button
                  onClick={() => {
                    onClose();
                    onOpenSimulator();
                  }}
                  className="btn-editorial-secondary text-xs shrink-0 border-cyan-500/30 text-cyan-200 hover:border-cyan-400"
                >
                  <span>Career Simulator</span>
                </button>
              )}
              {onOpenOnboarding && (
                <button
                  onClick={() => {
                    onClose();
                    onOpenOnboarding();
                  }}
                  className="btn-editorial-secondary text-xs shrink-0"
                >
                  <span>Edit Profile</span>
                </button>
              )}
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
    </div>
  );
}
