"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Menu,
  X,
  Globe,
  GraduationCap,
  Sparkles,
  ChevronDown,
  User,
  LogOut,
  Shield,
  Layers,
  Compass,
  Briefcase,
  Users,
  Mic,
  Sliders,
  DollarSign,
  BarChart3,
  WifiOff,
} from "lucide-react";
import { useTranslation, SupportedLocale, LOCALE_NAMES } from "@/lib/i18n/LanguageContext";
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
  onOpenLearningHub?: () => void;
  onSwitchRole: (role: PlatformRole) => void;
  onLogout?: () => void;
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
  onOpenLearningHub,
  onSwitchRole,
  onLogout,
}: EditorialNavigationProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);

  const moreRef = useRef<HTMLDivElement>(null);
  const langRef = useRef<HTMLDivElement>(null);
  const accountRef = useRef<HTMLDivElement>(null);

  const { locale, setLocale, t } = useTranslation();
  const { lowBandwidthMode } = useBandwidth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Keyboard accessibility: Close menus on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMobileMenuOpen(false);
        setLangMenuOpen(false);
        setMoreMenuOpen(false);
        setAccountMenuOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Click outside listener for dropdowns
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setMoreMenuOpen(false);
      }
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setLangMenuOpen(false);
      }
      if (accountRef.current && !accountRef.current.contains(e.target as Node)) {
        setAccountMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      {/* WCAG 2.2 AA Skip to content link */}
      <a href="#main-content" className="skip-to-content-link">
        {t("a11y.skip_to_content")}
      </a>

      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 h-20 flex items-center ${
          isScrolled
            ? "bg-[#0A0706]/92 backdrop-blur-xl border-b border-[#D97706]/20 shadow-[0_4px_30px_rgba(0,0,0,0.5)]"
            : "bg-[#0A0706]/75 backdrop-blur-md border-b border-white/5"
        }`}
      >
        <div className="w-full px-6 sm:px-8 md:px-12 lg:px-16 flex items-center justify-between">
          {/* ========================================================= */}
          {/* LEFT: GFG Logo + GAP FOR GOOD Label                       */}
          {/* ========================================================= */}
          <div className="flex items-center gap-4 shrink-0">
            <a
              href="#home"
              className="group flex items-baseline gap-2.5 text-[#F5EDE4] hover:opacity-90 transition-opacity"
              aria-label="GFG Platform Home"
            >
              <span className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-[#F5EDE4] group-hover:text-[#D97706] transition-colors">
                GFG
              </span>
              <span className="text-[10px] sm:text-[11px] font-mono tracking-[0.24em] text-[#D97706] uppercase font-medium">
                GAP FOR GOOD
              </span>
            </a>

            {/* Low-Bandwidth indicator pill */}
            {lowBandwidthMode && (
              <span
                title="Low-Bandwidth Mode Active"
                className="hidden lg:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-[10px] text-amber-300 font-mono"
              >
                <WifiOff className="w-3 h-3" />
                <span>Data Saver</span>
              </span>
            )}
          </div>

          {/* ========================================================= */}
          {/* CENTER: Minimal, Modern Desktop Navigation               */}
          {/* ========================================================= */}
          <nav
            aria-label="Primary Navigation"
            className="hidden xl:flex items-center space-x-7 text-xs uppercase tracking-[0.18em] font-medium text-[#A89B90]"
          >
            {/* 1. Explore */}
            <a
              href="#mission"
              className="relative py-1 text-[#F5EDE4]/90 hover:text-[#D97706] transition-colors group whitespace-nowrap"
            >
              <span>Explore</span>
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#D97706] transition-all duration-300 group-hover:w-full" />
            </a>

            {/* 2. Career Pathways */}
            <button
              type="button"
              onClick={() => {
                const el = document.getElementById("features");
                if (el) el.scrollIntoView({ behavior: "smooth" });
                else if (onOpenRoadmap) onOpenRoadmap();
              }}
              className="relative py-1 hover:text-[#D97706] transition-colors group whitespace-nowrap"
            >
              <span>Career Pathways</span>
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#D97706] transition-all duration-300 group-hover:w-full" />
            </button>

            {/* 3. Skills */}
            <button
              type="button"
              onClick={() => {
                if (onOpenRoadmap) onOpenRoadmap();
              }}
              className="relative py-1 hover:text-[#D97706] transition-colors group whitespace-nowrap"
            >
              <span>Skills</span>
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#D97706] transition-all duration-300 group-hover:w-full" />
            </button>

            {/* 4. Learning Hub */}
            <button
              type="button"
              onClick={() => {
                if (onOpenLearningHub) onOpenLearningHub();
              }}
              className="relative py-1 hover:text-[#D97706] transition-colors group flex items-center gap-1.5 whitespace-nowrap text-[#F5EDE4]"
            >
              <GraduationCap className="w-3.5 h-3.5 text-[#D97706]" />
              <span>Learning Hub</span>
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#D97706] transition-all duration-300 group-hover:w-full" />
            </button>

            {/* 5. Mentorship */}
            <button
              type="button"
              onClick={() => {
                if (onOpenCommunity) onOpenCommunity("mentors");
              }}
              className="relative py-1 hover:text-[#D97706] transition-colors group whitespace-nowrap"
            >
              <span>Mentorship</span>
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#D97706] transition-all duration-300 group-hover:w-full" />
            </button>

            {/* 6. Opportunities */}
            <button
              type="button"
              onClick={() => {
                const el = document.getElementById("features");
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }}
              className="relative py-1 hover:text-[#D97706] transition-colors group whitespace-nowrap"
            >
              <span>Opportunities</span>
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#D97706] transition-all duration-300 group-hover:w-full" />
            </button>

            {/* 7. More Dropdown */}
            <div className="relative" ref={moreRef}>
              <button
                type="button"
                onClick={() => setMoreMenuOpen(!moreMenuOpen)}
                className="relative py-1 hover:text-[#D97706] transition-colors flex items-center gap-1 whitespace-nowrap"
                aria-expanded={moreMenuOpen}
              >
                <span>More</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    moreMenuOpen ? "rotate-180 text-[#D97706]" : ""
                  }`}
                />
              </button>

              {moreMenuOpen && (
                <div className="absolute left-0 mt-3 w-64 bg-[#140D09] border border-[#D97706]/25 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  {onOpenGovernmentPilot && (
                    <button
                      type="button"
                      onClick={() => {
                        onOpenGovernmentPilot("dashboard");
                        setMoreMenuOpen(false);
                      }}
                      className="w-full text-left px-3.5 py-2.5 rounded-xl hover:bg-[#20140E] text-[#F5EDE4] hover:text-[#D97706] transition-colors flex items-center gap-2.5 text-xs font-normal"
                    >
                      <BarChart3 className="w-4 h-4 text-[#D97706]" />
                      <div>
                        <p className="font-medium">Government &amp; Impact</p>
                        <p className="text-[10px] text-[#A89B90] normal-case">Public pilots &amp; CSR alignment</p>
                      </div>
                    </button>
                  )}

                  {onOpenEntrepreneurship && (
                    <button
                      type="button"
                      onClick={() => {
                        onOpenEntrepreneurship();
                        setMoreMenuOpen(false);
                      }}
                      className="w-full text-left px-3.5 py-2.5 rounded-xl hover:bg-[#20140E] text-[#F5EDE4] hover:text-[#D97706] transition-colors flex items-center gap-2.5 text-xs font-normal"
                    >
                      <DollarSign className="w-4 h-4 text-[#D97706]" />
                      <div>
                        <p className="font-medium">Freelance &amp; Small Business</p>
                        <p className="text-[10px] text-[#A89B90] normal-case">Independent consulting tools</p>
                      </div>
                    </button>
                  )}

                  {onOpenA11y && (
                    <button
                      type="button"
                      onClick={() => {
                        onOpenA11y();
                        setMoreMenuOpen(false);
                      }}
                      className="w-full text-left px-3.5 py-2.5 rounded-xl hover:bg-[#20140E] text-[#F5EDE4] hover:text-[#D97706] transition-colors flex items-center gap-2.5 text-xs font-normal"
                    >
                      <Sliders className="w-4 h-4 text-[#D97706]" />
                      <div>
                        <p className="font-medium">Accessibility Controls</p>
                        <p className="text-[10px] text-[#A89B90] normal-case">WCAG 2.2 AA contrast &amp; fonts</p>
                      </div>
                    </button>
                  )}

                  {onOpenVoice && (
                    <button
                      type="button"
                      onClick={() => {
                        onOpenVoice();
                        setMoreMenuOpen(false);
                      }}
                      className="w-full text-left px-3.5 py-2.5 rounded-xl hover:bg-[#20140E] text-[#F5EDE4] hover:text-[#D97706] transition-colors flex items-center gap-2.5 text-xs font-normal"
                    >
                      <Mic className="w-4 h-4 text-[#D97706]" />
                      <div>
                        <p className="font-medium">Voice Assistant</p>
                        <p className="text-[10px] text-[#A89B90] normal-case">Interactive speech navigation</p>
                      </div>
                    </button>
                  )}
                </div>
              )}
            </div>
          </nav>

          {/* ========================================================= */}
          {/* RIGHT: Language, Dashboard, Auth & Account               */}
          {/* ========================================================= */}
          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            {/* 1. Language Selector Dropdown */}
            <div className="relative" ref={langRef}>
              <button
                type="button"
                onClick={() => setLangMenuOpen(!langMenuOpen)}
                aria-expanded={langMenuOpen}
                aria-haspopup="true"
                aria-label="Select Language"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1A0F0A] border border-[#D97706]/20 text-[#F5EDE4] hover:border-[#D97706]/40 text-xs font-mono tracking-wider transition-all"
              >
                <Globe className="w-3.5 h-3.5 text-[#D97706]" />
                <span className="uppercase font-semibold text-[11px]">{locale}</span>
                <ChevronDown className="w-3 h-3 text-[#A89B90]" />
              </button>

              {langMenuOpen && (
                <div
                  role="menu"
                  className="absolute right-0 mt-2 w-40 bg-[#140D09] border border-[#D97706]/25 rounded-2xl shadow-2xl py-1.5 z-50 text-xs font-mono animate-in fade-in duration-150"
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
                      className={`w-full text-left px-3.5 py-2 hover:bg-[#20140E] flex items-center justify-between transition-colors ${
                        locale === l ? "text-[#D97706] font-bold bg-[#1A0F0A]" : "text-[#A89B90]"
                      }`}
                    >
                      <span>{LOCALE_NAMES[l].native}</span>
                      <span className="text-[10px] uppercase opacity-70">{l}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 2. Authenticated State: Dashboard Button & Account Menu */}
            {currentUser ? (
              <div className="flex items-center gap-3">
                {onOpenDashboard && (
                  <button
                    type="button"
                    onClick={onOpenDashboard}
                    className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#1A0F0A] hover:bg-[#25150F] text-[#F5EDE4] border border-[#D97706]/35 hover:border-[#D97706]/60 text-xs font-medium tracking-wide transition-all shadow-[0_0_20px_rgba(217,119,6,0.15)]"
                  >
                    <Layers className="w-3.5 h-3.5 text-[#D97706]" />
                    <span>Dashboard</span>
                  </button>
                )}

                {/* Account Avatar Menu */}
                <div className="relative" ref={accountRef}>
                  <button
                    type="button"
                    onClick={() => setAccountMenuOpen(!accountMenuOpen)}
                    aria-expanded={accountMenuOpen}
                    className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-full bg-gradient-to-r from-[#1A0F0A] to-[#25150F] border border-[#D97706]/40 hover:border-[#D97706] transition-all text-xs text-[#F5EDE4]"
                    title="Account details"
                  >
                    <div className="w-6 h-6 rounded-full bg-[#D97706]/20 border border-[#D97706]/50 flex items-center justify-center text-[#D97706] font-semibold text-xs">
                      {currentUser.full_name ? currentUser.full_name.charAt(0).toUpperCase() : "U"}
                    </div>
                    <span className="hidden md:inline font-medium text-xs max-w-[120px] truncate">
                      {currentUser.full_name || "Account"}
                    </span>
                    <ChevronDown className="w-3 h-3 text-[#A89B90]" />
                  </button>

                  {accountMenuOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-[#140D09] border border-[#D97706]/30 rounded-2xl shadow-2xl p-3 z-50 text-xs font-sans animate-in fade-in duration-150">
                      <div className="pb-3 border-b border-white/5 space-y-0.5">
                        <p className="font-semibold text-[#F5EDE4] text-sm">{currentUser.full_name}</p>
                        <p className="text-[11px] text-[#A89B90] font-mono truncate">{currentUser.email}</p>
                        <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-[#D97706]/15 border border-[#D97706]/30 text-[10px] font-mono text-[#D97706] uppercase">
                          Role: {currentRole}
                        </span>
                      </div>

                      <div className="py-2 space-y-1">
                        {onOpenDashboard && (
                          <button
                            type="button"
                            onClick={() => {
                              onOpenDashboard();
                              setAccountMenuOpen(false);
                            }}
                            className="w-full text-left px-3 py-2 rounded-lg hover:bg-[#20140E] text-[#F5EDE4] transition-colors flex items-center gap-2"
                          >
                            <Layers className="w-3.5 h-3.5 text-[#D97706]" />
                            <span>Candidate Dashboard</span>
                          </button>
                        )}

                        {onOpenPassport && (
                          <button
                            type="button"
                            onClick={() => {
                              onOpenPassport();
                              setAccountMenuOpen(false);
                            }}
                            className="w-full text-left px-3 py-2 rounded-lg hover:bg-[#20140E] text-[#F5EDE4] transition-colors flex items-center gap-2"
                          >
                            <Shield className="w-3.5 h-3.5 text-[#D97706]" />
                            <span>Career Continuity Passport</span>
                          </button>
                        )}

                        {onOpenAdmin && currentRole === "admin" && (
                          <button
                            type="button"
                            onClick={() => {
                              onOpenAdmin();
                              setAccountMenuOpen(false);
                            }}
                            className="w-full text-left px-3 py-2 rounded-lg hover:bg-[#20140E] text-[#F5EDE4] transition-colors flex items-center gap-2"
                          >
                            <Shield className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Governance Portal</span>
                          </button>
                        )}
                      </div>

                      {/* Demo Persona Switcher */}
                      <div className="pt-2 border-t border-white/5 space-y-1">
                        <p className="text-[10px] font-mono uppercase tracking-wider text-[#A89B90] px-3">
                          Switch Role
                        </p>
                        <div className="grid grid-cols-2 gap-1 pt-1">
                          {(["candidate", "employer", "mentor", "admin"] as PlatformRole[]).map((r) => (
                            <button
                              key={r}
                              type="button"
                              onClick={() => {
                                onSwitchRole(r);
                                setAccountMenuOpen(false);
                              }}
                              className={`px-2.5 py-1.5 rounded-lg text-[11px] font-mono capitalize text-left transition-colors ${
                                currentRole === r
                                  ? "bg-[#D97706]/20 border border-[#D97706]/40 text-[#D97706] font-semibold"
                                  : "text-[#A89B90] hover:bg-[#20140E] hover:text-[#F5EDE4]"
                              }`}
                            >
                              {r}
                            </button>
                          ))}
                        </div>
                      </div>

                      {onLogout && (
                        <div className="pt-2 mt-2 border-t border-white/5">
                          <button
                            type="button"
                            onClick={() => {
                              onLogout();
                              setAccountMenuOpen(false);
                            }}
                            className="w-full text-left px-3 py-2 rounded-lg hover:bg-red-950/40 text-red-300 transition-colors flex items-center gap-2"
                          >
                            <LogOut className="w-3.5 h-3.5 text-red-400" />
                            <span>Sign Out</span>
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* Guest State: Sign In / Get Started buttons */
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={onOpenAuth}
                  className="hidden sm:inline-block px-4 py-2 text-xs font-medium text-[#F5EDE4] hover:text-[#D97706] tracking-wider uppercase transition-colors"
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={onOpenAuth}
                  className="px-5 py-2.5 rounded-full bg-gradient-to-r from-[#A8551F] via-[#D97706] to-[#F59E0B] hover:opacity-95 text-[#0A0706] font-semibold text-xs tracking-wider uppercase shadow-[0_0_30px_rgba(217,119,6,0.4)] hover:shadow-[0_0_40px_rgba(245,158,11,0.6)] hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  Get Started
                </button>
              </div>
            )}

            {/* Mobile Hamburger Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="xl:hidden p-2 rounded-xl bg-[#1A0F0A] border border-[#D97706]/20 text-[#F5EDE4] hover:border-[#D97706]/40 transition-colors"
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* ========================================================= */}
        {/* MOBILE MENU DRAWER                                        */}
        {/* ========================================================= */}
        {mobileMenuOpen && (
          <div
            className="xl:hidden fixed inset-x-0 top-20 bg-[#0A0706]/98 backdrop-blur-2xl border-b border-[#D97706]/20 p-6 space-y-6 shadow-2xl z-40 max-h-[85vh] overflow-y-auto animate-in slide-in-from-top-4 duration-300"
          >
            <nav className="flex flex-col space-y-3 font-sans text-sm uppercase tracking-wider">
              <a
                href="#mission"
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-3 rounded-xl hover:bg-[#1A0F0A] text-[#F5EDE4] flex items-center justify-between"
              >
                <span>Explore</span>
                <span className="text-xs text-[#D97706]">01 //</span>
              </a>

              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  const el = document.getElementById("features");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                }}
                className="w-full text-left px-4 py-3 rounded-xl hover:bg-[#1A0F0A] text-[#F5EDE4] flex items-center justify-between"
              >
                <span>Career Pathways</span>
                <span className="text-xs text-[#D97706]">02 //</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  if (onOpenRoadmap) onOpenRoadmap();
                }}
                className="w-full text-left px-4 py-3 rounded-xl hover:bg-[#1A0F0A] text-[#F5EDE4] flex items-center justify-between"
              >
                <span>Skills &amp; AI Roadmap</span>
                <span className="text-xs text-[#D97706]">03 //</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  if (onOpenLearningHub) onOpenLearningHub();
                }}
                className="w-full text-left px-4 py-3 rounded-xl hover:bg-[#1A0F0A] text-[#F5EDE4] flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-[#D97706]" />
                  <span>Learning Hub</span>
                </div>
                <span className="text-xs text-[#D97706]">04 //</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  if (onOpenCommunity) onOpenCommunity("mentors");
                }}
                className="w-full text-left px-4 py-3 rounded-xl hover:bg-[#1A0F0A] text-[#F5EDE4] flex items-center justify-between"
              >
                <span>Mentorship</span>
                <span className="text-xs text-[#D97706]">05 //</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  const el = document.getElementById("features");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                }}
                className="w-full text-left px-4 py-3 rounded-xl hover:bg-[#1A0F0A] text-[#F5EDE4] flex items-center justify-between"
              >
                <span>Opportunities</span>
                <span className="text-xs text-[#D97706]">06 //</span>
              </button>
            </nav>

            <div className="pt-4 border-t border-white/10 space-y-3">
              {currentUser ? (
                <>
                  {onOpenDashboard && (
                    <button
                      type="button"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        onOpenDashboard();
                      }}
                      className="w-full py-3 rounded-full bg-[#1A0F0A] border border-[#D97706]/40 text-[#F5EDE4] font-medium text-xs uppercase tracking-wider text-center"
                    >
                      Open Candidate Dashboard
                    </button>
                  )}
                  {onLogout && (
                    <button
                      type="button"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        onLogout();
                      }}
                      className="w-full py-3 rounded-full bg-red-950/40 text-red-300 font-medium text-xs uppercase tracking-wider text-center"
                    >
                      Sign Out
                    </button>
                  )}
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAuth();
                  }}
                  className="w-full py-3.5 rounded-full bg-gradient-to-r from-[#A8551F] via-[#D97706] to-[#F59E0B] text-[#0A0706] font-bold text-xs uppercase tracking-wider text-center"
                >
                  Start Your Comeback
                </button>
              )}
            </div>
          </div>
        )}
      </header>
    </>
  );
}
