"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, BookOpen, GraduationCap, Award, ShieldCheck, ExternalLink } from "lucide-react";
import { LearningHubModal } from "@/components/learning/LearningHubModal";
import { api } from "@/lib/api";

export default function LearningPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    api.getMe().then((user: any) => {
      if (user) setCurrentUser(user);
    }).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-[#111111] text-[#F1E7DB] flex flex-col font-sans">
      <header className="border-b border-[#D8C2A6]/10 bg-[#161616] sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-baseline gap-2">
            <span className="font-sans text-xl font-light tracking-tight text-[#F1E7DB]">GFG</span>
            <span className="text-[9px] text-[#A56F7C] tracking-[0.24em] font-mono uppercase">
              LEARNING HUB
            </span>
          </Link>
          <Link
            href="/"
            className="text-xs uppercase tracking-wider text-[#D8C2A6] hover:text-[#F1E7DB] transition-colors flex items-center gap-1.5 font-mono"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to GFG Platform</span>
          </Link>
        </div>
      </header>

      {/* Render the full interactive Learning Hub interface */}
      <main className="flex-1">
        <LearningHubModal
          isOpen={true}
          onClose={() => {
            if (typeof window !== "undefined") {
              window.location.href = "/";
            }
          }}
          currentUser={currentUser}
        />
      </main>
    </div>
  );
}
