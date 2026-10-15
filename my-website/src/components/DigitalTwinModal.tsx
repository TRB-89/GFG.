"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Brain,
  Shield,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  RefreshCw,
  Edit2,
  Trash2,
  Check,
  Plus,
  Compass,
  Briefcase,
  Clock,
  Layers,
  ArrowRight,
  BookOpen,
  Eye,
  GitBranch,
  Network,
  Lock,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { api } from "@/lib/api";

export interface DigitalTwinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onViewPassport?: () => void;
  onOpenSimulator?: () => void;
  defaultTab?: "overview" | "skills" | "gap" | "pathways" | "graph" | "history";
}

export function DigitalTwinModal({
  isOpen,
  onClose,
  onViewPassport,
  onOpenSimulator,
  defaultTab = "overview",
}: DigitalTwinModalProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "skills" | "gap" | "pathways" | "graph" | "history">(defaultTab);
  const [twinProfile, setTwinProfile] = useState<any>(null);
  const [skills, setSkills] = useState<any[]>([]);
  const [pathways, setPathways] = useState<any[]>([]);
  const [gapAnalysis, setGapAnalysis] = useState<any>(null);
  const [knowledgeGraph, setKnowledgeGraph] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Skill management modal state
  const [selectedRole, setSelectedRole] = useState<string>("Data Analyst");
  const [newSkillName, setNewSkillName] = useState<string>("");
  const [newSkillProficiency, setNewSkillProficiency] = useState<string>("intermediate");
  const [editingSkill, setEditingSkill] = useState<any | null>(null);
  const [expandedPathwayIndex, setExpandedPathwayIndex] = useState<number>(0);
  const [selectedGraphNode, setSelectedGraphNode] = useState<any | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadDigitalTwinData();
    }
  }, [isOpen, selectedRole]);

  const loadDigitalTwinData = async () => {
    setIsLoading(true);
    setFeedback(null);
    try {
      const [prof, sk, path, gap, graph, hist] = await Promise.all([
        api.getDigitalTwinProfile(),
        api.getDigitalTwinSkills(),
        api.getDigitalTwinPathways(),
        api.getDigitalTwinGapAnalysis(selectedRole),
        api.getDigitalTwinKnowledgeGraph(),
        api.getDigitalTwinHistory(),
      ]);

      setTwinProfile(prof);
      setSkills(sk || []);
      setPathways(path || []);
      setGapAnalysis(gap);
      setKnowledgeGraph(graph);
      setHistory(hist || []);

      if (graph?.nodes?.length > 0) {
        setSelectedGraphNode(graph.nodes[0]);
      }
    } catch (err: any) {
      console.warn("Using offline demonstration fallback for Digital Twin:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Recalibrate twin dynamically
  const handleRecalibrate = async () => {
    setIsRefreshing(true);
    setFeedback(null);
    try {
      const res = await api.refreshDigitalTwin();
      setFeedback({ type: "success", text: res.message || "Digital Twin recalibrated with confirmed credentials." });
      await loadDigitalTwinData();
    } catch (err: any) {
      setFeedback({ type: "error", text: "Failed to recalibrate Digital Twin." });
    } finally {
      setIsRefreshing(false);
    }
  };

  // Confirm an AI-inferred skill
  const handleConfirmSkill = async (skillName: string) => {
    try {
      await api.confirmDigitalTwinSkill(skillName, "intermediate");
      setFeedback({ type: "success", text: `Confirmed '${skillName}' into your active skill inventory.` });
      await loadDigitalTwinData();
    } catch (err: any) {
      setFeedback({ type: "error", text: "Failed to confirm skill." });
    }
  };

  // Correct skill proficiency
  const handleSaveCorrection = async () => {
    if (!editingSkill) return;
    try {
      await api.correctDigitalTwinSkill(editingSkill.id || editingSkill.name, editingSkill.proficiency, editingSkill.years_experience || 1.0);
      setEditingSkill(null);
      setFeedback({ type: "success", text: `Calibrated proficiency for '${editingSkill.name}'.` });
      await loadDigitalTwinData();
    } catch (err: any) {
      setFeedback({ type: "error", text: "Failed to update skill." });
    }
  };

  // Remove skill
  const handleRemoveSkill = async (skillIdentifier: string) => {
    if (!confirm(`Remove '${skillIdentifier}' from your Digital Twin inventory?`)) return;
    try {
      await api.removeDigitalTwinSkill(skillIdentifier);
      setFeedback({ type: "success", text: `Removed '${skillIdentifier}' from Digital Twin.` });
      await loadDigitalTwinData();
    } catch (err: any) {
      setFeedback({ type: "error", text: "Failed to remove skill." });
    }
  };

  // Add new skill
  const handleAddSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkillName.trim()) return;
    try {
      await api.addDigitalTwinSkill(newSkillName.trim(), "Technical", newSkillProficiency);
      setNewSkillName("");
      setFeedback({ type: "success", text: `Added '${newSkillName.trim()}' (Self-Reported).` });
      await loadDigitalTwinData();
    } catch (err: any) {
      setFeedback({ type: "error", text: "Failed to add skill." });
    }
  };

  const getProvenanceBadge = (prov: string) => {
    switch (prov) {
      case "independently_verified":
        return {
          label: "Independently Verified",
          classes: "bg-emerald-950/60 border-emerald-500/40 text-emerald-300",
          icon: Shield,
        };
      case "assessment_supported":
        return {
          label: "Assessment-Supported",
          classes: "bg-blue-950/60 border-blue-500/40 text-blue-300",
          icon: CheckCircle2,
        };
      case "ai_inferred":
        return {
          label: "AI-Inferred (Awaiting Confirmation)",
          classes: "bg-amber-950/60 border-amber-500/40 text-amber-300",
          icon: Sparkles,
        };
      case "self_reported":
      default:
        return {
          label: "Self-Reported",
          classes: "bg-[#181818] border-[#D8C2A6]/30 text-[#D8C2A6]",
          icon: Edit2,
        };
    }
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="digital-twin-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#111111]/85 backdrop-blur-md overflow-y-auto animate-fadeIn"
    >
      <div className="relative w-full max-w-5xl bg-[#181818] border border-[#D8C2A6]/20 rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden text-[#F1E7DB]">
        {/* TOP STATUS BAR */}
        <div className="px-6 py-4 border-b border-[#D8C2A6]/10 flex flex-wrap items-center justify-between gap-3 bg-[#141414]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#A56F7C]/20 border border-[#A56F7C]/40 flex items-center justify-center text-[#A56F7C]">
              <Brain className="w-4 h-4" />
            </div>
            <div>
              <span className="micro-label text-[10px] text-[#A56F7C] block">
                03 / AI CAREER DIGITAL TWIN // GFG INTELLIGENCE
              </span>
              <h2 id="digital-twin-title" className="text-sm uppercase tracking-wider font-mono text-[#F1E7DB]">
                Career Intelligence & Competency Model
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <button
              type="button"
              onClick={handleRecalibrate}
              disabled={isRefreshing}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#A56F7C]/40 bg-[#1c1417] text-[#F1E7DB] text-xs font-mono uppercase tracking-wider hover:border-[#A56F7C] transition-all disabled:opacity-50"
              title="Force AI recalculation using confirmed credentials"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-[#A56F7C] ${isRefreshing ? "animate-spin" : ""}`} />
              <span>{isRefreshing ? "Recalibrating..." : "Recalibrate"}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#9A9A9A] hover:text-[#F1E7DB] hover:bg-white/5 transition-colors"
              aria-label="Close Digital Twin"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* RESPONSIBLE AI DISCLOSURE BANNER */}
        <div className="px-6 py-2 bg-[#121212] border-b border-[#D8C2A6]/10 flex items-center justify-between text-[11px] font-mono text-[#9A9A9A]">
          <div className="flex items-center gap-2">
            <Shield className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>
              CAREER-PLANNING MODEL ONLY • NEVER MAKES AUTONOMOUS HIRING DECISIONS • ZERO CAREER-BREAK PENALTY
            </span>
          </div>
          <span className="text-[#D8C2A6] hidden md:inline">V2.1 ACTIVE</span>
        </div>

        {/* TAB NAVIGATION STRIP */}
        <div className="px-6 py-2 bg-[#161616] border-b border-[#D8C2A6]/10 flex items-center gap-2 overflow-x-auto scrollbar-none">
          {[
            { id: "overview", label: "01 // Overview" },
            { id: "skills", label: "02 // Skill Inventory" },
            { id: "gap", label: "03 // Gap Analysis" },
            { id: "pathways", label: "04 // Career Pathways" },
            { id: "graph", label: "05 // Knowledge Graph" },
            { id: "history", label: "06 // Audit Log" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-md text-xs font-mono uppercase tracking-wider whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? "bg-[#D8C2A6] text-[#111111] font-semibold"
                  : "text-[#9A9A9A] hover:text-[#F1E7DB] hover:bg-white/5"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* FEEDBACK BANNER */}
        {feedback && (
          <div
            className={`px-6 py-2.5 text-xs flex items-center justify-between border-b ${
              feedback.type === "success"
                ? "bg-emerald-950/50 border-emerald-500/30 text-emerald-200"
                : "bg-red-950/50 border-red-500/30 text-red-200"
            }`}
          >
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>{feedback.text}</span>
            </div>
            <button type="button" onClick={() => setFeedback(null)} className="text-xs hover:underline">
              Dismiss
            </button>
          </div>
        )}

        {/* MAIN SCROLLABLE TAB CONTENT */}
        <div className="p-6 md:p-8 overflow-y-auto flex-1 space-y-6">
          {/* ================= TAB 1: OVERVIEW ================= */}
          {activeTab === "overview" && twinProfile && (
            <div className="space-y-6 animate-fadeIn">
              {/* Header Profile Summary */}
              <div className="p-6 rounded-2xl bg-gradient-to-br from-[#1a1417] to-[#141414] border border-[#A56F7C]/30 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2">
                  <span className="micro-label text-[#A56F7C]">
                    DIGITAL TWIN PROFILE // {twinProfile.full_name}
                  </span>
                  <h3 className="text-2xl md:text-3xl font-serif text-[#F1E7DB]">
                    {twinProfile.career_history.previous_job_title}
                  </h3>
                  <p className="text-xs text-[#D8C2A6]/90 font-light max-w-xl leading-relaxed">
                    {twinProfile.career_history.experience_years} years documented tenure in{" "}
                    {twinProfile.career_history.industry}. Sabbatical:{" "}
                    {twinProfile.career_history.career_break.duration_months} months (
                    {twinProfile.career_history.career_break.break_type}) with continuous upskilling.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#111111]/80 border border-[#D8C2A6]/15 text-center min-w-[140px] shrink-0">
                  <span className="text-3xl font-light text-[#D8C2A6]">
                    {twinProfile.readiness_metrics?.readiness_score || 84}%
                  </span>
                  <div className="micro-label-muted text-[9px] mt-1">READINESS INDEX</div>
                  <span className="text-[10px] font-mono text-emerald-400 block mt-0.5">TIER 1 RETURN</span>
                </div>
              </div>

              {/* Grid of Key Digital Twin Dimensions */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Desired Career Paths */}
                <div className="p-5 rounded-xl bg-[#141414] border border-[#D8C2A6]/15 space-y-2.5">
                  <div className="flex items-center gap-2 text-xs font-mono uppercase text-[#D8C2A6] tracking-wider">
                    <Compass className="w-4 h-4 text-[#A56F7C]" />
                    <span>Ambitions & Goals</span>
                  </div>
                  <div className="space-y-1.5 pt-1">
                    {twinProfile.desired_career_paths.map((goal: string, idx: number) => (
                      <div key={idx} className="text-xs text-[#F1E7DB] flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#A56F7C]" />
                        <span>{goal}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Learning Availability */}
                <div className="p-5 rounded-xl bg-[#141414] border border-[#D8C2A6]/15 space-y-2.5">
                  <div className="flex items-center gap-2 text-xs font-mono uppercase text-[#D8C2A6] tracking-wider">
                    <Clock className="w-4 h-4 text-[#A56F7C]" />
                    <span>Learning Availability</span>
                  </div>
                  <div className="space-y-1 pt-1 text-xs">
                    <div className="text-2xl font-serif text-[#F1E7DB]">
                      {twinProfile.learning_availability.weekly_hours} hrs / week
                    </div>
                    <div className="text-[#9A9A9A] text-[11px]">
                      {twinProfile.learning_availability.pacing_category} (
                      {twinProfile.learning_availability.available_hours_per_day} hrs/day)
                    </div>
                  </div>
                </div>

                {/* Work Preferences */}
                <div className="p-5 rounded-xl bg-[#141414] border border-[#D8C2A6]/15 space-y-2.5">
                  <div className="flex items-center gap-2 text-xs font-mono uppercase text-[#D8C2A6] tracking-wider">
                    <Briefcase className="w-4 h-4 text-[#A56F7C]" />
                    <span>Work Preferences</span>
                  </div>
                  <div className="space-y-1 pt-1 text-xs text-[#F1E7DB]">
                    <div>Mode: <span className="text-[#D8C2A6] uppercase">{twinProfile.work_preferences.preferred_work_mode}</span></div>
                    <div>Location: {twinProfile.work_preferences.preferred_location}</div>
                    <div className="text-[11px] text-[#9A9A9A]">Target: {twinProfile.work_preferences.salary_expectation}</div>
                  </div>
                </div>
              </div>

              {/* Verified Qualifications and Portfolio Projects */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-5 rounded-xl bg-[#141414] border border-[#D8C2A6]/15 space-y-2">
                  <div className="text-xs font-mono uppercase text-[#D8C2A6] tracking-wider flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-[#A56F7C]" />
                    <span>Qualifications & Credentials</span>
                  </div>
                  <div className="text-xs text-[#F1E7DB] font-medium pt-1">
                    {twinProfile.qualifications.highest_qualification}
                  </div>
                  {twinProfile.qualifications.certificates?.length > 0 && (
                    <div className="space-y-1 pt-1">
                      {twinProfile.qualifications.certificates.map((c: any, i: number) => (
                        <div key={i} className="text-[11px] font-mono text-[#9A9A9A] flex items-center justify-between">
                          <span>• {c.title}</span>
                          <span className="text-[#D8C2A6]">{c.issuer}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="p-5 rounded-xl bg-[#141414] border border-[#D8C2A6]/15 space-y-2">
                  <div className="text-xs font-mono uppercase text-[#D8C2A6] tracking-wider flex items-center gap-2">
                    <Layers className="w-4 h-4 text-[#A56F7C]" />
                    <span>Portfolio Evidence & Capstones</span>
                  </div>
                  {twinProfile.portfolio_projects?.length > 0 ? (
                    <div className="space-y-2 pt-1">
                      {twinProfile.portfolio_projects.map((p: any, i: number) => (
                        <div key={i} className="text-xs">
                          <span className="text-[#F1E7DB] font-medium">{p.title}</span>
                          <div className="text-[11px] text-[#9A9A9A]">{p.technologies}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-xs text-[#888888] pt-1">
                      No standalone projects yet. 8-week roadmap capstone will be verified here.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 2: SKILL INVENTORY WITH PROVENANCE ================= */}
          {activeTab === "skills" && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl font-serif text-[#F1E7DB]">
                    Skill Inventory with Provenance Tracking
                  </h3>
                  <p className="text-xs text-[#9A9A9A]">
                    Every extracted skill is classified by provenance. Inferred skills remain unverified until confirmed.
                  </p>
                </div>

                {/* Add Manual Skill Form */}
                <form onSubmit={handleAddSkill} className="flex items-center gap-2 shrink-0">
                  <input
                    type="text"
                    value={newSkillName}
                    onChange={(e) => setNewSkillName(e.target.value)}
                    placeholder="+ Add skill..."
                    className="px-3 py-1.5 rounded-lg bg-[#111111] border border-[#D8C2A6]/20 text-xs text-[#F1E7DB] placeholder-[#666666] focus:border-[#D8C2A6] focus:outline-none"
                  />
                  <select
                    value={newSkillProficiency}
                    onChange={(e) => setNewSkillProficiency(e.target.value)}
                    className="px-2.5 py-1.5 rounded-lg bg-[#111111] border border-[#D8C2A6]/20 text-xs text-[#F1E7DB] focus:outline-none"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                    <option value="expert">Expert</option>
                  </select>
                  <button type="submit" className="btn-editorial-primary text-xs py-1.5 px-3">
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>

              {/* Skills List by Provenance */}
              <div className="space-y-3">
                {skills.map((skill) => {
                  const badge = getProvenanceBadge(skill.provenance);
                  const Icon = badge.icon;
                  const isInferred = skill.provenance === "ai_inferred";

                  return (
                    <div
                      key={skill.id || skill.name}
                      className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
                        isInferred
                          ? "bg-amber-950/20 border-amber-500/30"
                          : "bg-[#141414] border-[#D8C2A6]/15 hover:border-[#D8C2A6]/30"
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2.5">
                          <span className="text-sm font-semibold text-[#F1E7DB] font-mono">
                            {skill.name}
                          </span>
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-mono ${badge.classes}`}
                          >
                            <Icon className="w-2.5 h-2.5" />
                            <span>{badge.label}</span>
                          </span>
                        </div>
                        <div className="text-xs text-[#9A9A9A] font-light">
                          Proficiency: <span className="text-[#D8C2A6] uppercase">{skill.proficiency}</span> • Source:{" "}
                          {skill.source_detail}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 shrink-0">
                        {isInferred ? (
                          <button
                            type="button"
                            onClick={() => handleConfirmSkill(skill.name)}
                            className="px-3 py-1.5 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-200 text-xs font-mono flex items-center gap-1.5 hover:bg-amber-500/30 transition-colors"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Confirm Skill</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setEditingSkill(skill)}
                            className="p-1.5 rounded-lg text-[#D8C2A6] hover:bg-white/5 text-xs font-mono"
                            title="Edit Proficiency"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => handleRemoveSkill(skill.name || skill.id)}
                          className="p-1.5 rounded-lg text-rose-300 hover:bg-rose-950/40 text-xs"
                          title="Remove from Digital Twin"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Edit Proficiency Sub-Modal / Drawer */}
              {editingSkill && (
                <div className="p-4 rounded-xl bg-[#111111] border border-[#D8C2A6]/30 space-y-3">
                  <div className="text-xs font-mono uppercase text-[#D8C2A6] font-semibold">
                    Calibrate Proficiency for {editingSkill.name}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-mono text-[#888888] block mb-1">PROFICIENCY LEVEL</label>
                      <select
                        value={editingSkill.proficiency}
                        onChange={(e) => setEditingSkill({ ...editingSkill, proficiency: e.target.value })}
                        className="w-full px-3 py-1.5 rounded-lg bg-[#181818] border border-[#D8C2A6]/20 text-xs text-[#F1E7DB]"
                      >
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                        <option value="expert">Expert</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-mono text-[#888888] block mb-1">YEARS OF MASTERY</label>
                      <input
                        type="number"
                        step="0.5"
                        value={editingSkill.years_experience || 1.0}
                        onChange={(e) => setEditingSkill({ ...editingSkill, years_experience: parseFloat(e.target.value) || 1.0 })}
                        className="w-full px-3 py-1.5 rounded-lg bg-[#181818] border border-[#D8C2A6]/20 text-xs text-[#F1E7DB]"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setEditingSkill(null)}
                      className="px-3 py-1 rounded text-xs text-[#9A9A9A]"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveCorrection}
                      className="btn-editorial-primary text-xs py-1 px-3"
                    >
                      Save Calibration
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ================= TAB 3: INDUSTRY GAP ANALYSIS ================= */}
          {activeTab === "gap" && gapAnalysis && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl font-serif text-[#F1E7DB]">
                    Documented Occupation Gap Analysis
                  </h3>
                  <p className="text-xs text-[#9A9A9A]">
                    Benchmarks your active profile against maintained, verified role taxonomy models.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-[#D8C2A6]">TARGET ROLE:</span>
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="px-3 py-1.5 rounded-lg bg-[#111111] border border-[#D8C2A6]/20 text-xs text-[#F1E7DB] focus:outline-none"
                  >
                    <option value="Data Analyst">Data Analyst</option>
                    <option value="Business Intelligence Specialist">BI Specialist</option>
                    <option value="Cloud & DevOps Associate">Cloud & DevOps Associate</option>
                    <option value="Full Stack Web Associate">Full Stack Web Associate</option>
                    <option value="Technical Program Associate">Technical Program Associate</option>
                  </select>
                </div>
              </div>

              {/* Analysis Highlights */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Transferable Strengths */}
                <div className="p-5 rounded-xl bg-[#141414] border border-[#D8C2A6]/15 space-y-3">
                  <div className="text-xs font-mono uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Existing Transferable Skills</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {gapAnalysis.existing_transferable_skills.map((s: string) => (
                      <span
                        key={s}
                        className="px-2.5 py-1 rounded-md bg-[#181818] border border-emerald-500/20 text-emerald-300 text-xs font-mono"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Missing Essential Skills */}
                <div className="p-5 rounded-xl bg-[#141414] border border-[#D8C2A6]/15 space-y-3">
                  <div className="text-xs font-mono uppercase tracking-wider text-[#D8C2A6] flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-[#A56F7C]" />
                    <span>Missing Essential Skills</span>
                  </div>
                  <div className="space-y-2 pt-1">
                    {gapAnalysis.missing_essential_skills.map((m: any, i: number) => (
                      <div key={i} className="text-xs flex items-center justify-between border-b border-[#D8C2A6]/10 pb-1.5">
                        <span className="text-[#F1E7DB] font-medium">{m.skill}</span>
                        <span className="text-[#D8C2A6] font-mono text-[11px]">~{m.estimated_hours} hrs</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Modern Tools & Portfolio Evidence Requirements */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-5 rounded-xl bg-[#111111] border border-[#D8C2A6]/15 space-y-2">
                  <div className="text-xs font-mono uppercase text-[#A56F7C] tracking-wider">
                    New Industry Ecosystem Tools
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {gapAnalysis.new_industry_tools?.map((tool: string) => (
                      <span
                        key={tool}
                        className="px-2.5 py-1 rounded-md bg-[#181818] border border-[#A56F7C]/30 text-[#F1E7DB] text-xs font-mono"
                      >
                        {tool}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-5 rounded-xl bg-[#111111] border border-[#D8C2A6]/15 space-y-2">
                  <div className="text-xs font-mono uppercase text-[#D8C2A6] tracking-wider">
                    Portfolio Evidence Requirement
                  </div>
                  <p className="text-xs text-[#D8C2A6]/90 font-light leading-relaxed pt-1">
                    {gapAnalysis.portfolio_evidence_requirements}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 4: CAREER PATHWAYS & AI EXPLANATIONS ================= */}
          {activeTab === "pathways" && (
            <div className="space-y-6 animate-fadeIn">
              <div>
                <h3 className="text-xl font-serif text-[#F1E7DB]">
                  Top 5 Explainable Career Pathways
                </h3>
                <p className="text-xs text-[#9A9A9A]">
                  Synthesized from your historical depth, transferable competencies, and stated availability.
                </p>
              </div>

              <div className="space-y-4">
                {pathways.map((path, idx) => {
                  const isExpanded = expandedPathwayIndex === idx;
                  return (
                    <div
                      key={path.job_role}
                      className="rounded-xl border border-[#D8C2A6]/15 bg-[#141414] overflow-hidden transition-all"
                    >
                      {/* Pathway Header Summary */}
                      <div
                        onClick={() => setExpandedPathwayIndex(isExpanded ? -1 : idx)}
                        className="p-5 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-3">
                            <span className="text-base font-semibold text-[#F1E7DB] font-serif">
                              {path.job_role}
                            </span>
                            <span className="px-2 py-0.5 rounded-full bg-[#181818] border border-[#D8C2A6]/20 text-[10px] font-mono text-[#D8C2A6]">
                              {path.category}
                            </span>
                          </div>
                          <div className="text-xs text-[#9A9A9A] font-light">
                            {path.why_matched}
                          </div>
                        </div>

                        <div className="flex items-center gap-4 shrink-0">
                          <div className="text-right">
                            <span className="text-xl font-light text-[#D8C2A6]">
                              {path.match_percentage}%
                            </span>
                            <span className="block text-[9px] font-mono text-[#9A9A9A]">MATCH</span>
                          </div>
                          {isExpanded ? (
                            <ChevronUp className="w-5 h-5 text-[#9A9A9A]" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-[#9A9A9A]" />
                          )}
                        </div>
                      </div>

                      {/* Expandable Explanation Details */}
                      {isExpanded && (
                        <div className="px-5 pb-5 pt-2 border-t border-[#D8C2A6]/10 space-y-4 bg-[#111111]/70">
                          {/* "Why was this career recommended?" */}
                          <div className="p-4 rounded-xl bg-gradient-to-br from-[#1a1417] to-[#141414] border border-[#A56F7C]/30 space-y-2">
                            <div className="text-xs font-mono uppercase tracking-wider text-[#A56F7C] flex items-center gap-2">
                              <Sparkles className="w-3.5 h-3.5" />
                              <span>Why was this career recommended?</span>
                            </div>
                            <p className="text-xs text-[#F1E7DB] font-light leading-relaxed">
                              {path.why_recommended_explanation}
                            </p>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
                            <div className="p-3 rounded-lg bg-[#181818] border border-[#D8C2A6]/10">
                              <span className="text-[10px] text-[#888888] block">ESTIMATED EFFORT</span>
                              <span className="text-[#F1E7DB]">{path.estimated_learning_effort.weeks} Weeks</span>
                              <span className="block text-[10px] text-[#D8C2A6]">
                                ~{path.estimated_learning_effort.hours} hrs ({path.estimated_learning_effort.weekly_pacing})
                              </span>
                            </div>

                            <div className="p-3 rounded-lg bg-[#181818] border border-[#D8C2A6]/10">
                              <span className="text-[10px] text-[#888888] block">WORK MODE FIT</span>
                              <span className="text-[#F1E7DB]">{path.work_arrangement_compatibility}</span>
                            </div>

                            <div className="p-3 rounded-lg bg-[#181818] border border-[#D8C2A6]/10">
                              <span className="text-[10px] text-[#888888] block">EVIDENCE LEVEL</span>
                              <span className="text-emerald-400">{path.evidence_and_uncertainty.evidence_level}</span>
                              <span className="block text-[10px] text-[#888888]">
                                {path.evidence_and_uncertainty.uncertainty_note}
                              </span>
                            </div>

                            {onOpenSimulator && (
                              <div className="col-span-full pt-2 flex justify-end">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onClose();
                                    onOpenSimulator();
                                  }}
                                  className="btn-editorial-secondary text-xs border-cyan-500/30 text-cyan-200 hover:border-cyan-400 flex items-center gap-1.5"
                                >
                                  <span>Simulate Scenarios in Career Future Simulator ↗</span>
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ================= TAB 5: CAREER KNOWLEDGE GRAPH ================= */}
          {activeTab === "graph" && knowledgeGraph && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-serif text-[#F1E7DB]">
                    Career Knowledge Graph
                  </h3>
                  <p className="text-xs text-[#9A9A9A]">
                    Interactive structural ontology: Previous Roles → Skills → Transferable Skills → Career Options → Learning Requirements.
                  </p>
                </div>
                <span className="text-[10px] font-mono text-[#D8C2A6]">
                  {knowledgeGraph.nodes.length} Nodes • Accessible Keyboard Operable
                </span>
              </div>

              {/* Visual Interactive Graph Canvas / Tree */}
              <div className="p-6 rounded-2xl bg-[#111111] border border-[#D8C2A6]/20 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                  {[
                    { type: "previous_role", title: "1. Previous Role", color: "border-[#A56F7C] text-[#F1E7DB]" },
                    { type: "skill", title: "2. Skills", color: "border-[#D8C2A6] text-[#D8C2A6]" },
                    { type: "transferable_skill", title: "3. Transferable", color: "border-blue-400 text-blue-300" },
                    { type: "career_option", title: "4. Career Options", color: "border-emerald-400 text-emerald-300" },
                    { type: "learning_requirement", title: "5. Learning Reqs", color: "border-amber-400 text-amber-300" },
                  ].map((col) => {
                    const colNodes = knowledgeGraph.nodes.filter((n: any) => n.type === col.type);
                    return (
                      <div key={col.type} className="space-y-2">
                        <div className="text-[10px] font-mono uppercase tracking-wider text-[#888888] pb-1 border-b border-[#D8C2A6]/10">
                          {col.title}
                        </div>
                        <div className="space-y-2">
                          {colNodes.map((node: any) => {
                            const isSelected = selectedGraphNode?.id === node.id;
                            return (
                              <button
                                key={node.id}
                                type="button"
                                onClick={() => setSelectedGraphNode(node)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter" || e.key === " ") {
                                    setSelectedGraphNode(node);
                                  }
                                }}
                                className={`w-full p-3 rounded-lg border text-left text-xs font-mono transition-all focus:outline-none focus:ring-1 focus:ring-[#D8C2A6] ${
                                  isSelected
                                    ? "bg-[#D8C2A6]/20 border-[#D8C2A6] text-[#F1E7DB] scale-102 shadow-lg"
                                    : "bg-[#181818] border-[#D8C2A6]/15 text-[#9A9A9A] hover:text-[#F1E7DB] hover:border-[#D8C2A6]/40"
                                }`}
                              >
                                <div className="font-semibold">{node.label}</div>
                                <div className="text-[10px] text-[#888888] mt-0.5 line-clamp-2">
                                  {node.description}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Selected Node Details Drawer */}
                {selectedGraphNode && (
                  <div className="p-4 rounded-xl bg-[#181818] border border-[#D8C2A6]/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs font-mono">
                    <div className="space-y-1">
                      <span className="text-[10px] text-[#A56F7C] uppercase tracking-wider">
                        NODE INSPECTOR // {selectedGraphNode.type}
                      </span>
                      <div className="text-sm font-semibold text-[#F1E7DB]">
                        {selectedGraphNode.label} ({selectedGraphNode.category})
                      </div>
                      <p className="text-[#9A9A9A] text-xs font-light">
                        {selectedGraphNode.description}
                      </p>
                    </div>

                    <div className="shrink-0 flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded bg-[#111111] text-[#D8C2A6] text-[10px] border border-[#D8C2A6]/20 uppercase">
                        Status: {selectedGraphNode.status}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ================= TAB 6: DYNAMIC UPDATES & AUDIT LOG ================= */}
          {activeTab === "history" && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-serif text-[#F1E7DB]">
                    Digital Twin Change Audit Log
                  </h3>
                  <p className="text-xs text-[#9A9A9A]">
                    Chronological history of confirmed qualifications, skill adjustments, and dynamic recalculations.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleRecalibrate}
                  disabled={isRefreshing}
                  className="btn-editorial-primary text-xs"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
                  <span>Recalibrate Now</span>
                </button>
              </div>

              <div className="divide-y divide-[#D8C2A6]/10 rounded-xl bg-[#141414] border border-[#D8C2A6]/15 overflow-hidden">
                {history.map((event, i) => (
                  <div key={event.id || i} className="p-4 flex items-start gap-3.5 text-xs">
                    <div className="w-2 h-2 rounded-full bg-[#A56F7C] shrink-0 mt-1.5" />
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[11px] text-[#D8C2A6] uppercase">
                          {event.event_type.replace(/_/g, " ")}
                        </span>
                        <span className="font-mono text-[10px] text-[#888888]">
                          {event.created_at ? new Date(event.created_at).toLocaleString() : "Recent"}
                        </span>
                      </div>
                      <p className="text-[#F1E7DB] font-light">{event.summary}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* FOOTER ACTIONS */}
        <div className="px-6 py-4 border-t border-[#D8C2A6]/10 bg-[#141414] flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-[#9A9A9A] font-mono text-[11px]">
            <Lock className="w-3.5 h-3.5 text-emerald-400" />
            <span>Encrypted career intelligence • Zero career break penalty</span>
          </div>

          <div className="flex items-center gap-3">
            {onViewPassport && (
              <button
                type="button"
                onClick={onViewPassport}
                className="btn-editorial-secondary text-xs"
              >
                <span>View Career Passport</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="btn-editorial-primary text-xs"
            >
              <span>Done</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
