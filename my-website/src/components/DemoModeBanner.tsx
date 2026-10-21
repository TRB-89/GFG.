"use client";

import React, { useState } from "react";
import { Sparkles, Shield, ChevronDown, ChevronUp, X } from "lucide-react";

interface DemoModeBannerProps {
  onOpenPolicyModal?: () => void;
}

export function DemoModeBanner({ onOpenPolicyModal }: DemoModeBannerProps) {
  const [isDismissed, setIsDismissed] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(true);

  if (isDismissed) return null;

  return (
    <aside
      aria-label="Demonstration Mode Notice"
      className="w-full bg-[#120B07] border-b border-[#D97706]/20 text-[#F5EDE4] z-40 relative text-[11px] font-mono"
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-1.5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#D97706]/15 border border-[#D97706]/30 text-[#D97706] text-[9px] tracking-wider uppercase font-semibold shrink-0">
            <Sparkles className="w-2.5 h-2.5 text-[#D97706]" />
            SANDBOX ENVIRONMENT
          </span>

          <p className="text-[#A89B90] font-sans truncate hidden sm:inline">
            Interactive preview mode with isolated sample records. Production registrations create private, encrypted records.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {onOpenPolicyModal && (
            <button
              onClick={onOpenPolicyModal}
              className="text-[#D97706] hover:text-[#F5EDE4] underline underline-offset-2 decoration-[#D97706]/40 transition-colors flex items-center gap-1 text-[10px]"
            >
              <Shield className="w-3 h-3 text-[#D97706]" />
              <span>Data Policy</span>
            </button>
          )}

          <button
            onClick={() => setIsDismissed(true)}
            className="text-[#A89B90] hover:text-[#F5EDE4] p-0.5 transition-colors"
            aria-label="Dismiss banner"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}
