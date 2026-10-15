"use client";

import React, { useState } from "react";
import {
  Eye,
  Type,
  ZapOff,
  BookOpen,
  RotateCcw,
  X,
  Sliders,
  Check,
  WifiOff,
  Wifi,
  Sparkles,
} from "lucide-react";
import { useAccessibility, FontSizeScale } from "@/lib/accessibility/AccessibilityContext";
import { useBandwidth } from "@/lib/bandwidth/BandwidthContext";
import { useTranslation } from "@/lib/i18n/LanguageContext";

interface AccessibilityToolbarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AccessibilityToolbar({ isOpen, onClose }: AccessibilityToolbarProps) {
  const {
    highContrast,
    toggleHighContrast,
    fontSize,
    setFontSize,
    reducedMotion,
    toggleReducedMotion,
    dyslexicFont,
    toggleDyslexicFont,
    resetAll,
  } = useAccessibility();

  const { lowBandwidthMode, toggleLowBandwidthMode, isOnline } = useBandwidth();
  const { t } = useTranslation();

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="a11y-panel-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div
        className="w-full max-w-lg bg-[#181818] border border-[#D8C2A6]/20 rounded-2xl p-6 sm:p-8 shadow-2xl relative text-[#F1E7DB] max-h-[90vh] overflow-y-auto"
        tabIndex={-1}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#D8C2A6]/10 pb-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#A56F7C]/20 border border-[#A56F7C]/40 flex items-center justify-center text-[#A56F7C]">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 id="a11y-panel-title" className="text-lg font-serif text-[#F1E7DB]">
                {t("a11y.title")}
              </h2>
              <p className="text-xs text-[#9A9A9A]">
                {t("a11y.screen_reader")}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t("a11y.close")}
            className="w-9 h-9 rounded-full bg-[#242424] hover:bg-[#333] flex items-center justify-center text-[#D8C2A6] transition-colors focus-visible:ring-2 focus-visible:ring-[#F1E7DB]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Options Stack */}
        <div className="space-y-6">
          {/* High Contrast Mode */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#202020] border border-[#D8C2A6]/10">
            <div className="flex items-center gap-3">
              <Eye className="w-5 h-5 text-[#D8C2A6]" />
              <div>
                <label htmlFor="toggle-high-contrast" className="text-sm font-medium cursor-pointer">
                  {t("a11y.high_contrast")}
                </label>
                <p className="text-[11px] text-[#9A9A9A]">
                  Pure black & white palette with maximum WCAG contrast
                </p>
              </div>
            </div>
            <button
              id="toggle-high-contrast"
              type="button"
              role="switch"
              aria-checked={highContrast}
              onClick={toggleHighContrast}
              className={`w-12 h-6 rounded-full transition-colors relative flex items-center px-1 focus-visible:ring-2 focus-visible:ring-[#F1E7DB] ${
                highContrast ? "bg-[#F1E7DB]" : "bg-[#333]"
              }`}
            >
              <span
                className={`w-4 h-4 rounded-full bg-[#111111] transition-transform ${
                  highContrast ? "translate-x-6" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* Font Scaling */}
          <div className="p-3.5 rounded-xl bg-[#202020] border border-[#D8C2A6]/10">
            <div className="flex items-center gap-2 mb-3">
              <Type className="w-5 h-5 text-[#D8C2A6]" />
              <span className="text-sm font-medium">{t("a11y.text_size")}</span>
            </div>
            <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Font Size">
              {(
                [
                  { id: "normal", label: t("a11y.text_normal"), size: "100%" },
                  { id: "large", label: t("a11y.text_large"), size: "115%" },
                  { id: "xlarge", label: t("a11y.text_xlarge"), size: "130%" },
                ] as const
              ).map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  role="radio"
                  aria-checked={fontSize === opt.id}
                  onClick={() => setFontSize(opt.id as FontSizeScale)}
                  className={`py-2 px-3 rounded-lg text-xs font-mono border text-center transition-all focus-visible:ring-2 focus-visible:ring-[#F1E7DB] ${
                    fontSize === opt.id
                      ? "bg-[#D8C2A6] text-[#111111] border-[#D8C2A6] font-bold"
                      : "bg-[#181818] text-[#D8C2A6] border-[#D8C2A6]/20 hover:border-[#D8C2A6]/40"
                  }`}
                >
                  <div>{opt.label}</div>
                  <div className="text-[10px] opacity-70 mt-0.5">{opt.size}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Reduced Motion */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#202020] border border-[#D8C2A6]/10">
            <div className="flex items-center gap-3">
              <ZapOff className="w-5 h-5 text-[#D8C2A6]" />
              <div>
                <label htmlFor="toggle-reduced-motion" className="text-sm font-medium cursor-pointer">
                  {t("a11y.reduced_motion")}
                </label>
                <p className="text-[11px] text-[#9A9A9A]">
                  Disables page transitions, pulse effects, and smooth scrolling
                </p>
              </div>
            </div>
            <button
              id="toggle-reduced-motion"
              type="button"
              role="switch"
              aria-checked={reducedMotion}
              onClick={toggleReducedMotion}
              className={`w-12 h-6 rounded-full transition-colors relative flex items-center px-1 focus-visible:ring-2 focus-visible:ring-[#F1E7DB] ${
                reducedMotion ? "bg-[#F1E7DB]" : "bg-[#333]"
              }`}
            >
              <span
                className={`w-4 h-4 rounded-full bg-[#111111] transition-transform ${
                  reducedMotion ? "translate-x-6" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* Dyslexia-Friendly High-Legibility Font */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#202020] border border-[#D8C2A6]/10">
            <div className="flex items-center gap-3">
              <BookOpen className="w-5 h-5 text-[#D8C2A6]" />
              <div>
                <label htmlFor="toggle-dyslexic-font" className="text-sm font-medium cursor-pointer">
                  {t("a11y.dyslexic_font")}
                </label>
                <p className="text-[11px] text-[#9A9A9A]">
                  Increases letter spacing, line height, and character distinction
                </p>
              </div>
            </div>
            <button
              id="toggle-dyslexic-font"
              type="button"
              role="switch"
              aria-checked={dyslexicFont}
              onClick={toggleDyslexicFont}
              className={`w-12 h-6 rounded-full transition-colors relative flex items-center px-1 focus-visible:ring-2 focus-visible:ring-[#F1E7DB] ${
                dyslexicFont ? "bg-[#F1E7DB]" : "bg-[#333]"
              }`}
            >
              <span
                className={`w-4 h-4 rounded-full bg-[#111111] transition-transform ${
                  dyslexicFont ? "translate-x-6" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* Part 3: Low-Bandwidth Mode */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#202020] border border-[#D8C2A6]/10">
            <div className="flex items-center gap-3">
              {lowBandwidthMode ? (
                <WifiOff className="w-5 h-5 text-amber-400" />
              ) : (
                <Wifi className="w-5 h-5 text-[#D8C2A6]" />
              )}
              <div>
                <label htmlFor="toggle-low-bandwidth" className="text-sm font-medium cursor-pointer">
                  {t("bandwidth.title")}
                </label>
                <p className="text-[11px] text-[#9A9A9A]">
                  Omits decorative media, reduces data transfer, caches learning roadmaps
                </p>
              </div>
            </div>
            <button
              id="toggle-low-bandwidth"
              type="button"
              role="switch"
              aria-checked={lowBandwidthMode}
              onClick={toggleLowBandwidthMode}
              className={`w-12 h-6 rounded-full transition-colors relative flex items-center px-1 focus-visible:ring-2 focus-visible:ring-[#F1E7DB] ${
                lowBandwidthMode ? "bg-amber-400" : "bg-[#333]"
              }`}
            >
              <span
                className={`w-4 h-4 rounded-full bg-[#111111] transition-transform ${
                  lowBandwidthMode ? "translate-x-6" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-6 pt-4 border-t border-[#D8C2A6]/10 flex items-center justify-between">
          <button
            type="button"
            onClick={resetAll}
            className="inline-flex items-center gap-2 text-xs text-[#9A9A9A] hover:text-[#F1E7DB] transition-colors focus-visible:ring-2 focus-visible:ring-[#F1E7DB] px-2 py-1 rounded"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to Default</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-full bg-[#D8C2A6] text-[#111111] text-xs font-semibold tracking-wider uppercase hover:bg-[#F1E7DB] transition-colors focus-visible:ring-2 focus-visible:ring-[#F1E7DB]"
          >
            {t("common.close")}
          </button>
        </div>
      </div>
    </div>
  );
}
