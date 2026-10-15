"use client";

import React, { useState, useEffect } from "react";
import {
  Building2,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Users,
  Briefcase,
  FileText,
  BarChart3,
  Sparkles,
  AlertCircle,
  Copy,
  Download,
  ExternalLink,
  ChevronRight,
  Eye,
  EyeOff,
  PlusCircle,
  Lock,
  ArrowUpRight,
  TrendingUp,
  X,
  RefreshCw,
  Search,
  Filter,
  Award,
  GitBranch,
  Info
} from "lucide-react";
import { employerIntelligenceApi } from "@/lib/api";

interface EmployerIntelligenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: "dashboard" | "candidates" | "builder" | "toolkit" | "analytics" | "verification";
}

export default function EmployerIntelligenceModal({
  isOpen,
  onClose,
  initialTab = "dashboard",
}: EmployerIntelligenceModalProps) {
  const [activeTab, setActiveTab] = useState<
    "dashboard" | "candidates" | "builder" | "toolkit" | "analytics" | "verification"
  >(initialTab);

  // Loading states & data
  const [loading, setLoading] = useState<boolean>(true);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [consentPolicy, setConsentPolicy] = useState<any>(null);
  const [toolkitTemplates, setToolkitTemplates] = useState<any>(null);
  const [selectedTemplateKey, setSelectedTemplateKey] = useState<string>("skills_based_interview_rubric");
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [orgProfile, setOrgProfile] = useState<any>(null);

  // Match Explainability Modal
  const [explainCandidate, setExplainCandidate] = useState<any | null>(null);
  const [matchAnalysis, setMatchAnalysis] = useState<any | null>(null);
  const [isExplaining, setIsExplaining] = useState<boolean>(false);

  // Copy notification
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);

  // Candidate Search & Filter
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Returnship Builder Form State
  const [builderForm, setBuilderForm] = useState({
    program_title: "Cloud Infrastructure & Platform SRE Returnship Fellowship",
    job_function: "DevOps & Cloud Systems",
    duration_months: 4,
    compensation_stipend: "₹85,000 / month guaranteed stipend + medical insurance",
    working_arrangement: "Hybrid (2 days/wk Bengaluru office, 3 days remote)",
    eligibility_criteria: "Minimum 12-month career pause. Prior engineering experience in Linux, Python, or distributed systems.",
    learning_objectives: "Modern Kubernetes orchestration, Terraform IAC, and production incident response runbooks.",
    mentor_assignment: "Sunita Rao (Principal Site Reliability Engineer)",
    evaluation_criteria: "Capstone delivery at week 12, peer code review quality, and production shadowing at week 16.",
    potential_progression_options: "Direct conversion to full-time Senior Site Reliability Engineer.",
  });
  const [builderSuccess, setBuilderSuccess] = useState<string | null>(null);

  // Organization Registration Form State
  const [regForm, setRegForm] = useState({
    company_name: "Nova Technologies",
    official_website: "https://novatech-demo.example.com",
    authorized_representative: "Pooja Hegde (Director of People & Talent)",
    business_contact_email: "talent@novatech.com",
    business_contact_phone: "+91 80 4912 3000",
    industry: "Enterprise Cloud & Applied Intelligence",
    location: "Bengaluru, Karnataka (Hybrid)",
    company_size: "250-500 employees",
    hiring_charter_accepted: true,
  });
  const [regNotice, setRegNotice] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadAllEmployerData();
    }
  }, [isOpen]);

  const loadAllEmployerData = async () => {
    setLoading(true);
    try {
      const [dash, cands, toolkits, analytics, logs, prof] = await Promise.all([
        employerIntelligenceApi.getDashboard(),
        employerIntelligenceApi.getConsentedCandidates(),
        employerIntelligenceApi.getHRToolkitTemplates(),
        employerIntelligenceApi.getAnalytics(),
        employerIntelligenceApi.getAuditLogs(),
        employerIntelligenceApi.getProfile(),
      ]);

      setDashboardData(dash.dashboard_metrics ? dash : dash.data || dash);
      setCandidates(cands.candidates || (cands.data && cands.data.candidates) || []);
      setConsentPolicy(cands.consent_policy || (cands.data && cands.data.consent_policy) || null);
      setToolkitTemplates(toolkits.templates || (toolkits.data && toolkits.data.templates) || null);
      setAnalyticsData(analytics.analytics || (analytics.data && analytics.data.analytics) || analytics);
      setAuditLogs(logs.audit_logs || (logs.data && logs.data.audit_logs) || []);
      setOrgProfile(prof.profile || (prof.data && prof.data.profile) || prof);
    } catch (err) {
      console.warn("Employer data loading error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleExplainMatch = async (candidate: any) => {
    setExplainCandidate(candidate);
    setIsExplaining(true);
    try {
      const res = await employerIntelligenceApi.explainMatch({
        candidate_id: candidate.candidate_id,
        candidate_name: candidate.full_name,
        job_title: candidate.target_role,
        years_pre_break_experience: candidate.years_pre_break_experience,
        assessment_score: candidate.evidence_categories?.assessment_supported_skills?.[0]?.score || 90,
        verified_credentials: candidate.evidence_categories?.verified_credentials?.map((c: any) => c.credential) || [],
        portfolio_projects: candidate.evidence_categories?.portfolio_projects?.map((p: any) => p.project) || [],
      });
      setMatchAnalysis(res.match_analysis || res.data?.match_analysis || res);
    } catch (err) {
      console.error("Match explain error:", err);
    } finally {
      setIsExplaining(false);
    }
  };

  const handleAdvanceStatus = async (appId: string | number, newStatus: string) => {
    try {
      await employerIntelligenceApi.advanceApplication(appId, {
        new_status: newStatus,
        reviewer_name: "Nova Tech Recruiter",
        notes: `Advanced to ${newStatus} via recruiter pipeline desk.`
      });
      // Refresh dashboard & logs
      const updatedDash = await employerIntelligenceApi.getDashboard();
      setDashboardData(updatedDash.dashboard_metrics ? updatedDash : updatedDash.data || updatedDash);
      const updatedLogs = await employerIntelligenceApi.getAuditLogs();
      setAuditLogs(updatedLogs.audit_logs || (updatedLogs.data && updatedLogs.data.audit_logs) || []);
    } catch (err) {
      console.error("Advance status error:", err);
    }
  };

  const handleCreateReturnship = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await employerIntelligenceApi.createReturnship({
        program_title: builderForm.program_title,
        job_function: builderForm.job_function,
        duration_months: Number(builderForm.duration_months),
        compensation_stipend: builderForm.compensation_stipend,
        working_arrangement: builderForm.working_arrangement,
        eligibility_criteria: builderForm.eligibility_criteria,
        learning_objectives: builderForm.learning_objectives.split("\n"),
        mentor_assignment: builderForm.mentor_assignment,
        evaluation_criteria: builderForm.evaluation_criteria.split("\n"),
        potential_progression_options: builderForm.potential_progression_options,
      });
      setBuilderSuccess("Returnship program successfully published to active candidate directory! Logged to employer audit trail.");
      setTimeout(() => setBuilderSuccess(null), 6000);
      loadAllEmployerData();
    } catch (err) {
      console.error("Create returnship error:", err);
    }
  };

  const handleRegisterOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await employerIntelligenceApi.registerOrganization(regForm);
      setRegNotice(res.verification_notice || "Registration received and queued for manual compliance review.");
      loadAllEmployerData();
    } catch (err: any) {
      alert(err.message || "Registration failed.");
    }
  };

  const copyTemplateMarkdown = (markdown: string, title: string) => {
    navigator.clipboard.writeText(markdown);
    setCopyFeedback(`Copied "${title}" to clipboard!`);
    setTimeout(() => setCopyFeedback(null), 3000);
  };

  const downloadTemplateMarkdown = (markdown: string, filename: string) => {
    const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${filename.toLowerCase().replace(/\s+/g, "_")}.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!isOpen) return null;

  const filteredCandidates = candidates.filter((c) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.full_name?.toLowerCase().includes(q) ||
      c.target_role?.toLowerCase().includes(q) ||
      JSON.stringify(c.evidence_categories || {}).toLowerCase().includes(q)
    );
  });

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="employer-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 md:p-6 overflow-y-auto"
    >
      <div className="relative w-full max-w-6xl bg-[#141414] border border-[#2A2A2A] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Top Fictional Demo Banner */}
        <div className="bg-[#1C1814] border-b border-[#3D3126] px-5 py-2.5 flex items-center justify-between text-xs text-[#D8C2A6]">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#34271D] text-[#E5B582] font-medium border border-[#523B26]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              DEMO WORKSPACE
            </span>
            <span className="font-serif">
              <strong>Nova Technologies Recruiter Desk</strong> — Fictional Organizational Account
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-3 text-[11px] text-[#A69584]">
            <span className="inline-flex items-center gap-1">
              <Lock className="w-3 h-3 text-[#A56F7C]" />
              Candidate Privacy Protected
            </span>
            <span>•</span>
            <span>No Unverified Diversity Claims</span>
          </div>
        </div>

        {/* Header with Organization Branding & Navigation Tabs */}
        <div className="px-6 py-4 bg-[#181818] border-b border-[#262626] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#3D2C2E] to-[#1E191A] border border-[#5A3F45] flex items-center justify-center shadow-inner">
              <Building2 className="w-6 h-6 text-[#E7C1C9]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 id="employer-modal-title" className="text-lg font-serif font-bold text-[#F1E7DB]">
                  {orgProfile?.name || "Nova Technologies"}
                </h1>
                <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider bg-emerald-950/80 text-emerald-300 border border-emerald-800">
                  Verified Employer
                </span>
              </div>
              <p className="text-xs text-[#9E9080]">
                Module 10 • Employer Intelligence, Returnship Toolkit & Fair Evidence Matching
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadAllEmployerData}
              title="Refresh Workspace"
              aria-label="Refresh Workspace"
              className="p-2 rounded-lg bg-[#222222] hover:bg-[#2A2A2A] text-[#C2B29F] transition-colors border border-[#333333]"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-[#A56F7C]" : ""}`} />
            </button>
            <button
              onClick={onClose}
              aria-label="Close Employer Workspace"
              className="p-2 rounded-lg bg-[#222222] hover:bg-[#2F2124] text-[#C2B29F] hover:text-[#E7C1C9] transition-colors border border-[#333333]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation Bar */}
        <div className="px-6 bg-[#181818] border-b border-[#262626] flex items-center gap-1 overflow-x-auto scrollbar-none text-xs">
          {[
            { id: "dashboard", label: "Pipeline Dashboard", icon: BarChart3 },
            { id: "candidates", label: "Consented Discovery", icon: Users },
            { id: "builder", label: "Returnship Builder", icon: Briefcase },
            { id: "toolkit", label: "HR Toolkit Playbooks", icon: FileText },
            { id: "analytics", label: "Employer Analytics", icon: TrendingUp },
            { id: "verification", label: "Org Charter & Audit", icon: ShieldCheck },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-3 px-3.5 flex items-center gap-2 font-medium border-b-2 transition-all whitespace-nowrap ${
                  isActive
                    ? "border-[#A56F7C] text-[#F1E7DB] bg-[#221B1D]"
                    : "border-transparent text-[#9E9080] hover:text-[#D8C2A6] hover:bg-[#1E1E1E]"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? "text-[#E7C1C9]" : "text-[#7A6E60]"}`} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Feedback Alert */}
        {copyFeedback && (
          <div className="bg-emerald-950/80 border-b border-emerald-800 text-emerald-200 text-xs px-6 py-2 flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            {copyFeedback}
          </div>
        )}

        {/* Modal Main Content Container */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 text-[#E1D7CD]">
          {/* TAB 1: PIPELINE DASHBOARD */}
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              {/* KPI Stat Cards */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
                {[
                  {
                    label: "Active Tracks",
                    value: dashboardData?.dashboard_metrics?.active_opportunities ?? 3,
                    sub: "Published fellowships",
                    color: "text-[#D8C2A6]"
                  },
                  {
                    label: "Total Applications",
                    value: dashboardData?.dashboard_metrics?.applications_received ?? 18,
                    sub: "100% consent verified",
                    color: "text-[#E7C1C9]"
                  },
                  {
                    label: "Interviews Active",
                    value: dashboardData?.dashboard_metrics?.interviews_scheduled ?? 6,
                    sub: "Structured rubric",
                    color: "text-amber-200"
                  },
                  {
                    label: "Offers Extended",
                    value: dashboardData?.dashboard_metrics?.offers_made ?? 3,
                    sub: "Equal pay parity",
                    color: "text-purple-200"
                  },
                  {
                    label: "Fellows Onboarded",
                    value: dashboardData?.dashboard_metrics?.candidates_onboarded ?? 2,
                    sub: "In current cohort",
                    color: "text-emerald-300"
                  },
                ].map((stat, idx) => (
                  <div key={idx} className="bg-[#1C1C1C] border border-[#2D2D2D] rounded-xl p-3.5">
                    <p className="text-[11px] text-[#8E8070] font-medium uppercase tracking-wider">{stat.label}</p>
                    <p className={`text-2xl font-serif font-bold mt-1 ${stat.color}`}>{stat.value}</p>
                    <p className="text-[10px] text-[#786D5F] mt-0.5">{stat.sub}</p>
                  </div>
                ))}
              </div>

              {/* Returnship Cohort Progress */}
              <div className="bg-[#1C1C1C] border border-[#2E2E2E] rounded-xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-sm font-serif font-bold text-[#F1E7DB]">Active Returnship Cohort Runway</h2>
                    <p className="text-xs text-[#8E8070]">16-week structured milestone tracking and dedicated 1:1 mentor syncs</p>
                  </div>
                  <span className="px-2.5 py-1 rounded bg-[#2D2426] text-[#E7C1C9] text-xs font-semibold border border-[#4D353A]">
                    Cohort: Autumn 2026
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-[#B8A896]">
                    <span>Week 7 of 16 (Full-Stack & Cloud Systems Fellowship)</span>
                    <span className="font-mono text-emerald-400">43.8% Completed</span>
                  </div>
                  <div className="w-full bg-[#141414] h-2.5 rounded-full overflow-hidden border border-[#2C2C2C]">
                    <div className="bg-gradient-to-r from-[#A56F7C] to-emerald-500 h-full w-[43.8%] rounded-full transition-all duration-500" />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-[#7A6D5D] pt-1">
                    <span>Mentors Assigned: Sunita Rao (Principal SRE), Vikram Seth (Staff Architect)</span>
                    <span>Next Milestone: Week 8 Architecture Review</span>
                  </div>
                </div>
              </div>

              {/* Active Applications Queue */}
              <div className="bg-[#1C1C1C] border border-[#2E2E2E] rounded-xl overflow-hidden">
                <div className="px-5 py-3.5 bg-[#202020] border-b border-[#2C2C2C] flex items-center justify-between">
                  <h2 className="text-sm font-serif font-bold text-[#F1E7DB]">Recent Candidate Applications</h2>
                  <span className="text-xs text-[#8E8070]">Role-based permission: Recruiter Desk</span>
                </div>

                <div className="divide-y divide-[#262626]">
                  {dashboardData?.applications?.map((app: any) => (
                    <div key={app.application_id} className="p-4 hover:bg-[#202020] transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm text-[#F1E7DB]">{app.candidate_name}</span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#2C2124] text-[#E7C1C9] border border-[#4D353A]">
                            Match: {app.match_score}%
                          </span>
                          <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-900">
                            <ShieldCheck className="w-3 h-3" />
                            Consent Active
                          </span>
                        </div>
                        <p className="text-xs text-[#9E9080]">{app.job_title}</p>
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {app.skills_preview?.map((s: string, idx: number) => (
                            <span key={idx} className="text-[10px] px-2 py-0.5 bg-[#141414] text-[#B8A896] rounded border border-[#2D2D2D]">
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right text-xs">
                          <p className="text-[#8E8070]">Status</p>
                          <p className="font-semibold capitalize text-[#E7C1C9]">{app.status.replace("_", " ")}</p>
                        </div>
                        <select
                          value={app.status}
                          onChange={(e) => handleAdvanceStatus(app.application_id, e.target.value)}
                          className="text-xs bg-[#141414] border border-[#3D3D3D] text-[#E1D7CD] rounded-lg px-2.5 py-1.5 focus:border-[#A56F7C] focus:outline-none"
                        >
                          <option value="under_review">Reviewing</option>
                          <option value="shortlisted">Shortlisted</option>
                          <option value="interview_scheduled">Interview Scheduled</option>
                          <option value="offer_extended">Offer Extended</option>
                          <option value="onboarded">Onboarded</option>
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CONSENT-BASED CANDIDATE DISCOVERY */}
          {activeTab === "candidates" && (
            <div className="space-y-5">
              {/* Consent Policy Banner */}
              <div className="bg-[#1C1819] border border-[#422D31] rounded-xl p-4 flex items-start gap-3 text-xs">
                <ShieldCheck className="w-5 h-5 text-[#E7C1C9] shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-semibold text-[#F1E7DB]">Dignity & Privacy Protocol — Candidate Sharing Enforced</p>
                  <p className="text-[#B8A896]">
                    Employers access only candidates who explicitly opted in. Raw caregiving, maternal, or health details are
                    automatically masked to eliminate gap bias. Candidates maintain the unconditional right to revoke profile access at any time.
                  </p>
                </div>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7A6D5D]" />
                <input
                  type="text"
                  placeholder="Filter by candidate competencies (e.g. SQL, Kubernetes, Python, Power BI)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#181818] border border-[#2F2F2F] rounded-xl pl-10 pr-4 py-2.5 text-xs text-[#F1E7DB] placeholder-[#6E6355] focus:border-[#A56F7C] focus:outline-none"
                />
              </div>

              {/* Candidate Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredCandidates.map((cand) => (
                  <div
                    key={cand.candidate_id}
                    className="bg-[#1A1A1A] border border-[#2B2B2B] hover:border-[#423136] rounded-xl p-5 space-y-4 transition-all shadow-sm"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-serif font-bold text-base text-[#F1E7DB]">{cand.full_name}</h3>
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-800">
                            Consented
                          </span>
                        </div>
                        <p className="text-xs text-[#9E9080] mt-0.5">{cand.target_role}</p>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-mono font-bold text-[#E7C1C9] bg-[#2E2124] px-2.5 py-1 rounded border border-[#4D3339]">
                          {cand.overall_match_score}% Match
                        </span>
                      </div>
                    </div>

                    {/* Masked Career Break Note */}
                    <div className="bg-[#141414] rounded-lg p-2.5 border border-[#262626] flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        {cand.break_reason_masked ? (
                          <EyeOff className="w-3.5 h-3.5 text-[#A56F7C]" />
                        ) : (
                          <Eye className="w-3.5 h-3.5 text-emerald-400" />
                        )}
                        <span className="text-[#A69584]">
                          {cand.years_pre_break_experience}y pre-break exp • {cand.break_duration_months}m pause
                        </span>
                      </div>
                      <span className="text-[10px] text-[#8C7D6F] italic max-w-[200px] truncate">
                        {cand.break_display_summary}
                      </span>
                    </div>

                    {/* Skill Breakdown Categories */}
                    <div className="space-y-2 text-xs">
                      <p className="text-[11px] font-medium text-[#7E7163] uppercase tracking-wider">
                        Categorized Evidence
                      </p>

                      {/* 1. Assessment-Supported */}
                      <div className="bg-[#171717] p-2 rounded border border-[#242424] space-y-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-semibold text-emerald-400 flex items-center gap-1">
                            <Award className="w-3 h-3" /> Assessment-Supported Skills (35% weight)
                          </span>
                          <span className="font-mono text-emerald-300">
                            {cand.evidence_categories?.assessment_supported_skills?.[0]?.score}% Top Percentile
                          </span>
                        </div>
                        <p className="text-[11px] text-[#A69888]">
                          {cand.evidence_categories?.assessment_supported_skills?.map((s: any) => `${s.skill} (${s.score}%)`).join(", ")}
                        </p>
                      </div>

                      {/* 2. Verified Credentials */}
                      <div className="bg-[#171717] p-2 rounded border border-[#242424] space-y-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-semibold text-[#E7C1C9] flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3" /> Verified Credentials (25% weight)
                          </span>
                          <span className="text-[10px] text-emerald-400 font-mono">Cryptographically Verified</span>
                        </div>
                        <p className="text-[11px] text-[#A69888]">
                          {cand.evidence_categories?.verified_credentials?.map((c: any) => c.credential).join(" • ")}
                        </p>
                      </div>

                      {/* 3. Portfolio Repos */}
                      <div className="bg-[#171717] p-2 rounded border border-[#242424] space-y-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-semibold text-amber-300 flex items-center gap-1">
                            <GitBranch className="w-3 h-3" /> Portfolio Projects (25% weight)
                          </span>
                          <span className="text-[10px] text-amber-200">Public Code Available</span>
                        </div>
                        <p className="text-[11px] text-[#A69888]">
                          {cand.evidence_categories?.portfolio_projects?.map((p: any) => p.project).join(" • ")}
                        </p>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-[#262626] flex items-center justify-between">
                      <span className="text-[11px] text-[#7A6D5E]">
                        Revocation: Candidate can revoke access at any time
                      </span>
                      <button
                        onClick={() => handleExplainMatch(cand)}
                        className="px-3 py-1.5 rounded-lg bg-[#2D2124] hover:bg-[#3D2C30] text-[#E7C1C9] text-xs font-medium border border-[#523A3F] flex items-center gap-1.5 transition-colors"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-[#E7C1C9]" />
                        Explain Match Evidence
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: RETURNSHIP PROGRAM BUILDER */}
          {activeTab === "builder" && (
            <div className="max-w-3xl mx-auto space-y-5">
              <div>
                <h2 className="text-base font-serif font-bold text-[#F1E7DB]">Structured Returnship Program Builder</h2>
                <p className="text-xs text-[#9E9080]">
                  Create paid, structured on-ramps featuring milestone goals, dedicated mentors, and guaranteed transparent stipends.
                </p>
              </div>

              {builderSuccess && (
                <div className="p-4 rounded-xl bg-emerald-950/70 border border-emerald-800 text-emerald-200 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  {builderSuccess}
                </div>
              )}

              <form onSubmit={handleCreateReturnship} className="bg-[#191919] border border-[#2B2B2B] rounded-xl p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-[#C2B29F]">Program Title</label>
                    <input
                      type="text"
                      required
                      value={builderForm.program_title}
                      onChange={(e) => setBuilderForm({ ...builderForm, program_title: e.target.value })}
                      className="w-full bg-[#121212] border border-[#333333] rounded-lg px-3 py-2 text-xs text-[#F1E7DB] focus:border-[#A56F7C] focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-[#C2B29F]">Job Function / Sector</label>
                    <input
                      type="text"
                      required
                      value={builderForm.job_function}
                      onChange={(e) => setBuilderForm({ ...builderForm, job_function: e.target.value })}
                      className="w-full bg-[#121212] border border-[#333333] rounded-lg px-3 py-2 text-xs text-[#F1E7DB] focus:border-[#A56F7C] focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-[#C2B29F]">Duration (Months)</label>
                    <select
                      value={builderForm.duration_months}
                      onChange={(e) => setBuilderForm({ ...builderForm, duration_months: Number(e.target.value) })}
                      className="w-full bg-[#121212] border border-[#333333] rounded-lg px-3 py-2 text-xs text-[#F1E7DB] focus:border-[#A56F7C] focus:outline-none"
                    >
                      <option value={3}>3 Months (12 Weeks Accelerated)</option>
                      <option value={4}>4 Months (16 Weeks Standard)</option>
                      <option value={6}>6 Months (24 Weeks Comprehensive)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-[#C2B29F]">Compensation / Monthly Stipend</label>
                    <input
                      type="text"
                      required
                      value={builderForm.compensation_stipend}
                      onChange={(e) => setBuilderForm({ ...builderForm, compensation_stipend: e.target.value })}
                      className="w-full bg-[#121212] border border-[#333333] rounded-lg px-3 py-2 text-xs text-[#F1E7DB] focus:border-[#A56F7C] focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-[#C2B29F]">Working Arrangement</label>
                    <input
                      type="text"
                      required
                      value={builderForm.working_arrangement}
                      onChange={(e) => setBuilderForm({ ...builderForm, working_arrangement: e.target.value })}
                      className="w-full bg-[#121212] border border-[#333333] rounded-lg px-3 py-2 text-xs text-[#F1E7DB] focus:border-[#A56F7C] focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-[#C2B29F]">Assigned 1:1 Returnship Mentor</label>
                    <input
                      type="text"
                      required
                      value={builderForm.mentor_assignment}
                      onChange={(e) => setBuilderForm({ ...builderForm, mentor_assignment: e.target.value })}
                      className="w-full bg-[#121212] border border-[#333333] rounded-lg px-3 py-2 text-xs text-[#F1E7DB] focus:border-[#A56F7C] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-[#C2B29F]">Eligibility Criteria (Career-Break Inclusive)</label>
                  <textarea
                    rows={2}
                    value={builderForm.eligibility_criteria}
                    onChange={(e) => setBuilderForm({ ...builderForm, eligibility_criteria: e.target.value })}
                    className="w-full bg-[#121212] border border-[#333333] rounded-lg p-2.5 text-xs text-[#F1E7DB] focus:border-[#A56F7C] focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-[#C2B29F]">Learning Objectives & Sprints</label>
                  <textarea
                    rows={2}
                    value={builderForm.learning_objectives}
                    onChange={(e) => setBuilderForm({ ...builderForm, learning_objectives: e.target.value })}
                    className="w-full bg-[#121212] border border-[#333333] rounded-lg p-2.5 text-xs text-[#F1E7DB] focus:border-[#A56F7C] focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-[#C2B29F]">Evaluation Criteria (Milestone-Based)</label>
                  <textarea
                    rows={2}
                    value={builderForm.evaluation_criteria}
                    onChange={(e) => setBuilderForm({ ...builderForm, evaluation_criteria: e.target.value })}
                    className="w-full bg-[#121212] border border-[#333333] rounded-lg p-2.5 text-xs text-[#F1E7DB] focus:border-[#A56F7C] focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-[#C2B29F]">Potential Permanent Progression Options</label>
                  <input
                    type="text"
                    value={builderForm.potential_progression_options}
                    onChange={(e) => setBuilderForm({ ...builderForm, potential_progression_options: e.target.value })}
                    className="w-full bg-[#121212] border border-[#333333] rounded-lg px-3 py-2 text-xs text-[#F1E7DB] focus:border-[#A56F7C] focus:outline-none"
                  />
                </div>

                <div className="pt-3 flex justify-end">
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#A56F7C] to-[#8C5A66] hover:from-[#B67E8B] hover:to-[#9B6572] text-[#F1E7DB] text-xs font-semibold shadow-lg shadow-[#A56F7C]/20 transition-all flex items-center gap-2"
                  >
                    <PlusCircle className="w-4 h-4" />
                    Publish Returnship Fellowship Track
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 4: HR TOOLKIT PLAYBOOKS */}
          {activeTab === "toolkit" && (
            <div className="space-y-5">
              <div>
                <h2 className="text-base font-serif font-bold text-[#F1E7DB]">Inclusive HR & Returnship Toolkit</h2>
                <p className="text-xs text-[#9E9080]">
                  Standardized evaluation rubrics, unconscious gap bias mitigation charters, and first-100-days runways.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {toolkitTemplates &&
                  Object.entries(toolkitTemplates).map(([key, tpl]: [string, any]) => {
                    const isSelected = selectedTemplateKey === key;
                    return (
                      <button
                        key={key}
                        onClick={() => setSelectedTemplateKey(key)}
                        className={`text-left p-3.5 rounded-xl border transition-all ${
                          isSelected
                            ? "bg-[#251D20] border-[#A56F7C] text-[#F1E7DB]"
                            : "bg-[#181818] border-[#2A2A2A] text-[#A69584] hover:bg-[#1E1E1E]"
                        }`}
                      >
                        <span className="text-[10px] uppercase font-bold tracking-wider text-[#A56F7C]">
                          {tpl.category}
                        </span>
                        <h4 className="font-serif font-bold text-xs mt-1 text-[#F1E7DB] line-clamp-1">{tpl.title}</h4>
                        <p className="text-[11px] text-[#7A6D5D] mt-1 line-clamp-2">{tpl.purpose}</p>
                      </button>
                    );
                  })}
              </div>

              {/* Template Previewer Card */}
              {toolkitTemplates && toolkitTemplates[selectedTemplateKey] && (
                <div className="bg-[#181818] border border-[#2D2D2D] rounded-xl p-5 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#282828] gap-3">
                    <div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#2E2024] text-[#E7C1C9] border border-[#4F333A]">
                        {toolkitTemplates[selectedTemplateKey].category}
                      </span>
                      <h3 className="text-sm font-serif font-bold text-[#F1E7DB] mt-1.5">
                        {toolkitTemplates[selectedTemplateKey].title}
                      </h3>
                      <p className="text-xs text-[#8E8070]">{toolkitTemplates[selectedTemplateKey].purpose}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          copyTemplateMarkdown(
                            toolkitTemplates[selectedTemplateKey].content_markdown,
                            toolkitTemplates[selectedTemplateKey].title
                          )
                        }
                        className="px-3 py-1.5 rounded-lg bg-[#222222] hover:bg-[#2C2C2C] text-xs text-[#E1D7CD] border border-[#383838] flex items-center gap-1.5 transition-colors"
                      >
                        <Copy className="w-3.5 h-3.5 text-[#E7C1C9]" />
                        Copy Markdown
                      </button>
                      <button
                        onClick={() =>
                          downloadTemplateMarkdown(
                            toolkitTemplates[selectedTemplateKey].content_markdown,
                            toolkitTemplates[selectedTemplateKey].title
                          )
                        }
                        className="px-3 py-1.5 rounded-lg bg-[#2A1F22] hover:bg-[#38282C] text-xs text-[#E7C1C9] border border-[#523A40] flex items-center gap-1.5 transition-colors"
                      >
                        <Download className="w-3.5 h-3.5 text-[#E7C1C9]" />
                        Download .md
                      </button>
                    </div>
                  </div>

                  {/* Structured Sections Preview */}
                  <div className="space-y-3">
                    {toolkitTemplates[selectedTemplateKey].sections?.map((sec: any, idx: number) => (
                      <div key={idx} className="bg-[#131313] border border-[#242424] rounded-lg p-3.5 space-y-1">
                        <p className="text-xs font-semibold text-[#E7C1C9]">{sec.section_title}</p>
                        <p className="text-xs text-[#D8C2A6]">{sec.prompt}</p>
                        {sec.rubric_scoring && (
                          <p className="text-[11px] text-[#7A6D5E] font-mono mt-1 bg-[#1A1A1A] p-1.5 rounded border border-[#292929]">
                            {sec.rubric_scoring}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: EMPLOYER ANALYTICS (With Explicit Formulas) */}
          {activeTab === "analytics" && (
            <div className="space-y-5">
              <div>
                <h2 className="text-base font-serif font-bold text-[#F1E7DB]">Empirical Employer Analytics & Formulas</h2>
                <p className="text-xs text-[#9E9080]">
                  Pipeline conversions and retention rates backed by exact mathematical formulas.
                  GFG does not publish speculative diversity quotas or unverified ROI savings.
                </p>
              </div>

              {/* Data Integrity Notice */}
              <div className="bg-[#181818] border border-[#2D2D2D] rounded-xl p-4 flex items-center gap-3 text-xs text-[#A69584]">
                <Info className="w-4 h-4 text-[#A56F7C] shrink-0" />
                <span>{analyticsData?.data_integrity_statement}</span>
              </div>

              {/* Formula & Metric Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {analyticsData?.kpis?.map((kpi: any, idx: number) => (
                  <div key={idx} className="bg-[#191919] border border-[#2B2B2B] rounded-xl p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-[#8E8070] font-medium">{kpi.metric}</span>
                      <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#2D2225] text-[#E7C1C9] border border-[#4A3237]">
                        {kpi.benchmark}
                      </span>
                    </div>

                    <p className="text-2xl font-serif font-bold text-[#F1E7DB]">{kpi.value}</p>

                    <div className="bg-[#121212] p-2 rounded border border-[#222222]">
                      <p className="text-[10px] text-[#786B5C] uppercase tracking-wider font-semibold">Mathematical Formula</p>
                      <p className="text-[11px] font-mono text-[#C4B4A2] mt-0.5">{kpi.formula}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: ORG VERIFICATION & AUDIT TRAIL */}
          {activeTab === "verification" && (
            <div className="space-y-6">
              {/* Verification & Compliance Status */}
              <div className="bg-[#181818] border border-[#2B2B2B] rounded-xl p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-serif font-bold text-[#F1E7DB]">Organization Verification Status</h3>
                    <p className="text-xs text-[#9E9080]">
                      Employer registration does not automatically grant verified status. All credentials undergo human compliance review.
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800 flex items-center gap-1.5 self-start">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Verified Organization Account
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="bg-[#131313] p-3 rounded-lg border border-[#242424]">
                    <span className="text-[#7A6D5E]">Authorized Representative</span>
                    <p className="font-medium text-[#F1E7DB] mt-0.5">{orgProfile?.authorized_representative || "Pooja Hegde"}</p>
                  </div>
                  <div className="bg-[#131313] p-3 rounded-lg border border-[#242424]">
                    <span className="text-[#7A6D5E]">Official Contact Email</span>
                    <p className="font-medium text-[#F1E7DB] mt-0.5">{orgProfile?.business_contact_email || "talent@novatech.com"}</p>
                  </div>
                  <div className="bg-[#131313] p-3 rounded-lg border border-[#242424]">
                    <span className="text-[#7A6D5E]">Caregiving Charter Commitment</span>
                    <p className="font-medium text-emerald-400 mt-0.5">Signed & Active</p>
                  </div>
                </div>
              </div>

              {/* Organization Re-Verification / Registration Form */}
              <div className="bg-[#181818] border border-[#2B2B2B] rounded-xl p-5 space-y-4">
                <h3 className="text-sm font-serif font-bold text-[#F1E7DB]">Employer Registration & Onboarding Test Desk</h3>
                <p className="text-xs text-[#9E9080]">
                  Test onboarding of new organizations. Per acceptance criteria, new registrations default to &quot;pending_review&quot; and never automatically issue verified badges.
                </p>

                {regNotice && (
                  <div className="p-3 bg-[#241A1D] border border-[#4D3339] rounded-lg text-xs text-[#E7C1C9]">
                    {regNotice}
                  </div>
                )}

                <form onSubmit={handleRegisterOrg} className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="text-[#A69584]">Organization Name</label>
                    <input
                      type="text"
                      required
                      value={regForm.company_name}
                      onChange={(e) => setRegForm({ ...regForm, company_name: e.target.value })}
                      className="w-full mt-1 bg-[#131313] border border-[#2E2E2E] rounded px-3 py-2 text-[#F1E7DB]"
                    />
                  </div>
                  <div>
                    <label className="text-[#A69584]">Official Website</label>
                    <input
                      type="text"
                      required
                      value={regForm.official_website}
                      onChange={(e) => setRegForm({ ...regForm, official_website: e.target.value })}
                      className="w-full mt-1 bg-[#131313] border border-[#2E2E2E] rounded px-3 py-2 text-[#F1E7DB]"
                    />
                  </div>
                  <div>
                    <label className="text-[#A69584]">Authorized Representative</label>
                    <input
                      type="text"
                      required
                      value={regForm.authorized_representative}
                      onChange={(e) => setRegForm({ ...regForm, authorized_representative: e.target.value })}
                      className="w-full mt-1 bg-[#131313] border border-[#2E2E2E] rounded px-3 py-2 text-[#F1E7DB]"
                    />
                  </div>
                  <div>
                    <label className="text-[#A69584]">Business Email</label>
                    <input
                      type="email"
                      required
                      value={regForm.business_contact_email}
                      onChange={(e) => setRegForm({ ...regForm, business_contact_email: e.target.value })}
                      className="w-full mt-1 bg-[#131313] border border-[#2E2E2E] rounded px-3 py-2 text-[#F1E7DB]"
                    />
                  </div>
                  <div className="sm:col-span-2 flex items-center gap-2 pt-1">
                    <input
                      type="checkbox"
                      id="charter-check"
                      checked={regForm.hiring_charter_accepted}
                      onChange={(e) => setRegForm({ ...regForm, hiring_charter_accepted: e.target.checked })}
                      className="rounded accent-[#A56F7C]"
                    />
                    <label htmlFor="charter-check" className="text-[11px] text-[#B8A896]">
                      We solemnly pledge adherence to the GFG Non-Discriminatory and Caregiving-Dignity Charter.
                    </label>
                  </div>
                  <div className="sm:col-span-2 pt-1 flex justify-end">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-[#2D2124] hover:bg-[#3D2C30] text-[#E7C1C9] border border-[#523A3F] rounded-lg text-xs font-semibold"
                    >
                      Submit For Verification Review
                    </button>
                  </div>
                </form>
              </div>

              {/* Security Audit Trail */}
              <div className="bg-[#181818] border border-[#2B2B2B] rounded-xl overflow-hidden">
                <div className="px-5 py-3 bg-[#202020] border-b border-[#282828] flex items-center justify-between">
                  <h3 className="text-xs font-serif font-bold text-[#F1E7DB]">Immutable Recruiter Audit Trail</h3>
                  <span className="text-[11px] text-[#7A6D5D]">Role-based security enforcement</span>
                </div>

                <div className="divide-y divide-[#242424] max-h-60 overflow-y-auto font-mono text-[11px]">
                  {auditLogs.map((log) => (
                    <div key={log.id} className="p-3 hover:bg-[#1C1C1C] flex items-center justify-between">
                      <div className="space-y-0.5">
                        <span className="text-[#E7C1C9] font-semibold">{log.action}</span>
                        <p className="text-[#8E8070]">{log.target}</p>
                      </div>
                      <div className="text-right text-[#786B5C]">
                        <span>{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        <p className="text-[10px] text-emerald-400">Consent Verified</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MATCH EXPLAINABILITY MODAL DIALOG */}
      {explainCandidate && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-60 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fadeIn"
        >
          <div className="relative w-full max-w-2xl bg-[#171717] border border-[#38282C] rounded-2xl p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between pb-3 border-b border-[#2B2B2B]">
              <div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#2C2124] text-[#E7C1C9] border border-[#4D3339]">
                  Objective Skill-First Alignment
                </span>
                <h3 className="text-base font-serif font-bold text-[#F1E7DB] mt-1">
                  Match Explainability: {explainCandidate.full_name}
                </h3>
                <p className="text-xs text-[#8E8070]">
                  Target Role: {explainCandidate.target_role} • Score: {matchAnalysis?.overall_match_score || 91}%
                </p>
              </div>
              <button
                onClick={() => setExplainCandidate(null)}
                className="p-1.5 rounded-lg bg-[#222222] text-[#A69584] hover:text-[#F1E7DB]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Fair Hiring Guarantee */}
            <div className="bg-[#1C191A] border border-[#422C31] rounded-xl p-3.5 flex items-start gap-2.5 text-xs text-[#E1D7CD]">
              <ShieldCheck className="w-4 h-4 text-[#E7C1C9] shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-[#F1E7DB]">Anti-Bias & Non-Discriminatory Matching Guarantee</p>
                <p className="text-[11px] text-[#A69584] mt-0.5">
                  Career break duration incurs zero scoring penalty. Voice pitch analysis, AI facial screening, and unsupported personality profiling are strictly prohibited.
                </p>
              </div>
            </div>

            {/* Evidence Breakdown Grid */}
            <div className="space-y-3 text-xs">
              {matchAnalysis?.evidence_breakdown && (
                <>
                  <div className="bg-[#131313] p-3 rounded-lg border border-[#262626] space-y-1">
                    <div className="flex justify-between font-semibold">
                      <span className="text-emerald-400">Assessment-Supported Skills (35% Weight)</span>
                      <span className="font-mono text-emerald-300">Score: {matchAnalysis.evidence_breakdown.assessment_supported_skills.score}%</span>
                    </div>
                    <p className="text-[11px] text-[#9E9080]">{matchAnalysis.evidence_breakdown.assessment_supported_skills.findings}</p>
                  </div>

                  <div className="bg-[#131313] p-3 rounded-lg border border-[#262626] space-y-1">
                    <div className="flex justify-between font-semibold">
                      <span className="text-[#E7C1C9]">Verified Credentials (25% Weight)</span>
                      <span className="font-mono text-[#E7C1C9]">Score: {matchAnalysis.evidence_breakdown.verified_credentials.score}%</span>
                    </div>
                    <p className="text-[11px] text-[#9E9080]">{matchAnalysis.evidence_breakdown.verified_credentials.findings}</p>
                  </div>

                  <div className="bg-[#131313] p-3 rounded-lg border border-[#262626] space-y-1">
                    <div className="flex justify-between font-semibold">
                      <span className="text-amber-300">Portfolio Projects (25% Weight)</span>
                      <span className="font-mono text-amber-200">Score: {matchAnalysis.evidence_breakdown.portfolio_projects.score}%</span>
                    </div>
                    <p className="text-[11px] text-[#9E9080]">{matchAnalysis.evidence_breakdown.portfolio_projects.findings}</p>
                  </div>

                  <div className="bg-[#131313] p-3 rounded-lg border border-[#262626] space-y-1">
                    <div className="flex justify-between font-semibold">
                      <span className="text-[#C4B4A2]">Self-Reported Past Experience (15% Weight)</span>
                      <span className="font-mono text-[#C4B4A2]">Score: {matchAnalysis.evidence_breakdown.self_reported_experience.score}%</span>
                    </div>
                    <p className="text-[11px] text-[#9E9080]">{matchAnalysis.evidence_breakdown.self_reported_experience.findings}</p>
                  </div>
                </>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setExplainCandidate(null)}
                className="px-4 py-2 bg-[#261E20] hover:bg-[#33262A] text-[#E7C1C9] border border-[#4F333A] rounded-lg text-xs font-semibold"
              >
                Close Alignment Summary
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
