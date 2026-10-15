"use client";

import React, { useState } from "react";
import { Sparkles, Shield, ChevronDown, ChevronUp, ExternalLink } from "lucide-react";

interface DemoModeBannerProps {
  onOpenPolicyModal?: () => void;
}

export function DemoModeBanner({ onOpenPolicyModal }: DemoModeBannerProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <aside
      aria-label="Demonstration Mode Notice"
      className="w-full bg-[#161214] border-b border-[#A56F7C]/30 text-[#F1E7DB] z-40 relative text-xs font-mono"
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-2 flex flex-col md:flex-row items-start md:items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#A56F7C]/20 border border-[#A56F7C]/40 text-[#D8C2A6] text-[10px] tracking-widest uppercase font-semibold">
            <Sparkles className="w-3 h-3 text-[#A56F7C]" />
            DEMO MODE ACTIVE
          </span>

          {!isCollapsed && (
            <p className="text-[11px] text-[#9A9A9A] font-sans hidden sm:inline">
              Viewing primary sample candidate (<span className="text-[#F1E7DB] font-medium">Ananya Raman</span>
              ) and illustrative partner cohorts. Demo records are strictly isolated.
            </p>
          )}
        </div>

        <div className="flex items-center gap-4 text-[11px] self-end md:self-auto">
          {onOpenPolicyModal && (
            <button
              onClick={onOpenPolicyModal}
              className="text-[#D8C2A6] hover:text-[#F1E7DB] underline underline-offset-4 decoration-[#D8C2A6]/40 transition-colors flex items-center gap-1"
            >
              <Shield className="w-3 h-3 text-[#A56F7C]" />
              <span>Data & Scoring Policy</span>
            </button>
          )}

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-[#9A9A9A] hover:text-[#F1E7DB] transition-colors p-1"
            aria-label={isCollapsed ? "Expand demo notice" : "Collapse demo notice"}
          >
            {isCollapsed ? (
              <span className="flex items-center gap-1 text-[10px]">
                Details <ChevronDown className="w-3 h-3" />
              </span>
            ) : (
              <ChevronUp className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>
    </aside>
  );
}
