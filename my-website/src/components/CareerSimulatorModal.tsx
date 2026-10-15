"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Clock,
  Briefcase,
  Layers,
  Award,
  Globe,
  CheckCircle,
  AlertCircle,
  HelpCircle,
  Bookmark,
  GitCompare,
  RotateCcw,
  PlusCircle,
  Sliders,
  ChevronRight,
  Eye,
  Trash2,
  Calendar,
} from "lucide-react";
import { api } from "@/lib/api";
import { DEMO_PERSONA, DEMO_METRICS } from "@/lib/demoPersona";
import { DataClassificationBadge } from "./DataClassificationBadge";

interface CareerSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenRoadmap?: () => void;
  onOpenDigitalTwin?: () => void;
}

type ScenarioType =
  | "learn_skill"
  | "earn_qualification"
  | "change_industry"
  | "switch_remote"
  | "adjust_availability"
  | "complete_project"
  | "start_returnship";

const SCENARIO_TYPES: Array<{
  id: ScenarioType;
  title: string;
  badge: string;
  description: string;
}> = [
  {
    id: "learn_skill",
    title: "1. Learn a Skill",
    badge: "SKILL ACQUISITION",
    description: "Explore how mastering tools like Power BI, Python, or AWS satisfies critical job requirements.",
  },
  {
    id: "earn_qualification",
    title: "2. Earn a Qualification",
    badge: "CREDENTIAL",
    description: "Simulate gaining third-party accredited certifications like Microsoft PL-300 or AWS Cloud.",
  },
  {
    id: "change_industry",
    title: "3. Change Industry",
    badge: "DOMAIN PIVOT",
    description: "Model transitioning from banking or tech into HealthTech, EdTech, FinTech, or ClimateTech.",
  },
  {
    id: "switch_remote",
    title: "4. Switch to Remote",
    badge: "WORK MODE",
    description: "Assess asynchronous collaboration readiness and national returnship cohort access.",
  },
  {
    id: "adjust_availability",
    title: "5. Adjust Weekly Hours",
    badge: "PACING & HOURS",
    description: "See how moving between 10, 20, or 30 hours/week compresses your comeback timeline.",
  },
  {
    id: "complete_project",
    title: "6. Complete a Project",
    badge: "PORTFOLIO CAPSTONE",
    description: "Simulate publishing a production capstone repository to overcome the career break gap.",
  },
  {
    id: "start_returnship",
    title: "7. Start a Returnship",
    badge: "RETURNSHIP COHORT",
    description: "Project outcomes from an 8-12 week structured corporate returnship placement.",
  },
];

export function CareerSimulatorModal({
  isOpen,
  onClose,
  onOpenRoadmap,
  onOpenDigitalTwin,
}: CareerSimulatorModalProps) {
  // Mobile Split Tab State (for small screens)
  const [mobileTab, setMobileTab] = useState<"current" | "simulated">("simulated");

  // Options & Baseline State
  const [options, setOptions] = useState<any>(null);
  const [baseline, setBaseline] = useState<any>(null);
  const [savedSimulations, setSavedSimulations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Scenario Input Form State
  const [scenarioType, setScenarioType] = useState<ScenarioType>("learn_skill");
  const [selectedSkill, setSelectedSkill] = useState<string>("Power BI");
  const [selectedQualification, setSelectedQualification] = useState<string>("Microsoft PL-300: Power BI Data Analyst");
  const [selectedIndustry, setSelectedIndustry] = useState<string>("HealthTech");
  const [selectedProject, setSelectedProject] = useState<string>("Customer Churn Telemetry Dashboard");
  const [selectedReturnship, setSelectedReturnship] = useState<string>("Nova Tech 12-Week Analytics Returnship");
  const [targetCareer, setTargetCareer] = useState<string>("Data Analyst");
  const [weeklyHours, setWeeklyHours] = useState<number>(15);
  const [learningIntensity, setLearningIntensity] = useState<string>("steady");
  const [workMode, setWorkMode] = useState<string>("Hybrid");

  // Active Simulation Results
  const [activeSimulation, setActiveSimulation] = useState<any>(null);

  // Comparison Modal / View State
  const [showComparison, setShowComparison] = useState<boolean>(false);
  const [comparisonData, setComparisonData] = useState<any>(null);
  const [compareTargetSimId, setCompareTargetSimId] = useState<string>("");

  // Load initial options, baseline, and saved simulations
  useEffect(() => {
    if (!isOpen) return;

    let mounted = true;
    setIsLoading(true);

    async function loadData() {
      try {
        const [opt, base, saved] = await Promise.all([
          api.getSimulatorOptions(),
          api.getSimulatorBaseline(),
          api.getSavedSimulations(),
        ]);

        if (!mounted) return;
        setOptions(opt);
        setBaseline(base);
        setSavedSimulations(saved || []);

        if (base?.target_role) setTargetCareer(base.target_role);
        if (base?.weekly_hours) setWeeklyHours(base.weekly_hours);
        if (base?.work_mode) setWorkMode(base.work_mode);

        // Run default simulation: Learn Power BI (Demo Preset)
        const initialSim = await api.simulateScenario({
          scenario_type: "learn_skill",
          scenario_name: "Learn Power BI (Ananya Demo Scenario)",
          parameters: {
            skill: "Power BI",
            target_career: base?.target_role || "Data Analyst",
            weekly_hours: 15,
            learning_intensity: "steady",
            work_mode: "Hybrid",
          },
        });

        if (mounted) {
          setActiveSimulation(initialSim);
        }
      } catch (err) {
        console.warn("Using offline simulator baseline:", err);
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    loadData();
    return () => {
      mounted = false;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Run simulation calculation
  const handleRecalculate = async () => {
    setIsSimulating(true);
    setFeedback(null);

    const params: Record<string, any> = {
      target_career: targetCareer,
      weekly_hours: weeklyHours,
      learning_intensity: learningIntensity,
      work_mode: workMode,
    };

    if (scenarioType === "learn_skill") params.skill = selectedSkill;
    else if (scenarioType === "earn_qualification") params.qualification = selectedQualification;
    else if (scenarioType === "change_industry") params.industry = selectedIndustry;
    else if (scenarioType === "switch_remote") params.work_mode = workMode;
    else if (scenarioType === "complete_project") params.project_title = selectedProject;
    else if (scenarioType === "start_returnship") params.returnship_title = selectedReturnship;

    try {
      const sim = await api.simulateScenario({
        scenario_type: scenarioType,
        scenario_name: `Simulate: ${SCENARIO_TYPES.find((s) => s.id === scenarioType)?.title || scenarioType}`,
        parameters: params,
      });
      setActiveSimulation(sim);
      setFeedback({
        type: "success",
        text: `Simulation recalculated: Projected readiness is ${sim.after?.projected_readiness_score}% (+${sim.after?.readiness_delta}% delta).`,
      });
    } catch (err: any) {
      setFeedback({ type: "error", text: err.message || "Failed to calculate simulation." });
    } finally {
      setIsSimulating(false);
    }
  };

  // Quick 1-click Ananya Power BI Scenario Preset
  const handleLoadDemoAnanya = () => {
    setScenarioType("learn_skill");
    setSelectedSkill("Power BI");
    setTargetCareer("Data Analyst");
    setWeeklyHours(15);
    setLearningIntensity("steady");
    setWorkMode("Hybrid");

    setTimeout(() => {
      handleRecalculate();
    }, 50);
  };

  // Save current scenario
  const handleSaveScenario = async () => {
    if (!activeSimulation) return;
    try {
      const name =
        scenarioType === "learn_skill"
          ? `Learn ${selectedSkill} (${weeklyHours}h/wk)`
          : scenarioType === "earn_qualification"
          ? `${selectedQualification.split(":")[0]}`
          : scenarioType === "change_industry"
          ? `Pivot to ${selectedIndustry}`
          : scenarioType === "adjust_availability"
          ? `Pacing: ${weeklyHours} hrs/week`
          : `${SCENARIO_TYPES.find((s) => s.id === scenarioType)?.badge}`;

      const res = await api.saveSimulation({
        scenario_name: name,
        scenario_type: scenarioType,
        parameters: activeSimulation.parameters || {},
        results: activeSimulation,
      });

      setFeedback({ type: "success", text: res.message || "Scenario saved." });
      const updatedSaved = await api.getSavedSimulations();
      setSavedSimulations(updatedSaved || []);
    } catch (err: any) {
      setFeedback({ type: "error", text: err.message || "Failed to save scenario." });
    }
  };

  // Delete saved simulation
  const handleDeleteSaved = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await api.deleteSavedSimulation(id);
      setSavedSimulations((prev) => prev.filter((s) => s.id !== id));
      setFeedback({ type: "success", text: "Saved scenario removed." });
    } catch (err: any) {
      setFeedback({ type: "error", text: "Unable to remove scenario." });
    }
  };

  // Load a saved scenario
  const handleLoadSavedScenario = (saved: any) => {
    setActiveSimulation(saved.results);
    setScenarioType(saved.scenario_type || "learn_skill");
    if (saved.parameters?.skill) setSelectedSkill(saved.parameters.skill);
    if (saved.parameters?.target_career) setTargetCareer(saved.parameters.target_career);
    if (saved.parameters?.weekly_hours) setWeeklyHours(saved.parameters.weekly_hours);
    if (saved.parameters?.work_mode) setWorkMode(saved.parameters.work_mode);
    setFeedback({ type: "success", text: `Loaded saved scenario: ${saved.scenario_name}` });
  };

  // Compare active simulation with a saved scenario
  const handleOpenComparison = async (targetSim?: any) => {
    const compareWith = targetSim || savedSimulations[0];
    if (!compareWith && !targetSim) {
      setFeedback({
        type: "error",
        text: "Please save at least one scenario first to compare side-by-side.",
      });
      return;
    }

    try {
      const data = await api.compareSimulations({
        simulation_a: activeSimulation,
        simulation_b: compareWith.results || compareWith,
      });
      setComparisonData(data);
      setShowComparison(true);
    } catch (err: any) {
      setFeedback({ type: "error", text: "Failed to compare scenarios." });
    }
  };

  // Add simulated skill to Roadmap
  const handleAddToRoadmap = async () => {
    const milestoneName =
      scenarioType === "learn_skill"
        ? `Skill Sprint: ${selectedSkill}`
        : scenarioType === "earn_qualification"
        ? `Certification: ${selectedQualification}`
        : scenarioType === "complete_project"
        ? `Capstone: ${selectedProject}`
        : `Target Goal: ${targetCareer}`;

    try {
      const res = await api.applySimulationToRoadmap({
        skill_or_milestone: milestoneName,
        category: scenarioType.replace("_", " ").toUpperCase(),
        estimated_hours: activeSimulation?.after?.estimated_learning_hours || 30,
        weekly_target: weeklyHours,
      });
      setFeedback({
        type: "success",
        text: res.message || `Added ${milestoneName} to your 8-week roadmap.`,
      });
    } catch (err: any) {
      setFeedback({ type: "error", text: "Failed to add milestone to roadmap." });
    }
  };

  const before = activeSimulation?.before || baseline || {};
  const after = activeSimulation?.after || {};

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="career-simulator-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 md:p-8 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-300"
    >
      <div className="relative w-full max-w-7xl bg-[#141414] text-[#F1E7DB] rounded-2xl border border-blue-500/30 overflow-hidden my-auto max-h-[94vh] flex flex-col font-sans shadow-2xl">
        {/* ============================================================ */}
        {/* TOP BAR / HEADER                                             */}
        {/* ============================================================ */}
        <div className="px-6 py-4 border-b border-[#D8C2A6]/10 flex flex-wrap items-center justify-between gap-4 bg-[#181818]/95 backdrop-blur-sm sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-400 animate-pulse" />
            <div>
              <div className="flex items-center gap-2">
                <span className="micro-label text-blue-300 font-mono">
                  GFG MODULE 04 // AI CAREER FUTURE SIMULATOR
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] bg-blue-950/80 text-blue-300 border border-blue-500/30 font-mono">
                  GROUNDED PROJECTIONS
                </span>
                <DataClassificationBadge type="simulated_demonstration" size="sm" />
              </div>
              <h2 id="career-simulator-title" className="text-xl sm:text-2xl font-light text-[#F1E7DB] tracking-tight">
                Career Scenario Modeling & Outcome Exploration
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Quick Demo Preset */}
            <button
              onClick={handleLoadDemoAnanya}
              title="Load Ananya's Scenario: Excel & SQL → Learn Power BI"
              className="px-3 py-1.5 rounded-lg border border-blue-500/40 bg-blue-950/40 hover:bg-blue-900/60 text-blue-200 text-xs font-mono transition-colors flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span>Ananya Demo: Power BI</span>
            </button>

            {/* Close Modal */}
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-white/10 text-[#9A9A9A] hover:text-[#F1E7DB] transition-colors"
              aria-label="Close Career Future Simulator"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Responsible AI Disclaimer Banner */}
        <div className="px-6 py-2.5 bg-blue-950/30 border-b border-blue-500/20 flex flex-wrap items-center justify-between gap-3 text-[11px] font-mono text-blue-200">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-blue-400 shrink-0" />
            <span>
              <strong>Responsible AI Charter:</strong> Hypothetical skills are illustrative simulations and do NOT modify your verified Career Passport credentials. Zero placement promises or manufactured salary figures.
            </span>
          </div>
          <span className="text-[#9A9A9A]">Taxonomy v{activeSimulation?.taxonomy_version || "2026.1-GFG-STABLE"}</span>
        </div>

        {/* Feedback Alert Bar */}
        {feedback && (
          <div
            className={`px-6 py-2.5 text-xs font-mono flex items-center justify-between border-b ${
              feedback.type === "success"
                ? "bg-[#181818] border-green-500/30 text-green-300"
                : "bg-red-950/80 border-red-500/30 text-red-200"
            }`}
          >
            <div className="flex items-center gap-2">
              {feedback.type === "success" ? (
                <CheckCircle className="w-4 h-4 text-green-400 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              )}
              <span>{feedback.text}</span>
            </div>
            <button onClick={() => setFeedback(null)} className="hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Mobile Split Toggle Switch (sm screens only) */}
        <div className="lg:hidden flex border-b border-[#D8C2A6]/10 bg-[#111111]">
          <button
            onClick={() => setMobileTab("current")}
            className={`flex-1 py-3 text-xs font-mono uppercase tracking-wider text-center transition-colors ${
              mobileTab === "current"
                ? "bg-[#181818] text-[#F1E7DB] border-b-2 border-[#D8C2A6]"
                : "text-[#9A9A9A] hover:text-[#F1E7DB]"
            }`}
          >
            ← Current Profile
          </button>
          <button
            onClick={() => setMobileTab("simulated")}
            className={`flex-1 py-3 text-xs font-mono uppercase tracking-wider text-center transition-colors ${
              mobileTab === "simulated"
                ? "bg-[#181818] text-blue-300 border-b-2 border-blue-400"
                : "text-[#9A9A9A] hover:text-[#F1E7DB]"
            }`}
          >
            Simulated Future ↗
          </button>
        </div>

        {/* ============================================================ */}
        {/* MAIN BODY: SPLIT-SCREEN EXPERIENCE (LEFT: CURRENT, RIGHT: SIM) */}
        {/* ============================================================ */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-[#D8C2A6]/10">
          {/* ------------------------------------------------------------ */}
          {/* LEFT PANEL: CURRENT CAREER PROFILE & BASELINE               */}
          {/* ------------------------------------------------------------ */}
          <div
            className={`lg:col-span-5 p-6 md:p-8 space-y-6 bg-[#161616] overflow-y-auto ${
              mobileTab === "current" ? "block" : "hidden lg:block"
            }`}
          >
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2 h-2 rounded-full bg-[#D8C2A6]" />
                <span className="micro-label text-[#A56F7C]">BASELINE PROFILE // VERIFIED STATE</span>
              </div>
              <h3 className="text-2xl font-light text-[#F1E7DB]">
                {DEMO_PERSONA.full_name}
              </h3>
              <p className="text-xs text-[#9A9A9A] mt-1 font-mono">
                {DEMO_METRICS.preBreakFormatted} tenure in {DEMO_PERSONA.past_experience} • Career pause: {DEMO_METRICS.breakDurationFormatted} ({DEMO_PERSONA.break_reason})
              </p>
            </div>

            {/* Baseline Big Numbers */}
            <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-[#111111] border border-[#D8C2A6]/10">
              <div>
                <span className="micro-label-muted block mb-1">CAREER READINESS</span>
                <span className="text-4xl font-light text-[#F1E7DB]">
                  {before.readiness_score || 82}%
                </span>
                <span className="text-[11px] text-[#9A9A9A] block mt-0.5">Top Tier Baseline</span>
              </div>
              <div>
                <span className="micro-label-muted block mb-1">TARGET ROLE MATCH</span>
                <span className="text-4xl font-light text-[#D8C2A6]">
                  {before.target_role_match || 85}%
                </span>
                <span className="text-[11px] text-[#9A9A9A] block mt-0.5 font-mono">
                  {before.target_role || "Data Analyst"}
                </span>
              </div>
            </div>

            {/* Verified & Self-Reported Skills */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="micro-label text-[#D8C2A6]">VERIFIED & CONFIRMED SKILLS</span>
                <span className="text-[10px] font-mono text-[#9A9A9A]">Passport Certified</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {(before.verified_skills || ["SQL", "Data Modeling", "Python", "Spreadsheet Modeling"]).map((s: string) => (
                  <span
                    key={s}
                    className="px-2.5 py-1 rounded-md bg-[#111111] border border-[#D8C2A6]/20 text-[#F1E7DB] text-xs font-mono"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>

            {/* Baseline Remaining Gaps */}
            <div className="space-y-2">
              <span className="micro-label text-[#A56F7C]">CURRENT GAPS TO TARGET ROLE</span>
              <div className="space-y-2 font-mono text-xs">
                {(before.remaining_gaps || ["Power BI", "DAX Calculated Measures", "Executive Dashboarding"]).map((gap: string) => (
                  <div
                    key={gap}
                    className="p-3 rounded-lg bg-[#111111] border border-amber-500/20 text-amber-200/90 flex items-center justify-between"
                  >
                    <span>• {gap}</span>
                    <span className="text-[10px] text-amber-400 font-semibold">MISSING</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Current Preferences & Pacing */}
            <div className="p-4 rounded-xl bg-[#111111] border border-[#D8C2A6]/10 space-y-2 font-mono text-xs">
              <span className="text-[#9A9A9A] uppercase block">ACTIVE AVAILABILITY PROFILE</span>
              <div className="flex items-center justify-between text-[#F1E7DB]">
                <span>Weekly Commitment:</span>
                <span className="text-[#D8C2A6]">{before.weekly_hours || 15} Hours / Week</span>
              </div>
              <div className="flex items-center justify-between text-[#F1E7DB]">
                <span>Work Arrangement:</span>
                <span className="text-[#D8C2A6]">{before.work_mode || "Hybrid"}</span>
              </div>
              <div className="flex items-center justify-between text-[#F1E7DB]">
                <span>Baseline Time to Return:</span>
                <span className="text-[#D8C2A6]">~8–10 Weeks</span>
              </div>
            </div>

            {/* Saved Simulations Drawer Trigger */}
            <div className="pt-2">
              <div className="flex items-center justify-between mb-2">
                <span className="micro-label text-[#9A9A9A]">
                  SAVED SCENARIOS ({savedSimulations.length})
                </span>
                {savedSimulations.length > 0 && (
                  <button
                    onClick={() => handleOpenComparison()}
                    className="text-[11px] text-blue-300 hover:text-blue-200 underline font-mono flex items-center gap-1"
                  >
                    <GitCompare className="w-3 h-3" />
                    <span>Compare Saved</span>
                  </button>
                )}
              </div>

              {savedSimulations.length === 0 ? (
                <div className="p-4 rounded-xl border border-dashed border-[#D8C2A6]/20 text-center text-xs text-[#9A9A9A] font-mono">
                  No saved scenarios yet. Configure inputs on the right and click "Save Scenario".
                </div>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {savedSimulations.map((sim) => (
                    <div
                      key={sim.id}
                      onClick={() => handleLoadSavedScenario(sim)}
                      className="p-3 rounded-lg bg-[#111111] border border-[#D8C2A6]/15 hover:border-blue-500/40 cursor-pointer flex items-center justify-between transition-all group"
                    >
                      <div>
                        <div className="text-xs font-medium text-[#F1E7DB] group-hover:text-blue-200">
                          {sim.scenario_name}
                        </div>
                        <div className="text-[10px] text-[#9A9A9A] font-mono mt-0.5">
                          Readiness: {sim.results?.after?.projected_readiness_score}% • Match: {sim.results?.after?.projected_target_role_match}%
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => handleDeleteSaved(sim.id, e)}
                          title="Remove saved scenario"
                          className="p-1 hover:text-red-400 text-[#9A9A9A] transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <ChevronRight className="w-4 h-4 text-[#9A9A9A] group-hover:text-blue-300" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ------------------------------------------------------------ */}
          {/* RIGHT PANEL: SIMULATED SCENARIO & POTENTIAL OUTCOMES         */}
          {/* ------------------------------------------------------------ */}
          <div
            className={`lg:col-span-7 p-6 md:p-8 space-y-6 bg-[#141414] overflow-y-auto ${
              mobileTab === "simulated" ? "block" : "hidden lg:block"
            }`}
          >
            {/* Scenario Selection Pills */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="micro-label text-blue-400 font-mono">
                  STEP 1: SELECT SIMULATION SCENARIO
                </span>
                <span className="text-[11px] font-mono text-[#9A9A9A]">
                  Core Concept: "What could change if I take this step?"
                </span>
              </div>

              {/* Scrollable Scenario Type Tabs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-2">
                {SCENARIO_TYPES.map((st) => (
                  <button
                    key={st.id}
                    onClick={() => {
                      setScenarioType(st.id);
                    }}
                    className={`p-2.5 rounded-xl border text-left transition-all font-mono ${
                      scenarioType === st.id
                        ? "bg-blue-950/40 border-blue-400 text-blue-200 shadow-lg"
                        : "bg-[#181818] border-[#D8C2A6]/10 text-[#9A9A9A] hover:border-[#D8C2A6]/30 hover:text-[#F1E7DB]"
                    }`}
                  >
                    <span className="block text-[10px] text-blue-400 uppercase font-semibold">
                      {st.badge}
                    </span>
                    <span className="block text-xs font-sans font-medium mt-0.5 text-[#F1E7DB]">
                      {st.title}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Scenario Configuration Inputs Form */}
            <div className="p-5 rounded-2xl bg-[#181818] border border-blue-500/20 space-y-4">
              <div className="flex items-center justify-between border-b border-[#D8C2A6]/10 pb-3">
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-blue-400" />
                  <span className="text-xs font-mono uppercase tracking-wider text-[#F1E7DB]">
                    SCENARIO PARAMETERS: {SCENARIO_TYPES.find((s) => s.id === scenarioType)?.title}
                  </span>
                </div>
                <button
                  onClick={handleRecalculate}
                  disabled={isSimulating}
                  className="btn-editorial-primary text-xs py-1.5 px-4 bg-blue-600 hover:bg-blue-500 border-blue-400 text-white flex items-center gap-1.5"
                >
                  <RotateCcw className={`w-3.5 h-3.5 ${isSimulating ? "animate-spin" : ""}`} />
                  <span>{isSimulating ? "Calculating..." : "Recalculate"}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
                {/* Dynamic Parameter: Depending on Scenario Type */}
                {scenarioType === "learn_skill" && (
                  <div>
                    <label className="block text-[#9A9A9A] uppercase mb-1">SKILL TO ACQUIRE</label>
                    <select
                      value={selectedSkill}
                      onChange={(e) => setSelectedSkill(e.target.value)}
                      className="w-full bg-[#111111] border border-[#D8C2A6]/20 rounded-lg p-2.5 text-[#F1E7DB] focus:outline-none focus:border-blue-400"
                    >
                      {(options?.skills || [
                        "Power BI",
                        "Python",
                        "AWS Cloud",
                        "Docker",
                        "React",
                        "Tableau",
                        "Statistics & A/B Testing",
                      ]).map((sk: string) => (
                        <option key={sk} value={sk}>
                          {sk}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {scenarioType === "earn_qualification" && (
                  <div className="sm:col-span-2">
                    <label className="block text-[#9A9A9A] uppercase mb-1">TARGET CREDENTIAL</label>
                    <select
                      value={selectedQualification}
                      onChange={(e) => setSelectedQualification(e.target.value)}
                      className="w-full bg-[#111111] border border-[#D8C2A6]/20 rounded-lg p-2.5 text-[#F1E7DB] focus:outline-none focus:border-blue-400"
                    >
                      {(options?.qualifications || [
                        "Microsoft PL-300: Power BI Data Analyst",
                        "AWS Certified Cloud Practitioner",
                        "Google Data Analytics Professional Certificate",
                        "Professional Scrum Master I (PSM I)",
                      ]).map((q: string) => (
                        <option key={q} value={q}>
                          {q}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {scenarioType === "change_industry" && (
                  <div>
                    <label className="block text-[#9A9A9A] uppercase mb-1">TARGET SECTOR</label>
                    <select
                      value={selectedIndustry}
                      onChange={(e) => setSelectedIndustry(e.target.value)}
                      className="w-full bg-[#111111] border border-[#D8C2A6]/20 rounded-lg p-2.5 text-[#F1E7DB] focus:outline-none focus:border-blue-400"
                    >
                      {(options?.industries || ["HealthTech", "FinTech", "EdTech", "ClimateTech", "E-Commerce"]).map((ind: string) => (
                        <option key={ind} value={ind}>
                          {ind}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {scenarioType === "complete_project" && (
                  <div className="sm:col-span-2">
                    <label className="block text-[#9A9A9A] uppercase mb-1">PORTFOLIO REPOSITORY</label>
                    <select
                      value={selectedProject}
                      onChange={(e) => setSelectedProject(e.target.value)}
                      className="w-full bg-[#111111] border border-[#D8C2A6]/20 rounded-lg p-2.5 text-[#F1E7DB] focus:outline-none focus:border-blue-400"
                    >
                      {(options?.projects || [
                        "Customer Churn Telemetry Dashboard",
                        "Automated Multi-Source ETL Pipeline",
                        "Full-Stack Metric Exploration Portal",
                        "Infrastructure as Code Deployment",
                      ]).map((p: string) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {scenarioType === "start_returnship" && (
                  <div className="sm:col-span-2">
                    <label className="block text-[#9A9A9A] uppercase mb-1">RETURNSHIP COHORT</label>
                    <select
                      value={selectedReturnship}
                      onChange={(e) => setSelectedReturnship(e.target.value)}
                      className="w-full bg-[#111111] border border-[#D8C2A6]/20 rounded-lg p-2.5 text-[#F1E7DB] focus:outline-none focus:border-blue-400"
                    >
                      <option value="Nova Tech 12-Week Analytics Returnship">
                        Nova Tech 12-Week Analytics Returnship (Hybrid 2-day)
                      </option>
                      <option value="Apex Cloud Migration 8-Week Cohort">
                        Apex Cloud Migration 8-Week Cohort (Fully Remote)
                      </option>
                    </select>
                  </div>
                )}

                {/* Target Career Pathway */}
                <div>
                  <label className="block text-[#9A9A9A] uppercase mb-1">TARGET OCCUPATION</label>
                  <select
                    value={targetCareer}
                    onChange={(e) => setTargetCareer(e.target.value)}
                    className="w-full bg-[#111111] border border-[#D8C2A6]/20 rounded-lg p-2.5 text-[#F1E7DB] focus:outline-none focus:border-blue-400"
                  >
                    {(options?.target_occupations || [
                      "Data Analyst",
                      "Business Intelligence Specialist",
                      "Cloud & DevOps Associate",
                      "Full Stack Web Developer",
                      "Technical Program Associate",
                    ]).map((occ: string) => (
                      <option key={occ} value={occ}>
                        {occ}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Work Arrangement */}
                <div>
                  <label className="block text-[#9A9A9A] uppercase mb-1">PREFERRED WORK MODE</label>
                  <select
                    value={workMode}
                    onChange={(e) => setWorkMode(e.target.value)}
                    className="w-full bg-[#111111] border border-[#D8C2A6]/20 rounded-lg p-2.5 text-[#F1E7DB] focus:outline-none focus:border-blue-400"
                  >
                    <option value="Remote">Remote</option>
                    <option value="Hybrid">Hybrid</option>
                    <option value="In-Office">In-Office</option>
                  </select>
                </div>

                {/* Weekly Hours Slider */}
                <div className="sm:col-span-2 pt-2">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[#9A9A9A] uppercase">
                      WEEKLY STUDY / WORK BANDWIDTH:{" "}
                      <strong className="text-blue-300 font-bold">{weeklyHours} HOURS / WEEK</strong>
                    </span>
                    <span className="text-[11px] text-[#A56F7C]">
                      (~{Math.round((weeklyHours / 5) * 10) / 10} hrs/day)
                    </span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="40"
                    step="5"
                    value={weeklyHours}
                    onChange={(e) => setWeeklyHours(parseInt(e.target.value))}
                    className="w-full accent-blue-400 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-[#9A9A9A] mt-1 font-mono">
                    <span>5 hrs (Relaxed)</span>
                    <span>15 hrs (Steady)</span>
                    <span>25 hrs (Intensive)</span>
                    <span>40 hrs (Full-time)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* ============================================================ */}
            {/* SIMULATION OUTCOME: BEFORE VS AFTER COMPARISON CARDS         */}
            {/* ============================================================ */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="micro-label text-blue-400 font-mono">
                  STEP 2: PROJECTED OUTCOMES & BEFORE VS AFTER DELTA
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] bg-green-950/80 text-green-300 border border-green-500/30 font-mono">
                  +{after.readiness_delta || 9}% READINESS BOOST
                </span>
              </div>

              {/* Big Comparative Scoreboard */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="p-4 rounded-xl bg-[#181818] border border-[#D8C2A6]/10">
                  <span className="micro-label-muted block mb-1">READINESS SCORE</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-light text-[#F1E7DB]">
                      {after.projected_readiness_score || 91}%
                    </span>
                    <span className="text-xs text-green-400 font-mono font-semibold">
                      +{after.readiness_delta || 9}%
                    </span>
                  </div>
                  <span className="text-[10px] text-[#9A9A9A] block mt-1">Before: {before.readiness_score || 82}%</span>
                </div>

                <div className="p-4 rounded-xl bg-[#181818] border border-blue-500/20">
                  <span className="micro-label-muted block mb-1 text-blue-300">TARGET ROLE MATCH</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-light text-blue-200">
                      {after.projected_target_role_match || 94}%
                    </span>
                    <span className="text-xs text-green-400 font-mono font-semibold">
                      +{after.match_delta || 9}%
                    </span>
                  </div>
                  <span className="text-[10px] text-[#9A9A9A] block mt-1">Before: {before.target_role_match || 85}%</span>
                </div>

                <div className="p-4 rounded-xl bg-[#181818] border border-[#D8C2A6]/10">
                  <span className="micro-label-muted block mb-1">LEARNING EFFORT</span>
                  <div className="text-3xl font-light text-[#D8C2A6]">
                    ~{after.estimated_learning_hours || 40}h
                  </div>
                  <span className="text-[10px] text-[#9A9A9A] block mt-1">
                    At {weeklyHours}h/wk = ~{after.estimated_weeks_to_complete || 3} wks
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-[#181818] border border-[#D8C2A6]/10">
                  <span className="micro-label-muted block mb-1">TIME TO RETURN</span>
                  <div className="text-3xl font-light text-green-300">
                    {after.estimated_weeks_to_complete || 3} Wks
                  </div>
                  <span className="text-[10px] text-green-400/80 block mt-1">Accelerated by 5 weeks</span>
                </div>
              </div>

              {/* Newly Satisfied Requirements vs Remaining Gaps */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-[#181818] border border-green-500/20 space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span className="micro-label text-green-300 font-mono">
                      NEWLY SATISFIED JOB REQUIREMENTS
                    </span>
                  </div>
                  <div className="space-y-1.5 font-mono text-xs">
                    {(after.newly_satisfied_requirements || [
                      "Interactive Business Intelligence Dashboards",
                      "DAX calculated measures and KPI metrics",
                      "Executive dashboard reporting (star-schema)",
                    ]).map((req: string, i: number) => (
                      <div key={i} className="flex items-start gap-2 text-green-200/90 text-[11px]">
                        <span className="text-green-400 shrink-0">✓</span>
                        <span>{req}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#181818] border border-amber-500/20 space-y-2">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-400" />
                    <span className="micro-label text-amber-300 font-mono">REMAINING TARGET GAPS</span>
                  </div>
                  <div className="space-y-1.5 font-mono text-xs">
                    {(after.remaining_gaps && after.remaining_gaps.length > 0
                      ? after.remaining_gaps
                      : ["Advanced Statistical Hypothesis Testing", "Production Pipeline Telemetry"]
                    ).map((gap: string, i: number) => (
                      <div key={i} className="flex items-start gap-2 text-amber-200/90 text-[11px]">
                        <span className="text-amber-400 shrink-0">•</span>
                        <span>{gap}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Recommended Practical Capstone Project */}
              {after.recommended_capstone_project && (
                <div className="p-5 rounded-2xl bg-blue-950/20 border border-blue-500/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="micro-label text-blue-300 font-mono">
                      RECOMMENDED CAPSTONE DELIVERABLE
                    </span>
                    <span className="text-[10px] font-mono text-[#D8C2A6]">
                      Tools: {after.recommended_capstone_project.tools}
                    </span>
                  </div>
                  <div className="text-base font-medium text-[#F1E7DB]">
                    {after.recommended_capstone_project.title}
                  </div>
                  <p className="text-xs text-[#9A9A9A] leading-relaxed font-sans">
                    {after.recommended_capstone_project.description}
                  </p>
                </div>
              )}

              {/* Impact Across 5 Career Pathways */}
              {after.pathways_affected && after.pathways_affected.length > 0 && (
                <div className="p-4 rounded-xl bg-[#181818] border border-[#D8C2A6]/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="micro-label text-[#D8C2A6]">IMPACT ACROSS CAREER PATHWAYS</span>
                    <span className="text-[10px] font-mono text-[#9A9A9A]">Match Delta</span>
                  </div>
                  <div className="space-y-2 font-mono text-xs">
                    {after.pathways_affected.map((p: any) => (
                      <div key={p.role} className="flex items-center justify-between p-2 rounded-lg bg-[#111111]">
                        <span className="text-[#F1E7DB]">{p.role}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-[#9A9A9A] text-[11px]">{p.before_match}%</span>
                          <ArrowRight className="w-3 h-3 text-[#D8C2A6]" />
                          <span className="text-blue-200 font-semibold">{p.after_match}%</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-950 text-green-300 border border-green-500/20">
                            +{p.delta}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Roadmap Changes Preview */}
              {after.roadmap_changes && after.roadmap_changes.length > 0 && (
                <div className="p-4 rounded-xl bg-[#181818] border border-[#D8C2A6]/10 space-y-2">
                  <span className="micro-label text-[#A56F7C]">ROADMAP DELTA // CURRICULUM EVOLUTION</span>
                  <div className="space-y-1.5 font-mono text-xs">
                    {after.roadmap_changes.map((rc: any, idx: number) => (
                      <div key={idx} className="flex items-start gap-2 text-xs">
                        <span className="text-blue-400 font-semibold shrink-0">[Week {rc.week}]</span>
                        <span className="text-[#F1E7DB]">{rc.change}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* AI Explainability Narrative */}
              {activeSimulation?.ai_explanation && (
                <div className="p-4 rounded-xl bg-[#111111] border border-[#D8C2A6]/15 space-y-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-blue-400" />
                    <span className="micro-label text-blue-300 font-mono">
                      WHY THIS SCENARIO ACCELERATES YOUR RETURN
                    </span>
                  </div>
                  <p className="text-xs text-[#F1E7DB] font-sans leading-relaxed">
                    {activeSimulation.ai_explanation}
                  </p>
                </div>
              )}
            </div>

            {/* ============================================================ */}
            {/* ACTION BAR: SAVE, COMPARE, ADD TO ROADMAP                     */}
            {/* ============================================================ */}
            <div className="pt-4 border-t border-[#D8C2A6]/10 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSaveScenario}
                  className="px-3.5 py-2 rounded-lg border border-[#D8C2A6]/20 bg-[#181818] hover:bg-[#222222] text-[#F1E7DB] text-xs font-mono transition-colors flex items-center gap-1.5"
                >
                  <Bookmark className="w-3.5 h-3.5 text-blue-400" />
                  <span>Save Scenario</span>
                </button>

                <button
                  onClick={() => handleOpenComparison()}
                  className="px-3.5 py-2 rounded-lg border border-[#D8C2A6]/20 bg-[#181818] hover:bg-[#222222] text-[#F1E7DB] text-xs font-mono transition-colors flex items-center gap-1.5"
                >
                  <GitCompare className="w-3.5 h-3.5 text-[#D8C2A6]" />
                  <span>Compare Scenarios</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleAddToRoadmap}
                  className="btn-editorial-primary text-xs py-2 px-4 flex items-center gap-1.5"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Add Skill to Roadmap →</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* SIDE-BY-SIDE COMPARISON MODAL POPUP                          */}
        {/* ============================================================ */}
        {showComparison && comparisonData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <div className="relative w-full max-w-4xl bg-[#181818] text-[#F1E7DB] rounded-2xl border border-blue-500/30 p-6 md:p-8 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-[#D8C2A6]/10 pb-4">
                <div>
                  <span className="micro-label text-blue-400 font-mono">
                    SIDE-BY-SIDE SCENARIO COMPARISON
                  </span>
                  <h3 className="text-2xl font-light text-[#F1E7DB]">
                    Evaluating Career Strategy Tradeoffs
                  </h3>
                </div>
                <button
                  onClick={() => setShowComparison(false)}
                  className="p-1.5 rounded-full hover:bg-white/10 text-[#9A9A9A]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-mono text-xs">
                {/* Scenario A Card */}
                <div className="p-5 rounded-xl bg-[#111111] border border-[#D8C2A6]/20 space-y-3">
                  <div className="text-base font-sans font-medium text-blue-200">
                    {comparisonData.scenario_a.name}
                  </div>
                  <div className="space-y-1.5 text-[#9A9A9A]">
                    <div className="flex justify-between">
                      <span>Readiness:</span>
                      <strong className="text-[#F1E7DB]">{comparisonData.scenario_a.readiness_score}%</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Target Match:</span>
                      <strong className="text-blue-300">{comparisonData.scenario_a.match_score}%</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Effort:</span>
                      <strong className="text-[#D8C2A6]">~{comparisonData.scenario_a.learning_hours} Hours</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Timeline:</span>
                      <strong className="text-green-300">{comparisonData.scenario_a.weeks} Weeks</strong>
                    </div>
                  </div>
                </div>

                {/* Scenario B Card */}
                <div className="p-5 rounded-xl bg-[#111111] border border-blue-500/40 space-y-3">
                  <div className="text-base font-sans font-medium text-green-300">
                    {comparisonData.scenario_b.name}
                  </div>
                  <div className="space-y-1.5 text-[#9A9A9A]">
                    <div className="flex justify-between">
                      <span>Readiness:</span>
                      <strong className="text-[#F1E7DB]">{comparisonData.scenario_b.readiness_score}%</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Target Match:</span>
                      <strong className="text-green-300">{comparisonData.scenario_b.match_score}%</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Effort:</span>
                      <strong className="text-[#D8C2A6]">~{comparisonData.scenario_b.learning_hours} Hours</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Timeline:</span>
                      <strong className="text-green-300">{comparisonData.scenario_b.weeks} Weeks</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Comparison Delta Bar */}
              <div className="p-4 rounded-xl bg-[#111111] border border-blue-500/20 font-mono text-xs flex flex-wrap items-center justify-between gap-4">
                <span>
                  Readiness Delta:{" "}
                  <strong className={comparisonData.comparison_delta.readiness_delta >= 0 ? "text-green-400" : "text-amber-400"}>
                    {comparisonData.comparison_delta.readiness_delta >= 0 ? "+" : ""}
                    {comparisonData.comparison_delta.readiness_delta}%
                  </strong>
                </span>
                <span>
                  Match Delta:{" "}
                  <strong className={comparisonData.comparison_delta.match_delta >= 0 ? "text-green-400" : "text-amber-400"}>
                    {comparisonData.comparison_delta.match_delta >= 0 ? "+" : ""}
                    {comparisonData.comparison_delta.match_delta}%
                  </strong>
                </span>
                <span>
                  Effort Delta:{" "}
                  <strong className="text-[#D8C2A6]">
                    {comparisonData.comparison_delta.hours_delta >= 0 ? "+" : ""}
                    {comparisonData.comparison_delta.hours_delta} Hours
                  </strong>
                </span>
                <span>
                  Time Delta:{" "}
                  <strong className="text-blue-300">
                    {comparisonData.comparison_delta.weeks_delta >= 0 ? "+" : ""}
                    {comparisonData.comparison_delta.weeks_delta} Weeks
                  </strong>
                </span>
              </div>

              <div className="text-xs text-[#9A9A9A] font-sans">
                {comparisonData.guidance}
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => setShowComparison(false)}
                  className="btn-editorial-primary text-xs py-2 px-5"
                >
                  Close Comparison
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
