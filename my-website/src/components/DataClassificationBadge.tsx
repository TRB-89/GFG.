"use client";

import React, { useState } from "react";
import { Info, ShieldCheck, AlertTriangle, Sparkles, HelpCircle } from "lucide-react";
import { DataClassification, CLASSIFICATION_DESCRIPTIONS } from "@/lib/dataClassification";

export interface DataClassificationBadgeProps {
  type?: DataClassification;
  classification?: "verified_production" | "user_submitted_unverified" | "simulated_demonstration" | "proposed_pilot_target" | "simulated" | "actual" | "unverified" | string;
  label?: string;
  showTooltip?: boolean;
  className?: string;
  size?: "sm" | "md";
}

export function DataClassificationBadge({
  type,
  classification,
  label,
  showTooltip = true,
  className = "",
  size = "sm",
}: DataClassificationBadgeProps) {
  const [openInfo, setOpenInfo] = useState(false);

  // Normalize classification key
  let resolvedType: DataClassification = "simulated_demonstration";
  const rawKey = type || classification || "simulated_demonstration";

  if (rawKey === "verified_production" || rawKey === "actual") {
    resolvedType = "verified_production";
  } else if (rawKey === "user_submitted_unverified" || rawKey === "unverified") {
    resolvedType = "user_submitted_unverified";
  } else if (rawKey === "proposed_pilot_target") {
    resolvedType = "proposed_pilot_target";
  } else {
    resolvedType = "simulated_demonstration";
  }

  const info = CLASSIFICATION_DESCRIPTIONS[resolvedType] || CLASSIFICATION_DESCRIPTIONS.simulated_demonstration;

  const icon = {
    verified_production: <ShieldCheck className="w-3 h-3 text-emerald-400" />,
    user_submitted_unverified: <AlertTriangle className="w-3 h-3 text-amber-400" />,
    simulated_demonstration: <Sparkles className="w-3 h-3 text-[#A56F7C]" />,
    proposed_pilot_target: <HelpCircle className="w-3 h-3 text-indigo-400" />,
  }[resolvedType];

  const displayBadgeText = label || info.shortBadge;

  return (
    <div className={`relative inline-flex items-center ${className}`}>
      <button
        type="button"
        onClick={() => setOpenInfo(!openInfo)}
        onMouseEnter={() => showTooltip && setOpenInfo(true)}
        onMouseLeave={() => showTooltip && setOpenInfo(false)}
        className={`inline-flex items-center gap-1.5 rounded-full border font-mono uppercase tracking-widest transition-all ${
          info.badgeStyle
        } ${size === "sm" ? "px-2.5 py-0.5 text-[9px]" : "px-3 py-1 text-[10px]"}`}
        aria-label={`Data Classification: ${info.label}`}
      >
        {icon}
        <span>{displayBadgeText}</span>
      </button>

      {/* Explanatory Tooltip Popover */}
      {openInfo && (
        <div
          role="tooltip"
          className="absolute z-50 bottom-full left-0 mb-2 w-64 p-3 rounded-lg bg-[#181818] border border-[#D8C2A6]/20 shadow-2xl text-left pointer-events-none animate-in fade-in zoom-in-95"
        >
          <div className="text-[10px] font-mono uppercase tracking-wider text-[#D8C2A6] mb-1 font-semibold flex items-center gap-1">
            <Info className="w-3 h-3 text-[#A56F7C]" />
            {info.label}
          </div>
          <p className="text-[11px] font-sans text-[#9A9A9A] leading-relaxed">
            {info.description}
          </p>
        </div>
      )}
    </div>
  );
}
