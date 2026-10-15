"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
  X,
  Check,
  ChevronRight,
  ChevronLeft,
  Upload,
  FileText,
  Shield,
  Sparkles,
  Lock,
  Eye,
  RefreshCw,
  AlertCircle,
  HelpCircle,
  Briefcase,
  Calendar,
  Clock,
  Compass,
  ArrowRight,
  CheckCircle2,
  Trash2,
  BookmarkCheck,
} from "lucide-react";
import { api } from "@/lib/api";
import { DEMO_PERSONA } from "@/lib/demoPersona";

export interface IntelligentOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (candidateData: unknown) => void;
  initialStep?: number;
}

interface OnboardingFormData {
  // Step 2: Background
  previous_job_title: string;
  industry: string;
  experience_years: number;
  qualifications: string;
  existing_skills: string[];
  resume_url?: string;
  resume_filename?: string;
  resume_size?: number;

  // Step 3: Career Break
  career_break_start_date: string;
  career_break_end_date: string;
  currently_on_break: boolean;
  career_break_reason: string;
  custom_break_notes: string;

  // Step 4: Goals
  career_goals: string[];

  // Step 5: Availability
  weekly_learning_hours: number;
  preferred_work_mode: string;
  preferred_location: string;
  language_preference: string;
  salary_expectation: string;

  // Step 7: Consent & Visibility
  profile_visibility: "private" | "employers" | "public";
  opt_into_employer_sharing: boolean;
  ai_processing_consent: boolean;
}

const DEFAULT_FORM_DATA: OnboardingFormData = {
  previous_job_title: "",
  industry: "Technology & Software",
  experience_years: 4,
  qualifications: "Bachelor of Engineering (B.Tech / B.E.)",
  existing_skills: ["SQL", "Data Analysis", "Python"],
  resume_url: undefined,
  resume_filename: undefined,
  resume_size: undefined,

  career_break_start_date: "",
  career_break_end_date: "",
  currently_on_break: true,
  career_break_reason: "",
  custom_break_notes: "",

  career_goals: ["Return to the same profession", "Work remotely"],

  weekly_learning_hours: 15,
  preferred_work_mode: "hybrid",
  preferred_location: "Bengaluru, IN",
  language_preference: "English",
  salary_expectation: "Standard Returnship Stipend (₹35k - ₹60k/mo)",

  profile_visibility: "private",
  opt_into_employer_sharing: false,
  ai_processing_consent: true,
};

const SAMPLE_JOURNEY_DATA: OnboardingFormData = {
  previous_job_title: "Senior Data & BI Engineer",
  industry: "Technology & Software",
  experience_years: 4.5,
  qualifications: "Bachelor of Engineering (Computer Science)",
  existing_skills: ["SQL", "PostgreSQL", "Data Modeling", "Python", "Tableau", "Git"],
  resume_url: "/api/upload/resumes/sample_ananya_raman_cv.pdf",
  resume_filename: "Ananya_Raman_Data_Engineer_Resume.pdf",
  resume_size: 1420000,

  career_break_start_date: "2023-04-01",
  career_break_end_date: "2025-06-01",
  currently_on_break: true,
  career_break_reason: "Parenting & Family Care",
  custom_break_notes: "Taking structured sabbatical for childcare and continuing self-directed cloud certifications.",

  career_goals: ["Return to the same profession", "Find part-time work", "Work remotely"],

  weekly_learning_hours: 18,
  preferred_work_mode: "hybrid",
  preferred_location: "Bengaluru, IN",
  language_preference: "English",
  salary_expectation: "₹12,00,000 - ₹16,00,000 / year",

  profile_visibility: "private",
  opt_into_employer_sharing: true,
  ai_processing_consent: true,
};

const SUGGESTED_SKILLS = [
  "SQL",
  "Python",
  "Data Analysis",
  "Power BI",
  "React",
  "Node.js",
  "Cloud Architecture / AWS",
  "Machine Learning Basics",
  "Project Management",
  "Agile / Scrum",
  "Docker",
  "PostgreSQL",
  "Git & GitHub",
  "Communication & Leadership",
];

const CAREER_GOAL_OPTIONS = [
  {
    id: "Return to the same profession",
    title: "Return to Same Profession",
    description: "Continue in your previous domain with modernised tools and confidence calibration.",
    icon: Briefcase,
  },
  {
    id: "Switch careers",
    title: "Switch Careers (Pivot)",
    description: "Translate past analytical mastery into modern data, product, or cloud engineering.",
    icon: Compass,
  },
  {
    id: "Find part-time work",
    title: "Find Part-Time Work",
    description: "Secure meaningful high-impact commitments accommodating family life.",
    icon: Clock,
  },
  {
    id: "Work remotely",
    title: "Work Remotely",
    description: "Collaborate with national and international teams with full geographic flexibility.",
    icon: Sparkles,
  },
  {
    id: "Start freelancing",
    title: "Start Freelancing",
    description: "Work independently on curated client sprint deliverables and technical advisory.",
    icon: Briefcase,
  },
  {
    id: "Become an entrepreneur",
    title: "Become an Entrepreneur",
    description: "Formulate a venture, access venture grants, and lead innovative solutions.",
    icon: Sparkles,
  },
  {
    id: "Explore suitable options",
    title: "Explore Suitable Options",
    description: "Open to discovery based on preliminary AI gap assessment and mentorship feedback.",
    icon: HelpCircle,
  },
];

const BREAK_REASON_OPTIONS = [
  "Parenting & Childcare",
  "Eldercare & Family Support",
  "Health & Wellness",
  "Personal Sabbatical & Relocation",
  "Academic Upskilling & Transition",
  "Prefer Not to Say",
];

export function IntelligentOnboardingModal({
  isOpen,
  onClose,
  onSuccess,
  initialStep = 1,
}: IntelligentOnboardingModalProps) {
  const [currentStep, setCurrentStep] = useState<number>(initialStep);
  const [formData, setFormData] = useState<OnboardingFormData>(DEFAULT_FORM_DATA);
  const [newSkillInput, setNewSkillInput] = useState("");
  const [isUploadingResume, setIsUploadingResume] = useState(false);
  const [autosaveStatus, setAutosaveStatus] = useState<string>("Saved");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isSampleJourney, setIsSampleJourney] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const autosaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Restore existing draft or local storage on open
  useEffect(() => {
    if (!isOpen) return;

    async function loadDraft() {
      try {
        const draft = await api.getOnboardingDraft();
        if (draft && draft.draft_data) {
          setFormData((prev) => ({
            ...prev,
            ...(draft.draft_data as Partial<OnboardingFormData>),
          }));
          if (draft.current_step && draft.current_step >= 1 && draft.current_step <= 7) {
            setCurrentStep(draft.current_step);
          }
          setAutosaveStatus("Draft restored");
        }
      } catch (err) {
        console.warn("Unable to load cloud draft, checked local storage", err);
      }
    }

    loadDraft();
  }, [isOpen]);

  // Debounced Autosave on form changes
  const triggerAutosave = (updatedData: OnboardingFormData, stepToSave: number) => {
    setAutosaveStatus("Saving...");
    if (autosaveTimerRef.current) {
      clearTimeout(autosaveTimerRef.current);
    }

    autosaveTimerRef.current = setTimeout(async () => {
      try {
        await api.saveOnboardingDraft(stepToSave, updatedData as unknown as Record<string, unknown>);
        const now = new Date();
        const timeStr = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        setAutosaveStatus(`Saved at ${timeStr}`);
      } catch {
        setAutosaveStatus("Saved locally");
      }
    }, 600);
  };

  const updateFormData = (fields: Partial<OnboardingFormData>) => {
    setFormData((prev) => {
      const next = { ...prev, ...fields };
      triggerAutosave(next, currentStep);
      return next;
    });
    setValidationError(null);
  };

  // Preload Ananya's sample journey
  const handlePreloadSample = () => {
    setIsSampleJourney(true);
    setFormData(SAMPLE_JOURNEY_DATA);
    triggerAutosave(SAMPLE_JOURNEY_DATA, 2);
    setCurrentStep(2);
  };

  // Start fresh
  const handleStartFresh = () => {
    setIsSampleJourney(false);
    setFormData(DEFAULT_FORM_DATA);
    triggerAutosave(DEFAULT_FORM_DATA, 2);
    setCurrentStep(2);
  };

  // Handle skill adding / removing
  const handleAddSkill = (skill: string) => {
    const trimmed = skill.trim();
    if (!trimmed) return;
    if (!formData.existing_skills.includes(trimmed)) {
      updateFormData({ existing_skills: [...formData.existing_skills, trimmed] });
    }
    setNewSkillInput("");
  };

  const handleRemoveSkill = (skill: string) => {
    updateFormData({
      existing_skills: formData.existing_skills.filter((s) => s !== skill),
    });
  };

  // Handle goals toggling
  const handleToggleGoal = (goalId: string) => {
    const exists = formData.career_goals.includes(goalId);
    let nextGoals: string[];
    if (exists) {
      nextGoals = formData.career_goals.filter((g) => g !== goalId);
    } else {
      nextGoals = [...formData.career_goals, goalId];
    }
    updateFormData({ career_goals: nextGoals });
  };

  // Handle resume upload
  const handleFileUpload = async (file: File) => {
    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".pdf") && file.type !== "application/pdf") {
      setValidationError("Resume must be in PDF format.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setValidationError("File exceeds maximum allowed limit of 5 MB.");
      return;
    }

    setIsUploadingResume(true);
    setValidationError(null);

    try {
      const uploadRes = await api.uploadResume(file);
      updateFormData({
        resume_url: uploadRes.url,
        resume_filename: uploadRes.filename || file.name,
        resume_size: uploadRes.size_bytes || file.size,
      });
      setAutosaveStatus("Resume attached safely");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Upload failed";
      setValidationError(message);
    } finally {
      setIsUploadingResume(false);
    }
  };

  // Validate current step before advancing
  const validateStep = (step: number): boolean => {
    if (step === 2) {
      if (!formData.previous_job_title.trim()) {
        setValidationError("Please enter your previous job title.");
        return false;
      }
      if (formData.existing_skills.length === 0) {
        setValidationError("Please select or add at least one existing skill.");
        return false;
      }
    }
    if (step === 4) {
      if (formData.career_goals.length === 0) {
        setValidationError("Please choose at least one career goal.");
        return false;
      }
    }
    setValidationError(null);
    return true;
  };

  const handleNext = () => {
    if (!validateStep(currentStep)) return;
    const nextStep = Math.min(7, currentStep + 1);
    setCurrentStep(nextStep);
    triggerAutosave(formData, nextStep);
  };

  const handleBack = () => {
    const prevStep = Math.max(1, currentStep - 1);
    setCurrentStep(prevStep);
    triggerAutosave(formData, prevStep);
  };

  const handleJumpToStep = (targetStep: number) => {
    if (targetStep >= 1 && targetStep <= 7) {
      setCurrentStep(targetStep);
      triggerAutosave(formData, targetStep);
    }
  };

  // Final submission and profile activation
  const handleComplete = async () => {
    setIsSubmitting(true);
    setValidationError(null);

    try {
      const payload = {
        previous_job_title: formData.previous_job_title,
        industry: formData.industry,
        experience_years: Number(formData.experience_years) || 0,
        qualifications: formData.qualifications,
        existing_skills: formData.existing_skills,
        career_break_start_date: formData.career_break_start_date || null,
        career_break_end_date: formData.career_break_end_date || null,
        currently_on_break: formData.currently_on_break,
        career_break_reason: formData.career_break_reason || null,
        career_goals: formData.career_goals,
        weekly_learning_hours: Number(formData.weekly_learning_hours) || 15,
        preferred_work_mode: formData.preferred_work_mode,
        preferred_location: formData.preferred_location,
        language_preference: formData.language_preference,
        salary_expectation: formData.salary_expectation,
        profile_visibility: formData.profile_visibility,
        opt_into_employer_sharing: formData.opt_into_employer_sharing,
        resume_url: formData.resume_url,
      };

      const result = await api.completeOnboarding(payload);
      setIsCompleted(true);
      onSuccess(result);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to complete onboarding.";
      setValidationError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Clear draft & restart
  const handleClearDraft = async () => {
    if (confirm("Reset onboarding progress? All entered fields will be cleared.")) {
      await api.clearOnboardingDraft();
      setFormData(DEFAULT_FORM_DATA);
      setCurrentStep(1);
      setAutosaveStatus("Draft cleared");
    }
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#111111]/85 backdrop-blur-md overflow-y-auto animate-fadeIn"
    >
      <div className="relative w-full max-w-4xl bg-[#181818] border border-[#D8C2A6]/20 rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden text-[#F1E7DB]">
        {/* TOP STATUS BAR: Progress, Autosave, and Controls */}
        <div className="px-6 py-4 border-b border-[#D8C2A6]/10 flex flex-wrap items-center justify-between gap-3 bg-[#141414]">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-[#A56F7C] animate-pulse" />
            <div>
              <span className="micro-label text-[10px] text-[#A56F7C] block">
                02 / INTELLIGENT ONBOARDING // GFG
              </span>
              <h2 id="onboarding-modal-title" className="text-xs uppercase tracking-widest font-mono text-[#D8C2A6]">
                Step {currentStep} of 7:{" "}
                {currentStep === 1 && "Welcome & Explore"}
                {currentStep === 2 && "Professional Background"}
                {currentStep === 3 && "Career Break & Context"}
                {currentStep === 4 && "Career Goals"}
                {currentStep === 5 && "Availability & Preferences"}
                {currentStep === 6 && "AI Career Synthesis"}
                {currentStep === 7 && "Review & Consent"}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs">
            {/* Autosave status badge */}
            <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#111111] border border-[#D8C2A6]/15 text-[11px] font-mono text-[#9A9A9A]">
              <BookmarkCheck className="w-3 h-3 text-[#D8C2A6]" />
              <span>{autosaveStatus}</span>
            </div>

            {/* Save & Resume Later button */}
            <button
              type="button"
              onClick={() => {
                triggerAutosave(formData, currentStep);
                onClose();
              }}
              title="Your progress is preserved in draft"
              className="text-xs font-mono uppercase tracking-wider text-[#D8C2A6] hover:text-[#F1E7DB] px-3 py-1.5 rounded-lg border border-[#D8C2A6]/20 hover:border-[#D8C2A6]/50 transition-colors"
            >
              Save & Resume
            </button>

            {/* Close button */}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#9A9A9A] hover:text-[#F1E7DB] hover:bg-white/5 transition-colors"
              aria-label="Close Onboarding"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* STEP PROGRESS INDICATOR STRIP */}
        <div className="px-6 py-2 bg-[#161616] border-b border-[#D8C2A6]/10 flex items-center justify-between overflow-x-auto scrollbar-none gap-2">
          {[
            { step: 1, label: "Welcome" },
            { step: 2, label: "Background" },
            { step: 3, label: "Break" },
            { step: 4, label: "Goals" },
            { step: 5, label: "Availability" },
            { step: 6, label: "AI Plan" },
            { step: 7, label: "Consent" },
          ].map((item) => {
            const isDone = item.step < currentStep;
            const isCurrent = item.step === currentStep;
            return (
              <button
                key={item.step}
                type="button"
                onClick={() => handleJumpToStep(item.step)}
                disabled={item.step > currentStep + 1}
                className={`flex items-center gap-1.5 text-[11px] font-mono tracking-wider py-1 px-2 rounded-md transition-all shrink-0 ${
                  isCurrent
                    ? "bg-[#D8C2A6] text-[#111111] font-semibold"
                    : isDone
                    ? "text-[#D8C2A6] hover:bg-white/5"
                    : "text-[#666666] cursor-not-allowed"
                }`}
              >
                <span
                  className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] ${
                    isDone
                      ? "bg-[#A56F7C] text-white"
                      : isCurrent
                      ? "bg-[#111111] text-[#D8C2A6]"
                      : "bg-[#252525] text-[#888888]"
                  }`}
                >
                  {isDone ? <Check className="w-2.5 h-2.5" /> : item.step}
                </span>
                <span className="hidden md:inline">{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* ERROR NOTIFICATION BANNER */}
        {validationError && (
          <div className="px-6 py-2.5 bg-red-950/60 border-b border-red-500/30 text-red-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{validationError}</span>
          </div>
        )}

        {/* MAIN BODY SCROLLABLE CONTENT */}
        <div className="p-6 md:p-8 overflow-y-auto flex-1 space-y-6">
          {/* ================= STEP 1: WELCOME & EXPLORE ================= */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="max-w-2xl space-y-3">
                <span className="micro-label text-[#A56F7C]">INCLUSIVE ONBOARDING JOURNEY</span>
                <h1 className="text-3xl md:text-4xl font-serif text-[#F1E7DB] leading-tight">
                  &ldquo;Your experience still matters. Let&apos;s build what comes next.&rdquo;
                </h1>
                <p className="text-sm md:text-base text-[#D8C2A6]/90 leading-relaxed font-light">
                  Career breaks are periods of real-life leadership, not deficits. Whether you paused
                  for maternity, family care, personal health, or relocation, GFG helps you rebuild
                  relevant skills, regain momentum, and re-enter meaningful work without stigma.
                </p>
              </div>

              {/* Two Primary Options: Start Fresh vs Explore Sample */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <button
                  type="button"
                  onClick={handleStartFresh}
                  className="p-6 rounded-xl border border-[#D8C2A6]/30 bg-[#141414] hover:bg-[#1a1a1a] hover:border-[#D8C2A6] text-left transition-all group flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono uppercase text-[#A56F7C] tracking-widest">
                        PATHWAY A // FRESH PROFILE
                      </span>
                      <ArrowRight className="w-4 h-4 text-[#D8C2A6] group-hover:translate-x-1 transition-transform" />
                    </div>
                    <div className="text-lg font-serif text-[#F1E7DB]">Start Fresh Onboarding</div>
                    <p className="text-xs text-[#9A9A9A] leading-relaxed">
                      Enter your past background, break timeframe, and weekly learning availability
                      to generate your bespoke career comeback plan.
                    </p>
                  </div>
                  <div className="pt-4 text-[11px] font-mono text-[#D8C2A6]">
                    Estimated: 3-4 minutes • Fully private
                  </div>
                </button>

                <button
                  type="button"
                  onClick={handlePreloadSample}
                  className="p-6 rounded-xl border border-[#A56F7C]/40 bg-gradient-to-br from-[#1a1518] to-[#141414] hover:border-[#A56F7C] text-left transition-all group flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono uppercase text-[#D8C2A6] tracking-widest">
                        PATHWAY B // SAMPLE EXPLORATION
                      </span>
                      <Sparkles className="w-4 h-4 text-[#A56F7C] group-hover:scale-110 transition-transform" />
                    </div>
                    <div className="text-lg font-serif text-[#F1E7DB]">Explore Sample Journey</div>
                    <p className="text-xs text-[#D8C2A6]/80 leading-relaxed">
                      Preload Ananya Raman&apos;s verified Data Analyst profile to explore the full
                      7-step journey, AI skill gap analysis, and Career Passport immediately.
                    </p>
                  </div>
                  <div className="pt-4 text-[11px] font-mono text-[#A56F7C]">
                    Instant preview • Pre-populated data
                  </div>
                </button>
              </div>

              {/* Privacy and Non-Stigma Guarantee Box */}
              <div className="p-4 rounded-xl bg-[#111111] border border-[#D8C2A6]/10 flex items-start gap-3.5">
                <Shield className="w-5 h-5 text-[#A56F7C] shrink-0 mt-0.5" />
                <div className="space-y-1 text-xs">
                  <div className="font-semibold text-[#F1E7DB] uppercase tracking-wider text-[11px]">
                    Zero-Stigma & Privacy Guarantee
                  </div>
                  <p className="text-[#9A9A9A] leading-relaxed">
                    GFG only gathers information required to personalize recommendations. We never
                    inquire into medical, pregnancy, or personal family details. Your career-break
                    reason is strictly confidential and private by default.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ================= STEP 2: PROFESSIONAL BACKGROUND ================= */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="space-y-1">
                <span className="micro-label text-[#A56F7C]">STEP 02 / FOUNDATION</span>
                <h3 className="text-xl md:text-2xl font-serif text-[#F1E7DB]">
                  Tell us about your professional background
                </h3>
                <p className="text-xs text-[#9A9A9A]">
                  We anchor your comeback plan on your prior mastery and existing strengths.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Previous Job Title */}
                <div className="space-y-1.5">
                  <label className="text-xs font-mono uppercase tracking-wider text-[#D8C2A6]">
                    Previous Job Title <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.previous_job_title}
                    onChange={(e) => updateFormData({ previous_job_title: e.target.value })}
                    placeholder="e.g. Senior Software Engineer / Data Analyst"
                    className="w-full px-4 py-2.5 rounded-lg bg-[#111111] border border-[#D8C2A6]/20 text-[#F1E7DB] placeholder-[#666666] text-sm focus:border-[#D8C2A6] focus:outline-none transition-colors"
                  />
                </div>

                {/* Industry */}
                <div className="space-y-1.5">
                  <label className="text-xs font-mono uppercase tracking-wider text-[#D8C2A6]">
                    Industry / Sector
                  </label>
                  <select
                    value={formData.industry}
                    onChange={(e) => updateFormData({ industry: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-lg bg-[#111111] border border-[#D8C2A6]/20 text-[#F1E7DB] text-sm focus:border-[#D8C2A6] focus:outline-none transition-colors"
                  >
                    <option value="Technology & Software">Technology & Software</option>
                    <option value="Banking & FinTech">Banking & Financial Services</option>
                    <option value="Healthcare & Life Sciences">Healthcare & Life Sciences</option>
                    <option value="E-Commerce & Retail">E-Commerce & Retail</option>
                    <option value="Consulting & Strategy">Consulting & Professional Services</option>
                    <option value="Education & EdTech">Education & EdTech</option>
                    <option value="Media & Design">Media, Communications & Design</option>
                    <option value="Other">Other Sector</option>
                  </select>
                </div>

                {/* Experience Years */}
                <div className="space-y-1.5">
                  <label className="text-xs font-mono uppercase tracking-wider text-[#D8C2A6]">
                    Prior Experience (Years)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      max="30"
                      value={formData.experience_years}
                      onChange={(e) => updateFormData({ experience_years: parseFloat(e.target.value) || 0 })}
                      className="w-24 px-3 py-2 rounded-lg bg-[#111111] border border-[#D8C2A6]/20 text-[#F1E7DB] text-sm focus:border-[#D8C2A6] focus:outline-none"
                    />
                    <div className="flex gap-1.5">
                      {[2, 4.5, 7, 10].map((yr) => (
                        <button
                          key={yr}
                          type="button"
                          onClick={() => updateFormData({ experience_years: yr })}
                          className={`text-xs px-2.5 py-1 rounded border font-mono transition-colors ${
                            formData.experience_years === yr
                              ? "bg-[#D8C2A6] text-[#111111] border-[#D8C2A6]"
                              : "border-[#D8C2A6]/20 text-[#9A9A9A] hover:text-[#F1E7DB]"
                          }`}
                        >
                          {yr}y
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Qualifications */}
                <div className="space-y-1.5">
                  <label className="text-xs font-mono uppercase tracking-wider text-[#D8C2A6]">
                    Highest Qualification
                  </label>
                  <input
                    type="text"
                    value={formData.qualifications}
                    onChange={(e) => updateFormData({ qualifications: e.target.value })}
                    placeholder="e.g. B.Tech Computer Science / MBA"
                    className="w-full px-4 py-2.5 rounded-lg bg-[#111111] border border-[#D8C2A6]/20 text-[#F1E7DB] placeholder-[#666666] text-sm focus:border-[#D8C2A6] focus:outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Existing Skills Selector */}
              <div className="space-y-2 pt-2">
                <label className="text-xs font-mono uppercase tracking-wider text-[#D8C2A6] flex items-center justify-between">
                  <span>
                    Existing Skills <span className="text-rose-400">*</span>
                  </span>
                  <span className="text-[10px] text-[#9A9A9A]">{formData.existing_skills.length} selected</span>
                </label>

                {/* Active Skill Chips */}
                <div className="flex flex-wrap gap-2 min-h-[38px] p-2.5 rounded-lg bg-[#111111] border border-[#D8C2A6]/20">
                  {formData.existing_skills.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#181818] border border-[#D8C2A6]/40 text-xs text-[#F1E7DB] font-mono"
                    >
                      <span>{skill}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(skill)}
                        className="text-[#9A9A9A] hover:text-rose-300"
                        aria-label={`Remove ${skill}`}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}

                  {/* Add skill input */}
                  <input
                    type="text"
                    value={newSkillInput}
                    onChange={(e) => setNewSkillInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddSkill(newSkillInput);
                      }
                    }}
                    placeholder="+ Type and press enter..."
                    className="bg-transparent text-xs text-[#F1E7DB] placeholder-[#666666] focus:outline-none min-w-[140px] px-2 py-1"
                  />
                </div>

                {/* Suggested Skill Quick-Pills */}
                <div className="space-y-1 pt-1">
                  <span className="text-[10px] font-mono text-[#9A9A9A] uppercase tracking-wider">
                    Quick suggestions:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {SUGGESTED_SKILLS.map((s) => {
                      const isAdded = formData.existing_skills.includes(s);
                      return (
                        <button
                          key={s}
                          type="button"
                          onClick={() => (isAdded ? handleRemoveSkill(s) : handleAddSkill(s))}
                          className={`text-[11px] font-mono px-2 py-0.5 rounded border transition-colors ${
                            isAdded
                              ? "bg-[#D8C2A6]/20 border-[#D8C2A6] text-[#D8C2A6]"
                              : "border-[#D8C2A6]/15 text-[#888888] hover:text-[#F1E7DB] hover:border-[#D8C2A6]/40"
                          }`}
                        >
                          {isAdded ? "✓ " : "+ "}
                          {s}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Optional Resume Upload */}
              <div className="space-y-2 pt-2 border-t border-[#D8C2A6]/10">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-mono uppercase tracking-wider text-[#D8C2A6]">
                    Optional Resume Upload
                  </label>
                  <span className="text-[10px] font-mono text-[#9A9A9A]">PDF only • Max 5 MB</span>
                </div>

                {formData.resume_filename ? (
                  <div className="p-3 rounded-xl bg-[#141414] border border-[#D8C2A6]/30 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-[#A56F7C]" />
                      <div className="text-xs font-mono">
                        <div className="text-[#F1E7DB] font-medium">{formData.resume_filename}</div>
                        <div className="text-[#9A9A9A] text-[10px]">
                          Protected non-public storage •{" "}
                          {formData.resume_size ? `${Math.round(formData.resume_size / 1024)} KB` : "Uploaded"}
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        updateFormData({
                          resume_url: undefined,
                          resume_filename: undefined,
                          resume_size: undefined,
                        })
                      }
                      className="p-1.5 rounded-lg text-rose-300 hover:bg-rose-950/40 text-xs"
                      title="Remove resume"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="p-5 rounded-xl border border-dashed border-[#D8C2A6]/25 hover:border-[#D8C2A6] bg-[#141414] text-center cursor-pointer transition-colors group"
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,application/pdf"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(file);
                      }}
                      className="hidden"
                    />
                    <Upload className="w-5 h-5 mx-auto text-[#D8C2A6] group-hover:scale-110 transition-transform mb-1.5" />
                    <div className="text-xs font-medium text-[#F1E7DB]">
                      {isUploadingResume ? "Uploading & securing..." : "Click or drag & drop resume PDF"}
                    </div>
                    <div className="text-[11px] text-[#888888] font-light mt-0.5">
                      Protected non-public storage. Never published or scraped.
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ================= STEP 3: CAREER BREAK & CONTEXT ================= */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="space-y-1">
                <span className="micro-label text-[#A56F7C]">STEP 03 / RESPECT & CONTEXT</span>
                <h3 className="text-xl md:text-2xl font-serif text-[#F1E7DB]">
                  Career Break & Transition Window
                </h3>
                <p className="text-xs text-[#9A9A9A]">
                  Help us understand your timeline. All reason details are optional and private by default.
                </p>
              </div>

              {/* PRIVACY MANDATE BOX */}
              <div className="p-4 rounded-xl bg-[#111111] border border-[#A56F7C]/30 flex items-start gap-3">
                <Lock className="w-4 h-4 text-[#A56F7C] shrink-0 mt-0.5" />
                <div className="space-y-1 text-xs">
                  <div className="text-[#F1E7DB] font-medium font-mono text-[11px] uppercase">
                    &ldquo;Your career-break reason is optional and private by default.&rdquo;
                  </div>
                  <p className="text-[#9A9A9A] leading-relaxed">
                    GFG does not require medical, pregnancy, family, or caregiving details. This
                    information is used solely to calibrate your pacing and is NEVER exposed to
                    employers unless you explicitly authorize it.
                  </p>
                </div>
              </div>

              {/* Break Dates & Toggle */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-mono uppercase tracking-wider text-[#D8C2A6]">
                    Break Start Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={formData.career_break_start_date}
                    onChange={(e) => updateFormData({ career_break_start_date: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-lg bg-[#111111] border border-[#D8C2A6]/20 text-[#F1E7DB] text-sm focus:border-[#D8C2A6] focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono uppercase tracking-wider text-[#D8C2A6]">
                    Break End Date / Target Return
                  </label>
                  <input
                    type="date"
                    disabled={formData.currently_on_break}
                    value={formData.currently_on_break ? "" : formData.career_break_end_date}
                    onChange={(e) => updateFormData({ career_break_end_date: e.target.value })}
                    placeholder={formData.currently_on_break ? "Currently on Break" : ""}
                    className={`w-full px-4 py-2.5 rounded-lg bg-[#111111] border border-[#D8C2A6]/20 text-[#F1E7DB] text-sm focus:border-[#D8C2A6] focus:outline-none ${
                      formData.currently_on_break ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  />
                </div>
              </div>

              {/* Currently on break toggle */}
              <div className="flex items-center gap-3 p-3 rounded-lg bg-[#141414] border border-[#D8C2A6]/15">
                <input
                  type="checkbox"
                  id="currently_on_break_check"
                  checked={formData.currently_on_break}
                  onChange={(e) => updateFormData({ currently_on_break: e.target.checked })}
                  className="w-4 h-4 rounded text-[#A56F7C] accent-[#A56F7C] cursor-pointer"
                />
                <label
                  htmlFor="currently_on_break_check"
                  className="text-xs font-mono text-[#F1E7DB] cursor-pointer"
                >
                  I am currently on a career break and actively preparing for my return.
                </label>
              </div>

              {/* Optional Break Reason */}
              <div className="space-y-2 pt-2">
                <label className="text-xs font-mono uppercase tracking-wider text-[#D8C2A6]">
                  Optional Career-Break Category (Private by default)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {BREAK_REASON_OPTIONS.map((reason) => {
                    const isSelected = formData.career_break_reason === reason;
                    return (
                      <button
                        key={reason}
                        type="button"
                        onClick={() =>
                          updateFormData({
                            career_break_reason: isSelected ? "" : reason,
                          })
                        }
                        className={`p-3 rounded-lg border text-left text-xs font-mono transition-all ${
                          isSelected
                            ? "bg-[#D8C2A6]/15 border-[#D8C2A6] text-[#F1E7DB] font-semibold"
                            : "border-[#D8C2A6]/15 bg-[#141414] text-[#888888] hover:text-[#F1E7DB] hover:border-[#D8C2A6]/30"
                        }`}
                      >
                        {isSelected ? "✓ " : ""}
                        {reason}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Optional Custom Note */}
              <div className="space-y-1.5 pt-1">
                <label className="text-xs font-mono uppercase tracking-wider text-[#D8C2A6]">
                  Optional Personal Notes (Only visible to you)
                </label>
                <textarea
                  rows={2}
                  value={formData.custom_break_notes}
                  onChange={(e) => updateFormData({ custom_break_notes: e.target.value })}
                  placeholder="Any context you want to track for your personal comeback journey..."
                  className="w-full px-4 py-2.5 rounded-lg bg-[#111111] border border-[#D8C2A6]/20 text-[#F1E7DB] placeholder-[#555555] text-xs focus:border-[#D8C2A6] focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* ================= STEP 4: CAREER GOALS ================= */}
          {currentStep === 4 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="space-y-1">
                <span className="micro-label text-[#A56F7C]">STEP 04 / ASPIRATION</span>
                <h3 className="text-xl md:text-2xl font-serif text-[#F1E7DB]">
                  What are your comeback career goals?
                </h3>
                <p className="text-xs text-[#9A9A9A]">
                  Select all that align with your next chapter. You can update these anytime.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {CAREER_GOAL_OPTIONS.map((goal) => {
                  const isSelected = formData.career_goals.includes(goal.id);
                  const Icon = goal.icon;
                  return (
                    <button
                      key={goal.id}
                      type="button"
                      onClick={() => handleToggleGoal(goal.id)}
                      className={`p-4 rounded-xl border text-left transition-all flex flex-col justify-between gap-2 group ${
                        isSelected
                          ? "bg-[#D8C2A6]/10 border-[#D8C2A6] shadow-sm"
                          : "bg-[#141414] border-[#D8C2A6]/15 hover:border-[#D8C2A6]/35"
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-2">
                          <Icon
                            className={`w-4 h-4 ${isSelected ? "text-[#D8C2A6]" : "text-[#888888]"}`}
                          />
                          <span
                            className={`text-xs font-mono uppercase tracking-wider font-semibold ${
                              isSelected ? "text-[#F1E7DB]" : "text-[#D8C2A6]"
                            }`}
                          >
                            {goal.title}
                          </span>
                        </div>
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
                            isSelected
                              ? "bg-[#D8C2A6] border-[#D8C2A6] text-[#111111]"
                              : "border-[#D8C2A6]/30 text-transparent"
                          }`}
                        >
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </div>
                      </div>
                      <p className="text-xs text-[#9A9A9A] leading-relaxed font-light">
                        {goal.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ================= STEP 5: AVAILABILITY & PREFERENCES ================= */}
          {currentStep === 5 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="space-y-1">
                <span className="micro-label text-[#A56F7C]">STEP 05 / PACING & PREFERENCES</span>
                <h3 className="text-xl md:text-2xl font-serif text-[#F1E7DB]">
                  Define your learning availability and work arrangements
                </h3>
                <p className="text-xs text-[#9A9A9A]">
                  We structure your 8-week roadmap around your real schedule, not arbitrary deadlines.
                </p>
              </div>

              {/* Weekly Learning Hours Slider */}
              <div className="p-5 rounded-xl bg-[#141414] border border-[#D8C2A6]/20 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-xs font-mono uppercase tracking-wider text-[#D8C2A6] block">
                      Weekly Learning Commitment
                    </label>
                    <span className="text-[11px] text-[#9A9A9A]">
                      Hours per week for self-paced modules and capstone projects
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-serif text-[#D8C2A6]">
                      {formData.weekly_learning_hours}
                    </span>
                    <span className="text-xs font-mono text-[#9A9A9A] ml-1">HRS / WK</span>
                  </div>
                </div>

                <input
                  type="range"
                  min="5"
                  max="40"
                  step="1"
                  value={formData.weekly_learning_hours}
                  onChange={(e) =>
                    updateFormData({ weekly_learning_hours: parseInt(e.target.value) || 15 })
                  }
                  className="w-full h-1.5 bg-[#252525] rounded-lg appearance-none cursor-pointer accent-[#D8C2A6]"
                />

                <div className="flex justify-between text-[10px] font-mono text-[#888888]">
                  <span>5h (Gentle Refresh)</span>
                  <span className="text-[#D8C2A6]">15-20h (Recommended Returnship Pace)</span>
                  <span>40h (Intensive)</span>
                </div>
              </div>

              {/* Work Arrangement & Location */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Work Mode */}
                <div className="space-y-1.5">
                  <label className="text-xs font-mono uppercase tracking-wider text-[#D8C2A6]">
                    Preferred Work Arrangement
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: "remote", label: "Remote Only" },
                      { id: "hybrid", label: "Hybrid" },
                      { id: "onsite", label: "Onsite" },
                      { id: "flexible", label: "Flexible" },
                    ].map((mode) => (
                      <button
                        key={mode.id}
                        type="button"
                        onClick={() => updateFormData({ preferred_work_mode: mode.id })}
                        className={`p-2.5 rounded-lg border text-xs font-mono text-center transition-all ${
                          formData.preferred_work_mode === mode.id
                            ? "bg-[#D8C2A6] text-[#111111] font-semibold border-[#D8C2A6]"
                            : "border-[#D8C2A6]/15 bg-[#111111] text-[#9A9A9A] hover:text-[#F1E7DB]"
                        }`}
                      >
                        {mode.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Preferred Location */}
                <div className="space-y-1.5">
                  <label className="text-xs font-mono uppercase tracking-wider text-[#D8C2A6]">
                    Preferred Metro / Location
                  </label>
                  <input
                    type="text"
                    value={formData.preferred_location}
                    onChange={(e) => updateFormData({ preferred_location: e.target.value })}
                    placeholder="e.g. Bengaluru, IN or Remote India"
                    className="w-full px-4 py-2.5 rounded-lg bg-[#111111] border border-[#D8C2A6]/20 text-[#F1E7DB] text-sm focus:border-[#D8C2A6] focus:outline-none"
                  />
                </div>

                {/* Language Preference */}
                <div className="space-y-1.5">
                  <label className="text-xs font-mono uppercase tracking-wider text-[#D8C2A6]">
                    Primary Language
                  </label>
                  <select
                    value={formData.language_preference}
                    onChange={(e) => updateFormData({ language_preference: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-lg bg-[#111111] border border-[#D8C2A6]/20 text-[#F1E7DB] text-sm focus:border-[#D8C2A6] focus:outline-none"
                  >
                    <option value="English">English</option>
                    <option value="Hindi">Hindi</option>
                    <option value="Tamil">Tamil</option>
                    <option value="Telugu">Telugu</option>
                    <option value="Kannada">Kannada</option>
                    <option value="Bengali">Bengali</option>
                  </select>
                </div>

                {/* Salary Expectation */}
                <div className="space-y-1.5">
                  <label className="text-xs font-mono uppercase tracking-wider text-[#D8C2A6]">
                    Optional Target Compensation
                  </label>
                  <input
                    type="text"
                    value={formData.salary_expectation}
                    onChange={(e) => updateFormData({ salary_expectation: e.target.value })}
                    placeholder="e.g. ₹12,00,000 - ₹16,00,000 / yr"
                    className="w-full px-4 py-2.5 rounded-lg bg-[#111111] border border-[#D8C2A6]/20 text-[#F1E7DB] text-sm focus:border-[#D8C2A6] focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ================= STEP 6: PERSONALIZATION (AI SYNTHESIS) ================= */}
          {currentStep === 6 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="space-y-1">
                <span className="micro-label text-[#A56F7C]">STEP 06 / INTELLIGENCE SYNTHESIS</span>
                <h3 className="text-xl md:text-2xl font-serif text-[#F1E7DB]">
                  Your Preliminary Career Plan & Roadmap
                </h3>
                <p className="text-xs text-[#9A9A9A]">
                  Synthesized in real-time based on your {formData.experience_years} years of prior
                  tenure and {formData.weekly_learning_hours} hrs/week availability.
                </p>
              </div>

              {/* Dynamic Career Profile Summary */}
              <div className="p-5 rounded-xl bg-gradient-to-br from-[#1a1518] to-[#141414] border border-[#A56F7C]/30 space-y-2">
                <div className="flex items-center gap-2 text-xs font-mono text-[#A56F7C] uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>AI Career Synthesis</span>
                </div>
                <p className="text-sm text-[#F1E7DB] leading-relaxed font-light">
                  &ldquo;Returning as a {formData.previous_job_title || "Technical Professional"} with{" "}
                  {formData.experience_years} years of proven industry depth in {formData.industry}.
                  Targeting {formData.preferred_work_mode} arrangements in {formData.preferred_location}.
                  Your prior foundation in {formData.existing_skills.slice(0, 3).join(", ")} provides
                  an accelerated re-entry trajectory.&rdquo;
                </p>
              </div>

              {/* Skill Gap & Strengths */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-[#141414] border border-[#D8C2A6]/15 space-y-2">
                  <div className="text-xs font-mono uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Verified Core Strengths</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {formData.existing_skills.map((s) => (
                      <span
                        key={s}
                        className="text-xs font-mono px-2.5 py-1 rounded-md bg-[#181818] border border-emerald-500/20 text-emerald-200"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#141414] border border-[#D8C2A6]/15 space-y-2">
                  <div className="text-xs font-mono uppercase tracking-wider text-[#D8C2A6] flex items-center gap-1.5">
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Recommended Refreshers</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {["Modern BI Toolchains", "Cloud Warehousing", "Collaborative Git Pipelines"].map(
                      (s) => (
                        <span
                          key={s}
                          className="text-xs font-mono px-2.5 py-1 rounded-md bg-[#181818] border border-[#D8C2A6]/20 text-[#D8C2A6]"
                        >
                          {s}
                        </span>
                      )
                    )}
                  </div>
                </div>
              </div>

              {/* Initial Career Passport Draft Card */}
              <div className="p-5 rounded-xl bg-[#111111] border border-[#D8C2A6]/20 space-y-3">
                <div className="flex items-center justify-between border-b border-[#D8C2A6]/10 pb-2">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-[#A56F7C]" />
                    <span className="text-xs font-mono uppercase tracking-widest text-[#F1E7DB]">
                      Initial Career Passport Draft
                    </span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#181818] text-[#D8C2A6] border border-[#D8C2A6]/20">
                    READINESS INDEX: 84%
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                  <div>
                    <span className="text-[#888888] block text-[10px]">PRE-BREAK TENURE</span>
                    <span className="text-[#F1E7DB]">{formData.experience_years} Years</span>
                  </div>
                  <div>
                    <span className="text-[#888888] block text-[10px]">TARGET PATHWAY</span>
                    <span className="text-[#F1E7DB]">{formData.previous_job_title}</span>
                  </div>
                  <div>
                    <span className="text-[#888888] block text-[10px]">WEEKLY PACING</span>
                    <span className="text-[#F1E7DB]">{formData.weekly_learning_hours} Hours/Wk</span>
                  </div>
                  <div>
                    <span className="text-[#888888] block text-[10px]">VISIBILITY</span>
                    <span className="text-[#D8C2A6] uppercase">{formData.profile_visibility}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================= STEP 7: REVIEW AND CONSENT ================= */}
          {currentStep === 7 && !isCompleted && (
            <div className="space-y-6 animate-fadeIn">
              <div className="space-y-1">
                <span className="micro-label text-[#A56F7C]">STEP 07 / REVIEW & AUTONOMY</span>
                <h3 className="text-xl md:text-2xl font-serif text-[#F1E7DB]">
                  Review details and configure your privacy controls
                </h3>
                <p className="text-xs text-[#9A9A9A]">
                  You have full ownership of your data. Edit any entry or adjust visibility below.
                </p>
              </div>

              {/* Review Table with Quick Jump-Edit Links */}
              <div className="divide-y divide-[#D8C2A6]/10 rounded-xl bg-[#141414] border border-[#D8C2A6]/15 overflow-hidden text-xs">
                {/* Background */}
                <div className="p-3.5 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="font-mono text-[#888888] text-[10px] uppercase">
                      Background
                    </span>
                    <div className="text-[#F1E7DB] font-medium">
                      {formData.previous_job_title} • {formData.experience_years} yrs in{" "}
                      {formData.industry}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleJumpToStep(2)}
                    className="font-mono text-[11px] text-[#D8C2A6] hover:underline"
                  >
                    Edit
                  </button>
                </div>

                {/* Skills */}
                <div className="p-3.5 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="font-mono text-[#888888] text-[10px] uppercase">Skills</span>
                    <div className="text-[#F1E7DB]">{formData.existing_skills.join(", ")}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleJumpToStep(2)}
                    className="font-mono text-[11px] text-[#D8C2A6] hover:underline"
                  >
                    Edit
                  </button>
                </div>

                {/* Career Break */}
                <div className="p-3.5 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="font-mono text-[#888888] text-[10px] uppercase">
                      Career Break Context
                    </span>
                    <div className="text-[#F1E7DB]">
                      {formData.currently_on_break ? "Currently on Break" : "Past Break"} •{" "}
                      {formData.career_break_reason || "Reason Kept Private"}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleJumpToStep(3)}
                    className="font-mono text-[11px] text-[#D8C2A6] hover:underline"
                  >
                    Edit
                  </button>
                </div>

                {/* Goals & Pacing */}
                <div className="p-3.5 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="font-mono text-[#888888] text-[10px] uppercase">
                      Goals & Availability
                    </span>
                    <div className="text-[#F1E7DB]">
                      {formData.career_goals.join(", ")} • {formData.weekly_learning_hours} hrs/wk •{" "}
                      {formData.preferred_work_mode} in {formData.preferred_location}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleJumpToStep(4)}
                    className="font-mono text-[11px] text-[#D8C2A6] hover:underline"
                  >
                    Edit
                  </button>
                </div>
              </div>

              {/* Profile Visibility Selector */}
              <div className="space-y-2 pt-2">
                <label className="text-xs font-mono uppercase tracking-wider text-[#D8C2A6] flex items-center gap-2">
                  <Eye className="w-3.5 h-3.5" />
                  <span>Profile Visibility</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {[
                    {
                      id: "private",
                      title: "Private (Default)",
                      desc: "Visible only to you and assigned mentors.",
                    },
                    {
                      id: "employers",
                      title: "Vetted Employers",
                      desc: "Discoverable by approved returnship sponsors.",
                    },
                    {
                      id: "public",
                      title: "Platform Wide",
                      desc: "Visible across community directory.",
                    },
                  ].map((vis) => (
                    <button
                      key={vis.id}
                      type="button"
                      onClick={() =>
                        updateFormData({
                          profile_visibility: vis.id as "private" | "employers" | "public",
                        })
                      }
                      className={`p-3 rounded-lg border text-left transition-all ${
                        formData.profile_visibility === vis.id
                          ? "bg-[#D8C2A6]/15 border-[#D8C2A6] text-[#F1E7DB]"
                          : "border-[#D8C2A6]/15 bg-[#141414] text-[#888888] hover:text-[#F1E7DB]"
                      }`}
                    >
                      <div className="text-xs font-mono font-semibold">{vis.title}</div>
                      <div className="text-[10px] text-[#9A9A9A] mt-0.5">{vis.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* AI Transparency Disclosure */}
              <div className="p-4 rounded-xl bg-[#111111] border border-[#D8C2A6]/15 space-y-1.5 text-xs">
                <div className="font-semibold text-[#F1E7DB] uppercase tracking-wider text-[11px] font-mono flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-[#A56F7C]" />
                  <span>Ethical AI Disclosure & Transparency</span>
                </div>
                <p className="text-[#9A9A9A] leading-relaxed">
                  GFG uses machine learning models to synthesize skill refreshes and returnship
                  compatibility. Your career break duration or reason is NEVER used for negative
                  scoring, algorithmic penalization, or discriminatory filtering.
                </p>
              </div>

              {/* Separate Employer Sharing Opt-In Checkbox */}
              <div className="p-4 rounded-xl bg-[#141414] border border-[#D8C2A6]/20 space-y-2">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="employer_sharing_optin"
                    checked={formData.opt_into_employer_sharing}
                    onChange={(e) => updateFormData({ opt_into_employer_sharing: e.target.checked })}
                    className="w-4 h-4 rounded text-[#A56F7C] accent-[#A56F7C] cursor-pointer mt-0.5"
                  />
                  <div className="space-y-1">
                    <label
                      htmlFor="employer_sharing_optin"
                      className="text-xs font-semibold text-[#F1E7DB] cursor-pointer"
                    >
                      Opt into Employer Returnship Sharing (Separate Consent)
                    </label>
                    <p className="text-[11px] text-[#9A9A9A] leading-relaxed">
                      Allow vetted, approved returnship hiring managers to invite you for interview
                      slots based on your verified skills and Career Passport.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================= SUCCESS COMPLETION STATE ================= */}
          {isCompleted && (
            <div className="py-8 text-center space-y-6 animate-fadeIn">
              <div className="w-16 h-16 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 mx-auto flex items-center justify-center">
                <Check className="w-8 h-8 stroke-[3]" />
              </div>

              <div className="space-y-2 max-w-lg mx-auto">
                <span className="micro-label text-[#A56F7C]">ONBOARDING COMPLETE</span>
                <h3 className="text-2xl md:text-3xl font-serif text-[#F1E7DB]">
                  Welcome back, {formData.previous_job_title}.
                </h3>
                <p className="text-sm text-[#D8C2A6]/90 font-light leading-relaxed">
                  Your profile and personalized 8-week return roadmap are activated. You can now
                  explore verified returnship tracks, simulate skill upgrades, and meet with mentors.
                </p>
              </div>

              <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="btn-editorial-primary text-xs"
                >
                  <span>Go to My Dashboard →</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* BOTTOM NAVIGATION ACTIONS */}
        {!isCompleted && (
          <div className="px-6 py-4 border-t border-[#D8C2A6]/10 bg-[#141414] flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={handleBack}
                  className="px-4 py-2 rounded-lg border border-[#D8C2A6]/20 text-[#D8C2A6] hover:text-[#F1E7DB] text-xs font-mono uppercase tracking-wider flex items-center gap-1.5 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
              )}

              {/* Data correction / reset draft option */}
              <button
                type="button"
                onClick={handleClearDraft}
                className="text-[11px] font-mono text-[#888888] hover:text-rose-400 px-2 py-1 transition-colors"
                title="Reset all fields"
              >
                Reset Draft
              </button>
            </div>

            <div className="flex items-center gap-3">
              {currentStep < 7 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="btn-editorial-primary text-xs flex items-center gap-2"
                >
                  <span>
                    {currentStep === 1
                      ? "Start Onboarding →"
                      : currentStep === 5
                      ? "Generate Career Plan →"
                      : "Save & Continue →"}
                  </span>
                </button>
              ) : (
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleComplete}
                  className="btn-editorial-primary text-xs flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Activating Plan...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Complete Onboarding & Activate Plan</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
