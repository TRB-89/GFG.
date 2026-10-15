"use client";

import React, { useState, useEffect } from "react";
import {
  User,
  Users,
  Menu,
  X,
  Shield,
  Sparkles,
  Building2,
  GraduationCap,
  Brain,
  Layers,
  Globe,
  Sliders,
  Mic,
  Briefcase,
  WifiOff,
  BarChart3,
  ExternalLink,
} from "lucide-react";
import { useTranslation } from "@/lib/i18n/LanguageContext";
import { SupportedLocale, LOCALE_NAMES } from "@/lib/i18n/LanguageContext";
import { useBandwidth } from "@/lib/bandwidth/BandwidthContext";

export type PlatformRole = "candidate" | "employer" | "mentor" | "admin";

interface UserProfile {
  id?: string;
  full_name?: string;
  email?: string;
  role?: string;
}

interface EditorialNavigationProps {
  currentUser: UserProfile | null;
  currentRole: PlatformRole;
  onOpenAuth: () => void;
  onOpenDashboard?: () => void;
  onOpenPassport?: () => void;
  onOpenAdmin?: () => void;
  onOpenOnboarding?: () => void;
  onOpenDigitalTwin?: () => void;
  onOpenSimulator?: () => void;
  onOpenRoadmap?: () => void;
  onOpenCommunity?: (tab?: "mentors" | "sessions" | "circles" | "interview" | "safety") => void;
  onOpenA11y?: () => void;
  onOpenVoice?: () => void;
  onOpenEntrepreneurship?: () => void;
  onOpenWorkLife?: () => void;
  onOpenEmployerDesk?: (tab?: "dashboard" | "candidates" | "builder" | "toolkit" | "analytics" | "verification") => void;
  onOpenGovernmentPilot?: (tab?: "dashboard" | "design" | "schemes" | "sdg" | "reporting" | "presentation") => void;
  onSwitchRole: (role: PlatformRole) => void;
}

export function EditorialNavigation({
  currentUser,
  currentRole,
  onOpenAuth,
  onOpenDashboard,
  onOpenPassport,
  onOpenAdmin,
  onOpenOnboarding,
  onOpenDigitalTwin,
  onOpenSimulator,
  onOpenRoadmap,
  onOpenCommunity,
  onOpenA11y,
  onOpenVoice,
  onOpenEntrepreneurship,
  onOpenWorkLife,
  onOpenEmployerDesk,
  onOpenGovernmentPilot,
  onSwitchRole,
}: EditorialNavigationProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);

  const { locale, setLocale, t } = useTranslation();
  const { lowBandwidthMode } = useBandwidth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      {/* WCAG 2.2 AA Skip Link for Keyboard Navigation */}
      <a href="#main-content" className="skip-to-content-link">
        {t("a11y.skip_to_content")}
      </a>

      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled
            ? "bg-[#111111]/90 backdrop-blur-md border-b border-[#D8C2A6]/10 py-3 shadow-sm"
            : "bg-transparent py-4 md:py-6"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 flex items-center justify-between">
          {/* LEFT: GFG Minimal Logo */}
          <div className="flex items-center gap-3">
            <a
              href="#home"
              className="group flex items-baseline gap-2 text-[#F1E7DB] hover:opacity-85 transition-opacity"
              aria-label="GFG Platform Home"
            >
              <span className="font-sans text-xl md:text-2xl font-light tracking-tight text-[#F1E7DB]">
                GFG
              </span>
              <span className="micro-label text-[9px] text-[#A56F7C] tracking-[0.24em]">
                CAREER
              </span>
            </a>

            {/* Low-Bandwidth indicator pill */}
            {lowBandwidthMode && (
              <span
                title="Low-Bandwidth Mode Active"
                className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-[10px] text-amber-300 font-mono"
              >
                <WifiOff className="w-3 h-3" />
                <span>Data Saver</span>
              </span>
            )}
          </div>

          {/* CENTER: Navigation Links (Translated) */}
          <nav
            aria-label="Primary Navigation"
            className="hidden xl:flex items-center space-x-6 text-[11px] uppercase tracking-[0.16em] font-medium text-[#D8C2A6]"
          >
            <a href="#guided-assistance" className="hover:text-[#F1E7DB] opacity-90 hover:opacity-100 transition-all text-amber-200">
              {t("nav.need_help")}
            </a>
            <a href="#pathways" className="hover:text-[#F1E7DB] opacity-80 hover:opacity-100 transition-all">
              {t("nav.pathways")}
            </a>
            <a href="#skills" className="hover:text-[#F1E7DB] opacity-80 hover:opacity-100 transition-all">
              {t("nav.skills")}
            </a>
            <a href="#roadmap" className="hover:text-[#F1E7DB] opacity-80 hover:opacity-100 transition-all">
              {t("nav.roadmap")}
            </a>
            <a href="#mentorship" className="hover:text-[#F1E7DB] opacity-80 hover:opacity-100 transition-all">
              {t("nav.mentorship")}
            </a>
            <a href="#opportunities" className="hover:text-[#F1E7DB] opacity-80 hover:opacity-100 transition-all">
              {t("nav.opportunities")}
            </a>
            {onOpenEntrepreneurship && (
              <button
                type="button"
                onClick={onOpenEntrepreneurship}
                className="hover:text-[#F1E7DB] opacity-80 hover:opacity-100 transition-all uppercase"
              >
                {t("nav.entrepreneurship")}
              </button>
            )}
            {onOpenEmployerDesk && (
              <button
                type="button"
                onClick={() => onOpenEmployerDesk("dashboard")}
                className="hover:text-[#F1E7DB] opacity-80 hover:opacity-100 transition-all uppercase flex items-center gap-1 text-[#E7C1C9]"
                title="Employer Intelligence & Returnship Toolkit"
              >
                <Building2 className="w-3 h-3 text-[#E7C1C9]" />
                <span>Recruiter Desk</span>
              </button>
            )}
            {onOpenGovernmentPilot && (
              <button
                type="button"
                onClick={() => onOpenGovernmentPilot("dashboard")}
                className="hover:text-[#F1E7DB] opacity-80 hover:opacity-100 transition-all uppercase flex items-center gap-1 text-[#D8C2A6]"
                title="Government Pilot & Impact Analytics (Module 11)"
              >
                <BarChart3 className="w-3 h-3 text-[#D8C2A6]" />
                <span>Gov & Impact</span>
              </button>
            )}
            <a
              href="/minister-presentation"
              className="hover:text-[#F1E7DB] opacity-90 hover:opacity-100 transition-all uppercase flex items-center gap-1 text-emerald-300 font-semibold"
              title="Official Ministerial Presentation & Briefing Dossier (Module 12)"
            >
              <Sparkles className="w-3 h-3 text-emerald-400" />
              <span>Minister Briefing</span>
            </a>
            <a href="#dashboard" className="hover:text-[#F1E7DB] opacity-80 hover:opacity-100 transition-all">
              {t("nav.dashboard")}
            </a>
          </nav>

          {/* RIGHT: Tools, Language, Voice, Accessibility & Profile */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Language Selector Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setLangMenuOpen(!langMenuOpen)}
                aria-expanded={langMenuOpen}
                aria-haspopup="true"
                aria-label="Select Language"
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#1A1A1A] border border-[#D8C2A6]/20 text-[#D8C2A6] hover:text-[#F1E7DB] hover:border-[#D8C2A6]/40 text-[11px] font-mono tracking-wider transition-all focus-visible:ring-2 focus-visible:ring-[#F1E7DB]"
              >
                <Globe className="w-3.5 h-3.5" />
                <span className="font-semibold uppercase">{locale}</span>
              </button>

              {langMenuOpen && (
                <div
                  role="menu"
                  className="absolute right-0 mt-2 w-36 bg-[#181818] border border-[#D8C2A6]/20 rounded-xl shadow-2xl py-1 z-50 text-xs font-mono animate-in fade-in"
                >
                  {(["en", "ta", "hi"] as const).map((l) => (
                    <button
                      key={l}
                      role="menuitem"
                      type="button"
                      onClick={() => {
                        setLocale(l);
                        setLangMenuOpen(false);
                      }}
                      className={`w-full text-left px-3.5 py-2 hover:bg-[#252525] flex items-center justify-between transition-colors ${
                        locale === l ? "text-[#F1E7DB] font-bold bg-[#222]" : "text-[#9A9A9A]"
                      }`}
                    >
                      <span>{LOCALE_NAMES[l].native}</span>
                      <span className="text-[10px] uppercase opacity-60">{l}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Accessibility Settings Trigger */}
            {onOpenA11y && (
              <button
                type="button"
                onClick={onOpenA11y}
                aria-label={t("nav.accessibility")}
                title="Accessibility & Comfort Settings (WCAG 2.2 AA)"
                className="w-8 h-8 rounded-full bg-[#1A1A1A] hover:bg-[#242424] border border-[#D8C2A6]/20 flex items-center justify-center text-[#D8C2A6] hover:text-[#F1E7DB] transition-all focus-visible:ring-2 focus-visible:ring-[#F1E7DB]"
              >
                <Sliders className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Voice Assistant Trigger */}
            {onOpenVoice && (
              <button
                type="button"
                onClick={onOpenVoice}
                aria-label={t("nav.voice_assistant")}
                title="Spoken Voice Guide (Mic)"
                className="w-8 h-8 rounded-full bg-[#A56F7C]/20 hover:bg-[#A56F7C]/35 border border-[#A56F7C]/40 flex items-center justify-center text-[#A56F7C] hover:text-[#F1E7DB] transition-all focus-visible:ring-2 focus-visible:ring-[#F1E7DB]"
              >
                <Mic className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Entrepreneurship Quick Launch Button */}
            {onOpenEntrepreneurship && (
              <button
                type="button"
                onClick={onOpenEntrepreneurship}
                className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-[#D8C2A6]/30 bg-[#181818] text-[#F1E7DB] text-[10px] font-mono uppercase tracking-wider hover:border-[#D8C2A6] hover:bg-[#202020] transition-all"
              >
                <Briefcase className="w-3 h-3 text-[#D8C2A6]" />
                <span>Hub</span>
              </button>
            )}

            {/* 4-Role Persona Switcher Pill */}
            <div className="hidden 2xl:flex items-center p-0.5 rounded-full bg-[#181818] border border-[#D8C2A6]/15 text-[10px] font-mono tracking-wider uppercase">
              <button
                type="button"
                onClick={() => onSwitchRole("candidate")}
                title="Switch to Candidate Persona (Ananya Raman)"
                className={`px-2 py-0.5 rounded-full transition-all ${
                  currentRole === "candidate"
                    ? "bg-[#F1E7DB] text-[#111111] font-semibold"
                    : "text-[#9A9A9A] hover:text-[#F1E7DB]"
                }`}
              >
                Candidate
              </button>
              <button
                type="button"
                onClick={() => {
                  onSwitchRole("employer");
                  if (onOpenEmployerDesk) onOpenEmployerDesk("dashboard");
                }}
                title="Switch to Employer Recruiter Desk (Nova Tech)"
                className={`px-2 py-0.5 rounded-full transition-all ${
                  currentRole === "employer"
                    ? "bg-[#D8C2A6] text-[#111111] font-semibold"
                    : "text-[#9A9A9A] hover:text-[#F1E7DB]"
                }`}
              >
                Employer
              </button>
              <button
                type="button"
                onClick={() => onSwitchRole("mentor")}
                title="Switch to Mentor View (Dr. Meera Iyer)"
                className={`px-2 py-0.5 rounded-full transition-all ${
                  currentRole === "mentor"
                    ? "bg-[#A56F7C] text-[#F1E7DB] font-semibold"
                    : "text-[#9A9A9A] hover:text-[#F1E7DB]"
                }`}
              >
                Mentor
              </button>
              <button
                type="button"
                onClick={() => onSwitchRole("admin")}
                title="Switch to Administrator Governance Desk"
                className={`px-2 py-0.5 rounded-full transition-all ${
                  currentRole === "admin"
                    ? "bg-emerald-900 text-emerald-200 border border-emerald-500/30 font-semibold"
                    : "text-[#9A9A9A] hover:text-[#F1E7DB]"
                }`}
              >
                Admin
              </button>
            </div>

            {/* User Profile / Sign In */}
            <button
              type="button"
              onClick={onOpenDashboard || onOpenAuth}
              className="text-xs uppercase tracking-[0.16em] font-medium text-[#F1E7DB] hover:text-[#D8C2A6] transition-colors flex items-center gap-1.5 py-1 px-2.5 rounded-lg hover:bg-white/5"
              aria-label="User Account"
            >
              <User className="w-3.5 h-3.5 text-[#D8C2A6]" />
              <span className="hidden sm:inline">
                {currentUser?.full_name ? currentUser.full_name.split(" ")[0] : "Sign In"}
              </span>
            </button>

            {/* Mobile Navigation Toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="xl:hidden p-1.5 rounded-full text-[#F1E7DB] hover:bg-[#181818] transition-colors"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 top-[65px] z-40 bg-[#111111]/98 backdrop-blur-xl xl:hidden flex flex-col p-6 sm:p-8 space-y-4 text-sm uppercase font-mono tracking-widest text-[#F1E7DB] border-t border-[#D8C2A6]/10 animate-in fade-in overflow-y-auto">
          {/* Quick Guided Assistance */}
          <a
            href="#guided-assistance"
            onClick={() => setMobileMenuOpen(false)}
            className="text-amber-300 hover:text-white transition-colors py-2 border-b border-[#222] flex items-center justify-between"
          >
            <span>★ // {t("nav.need_help")}</span>
            <span className="text-[10px] bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded">Guided</span>
          </a>

          {/* Quick Mobile Action Buttons */}
          <div className="grid grid-cols-2 gap-2 pb-2 border-b border-[#222]">
            {onOpenA11y && (
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenA11y();
                }}
                className="py-2.5 px-3 rounded-xl bg-[#1C1C1C] border border-[#D8C2A6]/20 text-[11px] text-[#D8C2A6] flex items-center justify-center gap-1.5"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>{t("nav.accessibility")}</span>
              </button>
            )}
            {onOpenVoice && (
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenVoice();
                }}
                className="py-2.5 px-3 rounded-xl bg-[#A56F7C]/20 border border-[#A56F7C]/40 text-[11px] text-[#F1E7DB] flex items-center justify-center gap-1.5"
              >
                <Mic className="w-3.5 h-3.5 text-[#A56F7C]" />
                <span>{t("nav.voice_assistant")}</span>
              </button>
            )}
          </div>

          <a
            href="#pathways"
            onClick={() => setMobileMenuOpen(false)}
            className="hover:text-[#D8C2A6] transition-colors py-2 border-b border-[#181818]"
          >
            01 // {t("nav.pathways")}
          </a>
          <a
            href="#skills"
            onClick={() => setMobileMenuOpen(false)}
            className="hover:text-[#D8C2A6] transition-colors py-2 border-b border-[#181818]"
          >
            02 // {t("nav.skills")}
          </a>
          <a
            href="#roadmap"
            onClick={() => setMobileMenuOpen(false)}
            className="hover:text-[#D8C2A6] transition-colors py-2 border-b border-[#181818]"
          >
            03 // {t("nav.roadmap")}
          </a>
          <a
            href="#mentorship"
            onClick={() => setMobileMenuOpen(false)}
            className="hover:text-[#D8C2A6] transition-colors py-2 border-b border-[#181818]"
          >
            04 // {t("nav.mentorship")}
          </a>
          <a
            href="#opportunities"
            onClick={() => setMobileMenuOpen(false)}
            className="hover:text-[#D8C2A6] transition-colors py-2 border-b border-[#181818]"
          >
            05 // {t("nav.opportunities")}
          </a>
          {onOpenEntrepreneurship && (
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenEntrepreneurship();
              }}
              className="text-left text-[#D8C2A6] hover:text-[#F1E7DB] transition-colors py-2 border-b border-[#181818] flex items-center justify-between"
            >
              <span>06 // {t("nav.entrepreneurship")}</span>
              <Briefcase className="w-3.5 h-3.5" />
            </button>
          )}
          <a
            href="#dashboard"
            onClick={() => setMobileMenuOpen(false)}
            className="hover:text-[#D8C2A6] transition-colors py-2 border-b border-[#181818]"
          >
            07 // {t("nav.dashboard")}
          </a>
          {onOpenGovernmentPilot && (
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenGovernmentPilot("dashboard");
              }}
              className="text-left text-[#D8C2A6] hover:text-[#F1E7DB] transition-colors py-2 border-b border-[#181818] flex items-center justify-between"
            >
              <span>Gov // Pilot & Impact Analytics</span>
              <BarChart3 className="w-3.5 h-3.5" />
            </button>
          )}
          {currentRole === "candidate" && onOpenOnboarding && (
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenOnboarding();
              }}
              className="text-left text-[#A56F7C] hover:text-[#F1E7DB] transition-colors py-2 border-b border-[#181818] flex items-center justify-between"
            >
              <span>08 // Intelligent Onboarding</span>
              <Sparkles className="w-3.5 h-3.5" />
            </button>
          )}
          {currentRole === "candidate" && onOpenDigitalTwin && (
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenDigitalTwin();
              }}
              className="text-left text-blue-300 hover:text-[#F1E7DB] transition-colors py-2 border-b border-[#181818] flex items-center justify-between"
            >
              <span>09 // AI Career Digital Twin</span>
              <Brain className="w-3.5 h-3.5" />
            </button>
          )}
          {currentRole === "candidate" && onOpenSimulator && (
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenSimulator();
              }}
              className="text-left text-cyan-300 hover:text-[#F1E7DB] transition-colors py-2 border-b border-[#181818] flex items-center justify-between"
            >
              <span>10 // AI Career Future Simulator</span>
              <Sparkles className="w-3.5 h-3.5" />
            </button>
          )}

          <a
            href="/minister-presentation"
            onClick={() => setMobileMenuOpen(false)}
            className="text-left text-emerald-300 hover:text-[#F1E7DB] transition-colors py-2 border-b border-[#181818] flex items-center justify-between"
          >
            <span>12 // Ministerial Briefing Deck</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          {/* Role switcher on mobile */}
          <div className="pt-4 border-t border-[#181818] space-y-2">
            <span className="text-[11px] text-[#9A9A9A] block">Switch Active Persona:</span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => {
                  onSwitchRole("candidate");
                  setMobileMenuOpen(false);
                }}
                className={`p-2 rounded-lg text-center ${
                  currentRole === "candidate" ? "bg-[#F1E7DB] text-[#111111] font-semibold" : "bg-[#181818] text-[#9A9A9A]"
                }`}
              >
                Ananya (Cand.)
              </button>
              <button
                type="button"
                onClick={() => {
                  onSwitchRole("employer");
                  setMobileMenuOpen(false);
                }}
                className={`p-2 rounded-lg text-center ${
                  currentRole === "employer" ? "bg-[#D8C2A6] text-[#111111] font-semibold" : "bg-[#181818] text-[#9A9A9A]"
                }`}
              >
                Nova Tech
              </button>
              <button
                type="button"
                onClick={() => {
                  onSwitchRole("mentor");
                  setMobileMenuOpen(false);
                }}
                className={`p-2 rounded-lg text-center ${
                  currentRole === "mentor" ? "bg-[#A56F7C] text-[#F1E7DB] font-semibold" : "bg-[#181818] text-[#9A9A9A]"
                }`}
              >
                Dr. Meera (Mentor)
              </button>
              <button
                type="button"
                onClick={() => {
                  onSwitchRole("admin");
                  setMobileMenuOpen(false);
                }}
                className={`p-2 rounded-lg text-center ${
                  currentRole === "admin" ? "bg-emerald-900 text-emerald-200 font-semibold" : "bg-[#181818] text-[#9A9A9A]"
                }`}
              >
                Super-Admin
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
