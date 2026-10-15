"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Sparkles,
  BookOpen,
  Clock,
  Calendar,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Award,
  ExternalLink,
  ChevronRight,
  RefreshCw,
  Sliders,
  Shield,
  Layers,
  Zap,
  Coffee,
  Sun,
  Flame,
  FileCheck,
  Send,
  WifiOff,
  Wifi,
  BookmarkCheck,
  ArrowRight,
  Info
} from "lucide-react";
import { adaptiveLearningApi } from "../lib/api";

interface AdaptiveRoadmapModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialSector?: string;
  initialHours?: number;
}

interface QuizQuestion {
  question: string;
  options: string[];
  correct_index: number;
  explanation: string;
}

interface ModuleResource {
  provider: string;
  title: string;
  url: string;
  cost_tier: "free" | "paid" | "official_certification" | "non_certified_tutorial" | "internal_practice";
  verification_note?: string;
}

interface ModuleAssessment {
  type: string;
  title: string;
  quiz_questions?: QuizQuestion[];
  practical_task_prompt?: string;
}

interface RoadmapModule {
  id: string;
  skill_objective: string;
  title: string;
  prerequisites: string[];
  estimated_minutes: number;
  learning_mode?: string;
  progress_state: "not_started" | "in_progress" | "completed" | "skipped_proficient";
  resource?: ModuleResource;
  assessment?: ModuleAssessment;
  completion_evidence?: any;
}

interface WeeklyPlanItem {
  week: number;
  title: string;
  focus: string;
  estimated_hours: number;
  modules: RoadmapModule[];
}

export function AdaptiveRoadmapModal({
  isOpen,
  onClose,
  initialSector = "Data Analyst",
  initialHours = 15,
}: AdaptiveRoadmapModalProps) {
  // Navigation & Config State
  const [activeSector, setActiveSector] = useState<string>(initialSector);
  const [weeklyHours, setWeeklyHours] = useState<number>(initialHours);
  const [selectedMode, setSelectedMode] = useState<string>("focused_15min");
  const [lowBandwidthMode, setLowBandwidthMode] = useState<boolean>(false);

  // Roadmap State
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [roadmapData, setRoadmapData] = useState<any>(null);
  const [optionsData, setOptionsData] = useState<any>(null);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "info" | "error"; text: string } | null>(null);

  // Assessment & Quiz Modal State
  const [activeQuizModule, setActiveQuizModule] = useState<RoadmapModule | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);
  const [quizScore, setQuizScore] = useState<number>(0);
  const [taskArtifactUrl, setTaskArtifactUrl] = useState<string>("");
  const [reflectionNote, setReflectionNote] = useState<string>("");
  const [mentorReviewRequested, setMentorReviewRequested] = useState<boolean>(false);

  // Interruption Adaptation Modal State
  const [showAdaptModal, setShowAdaptModal] = useState<boolean>(false);
  const [adaptStrategy, setAdaptStrategy] = useState<string>("reschedule");
  const [adaptWeeks, setAdaptWeeks] = useState<number>(3);
  const [adaptHours, setAdaptHours] = useState<number>(6);

  // Manual Skip State
  const [skipModuleTarget, setSkipModuleTarget] = useState<RoadmapModule | null>(null);
  const [skipReason, setSkipReason] = useState<string>("Demonstrated prior professional experience.");

  // Fetch baseline on open
  useEffect(() => {
    if (isOpen) {
      loadInitialData();
    }
  }, [isOpen]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [opts, curr] = await Promise.all([
        adaptiveLearningApi.getOptions(),
        adaptiveLearningApi.getCurriculum(),
      ]);
      setOptionsData(opts);
      if (curr && curr.roadmap) {
        setRoadmapData(curr.roadmap);
        if (curr.roadmap.target_sector) setActiveSector(curr.roadmap.target_sector);
        if (curr.roadmap.weekly_hours) setWeeklyHours(curr.roadmap.weekly_hours);
        if (curr.roadmap.learning_mode) setSelectedMode(curr.roadmap.learning_mode);
      }
    } catch (err: any) {
      setStatusMessage({ type: "error", text: err.message || "Failed to load curriculum." });
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateRoadmap = async (sector = activeSector, hours = weeklyHours, mode = selectedMode) => {
    try {
      setSaving(true);
      setStatusMessage({ type: "info", text: "Calibrating personalized adaptive roadmap..." });
      const res = await adaptiveLearningApi.generateRoadmap({
        target_sector: sector,
        weekly_hours: hours,
        learning_mode: mode,
      });
      if (res && res.roadmap) {
        setRoadmapData(res.roadmap);
        setStatusMessage({
          type: "success",
          text: `Tailored curriculum generated for ${sector} (${res.roadmap.total_weeks || 5} weeks).`,
        });
      }
    } catch (err: any) {
      setStatusMessage({ type: "error", text: err.message || "Failed to generate roadmap." });
    } finally {
      setSaving(false);
    }
  };

  const handleApplyAdaptation = async () => {
    try {
      setSaving(true);
      const params: Record<string, any> = {};
      if (adaptStrategy === "reduce_workload") {
        params.new_weekly_hours = adaptHours;
      } else if (adaptStrategy === "extend_target_date") {
        params.extension_weeks = adaptWeeks;
      }

      const res = await adaptiveLearningApi.adaptRoadmap({
        strategy: adaptStrategy,
        parameters: params,
      });

      if (res && res.roadmap) {
        setRoadmapData(res.roadmap);
        setShowAdaptModal(false);
        setStatusMessage({
          type: "success",
          text: "Roadmap smoothly adapted with zero penalty. Your progress is fully preserved.",
        });
      }
    } catch (err: any) {
      setStatusMessage({ type: "error", text: err.message || "Failed to adapt roadmap." });
    } finally {
      setSaving(false);
    }
  };

  const handleOpenQuiz = (module: RoadmapModule) => {
    setActiveQuizModule(module);
    setQuizAnswers({});
    setQuizSubmitted(false);
    setQuizScore(0);
    setTaskArtifactUrl("");
    setReflectionNote(module.completion_evidence?.reflection_note || "");
    setMentorReviewRequested(false);
  };

  const handleAnswerSelect = (qIdx: number, optIdx: number) => {
    if (quizSubmitted) return;
    setQuizAnswers((prev) => ({ ...prev, [qIdx]: optIdx }));
  };

  const handleSubmitAssessment = async () => {
    if (!activeQuizModule) return;
    try {
      setSaving(true);
      const questions = activeQuizModule.assessment?.quiz_questions || [];
      let calculatedScore = 100;

      if (questions.length > 0) {
        let correctCount = 0;
        questions.forEach((q, idx) => {
          if (quizAnswers[idx] === q.correct_index) correctCount++;
        });
        calculatedScore = Math.round((correctCount / questions.length) * 100);
      }

      setQuizScore(calculatedScore);
      setQuizSubmitted(true);

      const res = await adaptiveLearningApi.completeModule(activeQuizModule.id, {
        score: calculatedScore,
        artifact_url: taskArtifactUrl,
        reflection_note: reflectionNote,
        mentor_review_requested: mentorReviewRequested,
      });

      if (res && res.roadmap) {
        setRoadmapData(res.roadmap);
        setStatusMessage({
          type: "success",
          text: `Module completed! Score: ${calculatedScore}%. Progress deterministically updated.`,
        });
      }
    } catch (err: any) {
      setStatusMessage({ type: "error", text: err.message || "Failed to submit assessment." });
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmSkipModule = async () => {
    if (!skipModuleTarget) return;
    try {
      setSaving(true);
      const res = await adaptiveLearningApi.skipModule(skipModuleTarget.id, {
        reason: skipReason,
      });
      if (res && res.roadmap) {
        setRoadmapData(res.roadmap);
        setSkipModuleTarget(null);
        setStatusMessage({
          type: "success",
          text: `Module '${skipModuleTarget.title}' skipped. Redundant time reclaimed.`,
        });
      }
    } catch (err: any) {
      setStatusMessage({ type: "error", text: err.message || "Failed to skip module." });
    } finally {
      setSaving(false);
    }
  };

  // Cost tier badge helper
  const renderCostBadge = (tier?: string) => {
    switch (tier) {
      case "free":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono tracking-wider font-semibold bg-emerald-950/60 text-emerald-300 border border-emerald-800/40">
            100% FREE
          </span>
        );
      case "official_certification":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono tracking-wider font-semibold bg-amber-950/60 text-amber-300 border border-amber-800/40">
            OFFICIAL CERTIFICATION
          </span>
        );
      case "paid":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono tracking-wider font-semibold bg-blue-950/60 text-blue-300 border border-blue-800/40">
            PAID COURSEWARE
          </span>
        );
      case "internal_practice":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono tracking-wider font-semibold bg-[#A56F7C]/20 text-[#D8C2A6] border border-[#A56F7C]/40">
            GFG PRACTICE DRILL
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono tracking-wider font-semibold bg-zinc-800 text-zinc-300 border border-zinc-700">
            TUTORIAL
          </span>
        );
    }
  };

  // Progress calculations
  const calculateOverallStats = () => {
    if (!roadmapData?.weekly_plan) return { totalMods: 0, completed: 0, skipped: 0, percent: 0 };
    let total = 0;
    let completed = 0;
    let skipped = 0;
    roadmapData.weekly_plan.forEach((w: WeeklyPlanItem) => {
      (w.modules || []).forEach((m) => {
        total++;
        if (m.progress_state === "completed") completed++;
        if (m.progress_state === "skipped_proficient") skipped++;
      });
    });
    const percent = total > 0 ? Math.round(((completed + skipped) / total) * 100) : 0;
    return { totalMods: total, completed, skipped, percent };
  };

  const stats = calculateOverallStats();

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="adaptive-roadmap-title"
    >
      <div
        className={`w-full max-w-6xl rounded-2xl border ${
          lowBandwidthMode
            ? "bg-[#0A0A0A] border-zinc-700 text-zinc-100"
            : "bg-[#141414] border-[#D8C2A6]/20 text-[#F1E7DB] shadow-2xl"
        } relative max-h-[92vh] flex flex-col overflow-hidden transition-all duration-300`}
      >
        {/* HEADER BAR */}
        <div className="p-4 sm:p-6 border-b border-[#D8C2A6]/10 flex flex-wrap items-center justify-between gap-4 bg-[#181818]/80 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#A56F7C]/30 to-[#D8C2A6]/10 border border-[#D8C2A6]/30 flex items-center justify-center text-[#D8C2A6]">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono tracking-widest text-[#A56F7C] uppercase font-semibold">
                  GFG MODULE 5 // ADAPTIVE ENGINE
                </span>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-mono bg-[#D8C2A6]/10 text-[#D8C2A6] border border-[#D8C2A6]/20">
                  DETERMINISTIC PROGRESS
                </span>
              </div>
              <h2 id="adaptive-roadmap-title" className="text-xl sm:text-2xl font-light tracking-tight text-[#F1E7DB]">
                Adaptive Career Roadmap
              </h2>
            </div>
          </div>

          {/* Low Bandwidth Mode & Action Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setLowBandwidthMode(!lowBandwidthMode)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-all border ${
                lowBandwidthMode
                  ? "bg-amber-950/50 border-amber-500/50 text-amber-300"
                  : "bg-white/5 border-white/10 text-[#C5BCB2] hover:bg-white/10"
              }`}
              title="Toggle Low-Bandwidth Mode for mobile data or slow networks"
            >
              {lowBandwidthMode ? <WifiOff className="w-3.5 h-3.5" /> : <Wifi className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">
                {lowBandwidthMode ? "Low-Bandwidth (ON)" : "Low-Bandwidth Mode"}
              </span>
            </button>

            <button
              onClick={() => setShowAdaptModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono bg-gradient-to-r from-[#A56F7C]/30 to-[#D8C2A6]/20 border border-[#D8C2A6]/40 text-[#F1E7DB] hover:bg-white/10 transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5 text-[#D8C2A6]" />
              <span>Life Interruption? Adapt Plan</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-[#C5BCB2] hover:text-[#F1E7DB] hover:bg-white/10 transition-all border border-transparent hover:border-white/10"
              aria-label="Close adaptive roadmap modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* STATUS BANNER */}
        {statusMessage && (
          <div
            className={`px-6 py-2.5 text-xs font-mono flex items-center justify-between border-b ${
              statusMessage.type === "success"
                ? "bg-emerald-950/40 border-emerald-800/40 text-emerald-300"
                : statusMessage.type === "error"
                ? "bg-rose-950/40 border-rose-800/40 text-rose-300"
                : "bg-blue-950/40 border-blue-800/40 text-blue-300"
            }`}
          >
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4" />
              <span>{statusMessage.text}</span>
            </div>
            <button onClick={() => setStatusMessage(null)} className="text-white/60 hover:text-white">
              ✕
            </button>
          </div>
        )}

        {/* MAIN BODY: 2-COLUMN SCROLLABLE LAYOUT */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-[#D8C2A6]/10">
          {/* LEFT COLUMN: CONTROLS & SECTOR SELECTION (4 COLS) */}
          <div className="lg:col-span-4 p-5 sm:p-6 space-y-6 bg-[#161616]">
            {/* Sector Selector */}
            <div>
              <label className="text-xs font-mono text-[#D8C2A6] block mb-2 uppercase tracking-wider font-semibold">
                1. Target Professional Sector
              </label>
              <div className="space-y-1.5">
                {(optionsData?.sectors || [
                  { key: "Data Analyst", title: "Data Analytics & Engineering" },
                  { key: "BI Specialist", title: "Business Intelligence & Reporting" },
                  { key: "Cloud & DevOps Associate", title: "Cloud & DevOps Infrastructure" },
                  { key: "Full Stack Web", title: "Modern Full Stack Web" },
                  { key: "Technical Program Associate", title: "Technical Program & Agile" },
                ]).map((sec: any) => (
                  <button
                    key={sec.key}
                    onClick={() => {
                      setActiveSector(sec.key);
                      handleGenerateRoadmap(sec.key, weeklyHours, selectedMode);
                    }}
                    className={`w-full text-left p-2.5 rounded-xl text-xs font-mono transition-all flex items-center justify-between border ${
                      activeSector === sec.key
                        ? "bg-[#D8C2A6]/15 border-[#D8C2A6] text-[#F1E7DB] font-semibold"
                        : "bg-white/[0.02] border-white/5 text-[#9A9A9A] hover:bg-white/5 hover:text-[#C5BCB2]"
                    }`}
                  >
                    <span className="truncate">{sec.title || sec.key}</span>
                    {activeSector === sec.key && <CheckCircle2 className="w-3.5 h-3.5 text-[#D8C2A6] shrink-0" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Learning Modes Selector */}
            <div>
              <label className="text-xs font-mono text-[#D8C2A6] block mb-2 uppercase tracking-wider font-semibold">
                2. Learning Pace & Mode
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2">
                {[
                  {
                    id: "microlearning_5min",
                    title: "5-Min Microlearning",
                    badge: "DAILY DRILL",
                    desc: "Quick mental models for caregivers",
                    icon: Zap,
                  },
                  {
                    id: "focused_15min",
                    title: "15-Min Focused Sprint",
                    badge: "RECOMMENDED",
                    desc: "Targeted code lessons & quick quizzes",
                    icon: Clock,
                  },
                  {
                    id: "structured_30min",
                    title: "30-Min Structured Lessons",
                    badge: "DEEP WORK",
                    desc: "Guided repositories & capstone drills",
                    icon: BookOpen,
                  },
                  {
                    id: "weekend_intensive",
                    title: "Weekend Intensive",
                    badge: "IMMERSION",
                    desc: "Consolidated Saturday/Sunday blocks",
                    icon: Flame,
                  },
                  {
                    id: "self_paced",
                    title: "Self-Paced Flexible",
                    badge: "NO DEADLINES",
                    desc: "Milestone completion at your speed",
                    icon: Coffee,
                  },
                ].map((mode) => {
                  const Icon = mode.icon;
                  const isSelected = selectedMode === mode.id;
                  return (
                    <button
                      key={mode.id}
                      onClick={() => {
                        setSelectedMode(mode.id);
                        handleGenerateRoadmap(activeSector, weeklyHours, mode.id);
                      }}
                      className={`text-left p-3 rounded-xl border transition-all ${
                        isSelected
                          ? "bg-gradient-to-r from-[#A56F7C]/20 to-[#D8C2A6]/10 border-[#D8C2A6] text-[#F1E7DB]"
                          : "bg-white/[0.02] border-white/5 text-[#9A9A9A] hover:bg-white/5 hover:text-[#C5BCB2]"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-1.5 font-medium text-xs">
                          <Icon className={`w-3.5 h-3.5 ${isSelected ? "text-[#D8C2A6]" : "text-[#9A9A9A]"}`} />
                          <span>{mode.title}</span>
                        </div>
                        <span
                          className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${
                            isSelected
                              ? "bg-[#D8C2A6]/20 text-[#D8C2A6]"
                              : "bg-white/5 text-[#9A9A9A]"
                          }`}
                        >
                          {mode.badge}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#9A9A9A] leading-relaxed">{mode.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Weekly Availability Capacity Slider */}
            <div>
              <div className="flex items-center justify-between text-xs font-mono mb-2">
                <span className="text-[#D8C2A6] uppercase tracking-wider font-semibold">
                  3. Weekly Study Hours
                </span>
                <span className="text-[#F1E7DB] font-bold bg-[#D8C2A6]/20 px-2 py-0.5 rounded">
                  {weeklyHours} Hours / Week
                </span>
              </div>
              <input
                type="range"
                min="5"
                max="35"
                step="1"
                value={weeklyHours}
                onChange={(e) => setWeeklyHours(parseInt(e.target.value))}
                onMouseUp={() => handleGenerateRoadmap(activeSector, weeklyHours, selectedMode)}
                onTouchEnd={() => handleGenerateRoadmap(activeSector, weeklyHours, selectedMode)}
                className="w-full accent-[#D8C2A6] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-mono text-[#9A9A9A] mt-1">
                <span>5h (Caregiver micro)</span>
                <span>15h (Balanced sprint)</span>
                <span>35h (Full immersion)</span>
              </div>
            </div>

            {/* PROGRESS SUMMARY CARD */}
            <div className="p-4 rounded-xl bg-black/40 border border-[#D8C2A6]/15 space-y-3">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-[#C5BCB2]">Curriculum Progress:</span>
                <span className="text-[#D8C2A6] font-bold">{stats.percent}% Ready</span>
              </div>
              <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#A56F7C] to-[#D8C2A6] transition-all duration-500"
                  style={{ width: `${stats.percent}%` }}
                />
              </div>
              <div className="grid grid-cols-3 gap-2 text-center pt-1 font-mono text-[10px]">
                <div className="p-1.5 rounded bg-white/5">
                  <div className="text-emerald-400 font-bold">{stats.completed}</div>
                  <div className="text-zinc-400">Completed</div>
                </div>
                <div className="p-1.5 rounded bg-white/5">
                  <div className="text-amber-400 font-bold">{stats.skipped}</div>
                  <div className="text-zinc-400">Skipped (Proficient)</div>
                </div>
                <div className="p-1.5 rounded bg-white/5">
                  <div className="text-[#F1E7DB] font-bold">
                    {stats.totalMods - stats.completed - stats.skipped}
                  </div>
                  <div className="text-zinc-400">Remaining</div>
                </div>
              </div>
            </div>

            {/* Regulatory Disclaimer */}
            <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5 text-[10px] text-[#9A9A9A] leading-relaxed flex items-start gap-2">
              <Shield className="w-4 h-4 text-[#D8C2A6] shrink-0 mt-0.5" />
              <span>
                GFG curates verified resources from accredited universities and industry standards. GFG does not issue government degrees directly.
              </span>
            </div>
          </div>

          {/* RIGHT COLUMN: ADAPTIVE ROADMAP TIMELINE & MODULE CARDS (8 COLS) */}
          <div className="lg:col-span-8 p-5 sm:p-6 overflow-y-auto space-y-6">
            {/* Top Roadmap Overview Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-[#1C1C1C] border border-[#D8C2A6]/15">
              <div>
                <span className="text-[10px] font-mono text-[#A56F7C] uppercase tracking-wider block">
                  CALIBRATED CURRICULUM
                </span>
                <h3 className="text-base sm:text-lg font-medium text-[#F1E7DB]">
                  {roadmapData?.target_sector || activeSector} Roadmap ({roadmapData?.total_weeks || 5} Weeks)
                </h3>
                <p className="text-xs text-[#9A9A9A] font-mono mt-0.5">
                  {roadmapData?.learning_mode_meta?.title || "15-Minute Focused Learning"} • ~
                  {roadmapData?.total_estimated_hours || 12.5} total study hours
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleGenerateRoadmap(activeSector, weeklyHours, selectedMode)}
                  disabled={saving}
                  className="px-3 py-1.5 rounded-lg text-xs font-mono bg-white/5 hover:bg-white/10 text-[#F1E7DB] border border-white/10 transition-all flex items-center gap-1.5"
                >
                  <RefreshCw className={`w-3.5 h-3.5 text-[#D8C2A6] ${saving ? "animate-spin" : ""}`} />
                  <span>Regenerate</span>
                </button>
              </div>
            </div>

            {/* ADAPTATION HISTORY LOG (IF ANY) */}
            {roadmapData?.adaptation_history && roadmapData.adaptation_history.length > 0 && (
              <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-800/30 text-xs font-mono text-amber-200/90 space-y-1">
                <div className="flex items-center gap-1.5 text-amber-300 font-semibold text-[11px]">
                  <BookmarkCheck className="w-3.5 h-3.5" />
                  <span>Adaptive Adaptation Record</span>
                </div>
                {roadmapData.adaptation_history.map((h: any, idx: number) => (
                  <div key={idx} className="text-[11px] text-amber-200/80 pl-5">
                    • {h.summary}
                  </div>
                ))}
              </div>
            )}

            {/* WEEKS & MODULES CONTAINER */}
            <div className="space-y-6">
              {(roadmapData?.weekly_plan || []).map((week: WeeklyPlanItem) => (
                <div
                  key={week.week}
                  className={`rounded-2xl border transition-all ${
                    lowBandwidthMode
                      ? "bg-black border-zinc-800 p-4"
                      : "bg-[#181818] border-[#D8C2A6]/15 p-5 shadow-sm"
                  }`}
                >
                  {/* Week Milestone Header */}
                  <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#D8C2A6]/10">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-[#A56F7C]/20 text-[#D8C2A6] border border-[#A56F7C]/40 flex items-center justify-center font-mono text-xs font-bold">
                        {week.week}
                      </span>
                      <h4 className="text-sm sm:text-base font-medium text-[#F1E7DB]">{week.title}</h4>
                    </div>
                    <span className="text-xs font-mono text-[#9A9A9A]">
                      ~{week.estimated_hours}h required
                    </span>
                  </div>

                  {/* Modules within Week */}
                  <div className="space-y-3">
                    {(week.modules || []).map((mod: RoadmapModule) => {
                      const isCompleted = mod.progress_state === "completed";
                      const isSkipped = mod.progress_state === "skipped_proficient";
                      const isInProgress = mod.progress_state === "in_progress";

                      return (
                        <div
                          key={mod.id}
                          className={`p-4 rounded-xl border transition-all ${
                            isCompleted
                              ? "bg-emerald-950/20 border-emerald-800/40"
                              : isSkipped
                              ? "bg-amber-950/15 border-amber-800/30 opacity-80"
                              : isInProgress
                              ? "bg-[#D8C2A6]/5 border-[#D8C2A6]/30"
                              : "bg-white/[0.02] border-white/5 hover:border-white/10"
                          }`}
                        >
                          {/* Module Header & Badges */}
                          <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                {isCompleted ? (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-700/40">
                                    <CheckCircle2 className="w-3 h-3" /> COMPLETED (Score:{" "}
                                    {mod.completion_evidence?.score || 100}%)
                                  </span>
                                ) : isSkipped ? (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-700/40">
                                    <CheckCircle2 className="w-3 h-3" /> SKIPPED (Prior Proficiency)
                                  </span>
                                ) : isInProgress ? (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-[#D8C2A6] bg-[#D8C2A6]/20 px-2 py-0.5 rounded border border-[#D8C2A6]/30">
                                    <Clock className="w-3 h-3" /> IN PROGRESS
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-mono text-zinc-400 bg-zinc-800/80 px-2 py-0.5 rounded border border-zinc-700/50">
                                    NOT STARTED
                                  </span>
                                )}

                                {renderCostBadge(mod.resource?.cost_tier)}
                              </div>
                              <h5 className="text-sm font-medium text-[#F1E7DB]">{mod.title}</h5>
                            </div>

                            <span className="text-[11px] font-mono text-[#9A9A9A] bg-black/40 px-2 py-0.5 rounded border border-white/5">
                              {mod.estimated_minutes} mins
                            </span>
                          </div>

                          {/* Skill Objective & Prerequisites */}
                          <p className="text-xs text-[#C5BCB2] mb-3 leading-relaxed">
                            <strong className="text-[#D8C2A6] font-mono text-[11px]">Objective:</strong>{" "}
                            {mod.skill_objective}
                          </p>

                          {/* Verified Resource Info */}
                          {mod.resource && (
                            <div className="mb-3 p-2.5 rounded-lg bg-black/30 border border-white/5 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
                              <div className="flex items-center gap-2 truncate">
                                <BookOpen className="w-3.5 h-3.5 text-[#D8C2A6] shrink-0" />
                                <span className="text-[#F1E7DB] truncate font-medium">
                                  {mod.resource.provider}:
                                </span>
                                <span className="text-[#9A9A9A] truncate">{mod.resource.title}</span>
                              </div>
                              <a
                                href={mod.resource.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-[11px] text-[#D8C2A6] hover:underline shrink-0"
                              >
                                <span>Open Course</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            </div>
                          )}

                          {/* Action Buttons: Take Assessment / Mark Skip */}
                          <div className="flex items-center justify-between gap-2 pt-2 border-t border-white/5">
                            <div className="text-[11px] font-mono text-[#9A9A9A]">
                              {mod.assessment?.type === "short_quiz"
                                ? "Assessment: Knowledge Quiz Check"
                                : "Assessment: Practical Capstone Task"}
                            </div>

                            <div className="flex items-center gap-2">
                              {!isCompleted && !isSkipped && (
                                <button
                                  onClick={() => {
                                    setSkipModuleTarget(mod);
                                    setSkipReason("Demonstrated prior professional experience.");
                                  }}
                                  className="px-2.5 py-1 text-[11px] font-mono text-zinc-400 hover:text-amber-300 hover:bg-amber-950/30 rounded border border-transparent hover:border-amber-700/40 transition-all"
                                  title="Skip if you already have demonstrated proficiency"
                                >
                                  Skip (Already know this)
                                </button>
                              )}

                              <button
                                onClick={() => handleOpenQuiz(mod)}
                                className={`px-3 py-1 rounded-lg text-xs font-mono transition-all flex items-center gap-1 ${
                                  isCompleted
                                    ? "bg-white/5 hover:bg-white/10 text-emerald-300 border border-emerald-800/40"
                                    : "bg-gradient-to-r from-[#A56F7C] to-[#D8C2A6] text-black font-semibold hover:opacity-90 shadow-sm"
                                }`}
                              >
                                <span>{isCompleted ? "Review Assessment" : "Take Assessment"}</span>
                                <ArrowRight className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* FOOTER BAR */}
        <div className="p-4 border-t border-[#D8C2A6]/10 flex flex-wrap items-center justify-between gap-4 bg-[#181818]/90 text-xs font-mono text-[#9A9A9A]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Curriculum synchronized with Career Digital Twin profile.</span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-[#F1E7DB] border border-white/10 transition-all"
          >
            Done & Save Progress
          </button>
        </div>
      </div>

      {/* QUIZ & ASSESSMENT MODAL OVERLAY */}
      {activeQuizModule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md overflow-y-auto">
          <div className="w-full max-w-2xl rounded-2xl bg-[#161616] border border-[#D8C2A6]/30 p-6 space-y-5 text-[#F1E7DB] relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setActiveQuizModule(null)}
              className="absolute top-5 right-5 p-1.5 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="border-b border-white/10 pb-3">
              <span className="text-[10px] font-mono text-[#A56F7C] uppercase tracking-wider block font-semibold">
                ASSESSMENT & EVIDENCE CHECK
              </span>
              <h3 className="text-xl font-light text-[#F1E7DB]">{activeQuizModule.title}</h3>
              <p className="text-xs font-mono text-[#9A9A9A] mt-0.5">
                Objective: {activeQuizModule.skill_objective}
              </p>
            </div>

            {/* Quiz Questions */}
            {activeQuizModule.assessment?.quiz_questions &&
              activeQuizModule.assessment.quiz_questions.length > 0 && (
                <div className="space-y-4">
                  <h4 className="text-xs font-mono text-[#D8C2A6] uppercase tracking-wider font-semibold">
                    Knowledge Check Questions
                  </h4>

                  {activeQuizModule.assessment.quiz_questions.map((q, qIdx) => {
                    const selectedOpt = quizAnswers[qIdx];
                    const isCorrect = selectedOpt === q.correct_index;

                    return (
                      <div key={qIdx} className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-3">
                        <p className="text-xs font-medium text-[#F1E7DB] leading-relaxed">
                          {qIdx + 1}. {q.question}
                        </p>

                        <div className="space-y-2">
                          {q.options.map((opt, optIdx) => {
                            const isChosen = selectedOpt === optIdx;
                            let btnStyle = "bg-white/5 border-white/10 text-[#C5BCB2]";
                            if (quizSubmitted) {
                              if (optIdx === q.correct_index) {
                                btnStyle = "bg-emerald-950/60 border-emerald-500 text-emerald-200 font-medium";
                              } else if (isChosen && !isCorrect) {
                                btnStyle = "bg-rose-950/60 border-rose-500 text-rose-200 line-through";
                              }
                            } else if (isChosen) {
                              btnStyle = "bg-[#D8C2A6]/20 border-[#D8C2A6] text-[#F1E7DB] font-semibold";
                            }

                            return (
                              <button
                                key={optIdx}
                                onClick={() => handleAnswerSelect(qIdx, optIdx)}
                                className={`w-full text-left p-3 rounded-lg border text-xs leading-relaxed transition-all flex items-start gap-2.5 ${btnStyle}`}
                              >
                                <span className="font-mono text-[10px] w-4 shrink-0 text-zinc-400">
                                  {String.fromCharCode(65 + optIdx)}.
                                </span>
                                <span>{opt}</span>
                              </button>
                            );
                          })}
                        </div>

                        {/* Explanation after submit */}
                        {quizSubmitted && (
                          <div className="p-3 rounded-lg bg-white/[0.03] border border-white/5 text-[11px] font-mono text-[#9A9A9A] leading-relaxed">
                            <strong className="text-[#D8C2A6]">Explanation:</strong> {q.explanation}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

            {/* Practical Task Prompt & Artifact URL */}
            {activeQuizModule.assessment?.practical_task_prompt && (
              <div className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-3">
                <h4 className="text-xs font-mono text-[#D8C2A6] uppercase tracking-wider font-semibold">
                  Practical Task Submission
                </h4>
                <p className="text-xs text-[#C5BCB2] leading-relaxed">
                  {activeQuizModule.assessment.practical_task_prompt}
                </p>

                <div>
                  <label className="text-[11px] font-mono text-[#9A9A9A] block mb-1">
                    Artifact / GitHub / Portfolio Link (Optional)
                  </label>
                  <input
                    type="url"
                    placeholder="https://github.com/your-username/project-repo"
                    value={taskArtifactUrl}
                    onChange={(e) => setTaskArtifactUrl(e.target.value)}
                    className="w-full bg-[#111111] border border-white/10 rounded-lg px-3 py-2 text-xs font-mono text-[#F1E7DB] focus:outline-none focus:border-[#D8C2A6]"
                  />
                </div>
              </div>
            )}

            {/* Reflection Note & Mentor Review */}
            <div className="space-y-3">
              <div>
                <label className="text-xs font-mono text-[#D8C2A6] block mb-1 uppercase tracking-wider font-semibold">
                  Reflection Note
                </label>
                <textarea
                  rows={2}
                  placeholder="What key concept clicked today? How does this connect to your return goals?"
                  value={reflectionNote}
                  onChange={(e) => setReflectionNote(e.target.value)}
                  className="w-full bg-[#111111] border border-white/10 rounded-lg p-3 text-xs text-[#F1E7DB] focus:outline-none focus:border-[#D8C2A6]"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer text-xs font-mono text-[#C5BCB2]">
                <input
                  type="checkbox"
                  checked={mentorReviewRequested}
                  onChange={(e) => setMentorReviewRequested(e.target.checked)}
                  className="accent-[#D8C2A6]"
                />
                <span>Request optional mentor review for this submission</span>
              </label>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
              <button
                onClick={() => setActiveQuizModule(null)}
                className="px-4 py-2 rounded-xl text-xs font-mono bg-white/5 hover:bg-white/10 text-[#C5BCB2]"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitAssessment}
                disabled={saving}
                className="px-5 py-2 rounded-xl text-xs font-mono bg-gradient-to-r from-[#A56F7C] to-[#D8C2A6] text-black font-semibold hover:opacity-95 shadow-md flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{quizSubmitted ? "Save & Close" : "Submit & Grade"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LIFE INTERRUPTION ADAPTATION MODAL */}
      {showAdaptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md overflow-y-auto">
          <div className="w-full max-w-xl rounded-2xl bg-[#161616] border border-[#D8C2A6]/40 p-6 space-y-5 text-[#F1E7DB] relative">
            <button
              onClick={() => setShowAdaptModal(false)}
              className="absolute top-5 right-5 p-1.5 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <span className="text-[10px] font-mono text-[#A56F7C] uppercase tracking-wider block font-semibold">
                LIFE HAPPENS // NON-PUNITIVE ADAPTATION
              </span>
              <h3 className="text-xl font-light text-[#F1E7DB]">Adapt Learning Plan</h3>
              <p className="text-xs text-[#9A9A9A] mt-1 leading-relaxed">
                Caregiving, illness, or unexpected commitments? GFG never punishes missed days or resets progress.
                Choose how you want your schedule to adjust:
              </p>
            </div>

            {/* Adaptation Options */}
            <div className="space-y-2.5">
              {[
                {
                  id: "reschedule",
                  title: "Smooth Reschedule",
                  desc: "Redistributes remaining pending modules evenly across upcoming weeks. Zero progress loss.",
                  badge: "RECOMMENDED",
                },
                {
                  id: "reduce_workload",
                  title: "Reduce Weekly Workload",
                  desc: "Drops hours down and switches automatically to 5-minute microlearning pacing.",
                  badge: "LESS PRESSURE",
                },
                {
                  id: "extend_target_date",
                  title: "Extend Target Completion Date",
                  desc: "Adds 2 to 4 buffer weeks to give you breathing room without hurting readiness scores.",
                  badge: "EXTRA BUFFER",
                },
                {
                  id: "reprioritize_essentials",
                  title: "Reprioritize Core Essentials",
                  desc: "Filters out electives, keeping strictly returnship core requirements (~35% effort saved).",
                  badge: "FAST TRACK",
                },
              ].map((opt) => (
                <label
                  key={opt.id}
                  onClick={() => setAdaptStrategy(opt.id)}
                  className={`p-3.5 rounded-xl border block cursor-pointer transition-all ${
                    adaptStrategy === opt.id
                      ? "bg-[#D8C2A6]/15 border-[#D8C2A6] text-[#F1E7DB]"
                      : "bg-white/[0.02] border-white/5 text-[#9A9A9A] hover:bg-white/5 hover:text-[#C5BCB2]"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-[#F1E7DB] flex items-center gap-2">
                      <input
                        type="radio"
                        name="adapt_strategy"
                        checked={adaptStrategy === opt.id}
                        onChange={() => setAdaptStrategy(opt.id)}
                        className="accent-[#D8C2A6]"
                      />
                      {opt.title}
                    </span>
                    <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-white/5 text-[#D8C2A6]">
                      {opt.badge}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#9A9A9A] pl-5">{opt.desc}</p>
                </label>
              ))}
            </div>

            {/* Sub-controls based on strategy */}
            {adaptStrategy === "reduce_workload" && (
              <div className="p-3 rounded-lg bg-black/40 border border-white/5 space-y-1">
                <label className="text-xs font-mono text-[#D8C2A6] block">
                  New Weekly Capacity: {adaptHours} Hours/Week
                </label>
                <input
                  type="range"
                  min="5"
                  max="10"
                  step="1"
                  value={adaptHours}
                  onChange={(e) => setAdaptHours(parseInt(e.target.value))}
                  className="w-full accent-[#D8C2A6]"
                />
              </div>
            )}

            {adaptStrategy === "extend_target_date" && (
              <div className="p-3 rounded-lg bg-black/40 border border-white/5 space-y-1">
                <label className="text-xs font-mono text-[#D8C2A6] block">
                  Extension Buffer: +{adaptWeeks} Weeks
                </label>
                <input
                  type="range"
                  min="2"
                  max="6"
                  step="1"
                  value={adaptWeeks}
                  onChange={(e) => setAdaptWeeks(parseInt(e.target.value))}
                  className="w-full accent-[#D8C2A6]"
                />
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
              <button
                onClick={() => setShowAdaptModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-mono bg-white/5 hover:bg-white/10 text-[#C5BCB2]"
              >
                Cancel
              </button>
              <button
                onClick={handleApplyAdaptation}
                disabled={saving}
                className="px-5 py-2 rounded-xl text-xs font-mono bg-gradient-to-r from-[#A56F7C] to-[#D8C2A6] text-black font-semibold hover:opacity-95 shadow-md"
              >
                Apply Non-Punitive Adjustment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MANUAL SKIP MODULE MODAL */}
      {skipModuleTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="w-full max-w-md rounded-2xl bg-[#161616] border border-amber-800/40 p-6 space-y-4 text-[#F1E7DB]">
            <div>
              <span className="text-[10px] font-mono text-amber-400 uppercase tracking-wider block font-semibold">
                DEMONSTRATED PROFICIENCY SKIP
              </span>
              <h3 className="text-lg font-light text-[#F1E7DB]">Skip '{skipModuleTarget.title}'</h3>
              <p className="text-xs text-[#9A9A9A] mt-1 leading-relaxed">
                If you already have working experience in this domain, skipping frees up {skipModuleTarget.estimated_minutes} minutes without hurting your completion metrics.
              </p>
            </div>

            <div>
              <label className="text-xs font-mono text-[#D8C2A6] block mb-1 font-semibold">
                Verification Justification
              </label>
              <input
                type="text"
                value={skipReason}
                onChange={(e) => setSkipReason(e.target.value)}
                placeholder="e.g., 3+ years writing SQL joins in previous analyst role."
                className="w-full bg-[#111111] border border-white/10 rounded-lg p-2.5 text-xs text-[#F1E7DB] focus:outline-none focus:border-[#D8C2A6]"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setSkipModuleTarget(null)}
                className="px-4 py-2 rounded-xl text-xs font-mono bg-white/5 hover:bg-white/10 text-[#C5BCB2]"
              >
                Keep in Plan
              </button>
              <button
                onClick={handleConfirmSkipModule}
                className="px-5 py-2 rounded-xl text-xs font-mono bg-amber-500 text-black font-semibold hover:bg-amber-400"
              >
                Confirm Skip & Save Time
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
