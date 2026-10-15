"use client";

import React from "react";
import Image from "next/image";
import { X, ArrowRight, ArrowUpRight, Globe, CheckCircle2 } from "lucide-react";
import { SDGItem } from "@/lib/sdgData";

interface SDGDetailModalProps {
  sdg: SDGItem | null;
  isOpen: boolean;
  onClose: () => void;
  onTakeAction: (sdgNumber: number) => void;
}

export function SDGDetailModal({
  sdg,
  isOpen,
  onClose,
  onTakeAction,
}: SDGDetailModalProps) {
  if (!isOpen || !sdg) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 md:p-6 lg:p-12 bg-black/60 backdrop-blur-md overflow-y-auto animate-in fade-in duration-300">
      <div className="relative w-full max-w-5xl bg-[#E4C29B] text-[#151A17] rounded-none md:rounded-2xl shadow-2xl border border-[#18372C]/15 overflow-hidden my-auto max-h-screen md:max-h-[92vh] flex flex-col">
        {/* Top Minimal Bar */}
        <div className="px-6 md:px-10 py-5 border-b border-[#18372C]/15 flex items-center justify-between bg-[#E4C29B]/90 backdrop-blur-xs sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <span
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: sdg.color }}
            />
            <span className="micro-label">SDG {sdg.code} {"//"} EDITORIAL DOSSIER</span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-[#18372C]/10 text-[#18372C] transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Editorial Content */}
        <div className="overflow-y-auto px-6 md:px-12 py-8 space-y-12">
          {/* Hero Editorial Header */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end border-b border-[#18372C]/15 pb-10">
            <div className="lg:col-span-8 space-y-4">
              <div className="flex items-baseline gap-4">
                <span className="font-serif text-7xl md:text-9xl font-light text-[#18372C] tracking-tight leading-none">
                  {sdg.code}
                </span>
                <span
                  className="text-xs font-mono font-bold uppercase tracking-widest px-2.5 py-1 rounded-sm text-white"
                  style={{ backgroundColor: sdg.color }}
                >
                  GLOBAL GOAL
                </span>
              </div>
              <h2 className="text-3xl md:text-5xl font-sans font-light uppercase tracking-tight text-[#151A17] leading-tight">
                {sdg.title}
              </h2>
              <p className="font-serif italic text-lg md:text-xl text-[#18372C]/80 max-w-2xl leading-relaxed">
                {sdg.subtitle}
              </p>
            </div>

            <div className="lg:col-span-4 space-y-3">
              <div className="micro-label-muted">GLOBAL TARGET 2030</div>
              <div className="p-4 bg-[#F5E8D5] border-l-2 border-[#18372C] text-xs leading-relaxed text-[#151A17]/90 font-sans">
                {sdg.globalTarget}
              </div>
            </div>
          </div>

          {/* Large Environmental Image Visual */}
          <div className="relative w-full h-[280px] md:h-[420px] rounded-lg overflow-hidden border border-[#18372C]/15">
            <Image
              src={sdg.image}
              alt={sdg.title}
              fill
              className="object-cover"
              sizes="(max-width: 1200px) 100vw, 1000px"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between text-white">
              <div className="max-w-md">
                <span className="micro-label text-white/80 block mb-1">
                  FIELD TELEMETRY // OBSERVATION
                </span>
                <p className="text-sm font-sans font-light text-white/90">
                  {sdg.description}
                </p>
              </div>
              <div className="text-right hidden sm:block">
                <span className="micro-label text-white/70 block">
                  {sdg.stats.label}
                </span>
                <span className="font-serif text-3xl font-light text-white">
                  {sdg.stats.value}
                </span>
              </div>
            </div>
          </div>

          {/* Dual Columns: Why It Matters & Key Targets */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 border-b border-[#18372C]/15 pb-12">
            <div className="space-y-4">
              <div className="micro-label">01 // WHY IT MATTERS</div>
              <p className="text-sm md:text-base font-sans text-[#151A17]/85 leading-relaxed">
                {sdg.whyItMatters}
              </p>
              <div className="pt-4 border-t border-[#18372C]/10 space-y-2">
                <div className="micro-label-muted">MEASURABLE LOCAL IMPACT</div>
                <p className="text-xs text-[#18372C] font-mono leading-relaxed bg-[#F5E8D5]/70 p-3 rounded-md">
                  {sdg.localImpact}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="micro-label">02 // KEY UN TARGETS</div>
              <ul className="space-y-2.5">
                {sdg.keyTargets.map((target, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2.5 text-xs text-[#151A17]/85 leading-relaxed"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#3F7E44] shrink-0 mt-0.5" />
                    <span>{target}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Related Community Problems & Recommended Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-3">
              <div className="micro-label">03 // RELATED LOCAL PROBLEMS</div>
              <div className="space-y-2">
                {sdg.sampleProblems.map((prob, idx) => (
                  <div
                    key={idx}
                    className="text-xs font-mono py-2 px-3 border border-[#18372C]/15 bg-[#F5E8D5]/50 flex items-center justify-between"
                  >
                    <span>{prob}</span>
                    <span className="micro-label-muted text-[9px]">REPORTED</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <div className="micro-label">04 // CATALYTIC ACTIONS</div>
              <div className="space-y-2">
                {sdg.recommendedActions.map((act, idx) => (
                  <div
                    key={idx}
                    className="text-xs font-mono py-2 px-3 border border-[#18372C]/15 bg-[#F5E8D5]/50 flex items-center justify-between"
                  >
                    <span>{act}</span>
                    <span className="text-[#18372C] text-[10px] font-bold">READY →</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Action CTA Footer */}
          <div className="pt-6 border-t border-[#18372C]/15 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-[#18372C]/70">
              Contribute verified telemetry or report an acute local problem for SDG {sdg.code}.
            </div>
            <div className="flex gap-3 w-full sm:w-auto">
              <button
                onClick={onClose}
                className="btn-editorial-secondary flex-1 sm:flex-none text-xs"
              >
                Close
              </button>
              <button
                onClick={() => {
                  onClose();
                  onTakeAction(sdg.id);
                }}
                className="btn-editorial-primary flex-1 sm:flex-none text-xs"
              >
                Report Problem for SDG {sdg.code} ↗
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
