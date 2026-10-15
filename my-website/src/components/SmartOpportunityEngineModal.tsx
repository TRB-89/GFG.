"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Briefcase,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Bookmark,
  BookmarkCheck,
  Send,
  Building2,
  Clock,
  MapPin,
  Sparkles,
  HelpCircle,
  GraduationCap,
  Users,
  Award,
  ChevronRight,
  ExternalLink,
  ShieldCheck,
  Flag,
  RotateCcw,
  RefreshCw,
  Sliders,
  DollarSign,
  HeartHandshake
} from "lucide-react";
import { api, opportunityEngineApi } from "@/lib/api";

export interface SmartOpportunityEngineModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: "explore" | "returnships" | "applications" | "saved";
  initialJobId?: string | null;
  onViewPassport?: () => void;
  onOpenWorkLife?: () => void;
  activeWorkLifeSummary?: string;
}

export function SmartOpportunityEngineModal({
  isOpen,
  onClose,
  defaultTab = "explore",
  initialJobId = null,
  onViewPassport,
  onOpenWorkLife,
  activeWorkLifeSummary,
}: SmartOpportunityEngineModalProps) {
  const [activeTab, setActiveTab] = useState<"explore" | "returnships" | "applications" | "saved">(defaultTab);
  const [jobs, setJobs] = useState<any[]>([]);
  const [returnships, setReturnships] = useState<any[]>([]);
  const [savedJobs, setSavedJobs] = useState<any[]>([]);
  const [myApplications, setMyApplications] = useState<any[]>([]);
  const [sectors, setSectors] = useState<any[]>([]);
  const [opportunityTypes, setOpportunityTypes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSector, setSelectedSector] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedWorkMode, setSelectedWorkMode] = useState<string>("all");
  const [verifiedOnly, setVerifiedOnly] = useState<boolean>(false);

  // Sub-Modals
  const [explainingJob, setExplainingJob] = useState<any | null>(null);
  const [applyingJob, setApplyingJob] = useState<any | null>(null);
  const [applyCoverNote, setApplyCoverNote] = useState<string>("Excited to return to work through this opportunity. My past experience and verified skills make me a great fit for this team.");
  const [isSubmittingApp, setIsSubmittingApp] = useState<boolean>(false);

  // Report Modal
  const [reportingJob, setReportingJob] = useState<any | null>(null);
  const [reportReason, setReportReason] = useState<string>("suspicious_listing");
  const [reportDetails, setReportDetails] = useState<string>("");
  const [isSubmittingReport, setIsSubmittingReport] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      loadInitialData();
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      fetchFilteredJobs();
    }
  }, [searchQuery, selectedSector, selectedType, selectedWorkMode, verifiedOnly, isOpen]);

  const loadInitialData = async () => {
    setIsLoading(true);
    setFeedback(null);
    try {
      const [metaRes, retRes, savedRes, appsRes] = await Promise.all([
        opportunityEngineApi.getSectorsAndTypes().catch(() => null),
        opportunityEngineApi.getCuratedReturnships().catch(() => null),
        opportunityEngineApi.getSavedOpportunities().catch(() => []),
        opportunityEngineApi.getMyApplications().catch(() => []),
      ]);

      if (metaRes?.sectors) setSectors(metaRes.sectors);
      if (metaRes?.opportunity_types) setOpportunityTypes(metaRes.opportunity_types);
      if (retRes?.returnships) setReturnships(retRes.returnships);
      if (savedRes) setSavedJobs(savedRes);
      if (appsRes) setMyApplications(appsRes);

      await fetchFilteredJobs();
    } catch (err: any) {
      console.error("Failed to load opportunity engine data:", err);
      setFeedback({ type: "error", text: "Unable to load live opportunities. Operating in offline demo mode." });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchFilteredJobs = async () => {
    try {
      const res = await opportunityEngineApi.searchOpportunities({
        q: searchQuery.trim() || undefined,
        sector: selectedSector !== "all" ? selectedSector : undefined,
        opportunity_type: selectedType !== "all" ? selectedType : undefined,
        work_mode: selectedWorkMode !== "all" ? selectedWorkMode : undefined,
        is_verified_only: verifiedOnly ? true : undefined,
      });

      if (res?.data) {
        setJobs(res.data);
      }
    } catch (err: any) {
      console.error("Filter jobs error:", err);
    }
  };

  const handleToggleSave = async (job: any, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      if (job.is_saved) {
        await opportunityEngineApi.unsaveOpportunity(job.id);
        job.is_saved = false;
        setSavedJobs((prev) => prev.filter((sj) => sj.id !== job.id));
        setFeedback({ type: "success", text: `Removed '${job.title}' from saved opportunities.` });
      } else {
        await opportunityEngineApi.saveOpportunity(job.id);
        job.is_saved = true;
        setSavedJobs((prev) => [{ ...job, is_saved: true }, ...prev]);
        setFeedback({ type: "success", text: `Saved '${job.title}' to your confidential bookmarks.` });
      }
      setJobs([...jobs]);
    } catch (err: any) {
      setFeedback({ type: "error", text: "Failed to update saved status." });
    }
  };

  const handleOpenApply = (job: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setApplyingJob(job);
    setApplyCoverNote("Excited to return to work through this opportunity. My past experience and verified skills make me a great fit for this team.");
  };

  const handleConfirmApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!applyingJob) return;

    setIsSubmittingApp(true);
    try {
      const res = await api.applyToJob(applyingJob.id, applyCoverNote);
      setFeedback({
        type: "success",
        text: `Application successfully submitted for ${applyingJob.title}! Track progress under 'Application Tracker'.`,
      });
      applyingJob.is_applied = true;
      applyingJob.application_status = "submitted";
      setApplyingJob(null);

      // Refresh applications list
      const apps = await opportunityEngineApi.getMyApplications().catch(() => []);
      setMyApplications(apps);
      setJobs([...jobs]);
    } catch (err: any) {
      setFeedback({ type: "error", text: err.message || "Unable to submit application." });
    } finally {
      setIsSubmittingApp(false);
    }
  };

  const handleWithdrawApplication = async (appId: string, jobTitle: string) => {
    try {
      await opportunityEngineApi.withdrawApplication(appId);
      setFeedback({ type: "success", text: `Application for '${jobTitle}' has been respectfully withdrawn.` });
      const apps = await opportunityEngineApi.getMyApplications().catch(() => []);
      setMyApplications(apps);
    } catch (err: any) {
      setFeedback({ type: "error", text: err.message || "Failed to withdraw application." });
    }
  };

  const handleOpenReport = (job: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setReportingJob(job);
    setReportReason("suspicious_listing");
    setReportDetails("");
  };

  const handleConfirmReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportingJob) return;

    setIsSubmittingReport(true);
    try {
      await opportunityEngineApi.reportOpportunity(reportingJob.id, reportReason, reportDetails);
      setFeedback({
        type: "success",
        text: "Thank you for safeguarding the community. Your report has been submitted to the governance audit team.",
      });
      setReportingJob(null);
    } catch (err: any) {
      setFeedback({ type: "error", text: err.message || "Failed to submit report." });
    } finally {
      setIsSubmittingReport(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="w-full max-w-6xl bg-[#141414] text-[#F1E7DB] rounded-2xl border border-[#D8C2A6]/25 shadow-2xl relative max-h-[92vh] flex flex-col overflow-hidden">
        
        {/* HEADER BAR */}
        <div className="p-6 sm:p-8 border-b border-[#D8C2A6]/15 bg-[#181818]/90 flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
          <div>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-1.5">
              <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#A56F7C]">
                GFG PROTOCOL // MODULE 7
              </span>
              <span className="px-2 py-0.5 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 text-[10px] font-mono uppercase tracking-wider">
                SMART OPPORTUNITY & RETURNSHIP ENGINE
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 text-[10px] font-mono uppercase">
                ZERO PENALTY FOR CAREER BREAKS
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-light tracking-tight text-[#F1E7DB] flex items-center gap-3">
              <span>Smart Opportunity Engine</span>
              <span className="text-xs font-mono font-normal text-[#9A9A9A] border border-[#D8C2A6]/20 px-2 py-0.5 rounded">
                {jobs.length} Active Listings
              </span>
            </h2>
            <p className="text-xs text-[#9A9A9A] mt-1 font-mono">
              Designed specifically for returning women. Filter across 12 sectors, explore structured returnships, and track applications privately.
            </p>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {onViewPassport && (
              <button
                onClick={onViewPassport}
                className="px-3.5 py-2 rounded-lg bg-[#111111] border border-[#D8C2A6]/25 text-[#D8C2A6] hover:text-[#F1E7DB] text-xs font-mono uppercase tracking-wider flex items-center gap-1.5"
              >
                <Award className="w-3.5 h-3.5" />
                <span>My Career Passport</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-[#111111] border border-[#D8C2A6]/20 text-[#9A9A9A] hover:text-[#F1E7DB] hover:bg-white/5 transition-all"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* NOTIFICATION FEEDBACK */}
        {feedback && (
          <div
            className={`px-6 py-2.5 text-xs font-mono tracking-wider flex items-center justify-between border-b ${
              feedback.type === "success"
                ? "bg-emerald-950/80 border-emerald-500/30 text-emerald-200"
                : "bg-red-950/80 border-red-500/30 text-red-200"
            }`}
          >
            <span>{feedback.text}</span>
            <button onClick={() => setFeedback(null)} className="opacity-75 hover:opacity-100">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* FREE ACCESS & SAFETY BANNER */}
        <div className="px-6 sm:px-8 py-2 bg-[#1b1712] border-b border-[#D8C2A6]/10 flex flex-wrap items-center justify-between text-[11px] font-mono text-[#D8C2A6]">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>COMMUNITY SAFETY GUARANTEE: GFG does not charge candidates any fees to search, access, or apply to basic opportunities.</span>
          </div>
          <span className="text-[#9A9A9A] hidden md:inline">Never pay for application or placement fees.</span>
        </div>

        {/* TABS NAVIGATION */}
        <div className="px-6 sm:px-8 border-b border-[#D8C2A6]/15 bg-[#181818]/60 flex items-center gap-2 overflow-x-auto shrink-0 py-2">
          <button
            onClick={() => setActiveTab("explore")}
            className={`px-3 py-2 rounded-lg text-xs font-mono uppercase tracking-wider transition-all flex items-center gap-2 shrink-0 ${
              activeTab === "explore"
                ? "bg-[#F1E7DB] text-[#111111] font-semibold"
                : "text-[#9A9A9A] hover:text-[#F1E7DB] hover:bg-white/5"
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>Explore Opportunities</span>
            <span className="px-1.5 py-0.2 rounded-full bg-white/10 text-[10px] font-mono">
              {jobs.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("returnships")}
            className={`px-3 py-2 rounded-lg text-xs font-mono uppercase tracking-wider transition-all flex items-center gap-2 shrink-0 ${
              activeTab === "returnships"
                ? "bg-purple-900/80 text-purple-200 font-semibold border border-purple-400/40"
                : "text-[#9A9A9A] hover:text-[#F1E7DB] hover:bg-white/5"
            }`}
          >
            <HeartHandshake className="w-3.5 h-3.5 text-purple-400" />
            <span>Structured Returnships</span>
            <span className="px-1.5 py-0.2 rounded-full bg-purple-950 text-purple-300 text-[10px] font-mono">
              Curated
            </span>
          </button>

          <button
            onClick={() => setActiveTab("applications")}
            className={`px-3 py-2 rounded-lg text-xs font-mono uppercase tracking-wider transition-all flex items-center gap-2 shrink-0 ${
              activeTab === "applications"
                ? "bg-[#D8C2A6] text-[#111111] font-semibold"
                : "text-[#9A9A9A] hover:text-[#F1E7DB] hover:bg-white/5"
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>Application Tracker</span>
            {myApplications.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-emerald-950 text-emerald-300 text-[10px] font-mono">
                {myApplications.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("saved")}
            className={`px-3 py-2 rounded-lg text-xs font-mono uppercase tracking-wider transition-all flex items-center gap-2 shrink-0 ${
              activeTab === "saved"
                ? "bg-[#A56F7C] text-[#F1E7DB] font-semibold"
                : "text-[#9A9A9A] hover:text-[#F1E7DB] hover:bg-white/5"
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>Saved Bookmarks</span>
            {savedJobs.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-white/10 text-[10px] font-mono">
                {savedJobs.length}
              </span>
            )}
          </button>
        </div>

        {/* SCROLLABLE BODY */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 bg-[#111111]">
          {/* TAB 1: EXPLORE OPPORTUNITIES */}
          {activeTab === "explore" && (
            <div className="space-y-6">
              {/* SEARCH & FILTERS BAR */}
              <div className="p-4 sm:p-5 rounded-xl bg-[#161616] border border-[#D8C2A6]/20 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  {/* Search Input */}
                  <div className="md:col-span-2 relative">
                    <Search className="w-4 h-4 text-[#9A9A9A] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search title, skills, or company (e.g. Data, Python, Remote)..."
                      className="w-full pl-9 pr-3 py-2 rounded-lg bg-[#111111] border border-[#D8C2A6]/20 text-xs font-mono text-[#F1E7DB] placeholder:text-[#9A9A9A] focus:outline-none focus:border-[#D8C2A6]"
                    />
                  </div>

                  {/* Work Mode Dropdown */}
                  <div>
                    <select
                      value={selectedWorkMode}
                      onChange={(e) => setSelectedWorkMode(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-[#111111] border border-[#D8C2A6]/20 text-xs font-mono text-[#F1E7DB] focus:outline-none focus:border-[#D8C2A6]"
                    >
                      <option value="all">All Work Arrangements</option>
                      <option value="remote">Remote Only</option>
                      <option value="hybrid">Hybrid</option>
                      <option value="onsite">On-Site</option>
                    </select>
                  </div>

                  {/* Verified Only Checkbox */}
                  <label className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-[#111111] border border-[#D8C2A6]/20 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={verifiedOnly}
                      onChange={(e) => setVerifiedOnly(e.target.checked)}
                      className="w-4 h-4 accent-[#A56F7C] cursor-pointer"
                    />
                    <span className="text-xs font-mono text-[#F1E7DB]">Verified Partners Only</span>
                  </label>

                  {/* Work-Life Preferences Trigger Button (Part 6) */}
                  {onOpenWorkLife && (
                    <button
                      type="button"
                      onClick={onOpenWorkLife}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#A56F7C]/15 border border-[#A56F7C]/40 text-[#F1E7DB] text-xs font-mono tracking-wider hover:bg-[#A56F7C]/30 transition-all"
                    >
                      <HeartHandshake className="w-4 h-4 text-[#A56F7C]" />
                      <span>{activeWorkLifeSummary || "Work-Life Fit"}</span>
                    </button>
                  )}
                </div>

                {/* 12 CAREER SECTORS PILLS */}
                <div className="space-y-1.5 pt-1 border-t border-[#D8C2A6]/10">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#9A9A9A] block">
                    CAREER SECTOR:
                  </span>
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-mono">
                    <button
                      onClick={() => setSelectedSector("all")}
                      className={`px-3 py-1 rounded-full shrink-0 transition-all ${
                        selectedSector === "all"
                          ? "bg-[#F1E7DB] text-[#111111] font-semibold"
                          : "bg-[#111111] border border-[#D8C2A6]/15 text-[#9A9A9A] hover:text-[#F1E7DB]"
                      }`}
                    >
                      All Sectors
                    </button>
                    {sectors.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => setSelectedSector(s.id)}
                        className={`px-3 py-1 rounded-full shrink-0 transition-all ${
                          selectedSector === s.id
                            ? "bg-[#D8C2A6] text-[#111111] font-semibold"
                            : "bg-[#111111] border border-[#D8C2A6]/15 text-[#9A9A9A] hover:text-[#F1E7DB]"
                        }`}
                      >
                        {s.name}
                        {s.active_jobs_count > 0 && ` (${s.active_jobs_count})`}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 8 OPPORTUNITY TYPES PILLS */}
                <div className="space-y-1.5 pt-1 border-t border-[#D8C2A6]/10">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#9A9A9A] block">
                    OPPORTUNITY TYPE:
                  </span>
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-mono">
                    <button
                      onClick={() => setSelectedType("all")}
                      className={`px-3 py-1 rounded-full shrink-0 transition-all ${
                        selectedType === "all"
                          ? "bg-[#A56F7C] text-[#F1E7DB] font-semibold"
                          : "bg-[#111111] border border-[#D8C2A6]/15 text-[#9A9A9A] hover:text-[#F1E7DB]"
                      }`}
                    >
                      All Types
                    </button>
                    {opportunityTypes.map((ot) => (
                      <button
                        key={ot.id}
                        onClick={() => setSelectedType(ot.id)}
                        className={`px-3 py-1 rounded-full shrink-0 transition-all ${
                          selectedType === ot.id
                            ? "bg-[#A56F7C] text-[#F1E7DB] font-semibold"
                            : "bg-[#111111] border border-[#D8C2A6]/15 text-[#9A9A9A] hover:text-[#F1E7DB]"
                        }`}
                      >
                        {ot.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* OPPORTUNITY CARDS LIST */}
              {isLoading ? (
                <div className="py-24 text-center space-y-4">
                  <RefreshCw className="w-8 h-8 text-[#D8C2A6] animate-spin mx-auto" />
                  <p className="font-mono text-xs uppercase tracking-wider text-[#9A9A9A]">
                    Matching verified opportunities against your candidate credentials...
                  </p>
                </div>
              ) : jobs.length === 0 ? (
                <div className="py-20 text-center space-y-3 bg-[#161616] rounded-xl border border-[#D8C2A6]/15 p-8">
                  <Briefcase className="w-10 h-10 text-[#9A9A9A] mx-auto" />
                  <h4 className="text-base font-medium text-[#F1E7DB]">No opportunities match your current filters</h4>
                  <p className="text-xs font-mono text-[#9A9A9A] max-w-md mx-auto">
                    Try broadening your selected sector or work arrangement, or toggle off &ldquo;Verified Partners Only&rdquo;.
                  </p>
                  <button
                    onClick={() => {
                      setSelectedSector("all");
                      setSelectedType("all");
                      setSelectedWorkMode("all");
                      setSearchQuery("");
                      setVerifiedOnly(false);
                    }}
                    className="px-4 py-2 rounded-lg bg-[#D8C2A6] text-[#111111] text-xs font-mono font-semibold uppercase tracking-wider"
                  >
                    Reset All Filters
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {jobs.map((job) => (
                    <div
                      key={job.id}
                      className="p-5 sm:p-6 rounded-xl bg-[#161616] border border-[#D8C2A6]/20 hover:border-[#D8C2A6]/40 transition-all space-y-4"
                    >
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                        <div className="space-y-1.5">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-lg font-medium text-[#F1E7DB]">{job.title}</span>
                            
                            {/* Verified Badge vs External Warning */}
                            {job.is_verified_employer ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase bg-emerald-950/80 text-emerald-300 border border-emerald-500/40">
                                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                <span>Verified Partner</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase bg-amber-950/80 text-amber-300 border border-amber-500/40">
                                <AlertTriangle className="w-3 h-3 text-amber-400" />
                                <span>Unverified External</span>
                              </span>
                            )}

                            {/* Returnship Badge */}
                            {(job.opportunity_type === "returnship" || job.employment_type === "returnship") && (
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase bg-purple-950/80 text-purple-300 border border-purple-500/40">
                                Structured Returnship
                              </span>
                            )}
                          </div>

                          <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-[#D8C2A6]">
                            <span className="font-semibold">{job.company_name}</span>
                            <span>•</span>
                            <span className="uppercase">{job.work_mode}</span>
                            <span>•</span>
                            <span>{job.location}</span>
                            <span>•</span>
                            <span className="text-emerald-400 font-medium">{job.stipend_amount_description}</span>
                          </div>

                          <p className="text-xs text-[#D8C2A6]/90 font-sans leading-relaxed max-w-3xl pt-1">
                            {job.description}
                          </p>
                        </div>

                        {/* Match Score & Actions */}
                        <div className="flex md:flex-col items-end justify-between md:justify-start gap-3 shrink-0">
                          {job.compatibility && (
                            <div className="text-right">
                              <span className="px-3 py-1 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/40 font-mono text-xs font-semibold inline-block">
                                {job.compatibility.match_score}% MATCH
                              </span>
                              <button
                                onClick={() => setExplainingJob(job)}
                                className="block text-[11px] font-mono text-[#A56F7C] hover:underline mt-1"
                              >
                                Why this matches →
                              </button>
                            </div>
                          )}

                          <div className="flex items-center gap-2">
                            {/* Bookmark Save Button */}
                            <button
                              onClick={(e) => handleToggleSave(job, e)}
                              title={job.is_saved ? "Remove bookmark" : "Save opportunity privately"}
                              className={`p-2 rounded-lg border transition-all ${
                                job.is_saved
                                  ? "bg-[#A56F7C]/20 border-[#A56F7C] text-[#F1E7DB]"
                                  : "bg-[#111111] border-[#D8C2A6]/20 text-[#9A9A9A] hover:text-[#F1E7DB]"
                              }`}
                            >
                              {job.is_saved ? (
                                <BookmarkCheck className="w-4 h-4 text-[#A56F7C]" />
                              ) : (
                                <Bookmark className="w-4 h-4" />
                              )}
                            </button>

                            {/* Report Flag Button */}
                            <button
                              onClick={(e) => handleOpenReport(job, e)}
                              title="Report suspicious or expired listing"
                              className="p-2 rounded-lg bg-[#111111] border border-[#D8C2A6]/20 text-[#9A9A9A] hover:text-red-400 hover:border-red-500/30 transition-all"
                            >
                              <Flag className="w-4 h-4" />
                            </button>

                            {/* Apply Button */}
                            {job.is_applied ? (
                              <span className="px-4 py-2 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-mono uppercase font-semibold">
                                Applied ✓ ({job.application_status})
                              </span>
                            ) : (
                              <button
                                onClick={(e) => handleOpenApply(job, e)}
                                className="px-4 py-2 rounded-lg bg-[#F1E7DB] text-[#111111] hover:bg-white text-xs font-mono uppercase font-semibold tracking-wider transition-all shadow"
                              >
                                Apply Now
                              </button>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Returnship Details Bar (if returnship) */}
                      {(job.opportunity_type === "returnship" || job.employment_type === "returnship") && (
                        <div className="p-3.5 rounded-lg bg-[#111111] border border-[#D8C2A6]/10 grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-[11px]">
                          <div>
                            <span className="text-[#9A9A9A] uppercase block">DURATION & CONVERSION</span>
                            <span className="text-[#F1E7DB]">
                              {job.duration_months} Months • {job.conversion_rate_percentage}% Conversion Rate
                            </span>
                          </div>
                          <div>
                            <span className="text-[#9A9A9A] uppercase block">MENTORSHIP COMMITMENT</span>
                            <span className="text-purple-300">
                              {job.mentorship_available ? "1:1 Senior Mentor Assigned" : "Cohort Peer Guidance"}
                            </span>
                          </div>
                          <div>
                            <span className="text-[#9A9A9A] uppercase block">ELIGIBILITY</span>
                            <span className="text-[#D8C2A6] truncate block" title={job.eligibility_criteria}>
                              {job.eligibility_criteria}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Required Skills Badges */}
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        <span className="text-[10px] font-mono uppercase text-[#9A9A9A] mr-1">Skills:</span>
                        {job.skills?.map((s: any) => (
                          <span
                            key={s.name}
                            className={`px-2.5 py-0.5 rounded text-[10px] font-mono ${
                              s.required
                                ? "bg-[#181818] border border-[#D8C2A6]/25 text-[#F1E7DB] font-semibold"
                                : "bg-[#111111] border border-[#D8C2A6]/10 text-[#9A9A9A]"
                            }`}
                          >
                            {s.name} {s.required && "*"}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: STRUCTURED RETURNSHIPS */}
          {activeTab === "returnships" && (
            <div className="space-y-6">
              <div className="p-6 rounded-xl bg-[#1d1618] border border-purple-500/30 space-y-2">
                <div className="flex items-center gap-2">
                  <HeartHandshake className="w-5 h-5 text-purple-400" />
                  <h3 className="text-xl font-light text-[#F1E7DB]">Dedicated Returnship Cohorts</h3>
                </div>
                <p className="text-xs text-[#D8C2A6] font-mono leading-relaxed max-w-3xl">
                  Structured returnships are employer-sponsored bridges back to full-time employment. They feature transparent stipends, dedicated 1:1 senior mentorship, refresher technical sprints, and zero penalties for career breaks.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {returnships.map((ret) => (
                  <div
                    key={ret.id}
                    className="p-6 rounded-xl bg-[#161616] border border-[#D8C2A6]/20 hover:border-purple-500/40 transition-all space-y-4 flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <span className="text-[10px] font-mono uppercase text-purple-400 block tracking-wider">
                            {ret.company_name} // STRUCTURED RETURNSHIP
                          </span>
                          <h4 className="text-base font-medium text-[#F1E7DB] mt-0.5">{ret.title}</h4>
                        </div>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase bg-emerald-950 text-emerald-300 border border-emerald-500/30">
                          {ret.stipend_or_salary_type?.toUpperCase()}
                        </span>
                      </div>

                      <div className="p-3 rounded-lg bg-[#111111] border border-[#D8C2A6]/10 space-y-1.5 font-mono text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-[#9A9A9A]">STIPEND:</span>
                          <span className="text-emerald-400 font-semibold">{ret.stipend_amount_description}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[#9A9A9A]">DURATION:</span>
                          <span className="text-[#F1E7DB]">{ret.duration_months} Months ({ret.hours_per_day || 4} hrs/day)</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[#9A9A9A]">CONVERSION TRAJECTORY:</span>
                          <span className="text-purple-300 font-semibold">{ret.conversion_rate_percentage}% Permanent Conversion</span>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <span className="text-[10px] font-mono uppercase text-[#9A9A9A] block">LEARNING CURRICULUM:</span>
                        <p className="text-xs text-[#D8C2A6]/90 font-sans leading-relaxed">
                          {ret.learning_objectives}
                        </p>
                      </div>

                      <div className="space-y-1">
                        <span className="text-[10px] font-mono uppercase text-[#9A9A9A] block">ELIGIBILITY:</span>
                        <p className="text-xs text-[#D8C2A6]/90 font-sans leading-relaxed">
                          {ret.eligibility_criteria}
                        </p>
                      </div>
                    </div>

                    <div className="pt-2 flex items-center justify-between border-t border-[#D8C2A6]/10">
                      <button
                        onClick={() => setExplainingJob(ret)}
                        className="text-xs font-mono text-[#A56F7C] hover:underline"
                      >
                        Match Analysis →
                      </button>

                      {ret.is_applied ? (
                        <span className="px-4 py-1.5 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-mono uppercase font-semibold">
                          Applied ✓
                        </span>
                      ) : (
                        <button
                          onClick={(e) => handleOpenApply(ret, e)}
                          className="px-4 py-1.5 rounded-lg bg-[#D8C2A6] text-[#111111] hover:bg-[#F1E7DB] text-xs font-mono uppercase font-semibold"
                        >
                          Apply to Returnship
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: APPLICATION TRACKER */}
          {activeTab === "applications" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-xl font-light text-[#F1E7DB]">Confidential Application Tracker</h3>
                  <p className="text-xs font-mono text-[#9A9A9A] mt-0.5">
                    Your applications and stages are stored privately. Employers can only view applications you explicitly submitted.
                  </p>
                </div>
                <span className="text-xs font-mono text-[#D8C2A6] border border-[#D8C2A6]/20 px-3 py-1 rounded-full">
                  {myApplications.length} Active Submissions
                </span>
              </div>

              {myApplications.length === 0 ? (
                <div className="py-20 text-center space-y-3 bg-[#161616] rounded-xl border border-[#D8C2A6]/15 p-8">
                  <Send className="w-10 h-10 text-[#9A9A9A] mx-auto" />
                  <h4 className="text-base font-medium text-[#F1E7DB]">No active applications yet</h4>
                  <p className="text-xs font-mono text-[#9A9A9A] max-w-md mx-auto">
                    Browse opportunities in the &ldquo;Explore Opportunities&rdquo; tab and apply with your verified Career Passport.
                  </p>
                  <button
                    onClick={() => setActiveTab("explore")}
                    className="px-4 py-2 rounded-lg bg-[#D8C2A6] text-[#111111] text-xs font-mono font-semibold uppercase tracking-wider"
                  >
                    Explore Positions
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {myApplications.map((app) => {
                    const status = app.status || "submitted";
                    const stages = ["applied", "assessment", "interview", "offer", "joined"];
                    const isWithdrawn = status === "withdrawn" || status === "closed";

                    return (
                      <div
                        key={app.id}
                        className="p-6 rounded-xl bg-[#161616] border border-[#D8C2A6]/20 space-y-4"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                          <div>
                            <span className="text-[10px] font-mono uppercase text-[#A56F7C] block">
                              {app.company_name}
                            </span>
                            <h4 className="text-lg font-medium text-[#F1E7DB]">{app.job_title}</h4>
                            <div className="flex items-center gap-3 text-xs font-mono text-[#9A9A9A] mt-1">
                              <span>Applied: {new Date(app.applied_at).toLocaleDateString()}</span>
                              <span>•</span>
                              <span className="capitalize">{app.job_work_mode}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-mono uppercase font-semibold border ${
                                status === "withdrawn"
                                  ? "bg-red-950/60 border-red-500/30 text-red-300"
                                  : "bg-emerald-950/60 border-emerald-500/40 text-emerald-300"
                              }`}
                            >
                              Status: {status}
                            </span>

                            {!isWithdrawn && (
                              <button
                                onClick={() => handleWithdrawApplication(app.id, app.job_title)}
                                className="px-3 py-1 rounded bg-red-950/60 hover:bg-red-900 border border-red-500/30 text-red-300 text-[10px] font-mono uppercase tracking-wider transition-all"
                              >
                                Withdraw
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Pipeline Stage Visualizer */}
                        {!isWithdrawn && (
                          <div className="p-4 rounded-lg bg-[#111111] border border-[#D8C2A6]/10 space-y-2">
                            <span className="text-[10px] font-mono uppercase text-[#9A9A9A] block">
                              PIPELINE PROGRESSION:
                            </span>
                            <div className="grid grid-cols-5 gap-2 text-center font-mono text-[10px]">
                              {stages.map((st, idx) => {
                                const currentIdx = stages.indexOf(status === "submitted" || status === "under_review" ? "applied" : status);
                                const isPassed = currentIdx >= idx;
                                const isCurrent = currentIdx === idx;

                                return (
                                  <div
                                    key={st}
                                    className={`p-2 rounded border transition-all ${
                                      isCurrent
                                        ? "bg-[#D8C2A6] text-[#111111] font-semibold border-[#D8C2A6]"
                                        : isPassed
                                        ? "bg-emerald-950/80 border-emerald-500/40 text-emerald-300"
                                        : "bg-[#181818] border-[#D8C2A6]/10 text-[#9A9A9A]"
                                    }`}
                                  >
                                    <span className="uppercase block">{st}</span>
                                    {isPassed && !isCurrent && <span>✓</span>}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {app.cover_note && (
                          <div className="text-xs text-[#9A9A9A] font-sans border-t border-[#D8C2A6]/10 pt-2">
                            <span className="font-mono text-[10px] uppercase text-[#D8C2A6] block mb-0.5">Cover Note Sent:</span>
                            &ldquo;{app.cover_note}&rdquo;
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: SAVED BOOKMARKS */}
          {activeTab === "saved" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-light text-[#F1E7DB]">Confidential Bookmarked Opportunities</h3>
                  <p className="text-xs font-mono text-[#9A9A9A] mt-0.5">
                    Saved opportunities are visible only to you. Apply whenever you feel ready.
                  </p>
                </div>
                <span className="text-xs font-mono text-[#A56F7C] border border-[#A56F7C]/30 px-3 py-1 rounded-full">
                  {savedJobs.length} Bookmarks
                </span>
              </div>

              {savedJobs.length === 0 ? (
                <div className="py-20 text-center space-y-3 bg-[#161616] rounded-xl border border-[#D8C2A6]/15 p-8">
                  <Bookmark className="w-10 h-10 text-[#9A9A9A] mx-auto" />
                  <h4 className="text-base font-medium text-[#F1E7DB]">No saved opportunities yet</h4>
                  <p className="text-xs font-mono text-[#9A9A9A] max-w-md mx-auto">
                    Click the bookmark icon on any opportunity in &ldquo;Explore Opportunities&rdquo; to save it here.
                  </p>
                  <button
                    onClick={() => setActiveTab("explore")}
                    className="px-4 py-2 rounded-lg bg-[#D8C2A6] text-[#111111] text-xs font-mono font-semibold uppercase tracking-wider"
                  >
                    Browse Opportunities
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {savedJobs.map((job) => (
                    <div
                      key={job.id}
                      className="p-5 rounded-xl bg-[#161616] border border-[#D8C2A6]/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-base font-medium text-[#F1E7DB]">{job.title}</h4>
                          <span className="text-xs font-mono text-emerald-400 font-semibold">
                            {job.compatibility?.match_score || 85}% Match
                          </span>
                        </div>
                        <div className="text-xs font-mono text-[#D8C2A6] mt-1">
                          {job.company_name} • {job.location} • {job.stipend_amount_description}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => handleToggleSave(job, e)}
                          className="px-3 py-1.5 rounded-lg bg-[#111111] border border-[#D8C2A6]/20 text-[#9A9A9A] hover:text-[#F1E7DB] text-xs font-mono"
                        >
                          Remove
                        </button>
                        <button
                          onClick={(e) => handleOpenApply(job, e)}
                          className="px-4 py-1.5 rounded-lg bg-[#F1E7DB] text-[#111111] hover:bg-white text-xs font-mono uppercase font-semibold"
                        >
                          Apply Now
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="p-4 sm:p-5 border-t border-[#D8C2A6]/15 bg-[#181818] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono text-[#9A9A9A] shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-[#D8C2A6]" />
            <span>ETHICAL RETURN-MATCHING: Career-break durations and reasons are never used as negative ranking factors.</span>
          </div>
          <span className="text-[#D8C2A6]">
            GFG SMART MATCH ENGINE // 2026
          </span>
        </div>

      </div>

      {/* SUB-MODAL 1: DETAILED MATCH EXPLANATION */}
      {explainingJob && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-2xl bg-[#161616] text-[#F1E7DB] rounded-xl border border-[#D8C2A6]/30 p-6 sm:p-8 space-y-6 max-h-[85vh] overflow-y-auto relative">
            <button
              onClick={() => setExplainingJob(null)}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-white/10 text-[#F1E7DB]"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#A56F7C] block mb-1">
                TRANSPARENT MATCH DIAGNOSTICS
              </span>
              <h3 className="text-2xl font-light text-[#F1E7DB]">Why You Match This Role</h3>
              <p className="text-xs font-mono text-[#D8C2A6] mt-0.5">
                {explainingJob.title} • {explainingJob.company_name}
              </p>
            </div>

            {/* Score Breakdown Pill */}
            {explainingJob.compatibility && (
              <div className="p-4 rounded-xl bg-[#111111] border border-[#D8C2A6]/20 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono text-[#9A9A9A] uppercase block">OVERALL COMPATIBILITY</span>
                  <span className="text-3xl font-light text-emerald-400">
                    {explainingJob.compatibility.match_score}%
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 font-mono text-[10px] text-right">
                  <div>Skills: <span className="text-[#F1E7DB] font-semibold">{explainingJob.compatibility.breakdown?.skills}/35</span></div>
                  <div>Experience: <span className="text-[#F1E7DB] font-semibold">{explainingJob.compatibility.breakdown?.experience}/20</span></div>
                  <div>Eligibility: <span className="text-[#F1E7DB] font-semibold">{explainingJob.compatibility.breakdown?.eligibility}/20</span></div>
                  <div>Availability: <span className="text-[#F1E7DB] font-semibold">{explainingJob.compatibility.breakdown?.availability}/10</span></div>
                  <div>Work Mode: <span className="text-[#F1E7DB] font-semibold">{explainingJob.compatibility.breakdown?.work_mode}/10</span></div>
                  <div>Location: <span className="text-[#F1E7DB] font-semibold">{explainingJob.compatibility.breakdown?.location}/5</span></div>
                </div>
              </div>
            )}

            {/* 1. Requirements Satisfied */}
            <div className="space-y-2">
              <span className="text-xs font-mono uppercase tracking-wider font-semibold text-emerald-400 block">
                Requirements Satisfied:
              </span>
              <div className="space-y-1.5">
                {explainingJob.compatibility?.match_explanation?.requirements_satisfied?.map((req: string, idx: number) => (
                  <div key={idx} className="flex items-start gap-2 text-xs font-mono text-[#F1E7DB]">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{req}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. Important Missing Skills */}
            {explainingJob.compatibility?.match_explanation?.important_missing_skills?.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-mono uppercase tracking-wider font-semibold text-amber-400 block">
                  Competencies to Acquire:
                </span>
                <div className="flex flex-wrap gap-2">
                  {explainingJob.compatibility.match_explanation.important_missing_skills.map((sk: string) => (
                    <span
                      key={sk}
                      className="px-2.5 py-1 rounded bg-amber-950/60 border border-amber-500/30 text-amber-300 text-xs font-mono"
                    >
                      {sk}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* 3. Working Arrangement Compatibility */}
            <div className="space-y-1">
              <span className="text-xs font-mono uppercase tracking-wider font-semibold text-[#D8C2A6] block">
                Working Arrangement Synergy:
              </span>
              <p className="text-xs font-sans text-[#D8C2A6]/90 leading-relaxed bg-[#111111] p-3 rounded-lg border border-[#D8C2A6]/10">
                {explainingJob.compatibility?.match_explanation?.working_arrangement_compatibility}
              </p>
            </div>

            {/* 4. Actionable Areas for Improvement */}
            <div className="space-y-2">
              <span className="text-xs font-mono uppercase tracking-wider font-semibold text-[#A56F7C] block">
                Recommended Actions:
              </span>
              <div className="space-y-1.5">
                {explainingJob.compatibility?.match_explanation?.areas_for_improvement?.map((area: string, idx: number) => (
                  <div key={idx} className="text-xs font-mono text-[#D8C2A6] flex items-start gap-2">
                    <ChevronRight className="w-3.5 h-3.5 text-[#A56F7C] shrink-0 mt-0.5" />
                    <span>{area}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Ethics Safeguard Disclaimer */}
            <div className="p-3 rounded-lg bg-[#111111] border border-[#D8C2A6]/15 text-[11px] font-mono text-[#9A9A9A]">
              <span className="text-[#D8C2A6] uppercase block font-semibold mb-0.5">Ethical Algorithm Notice:</span>
              {explainingJob.compatibility?.match_explanation?.disclaimer ||
                "Do not imply that a match score predicts hiring probability. Match scores assess qualification alignment only. Career break reasons are never penalized."}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setExplainingJob(null)}
                className="px-5 py-2 rounded-lg bg-[#F1E7DB] text-[#111111] text-xs font-mono font-semibold uppercase"
              >
                Close Explanation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUB-MODAL 2: APPLICATION CONFIRMATION */}
      {applyingJob && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg bg-[#161616] text-[#F1E7DB] rounded-xl border border-[#D8C2A6]/30 p-6 sm:p-8 space-y-5 relative">
            <button
              onClick={() => setApplyingJob(null)}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-white/10 text-[#F1E7DB]"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-emerald-400 block mb-1">
                SUPPORTED APPLICATION FLOW
              </span>
              <h3 className="text-xl font-light text-[#F1E7DB]">Apply for {applyingJob.title}</h3>
              <p className="text-xs font-mono text-[#D8C2A6] mt-0.5">
                {applyingJob.company_name} • {applyingJob.location}
              </p>
            </div>

            <form onSubmit={handleConfirmApply} className="space-y-4">
              <div>
                <label className="text-[10px] font-mono uppercase text-[#9A9A9A] block mb-1">
                  CANDIDATE COVER NOTE (CONFIDENTIAL)
                </label>
                <textarea
                  rows={4}
                  value={applyCoverNote}
                  onChange={(e) => setApplyCoverNote(e.target.value)}
                  placeholder="Share a short note on your motivation and readiness to return..."
                  className="w-full px-3 py-2 rounded-lg bg-[#111111] border border-[#D8C2A6]/20 text-xs font-mono text-[#F1E7DB] focus:outline-none focus:border-[#D8C2A6]"
                />
              </div>

              <div className="p-3 rounded-lg bg-[#111111] border border-[#D8C2A6]/10 text-[11px] font-mono text-[#9A9A9A]">
                Your Verified Career Passport 2.0 (with your chosen career-break privacy filters) will be securely transmitted to the authorized recruiter.
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setApplyingJob(null)}
                  className="px-4 py-2 rounded-lg bg-[#111111] border border-[#D8C2A6]/20 text-[#9A9A9A] text-xs font-mono"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingApp}
                  className="px-5 py-2 rounded-lg bg-[#F1E7DB] text-[#111111] hover:bg-white text-xs font-mono uppercase font-semibold flex items-center gap-2"
                >
                  {isSubmittingApp && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>Submit Application</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SUB-MODAL 3: REPORT SUSPICIOUS LISTING */}
      {reportingJob && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-[#161616] text-[#F1E7DB] rounded-xl border border-red-500/40 p-6 sm:p-8 space-y-5 relative">
            <button
              onClick={() => setReportingJob(null)}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-white/10 text-[#F1E7DB]"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-red-400 block mb-1">
                COMMUNITY SAFETY & INTEGRITY
              </span>
              <h3 className="text-xl font-light text-[#F1E7DB]">Report Suspicious Listing</h3>
              <p className="text-xs font-mono text-[#9A9A9A] mt-0.5">
                {reportingJob.title} • {reportingJob.company_name}
              </p>
            </div>

            <form onSubmit={handleConfirmReport} className="space-y-4">
              <div>
                <label className="text-[10px] font-mono uppercase text-[#9A9A9A] block mb-1">
                  REASON FOR REPORT *
                </label>
                <select
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#111111] border border-[#D8C2A6]/20 text-xs font-mono text-[#F1E7DB] focus:outline-none focus:border-[#D8C2A6]"
                >
                  <option value="suspicious_listing">Suspicious or Fraudulent Listing</option>
                  <option value="scam_fee_requested">Fee or Payment Requested (Violation)</option>
                  <option value="expired">Expired or Inactive Opportunity</option>
                  <option value="misleading_salary">Misleading Compensation or Details</option>
                  <option value="other">Other Violation</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-mono uppercase text-[#9A9A9A] block mb-1">
                  DETAILS / EVIDENCE (OPTIONAL)
                </label>
                <textarea
                  rows={3}
                  value={reportDetails}
                  onChange={(e) => setReportDetails(e.target.value)}
                  placeholder="Please describe why this opportunity requires review..."
                  className="w-full px-3 py-2 rounded-lg bg-[#111111] border border-[#D8C2A6]/20 text-xs font-mono text-[#F1E7DB] focus:outline-none focus:border-[#D8C2A6]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setReportingJob(null)}
                  className="px-4 py-2 rounded-lg bg-[#111111] border border-[#D8C2A6]/20 text-[#9A9A9A] text-xs font-mono"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingReport}
                  className="px-5 py-2 rounded-lg bg-red-800 hover:bg-red-700 text-white text-xs font-mono uppercase font-semibold flex items-center gap-2"
                >
                  {isSubmittingReport && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>Submit Safety Report</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
