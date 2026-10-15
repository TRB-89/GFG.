"use client";

import React, { useState } from "react";
import {
  HeartHandshake,
  Clock,
  MapPin,
  Baby,
  Shield,
  X,
  Check,
  RotateCcw,
  Sparkles,
  ArrowRight,
  Home,
  Briefcase,
} from "lucide-react";
import { useTranslation, AiTranslationDisclaimer } from "@/lib/i18n/LanguageContext";

export interface WorkLifeFilters {
  workMode: "all" | "remote" | "hybrid";
  partTimeOnly: boolean;
  flexibleHoursOnly: boolean;
  maxCommuteKm: number;
  childcareRequired: boolean;
  returnshipCohortOnly: boolean;
}

interface WorkLifeSupportModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentFilters?: WorkLifeFilters;
  onApplyFilters: (filters: WorkLifeFilters) => void;
}

const DEFAULT_FILTERS: WorkLifeFilters = {
  workMode: "all",
  partTimeOnly: false,
  flexibleHoursOnly: false,
  maxCommuteKm: 25,
  childcareRequired: false,
  returnshipCohortOnly: false,
};

export function WorkLifeSupportModal({
  isOpen,
  onClose,
  currentFilters,
  onApplyFilters,
}: WorkLifeSupportModalProps) {
  const { t } = useTranslation();
  const [filters, setFilters] = useState<WorkLifeFilters>(currentFilters || DEFAULT_FILTERS);

  if (!isOpen) return null;

  const handleApply = () => {
    onApplyFilters(filters);
    onClose();
  };

  const handleReset = () => {
    setFilters(DEFAULT_FILTERS);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="worklife-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div
        className="w-full max-w-2xl bg-[#181818] border border-[#D8C2A6]/20 rounded-3xl shadow-2xl p-6 sm:p-8 flex flex-col max-h-[90vh] overflow-y-auto text-[#F1E7DB]"
        tabIndex={-1}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#D8C2A6]/10 pb-5 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#A56F7C]/20 border border-[#A56F7C]/40 flex items-center justify-center text-[#A56F7C] shrink-0">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="micro-label text-[10px] text-[#A56F7C]">
                  {t("guided.opt4.badge")}
                </span>
                <AiTranslationDisclaimer />
              </div>
              <h2 id="worklife-modal-title" className="text-lg font-serif text-[#F1E7DB]">
                {t("worklife.title")}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label={t("common.close")}
            className="w-9 h-9 rounded-full bg-[#242424] hover:bg-[#333] flex items-center justify-center text-[#D8C2A6] transition-colors focus-visible:ring-2 focus-visible:ring-[#F1E7DB]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Privacy-Preserving Notice (Part 6 mandate) */}
        <div
          role="note"
          aria-label="Privacy guarantee"
          className="mb-6 p-4 rounded-2xl bg-[#202020] border border-[#A56F7C]/30 flex items-start gap-3.5 text-xs text-[#F1E7DB]"
        >
          <Shield className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <span className="font-semibold text-emerald-300">Privacy Guarantee: </span>
            {t("worklife.privacy_notice")}
          </div>
        </div>

        {/* Form Options */}
        <div className="space-y-6">
          {/* 1. Remote / Hybrid Work Mode */}
          <div className="p-4 rounded-xl bg-[#1C1C1C] border border-[#D8C2A6]/10">
            <div className="flex items-center gap-2.5 mb-3">
              <Home className="w-4 h-4 text-[#D8C2A6]" />
              <span className="text-xs font-semibold uppercase tracking-wider text-[#D8C2A6]">
                {t("worklife.filter_remote")}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "all", label: t("worklife.filter_remote_all") },
                { id: "remote", label: t("worklife.filter_remote_only") },
                { id: "hybrid", label: t("worklife.filter_hybrid") },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setFilters({ ...filters, workMode: opt.id as any })}
                  className={`py-2.5 px-3 rounded-lg text-xs font-medium border text-center transition-all ${
                    filters.workMode === opt.id
                      ? "bg-[#D8C2A6] text-[#111111] border-[#D8C2A6] font-bold"
                      : "bg-[#141414] text-[#D8C2A6] border-[#D8C2A6]/15 hover:border-[#D8C2A6]/30"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* 2. Part-Time Schedule Toggle */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-[#1C1C1C] border border-[#D8C2A6]/10">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-[#D8C2A6]" />
              <div>
                <label htmlFor="toggle-parttime" className="text-xs font-semibold text-[#F1E7DB] cursor-pointer block">
                  {t("worklife.filter_part_time")}
                </label>
                <span className="text-[11px] text-[#9A9A9A]">
                  Filter for roles strictly structured around 15–25 hours per week
                </span>
              </div>
            </div>
            <button
              id="toggle-parttime"
              type="button"
              role="switch"
              aria-checked={filters.partTimeOnly}
              onClick={() => setFilters({ ...filters, partTimeOnly: !filters.partTimeOnly })}
              className={`w-12 h-6 rounded-full transition-colors relative flex items-center px-1 ${
                filters.partTimeOnly ? "bg-[#D8C2A6]" : "bg-[#333]"
              }`}
            >
              <span
                className={`w-4 h-4 rounded-full bg-[#111111] transition-transform ${
                  filters.partTimeOnly ? "translate-x-6" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* 3. Flexible / Asynchronous Hours */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-[#1C1C1C] border border-[#D8C2A6]/10">
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-[#D8C2A6]" />
              <div>
                <label htmlFor="toggle-flexible" className="text-xs font-semibold text-[#F1E7DB] cursor-pointer block">
                  {t("worklife.filter_flexible_hours")}
                </label>
                <span className="text-[11px] text-[#9A9A9A]">
                  Asynchronous core-hours delivery allowing flexible morning or evening schedules
                </span>
              </div>
            </div>
            <button
              id="toggle-flexible"
              type="button"
              role="switch"
              aria-checked={filters.flexibleHoursOnly}
              onClick={() => setFilters({ ...filters, flexibleHoursOnly: !filters.flexibleHoursOnly })}
              className={`w-12 h-6 rounded-full transition-colors relative flex items-center px-1 ${
                filters.flexibleHoursOnly ? "bg-[#D8C2A6]" : "bg-[#333]"
              }`}
            >
              <span
                className={`w-4 h-4 rounded-full bg-[#111111] transition-transform ${
                  filters.flexibleHoursOnly ? "translate-x-6" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* 4. Commute Distance Slider */}
          <div className="p-4 rounded-xl bg-[#1C1C1C] border border-[#D8C2A6]/10">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#D8C2A6]" />
                <span className="text-xs font-semibold uppercase tracking-wider text-[#D8C2A6]">
                  {t("worklife.filter_commute")}
                </span>
              </div>
              <span className="text-xs font-mono text-[#D8C2A6] font-bold">
                {filters.maxCommuteKm} km max
              </span>
            </div>
            <input
              type="range"
              min="5"
              max="50"
              step="5"
              value={filters.maxCommuteKm}
              onChange={(e) => setFilters({ ...filters, maxCommuteKm: Number(e.target.value) })}
              className="w-full accent-[#D8C2A6] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-[#777] font-mono mt-1">
              <span>5 km (Walk / Neighborhood)</span>
              <span>25 km (City)</span>
              <span>50 km (Metropolitan)</span>
            </div>
          </div>

          {/* 5. Childcare / Crèche Support Toggle */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-[#1C1C1C] border border-[#D8C2A6]/10">
            <div className="flex items-center gap-3">
              <Baby className="w-5 h-5 text-[#D8C2A6]" />
              <div>
                <label htmlFor="toggle-childcare" className="text-xs font-semibold text-[#F1E7DB] cursor-pointer block">
                  {t("worklife.filter_childcare")}
                </label>
                <span className="text-[11px] text-[#9A9A9A]">
                  Employers with verified onsite crèche facilities, childcare stipends, or backup partnerships
                </span>
              </div>
            </div>
            <button
              id="toggle-childcare"
              type="button"
              role="switch"
              aria-checked={filters.childcareRequired}
              onClick={() => setFilters({ ...filters, childcareRequired: !filters.childcareRequired })}
              className={`w-12 h-6 rounded-full transition-colors relative flex items-center px-1 ${
                filters.childcareRequired ? "bg-[#D8C2A6]" : "bg-[#333]"
              }`}
            >
              <span
                className={`w-4 h-4 rounded-full bg-[#111111] transition-transform ${
                  filters.childcareRequired ? "translate-x-6" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* 6. Returnship Cohorts Only */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-[#1C1C1C] border border-[#D8C2A6]/10">
            <div className="flex items-center gap-3">
              <Briefcase className="w-5 h-5 text-[#D8C2A6]" />
              <div>
                <label htmlFor="toggle-returnship" className="text-xs font-semibold text-[#F1E7DB] cursor-pointer block">
                  {t("worklife.filter_returnship")}
                </label>
                <span className="text-[11px] text-[#9A9A9A]">
                  Dedicated returnship programs designed for re-entry candidates with built-in mentorship
                </span>
              </div>
            </div>
            <button
              id="toggle-returnship"
              type="button"
              role="switch"
              aria-checked={filters.returnshipCohortOnly}
              onClick={() => setFilters({ ...filters, returnshipCohortOnly: !filters.returnshipCohortOnly })}
              className={`w-12 h-6 rounded-full transition-colors relative flex items-center px-1 ${
                filters.returnshipCohortOnly ? "bg-[#D8C2A6]" : "bg-[#333]"
              }`}
            >
              <span
                className={`w-4 h-4 rounded-full bg-[#111111] transition-transform ${
                  filters.returnshipCohortOnly ? "translate-x-6" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-8 pt-5 border-t border-[#D8C2A6]/10 flex items-center justify-between">
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 text-xs text-[#9A9A9A] hover:text-[#F1E7DB] transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{t("worklife.reset_filters")}</span>
          </button>

          <button
            type="button"
            onClick={handleApply}
            className="px-6 py-2.5 rounded-full bg-[#D8C2A6] text-[#111111] text-xs font-semibold uppercase tracking-wider hover:bg-[#F1E7DB] transition-all flex items-center gap-2"
          >
            <span>{t("worklife.apply_filters")}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
