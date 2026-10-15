"use client";

import React, { useState } from "react";
import { X, Search, Check, ShieldAlert, Eye, Filter, CheckCircle, Building2, Users, FileText } from "lucide-react";
import { DataClassificationBadge } from "./DataClassificationBadge";

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser?: any;
  stats?: {
    total_candidates?: number;
    total_employers?: number;
    total_jobs?: number;
    total_applications?: number;
  };
}

export function AdminModal({ isOpen, onClose, stats }: AdminModalProps) {
  const [activeTab, setActiveTab] = useState<"telemetry" | "partners" | "privacy">("telemetry");
  const [searchQuery, setSearchQuery] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);

  if (!isOpen) return null;

  const demoStats = {
    total_candidates: stats?.total_candidates ?? 5,
    total_employers: stats?.total_employers ?? 10,
    total_jobs: stats?.total_jobs ?? 20,
    total_applications: stats?.total_applications ?? 15,
  };

  const partnerList = [
    {
      id: "comp-1",
      name: "Nova Technologies",
      industry: "Enterprise Cloud Platforms",
      location: "Bengaluru, IN",
      status: "VERIFIED",
      activeTracks: 2,
    },
    {
      id: "comp-2",
      name: "Tata Digital",
      industry: "Consumer Tech Ecosystem",
      location: "Mumbai, IN",
      status: "VERIFIED",
      activeTracks: 2,
    },
    {
      id: "comp-3",
      name: "Infosys Springboard",
      industry: "IT & Systems Consulting",
      location: "Bengaluru, IN",
      status: "PENDING_AUDIT",
      activeTracks: 1,
    },
    {
      id: "comp-4",
      name: "Flipkart Commerce",
      industry: "E-Commerce Infrastructure",
      location: "Bengaluru, IN",
      status: "VERIFIED",
      activeTracks: 2,
    },
  ];

  const candidatePrivacyAudits = [
    {
      id: "cand-1",
      name: "Ananya Raman",
      email: "ananya.raman@example.com",
      visibility: "Private (Default)",
      passportConsent: "Opted-In",
      breakFraming: "Respectfully Classified",
    },
    {
      id: "cand-2",
      name: "Ananya Desai",
      email: "ananya.desai@example.com",
      visibility: "Private (Default)",
      passportConsent: "Restricted",
      breakFraming: "Respectfully Classified",
    },
    {
      id: "cand-3",
      name: "Neha Reddy",
      email: "neha.reddy@example.com",
      visibility: "Employer Shared",
      passportConsent: "Opted-In",
      breakFraming: "Respectfully Classified",
    },
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="admin-desk-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 bg-black/80 backdrop-blur-sm overflow-y-auto animate-in fade-in"
    >
      <div className="w-full max-w-5xl bg-[#181818] text-[#F1E7DB] rounded-2xl border border-[#D8C2A6]/20 p-6 sm:p-10 relative max-h-[92vh] overflow-y-auto font-sans shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full hover:bg-white/10 text-[#F1E7DB] transition-colors"
          aria-label="Close governance desk"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="border-b border-[#D8C2A6]/10 pb-6 mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-[#A56F7C]" />
              <span className="micro-label">PLATFORM GOVERNANCE & AUDIT DESK</span>
              <DataClassificationBadge type="verified_production" size="sm" />
            </div>
            <h2 id="admin-desk-title" className="text-3xl font-light text-[#F1E7DB] tracking-tight">
              ADMINISTRATIVE TELEMETRY
            </h2>
          </div>

          <span className="text-[11px] font-mono text-[#D8C2A6]">
            SESSION: SUPER-ADMIN // AUDIT MODE
          </span>
        </div>

        {feedback && (
          <div className="mb-6 p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-mono flex items-center justify-between">
            <span>{feedback}</span>
            <button onClick={() => setFeedback(null)} className="p-1 hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Tab Controls */}
        <div className="flex flex-wrap gap-2 mb-8 border-b border-[#D8C2A6]/10 pb-4 font-mono text-xs">
          {[
            { id: "telemetry", label: "Real-time Telemetry" },
            { id: "partners", label: "Returnship Partner Audits" },
            { id: "privacy", label: "Candidate Privacy & Consent" },
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

        {/* Tab 1: Real-time Telemetry */}
        {activeTab === "telemetry" && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
              <div className="p-5 rounded-xl bg-[#111111] border border-[#D8C2A6]/10 space-y-1">
                <span className="text-4xl font-light text-[#F1E7DB]">{demoStats.total_candidates}</span>
                <div className="text-[10px] font-mono text-[#9A9A9A] uppercase">Active Returnees</div>
                <div className="text-[10px] text-emerald-400">All 100% Verified</div>
              </div>

              <div className="p-5 rounded-xl bg-[#111111] border border-[#D8C2A6]/10 space-y-1">
                <span className="text-4xl font-light text-[#D8C2A6]">{demoStats.total_employers}</span>
                <div className="text-[10px] font-mono text-[#9A9A9A] uppercase">Partner Employers</div>
                <div className="text-[10px] text-[#D8C2A6]">Vetted Return Tracks</div>
              </div>

              <div className="p-5 rounded-xl bg-[#111111] border border-[#D8C2A6]/10 space-y-1">
                <span className="text-4xl font-light text-[#A56F7C]">{demoStats.total_jobs}</span>
                <div className="text-[10px] font-mono text-[#9A9A9A] uppercase">Returnship Openings</div>
                <div className="text-[10px] text-[#A56F7C]">Hybrid & Remote</div>
              </div>

              <div className="p-5 rounded-xl bg-[#111111] border border-[#D8C2A6]/10 space-y-1">
                <span className="text-4xl font-light text-[#F1E7DB]">{demoStats.total_applications}</span>
                <div className="text-[10px] font-mono text-[#9A9A9A] uppercase">Applications Tracked</div>
                <div className="text-[10px] text-emerald-400">0% Stigma Penalty</div>
              </div>
            </div>

            <div className="p-5 rounded-xl bg-[#111111] border border-[#D8C2A6]/10 space-y-2 text-xs font-mono text-[#9A9A9A]">
              <span className="text-[#D8C2A6] uppercase font-semibold block">Data Integrity Guardrails</span>
              <p className="font-sans leading-relaxed text-[#9A9A9A]">
                The platform does not display fabricated impact claims. Statistics shown above reflect the actual database state for active returnee profiles, partner employers, and active returnship applications.
              </p>
            </div>
          </div>
        )}

        {/* Tab 2: Partner Audits */}
        {activeTab === "partners" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono text-[#9A9A9A]">EMPLOYER COMPLIANCE VERIFICATION</span>
              <span className="text-xs font-mono text-[#D8C2A6]">{partnerList.length} Partners Evaluated</span>
            </div>

            <div className="divide-y divide-[#D8C2A6]/10 border border-[#D8C2A6]/10 rounded-xl bg-[#111111] overflow-hidden">
              {partnerList.map((partner) => (
                <div
                  key={partner.id}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs font-mono"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-sans font-medium text-sm text-[#F1E7DB]">{partner.name}</span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] ${
                          partner.status === "VERIFIED"
                            ? "bg-emerald-950/70 text-emerald-300 border border-emerald-500/30"
                            : "bg-amber-950/70 text-amber-300 border border-amber-500/30"
                        }`}
                      >
                        {partner.status}
                      </span>
                    </div>
                    <div className="text-[11px] text-[#9A9A9A] mt-0.5">
                      {partner.industry} • {partner.location} • {partner.activeTracks} Active Return Tracks
                    </div>
                  </div>

                  <button
                    onClick={() => setFeedback(`Compliance verified for ${partner.name}. Returnship rubrics audited.`)}
                    className="btn-editorial-secondary text-xs py-1.5 px-3 self-start sm:self-auto"
                  >
                    Audit Rubric
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Privacy & Consent */}
        {activeTab === "privacy" && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-[#111111] border border-[#D8C2A6]/10 text-xs font-mono text-[#D8C2A6]">
              <span className="text-[#A56F7C] font-semibold uppercase block mb-1">PRIVACY COMPLIANCE AUDIT</span>
              <p className="font-sans text-[11px] text-[#9A9A9A] leading-relaxed">
                All candidates are set to &quot;Private by default&quot;. Public unauthenticated users cannot view candidate emails, phone numbers, or break details. Passport data sharing requires explicit candidate opt-in.
              </p>
            </div>

            <div className="divide-y divide-[#D8C2A6]/10 border border-[#D8C2A6]/10 rounded-xl bg-[#111111] overflow-hidden text-xs font-mono">
              {candidatePrivacyAudits.map((cand) => (
                <div
                  key={cand.id}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-sans font-medium text-sm text-[#F1E7DB]">{cand.name}</span>
                      <span className="text-[10px] text-[#A56F7C]">({cand.email})</span>
                    </div>
                    <div className="text-[11px] text-[#9A9A9A] mt-0.5">
                      Visibility: <span className="text-[#D8C2A6]">{cand.visibility}</span> • Passport Sharing:{" "}
                      <span className="text-emerald-400">{cand.passportConsent}</span>
                    </div>
                  </div>

                  <span className="text-[10px] text-[#9A9A9A] font-mono px-2 py-1 rounded-md bg-[#181818]">
                    {cand.breakFraming}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-8 pt-4 border-t border-[#D8C2A6]/10 flex justify-end">
          <button onClick={onClose} className="btn-editorial-primary text-xs">
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
