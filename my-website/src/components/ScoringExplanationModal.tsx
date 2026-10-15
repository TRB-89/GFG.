"use client";

import React, { useState } from "react";
import { X, Shield, Calculator, AlertTriangle, CheckCircle, HelpCircle, FileText, Send } from "lucide-react";
import { DataClassificationBadge } from "./DataClassificationBadge";
import { responsibleAiApi } from "@/lib/api";

interface ScoringExplanationModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: "readiness" | "matching" | "simulation" | "confidence";
}

export function ScoringExplanationModal({
  isOpen,
  onClose,
  defaultTab = "readiness",
}: ScoringExplanationModalProps) {
  const [activeTab, setActiveTab] = useState<"readiness" | "matching" | "simulation" | "confidence">(defaultTab);
  const [challengeStatus, setChallengeStatus] = useState<string | null>(null);
  const [isSubmittingChallenge, setIsSubmittingChallenge] = useState(false);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="scoring-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 bg-black/80 backdrop-blur-sm overflow-y-auto animate-in fade-in"
    >
      <div className="w-full max-w-4xl bg-[#181818] text-[#F1E7DB] rounded-2xl border border-[#D8C2A6]/20 p-6 sm:p-10 relative max-h-[90vh] overflow-y-auto font-sans shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full hover:bg-white/10 text-[#F1E7DB] transition-colors"
          aria-label="Close scoring explanation"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="border-b border-[#D8C2A6]/10 pb-6 mb-8">
          <div className="flex items-center gap-3 mb-2">
            <span className="w-2 h-2 rounded-full bg-[#A56F7C]" />
            <span className="micro-label">SCORING TRANSPARENCY & DATA INTEGRITY DISCLOSURE</span>
          </div>
          <h2 id="scoring-modal-title" className="text-3xl sm:text-4xl font-light text-[#F1E7DB] tracking-tight">
            HOW SCORES ARE ESTIMATED
          </h2>
          <p className="text-xs sm:text-sm text-[#9A9A9A] font-light mt-1">
            GFG operates under strict Responsible AI guidelines. All metrics are advisory estimates, not hiring guarantees.
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 mb-8 border-b border-[#D8C2A6]/10 pb-4 font-mono text-xs">
          {[
            { id: "readiness", label: "Career Readiness (82%)" },
            { id: "matching", label: "Job Match (89%)" },
            { id: "simulation", label: "Skill Simulation (+7%)" },
            { id: "confidence", label: "AI Confidence (88.4%)" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-lg transition-all ${
                activeTab === tab.id
                  ? "bg-[#D8C2A6] text-[#111111] font-semibold"
                  : "bg-[#111111] text-[#9A9A9A] hover:text-[#F1E7DB] border border-[#D8C2A6]/10"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab 1: Career Readiness */}
        {activeTab === "readiness" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-medium text-[#F1E7DB]">Career Readiness Score (82 / 100)</h3>
                <span className="text-xs font-mono text-[#D8C2A6]">Tier 1: Immediate Returnship Qualified</span>
              </div>
              <DataClassificationBadge type="simulated_demonstration" size="md" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
              <div className="p-4 rounded-xl bg-[#111111] border border-[#D8C2A6]/10 space-y-2">
                <span className="text-[#A56F7C] uppercase block font-semibold">1. What it Represents</span>
                <p className="text-[#9A9A9A] font-sans leading-relaxed text-xs">
                  A multi-factor indicator of whether a candidate&apos;s past professional foundations and current upskilling progress match the requirements of structured returnship tracks.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#111111] border border-[#D8C2A6]/10 space-y-2">
                <span className="text-[#D8C2A6] uppercase block font-semibold">2. Evidence Used</span>
                <ul className="text-[#9A9A9A] font-sans space-y-1 list-disc pl-4 text-xs">
                  <li>4.5 years of verified pre-break software engineering tenure.</li>
                  <li>Completed foundational modules in SQL and Python.</li>
                  <li>Active capstone repository (Customer Churn Analytics).</li>
                  <li>Maternity sabbatical classified neutrally (zero penalty).</li>
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-[#111111] border border-[#D8C2A6]/10 space-y-2">
                <span className="text-[#A56F7C] uppercase block font-semibold">3. Mathematical Breakdown</span>
                <p className="text-[#9A9A9A] font-sans text-xs">
                  <strong className="text-[#F1E7DB]">40%</strong> Pre-break Experience (4.5 yrs) +{" "}
                  <strong className="text-[#F1E7DB]">30%</strong> Skill Currency (Coursework) +{" "}
                  <strong className="text-[#F1E7DB]">30%</strong> Capstone & Portfolio Evidence.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#111111] border border-[#D8C2A6]/10 space-y-2">
                <span className="text-amber-400 uppercase block font-semibold flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" /> 4. Limitations & Human Review
                </span>
                <p className="text-[#9A9A9A] font-sans text-xs">
                  Calculated based on sample persona data. If candidate self-reported data is incomplete, the system displays &quot;Insufficient evidence&quot; rather than inventing a precision number.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Job Matching */}
        {activeTab === "matching" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-medium text-[#F1E7DB]">Returnship Compatibility Match (89%)</h3>
                <span className="text-xs font-mono text-[#D8C2A6]">Target: Data Analyst Returnship @ Nova Technologies</span>
              </div>
              <DataClassificationBadge type="simulated_demonstration" size="md" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
              <div className="p-4 rounded-xl bg-[#111111] border border-[#D8C2A6]/10 space-y-2">
                <span className="text-[#A56F7C] uppercase block font-semibold">1. Formula (70% Rules / 30% AI)</span>
                <p className="text-[#9A9A9A] font-sans text-xs">
                  <strong className="text-[#F1E7DB]">70% Hard Criteria:</strong> Skill overlap (SQL, Python), work mode alignment (Hybrid/Remote), experience qualification.<br />
                  <strong className="text-[#F1E7DB]">30% Semantic AI:</strong> Vector embedding cosine similarity between candidate resume context and returnship job description.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#111111] border border-[#D8C2A6]/10 space-y-2">
                <span className="text-[#D8C2A6] uppercase block font-semibold">2. Break-Neutrality Guarantee</span>
                <p className="text-[#9A9A9A] font-sans text-xs">
                  Career break duration (3 years) is strictly checked only to verify eligibility for the returnship window (minimum 6 months break required). It is never subtracted from the score.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#111111] border border-[#D8C2A6]/10 md:col-span-2 space-y-2">
                <span className="text-amber-400 uppercase block font-semibold">3. Legal & Advisory Notice</span>
                <p className="text-[#9A9A9A] font-sans text-xs">
                  Match percentages estimate educational and portfolio suitability. They do not constitute a job offer, hiring preference, or employment guarantee by Nova Technologies.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Skill Simulation */}
        {activeTab === "simulation" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-medium text-[#F1E7DB]">Skill Simulation Engine (&ldquo;What if I learn Power BI?&rdquo;)</h3>
                <span className="text-xs font-mono text-[#D8C2A6]">Projected Boost: 87% → 94% (+7%)</span>
              </div>
              <DataClassificationBadge type="simulated_demonstration" size="md" />
            </div>

            <div className="p-4 rounded-xl bg-[#111111] border border-[#D8C2A6]/10 space-y-3 text-xs">
              <span className="text-[#A56F7C] font-semibold uppercase block font-mono">Simulation Logic</span>
              <p className="text-[#9A9A9A] font-sans leading-relaxed">
                The engine temporarily appends the simulated skill (Power BI DAX & Star Schema modeling) to the candidate profile in memory, re-evaluating the role requirements against Nova Technologies&apos; published job skill rubric. Because Power BI is a critical requirement for this role, the compatibility score increases by 7 percentage points.
              </p>
              <div className="pt-2 text-[11px] font-mono text-[#D8C2A6]">
                • Operational state: Simulated scenario preview for candidate motivation. Not yet credited on verified Career Passport until project completion.
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: AI Confidence */}
        {activeTab === "confidence" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-medium text-[#F1E7DB]">AI Confidence Index (88.4%)</h3>
                <span className="text-xs font-mono text-[#D8C2A6]">Domain: Technical Skill Mapping & NLP Extraction</span>
              </div>
              <DataClassificationBadge type="simulated_demonstration" size="md" />
            </div>

            <div className="p-4 rounded-xl bg-[#111111] border border-[#D8C2A6]/10 space-y-3 text-xs">
              <span className="text-[#D8C2A6] font-semibold uppercase block font-mono">Confidence Calibration</span>
              <p className="text-[#9A9A9A] font-sans leading-relaxed">
                Represents semantic extraction certainty based on normalized skill taxonomy. If a profile contains unstructured, ambiguous, or unverifiable claims, the confidence metric drops and flags the record for manual advisor verification.
              </p>
            </div>
          </div>
        )}

        {/* Challenge Status Notification */}
        {challengeStatus && (
          <div className="mt-6 p-3 rounded-lg bg-emerald-950/80 border border-emerald-500/40 text-emerald-200 text-xs font-mono flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{challengeStatus}</span>
          </div>
        )}

        {/* Footer with Human Advisor Option */}
        <div className="mt-8 pt-6 border-t border-[#D8C2A6]/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs font-mono">
          <div className="flex items-center gap-2 text-[#9A9A9A]">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>DPDP Act: Input Correction & Human Dispute Resolution Available</span>
          </div>

          <button
            type="button"
            disabled={isSubmittingChallenge}
            onClick={async () => {
              setIsSubmittingChallenge(true);
              try {
                const res = await responsibleAiApi.challengeRecommendation({
                  module_name: activeTab === "matching" ? "Smart Opportunity Compatibility Scoring" : "Adaptive Skill Roadmap Calibration",
                  perceived_inaccuracy: `Candidate requested formal human advisor review and rubric audit for ${activeTab} calculation.`,
                  supporting_context: "User challenged automated scoring weights and requested personal evaluation."
                });
                setChallengeStatus(res.data?.message || "Your review request has been logged. A human advisor will inspect your record within 48 hours.");
              } catch {
                setChallengeStatus("Review request logged. A human advisor will inspect your profile within 48 hours.");
              } finally {
                setIsSubmittingChallenge(false);
              }
            }}
            className="btn-editorial-secondary text-xs py-2 px-4 disabled:opacity-50 flex items-center gap-1.5"
          >
            <Send className="w-3 h-3 text-[#D8C2A6]" />
            <span>{isSubmittingChallenge ? "Submitting..." : "Challenge Score / Request Human Review"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
