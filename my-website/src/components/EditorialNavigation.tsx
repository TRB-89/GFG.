"use client";

import React, { useState, useEffect } from "react";
import { User, Menu, X, ArrowUpRight, Sparkles, Building2 } from "lucide-react";

interface EditorialNavigationProps {
  currentUser: any;
  currentRole: "candidate" | "employer";
  onOpenAuth: () => void;
  onOpenDashboard?: () => void;
  onOpenPassport?: () => void;
  onSwitchRole: (role: "candidate" | "employer") => void;
}

export function EditorialNavigation({
  currentUser,
  currentRole,
  onOpenAuth,
  onOpenDashboard,
  onOpenPassport,
  onSwitchRole,
}: EditorialNavigationProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled
            ? "bg-[#111111]/85 backdrop-blur-md border-b border-[#D8C2A6]/10 py-4 shadow-sm"
            : "bg-transparent py-6 md:py-8"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between">
          {/* LEFT: GFG Minimal Logo */}
          <a
            href="#home"
            className="group flex items-baseline gap-2.5 text-[#F1E7DB] hover:opacity-85 transition-opacity"
          >
            <span className="font-sans text-2xl md:text-3xl font-light tracking-tight text-[#F1E7DB]">
              GFG
            </span>
            <span className="micro-label text-[10px] text-[#A56F7C] tracking-[0.24em]">
              CAREER
            </span>
          </a>

          {/* CENTER / RIGHT: Navigation Links (Section 5) */}
          <nav className="hidden lg:flex items-center space-x-8 xl:space-x-10 text-xs uppercase tracking-[0.18em] font-medium text-[#D8C2A6]">
            <a
              href="#pathways"
              className="hover:text-[#F1E7DB] opacity-80 hover:opacity-100 transition-all"
            >
              Explore
            </a>
            <a
              href="#skills"
              className="hover:text-[#F1E7DB] opacity-80 hover:opacity-100 transition-all"
            >
              Skills
            </a>
            <a
              href="#mentorship"
              className="hover:text-[#F1E7DB] opacity-80 hover:opacity-100 transition-all"
            >
              Mentorship
            </a>
            <a
              href="#opportunities"
              className="hover:text-[#F1E7DB] opacity-80 hover:opacity-100 transition-all"
            >
              Opportunities
            </a>
            <a
              href="#stories"
              className="hover:text-[#F1E7DB] opacity-80 hover:opacity-100 transition-all"
            >
              Stories
            </a>
            <a
              href="#dashboard"
              className="hover:text-[#F1E7DB] opacity-80 hover:opacity-100 transition-all"
            >
              Dashboard
            </a>
            <a
              href="#about"
              className="hover:text-[#F1E7DB] opacity-80 hover:opacity-100 transition-all"
            >
              About
            </a>
          </nav>

          {/* RIGHT: Profile / Sign In & Minimal Role Switcher */}
          <div className="flex items-center space-x-4 md:space-x-6">
            {/* Minimal Role Switcher Pill */}
            <div className="hidden sm:flex items-center p-0.5 rounded-full bg-[#181818] border border-[#D8C2A6]/15 text-[10px] font-mono tracking-wider uppercase">
              <button
                onClick={() => onSwitchRole("candidate")}
                className={`px-3 py-1 rounded-full transition-all ${
                  currentRole === "candidate"
                    ? "bg-[#F1E7DB] text-[#111111] font-semibold"
                    : "text-[#9A9A9A] hover:text-[#F1E7DB]"
                }`}
              >
                Priya
              </button>
              <button
                onClick={() => onSwitchRole("employer")}
                className={`px-3 py-1 rounded-full transition-all ${
                  currentRole === "employer"
                    ? "bg-[#D8C2A6] text-[#111111] font-semibold"
                    : "text-[#9A9A9A] hover:text-[#F1E7DB]"
                }`}
              >
                Nova Tech
              </button>
            </div>

            {/* Profile / Sign In Link */}
            <button
              onClick={onOpenAuth}
              className="text-xs uppercase tracking-[0.16em] font-medium text-[#F1E7DB] hover:text-[#D8C2A6] transition-colors flex items-center gap-1.5"
            >
              <User className="w-3.5 h-3.5 text-[#D8C2A6]" />
              <span className="hidden sm:inline">
                {currentUser?.full_name ? currentUser.full_name.split(" ")[0] : "Sign In"}
              </span>
            </button>

            {/* Minimal Mobile / Drawer Menu Icon */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-1.5 rounded-full text-[#F1E7DB] hover:bg-[#181818] transition-colors"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Editorial Dropdown */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 top-[72px] z-40 bg-[#111111]/98 backdrop-blur-xl lg:hidden flex flex-col p-8 space-y-6 text-sm uppercase font-mono tracking-widest text-[#F1E7DB] border-t border-[#D8C2A6]/10 animate-in fade-in">
          <a
            href="#pathways"
            onClick={() => setMobileMenuOpen(false)}
            className="hover:text-[#D8C2A6] transition-colors py-2 border-b border-[#181818]"
          >
            01 // Explore Pathways
          </a>
          <a
            href="#skills"
            onClick={() => setMobileMenuOpen(false)}
            className="hover:text-[#D8C2A6] transition-colors py-2 border-b border-[#181818]"
          >
            02 // Skills & Learning
          </a>
          <a
            href="#mentorship"
            onClick={() => setMobileMenuOpen(false)}
            className="hover:text-[#D8C2A6] transition-colors py-2 border-b border-[#181818]"
          >
            03 // Mentorship
          </a>
          <a
            href="#opportunities"
            onClick={() => setMobileMenuOpen(false)}
            className="hover:text-[#D8C2A6] transition-colors py-2 border-b border-[#181818]"
          >
            04 // Returnship Opportunities
          </a>
          <a
            href="#stories"
            onClick={() => setMobileMenuOpen(false)}
            className="hover:text-[#D8C2A6] transition-colors py-2 border-b border-[#181818]"
          >
            05 // Comeback Stories
          </a>
          <a
            href="#dashboard"
            onClick={() => setMobileMenuOpen(false)}
            className="hover:text-[#D8C2A6] transition-colors py-2 border-b border-[#181818]"
          >
            06 // Personal Dashboard
          </a>
          <a
            href="#about"
            onClick={() => setMobileMenuOpen(false)}
            className="hover:text-[#D8C2A6] transition-colors py-2 border-b border-[#181818]"
          >
            07 // Statement & Purpose
          </a>

          {/* Role switcher on mobile */}
          <div className="pt-4 flex items-center justify-between text-xs text-[#9A9A9A]">
            <span>Active Session:</span>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  onSwitchRole("candidate");
                  setMobileMenuOpen(false);
                }}
                className={`px-3 py-1 rounded-full ${
                  currentRole === "candidate" ? "bg-[#F1E7DB] text-[#111111] font-semibold" : "border border-[#333]"
                }`}
              >
                Priya
              </button>
              <button
                onClick={() => {
                  onSwitchRole("employer");
                  setMobileMenuOpen(false);
                }}
                className={`px-3 py-1 rounded-full ${
                  currentRole === "employer" ? "bg-[#D8C2A6] text-[#111111] font-semibold" : "border border-[#333]"
                }`}
              >
                Nova Tech
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
