"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  LogOut,
  ArrowRight,
  Shield,
  Lock,
  CheckCircle,
  Download,
  Trash2,
  RotateCcw,
  Sparkles,
  Calendar,
  Compass,
  BookOpen,
  Briefcase,
  Users,
  Target,
  FileCheck,
  Building,
  Award,
  ChevronRight,
  Clock,
  Flame,
  Code2,
} from "lucide-react";
import { DEMO_PERSONA, DEMO_METRICS } from "@/lib/demoPersona";
import { DataClassificationBadge } from "./DataClassificationBadge";
import { api, privacyApi } from "@/lib/api";

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
  readinessScore = 84,
  onViewPassport,
  onOpenOnboarding,
  onOpenDigitalTwin,
  onOpenSimulator,
}: UserDashboardModalProps) {
  const [profileVisibility, setProfileVisibility] = useState<"private" | "employers">(
    DEMO_PERSONA.privacy.profile_visibility === "public"
      ? "employers"
      : DEMO_PERSONA.privacy.profile_visibility
  );
  const [passportConsent, setPassportConsent] = useState(
    DEMO_PERSONA.privacy.passport_sharing_consent
  );
  const [shareBreakReason, setShareBreakReason] = useState(
    DEMO_PERSONA.privacy.career_break_optional_shared
  );
  const [privacySaved, setPrivacySaved] = useState(false);
  const [privacyMessage, setPrivacyMessage] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [optOutRanking, setOptOutRanking] = useState(false);
  const [erasurePending, setErasurePending] = useState(false);

  // Dynamic candidate data
  const [candidateProfile, setCandidateProfile] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "roadmap" | "learning" | "privacy">(
    "overview"
  );

  useEffect(() => {
    if (!isOpen) return;
    async function loadData() {
      try {
        const profile = await api.getCandidateProfile();
        if (profile) setCandidateProfile(profile);
      } catch (err) {
        console.warn("Using local candidate profile data", err);
      }
    }
    loadData();
  }, [isOpen]);

  if (!isOpen) return null;

  const displayName =
    currentUser?.full_name ||
    candidateProfile?.full_name ||
    DEMO_PERSONA.full_name;
  const targetRole =
    candidateProfile?.target_role ||
    candidateProfile?.previous_job_title ||
    DEMO_PERSONA.target_role;
  const breakInfo = candidateProfile?.career_breaks?.[0];
  const breakMonths = breakInfo?.duration_months || 24;
  const breakDurationDisplay = `${Math.floor(breakMonths / 12)} years ${
    breakMonths % 12 > 0 ? `${breakMonths % 12} months` : ""
  }`;

  const supportPrefs =
    candidateProfile?.support_preferences || {
      services: ["Mentorship Sessions", "Career Roadmap", "Resume and LinkedIn Support"],
      format: "1:1 Sessions",
      availability: "Weekday Evenings",
      language: "English",
    };

  const selectedServices: string[] = Array.isArray(supportPrefs.services)
    ? supportPrefs.services
    : ["Mentorship Sessions", "Career Roadmap"];

  const handleSavePrivacy = async () => {
    setPrivacySaved(true);
    await privacyApi.updateConsentSettings({
      career_break_visibility: profileVisibility,
      allow_mentor_sharing: passportConsent,
      allow_ai_matching: !optOutRanking,
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
    setPrivacyMessage(
      "Account deletion & data erasure request logged with Data Grievance Officer (SLA: 7 business days)."
    );
    setTimeout(() => setPrivacyMessage(null), 5000);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="dashboard-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#0A0706]/90 backdrop-blur-md overflow-y-auto"
    >
      <div className="relative w-full max-w-5xl bg-[#140D0A] text-[#F5EDE4] rounded-2xl border border-[#D97706]/25 overflow-hidden my-auto max-h-[92vh] flex flex-col font-sans shadow-2xl">
        {/* Top Header */}
        <div className="px-6 sm:px-8 py-4 border-b border-[#2A1B14] flex items-center justify-between bg-[#0E0907]/95 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-[#D97706] shadow-[0_0_8px_rgba(217,119,6,0.6)]" />
            <span className="text-xs font-mono tracking-wider uppercase text-[#D97706]">
              CAREER CONTINUITY // DASHBOARD
            </span>
            <DataClassificationBadge type="simulated_demonstration" size="sm" />
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 text-xs font-mono uppercase text-[#A89B90] hover:text-[#F5EDE4] transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#A89B90] hover:text-[#F5EDE4] hover:bg-[#2A1B14] transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="px-6 sm:px-8 border-b border-[#2A1B14] flex items-center gap-6 bg-[#110B08] text-xs font-medium">
          <button
            onClick={() => setActiveTab("overview")}
            className={`py-3 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === "overview"
                ? "border-[#D97706] text-[#F5EDE4] font-semibold"
                : "border-transparent text-[#A89B90] hover:text-[#F5EDE4]"
            }`}
          >
            <Compass className="w-3.5 h-3.5" /> Comeback Overview
          </button>
          <button
            onClick={() => setActiveTab("roadmap")}
            className={`py-3 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === "roadmap"
                ? "border-[#D97706] text-[#F5EDE4] font-semibold"
                : "border-transparent text-[#A89B90] hover:text-[#F5EDE4]"
            }`}
          >
            <Calendar className="w-3.5 h-3.5" /> 30/60/90 Roadmap
          </button>
          <button
            onClick={() => setActiveTab("learning")}
            className={`py-3 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === "learning"
                ? "border-[#D97706] text-[#F5EDE4] font-semibold"
                : "border-transparent text-[#A89B90] hover:text-[#F5EDE4]"
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" /> Skills & Learning
          </button>
          <button
            onClick={() => setActiveTab("privacy")}
            className={`py-3 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === "privacy"
                ? "border-[#D97706] text-[#F5EDE4] font-semibold"
                : "border-transparent text-[#A89B90] hover:text-[#F5EDE4]"
            }`}
          >
            <Lock className="w-3.5 h-3.5" /> Privacy & DPDP
          </button>
        </div>

        {/* Dashboard Body */}
        <div className="overflow-y-auto px-6 sm:px-8 py-6 space-y-6">
          {/* TAB 1: OVERVIEW */}
          {activeTab === "overview" && (
            <>
              {/* Hero Greeting */}
              <div className="p-6 rounded-2xl bg-gradient-to-r from-[#1C120D] via-[#1A0F0A] to-[#25150E] border border-[#3A241A] flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-[#D97706]">
                      Target Track: {targetRole}
                    </span>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#D97706]" />
                    <span className="text-xs text-[#A89B90]">
                      {candidateProfile?.preferred_work_mode?.toUpperCase() || "HYBRID"}
                    </span>
                  </div>
                  <h1
                    id="dashboard-modal-title"
                    className="text-2xl sm:text-3xl font-bold tracking-tight text-[#F5EDE4]"
                  >
                    Welcome back, {displayName.split(" ")[0]}.
                  </h1>
                  <p className="text-xs sm:text-sm text-[#A89B90] max-w-xl leading-relaxed">
                    Your foundation is solid. You have{" "}
                    <strong className="text-[#F5EDE4]">
                      {candidateProfile?.years_experience || Math.round((DEMO_METRICS.preBreakMonths || 48) / 12)} years
                    </strong>{" "}
                    of verified professional experience preserved across your{" "}
                    <strong className="text-[#D97706]">{breakDurationDisplay}</strong> sabbatical.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  {onViewPassport && (
                    <button
                      onClick={onViewPassport}
                      className="px-4 py-2 bg-[#D97706] hover:bg-[#F5EDE4] text-[#0A0706] font-bold text-xs rounded-xl transition-all shadow-[0_0_15px_rgba(217,119,6,0.3)] flex items-center gap-1.5"
                    >
                      <Award className="w-3.5 h-3.5" />
                      <span>Career Passport</span>
                    </button>
                  )}
                  {onOpenOnboarding && (
                    <button
                      onClick={() => {
                        onClose();
                        onOpenOnboarding();
                      }}
                      className="px-3.5 py-2 bg-[#1C120D] hover:bg-[#2A1B14] border border-[#3A241A] text-xs font-semibold text-[#F5EDE4] rounded-xl transition-colors"
                    >
                      Edit Preferences
                    </button>
                  )}
                </div>
              </div>

              {/* Big Numbers Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-[#1C120D] border border-[#3A241A] rounded-xl space-y-1">
                  <span className="text-3xl font-bold text-[#F5EDE4] tracking-tight">
                    {readinessScore}%
                  </span>
                  <div className="text-[10px] font-mono text-[#D97706] uppercase">
                    Comeback Readiness
                  </div>
                  <span className="text-[11px] text-[#A89B90] block">Tier 1 • Prime for Return</span>
                </div>

                <div className="p-4 bg-[#1C120D] border border-[#3A241A] rounded-xl space-y-1">
                  <span className="text-3xl font-bold text-[#D97706] tracking-tight">
                    {applications.length || 2}
                  </span>
                  <div className="text-[10px] font-mono text-[#D97706] uppercase">
                    Active Returnships
                  </div>
                  <span className="text-[11px] text-[#A89B90] block">Amazon & Thoughtworks</span>
                </div>

                <div className="p-4 bg-[#1C120D] border border-[#3A241A] rounded-xl space-y-1">
                  <span className="text-3xl font-bold text-[#F5EDE4] tracking-tight">
                    {selectedServices.length}
                  </span>
                  <div className="text-[10px] font-mono text-[#D97706] uppercase">
                    Selected Services
                  </div>
                  <span className="text-[11px] text-[#A89B90] block">1:1 Mentorship Included</span>
                </div>

                <div className="p-4 bg-[#1C120D] border border-[#3A241A] rounded-xl space-y-1">
                  <span className="text-3xl font-bold text-[#D97706] tracking-tight">
                    {candidateProfile?.weekly_learning_hours || 15}h
                  </span>
                  <div className="text-[10px] font-mono text-[#D97706] uppercase">
                    Weekly Commitment
                  </div>
                  <span className="text-[11px] text-[#A89B90] block">
                    {supportPrefs.availability || "Weekday Evenings"}
                  </span>
                </div>
              </div>

              {/* Selected Support Services & Next Action */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Active Services */}
                <div className="p-5 bg-[#1C120D] border border-[#3A241A] rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-[#F5EDE4] flex items-center gap-1.5 uppercase tracking-wider">
                      <Target className="w-3.5 h-3.5 text-[#D97706]" />
                      Your Selected Support Services
                    </h3>
                    <span className="text-[10px] font-mono text-[#D97706]">
                      {supportPrefs.format || "1:1 Dedicated"}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {selectedServices.map((srv: string, i: number) => (
                      <div
                        key={i}
                        className="p-2.5 bg-[#2A1B14] rounded-lg text-xs flex items-center justify-between"
                      >
                        <span className="text-[#F5EDE4] font-medium">{srv}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-[#D97706]/15 text-[#D97706] font-mono">
                          Active
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recommended Next Action */}
                <div className="p-5 bg-[#1C120D] border border-[#3A241A] rounded-xl space-y-3 flex flex-col justify-between">
                  <div className="space-y-2">
                    <span className="text-[10px] font-mono text-[#D97706] uppercase">
                      Recommended Next Step
                    </span>
                    <h4 className="text-sm font-semibold text-[#F5EDE4]">
                      Complete &ldquo;Cloud Architecture Modernization&rdquo; Module
                    </h4>
                    <p className="text-xs text-[#A89B90] leading-relaxed">
                      Completing this 4-hour sprint updates your verified skills on your Career
                      Passport and elevates your match score for Amazon AWS Restart to 96%.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 pt-2">
                    {onOpenDigitalTwin && (
                      <button
                        onClick={() => {
                          onClose();
                          onOpenDigitalTwin();
                        }}
                        className="px-3 py-1.5 rounded-lg bg-[#2A1B14] hover:bg-[#3A241A] text-xs text-[#D97706] font-medium transition-colors"
                      >
                        AI Digital Twin
                      </button>
                    )}
                    {onOpenSimulator && (
                      <button
                        onClick={() => {
                          onClose();
                          onOpenSimulator();
                        }}
                        className="px-3 py-1.5 rounded-lg bg-[#2A1B14] hover:bg-[#3A241A] text-xs text-sky-400 font-medium transition-colors"
                      >
                        Simulator
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* TAB 2: 30/60/90 ROADMAP */}
          {activeTab === "roadmap" && (
            <div className="space-y-4">
              <div className="p-4 bg-[#1C120D] border border-[#3A241A] rounded-xl space-y-1">
                <h3 className="text-sm font-bold text-[#F5EDE4] flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#D97706]" />
                  Your 30 / 60 / 90-Day Comeback Roadmap
                </h3>
                <p className="text-xs text-[#A89B90]">
                  Structured week-by-week trajectory tailored to your {breakDurationDisplay} career
                  chapter and target role of {targetRole}.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* 30 Days */}
                <div className="p-5 bg-[#1C120D] border border-[#3A241A] rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase text-[#D97706] bg-[#D97706]/10 px-2 py-0.5 rounded">
                      Days 1 - 30
                    </span>
                    <span className="text-xs text-emerald-400 font-mono">In Progress</span>
                  </div>
                  <h4 className="text-sm font-bold text-[#F5EDE4]">Foundation & Bridge Skills</h4>
                  <ul className="text-xs text-[#A89B90] space-y-2">
                    <li className="flex items-start gap-1.5">
                      <span className="text-[#D97706] font-bold">✓</span>
                      <span>Review core language updates and async frameworks</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-[#D97706] font-bold">✓</span>
                      <span>Configure local containerized development sandbox</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-[#D97706] font-bold">⏳</span>
                      <span>Attend initial 1:1 mentor alignment session</span>
                    </li>
                  </ul>
                </div>

                {/* 60 Days */}
                <div className="p-5 bg-[#1C120D] border border-[#3A241A] rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase text-[#D97706] bg-[#D97706]/10 px-2 py-0.5 rounded">
                      Days 31 - 60
                    </span>
                    <span className="text-xs text-[#A89B90] font-mono">Upcoming</span>
                  </div>
                  <h4 className="text-sm font-bold text-[#F5EDE4]">Portfolio Capstone & Proof</h4>
                  <ul className="text-xs text-[#A89B90] space-y-2">
                    <li className="flex items-start gap-1.5">
                      <span className="text-[#A89B90]">•</span>
                      <span>Publish verified capstone project to GitHub</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-[#A89B90]">•</span>
                      <span>Modernize resume narrative and LinkedIn headline</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-[#A89B90]">•</span>
                      <span>Complete mock technical walkthrough with mentor</span>
                    </li>
                  </ul>
                </div>

                {/* 90 Days */}
                <div className="p-5 bg-[#1C120D] border border-[#3A241A] rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase text-[#D97706] bg-[#D97706]/10 px-2 py-0.5 rounded">
                      Days 61 - 90
                    </span>
                    <span className="text-xs text-[#A89B90] font-mono">Target</span>
                  </div>
                  <h4 className="text-sm font-bold text-[#F5EDE4]">Returnship Offers & Re-entry</h4>
                  <ul className="text-xs text-[#A89B90] space-y-2">
                    <li className="flex items-start gap-1.5">
                      <span className="text-[#A89B90]">•</span>
                      <span>Direct application to verified partner programs</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-[#A89B90]">•</span>
                      <span>Transmit Career Passport to hiring managers</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-[#A89B90]">•</span>
                      <span>Contract negotiation & onboarding support</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SKILLS & LEARNING */}
          {activeTab === "learning" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Verified Skills */}
                <div className="p-5 bg-[#1C120D] border border-[#3A241A] rounded-xl space-y-3">
                  <h3 className="text-xs font-bold text-[#F5EDE4] flex items-center gap-1.5 uppercase tracking-wider">
                    <CheckCircle className="w-3.5 h-3.5 text-[#D97706]" />
                    Verified & Reported Capabilities
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {(
                      candidateProfile?.skills?.map((s: any) => s.name || s) || [
                        "Python",
                        "SQL",
                        "PostgreSQL",
                        "Data Modeling",
                        "Tableau",
                        "Git",
                      ]
                    ).map((sk: string) => (
                      <span
                        key={sk}
                        className="px-2.5 py-1 bg-[#2A1B14] rounded-md text-xs text-[#F5EDE4] border border-[#3A241A]"
                      >
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Recommended Modules */}
                <div className="p-5 bg-[#1C120D] border border-[#3A241A] rounded-xl space-y-3">
                  <h3 className="text-xs font-bold text-[#F5EDE4] flex items-center gap-1.5 uppercase tracking-wider">
                    <BookOpen className="w-3.5 h-3.5 text-[#D97706]" />
                    Active Learning Modules
                  </h3>
                  <div className="space-y-2">
                    <div className="p-3 bg-[#2A1B14] rounded-lg space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="font-semibold text-[#F5EDE4]">
                          Microservices & FastAPI Sprint
                        </span>
                        <span className="text-[#D97706] font-mono">65%</span>
                      </div>
                      <div className="w-full h-1.5 bg-[#140D0A] rounded-full overflow-hidden">
                        <div className="w-[65%] h-full bg-[#D97706] rounded-full" />
                      </div>
                    </div>

                    <div className="p-3 bg-[#2A1B14] rounded-lg space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="font-semibold text-[#F5EDE4]">
                          Modern React & Next.js Architecture
                        </span>
                        <span className="text-[#D97706] font-mono">40%</span>
                      </div>
                      <div className="w-full h-1.5 bg-[#140D0A] rounded-full overflow-hidden">
                        <div className="w-[40%] h-full bg-[#D97706] rounded-full" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: PRIVACY & DPDP ACT */}
          {activeTab === "privacy" && (
            <div className="p-6 rounded-xl bg-[#1C120D] border border-[#3A241A] space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-[#D97706]" />
                  <span className="text-xs font-mono uppercase tracking-wider text-[#F5EDE4]">
                    PRIVACY & CONSENT SETTINGS
                  </span>
                </div>
                {privacySaved && (
                  <span className="text-xs font-mono text-emerald-400 flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" /> Saved
                  </span>
                )}
              </div>

              <p className="text-xs text-[#A89B90] leading-relaxed">
                Your profile is private by default. Control exactly who can view your credentials,
                verified passport, and career break context.
              </p>

              <div className="space-y-3 font-mono text-xs pt-2">
                <label className="flex items-center justify-between p-3 rounded-lg bg-[#2A1B14] border border-[#3A241A] cursor-pointer">
                  <div>
                    <span className="text-[#F5EDE4] block font-medium">Profile Visibility</span>
                    <span className="text-[11px] text-[#A89B90]">
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
                        ? "bg-[#1C120D] text-[#D97706] border border-[#D97706]/30"
                        : "bg-emerald-950 text-emerald-300 border border-emerald-500/40"
                    }`}
                  >
                    {profileVisibility === "private" ? "PRIVATE (DEFAULT)" : "SHARED WITH PARTNERS"}
                  </button>
                </label>

                <label className="flex items-center justify-between p-3 rounded-lg bg-[#2A1B14] border border-[#3A241A] cursor-pointer">
                  <div>
                    <span className="text-[#F5EDE4] block font-medium">
                      Career Passport Employer Sharing
                    </span>
                    <span className="text-[11px] text-[#A89B90]">
                      Explicit consent required to transmit verified pre-break tenure & capstone
                      records.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={passportConsent}
                    onChange={(e) => {
                      setPassportConsent(e.target.checked);
                      handleSavePrivacy();
                    }}
                    className="w-4 h-4 accent-[#D97706] cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-lg bg-[#2A1B14] border border-[#3A241A] cursor-pointer">
                  <div>
                    <span className="text-[#F5EDE4] block font-medium">
                      Career Break Reason (Optional)
                    </span>
                    <span className="text-[11px] text-[#A89B90]">
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
                    className="w-4 h-4 accent-[#D97706] cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-lg bg-[#2A1B14] border border-[#3A241A] cursor-pointer">
                  <div>
                    <span className="text-[#F5EDE4] block font-medium">
                      Algorithmic Recommendation Transparency
                    </span>
                    <span className="text-[11px] text-[#A89B90]">
                      Opt-out of automated ranking to view all opportunities chronologically without
                      scoring algorithms.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={optOutRanking}
                    onChange={(e) => {
                      setOptOutRanking(e.target.checked);
                      handleSavePrivacy();
                    }}
                    className="w-4 h-4 accent-[#D97706] cursor-pointer"
                  />
                </label>

                {/* DPDP Act 2023 Rights Action Strip */}
                <div className="pt-3 border-t border-[#3A241A] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={handleExportData}
                      disabled={isExporting}
                      className="px-3 py-1.5 rounded-lg bg-[#1C120D] hover:bg-[#2A1B14] border border-[#3A241A] text-[#D97706] hover:text-[#F5EDE4] flex items-center gap-1.5 font-mono text-[11px] transition-all disabled:opacity-50"
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

                  <span className="text-[10px] font-mono text-[#736357]">
                    DPDP Act 2023 Compliant • Grievance: privacy@gfg-platform.org
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
          )}
        </div>
      </div>
    </div>
  );
}
