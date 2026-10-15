"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Shield,
  Download,
  Eye,
  Lock,
  Unlock,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileCheck,
  FileText,
  Share2,
  Trash2,
  Plus,
  RefreshCw,
  ExternalLink,
  Calendar,
  Briefcase,
  GraduationCap,
  Award,
  Layers,
  Code2,
  MessageSquare,
  Sparkles,
  Sliders,
  Check,
  Building,
  UserCheck
} from "lucide-react";
import { api, careerPassportApi } from "@/lib/api";

export interface CareerPassportModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: "passport" | "preview" | "privacy" | "grants" | "evidence";
}

export function CareerPassportModal({
  isOpen,
  onClose,
  defaultTab = "passport",
}: CareerPassportModalProps) {
  const [activeTab, setActiveTab] = useState<"passport" | "preview" | "privacy" | "grants" | "evidence">(defaultTab);
  const [passportData, setPassportData] = useState<any>(null);
  const [employerViewData, setEmployerViewData] = useState<any>(null);
  const [accessLogs, setAccessLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Privacy Settings Local State
  const [breakMode, setBreakMode] = useState<"full" | "dates_only" | "hidden">("dates_only");
  const [visibilitySettings, setVisibilitySettings] = useState({
    show_contact_email: true,
    show_phone: false,
    show_salary_expectation: false,
    show_previous_employment: true,
    show_education: true,
    show_portfolio_projects: true,
    show_completed_learning: true,
    show_practical_assessments: true,
    show_mentor_feedback: true,
    show_career_preferences: true,
  });

  // New Grant Form State
  const [grantEmail, setGrantEmail] = useState("");
  const [grantOrg, setGrantOrg] = useState("");
  const [grantDays, setGrantDays] = useState(30);

  // Evidence Form State
  const [evidenceType, setEvidenceType] = useState("certificate");
  const [evidenceTitle, setEvidenceTitle] = useState("");
  const [evidenceIssuer, setEvidenceIssuer] = useState("");
  const [evidenceSource, setEvidenceSource] = useState("");
  const [evidenceNotes, setEvidenceNotes] = useState("");

  useEffect(() => {
    if (isOpen) {
      loadAllPassportData();
    }
  }, [isOpen]);

  const loadAllPassportData = async () => {
    setIsLoading(true);
    setFeedback(null);
    try {
      const [full, prev, logs] = await Promise.all([
        careerPassportApi.getMyPassport().catch(() => null),
        careerPassportApi.getEmployerPreview().catch(() => null),
        careerPassportApi.getAccessLogs().catch(() => []),
      ]);

      if (full) {
        setPassportData(full);
        const vis = full.candidate_controlled_sharing?.visibility_settings || {};
        if (vis.career_break_mode) {
          setBreakMode(vis.career_break_mode);
        }
        setVisibilitySettings((prevVis) => ({
          ...prevVis,
          ...vis,
        }));
      }

      if (prev?.employer_view) {
        setEmployerViewData(prev.employer_view);
      } else if (full) {
        setEmployerViewData({ ...full, is_employer_view: true });
      }

      setAccessLogs(logs || []);
    } catch (err: any) {
      console.error("Failed to load Career Passport:", err);
      setFeedback({ type: "error", text: "Unable to load Career Passport data. Showing demo profile." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSavePrivacy = async () => {
    setIsSaving(true);
    setFeedback(null);
    try {
      const payload = {
        ...visibilitySettings,
        career_break_mode: breakMode,
      };
      await careerPassportApi.updateVisibility(payload);
      setFeedback({ type: "success", text: "Privacy and career-break display preferences saved." });
      await loadAllPassportData();
    } catch (err: any) {
      setFeedback({ type: "error", text: err.message || "Failed to update privacy settings." });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateGrant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!grantEmail.trim()) {
      setFeedback({ type: "error", text: "Recipient email is required." });
      return;
    }
    setIsSaving(true);
    try {
      const res = await careerPassportApi.createAccessGrant({
        grantee_email: grantEmail.trim(),
        grantee_organization: grantOrg.trim() || undefined,
        expires_days: grantDays,
      });
      setFeedback({
        type: "success",
        text: res.message || `Access granted for ${grantEmail} (valid for ${grantDays} days).`,
      });
      setGrantEmail("");
      setGrantOrg("");
      await loadAllPassportData();
    } catch (err: any) {
      setFeedback({ type: "error", text: err.message || "Failed to generate access grant." });
    } finally {
      setIsSaving(false);
    }
  };

  const handleRevokeGrant = async (grantId: string) => {
    setIsSaving(true);
    try {
      await careerPassportApi.revokeAccessGrant(grantId);
      setFeedback({ type: "success", text: "Employer access grant immediately revoked." });
      await loadAllPassportData();
    } catch (err: any) {
      setFeedback({ type: "error", text: err.message || "Failed to revoke access." });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmitEvidence = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!evidenceTitle.trim() || !evidenceIssuer.trim()) {
      setFeedback({ type: "error", text: "Title and issuing organization are required." });
      return;
    }
    setIsSaving(true);
    try {
      const res = await careerPassportApi.submitVerification({
        item_type: evidenceType,
        title: evidenceTitle.trim(),
        issuer_or_employer: evidenceIssuer.trim(),
        verification_source: evidenceSource.trim() || "Candidate Document Upload",
        notes: evidenceNotes.trim() || undefined,
      });
      setFeedback({
        type: "success",
        text: res.message || "Evidence submitted for audit. Status: Document Submitted, Pending Review.",
      });
      setEvidenceTitle("");
      setEvidenceIssuer("");
      setEvidenceSource("");
      setEvidenceNotes("");
      await loadAllPassportData();
    } catch (err: any) {
      setFeedback({ type: "error", text: err.message || "Failed to submit evidence." });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownloadPdf = () => {
    const url = careerPassportApi.downloadPdfUrl();
    window.open(url, "_blank");
    setFeedback({
      type: "success",
      text: "Generating official Verified Career Passport 2.0 PDF with your active privacy filters...",
    });
  };

  if (!isOpen) return null;

  // Use either active passport or employer view based on tab
  const activeView = activeTab === "preview" ? (employerViewData || passportData) : passportData;

  // Helper to render verification badge
  const renderVerificationBadge = (level: string) => {
    switch (level) {
      case "independently_verified":
      case "verified":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider bg-emerald-950/80 text-emerald-300 border border-emerald-500/40">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            <span>Independently Verified</span>
          </span>
        );
      case "assessment_supported":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider bg-purple-950/80 text-purple-300 border border-purple-500/40">
            <Award className="w-3 h-3 text-purple-400" />
            <span>Assessment Supported</span>
          </span>
        );
      case "pending_review":
      case "document_submitted":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider bg-amber-950/80 text-amber-300 border border-amber-500/40">
            <Clock className="w-3 h-3 text-amber-400" />
            <span>Document Pending Review</span>
          </span>
        );
      case "self_reported":
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider bg-[#222222] text-[#9A9A9A] border border-[#D8C2A6]/15">
            <FileText className="w-3 h-3 text-[#9A9A9A]" />
            <span>Self-Reported</span>
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="w-full max-w-6xl bg-[#141414] text-[#F1E7DB] rounded-2xl border border-[#D8C2A6]/25 shadow-2xl relative max-h-[92vh] flex flex-col overflow-hidden">
        
        {/* TOP EDITORIAL HEADER BAR */}
        <div className="p-6 sm:p-8 border-b border-[#D8C2A6]/15 bg-[#181818]/90 flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
          <div>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-1.5">
              <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#A56F7C]">
                GFG PROTOCOL // MODULE 6
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 text-[10px] font-mono uppercase tracking-wider">
                V2.0 PORTABLE SPECIFICATION
              </span>
              <span className="px-2 py-0.5 rounded-full bg-[#111111] border border-[#D8C2A6]/20 text-[#D8C2A6] text-[10px] font-mono uppercase">
                {activeTab === "preview" ? "EMPLOYER PERSPECTIVE" : "CANDIDATE GOVERNANCE"}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-light tracking-tight text-[#F1E7DB] flex items-center gap-3">
              <span>Verified Career Passport 2.0</span>
              <span className="text-xs font-mono font-normal text-[#9A9A9A] border border-[#D8C2A6]/20 px-2 py-0.5 rounded">
                {activeView?.passport_id || "GFG-PASS-2026-088"}
              </span>
            </h2>
            <p className="text-xs text-[#9A9A9A] mt-1 font-mono">
              Portable professional evidence integrating verified experience, skills, assessments, and candidate-controlled privacy.
            </p>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick Action: Official PDF Export */}
            <button
              onClick={handleDownloadPdf}
              title="Generate a clean, print-ready, candidate-filtered PDF"
              className="px-4 py-2 rounded-lg bg-[#D8C2A6] text-[#111111] hover:bg-[#F1E7DB] text-xs font-mono uppercase tracking-wider font-semibold transition-all flex items-center gap-2 shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Official PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-[#111111] border border-[#D8C2A6]/20 text-[#9A9A9A] hover:text-[#F1E7DB] hover:bg-white/5 transition-all"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* NOTIFICATION FEEDBACK BAR */}
        {feedback && (
          <div
            className={`px-6 py-2.5 text-xs font-mono tracking-wider flex items-center justify-between border-b ${
              feedback.type === "success"
                ? "bg-emerald-950/80 border-emerald-500/30 text-emerald-200"
                : "bg-red-950/80 border-red-500/30 text-red-200"
            }`}
          >
            <div className="flex items-center gap-2">
              {feedback.type === "success" ? (
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              )}
              <span>{feedback.text}</span>
            </div>
            <button onClick={() => setFeedback(null)} className="opacity-75 hover:opacity-100">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* TABS NAVIGATION */}
        <div className="px-6 sm:px-8 border-b border-[#D8C2A6]/15 bg-[#181818]/60 flex items-center gap-2 overflow-x-auto shrink-0 py-2">
          <button
            onClick={() => setActiveTab("passport")}
            className={`px-3 py-2 rounded-lg text-xs font-mono uppercase tracking-wider transition-all flex items-center gap-2 shrink-0 ${
              activeTab === "passport"
                ? "bg-[#F1E7DB] text-[#111111] font-semibold"
                : "text-[#9A9A9A] hover:text-[#F1E7DB] hover:bg-white/5"
            }`}
          >
            <FileCheck className="w-3.5 h-3.5" />
            <span>12-Section Passport</span>
          </button>

          <button
            onClick={() => setActiveTab("preview")}
            className={`px-3 py-2 rounded-lg text-xs font-mono uppercase tracking-wider transition-all flex items-center gap-2 shrink-0 ${
              activeTab === "preview"
                ? "bg-[#D8C2A6] text-[#111111] font-semibold"
                : "text-[#9A9A9A] hover:text-[#F1E7DB] hover:bg-white/5"
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Employer Preview</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </button>

          <button
            onClick={() => setActiveTab("privacy")}
            className={`px-3 py-2 rounded-lg text-xs font-mono uppercase tracking-wider transition-all flex items-center gap-2 shrink-0 ${
              activeTab === "privacy"
                ? "bg-[#A56F7C] text-[#F1E7DB] font-semibold"
                : "text-[#9A9A9A] hover:text-[#F1E7DB] hover:bg-white/5"
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Break & Privacy Controls</span>
          </button>

          <button
            onClick={() => setActiveTab("grants")}
            className={`px-3 py-2 rounded-lg text-xs font-mono uppercase tracking-wider transition-all flex items-center gap-2 shrink-0 ${
              activeTab === "grants"
                ? "bg-[#A56F7C] text-[#F1E7DB] font-semibold"
                : "text-[#9A9A9A] hover:text-[#F1E7DB] hover:bg-white/5"
            }`}
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Employer Sharing & Revocation</span>
            {activeView?.candidate_controlled_sharing?.active_employer_grants?.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-emerald-950 text-emerald-300 text-[10px] font-mono">
                {activeView.candidate_controlled_sharing.active_employer_grants.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("evidence")}
            className={`px-3 py-2 rounded-lg text-xs font-mono uppercase tracking-wider transition-all flex items-center gap-2 shrink-0 ${
              activeTab === "evidence"
                ? "bg-[#A56F7C] text-[#F1E7DB] font-semibold"
                : "text-[#9A9A9A] hover:text-[#F1E7DB] hover:bg-white/5"
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Submit Evidence</span>
          </button>
        </div>

        {/* TAB CONTENTS (SCROLLABLE BODY) */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-8 bg-[#111111]">
          {isLoading ? (
            <div className="py-24 text-center space-y-4">
              <RefreshCw className="w-8 h-8 text-[#D8C2A6] animate-spin mx-auto" />
              <p className="font-mono text-xs uppercase tracking-wider text-[#9A9A9A]">
                Assembling cryptographically verified career credentials...
              </p>
            </div>
          ) : (
            <>
              {/* TAB 1: FULL 12-SECTION PASSPORT OR TAB 2: EMPLOYER PREVIEW */}
              {(activeTab === "passport" || activeTab === "preview") && (
                <div className="space-y-8 max-w-5xl mx-auto">
                  {/* Employer Perspective Notice Banner if in preview mode */}
                  {activeTab === "preview" && (
                    <div className="p-4 rounded-xl bg-[#181818] border border-emerald-500/30 flex items-start gap-3">
                      <Eye className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-xs font-mono uppercase tracking-wider text-emerald-300 block font-semibold">
                          Live Employer Preview Mode
                        </span>
                        <p className="text-xs text-[#D8C2A6] mt-0.5 leading-relaxed font-mono">
                          This preview represents precisely what prospective employers and verified hiring partners will see. 
                          {activeView?.is_employer_view && " Private documents, unapproved fields, and candidate-restricted details have been safely sanitized."}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* 1. PROFESSIONAL INTRODUCTION */}
                  <section className="p-6 sm:p-8 rounded-xl bg-[#161616] border border-[#D8C2A6]/20 relative">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#A56F7C]">
                            SECTION 01 // PROFESSIONAL INTRODUCTION
                          </span>
                          {renderVerificationBadge("independently_verified")}
                        </div>
                        <h3 className="text-3xl font-light text-[#F1E7DB] tracking-tight">
                          {activeView?.professional_introduction?.full_name || "Ananya Raman"}
                        </h3>
                        <p className="text-base text-[#D8C2A6] font-medium">
                          {activeView?.professional_introduction?.headline || "Senior Data & BI Engineer (Returning Professional)"}
                        </p>
                        <p className="text-xs text-[#D8C2A6]/90 leading-relaxed font-sans max-w-2xl pt-2">
                          {activeView?.professional_introduction?.summary_bio ||
                            "Experienced data specialist with 4.5 years in scalable SQL architecture and BI dashboards, returning via structured hands-on projects."}
                        </p>
                      </div>

                      <div className="p-4 rounded-lg bg-[#111111] border border-[#D8C2A6]/15 space-y-2 font-mono text-xs shrink-0 min-w-[240px]">
                        <div>
                          <span className="text-[#9A9A9A] text-[10px] uppercase block">CONTACT EMAIL</span>
                          <span className="text-[#F1E7DB]">
                            {activeView?.professional_introduction?.email || "[Private / Protected]"}
                          </span>
                        </div>
                        <div>
                          <span className="text-[#9A9A9A] text-[10px] uppercase block">LOCATION</span>
                          <span className="text-[#F1E7DB]">
                            {activeView?.professional_introduction?.location || "Bengaluru, India"}
                          </span>
                        </div>
                        <div>
                          <span className="text-[#9A9A9A] text-[10px] uppercase block">READINESS TIER</span>
                          <span className="text-emerald-400 font-semibold">
                            {activeView?.professional_introduction?.readiness_tier || "Tier 1: Ready to Return"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* 2. CAREER TIMELINE */}
                  <section className="p-6 sm:p-8 rounded-xl bg-[#161616] border border-[#D8C2A6]/20 space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#D8C2A6]/10 pb-4">
                      <div>
                        <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#A56F7C] block mb-1">
                          SECTION 02 // CAREER TIMELINE
                        </span>
                        <h4 className="text-xl font-light text-[#F1E7DB]">Professional Continuity Milestones</h4>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-[#9A9A9A] uppercase">BREAK MODE:</span>
                        <span className="px-2 py-0.5 rounded bg-[#111111] text-[#D8C2A6] text-[10px] font-mono uppercase border border-[#D8C2A6]/20">
                          {activeView?.career_timeline?.break_display_mode || breakMode}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {activeView?.career_timeline?.timeline_milestones?.map((milestone: any, idx: number) => {
                        const isBreak = milestone.is_break;
                        return (
                          <div
                            key={idx}
                            className={`p-4 rounded-lg border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                              isBreak
                                ? "bg-[#1d1618] border-[#A56F7C]/40"
                                : "bg-[#111111] border-[#D8C2A6]/15 hover:border-[#D8C2A6]/30"
                            }`}
                          >
                            <div className="flex items-start gap-3.5">
                              <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                                  isBreak ? "bg-[#A56F7C]/20 text-[#A56F7C]" : "bg-[#D8C2A6]/15 text-[#D8C2A6]"
                                }`}
                              >
                                {isBreak ? <Clock className="w-4 h-4" /> : <Briefcase className="w-4 h-4" />}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <h5 className="text-sm font-medium text-[#F1E7DB]">{milestone.title}</h5>
                                  {isBreak ? (
                                    <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-[#A56F7C]/20 text-[#A56F7C] border border-[#A56F7C]/30">
                                      Candidate Governed
                                    </span>
                                  ) : (
                                    renderVerificationBadge(milestone.verification_level)
                                  )}
                                </div>
                                <p className="text-xs text-[#D8C2A6] font-mono mt-0.5">
                                  {milestone.organization_or_context}
                                </p>
                                <p className="text-xs text-[#9A9A9A] mt-1 font-sans">{milestone.description}</p>
                              </div>
                            </div>
                            <div className="text-right font-mono text-xs text-[#9A9A9A] shrink-0">
                              <span>{milestone.period}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </section>

                  {/* 3. PREVIOUS EMPLOYMENT & 4. EDUCATION (2 COLUMNS) */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* SECTION 03: PREVIOUS EMPLOYMENT */}
                    <section className="p-6 rounded-xl bg-[#161616] border border-[#D8C2A6]/20 space-y-4">
                      <div>
                        <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#A56F7C] block mb-1">
                          SECTION 03 // PREVIOUS EMPLOYMENT
                        </span>
                        <h4 className="text-lg font-light text-[#F1E7DB]">Employment History</h4>
                      </div>

                      <div className="space-y-3">
                        {activeView?.previous_employment?.roles?.map((role: any, idx: number) => (
                          <div key={idx} className="p-4 rounded-lg bg-[#111111] border border-[#D8C2A6]/15 space-y-2">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <h5 className="text-sm font-medium text-[#F1E7DB]">{role.title}</h5>
                                <span className="text-xs text-[#D8C2A6] font-mono block">{role.company}</span>
                              </div>
                              {renderVerificationBadge(role.verification_level)}
                            </div>
                            <div className="flex items-center gap-3 text-[11px] font-mono text-[#9A9A9A]">
                              <span>{role.duration}</span>
                              <span>•</span>
                              <span>{role.tenure_years} yrs</span>
                            </div>
                            <p className="text-xs text-[#D8C2A6]/90 font-sans leading-relaxed">{role.achievements}</p>
                            <div className="pt-2 border-t border-[#D8C2A6]/10 text-[10px] font-mono text-[#9A9A9A]">
                              SOURCE: {role.verification_source}
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>

                    {/* SECTION 04: EDUCATION */}
                    <section className="p-6 rounded-xl bg-[#161616] border border-[#D8C2A6]/20 space-y-4">
                      <div>
                        <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#A56F7C] block mb-1">
                          SECTION 04 // EDUCATION
                        </span>
                        <h4 className="text-lg font-light text-[#F1E7DB]">Academic Credentials</h4>
                      </div>

                      <div className="space-y-3">
                        {activeView?.education?.credentials?.map((edu: any, idx: number) => (
                          <div key={idx} className="p-4 rounded-lg bg-[#111111] border border-[#D8C2A6]/15 space-y-2">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <h5 className="text-sm font-medium text-[#F1E7DB]">{edu.degree}</h5>
                                <span className="text-xs text-[#D8C2A6] font-mono block">{edu.institution}</span>
                              </div>
                              {renderVerificationBadge(edu.verification_level)}
                            </div>
                            <div className="flex items-center gap-3 text-[11px] font-mono text-[#9A9A9A]">
                              <span>Year: {edu.year}</span>
                              {edu.honors && <span>• {edu.honors}</span>}
                            </div>
                            <div className="pt-2 border-t border-[#D8C2A6]/10 text-[10px] font-mono text-[#9A9A9A]">
                              SOURCE: {edu.verification_source}
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>
                  </div>

                  {/* 5. SKILL INVENTORY WITH 4 VERIFICATION LEVELS */}
                  <section className="p-6 sm:p-8 rounded-xl bg-[#161616] border border-[#D8C2A6]/20 space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#D8C2A6]/10 pb-4">
                      <div>
                        <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#A56F7C] block mb-1">
                          SECTION 05 // SKILL INVENTORY
                        </span>
                        <h4 className="text-xl font-light text-[#F1E7DB]">Verified Technical & Professional Competencies</h4>
                        <p className="text-xs text-[#9A9A9A] font-mono mt-0.5">
                          Every skill displays transparent provenance. Documents submitted start as pending review.
                        </p>
                      </div>

                      {/* Legend */}
                      <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono">
                        {renderVerificationBadge("independently_verified")}
                        {renderVerificationBadge("assessment_supported")}
                        {renderVerificationBadge("pending_review")}
                        {renderVerificationBadge("self_reported")}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {activeView?.skill_inventory?.skills?.map((s: any, idx: number) => (
                        <div
                          key={idx}
                          className="p-4 rounded-lg bg-[#111111] border border-[#D8C2A6]/15 hover:border-[#D8C2A6]/35 transition-all flex flex-col justify-between"
                        >
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between gap-1">
                              <span className="text-sm font-medium text-[#F1E7DB]">{s.name}</span>
                              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-white/5 text-[#D8C2A6]">
                                {s.proficiency}
                              </span>
                            </div>
                            <p className="text-[11px] text-[#9A9A9A] font-mono">{s.provenance_detail}</p>
                          </div>
                          <div className="mt-3 pt-2.5 border-t border-[#D8C2A6]/10 flex items-center justify-between">
                            {renderVerificationBadge(s.verification_level)}
                            {s.verified_at && (
                              <span className="text-[9px] font-mono text-[#9A9A9A]">
                                {new Date(s.verified_at).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>

                  {/* 6. COMPLETED LEARNING & 7. CERTIFICATIONS (2 COLUMNS) */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* SECTION 06: COMPLETED LEARNING */}
                    <section className="p-6 rounded-xl bg-[#161616] border border-[#D8C2A6]/20 space-y-4">
                      <div>
                        <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#A56F7C] block mb-1">
                          SECTION 06 // COMPLETED LEARNING
                        </span>
                        <h4 className="text-lg font-light text-[#F1E7DB]">Returnship Modules & Coursework</h4>
                      </div>

                      <div className="space-y-3">
                        {activeView?.completed_learning?.courses?.map((c: any, idx: number) => (
                          <div key={idx} className="p-4 rounded-lg bg-[#111111] border border-[#D8C2A6]/15 space-y-2">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <h5 className="text-sm font-medium text-[#F1E7DB]">{c.title}</h5>
                                <span className="text-xs text-[#D8C2A6] font-mono block">{c.platform_or_provider}</span>
                              </div>
                              {renderVerificationBadge(c.verification_level)}
                            </div>
                            <div className="flex items-center gap-3 text-[11px] font-mono text-[#9A9A9A]">
                              <span>Effort: {c.hours} hrs</span>
                              <span>•</span>
                              <span>Completed: {c.completed_date}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>

                    {/* SECTION 07: CERTIFICATIONS */}
                    <section className="p-6 rounded-xl bg-[#161616] border border-[#D8C2A6]/20 space-y-4">
                      <div>
                        <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#A56F7C] block mb-1">
                          SECTION 07 // CERTIFICATIONS
                        </span>
                        <h4 className="text-lg font-light text-[#F1E7DB]">Verified Credentials</h4>
                      </div>

                      <div className="space-y-3">
                        {activeView?.certifications?.items?.map((cert: any, idx: number) => (
                          <div key={idx} className="p-4 rounded-lg bg-[#111111] border border-[#D8C2A6]/15 space-y-2">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <h5 className="text-sm font-medium text-[#F1E7DB]">{cert.name}</h5>
                                <span className="text-xs text-[#D8C2A6] font-mono block">{cert.issuer}</span>
                              </div>
                              {renderVerificationBadge(cert.verification_level)}
                            </div>
                            <div className="flex items-center gap-3 text-[11px] font-mono text-[#9A9A9A]">
                              <span>Issued: {cert.issue_date}</span>
                              {cert.verification_id && (
                                <>
                                  <span>•</span>
                                  <span>ID: {cert.verification_id}</span>
                                </>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>
                  </div>

                  {/* 8. PORTFOLIO PROJECTS & 9. PRACTICAL ASSESSMENTS (2 COLUMNS) */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* SECTION 08: PORTFOLIO PROJECTS */}
                    <section className="p-6 rounded-xl bg-[#161616] border border-[#D8C2A6]/20 space-y-4">
                      <div>
                        <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#A56F7C] block mb-1">
                          SECTION 08 // PORTFOLIO PROJECTS
                        </span>
                        <h4 className="text-lg font-light text-[#F1E7DB]">Capstone Repositories & Artifacts</h4>
                      </div>

                      <div className="space-y-3">
                        {activeView?.portfolio_projects?.projects?.map((proj: any, idx: number) => (
                          <div key={idx} className="p-4 rounded-lg bg-[#111111] border border-[#D8C2A6]/15 space-y-2">
                            <div className="flex items-start justify-between gap-2">
                              <h5 className="text-sm font-medium text-[#F1E7DB]">{proj.title}</h5>
                              {renderVerificationBadge(proj.verification_level)}
                            </div>
                            <p className="text-xs text-[#D8C2A6]/90 font-sans leading-relaxed">{proj.description}</p>
                            <div className="flex flex-wrap gap-1.5 pt-1">
                              {proj.technologies?.map((tech: string) => (
                                <span
                                  key={tech}
                                  className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#181818] border border-[#D8C2A6]/15 text-[#D8C2A6]"
                                >
                                  {tech}
                                </span>
                              ))}
                            </div>
                            {proj.repository_link && (
                              <a
                                href={proj.repository_link}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 text-[11px] font-mono text-[#A56F7C] hover:underline pt-1"
                              >
                                <span>Inspect Repository Evidence</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    </section>

                    {/* SECTION 09: PRACTICAL ASSESSMENTS */}
                    <section className="p-6 rounded-xl bg-[#161616] border border-[#D8C2A6]/20 space-y-4">
                      <div>
                        <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#A56F7C] block mb-1">
                          SECTION 09 // PRACTICAL ASSESSMENTS
                        </span>
                        <h4 className="text-lg font-light text-[#F1E7DB]">Assessed Coding & Analytical Challenges</h4>
                      </div>

                      <div className="space-y-3">
                        {activeView?.practical_assessments?.assessments?.map((ass: any, idx: number) => (
                          <div key={idx} className="p-4 rounded-lg bg-[#111111] border border-[#D8C2A6]/15 space-y-2">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <h5 className="text-sm font-medium text-[#F1E7DB]">{ass.title}</h5>
                                <span className="text-xs text-[#D8C2A6] font-mono block">{ass.assessor}</span>
                              </div>
                              {renderVerificationBadge(ass.verification_level)}
                            </div>
                            <div className="flex items-center justify-between text-xs font-mono pt-1">
                              <span className="text-[#9A9A9A]">Score: <span className="text-emerald-400 font-semibold">{ass.score}%</span></span>
                              <span className="text-[#9A9A9A]">Completed: {ass.completed_date}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>
                  </div>

                  {/* 10. MENTOR FEEDBACK & 11. CAREER PREFERENCES (2 COLUMNS) */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* SECTION 10: MENTOR FEEDBACK */}
                    <section className="p-6 rounded-xl bg-[#161616] border border-[#D8C2A6]/20 space-y-4">
                      <div>
                        <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#A56F7C] block mb-1">
                          SECTION 10 // MENTOR FEEDBACK
                        </span>
                        <h4 className="text-lg font-light text-[#F1E7DB]">Verified Mentor Endorsements</h4>
                      </div>

                      <div className="space-y-3">
                        {activeView?.mentor_feedback?.endorsements?.map((fb: any, idx: number) => (
                          <div key={idx} className="p-4 rounded-lg bg-[#111111] border border-[#D8C2A6]/15 space-y-2">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <h5 className="text-sm font-medium text-[#F1E7DB]">{fb.mentor_name}</h5>
                                <span className="text-xs text-[#D8C2A6] font-mono block">{fb.mentor_title}</span>
                              </div>
                              {renderVerificationBadge(fb.verification_level)}
                            </div>
                            <p className="text-xs italic text-[#D8C2A6]/90 font-sans leading-relaxed">
                              &ldquo;{fb.endorsement_text}&rdquo;
                            </p>
                            <div className="text-[10px] font-mono text-[#9A9A9A] pt-1">
                              Verified Session: {fb.session_date}
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>

                    {/* SECTION 11: CAREER PREFERENCES */}
                    <section className="p-6 rounded-xl bg-[#161616] border border-[#D8C2A6]/20 space-y-4">
                      <div>
                        <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#A56F7C] block mb-1">
                          SECTION 11 // CAREER PREFERENCES
                        </span>
                        <h4 className="text-lg font-light text-[#F1E7DB]">Target Working Parameters</h4>
                      </div>

                      <div className="p-4 rounded-lg bg-[#111111] border border-[#D8C2A6]/15 space-y-3 font-mono text-xs">
                        <div className="flex items-center justify-between pb-2 border-b border-[#D8C2A6]/10">
                          <span className="text-[#9A9A9A] uppercase">PREFERRED WORK MODE</span>
                          <span className="text-[#F1E7DB] capitalize">{activeView?.career_preferences?.preferred_work_mode}</span>
                        </div>
                        <div className="flex items-center justify-between pb-2 border-b border-[#D8C2A6]/10">
                          <span className="text-[#9A9A9A] uppercase">WEEKLY AVAILABILITY</span>
                          <span className="text-[#F1E7DB]">{activeView?.career_preferences?.available_hours_per_week} Hours / Week</span>
                        </div>
                        <div className="flex items-center justify-between pb-2 border-b border-[#D8C2A6]/10">
                          <span className="text-[#9A9A9A] uppercase">PREFERRED LOCATION</span>
                          <span className="text-[#F1E7DB]">{activeView?.career_preferences?.preferred_location}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[#9A9A9A] uppercase">COMPENSATION EXPECTATION</span>
                          <span className="text-[#D8C2A6]">{activeView?.career_preferences?.compensation_expectation}</span>
                        </div>
                      </div>
                    </section>
                  </div>

                  {/* 12. CANDIDATE-CONTROLLED SHARING SUMMARY */}
                  <section className="p-6 sm:p-8 rounded-xl bg-[#161616] border border-[#D8C2A6]/20 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#A56F7C] block mb-1">
                          SECTION 12 // CANDIDATE-CONTROLLED SHARING
                        </span>
                        <h4 className="text-lg font-light text-[#F1E7DB]">Cryptographic Access State</h4>
                      </div>
                      <button
                        onClick={() => setActiveTab("grants")}
                        className="px-3 py-1.5 rounded-lg bg-[#111111] border border-[#D8C2A6]/25 text-[#D8C2A6] hover:text-[#F1E7DB] text-xs font-mono uppercase tracking-wider flex items-center gap-1.5 self-start"
                      >
                        <Share2 className="w-3 h-3" />
                        <span>Manage Employer Sharing</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
                      <div className="p-4 rounded-lg bg-[#111111] border border-[#D8C2A6]/15">
                        <span className="text-[#9A9A9A] text-[10px] uppercase block">SHARING STATUS</span>
                        <span className="text-emerald-400 font-semibold block mt-1">
                          {activeView?.candidate_controlled_sharing?.is_public_share_enabled ? "CANDIDATE AUTHORIZED" : "STRICTLY PRIVATE"}
                        </span>
                      </div>
                      <div className="p-4 rounded-lg bg-[#111111] border border-[#D8C2A6]/15">
                        <span className="text-[#9A9A9A] text-[10px] uppercase block">ACTIVE EMPLOYER GRANTS</span>
                        <span className="text-[#D8C2A6] font-semibold block mt-1">
                          {activeView?.candidate_controlled_sharing?.active_employer_grants?.length || 0} Authorized Organizations
                        </span>
                      </div>
                      <div className="p-4 rounded-lg bg-[#111111] border border-[#D8C2A6]/15">
                        <span className="text-[#9A9A9A] text-[10px] uppercase block">ACCESS LOG AUDITING</span>
                        <span className="text-[#F1E7DB] block mt-1">
                          {accessLogs.length} Sensitive View Audits
                        </span>
                      </div>
                    </div>

                    <p className="text-[11px] text-[#9A9A9A] font-mono border-t border-[#D8C2A6]/10 pt-3">
                      {activeView?.compliance_disclaimer ||
                        "GFG Verified Career Passport 2.0 represents candidate-authorized professional qualifications, verified coursework, and assessed technical competencies. GFG does not issue government degrees directly."}
                    </p>
                  </section>
                </div>
              )}

              {/* TAB 3: CAREER BREAK & PRIVACY CONTROLS */}
              {activeTab === "privacy" && (
                <div className="max-w-4xl mx-auto space-y-8">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#A56F7C] block mb-1">
                      CANDIDATE DATA SOVEREIGNTY
                    </span>
                    <h3 className="text-2xl font-light text-[#F1E7DB]">Career Break & Privacy Governance</h3>
                    <p className="text-xs text-[#9A9A9A] font-mono mt-1">
                      You maintain complete autonomy over what prospective employers can inspect. Private by default.
                    </p>
                  </div>

                  {/* CAREER BREAK DISPLAY SELECTOR */}
                  <div className="p-6 rounded-xl bg-[#161616] border border-[#D8C2A6]/20 space-y-4">
                    <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-[#A56F7C]" />
                      <h4 className="text-base font-medium text-[#F1E7DB]">Career Break Display Mode</h4>
                    </div>
                    <p className="text-xs text-[#D8C2A6]/90 font-mono leading-relaxed">
                      Choose how your sabbatical or caregiving pause is represented on your timeline when prospective employers view your passport:
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Option 1: Full */}
                      <button
                        type="button"
                        onClick={() => setBreakMode("full")}
                        className={`p-4 rounded-xl border text-left transition-all ${
                          breakMode === "full"
                            ? "bg-[#A56F7C]/20 border-[#A56F7C] text-[#F1E7DB] shadow-sm"
                            : "bg-[#111111] border-[#D8C2A6]/15 text-[#9A9A9A] hover:border-[#D8C2A6]/35"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-mono uppercase tracking-wider font-semibold text-[#D8C2A6]">
                            Show Dates & Reason
                          </span>
                          {breakMode === "full" && <Check className="w-4 h-4 text-[#A56F7C]" />}
                        </div>
                        <p className="text-[11px] font-sans leading-relaxed">
                          Displays your break timeframe and candidate-provided context (e.g., &ldquo;Parenting & Childcare&rdquo;).
                        </p>
                      </button>

                      {/* Option 2: Dates Only */}
                      <button
                        type="button"
                        onClick={() => setBreakMode("dates_only")}
                        className={`p-4 rounded-xl border text-left transition-all ${
                          breakMode === "dates_only"
                            ? "bg-[#D8C2A6]/20 border-[#D8C2A6] text-[#F1E7DB] shadow-sm"
                            : "bg-[#111111] border-[#D8C2A6]/15 text-[#9A9A9A] hover:border-[#D8C2A6]/35"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-mono uppercase tracking-wider font-semibold text-[#D8C2A6]">
                            Dates Only (Recommended)
                          </span>
                          {breakMode === "dates_only" && <Check className="w-4 h-4 text-[#D8C2A6]" />}
                        </div>
                        <p className="text-[11px] font-sans leading-relaxed">
                          Displays the duration timeframe only with neutral continuity indicator (&ldquo;Career Sabbatical&rdquo;).
                        </p>
                      </button>

                      {/* Option 3: Hidden */}
                      <button
                        type="button"
                        onClick={() => setBreakMode("hidden")}
                        className={`p-4 rounded-xl border text-left transition-all ${
                          breakMode === "hidden"
                            ? "bg-purple-950/40 border-purple-400 text-[#F1E7DB] shadow-sm"
                            : "bg-[#111111] border-[#D8C2A6]/15 text-[#9A9A9A] hover:border-[#D8C2A6]/35"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-mono uppercase tracking-wider font-semibold text-purple-300">
                            Completely Omit
                          </span>
                          {breakMode === "hidden" && <Check className="w-4 h-4 text-purple-400" />}
                        </div>
                        <p className="text-[11px] font-sans leading-relaxed">
                          Does not render the career pause entry on the employer timeline at all. Focuses purely on accomplishments.
                        </p>
                      </button>
                    </div>
                  </div>

                  {/* GRANULAR PRIVACY TOGGLES */}
                  <div className="p-6 rounded-xl bg-[#161616] border border-[#D8C2A6]/20 space-y-4">
                    <h4 className="text-base font-medium text-[#F1E7DB]">Granular Employer Visibility Toggles</h4>
                    <p className="text-xs text-[#9A9A9A] font-mono">
                      Enable or disable individual sections before generating shareable links or downloading PDFs:
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        { key: "show_contact_email", label: "Disclose Contact Email", desc: "Allow verified employers to view your email address" },
                        { key: "show_salary_expectation", label: "Disclose Salary Expectations", desc: "Show target compensation range in employer view" },
                        { key: "show_previous_employment", label: "Include Employment History", desc: "Show previous employers, roles, and achievements" },
                        { key: "show_portfolio_projects", label: "Include Capstone Projects", desc: "Show technical capstones and repository links" },
                        { key: "show_practical_assessments", label: "Include Assessment Results", desc: "Display verified coding and data challenge scores" },
                        { key: "show_mentor_feedback", label: "Include Mentor Endorsements", desc: "Display vetted guidance and feedback records" },
                      ].map((item) => (
                        <div
                          key={item.key}
                          className="p-3.5 rounded-lg bg-[#111111] border border-[#D8C2A6]/15 flex items-start justify-between gap-3"
                        >
                          <div>
                            <span className="text-xs font-mono font-medium text-[#F1E7DB] block">{item.label}</span>
                            <span className="text-[11px] text-[#9A9A9A]">{item.desc}</span>
                          </div>
                          <input
                            type="checkbox"
                            checked={(visibilitySettings as any)[item.key]}
                            onChange={(e) =>
                              setVisibilitySettings((prev) => ({
                                ...prev,
                                [item.key]: e.target.checked,
                              }))
                            }
                            className="w-4 h-4 mt-1 accent-[#A56F7C] cursor-pointer shrink-0"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* SAVE ACTION */}
                  <div className="flex items-center justify-between pt-4">
                    <p className="text-xs font-mono text-[#9A9A9A]">
                      Changes update immediately for all active employer share links and PDF exports.
                    </p>
                    <button
                      onClick={handleSavePrivacy}
                      disabled={isSaving}
                      className="px-6 py-2.5 rounded-lg bg-[#F1E7DB] text-[#111111] hover:bg-white text-xs font-mono uppercase tracking-wider font-semibold transition-all flex items-center gap-2 shadow"
                    >
                      {isSaving && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                      <span>Save Privacy Settings</span>
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 4: EMPLOYER ACCESS GRANTS & REVOCATION */}
              {activeTab === "grants" && (
                <div className="max-w-4xl mx-auto space-y-8">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#A56F7C] block mb-1">
                      SECURITY & GOVERNANCE
                    </span>
                    <h3 className="text-2xl font-light text-[#F1E7DB]">Employer Access Grants & Revocation</h3>
                    <p className="text-xs text-[#9A9A9A] font-mono mt-1">
                      Grant temporary, revocable access tokens to specific recruiters. You can revoke access anytime with one click.
                    </p>
                  </div>

                  {/* CREATE NEW GRANT FORM */}
                  <div className="p-6 rounded-xl bg-[#161616] border border-[#D8C2A6]/20 space-y-4">
                    <div className="flex items-center gap-2">
                      <Share2 className="w-5 h-5 text-[#D8C2A6]" />
                      <h4 className="text-base font-medium text-[#F1E7DB]">Authorize New Hiring Partner</h4>
                    </div>

                    <form onSubmit={handleCreateGrant} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="text-[10px] font-mono uppercase text-[#9A9A9A] block mb-1">
                          RECRUITER / HIRING EMAIL *
                        </label>
                        <input
                          type="email"
                          required
                          value={grantEmail}
                          onChange={(e) => setGrantEmail(e.target.value)}
                          placeholder="talent@company.com"
                          className="w-full px-3 py-2 rounded-lg bg-[#111111] border border-[#D8C2A6]/20 text-xs font-mono text-[#F1E7DB] focus:outline-none focus:border-[#D8C2A6]"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-mono uppercase text-[#9A9A9A] block mb-1">
                          ORGANIZATION / COMPANY
                        </label>
                        <input
                          type="text"
                          value={grantOrg}
                          onChange={(e) => setGrantOrg(e.target.value)}
                          placeholder="e.g. Razorpay, Nova Tech"
                          className="w-full px-3 py-2 rounded-lg bg-[#111111] border border-[#D8C2A6]/20 text-xs font-mono text-[#F1E7DB] focus:outline-none focus:border-[#D8C2A6]"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-mono uppercase text-[#9A9A9A] block mb-1">
                          VALIDITY DURATION
                        </label>
                        <select
                          value={grantDays}
                          onChange={(e) => setGrantDays(Number(e.target.value))}
                          className="w-full px-3 py-2 rounded-lg bg-[#111111] border border-[#D8C2A6]/20 text-xs font-mono text-[#F1E7DB] focus:outline-none focus:border-[#D8C2A6]"
                        >
                          <option value={7}>7 Days (Confidential)</option>
                          <option value={14}>14 Days (Standard Sprint)</option>
                          <option value={30}>30 Days (Interview Cycle)</option>
                          <option value={90}>90 Days (Quarterly Returnship)</option>
                        </select>
                      </div>

                      <div className="md:col-span-3 flex justify-end pt-2">
                        <button
                          type="submit"
                          disabled={isSaving}
                          className="px-5 py-2 rounded-lg bg-[#D8C2A6] text-[#111111] hover:bg-[#F1E7DB] text-xs font-mono uppercase tracking-wider font-semibold transition-all flex items-center gap-2"
                        >
                          {isSaving && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                          <span>Generate Time-Limited Access Grant</span>
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* ACTIVE GRANTS TABLE */}
                  <div className="p-6 rounded-xl bg-[#161616] border border-[#D8C2A6]/20 space-y-4">
                    <h4 className="text-base font-medium text-[#F1E7DB]">Active Access Grants</h4>

                    {activeView?.candidate_controlled_sharing?.active_employer_grants?.length === 0 ? (
                      <p className="text-xs font-mono text-[#9A9A9A] py-4 text-center">
                        No active employer grants. Your passport is completely private.
                      </p>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left font-mono text-xs">
                          <thead className="border-b border-[#D8C2A6]/15 text-[10px] text-[#9A9A9A] uppercase">
                            <tr>
                              <th className="pb-2.5">RECIPIENT</th>
                              <th className="pb-2.5">ORGANIZATION</th>
                              <th className="pb-2.5">EXPIRES AT</th>
                              <th className="pb-2.5">STATUS</th>
                              <th className="pb-2.5 text-right">ACTION</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#D8C2A6]/10">
                            {activeView?.candidate_controlled_sharing?.active_employer_grants?.map((g: any) => (
                              <tr key={g.id} className="hover:bg-white/[0.02]">
                                <td className="py-3 text-[#F1E7DB]">{g.grantee_email}</td>
                                <td className="py-3 text-[#D8C2A6]">{g.grantee_organization || "Independent Recruiter"}</td>
                                <td className="py-3 text-[#9A9A9A]">
                                  {g.expires_at ? new Date(g.expires_at).toLocaleDateString() : "Never"}
                                </td>
                                <td className="py-3">
                                  <span className="px-2 py-0.5 rounded-full text-[10px] uppercase bg-emerald-950/80 text-emerald-300 border border-emerald-500/30">
                                    {g.status || "ACTIVE"}
                                  </span>
                                </td>
                                <td className="py-3 text-right">
                                  <button
                                    onClick={() => handleRevokeGrant(g.id)}
                                    title="Revoke access immediately"
                                    className="px-3 py-1 rounded bg-red-950/60 hover:bg-red-900/80 border border-red-500/30 text-red-300 text-[10px] uppercase font-mono tracking-wider transition-all"
                                  >
                                    Revoke Access
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                  {/* SENSITIVE VIEW AUDIT LOGS */}
                  <div className="p-6 rounded-xl bg-[#161616] border border-[#D8C2A6]/20 space-y-4">
                    <div className="flex items-center gap-2">
                      <Shield className="w-5 h-5 text-emerald-400" />
                      <h4 className="text-base font-medium text-[#F1E7DB]">Sensitive View Access Logs</h4>
                    </div>
                    <p className="text-xs text-[#9A9A9A] font-mono">
                      Every employer interaction with your Career Passport is audited and timestamped.
                    </p>

                    <div className="space-y-2">
                      {accessLogs.map((log: any, idx: number) => (
                        <div
                          key={log.id || idx}
                          className="p-3 rounded-lg bg-[#111111] border border-[#D8C2A6]/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2 font-mono text-xs"
                        >
                          <div>
                            <span className="text-[#F1E7DB] font-medium block">
                              {log.viewer_identity} ({log.viewer_role})
                            </span>
                            <span className="text-[10px] text-[#9A9A9A]">
                              Sections inspected: {log.sections_viewed?.join(", ") || "Summary Profile"}
                            </span>
                          </div>
                          <span className="text-[10px] text-[#D8C2A6] shrink-0">
                            {new Date(log.viewed_at).toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: SUBMIT EVIDENCE */}
              {activeTab === "evidence" && (
                <div className="max-w-3xl mx-auto space-y-8">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#A56F7C] block mb-1">
                      VERIFICATION WORKFLOW
                    </span>
                    <h3 className="text-2xl font-light text-[#F1E7DB]">Submit Evidence for Verification</h3>
                    <p className="text-xs text-[#9A9A9A] font-mono mt-1">
                      Upload employment letters, course completion certificates, project repositories, or assessment records.
                    </p>
                  </div>

                  {/* Anti-misleading rule callout */}
                  <div className="p-4 rounded-xl bg-[#1d1618] border border-[#A56F7C]/40 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-[#A56F7C] shrink-0 mt-0.5" />
                    <div>
                      <span className="text-xs font-mono uppercase tracking-wider text-[#F1E7DB] block font-semibold">
                        Verification Integrity Standard
                      </span>
                      <p className="text-xs text-[#D8C2A6] mt-0.5 font-mono leading-relaxed">
                        Do not call uploaded documents verified simply because they exist.
                        All submissions start as &ldquo;Document Submitted, Pending Review&rdquo;. 
                        Authorized human or institutional reviewers audit evidence before granting &ldquo;Independently Verified&rdquo; status. 
                        Private documents are never exposed in public profiles.
                      </p>
                    </div>
                  </div>

                  <form onSubmit={handleSubmitEvidence} className="p-6 sm:p-8 rounded-xl bg-[#161616] border border-[#D8C2A6]/20 space-y-5">
                    <div>
                      <label className="text-[10px] font-mono uppercase text-[#9A9A9A] block mb-1.5">
                        EVIDENCE CATEGORY *
                      </label>
                      <select
                        value={evidenceType}
                        onChange={(e) => setEvidenceType(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-[#111111] border border-[#D8C2A6]/20 text-xs font-mono text-[#F1E7DB] focus:outline-none focus:border-[#D8C2A6]"
                      >
                        <option value="employment_letter">Previous Employment Letter / Relieving Letter</option>
                        <option value="certificate">Course / Technical Certificate</option>
                        <option value="project_evidence">Capstone Project Code / Architectural Document</option>
                        <option value="assessment_result">Practical Assessment Challenge / Test Score</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-mono uppercase text-[#9A9A9A] block mb-1.5">
                        CREDENTIAL / ROLE TITLE *
                      </label>
                      <input
                        type="text"
                        required
                        value={evidenceTitle}
                        onChange={(e) => setEvidenceTitle(e.target.value)}
                        placeholder="e.g. Senior Data Engineer OR AWS Certified Data Analytics"
                        className="w-full px-3 py-2 rounded-lg bg-[#111111] border border-[#D8C2A6]/20 text-xs font-mono text-[#F1E7DB] focus:outline-none focus:border-[#D8C2A6]"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-mono uppercase text-[#9A9A9A] block mb-1.5">
                        ISSUING EMPLOYER / INSTITUTION *
                      </label>
                      <input
                        type="text"
                        required
                        value={evidenceIssuer}
                        onChange={(e) => setEvidenceIssuer(e.target.value)}
                        placeholder="e.g. Apex Global Labs OR Oracle Academy"
                        className="w-full px-3 py-2 rounded-lg bg-[#111111] border border-[#D8C2A6]/20 text-xs font-mono text-[#F1E7DB] focus:outline-none focus:border-[#D8C2A6]"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-mono uppercase text-[#9A9A9A] block mb-1.5">
                        VERIFICATION SOURCE / REFERENCE LINK
                      </label>
                      <input
                        type="text"
                        value={evidenceSource}
                        onChange={(e) => setEvidenceSource(e.target.value)}
                        placeholder="e.g. https://github.com/candidate/capstone OR Certificate ID #88921"
                        className="w-full px-3 py-2 rounded-lg bg-[#111111] border border-[#D8C2A6]/20 text-xs font-mono text-[#F1E7DB] focus:outline-none focus:border-[#D8C2A6]"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-mono uppercase text-[#9A9A9A] block mb-1.5">
                        CONFIDENTIAL AUDIT NOTES (OPTIONAL)
                      </label>
                      <textarea
                        rows={3}
                        value={evidenceNotes}
                        onChange={(e) => setEvidenceNotes(e.target.value)}
                        placeholder="Provide any relevant context for the human reviewer..."
                        className="w-full px-3 py-2 rounded-lg bg-[#111111] border border-[#D8C2A6]/20 text-xs font-mono text-[#F1E7DB] focus:outline-none focus:border-[#D8C2A6]"
                      />
                    </div>

                    <div className="pt-2 flex justify-end">
                      <button
                        type="submit"
                        disabled={isSaving}
                        className="px-6 py-2.5 rounded-lg bg-[#F1E7DB] text-[#111111] hover:bg-white text-xs font-mono uppercase tracking-wider font-semibold transition-all flex items-center gap-2 shadow"
                      >
                        {isSaving && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                        <span>Submit for Verification Review</span>
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </>
          )}
        </div>

        {/* FOOTER BAR */}
        <div className="p-4 sm:p-5 border-t border-[#D8C2A6]/15 bg-[#181818] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono text-[#9A9A9A] shrink-0">
          <div className="flex items-center gap-2">
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            <span>CRYPTOGRAPHICALLY AUDITED BY GFG VERIFIED CAREER PROTOCOL 2.0</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-[#D8C2A6]">
              STATUS: {activeView?.candidate_controlled_sharing?.is_public_share_enabled ? "CANDIDATE AUTHORIZED" : "PRIVATE BY DEFAULT"}
            </span>
            <button
              onClick={handleDownloadPdf}
              className="text-[#F1E7DB] hover:text-[#D8C2A6] underline transition-colors"
            >
              Export PDF
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
