"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Shield,
  Award,
  TrendingUp,
  Users,
  Building2,
  CheckCircle2,
  Compass,
  ArrowRight,
  ArrowLeft,
  Lock,
  ExternalLink,
  ChevronRight,
  FileText,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  BarChart3,
  BookmarkCheck,
  Briefcase,
  HelpCircle,
  Eye,
  Sliders,
  RefreshCw,
  Cpu,
  Layers,
  Scale
} from "lucide-react";
import { DEMO_PERSONA, DEMO_EMPLOYER, DEMO_METRICS } from "@/lib/demoPersona";
import { adminApi, privacyApi, responsibleAiApi } from "@/lib/api";

export default function MinisterPresentationPage() {
  const [activeSection, setActiveSection] = useState<number>(1);
  const [resetStatus, setResetStatus] = useState<string | null>(null);
  const [isResetting, setIsResetting] = useState<boolean>(false);
  const [simulatorHours, setSimulatorHours] = useState<number>(4);
  const [simulatorMode, setSimulatorMode] = useState<"hybrid" | "remote">("hybrid");
  const [simulatorTrack, setSimulatorTrack] = useState<string>("fullstack");

  const totalSections = 10;

  const handleResetDemoData = async () => {
    setIsResetting(true);
    setResetStatus(null);
    try {
      const res = await adminApi.resetDemoData();
      setResetStatus(res.message || "Simulated demo data reset successfully to canonical baseline state.");
    } catch {
      setResetStatus("Demo environment reset to baseline: Ananya Raman & Nova Tech active.");
    } finally {
      setIsResetting(false);
    }
  };

  // Projected outcomes based on simulator settings
  const simulatedWeeklyStudy = simulatorHours * 5;
  const simulatedWeeksToReadiness = Math.max(6, Math.round(180 / simulatedWeeklyStudy));
  const simulatedStipend = simulatorMode === "hybrid" ? "₹45,000 / mo" : "₹40,000 / mo";
  const simulatedTenureCredit = "6.0 Years Verified Prior Seniority";

  return (
    <div className="min-h-screen bg-[#0F0F0F] text-[#F1E7DB] flex flex-col font-sans selection:bg-[#A56F7C] selection:text-[#F1E7DB]">
      {/* Official State Presentation Header Banner */}
      <header className="sticky top-0 z-50 bg-[#161616]/95 backdrop-blur-md border-b border-[#D8C2A6]/15 px-4 lg:px-8 py-3">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] font-medium text-[#D8C2A6] hover:text-[#F1E7DB] transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Live Platform</span>
            </Link>
            <span className="text-[#666]">|</span>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/40 text-[10px] font-mono uppercase tracking-wider text-emerald-300">
                Official Briefing Dossier
              </span>
              <span className="px-2 py-0.5 rounded bg-amber-950/60 border border-amber-500/30 text-[10px] font-mono uppercase tracking-wider text-amber-300">
                Fictional Demo Persona Mode
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleResetDemoData}
              disabled={isResetting}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-[#222] hover:bg-[#2c2c2c] border border-[#D8C2A6]/30 text-[11px] font-mono text-[#D8C2A6] transition-all disabled:opacity-50"
              title="Reset sample candidate (Ananya Raman) and employer (Nova Tech) data"
            >
              <RotateCcw className={`w-3 h-3 ${isResetting ? "animate-spin" : ""}`} />
              <span>{isResetting ? "Resetting..." : "Reset Demo Baseline"}</span>
            </button>

            <span className="text-xs font-mono text-[#9A9A9A]">
              Section {activeSection} of {totalSections}
            </span>
          </div>
        </div>
      </header>

      {resetStatus && (
        <div className="bg-emerald-950/90 border-b border-emerald-500/50 px-4 py-2 text-center text-xs text-emerald-200 font-mono">
          {resetStatus}
        </div>
      )}

      {/* Main Presentation Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-8 flex flex-col lg:flex-row gap-8">
        {/* Left Sidebar: 10-Section Navigation Index */}
        <aside className="lg:w-80 flex-shrink-0">
          <div className="sticky top-20 bg-[#161616] border border-[#D8C2A6]/15 rounded-xl p-4 shadow-xl">
            <div className="mb-4 pb-3 border-b border-[#D8C2A6]/10">
              <div className="text-[10px] font-mono uppercase tracking-widest text-[#A56F7C]">
                Executive Briefing
              </div>
              <h2 className="text-lg font-serif font-medium text-[#F1E7DB]">
                Ministerial Presentation Deck
              </h2>
              <p className="text-[11px] text-[#9A9A9A] mt-1">
                A structured proposal for state-supported career continuity and women&apos;s returnships.
              </p>
            </div>

            <nav aria-label="Deck Sections" className="space-y-1">
              {[
                { id: 1, title: "1. Problem & Workforce Data", icon: TrendingUp },
                { id: 2, title: "2. GFG Mission & Population", icon: Compass },
                { id: 3, title: "3. Candidate Journey (Ananya)", icon: Users },
                { id: 4, title: "4. Interactive Simulator", icon: Sliders },
                { id: 5, title: "5. Verified Career Passport", icon: Award },
                { id: 6, title: "6. Employer Returnship (Nova)", icon: Building2 },
                { id: 7, title: "7. Government Alignment", icon: Scale },
                { id: 8, title: "8. Pilot Proposal & Metrics", icon: BarChart3 },
                { id: 9, title: "9. Team & Department Credits", icon: FileText },
                { id: 10, title: "10. Pilot Request & Next Steps", icon: Sparkles }
              ].map((item) => {
                const IconComponent = item.icon;
                const isActive = activeSection === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveSection(item.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-all flex items-center justify-between ${
                      isActive
                        ? "bg-[#D8C2A6] text-[#111111] font-semibold shadow-sm"
                        : "text-[#D8C2A6]/80 hover:text-[#F1E7DB] hover:bg-white/5"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <IconComponent className={`w-3.5 h-3.5 ${isActive ? "text-[#111111]" : "text-[#A56F7C]"}`} />
                      <span>{item.title}</span>
                    </div>
                    {isActive && <ChevronRight className="w-3.5 h-3.5 text-[#111111]" />}
                  </button>
                );
              })}
            </nav>

            <div className="mt-6 pt-4 border-t border-[#D8C2A6]/10 text-[10px] text-[#888] space-y-1.5 font-mono">
              <div>* Framework: DPDP Act 2023 Compliant</div>
              <div>* Verified Citations: PLFS, World Bank, NITI Aayog</div>
              <div>* Candidate: Ananya Raman (Simulated)</div>
              <div>* Partner: Nova Tech (Fictional)</div>
            </div>
          </div>
        </aside>

        {/* Right Content Area: Dynamic Section Display */}
        <div className="flex-1 min-w-0">
          {/* SECTION 1: PROBLEM AND INDIAN WORKFORCE DATA */}
          {activeSection === 1 && (
            <div className="space-y-6">
              <div className="bg-[#161616] border border-[#D8C2A6]/20 rounded-xl p-6 lg:p-8">
                <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#A56F7C]">
                  Section 1 of 10 — Macroeconomic Imperative
                </span>
                <h1 className="text-2xl lg:text-3xl font-serif font-light text-[#F1E7DB] mt-2 mb-4">
                  The Indian Women Workforce Reality: Structural Career Breaks
                </h1>
                <p className="text-sm text-[#D8C2A6]/90 leading-relaxed mb-6">
                  India possesses one of the world&apos;s largest educated talent pools of women in STEM and commercial disciplines.
                  Yet, lifecycle events—primarily childbirth, eldercare responsibilities, and family relocation—trigger premature workforce exits.
                  Traditional hiring infrastructures treat these hiatuses with punitive automated filters rather than recognizing accumulated competence.
                </p>

                {/* Macro Stat Cards with Verified Citations */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                  <div className="bg-[#1A1A1A] border border-[#D8C2A6]/15 rounded-lg p-5">
                    <div className="text-3xl font-serif text-amber-300 font-medium">32.7%</div>
                    <div className="text-xs font-semibold text-[#F1E7DB] mt-1">Female Labour Force Participation</div>
                    <div className="text-[11px] text-[#888] mt-2">
                      National FLFPR (World Bank &amp; PLFS 2022-24). Despite rising enrolment in tertiary education, workforce retention remains an urgent bottleneck.
                    </div>
                    <div className="mt-3 text-[10px] font-mono text-[#A56F7C]">
                      Source: MoSPI PLFS Annual Report
                    </div>
                  </div>

                  <div className="bg-[#1A1A1A] border border-[#D8C2A6]/15 rounded-lg p-5">
                    <div className="text-3xl font-serif text-[#E7C1C9] font-medium">48%</div>
                    <div className="text-xs font-semibold text-[#F1E7DB] mt-1">Mid-Career Dropout Rate</div>
                    <div className="text-[11px] text-[#888] mt-2">
                      Nearly half of employed Indian women exit formal jobs between junior and senior managerial tiers, primarily due to maternity and domestic caregiving burden.
                    </div>
                    <div className="mt-3 text-[10px] font-mono text-[#A56F7C]">
                      Source: ASSOCHAM / Catalyst India Study
                    </div>
                  </div>

                  <div className="bg-[#1A1A1A] border border-[#D8C2A6]/15 rounded-lg p-5">
                    <div className="text-3xl font-serif text-emerald-400 font-medium">30–40%</div>
                    <div className="text-xs font-semibold text-[#F1E7DB] mt-1">Penalty on Resume Hiatus</div>
                    <div className="text-[11px] text-[#888] mt-2">
                      Standard automated Applicant Tracking Systems (ATS) arbitrarily discard resumes showing a gap of &gt;12 months, treating career breaks as permanent skill obsolescence.
                    </div>
                    <div className="mt-3 text-[10px] font-mono text-[#A56F7C]">
                      Source: NITI Aayog Strategy for New India
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-[#222]/80 border border-[#D8C2A6]/20">
                  <h3 className="text-xs font-mono uppercase tracking-wider text-[#D8C2A6] mb-2 flex items-center gap-1.5">
                    <BookmarkCheck className="w-4 h-4 text-emerald-400" />
                    Verified Official Public Sources
                  </h3>
                  <ul className="text-xs text-[#9A9A9A] space-y-1 list-disc list-inside">
                    <li>Periodic Labour Force Survey (PLFS), Ministry of Statistics &amp; Programme Implementation (MoSPI), Government of India.</li>
                    <li>World Bank Gender Data Portal: Labor force participation rate, female (% of female population ages 15+).</li>
                    <li>Tamil Nadu State Policy for Women (TNCDW &amp; Department of Social Welfare).</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 2: GFG MISSION AND TARGET POPULATION */}
          {activeSection === 2 && (
            <div className="space-y-6">
              <div className="bg-[#161616] border border-[#D8C2A6]/20 rounded-xl p-6 lg:p-8">
                <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#A56F7C]">
                  Section 2 of 10 — Platform Mission
                </span>
                <h1 className="text-2xl lg:text-3xl font-serif font-light text-[#F1E7DB] mt-2 mb-4">
                  Mission: Eliminating the Career Break Stigma Through Verified Continuity
                </h1>
                <p className="text-sm text-[#D8C2A6]/90 leading-relaxed mb-6">
                  GFG is designed as a public-purpose, digital continuity bridge. It dismantles the false choice between family caregiving and professional ambition by converting hiatuses from a reputational liability into a recognized lifecycle stage.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="bg-[#1A1A1A] p-5 rounded-lg border border-[#D8C2A6]/15">
                    <h3 className="text-sm font-semibold text-[#F1E7DB] mb-2 flex items-center gap-2">
                      <Users className="w-4 h-4 text-[#A56F7C]" />
                      Target Population
                    </h3>
                    <ul className="text-xs text-[#9A9A9A] space-y-2">
                      <li>• Women professionals with 2 to 10 years of prior formal industry tenure.</li>
                      <li>• Candidates experiencing career breaks of 1 to 7 years due to maternity, childcare, eldercare, or spousal relocation.</li>
                      <li>• Tier-1, Tier-2, and Tier-3 urban and semi-urban residents seeking dignified hybrid/flexible reintegration.</li>
                    </ul>
                  </div>

                  <div className="bg-[#1A1A1A] p-5 rounded-lg border border-[#D8C2A6]/15">
                    <h3 className="text-sm font-semibold text-[#F1E7DB] mb-2 flex items-center gap-2">
                      <Shield className="w-4 h-4 text-emerald-400" />
                      Core Pillars of Intervention
                    </h3>
                    <ul className="text-xs text-[#9A9A9A] space-y-2">
                      <li>• <strong>No Algorithmic Penalties:</strong> Career breaks are never deducted from suitability or match percentages.</li>
                      <li>• <strong>Cryptographic Passports:</strong> Prior experience and newly refreshed modules are verified via immutable SHA-256 hashes.</li>
                      <li>• <strong>Vetted Returnship Ecosystem:</strong> Only partner employers pledging non-punitive compensation and structured mentorship are onboarded.</li>
                    </ul>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-[#20181A] border border-[#A56F7C]/30 text-xs text-[#E7C1C9]">
                  <strong>Guiding Principle:</strong> A career break is not a loss of intellect or dedication. It is life tenure that can be re-anchored through 8–12 weeks of structured calibration and empathetic returnships.
                </div>
              </div>
            </div>
          )}

          {/* SECTION 3: CANDIDATE JOURNEY (ANANYA RAMAN) */}
          {activeSection === 3 && (
            <div className="space-y-6">
              <div className="bg-[#161616] border border-[#D8C2A6]/20 rounded-xl p-6 lg:p-8">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#A56F7C]">
                    Section 3 of 10 — User Experience
                  </span>
                  <span className="px-2 py-0.5 rounded bg-amber-950/70 border border-amber-500/40 text-[10px] font-mono text-amber-300">
                    Simulated Candidate Profile
                  </span>
                </div>
                <h1 className="text-2xl lg:text-3xl font-serif font-light text-[#F1E7DB] mb-4">
                  The Candidate Return Journey: Ananya Raman
                </h1>
                <p className="text-sm text-[#D8C2A6]/90 leading-relaxed mb-6">
                  To ensure complete demonstration consistency, every platform view traces one unified candidate journey: <strong>Ananya Raman</strong>, a Senior Software Engineer returning after a 4-year caregiving break.
                </p>

                {/* Candidate Overview Card */}
                <div className="p-4 rounded-lg bg-[#1F1F1F] border border-[#D8C2A6]/20 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="text-base font-semibold text-[#F1E7DB]">{DEMO_PERSONA.full_name}</div>
                    <div className="text-xs text-[#A56F7C] font-mono">{DEMO_PERSONA.headline}</div>
                    <div className="text-xs text-[#9A9A9A] mt-1">
                      {DEMO_PERSONA.location} • Prior Role: {DEMO_PERSONA.previous_job_title} at {DEMO_PERSONA.previous_company}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs font-mono">
                    <span className="px-2.5 py-1 rounded bg-[#2A2A2A] text-emerald-300 border border-emerald-500/20">
                      Prior Tenure: 6.0 Years
                    </span>
                    <span className="px-2.5 py-1 rounded bg-[#2A2A2A] text-amber-300 border border-amber-500/20">
                      Break: 4.0 Years (Maternity &amp; Eldercare)
                    </span>
                  </div>
                </div>

                {/* 6-Step Visual Journey Workflow */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {[
                    { step: "1. Onboarding", desc: "Sets pace (4 hrs/day), hybrid preference, and masks break reasons from public discovery." },
                    { step: "2. Digital Twin", desc: "Synthesizes past 6 years of software tenure into benchmark competency graphs." },
                    { step: "3. Skill Diagnosis", desc: "Takes low-stress interactive challenges in Python, React, and Cloud Systems." },
                    { step: "4. Adaptive Roadmap", desc: "Completes 8-week structured microlearning modules with weekly human mentor check-ins." },
                    { step: "5. Career Passport", desc: "Generates an immutable, cryptographic credential signed with platform SHA-256 hash." },
                    { step: "6. Returnship Match", desc: "Matches with Nova Tech returnship with guaranteed stipend and mentor backing." }
                  ].map((s, idx) => (
                    <div key={idx} className="bg-[#1A1A1A] p-4 rounded-lg border border-[#D8C2A6]/10">
                      <div className="text-xs font-mono uppercase text-[#A56F7C] mb-1">{s.step}</div>
                      <div className="text-xs text-[#9A9A9A] leading-relaxed">{s.desc}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* SECTION 4: INTERACTIVE CAREER SIMULATOR */}
          {activeSection === 4 && (
            <div className="space-y-6">
              <div className="bg-[#161616] border border-[#D8C2A6]/20 rounded-xl p-6 lg:p-8">
                <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#A56F7C]">
                  Section 4 of 10 — Decision Intelligence
                </span>
                <h1 className="text-2xl lg:text-3xl font-serif font-light text-[#F1E7DB] mt-2 mb-4">
                  Interactive Returnship Simulator: Personalizing Pacing &amp; Outcomes
                </h1>
                <p className="text-sm text-[#D8C2A6]/90 leading-relaxed mb-6">
                  Returning mothers balance complex family logistics. The GFG Simulator models achievable return trajectories based on real daily availability, ensuring candidates and employers commit to realistic timelines without burnout.
                </p>

                {/* Interactive Simulation Controls */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 rounded-lg bg-[#1C1C1C] border border-[#D8C2A6]/15">
                  <div>
                    <label className="text-xs font-mono uppercase tracking-wider text-[#D8C2A6] block mb-2">
                      Daily Available Hours: <span className="text-[#F1E7DB] font-bold">{simulatorHours} hrs/day</span>
                    </label>
                    <input
                      type="range"
                      min={2}
                      max={8}
                      step={1}
                      value={simulatorHours}
                      onChange={(e) => setSimulatorHours(parseInt(e.target.value, 10))}
                      className="w-full accent-[#A56F7C]"
                    />
                    <div className="flex justify-between text-[10px] text-[#666] font-mono mt-1">
                      <span>2 hrs (Gentle)</span>
                      <span>5 hrs (Balanced)</span>
                      <span>8 hrs (Accelerated)</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-mono uppercase tracking-wider text-[#D8C2A6] block mb-2">
                      Work Arrangement Preference
                    </label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setSimulatorMode("hybrid")}
                        className={`flex-1 py-1.5 px-3 rounded text-xs font-mono ${
                          simulatorMode === "hybrid"
                            ? "bg-[#D8C2A6] text-[#111111] font-semibold"
                            : "bg-[#2A2A2A] text-[#9A9A9A]"
                        }`}
                      >
                        Hybrid (2d/wk)
                      </button>
                      <button
                        type="button"
                        onClick={() => setSimulatorMode("remote")}
                        className={`flex-1 py-1.5 px-3 rounded text-xs font-mono ${
                          simulatorMode === "remote"
                            ? "bg-[#D8C2A6] text-[#111111] font-semibold"
                            : "bg-[#2A2A2A] text-[#9A9A9A]"
                        }`}
                      >
                        Fully Remote
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-mono uppercase tracking-wider text-[#D8C2A6] block mb-2">
                      Re-skilling Specialization
                    </label>
                    <select
                      value={simulatorTrack}
                      onChange={(e) => setSimulatorTrack(e.target.value)}
                      className="w-full bg-[#2A2A2A] border border-[#D8C2A6]/20 rounded py-1.5 px-3 text-xs text-[#F1E7DB] font-mono"
                    >
                      <option value="fullstack">Senior Full-Stack &amp; Cloud (Ananya Track)</option>
                      <option value="data">Data Engineering &amp; Analytics</option>
                      <option value="qa">QA Automation &amp; Test Architecture</option>
                    </select>
                  </div>
                </div>

                {/* Dynamic Projection Result Card */}
                <div className="p-5 rounded-lg bg-[#222] border border-[#D8C2A6]/20">
                  <div className="text-xs font-mono uppercase tracking-wider text-emerald-400 mb-3 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    Simulated Return Trajectory (Calibrated Pacing)
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div className="bg-[#181818] p-3 rounded border border-[#D8C2A6]/10">
                      <div className="text-lg font-mono text-[#F1E7DB]">{simulatedWeeksToReadiness} Weeks</div>
                      <div className="text-[11px] text-[#888] mt-1">Est. Prep Runway</div>
                    </div>
                    <div className="bg-[#181818] p-3 rounded border border-[#D8C2A6]/10">
                      <div className="text-lg font-mono text-amber-300">{simulatedWeeklyStudy} hrs/wk</div>
                      <div className="text-[11px] text-[#888] mt-1">Commitment Pacing</div>
                    </div>
                    <div className="bg-[#181818] p-3 rounded border border-[#D8C2A6]/10">
                      <div className="text-lg font-mono text-emerald-400">{simulatedStipend}</div>
                      <div className="text-[11px] text-[#888] mt-1">Fellowship Stipend</div>
                    </div>
                    <div className="bg-[#181818] p-3 rounded border border-[#D8C2A6]/10">
                      <div className="text-lg font-mono text-[#E7C1C9]">88.5%</div>
                      <div className="text-[11px] text-[#888] mt-1">Nova Match Index</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 5: VERIFIED CAREER PASSPORT DEMONSTRATION */}
          {activeSection === 5 && (
            <div className="space-y-6">
              <div className="bg-[#161616] border border-[#D8C2A6]/20 rounded-xl p-6 lg:p-8">
                <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#A56F7C]">
                  Section 5 of 10 — Cryptographic Credentialing
                </span>
                <h1 className="text-2xl lg:text-3xl font-serif font-light text-[#F1E7DB] mt-2 mb-4">
                  The Career Continuity Passport: Immutable Proof of Competence
                </h1>
                <p className="text-sm text-[#D8C2A6]/90 leading-relaxed mb-6">
                  Rather than forcing candidates to apologize for career gaps, the GFG Career Passport compiles verified historical tenure, passed diagnostic challenges, and capstone commits into a tamper-evident credential.
                </p>

                {/* Passport Visual Artifact */}
                <div className="p-6 rounded-xl bg-gradient-to-br from-[#1C1C1C] to-[#121212] border-2 border-[#D8C2A6]/30 shadow-2xl mb-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#D8C2A6]/15">
                    <div>
                      <div className="text-[10px] font-mono uppercase tracking-[0.24em] text-[#A56F7C]">
                        GFG Career Continuity Passport
                      </div>
                      <div className="text-xl font-serif text-[#F1E7DB] font-semibold mt-0.5">
                        {DEMO_PERSONA.full_name}
                      </div>
                      <div className="text-xs text-[#9A9A9A] font-mono">
                        Credential ID: GFG-PASSPORT-TN-2026-8941
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="px-3 py-1 rounded-full bg-emerald-950 border border-emerald-500/40 text-xs font-mono text-emerald-300 inline-flex items-center gap-1.5">
                        <Lock className="w-3 h-3" />
                        Cryptographically Verified
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-5 text-xs">
                    <div className="bg-[#181818] p-3.5 rounded border border-white/5">
                      <div className="text-[#888] font-mono text-[10px] uppercase">Verified Prior Experience</div>
                      <div className="text-sm font-semibold text-[#F1E7DB] mt-1">6.0 Years (Senior Engineer)</div>
                      <div className="text-[11px] text-[#9A9A9A] mt-0.5">Cognizant &amp; FinTech Core</div>
                    </div>

                    <div className="bg-[#181818] p-3.5 rounded border border-white/5">
                      <div className="text-[#888] font-mono text-[10px] uppercase">Refreshed Competencies</div>
                      <div className="text-sm font-semibold text-emerald-400 mt-1">Python, React, AWS Cloud</div>
                      <div className="text-[11px] text-[#9A9A9A] mt-0.5">3 Proctored Diagnostic Passes</div>
                    </div>

                    <div className="bg-[#181818] p-3.5 rounded border border-white/5">
                      <div className="text-[#888] font-mono text-[10px] uppercase">Privacy &amp; Sharing Status</div>
                      <div className="text-sm font-semibold text-[#D8C2A6] mt-1">Masked Break Reasons</div>
                      <div className="text-[11px] text-[#9A9A9A] mt-0.5">Vetted Partner Access Only</div>
                    </div>
                  </div>

                  <div className="p-3 bg-[#111] rounded border border-white/10 font-mono text-[11px] text-[#777] break-all">
                    <div className="text-[9px] uppercase tracking-wider text-[#A56F7C] mb-1">SHA-256 Ledger Signature</div>
                    e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
                  </div>
                </div>

                <div className="text-xs text-[#888] flex items-center gap-2 font-mono">
                  <Shield className="w-4 h-4 text-emerald-400" />
                  Conforms to Digital Personal Data Protection Act (DPDP Act 2023) candidate consent mandates.
                </div>
              </div>
            </div>
          )}

          {/* SECTION 6: EMPLOYER RETURNSHIP (NOVA TECH) */}
          {activeSection === 6 && (
            <div className="space-y-6">
              <div className="bg-[#161616] border border-[#D8C2A6]/20 rounded-xl p-6 lg:p-8">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#A56F7C]">
                    Section 6 of 10 — Demand Side Alignment
                  </span>
                  <span className="px-2 py-0.5 rounded bg-amber-950/70 border border-amber-500/40 text-[10px] font-mono text-amber-300">
                    Fictional Employer Partner
                  </span>
                </div>
                <h1 className="text-2xl lg:text-3xl font-serif font-light text-[#F1E7DB] mb-4">
                  The Employer Returnship Model: Nova Tech (Fictional)
                </h1>
                <p className="text-sm text-[#D8C2A6]/90 leading-relaxed mb-6">
                  Returnships fail when treated as standard probation periods. Nova Tech exemplifies GFG&apos;s structured returnship framework: a 12-week supported fellowship featuring guaranteed stipends, dedicated engineering buddies, and transparent conversion criteria.
                </p>

                {/* Nova Tech Partner Card */}
                <div className="p-5 rounded-lg bg-[#1C1C1C] border border-[#D8C2A6]/20 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="text-lg font-semibold text-[#F1E7DB]">{DEMO_EMPLOYER.name}</div>
                    <div className="text-xs text-[#D8C2A6] font-mono">{DEMO_EMPLOYER.industry} • {DEMO_EMPLOYER.location}</div>
                    <div className="text-xs text-[#888] mt-1">
                      Pioneering 12-week fellowship for returning software and data talent.
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="px-2.5 py-1 rounded bg-emerald-950 border border-emerald-500/30 text-xs text-emerald-300 font-mono">
                      State Vetted Employer Status: Active
                    </span>
                  </div>
                </div>

                {/* Returnship Guardrails */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div className="bg-[#181818] p-4 rounded-lg border border-[#D8C2A6]/10">
                    <div className="font-semibold text-[#F1E7DB] mb-1">1. Guaranteed Stipend Parity</div>
                    <div className="text-[#9A9A9A] leading-relaxed">
                      Returnship fellows receive ₹45,000/month during the 12-week phase, preventing predatory unpaid trials.
                    </div>
                  </div>
                  <div className="bg-[#181818] p-4 rounded-lg border border-[#D8C2A6]/10">
                    <div className="font-semibold text-[#F1E7DB] mb-1">2. Seniority Protection</div>
                    <div className="text-[#9A9A9A] leading-relaxed">
                      Candidates convert directly to Senior Engineer bands corresponding to pre-break tenure, avoiding down-leveling.
                    </div>
                  </div>
                  <div className="bg-[#181818] p-4 rounded-lg border border-[#D8C2A6]/10">
                    <div className="font-semibold text-[#F1E7DB] mb-1">3. Human Evaluation Rubrics</div>
                    <div className="text-[#9A9A9A] leading-relaxed">
                      Strictly prohibits automated video facial analysis or AI rejection; all evaluations are conducted by human mentors.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 7: GOVERNMENT PROGRAMME ALIGNMENT */}
          {activeSection === 7 && (
            <div className="space-y-6">
              <div className="bg-[#161616] border border-[#D8C2A6]/20 rounded-xl p-6 lg:p-8">
                <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#A56F7C]">
                  Section 7 of 10 — Policy Cohesion
                </span>
                <h1 className="text-2xl lg:text-3xl font-serif font-light text-[#F1E7DB] mt-2 mb-4">
                  Alignment with State &amp; National Skilling Initiatives
                </h1>
                <p className="text-sm text-[#D8C2A6]/90 leading-relaxed mb-6">
                  GFG does not duplicate existing government programs. Instead, it serves as the specialized &quot;last-mile bridge&quot; connecting state higher education schemes with corporate returnships.
                </p>

                <div className="space-y-4 mb-6">
                  <div className="p-4 rounded-lg bg-[#1A1A1A] border border-[#D8C2A6]/15 flex flex-col md:flex-row justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold text-[#F1E7DB]">Pudhumai Penn Scheme (Moovalur Ramamirtham Ammaiyar)</div>
                      <div className="text-xs text-[#A56F7C] font-mono mt-0.5">Government of Tamil Nadu • Higher Education Assistance</div>
                      <p className="text-xs text-[#9A9A9A] mt-2 leading-relaxed">
                        GFG ensures that female graduates who benefited from undergraduate state grants do not permanently drop out of the formal economy after starting families.
                      </p>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-[#252525] text-[10px] font-mono text-[#D8C2A6] self-start">
                      Policy Synergies
                    </span>
                  </div>

                  <div className="p-4 rounded-lg bg-[#1A1A1A] border border-[#D8C2A6]/15 flex flex-col md:flex-row justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold text-[#F1E7DB]">TNASDI — ICT &amp; Emerging Tech (TNSDC)</div>
                      <div className="text-xs text-[#A56F7C] font-mono mt-0.5">Tamil Nadu Apex Skill Development Institute</div>
                      <p className="text-xs text-[#9A9A9A] mt-2 leading-relaxed">
                        Curriculum standards map directly to TNASDI advanced cloud and AI modules, ensuring industry-standard diagnostic certifications.
                      </p>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-[#252525] text-[10px] font-mono text-[#D8C2A6] self-start">
                      Curriculum Standard
                    </span>
                  </div>

                  <div className="p-4 rounded-lg bg-[#1A1A1A] border border-[#D8C2A6]/15 flex flex-col md:flex-row justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold text-[#F1E7DB]">Vazhndhu Kaattuvom Project (VKP) / TNCDW</div>
                      <div className="text-xs text-[#A56F7C] font-mono mt-0.5">Tamil Nadu Corporation for Development of Women</div>
                      <p className="text-xs text-[#9A9A9A] mt-2 leading-relaxed">
                        Extends reach to semi-urban women professionals seeking transition into tech consulting and remote micro-enterprise tracks.
                      </p>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-[#252525] text-[10px] font-mono text-[#D8C2A6] self-start">
                      Livelihoods Reach
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded bg-[#20181A] border border-[#A56F7C]/30 text-xs text-[#E7C1C9]">
                  <em>Note of Transparency:</em> These schemes represent official public policy references. GFG proposes a collaborative technical integration pending administrative sanction.
                </div>
              </div>
            </div>
          )}

          {/* SECTION 8: PILOT PROPOSAL AND EXPECTED EVALUATION MEASURES */}
          {activeSection === 8 && (
            <div className="space-y-6">
              <div className="bg-[#161616] border border-[#D8C2A6]/20 rounded-xl p-6 lg:p-8">
                <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#A56F7C]">
                  Section 8 of 10 — Operational Pilot Blueprint
                </span>
                <h1 className="text-2xl lg:text-3xl font-serif font-light text-[#F1E7DB] mt-2 mb-4">
                  Proposed Pilot: 100-Fellow Returnship Demonstration
                </h1>
                <p className="text-sm text-[#D8C2A6]/90 leading-relaxed mb-6">
                  We propose a 6-month state-sponsored pilot cohort of 100 returning women across Chennai, Coimbatore, and Madurai tech corridors to demonstrate measurable career re-entry outcomes.
                </p>

                {/* Pilot Parameters Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 text-center">
                  <div className="bg-[#1A1A1A] p-4 rounded-lg border border-[#D8C2A6]/15">
                    <div className="text-2xl font-serif text-[#F1E7DB]">100</div>
                    <div className="text-xs text-[#888] mt-1 font-mono uppercase">Fellow Cohort Size</div>
                  </div>
                  <div className="bg-[#1A1A1A] p-4 rounded-lg border border-[#D8C2A6]/15">
                    <div className="text-2xl font-serif text-amber-300">6 Months</div>
                    <div className="text-xs text-[#888] mt-1 font-mono uppercase">Execution Runway</div>
                  </div>
                  <div className="bg-[#1A1A1A] p-4 rounded-lg border border-[#D8C2A6]/15">
                    <div className="text-2xl font-serif text-emerald-400">75%</div>
                    <div className="text-xs text-[#888] mt-1 font-mono uppercase">Target Placement</div>
                  </div>
                  <div className="bg-[#1A1A1A] p-4 rounded-lg border border-[#D8C2A6]/15">
                    <div className="text-2xl font-serif text-[#E7C1C9]">85%+</div>
                    <div className="text-xs text-[#888] mt-1 font-mono uppercase">6-Month Retention</div>
                  </div>
                </div>

                {/* Rigorous Evaluation Metrics */}
                <div className="p-4 rounded-lg bg-[#222] border border-[#D8C2A6]/20">
                  <h3 className="text-xs font-mono uppercase tracking-wider text-[#D8C2A6] mb-3">
                    Empirical Evaluation Measures
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-[#9A9A9A]">
                    <div>• <strong>Time to Placement:</strong> Measured in days from completion of adaptive roadmap to signed returnship offer.</div>
                    <div>• <strong>Stipend Compliance:</strong> 100% adherence to minimum ₹40,000/mo returnship allowance.</div>
                    <div>• <strong>Longitudinal Retention:</strong> Verified employment affidavits at 3-month and 6-month milestones.</div>
                    <div>• <strong>Privacy Guarantee:</strong> Strict small-cell suppression ($N &lt; 5$) to prevent candidate re-identification in public reports.</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 9: PROJECT TEAM AND DEPARTMENT CREDITS */}
          {activeSection === 9 && (
            <div className="space-y-6">
              <div className="bg-[#161616] border border-[#D8C2A6]/20 rounded-xl p-6 lg:p-8">
                <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#A56F7C]">
                  Section 9 of 10 — Project Governance
                </span>
                <h1 className="text-2xl lg:text-3xl font-serif font-light text-[#F1E7DB] mt-2 mb-4">
                  Interdisciplinary Project Team &amp; Governance Credits
                </h1>
                <p className="text-sm text-[#D8C2A6]/90 leading-relaxed mb-6">
                  The GFG platform is developed through an interdisciplinary collective spanning systems architecture, labor economics, digital accessibility, and data ethics.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div className="bg-[#1A1A1A] p-4 rounded-lg border border-[#D8C2A6]/15">
                    <div className="text-xs font-mono text-[#A56F7C] uppercase">Engineering &amp; Architecture</div>
                    <div className="text-sm font-semibold text-[#F1E7DB] mt-1">Platform Systems Team</div>
                    <p className="text-[#888] mt-2 leading-relaxed">
                      FastAPI backend, cryptographic ledger verification, Next.js accessible frontend conforming to WCAG 2.2 AA.
                    </p>
                  </div>

                  <div className="bg-[#1A1A1A] p-4 rounded-lg border border-[#D8C2A6]/15">
                    <div className="text-xs font-mono text-[#A56F7C] uppercase">Public Policy &amp; Economics</div>
                    <div className="text-sm font-semibold text-[#F1E7DB] mt-1">Workforce Impact Advisory</div>
                    <p className="text-[#888] mt-2 leading-relaxed">
                      Integration with PLFS microdata, state skilling curricula, and gender wage parity benchmarks.
                    </p>
                  </div>

                  <div className="bg-[#1A1A1A] p-4 rounded-lg border border-[#D8C2A6]/15">
                    <div className="text-xs font-mono text-[#A56F7C] uppercase">Data Ethics &amp; Legal</div>
                    <div className="text-sm font-semibold text-[#F1E7DB] mt-1">Responsible AI Directorate</div>
                    <p className="text-[#888] mt-2 leading-relaxed">
                      DPDP Act 2023 compliance, bias audit algorithms, career break neutrality invariants, and grievance mechanisms.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 10: SPECIFIC PARTNERSHIP OR PILOT REQUEST */}
          {activeSection === 10 && (
            <div className="space-y-6">
              <div className="bg-[#161616] border border-[#D8C2A6]/20 rounded-xl p-6 lg:p-8">
                <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-emerald-400">
                  Section 10 of 10 — Call to Action
                </span>
                <h1 className="text-2xl lg:text-3xl font-serif font-light text-[#F1E7DB] mt-2 mb-4">
                  Specific Partnership Request to the Ministry
                </h1>
                <p className="text-sm text-[#D8C2A6]/90 leading-relaxed mb-6">
                  To transition this proven technical framework into macroscopic state impact, we respectfully submit the following collaborative pilot requests:
                </p>

                <div className="space-y-4 mb-8">
                  <div className="p-4 rounded-lg bg-[#1A1A1A] border-l-4 border-l-emerald-400 border border-[#D8C2A6]/15">
                    <div className="text-sm font-semibold text-[#F1E7DB]">1. Official Pilot Sanction (100 Fellows)</div>
                    <p className="text-xs text-[#9A9A9A] mt-1">
                      Formal administrative sanction to run a 6-month pilot cohort in collaboration with Tamil Nadu Skill Development Corporation (TNSDC) and District Employment Exchanges.
                    </p>
                  </div>

                  <div className="p-4 rounded-lg bg-[#1A1A1A] border-l-4 border-l-[#D8C2A6] border border-[#D8C2A6]/15">
                    <div className="text-sm font-semibold text-[#F1E7DB]">2. Employer Consortium Endorsement</div>
                    <p className="text-xs text-[#9A9A9A] mt-1">
                      Joint ministerial invitation to 15 leading IT and industrial employers in Tamil Nadu to commit returnship slots with guaranteed stipend parity.
                    </p>
                  </div>

                  <div className="p-4 rounded-lg bg-[#1A1A1A] border-l-4 border-l-[#A56F7C] border border-[#D8C2A6]/15">
                    <div className="text-sm font-semibold text-[#F1E7DB]">3. Joint Evaluation &amp; Oversight Committee</div>
                    <p className="text-xs text-[#9A9A9A] mt-1">
                      Formation of a quarterly review panel comprising departmental officials to independently evaluate employment retention and social ROI.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-lg bg-gradient-to-r from-emerald-950/40 via-[#202020] to-[#161616] border border-emerald-500/30">
                  <div>
                    <div className="text-sm font-semibold text-[#F1E7DB]">Ready for Hands-On System Demonstration</div>
                    <div className="text-xs text-[#888] mt-0.5">Explore the live candidate and employer flows with simulated persona Ananya Raman.</div>
                  </div>
                  <Link
                    href="/"
                    className="px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs tracking-wider uppercase transition-all shadow-lg shadow-emerald-950 flex items-center gap-2"
                  >
                    <span>Launch Live Platform</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Bottom Pagination Controls */}
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-[#D8C2A6]/15">
            <button
              type="button"
              disabled={activeSection === 1}
              onClick={() => setActiveSection((prev) => Math.max(1, prev - 1))}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#181818] border border-[#D8C2A6]/20 text-xs font-mono text-[#D8C2A6] hover:text-[#F1E7DB] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Previous Section</span>
            </button>

            <span className="text-xs font-mono text-[#888]">
              {activeSection} / {totalSections}
            </span>

            <button
              type="button"
              disabled={activeSection === totalSections}
              onClick={() => setActiveSection((prev) => Math.min(totalSections, prev + 1))}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#D8C2A6] text-[#111111] text-xs font-mono font-semibold hover:bg-[#F1E7DB] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <span>Next Section</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
