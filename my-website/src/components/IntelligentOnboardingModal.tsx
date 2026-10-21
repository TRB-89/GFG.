"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  Briefcase,
  Calendar,
  Clock,
  Compass,
  ArrowRight,
  CheckCircle2,
  Trash2,
  Plus,
  ExternalLink,
  Code2,
  BookOpen,
  GraduationCap,
  Users,
  Target,
  FileCheck,
  Building,
  RotateCcw,
  AlertCircle,
  HelpCircle,
  MapPin,
  Laptop,
  Flame,
} from "lucide-react";
import { api } from "@/lib/api";
import { calculateMonthsBetween, formatDurationFromMonths } from "@/lib/demoPersona";

export interface IntelligentOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (candidateData: unknown) => void;
  initialStep?: number;
}

export interface PortfolioProject {
  id: string;
  title: string;
  description: string;
  skills_demonstrated: string[];
  technologies_used: string[];
  project_link?: string;
  repository_link?: string;
  year_completed: number;
}

export interface OnboardingState {
  // Step 1: Career Break
  career_break_start_date: string;
  career_break_end_date: string;
  currently_on_break: boolean;
  career_break_reason: string;
  previous_job_title: string;

  // Step 2: Professional Background
  qualifications: string;
  field_of_study: string;
  previous_profession: string;
  industry: string;
  experience_years: number;
  existing_skills: string[];
  certifications: string[];
  preferred_industry: string;
  target_role: string;
  career_switch_willingness: string;
  preferred_work_mode: string;
  preferred_location: string;
  weekly_learning_hours: number;

  // Step 3: Professional Identity & Projects
  linkedin_url: string;
  github_url: string;
  portfolio_url: string;
  projects: PortfolioProject[];
  resume_url?: string;
  resume_filename?: string;
  resume_size?: number;
  ai_analysis_consent: boolean;

  // Step 4: Assessment tweaks / user review
  assessment_custom_notes?: string;

  // Step 5: Support Preferences
  selected_support_services: string[];
  preferred_support_format: string;
  available_session_times: string;
  preferred_learning_language: string;
  additional_support_notes: string;
}

const DEFAULT_ONBOARDING_STATE: OnboardingState = {
  career_break_start_date: "2023-01-01",
  career_break_end_date: "",
  currently_on_break: true,
  career_break_reason: "",
  previous_job_title: "",

  qualifications: "Bachelor's Degree",
  field_of_study: "",
  previous_profession: "",
  industry: "Technology & Software",
  experience_years: 3,
  existing_skills: ["Python", "SQL", "Project Coordination"],
  certifications: [],
  preferred_industry: "Technology & Software",
  target_role: "",
  career_switch_willingness: "same_domain",
  preferred_work_mode: "hybrid",
  preferred_location: "Bengaluru, IN",
  weekly_learning_hours: 15,

  linkedin_url: "",
  github_url: "",
  portfolio_url: "",
  projects: [],
  resume_url: undefined,
  resume_filename: undefined,
  resume_size: undefined,
  ai_analysis_consent: true,

  assessment_custom_notes: "",

  selected_support_services: [
    "Mentorship Sessions",
    "Career Roadmap",
    "Resume and LinkedIn Support",
  ],
  preferred_support_format: "1:1 Sessions",
  available_session_times: "Weekday Evenings (6 PM - 9 PM)",
  preferred_learning_language: "English",
  additional_support_notes: "",
};

const CAREER_BREAK_REASONS = [
  { id: "maternity_parental", label: "Maternity or parental leave" },
  { id: "caregiving", label: "Caregiving responsibilities" },
  { id: "personal_development", label: "Personal development" },
  { id: "further_education", label: "Further education" },
  { id: "relocation", label: "Relocation" },
  { id: "health_personal", label: "Health or personal reasons" },
  { id: "other", label: "Other" },
  { id: "prefer_not_to_say", label: "Prefer not to say" },
];

const QUALIFICATION_OPTIONS = [
  "Bachelor's Degree",
  "Master's Degree",
  "Diploma / Associate Degree",
  "Doctorate / PhD",
  "Self-Taught / Professional Bootcamp",
  "High School / Other",
];

const INDUSTRIES = [
  "Technology & Software",
  "Data Science & Analytics",
  "Financial Services & FinTech",
  "Healthcare & Life Sciences",
  "E-Commerce & Retail",
  "Education & EdTech",
  "Media & Creative Arts",
  "Consulting & Business Operations",
  "Other",
];

const SUGGESTED_SKILLS = [
  "Python",
  "SQL",
  "Data Analysis",
  "React",
  "TypeScript",
  "JavaScript",
  "Node.js",
  "AWS Cloud",
  "Machine Learning Basics",
  "Agile / Scrum",
  "Project Management",
  "Product Strategy",
  "UI/UX Design",
  "Git & GitHub",
  "PostgreSQL",
  "Cross-functional Leadership",
];

const SUPPORT_SERVICES_CATALOG = [
  {
    id: "Mentorship Sessions",
    title: "Mentorship Sessions",
    description: "Personalized career guidance and 1:1 mentorship from seasoned industry women leaders.",
    icon: Users,
    badge: "1:1 Guidance",
  },
  {
    id: "Intensive Learning Sessions",
    title: "Intensive Learning Sessions",
    description: "Short crash courses, technical refreshes, and compact skill-building workshops.",
    icon: Flame,
    badge: "Fast-Track",
  },
  {
    id: "Career Roadmap",
    title: "Career Roadmap",
    description: "Structured 30/60/90-day guidance and milestones designed for re-entering the workforce.",
    icon: Compass,
    badge: "Milestones",
  },
  {
    id: "Resume and LinkedIn Support",
    title: "Resume & LinkedIn Support",
    description: "Resume modernization, ATS alignment, and professional narrative coaching.",
    icon: FileCheck,
    badge: "Profile Review",
  },
  {
    id: "Interview Preparation",
    title: "Interview Preparation",
    description: "Mock technical interviews, behavioral question walkthroughs, and confidence calibration.",
    icon: Target,
    badge: "Mock Sessions",
  },
  {
    id: "Job and Returnship Discovery",
    title: "Job & Returnship Discovery",
    description: "Verified access to curated comeback programs and women-supportive hiring partners.",
    icon: Briefcase,
    badge: "Verified Matches",
  },
  {
    id: "Career Transition",
    title: "Career Transition",
    description: "Assistance mapping past non-technical and management skills into high-demand tech domains.",
    icon: RotateCcw,
    badge: "Pivot Strategy",
  },
  {
    id: "Entrepreneurship Guidance",
    title: "Entrepreneurship Guidance",
    description: "Support for exploring independent consulting, small business ventures, or freelance contracts.",
    icon: Building,
    badge: "Self-Employment",
  },
];

export function IntelligentOnboardingModal({
  isOpen,
  onClose,
  onSuccess,
  initialStep = 1,
}: IntelligentOnboardingModalProps) {
  const [currentStep, setCurrentStep] = useState<number>(initialStep);
  const [state, setState] = useState<OnboardingState>(DEFAULT_ONBOARDING_STATE);
  const [newSkillInput, setNewSkillInput] = useState("");
  const [newCertInput, setNewCertInput] = useState("");
  const [isUploadingResume, setIsUploadingResume] = useState(false);
  const [autosaveStatus, setAutosaveStatus] = useState<string>("Draft auto-saved");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Project creator modal state
  const [isAddingProject, setIsAddingProject] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [projectForm, setProjectForm] = useState<PortfolioProject>({
    id: "",
    title: "",
    description: "",
    skills_demonstrated: [],
    technologies_used: [],
    project_link: "",
    repository_link: "",
    year_completed: new Date().getFullYear(),
  });
  const [projectTechInput, setProjectTechInput] = useState("");

  // AI Assessment State
  const [assessmentLoading, setAssessmentLoading] = useState(false);
  const [assessmentData, setAssessmentData] = useState<any>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const autosaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Restore existing draft on open
  useEffect(() => {
    if (!isOpen) return;

    async function loadDraft() {
      try {
        const draft = await api.getOnboardingDraft();
        if (draft && draft.draft_data) {
          setState((prev) => ({
            ...prev,
            ...(draft.draft_data as Partial<OnboardingState>),
          }));
          if (draft.current_step && draft.current_step >= 1 && draft.current_step <= 5) {
            setCurrentStep(draft.current_step);
          }
          setAutosaveStatus("Progress restored");
        }
      } catch (err) {
        console.warn("Unable to load cloud draft", err);
      }
    }

    loadDraft();
  }, [isOpen]);

  // Debounced Autosave
  const triggerAutosave = (updated: OnboardingState, step: number) => {
    setAutosaveStatus("Saving...");
    if (autosaveTimerRef.current) {
      clearTimeout(autosaveTimerRef.current);
    }
    autosaveTimerRef.current = setTimeout(async () => {
      try {
        await api.saveOnboardingDraft(step, updated as unknown as Record<string, unknown>);
        const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        setAutosaveStatus(`Saved at ${time}`);
      } catch {
        setAutosaveStatus("Saved locally");
      }
    }, 600);
  };

  const updateState = (fields: Partial<OnboardingState>) => {
    setState((prev) => {
      const next = { ...prev, ...fields };
      triggerAutosave(next, currentStep);
      return next;
    });
    setValidationError(null);
  };

  // Calculate live break duration
  const breakDurationDisplay = React.useMemo(() => {
    if (!state.career_break_start_date) return "Not specified";
    const endStr = state.currently_on_break
      ? new Date().toISOString().split("T")[0]
      : state.career_break_end_date || new Date().toISOString().split("T")[0];

    const months = calculateMonthsBetween(state.career_break_start_date, endStr);
    return formatDurationFromMonths(months);
  }, [state.career_break_start_date, state.career_break_end_date, state.currently_on_break]);

  // Trigger AI assessment when moving to Step 4
  const fetchAssessment = async () => {
    setAssessmentLoading(true);
    setValidationError(null);
    try {
      const res = await api.getOnboardingAssessment({
        previous_job_title: state.previous_job_title || "Professional",
        industry: state.industry,
        experience_years: state.experience_years,
        qualifications: state.qualifications,
        existing_skills: state.existing_skills,
        career_break_months: calculateMonthsBetween(
          state.career_break_start_date || "2023-01-01",
          state.currently_on_break
            ? new Date().toISOString().split("T")[0]
            : state.career_break_end_date || new Date().toISOString().split("T")[0]
        ),
        target_role: state.target_role || state.previous_job_title || "Modern Specialist",
        weekly_learning_hours: state.weekly_learning_hours,
        projects: state.projects.map((p) => ({
          title: p.title,
          description: p.description,
          technologies: p.technologies_used,
        })),
      });
      setAssessmentData(res);
    } catch (err: unknown) {
      console.error("AI assessment failed, fallback used", err);
    } finally {
      setAssessmentLoading(false);
    }
  };

  // Handle file upload
  const handleFileUpload = async (file: File) => {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".pdf") && file.type !== "application/pdf") {
      setValidationError("Please upload a PDF document.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setValidationError("File exceeds maximum allowed size of 5 MB.");
      return;
    }

    setIsUploadingResume(true);
    setValidationError(null);
    try {
      const res = await api.uploadResume(file);
      updateState({
        resume_url: res.url,
        resume_filename: res.filename || file.name,
        resume_size: res.size_bytes || file.size,
      });
      setAutosaveStatus("Resume attached safely");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Upload failed";
      setValidationError(message);
    } finally {
      setIsUploadingResume(false);
    }
  };

  // Step Validation
  const validateStep = (step: number): boolean => {
    if (step === 1) {
      if (!state.previous_job_title.trim()) {
        setValidationError("Please enter your previous professional role or primary background.");
        return false;
      }
      if (!state.career_break_start_date) {
        setValidationError("Please enter the approximate start date of your career break.");
        return false;
      }
    }
    if (step === 2) {
      if (state.existing_skills.length === 0) {
        setValidationError("Please specify at least one skill or strength.");
        return false;
      }
    }
    setValidationError(null);
    return true;
  };

  const handleNext = async () => {
    if (!validateStep(currentStep)) return;
    const nextStep = currentStep + 1;
    if (nextStep === 4 && !assessmentData) {
      fetchAssessment();
    }
    setCurrentStep(nextStep);
    triggerAutosave(state, nextStep);
  };

  const handleBack = () => {
    const prev = Math.max(1, currentStep - 1);
    setCurrentStep(prev);
    triggerAutosave(state, prev);
  };

  // Project Handling
  const handleSaveProject = () => {
    if (!projectForm.title.trim()) {
      alert("Please provide a project title.");
      return;
    }

    if (editingProjectId) {
      updateState({
        projects: state.projects.map((p) => (p.id === editingProjectId ? { ...projectForm } : p)),
      });
    } else {
      const newProj = { ...projectForm, id: `proj_${Date.now()}` };
      updateState({ projects: [...state.projects, newProj] });
    }

    setIsAddingProject(false);
    setEditingProjectId(null);
    setProjectForm({
      id: "",
      title: "",
      description: "",
      skills_demonstrated: [],
      technologies_used: [],
      project_link: "",
      repository_link: "",
      year_completed: new Date().getFullYear(),
    });
  };

  const handleDeleteProject = (id: string) => {
    updateState({ projects: state.projects.filter((p) => p.id !== id) });
  };

  const handleEditProject = (p: PortfolioProject) => {
    setProjectForm({ ...p });
    setEditingProjectId(p.id);
    setIsAddingProject(true);
  };

  // Final Complete
  const handleComplete = async () => {
    setIsSubmitting(true);
    setValidationError(null);
    try {
      const payload = {
        previous_job_title: state.previous_job_title,
        industry: state.industry,
        experience_years: Number(state.experience_years) || 0,
        qualifications: state.qualifications,
        field_of_study: state.field_of_study,
        previous_profession: state.previous_profession,
        target_role: state.target_role || state.previous_job_title,
        career_switch_willingness: state.career_switch_willingness,
        existing_skills: state.existing_skills,
        career_break_start_date: state.career_break_start_date || null,
        career_break_end_date: state.currently_on_break ? null : state.career_break_end_date || null,
        currently_on_break: state.currently_on_break,
        career_break_reason: state.career_break_reason || null,
        weekly_learning_hours: Number(state.weekly_learning_hours) || 15,
        preferred_work_mode: state.preferred_work_mode,
        preferred_location: state.preferred_location,
        language_preference: state.preferred_learning_language,
        resume_url: state.resume_url,
        linkedin_url: state.linkedin_url,
        github_url: state.github_url,
        portfolio_url: state.portfolio_url,
        certifications: state.certifications,
        projects: state.projects.map((p) => ({
          title: p.title,
          description: p.description,
          skills_demonstrated: p.skills_demonstrated,
          technologies_used: p.technologies_used,
          project_link: p.project_link,
          repository_link: p.repository_link,
          year_completed: p.year_completed,
        })),
        support_preferences: {
          services: state.selected_support_services,
          format: state.preferred_support_format,
          availability: state.available_session_times,
          language: state.preferred_learning_language,
          notes: state.additional_support_notes,
        },
      };

      const result = await api.completeOnboarding(payload);
      onSuccess(result);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Submission failed";
      setValidationError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#0A0706]/90 backdrop-blur-md overflow-y-auto"
    >
      <div className="relative w-full max-w-4xl bg-[#140D0A] border border-[#D97706]/30 rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden text-[#F5EDE4]">
        {/* TOP STATUS BAR: 5-step Progress, Autosave, & Close */}
        <div className="px-6 py-4 border-b border-[#2A1B14] flex flex-wrap items-center justify-between gap-3 bg-[#0E0907]">
          {/* Progress Indicators */}
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((stepNum) => {
              const isPast = stepNum < currentStep;
              const isCurrent = stepNum === currentStep;
              const stepLabels = [
                "Career Break",
                "Experience",
                "Identity & Projects",
                "AI Assessment",
                "Support",
              ];
              return (
                <div key={stepNum} className="flex items-center gap-1.5">
                  <div
                    className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-semibold transition-all ${
                      isPast
                        ? "bg-[#D97706] text-[#0A0706]"
                        : isCurrent
                        ? "bg-[#A8551F] text-[#F5EDE4] ring-2 ring-[#D97706]/60 shadow-[0_0_12px_rgba(217,119,6,0.3)]"
                        : "bg-[#2A1B14] text-[#A89B90]"
                    }`}
                  >
                    {isPast ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : stepNum}
                  </div>
                  <span
                    className={`hidden md:inline text-xs font-medium mr-1 ${
                      isCurrent ? "text-[#F5EDE4]" : "text-[#A89B90]"
                    }`}
                  >
                    {stepLabels[stepNum - 1]}
                  </span>
                  {stepNum < 5 && <div className="w-4 h-[1px] bg-[#2A1B14] hidden sm:block" />}
                </div>
              );
            })}
          </div>

          {/* Autosave and Close */}
          <div className="flex items-center gap-3">
            <span className="text-[11px] text-[#A89B90] flex items-center gap-1.5 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-[#D97706] animate-pulse" />
              {autosaveStatus}
            </span>
            <button
              onClick={onClose}
              aria-label="Close modal"
              className="p-1.5 text-[#A89B90] hover:text-[#F5EDE4] hover:bg-[#2A1B14] rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* MODAL BODY */}
        <div className="flex-1 overflow-y-auto px-6 py-6 sm:px-8 space-y-6">
          {validationError && (
            <div className="p-3.5 bg-red-950/40 border border-red-500/40 rounded-xl text-xs text-red-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          {/* STEP 1: CAREER BREAK */}
          {currentStep === 1 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#D97706]/10 border border-[#D97706]/30 text-[#D97706] text-xs font-semibold mb-3">
                  <Calendar className="w-3.5 h-3.5" /> Step 1: Your Life Chapter
                </div>
                <h2
                  id="onboarding-modal-title"
                  className="text-2xl sm:text-3xl font-bold tracking-tight text-[#F5EDE4]"
                >
                  Every journey has a chapter between chapters.
                </h2>
                <p className="text-sm text-[#A89B90] mt-1.5 leading-relaxed">
                  A career pause is an active phase of real life experience, care, and resilience. At
                  GFG, your career break is never treated as a deficit or negative AI scoring signal.
                </p>
              </div>

              {/* Role Before Break */}
              <div>
                <label className="block text-xs font-semibold text-[#F5EDE4] mb-1.5">
                  Previous Professional Role <span className="text-[#D97706]">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Senior Software Engineer, Operations Lead, Marketing Strategist"
                  value={state.previous_job_title}
                  onChange={(e) => updateState({ previous_job_title: e.target.value })}
                  className="w-full px-4 py-3 bg-[#1C120D] border border-[#3A241A] rounded-xl text-sm text-[#F5EDE4] placeholder-[#736357] focus:outline-none focus:border-[#D97706] transition-colors"
                />
              </div>

              {/* Break Dates & Calculated Duration */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#F5EDE4] mb-1.5">
                    Career Break Start Date <span className="text-[#D97706]">*</span>
                  </label>
                  <input
                    type="date"
                    value={state.career_break_start_date}
                    onChange={(e) => updateState({ career_break_start_date: e.target.value })}
                    className="w-full px-4 py-2.5 bg-[#1C120D] border border-[#3A241A] rounded-xl text-sm text-[#F5EDE4] focus:outline-none focus:border-[#D97706] transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#F5EDE4] mb-1.5">
                    End Date / Status
                  </label>
                  {state.currently_on_break ? (
                    <div className="flex items-center h-[42px] px-4 bg-[#1C120D]/60 border border-[#3A241A] rounded-xl text-xs text-[#D97706] font-medium">
                      Currently on break (Present)
                    </div>
                  ) : (
                    <input
                      type="date"
                      value={state.career_break_end_date}
                      onChange={(e) => updateState({ career_break_end_date: e.target.value })}
                      className="w-full px-4 py-2.5 bg-[#1C120D] border border-[#3A241A] rounded-xl text-sm text-[#F5EDE4] focus:outline-none focus:border-[#D97706] transition-colors"
                    />
                  )}
                </div>
              </div>

              {/* Toggle Currently on Break & Duration Banner */}
              <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-[#1C120D] border border-[#3A241A] rounded-xl">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={state.currently_on_break}
                    onChange={(e) => updateState({ currently_on_break: e.target.checked })}
                    className="w-4 h-4 rounded text-[#D97706] bg-[#0A0706] border-[#3A241A] focus:ring-0 focus:ring-offset-0"
                  />
                  <span className="text-xs font-medium text-[#F5EDE4]">
                    I am currently taking a career break
                  </span>
                </label>

                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#D97706]/10 border border-[#D97706]/30 text-xs text-[#D97706]">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Calculated Duration: <strong>{breakDurationDisplay}</strong></span>
                </div>
              </div>

              {/* Reason for Break (Optional, Non-Judgmental) */}
              <div>
                <label className="block text-xs font-semibold text-[#F5EDE4] mb-1.5">
                  Reason for Career Break <span className="text-[#A89B90] font-normal">(Optional — Never shared without your explicit consent)</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {CAREER_BREAK_REASONS.map((r) => {
                    const isSelected = state.career_break_reason === r.label;
                    return (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => updateState({ career_break_reason: isSelected ? "" : r.label })}
                        className={`text-left px-3.5 py-2.5 rounded-xl border text-xs transition-all flex items-center justify-between ${
                          isSelected
                            ? "bg-[#D97706]/15 border-[#D97706] text-[#F5EDE4] font-medium"
                            : "bg-[#1C120D] border-[#3A241A] text-[#A89B90] hover:text-[#F5EDE4] hover:border-[#D97706]/40"
                        }`}
                      >
                        <span>{r.label}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-[#D97706]" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Supportive note */}
              <div className="p-4 bg-gradient-to-r from-[#D97706]/10 to-transparent border-l-2 border-[#D97706] rounded-r-xl text-xs text-[#A89B90] leading-relaxed">
                <span className="text-[#F5EDE4] font-semibold block mb-0.5">Empowerment Commitment:</span>
                Your break reasons are treated with complete dignity. Research shows that professionals returning from caregiving or life chapters bring enhanced empathy, multitasking, and problem-solving to their teams.
              </div>
            </motion.div>
          )}

          {/* STEP 2: PROFESSIONAL BACKGROUND */}
          {currentStep === 2 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#D97706]/10 border border-[#D97706]/30 text-[#D97706] text-xs font-semibold mb-3">
                  <Briefcase className="w-3.5 h-3.5" /> Step 2: Experience & Vision
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#F5EDE4]">
                  Tell us about the experience you're bringing forward.
                </h2>
                <p className="text-sm text-[#A89B90] mt-1.5 leading-relaxed">
                  Your past foundation is a springboard. Let's capture your core proficiencies and your target direction.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Highest Qualification */}
                <div>
                  <label className="block text-xs font-semibold text-[#F5EDE4] mb-1.5">
                    Highest Qualification
                  </label>
                  <select
                    value={state.qualifications}
                    onChange={(e) => updateState({ qualifications: e.target.value })}
                    className="w-full px-4 py-2.5 bg-[#1C120D] border border-[#3A241A] rounded-xl text-sm text-[#F5EDE4] focus:outline-none focus:border-[#D97706] transition-colors"
                  >
                    {QUALIFICATION_OPTIONS.map((q) => (
                      <option key={q} value={q} className="bg-[#140D0A] text-[#F5EDE4]">
                        {q}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Field of Study */}
                <div>
                  <label className="block text-xs font-semibold text-[#F5EDE4] mb-1.5">
                    Field of Study
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Computer Science, Economics, Business, Design"
                    value={state.field_of_study}
                    onChange={(e) => updateState({ field_of_study: e.target.value })}
                    className="w-full px-4 py-2.5 bg-[#1C120D] border border-[#3A241A] rounded-xl text-sm text-[#F5EDE4] placeholder-[#736357] focus:outline-none focus:border-[#D97706] transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Industry */}
                <div>
                  <label className="block text-xs font-semibold text-[#F5EDE4] mb-1.5">
                    Primary Industry
                  </label>
                  <select
                    value={state.industry}
                    onChange={(e) => updateState({ industry: e.target.value })}
                    className="w-full px-4 py-2.5 bg-[#1C120D] border border-[#3A241A] rounded-xl text-sm text-[#F5EDE4] focus:outline-none focus:border-[#D97706] transition-colors"
                  >
                    {INDUSTRIES.map((ind) => (
                      <option key={ind} value={ind} className="bg-[#140D0A] text-[#F5EDE4]">
                        {ind}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Years Experience (Allow 0) */}
                <div>
                  <label className="block text-xs font-semibold text-[#F5EDE4] mb-1.5 flex justify-between">
                    <span>Years of Professional Experience</span>
                    <span className="text-[#D97706] font-mono">{state.experience_years} years</span>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="20"
                    step="0.5"
                    value={state.experience_years}
                    onChange={(e) => updateState({ experience_years: parseFloat(e.target.value) })}
                    className="w-full accent-[#D97706]"
                  />
                  <span className="text-[11px] text-[#A89B90]">
                    (0 years is fully welcomed for those seeking first-time entry or fresh career chapters)
                  </span>
                </div>
              </div>

              {/* Skills Picker */}
              <div>
                <label className="block text-xs font-semibold text-[#F5EDE4] mb-1.5">
                  Skills & Capabilities <span className="text-[#D97706]">*</span>
                </label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {state.existing_skills.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#D97706]/15 border border-[#D97706]/40 rounded-full text-xs text-[#F5EDE4]"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() =>
                          updateState({
                            existing_skills: state.existing_skills.filter((s) => s !== skill),
                          })
                        }
                        className="text-[#A89B90] hover:text-[#F5EDE4]"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>

                {/* Custom skill input */}
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    placeholder="Type a skill and press Enter or click Add"
                    value={newSkillInput}
                    onChange={(e) => setNewSkillInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && newSkillInput.trim()) {
                        e.preventDefault();
                        if (!state.existing_skills.includes(newSkillInput.trim())) {
                          updateState({ existing_skills: [...state.existing_skills, newSkillInput.trim()] });
                        }
                        setNewSkillInput("");
                      }
                    }}
                    className="flex-1 px-4 py-2.5 bg-[#1C120D] border border-[#3A241A] rounded-xl text-sm text-[#F5EDE4] placeholder-[#736357] focus:outline-none focus:border-[#D97706]"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newSkillInput.trim() && !state.existing_skills.includes(newSkillInput.trim())) {
                        updateState({ existing_skills: [...state.existing_skills, newSkillInput.trim()] });
                        setNewSkillInput("");
                      }
                    }}
                    className="px-4 py-2.5 bg-[#2A1B14] hover:bg-[#D97706] text-[#F5EDE4] hover:text-[#0A0706] font-semibold text-xs rounded-xl transition-colors"
                  >
                    Add
                  </button>
                </div>

                {/* Quick suggestions */}
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[11px] text-[#A89B90] mr-1">Suggestions:</span>
                  {SUGGESTED_SKILLS.filter((s) => !state.existing_skills.includes(s)).slice(0, 8).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => updateState({ existing_skills: [...state.existing_skills, s] })}
                      className="px-2 py-0.5 rounded-md bg-[#1C120D] border border-[#3A241A] text-[11px] text-[#A89B90] hover:text-[#D97706] hover:border-[#D97706]/40 transition-colors"
                    >
                      + {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Target Role & Career Switch Willingness */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#F5EDE4] mb-1.5">
                    Desired Target Role
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Full-Stack Engineer, Data Specialist, Product Manager"
                    value={state.target_role}
                    onChange={(e) => updateState({ target_role: e.target.value })}
                    className="w-full px-4 py-2.5 bg-[#1C120D] border border-[#3A241A] rounded-xl text-sm text-[#F5EDE4] placeholder-[#736357] focus:outline-none focus:border-[#D97706]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#F5EDE4] mb-1.5">
                    Career Switch Willingness
                  </label>
                  <select
                    value={state.career_switch_willingness}
                    onChange={(e) => updateState({ career_switch_willingness: e.target.value })}
                    className="w-full px-4 py-2.5 bg-[#1C120D] border border-[#3A241A] rounded-xl text-sm text-[#F5EDE4] focus:outline-none focus:border-[#D97706]"
                  >
                    <option value="same_domain" className="bg-[#140D0A]">Deepen in same domain</option>
                    <option value="adjacent_pivot" className="bg-[#140D0A]">Pivot to adjacent domain</option>
                    <option value="full_transition" className="bg-[#140D0A]">Open to complete career transition</option>
                  </select>
                </div>
              </div>

              {/* Work Arrangement, Location & Learning Hours */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#F5EDE4] mb-1.5">
                    Work Arrangement
                  </label>
                  <select
                    value={state.preferred_work_mode}
                    onChange={(e) => updateState({ preferred_work_mode: e.target.value })}
                    className="w-full px-3 py-2.5 bg-[#1C120D] border border-[#3A241A] rounded-xl text-xs text-[#F5EDE4] focus:outline-none focus:border-[#D97706]"
                  >
                    <option value="remote" className="bg-[#140D0A]">Remote First</option>
                    <option value="hybrid" className="bg-[#140D0A]">Hybrid</option>
                    <option value="onsite" className="bg-[#140D0A]">On-Site</option>
                    <option value="flexible" className="bg-[#140D0A]">Flexible Hours</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#F5EDE4] mb-1.5">
                    Preferred Location
                  </label>
                  <input
                    type="text"
                    value={state.preferred_location}
                    onChange={(e) => updateState({ preferred_location: e.target.value })}
                    className="w-full px-3 py-2.5 bg-[#1C120D] border border-[#3A241A] rounded-xl text-xs text-[#F5EDE4] focus:outline-none focus:border-[#D97706]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#F5EDE4] mb-1.5 flex justify-between">
                    <span>Weekly Learning</span>
                    <span className="text-[#D97706] font-mono">{state.weekly_learning_hours}h/wk</span>
                  </label>
                  <input
                    type="range"
                    min="5"
                    max="40"
                    step="5"
                    value={state.weekly_learning_hours}
                    onChange={(e) => updateState({ weekly_learning_hours: parseInt(e.target.value) })}
                    className="w-full accent-[#D97706]"
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 3: PROFESSIONAL IDENTITY & PORTFOLIO */}
          {currentStep === 3 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#D97706]/10 border border-[#D97706]/30 text-[#D97706] text-xs font-semibold mb-3">
                  <Code2 className="w-3.5 h-3.5" /> Step 3: Tangible Evidence
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#F5EDE4]">
                  Your experience speaks for itself.
                </h2>
                <p className="text-sm text-[#A89B90] mt-1.5 leading-relaxed">
                  Provide links to your online presence, add hands-on projects, or attach your resume. All profile links and projects are optional.
                </p>
              </div>

              {/* Online Profiles */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#F5EDE4] mb-1.5">
                    LinkedIn Profile URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://linkedin.com/in/username"
                    value={state.linkedin_url}
                    onChange={(e) => updateState({ linkedin_url: e.target.value })}
                    className="w-full px-3 py-2.5 bg-[#1C120D] border border-[#3A241A] rounded-xl text-xs text-[#F5EDE4] placeholder-[#736357] focus:outline-none focus:border-[#D97706]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#F5EDE4] mb-1.5 flex justify-between">
                    <span>GitHub Profile URL</span>
                    <span className="text-[10px] text-[#A89B90]">(Optional)</span>
                  </label>
                  <input
                    type="url"
                    placeholder="https://github.com/username"
                    value={state.github_url}
                    onChange={(e) => updateState({ github_url: e.target.value })}
                    className="w-full px-3 py-2.5 bg-[#1C120D] border border-[#3A241A] rounded-xl text-xs text-[#F5EDE4] placeholder-[#736357] focus:outline-none focus:border-[#D97706]"
                  />
                  <span className="text-[10px] text-[#736357] block mt-0.5">
                    GitHub is not required for non-technical careers.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#F5EDE4] mb-1.5">
                    Portfolio / Website URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://yourportfolio.dev"
                    value={state.portfolio_url}
                    onChange={(e) => updateState({ portfolio_url: e.target.value })}
                    className="w-full px-3 py-2.5 bg-[#1C120D] border border-[#3A241A] rounded-xl text-xs text-[#F5EDE4] placeholder-[#736357] focus:outline-none focus:border-[#D97706]"
                  />
                </div>
              </div>

              {/* Projects List & Add/Edit Project Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-[#F5EDE4]">
                      Featured Projects & Practical Work
                    </h3>
                    <p className="text-xs text-[#A89B90]">
                      Demonstrate your competence through capstones, side projects, or past work achievements.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setProjectForm({
                        id: "",
                        title: "",
                        description: "",
                        skills_demonstrated: [],
                        technologies_used: [],
                        project_link: "",
                        repository_link: "",
                        year_completed: new Date().getFullYear(),
                      });
                      setEditingProjectId(null);
                      setIsAddingProject(true);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#D97706] hover:bg-[#F5EDE4] text-[#0A0706] rounded-xl text-xs font-semibold transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Project
                  </button>
                </div>

                {state.projects.length === 0 ? (
                  <div className="p-6 border border-dashed border-[#3A241A] rounded-xl text-center text-xs text-[#A89B90]">
                    No projects added yet. Click &ldquo;Add Project&rdquo; to showcase your practical work.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {state.projects.map((proj) => (
                      <div
                        key={proj.id}
                        className="p-4 bg-[#1C120D] border border-[#3A241A] rounded-xl space-y-2 relative group"
                      >
                        <div className="flex items-start justify-between">
                          <h4 className="text-sm font-semibold text-[#F5EDE4]">{proj.title}</h4>
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleEditProject(proj)}
                              className="text-xs text-[#D97706] hover:underline"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteProject(proj.id)}
                              className="text-xs text-red-400 hover:text-red-300 ml-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                        <p className="text-xs text-[#A89B90] line-clamp-2">{proj.description}</p>
                        <div className="flex flex-wrap gap-1">
                          {proj.technologies_used.map((tech) => (
                            <span
                              key={tech}
                              className="px-2 py-0.5 bg-[#2A1B14] rounded text-[10px] text-[#D97706]"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                        <div className="flex items-center gap-3 pt-1 text-[11px] text-[#A89B90]">
                          <span>Year: {proj.year_completed}</span>
                          {proj.project_link && (
                            <a
                              href={proj.project_link}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-0.5 text-[#D97706] hover:underline"
                            >
                              Demo <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          )}
                          {proj.repository_link && (
                            <a
                              href={proj.repository_link}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-0.5 text-[#D97706] hover:underline"
                            >
                              Repo <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Project Modal Dialog if adding/editing */}
              {isAddingProject && (
                <div className="p-4 bg-[#180F0A] border border-[#D97706]/40 rounded-xl space-y-3">
                  <div className="flex justify-between items-center border-b border-[#3A241A] pb-2">
                    <span className="text-xs font-semibold text-[#F5EDE4]">
                      {editingProjectId ? "Edit Project" : "Add Project Details"}
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsAddingProject(false)}
                      className="text-[#A89B90] hover:text-[#F5EDE4]"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] text-[#A89B90] block mb-1">Project Title</label>
                      <input
                        type="text"
                        placeholder="e.g. HealthCare Analytics Dashboard"
                        value={projectForm.title}
                        onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })}
                        className="w-full px-3 py-2 bg-[#1C120D] border border-[#3A241A] rounded-lg text-xs text-[#F5EDE4]"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-[#A89B90] block mb-1">Year Completed</label>
                      <input
                        type="number"
                        value={projectForm.year_completed}
                        onChange={(e) =>
                          setProjectForm({
                            ...projectForm,
                            year_completed: parseInt(e.target.value) || new Date().getFullYear(),
                          })
                        }
                        className="w-full px-3 py-2 bg-[#1C120D] border border-[#3A241A] rounded-lg text-xs text-[#F5EDE4]"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[11px] text-[#A89B90] block mb-1">Project Description</label>
                    <textarea
                      rows={2}
                      placeholder="Explain the problem solved, architecture, and results achieved."
                      value={projectForm.description}
                      onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                      className="w-full px-3 py-2 bg-[#1C120D] border border-[#3A241A] rounded-lg text-xs text-[#F5EDE4]"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] text-[#A89B90] block mb-1">Live Project Link</label>
                      <input
                        type="url"
                        placeholder="https://..."
                        value={projectForm.project_link}
                        onChange={(e) =>
                          setProjectForm({ ...projectForm, project_link: e.target.value })
                        }
                        className="w-full px-3 py-2 bg-[#1C120D] border border-[#3A241A] rounded-lg text-xs text-[#F5EDE4]"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-[#A89B90] block mb-1">Repository Link</label>
                      <input
                        type="url"
                        placeholder="https://github.com/..."
                        value={projectForm.repository_link}
                        onChange={(e) =>
                          setProjectForm({ ...projectForm, repository_link: e.target.value })
                        }
                        className="w-full px-3 py-2 bg-[#1C120D] border border-[#3A241A] rounded-lg text-xs text-[#F5EDE4]"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[11px] text-[#A89B90] block mb-1">Technologies Used (comma separated)</label>
                    <input
                      type="text"
                      placeholder="React, Python, PostgreSQL, Docker"
                      value={projectForm.technologies_used.join(", ")}
                      onChange={(e) =>
                        setProjectForm({
                          ...projectForm,
                          technologies_used: e.target.value
                            .split(",")
                            .map((t) => t.trim())
                            .filter(Boolean),
                        })
                      }
                      className="w-full px-3 py-2 bg-[#1C120D] border border-[#3A241A] rounded-lg text-xs text-[#F5EDE4]"
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsAddingProject(false)}
                      className="px-3 py-1.5 bg-[#2A1B14] text-xs text-[#A89B90] rounded-lg"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveProject}
                      className="px-4 py-1.5 bg-[#D97706] hover:bg-[#F5EDE4] text-[#0A0706] font-semibold text-xs rounded-lg transition-colors"
                    >
                      Save Project
                    </button>
                  </div>
                </div>
              )}

              {/* Resume PDF Upload */}
              <div className="p-4 bg-[#1C120D] border border-[#3A241A] rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#D97706]" />
                    <span className="text-xs font-semibold text-[#F5EDE4]">
                      Resume PDF Attachment (Optional)
                    </span>
                  </div>
                  <span className="text-[10px] text-[#A89B90]">PDF format only, up to 5 MB</span>
                </div>

                {state.resume_filename ? (
                  <div className="flex items-center justify-between p-3 bg-[#2A1B14] rounded-lg">
                    <div className="flex items-center gap-2 text-xs text-[#F5EDE4]">
                      <FileCheck className="w-4 h-4 text-emerald-400" />
                      <span>{state.resume_filename}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        updateState({
                          resume_url: undefined,
                          resume_filename: undefined,
                          resume_size: undefined,
                        })
                      }
                      className="text-xs text-red-400 hover:text-red-300"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div>
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
                    <button
                      type="button"
                      disabled={isUploadingResume}
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full py-4 border border-dashed border-[#D97706]/40 hover:border-[#D97706] rounded-xl flex flex-col items-center justify-center gap-1.5 text-xs text-[#A89B90] hover:text-[#F5EDE4] transition-all bg-[#0A0706]/40"
                    >
                      <Upload className="w-5 h-5 text-[#D97706]" />
                      <span>{isUploadingResume ? "Uploading PDF securely..." : "Click to browse and upload resume PDF"}</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Consent notice */}
              <div className="flex items-start gap-2.5 p-3.5 bg-[#0E0907] border border-[#2A1B14] rounded-xl text-xs text-[#A89B90]">
                <Shield className="w-4 h-4 text-[#D97706] shrink-0 mt-0.5" />
                <p>
                  <strong>Data Sovereignty & Privacy:</strong> We strictly analyze only the details and public portfolio data you provide. We never use unauthorized scraping or ask for external credentials.
                </p>
              </div>
            </motion.div>
          )}

          {/* STEP 4: AI CAREER COMEBACK ASSESSMENT */}
          {currentStep === 4 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#D97706]/10 border border-[#D97706]/30 text-[#D97706] text-xs font-semibold mb-3">
                  <Sparkles className="w-3.5 h-3.5" /> Step 4: AI Comeback Assessment
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#F5EDE4]">
                  Let&apos;s discover your next opportunity.
                </h2>
                <p className="text-sm text-[#A89B90] mt-1.5 leading-relaxed">
                  Synthesized using our secure Gemini intelligence engine. Review your skill inventory, comeback roadmap, and verified returnship matches.
                </p>
              </div>

              {assessmentLoading ? (
                <div className="p-12 text-center space-y-4 bg-[#1C120D] border border-[#3A241A] rounded-2xl">
                  <div className="w-10 h-10 border-2 border-[#D97706] border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-sm font-medium text-[#F5EDE4]">
                    Synthesizing your personalized comeback plan...
                  </p>
                  <p className="text-xs text-[#A89B90]">
                    Evaluating transferable skills, course alignments, and 30/60/90-day trajectory.
                  </p>
                </div>
              ) : assessmentData ? (
                <div className="space-y-6">
                  {/* Readiness Banner */}
                  <div className="p-5 bg-gradient-to-r from-[#1C120D] to-[#2A1B14] border border-[#D97706]/30 rounded-2xl flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <span className="text-[11px] font-mono uppercase tracking-wider text-[#D97706]">
                        Synthesized Trajectory
                      </span>
                      <h3 className="text-lg font-bold text-[#F5EDE4]">
                        {assessmentData.target_role || state.target_role || "Comeback Pathway"}
                      </h3>
                      <p className="text-xs text-[#A89B90] mt-0.5">
                        {assessmentData.confidence_score
                          ? `Evidence Confidence: ${Math.round(assessmentData.confidence_score * 100)}%`
                          : "Calibrated for high-momentum re-entry"}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="text-2xl font-bold text-[#D97706]">
                          {assessmentData.readiness_percentage || 84}%
                        </span>
                        <span className="block text-[10px] text-[#A89B90]">Readiness Level</span>
                      </div>
                    </div>
                  </div>

                  {/* 1 & 2: Skill Inventory & Career Options */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Deliverable 1: Skill Inventory */}
                    <div className="p-4 bg-[#1C120D] border border-[#3A241A] rounded-xl space-y-2.5">
                      <h4 className="text-xs font-semibold text-[#F5EDE4] flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#D97706]" />
                        1. Personal Skill Inventory
                      </h4>
                      <div className="flex flex-wrap gap-1.5">
                        {(assessmentData.personal_skill_inventory || state.existing_skills).map(
                          (sk: string) => (
                            <span
                              key={sk}
                              className="px-2.5 py-1 bg-[#2A1B14] rounded-md text-[11px] text-[#F5EDE4]"
                            >
                              {sk}
                            </span>
                          )
                        )}
                      </div>
                    </div>

                    {/* Deliverable 2: Career Options */}
                    <div className="p-4 bg-[#1C120D] border border-[#3A241A] rounded-xl space-y-2.5">
                      <h4 className="text-xs font-semibold text-[#F5EDE4] flex items-center gap-1.5">
                        <Compass className="w-3.5 h-3.5 text-[#D97706]" />
                        2. Relevant Career Options
                      </h4>
                      <div className="space-y-1.5">
                        {(
                          assessmentData.relevant_career_options || [
                            { role: state.target_role || "Senior Specialist", match: 88 },
                            { role: "Solutions Consultant", match: 82 },
                          ]
                        ).map((opt: any, i: number) => (
                          <div
                            key={i}
                            className="flex items-center justify-between text-xs py-1 border-b border-[#2A1B14] last:border-0"
                          >
                            <span className="text-[#F5EDE4]">{opt.role}</span>
                            <span className="text-[#D97706] font-mono">{opt.match}% Match</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* 3 & 4: Skill Gaps & Transferable Strengths */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Deliverable 3: Skill Gaps */}
                    <div className="p-4 bg-[#1C120D] border border-[#3A241A] rounded-xl space-y-2.5">
                      <h4 className="text-xs font-semibold text-[#F5EDE4] flex items-center gap-1.5">
                        <Target className="w-3.5 h-3.5 text-[#D97706]" />
                        3. Job-Specific Skill Gaps (Bridge Areas)
                      </h4>
                      <div className="space-y-1.5">
                        {(
                          assessmentData.job_specific_skill_gaps || [
                            { skill: "Cloud Architecture Modernization", bridge_time_weeks: 4 },
                            { skill: "Automated Testing & CI/CD", bridge_time_weeks: 2 },
                          ]
                        ).map((gap: any, i: number) => (
                          <div
                            key={i}
                            className="flex items-center justify-between text-xs py-1 border-b border-[#2A1B14] last:border-0"
                          >
                            <span className="text-[#F5EDE4]">{gap.skill}</span>
                            <span className="text-[#A89B90] text-[11px]">
                              ~{gap.bridge_time_weeks} weeks
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Deliverable 4: Transferable Strengths */}
                    <div className="p-4 bg-[#1C120D] border border-[#3A241A] rounded-xl space-y-2.5">
                      <h4 className="text-xs font-semibold text-[#F5EDE4] flex items-center gap-1.5">
                        <Flame className="w-3.5 h-3.5 text-[#D97706]" />
                        4. Transferable Strengths
                      </h4>
                      <div className="space-y-1">
                        {(
                          assessmentData.transferable_strengths || [
                            "Complex problem decomposition",
                            "Cross-functional stakeholder communication",
                            "High resilience & adaptive sprint execution",
                          ]
                        ).map((strength: string, i: number) => (
                          <div key={i} className="text-xs text-[#A89B90] flex items-start gap-2">
                            <span className="text-[#D97706]">•</span>
                            <span>{strength}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* 5 & 6: Recommended Modules & Suggested Projects */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Deliverable 5: Recommended Learning Modules */}
                    <div className="p-4 bg-[#1C120D] border border-[#3A241A] rounded-xl space-y-2.5">
                      <h4 className="text-xs font-semibold text-[#F5EDE4] flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5 text-[#D97706]" />
                        5. Recommended Learning Modules
                      </h4>
                      <div className="space-y-2">
                        {(
                          assessmentData.recommended_learning_modules || [
                            { title: "Cloud & Microservices Comeback Sprint", hours: 14 },
                            { title: "Modern API Architecture with FastAPI & Next.js", hours: 18 },
                          ]
                        ).map((mod: any, i: number) => (
                          <div
                            key={i}
                            className="p-2.5 bg-[#2A1B14] rounded-lg text-xs flex justify-between items-center"
                          >
                            <span className="text-[#F5EDE4] font-medium">{mod.title}</span>
                            <span className="text-[#D97706] text-[11px] font-mono">{mod.hours}h</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Deliverable 6: Suggested Projects */}
                    <div className="p-4 bg-[#1C120D] border border-[#3A241A] rounded-xl space-y-2.5">
                      <h4 className="text-xs font-semibold text-[#F5EDE4] flex items-center gap-1.5">
                        <Code2 className="w-3.5 h-3.5 text-[#D97706]" />
                        6. Suggested Projects
                      </h4>
                      <div className="space-y-2">
                        {(
                          assessmentData.suggested_projects || [
                            { title: "Real-Time Analytical Pipeline", desc: "Demonstrates modern distributed queries and automated validation." },
                          ]
                        ).map((proj: any, i: number) => (
                          <div key={i} className="p-2.5 bg-[#2A1B14] rounded-lg text-xs space-y-0.5">
                            <span className="text-[#F5EDE4] font-medium block">{proj.title}</span>
                            <span className="text-[#A89B90] text-[11px] block">{proj.desc}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Deliverable 7 & 8: Action Plan & 30/60/90 Roadmap */}
                  <div className="p-4 bg-[#1C120D] border border-[#3A241A] rounded-xl space-y-3">
                    <h4 className="text-xs font-semibold text-[#F5EDE4] flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-[#D97706]" />
                      7 & 8. Personalized 30 / 60 / 90-Day Comeback Roadmap
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="p-3 bg-[#2A1B14] rounded-lg space-y-1">
                        <span className="text-[10px] font-mono text-[#D97706] uppercase">Days 1 - 30</span>
                        <h5 className="text-xs font-semibold text-[#F5EDE4]">Foundation & Refresh</h5>
                        <p className="text-[11px] text-[#A89B90] leading-relaxed">
                          {assessmentData.roadmap_30_days ||
                            "Complete core refresher sprint, bridge identified skill gaps, and setup modern dev environment."}
                        </p>
                      </div>

                      <div className="p-3 bg-[#2A1B14] rounded-lg space-y-1">
                        <span className="text-[10px] font-mono text-[#D97706] uppercase">Days 31 - 60</span>
                        <h5 className="text-xs font-semibold text-[#F5EDE4]">Portfolio & Proof</h5>
                        <p className="text-[11px] text-[#A89B90] leading-relaxed">
                          {assessmentData.roadmap_60_days ||
                            "Publish updated capstone project, modernize resume & LinkedIn, and take mock technical interview."}
                        </p>
                      </div>

                      <div className="p-3 bg-[#2A1B14] rounded-lg space-y-1">
                        <span className="text-[10px] font-mono text-[#D97706] uppercase">Days 61 - 90</span>
                        <h5 className="text-xs font-semibold text-[#F5EDE4]">Applications & Offer</h5>
                        <p className="text-[11px] text-[#A89B90] leading-relaxed">
                          {assessmentData.roadmap_90_days ||
                            "Apply to verified returnship programs, engage mentor referrals, and secure offer."}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Deliverable 9: Verified Returnship & Job Opportunities */}
                  <div className="p-4 bg-[#1C120D] border border-[#3A241A] rounded-xl space-y-3">
                    <h4 className="text-xs font-semibold text-[#F5EDE4] flex items-center gap-1.5">
                      <Building className="w-3.5 h-3.5 text-[#D97706]" />
                      9. Verified Returnship & Career Opportunities
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {(
                        assessmentData.verified_returnships || [
                          {
                            title: "AWS Restart Returnship",
                            company: "Amazon Web Services",
                            location: "Bengaluru, IN (Hybrid)",
                            match: "92%",
                          },
                          {
                            title: "Career Comeback Specialist",
                            company: "Thoughtworks",
                            location: "Remote / Pan-India",
                            match: "89%",
                          },
                        ]
                      ).map((job: any, i: number) => (
                        <div
                          key={i}
                          className="p-3 bg-[#2A1B14] rounded-lg flex items-center justify-between text-xs"
                        >
                          <div>
                            <span className="font-semibold text-[#F5EDE4] block">{job.title}</span>
                            <span className="text-[11px] text-[#A89B90]">
                              {job.company} • {job.location}
                            </span>
                          </div>
                          <span className="px-2 py-0.5 rounded bg-[#D97706]/15 text-[#D97706] font-mono text-[11px]">
                            {job.match}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Human Review Note */}
                  <div className="p-3 bg-[#0E0907] border border-[#2A1B14] rounded-xl text-xs text-[#A89B90] flex items-center gap-2">
                    <Shield className="w-4 h-4 text-[#D97706] shrink-0" />
                    <span>
                      <strong>Human Review & Self-Correction:</strong> This assessment is an empowering diagnostic guide, not an exclusionary score. All roadmap parameters can be adjusted directly from your dashboard.
                    </span>
                  </div>
                </div>
              ) : null}
            </motion.div>
          )}

          {/* STEP 5: SUPPORT PREFERENCE SELECTION */}
          {currentStep === 5 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#D97706]/10 border border-[#D97706]/30 text-[#D97706] text-xs font-semibold mb-3">
                  <Target className="w-3.5 h-3.5" /> Step 5: How Can GFG Help You?
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#F5EDE4]">
                  Your next chapter, your way.
                </h2>
                <p className="text-sm text-[#A89B90] mt-1.5 leading-relaxed">
                  Select the services and formats you&apos;d like available as you embark on your return-to-work journey. Select all that interest you.
                </p>
              </div>

              {/* 8 Interactive Selection Panels */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {SUPPORT_SERVICES_CATALOG.map((service) => {
                  const Icon = service.icon;
                  const isSelected = state.selected_support_services.includes(service.id);
                  return (
                    <button
                      key={service.id}
                      type="button"
                      onClick={() => {
                        const next = isSelected
                          ? state.selected_support_services.filter((s) => s !== service.id)
                          : [...state.selected_support_services, service.id];
                        updateState({ selected_support_services: next });
                      }}
                      className={`text-left p-4 rounded-xl border transition-all space-y-2 ${
                        isSelected
                          ? "bg-[#D97706]/15 border-[#D97706] shadow-[0_0_15px_rgba(217,119,6,0.15)]"
                          : "bg-[#1C120D] border-[#3A241A] hover:border-[#D97706]/40"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Icon className={`w-4 h-4 ${isSelected ? "text-[#D97706]" : "text-[#A89B90]"}`} />
                          <h4 className="text-xs font-bold text-[#F5EDE4]">{service.title}</h4>
                        </div>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full ${
                            isSelected
                              ? "bg-[#D97706] text-[#0A0706] font-semibold"
                              : "bg-[#2A1B14] text-[#A89B90]"
                          }`}
                        >
                          {service.badge}
                        </span>
                      </div>
                      <p className="text-xs text-[#A89B90] leading-relaxed">{service.description}</p>
                    </button>
                  );
                })}
              </div>

              {/* Format, Session Availability, Language */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-[#F5EDE4] mb-1.5">
                    Preferred Support Format
                  </label>
                  <select
                    value={state.preferred_support_format}
                    onChange={(e) => updateState({ preferred_support_format: e.target.value })}
                    className="w-full px-3 py-2.5 bg-[#1C120D] border border-[#3A241A] rounded-xl text-xs text-[#F5EDE4] focus:outline-none focus:border-[#D97706]"
                  >
                    <option value="1:1 Sessions" className="bg-[#140D0A]">1:1 Dedicated Sessions</option>
                    <option value="Small Cohort Group" className="bg-[#140D0A]">Small Cohort Group</option>
                    <option value="Self-Guided + Async" className="bg-[#140D0A]">Self-Guided + Async Feedback</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#F5EDE4] mb-1.5">
                    Available Session Times
                  </label>
                  <select
                    value={state.available_session_times}
                    onChange={(e) => updateState({ available_session_times: e.target.value })}
                    className="w-full px-3 py-2.5 bg-[#1C120D] border border-[#3A241A] rounded-xl text-xs text-[#F5EDE4] focus:outline-none focus:border-[#D97706]"
                  >
                    <option value="Weekday Evenings (6 PM - 9 PM)" className="bg-[#140D0A]">Weekday Evenings</option>
                    <option value="Weekend Mornings (10 AM - 1 PM)" className="bg-[#140D0A]">Weekend Mornings</option>
                    <option value="Flexible Weekdays" className="bg-[#140D0A]">Flexible Weekdays</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#F5EDE4] mb-1.5">
                    Preferred Learning Language
                  </label>
                  <select
                    value={state.preferred_learning_language}
                    onChange={(e) => updateState({ preferred_learning_language: e.target.value })}
                    className="w-full px-3 py-2.5 bg-[#1C120D] border border-[#3A241A] rounded-xl text-xs text-[#F5EDE4] focus:outline-none focus:border-[#D97706]"
                  >
                    <option value="English" className="bg-[#140D0A]">English</option>
                    <option value="Hindi" className="bg-[#140D0A]">Hindi (हिंदी)</option>
                    <option value="Tamil" className="bg-[#140D0A]">Tamil (தமிழ்)</option>
                    <option value="Telugu" className="bg-[#140D0A]">Telugu (తెలుగు)</option>
                    <option value="Kannada" className="bg-[#140D0A]">Kannada (ಕನ್ನಡ)</option>
                    <option value="Bengali" className="bg-[#140D0A]">Bengali (বাংলা)</option>
                  </select>
                </div>
              </div>

              {/* Notice */}
              <div className="p-3.5 bg-[#0E0907] border border-[#2A1B14] rounded-xl text-xs text-[#A89B90]">
                <strong>Scheduling Transparency:</strong> Expressing preferences lets us personalize your dashboard courses and match verified mentor slots. 1:1 sessions are confirmed only when specific mentor calendar availability is selected by you.
              </div>
            </motion.div>
          )}
        </div>

        {/* BOTTOM NAVIGATION CONTROLS */}
        <div className="px-6 py-4 border-t border-[#2A1B14] bg-[#0E0907] flex items-center justify-between gap-4">
          <div>
            {currentStep > 1 && (
              <button
                type="button"
                onClick={handleBack}
                disabled={isSubmitting}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#1C120D] hover:bg-[#2A1B14] text-[#F5EDE4] text-xs font-semibold rounded-xl border border-[#3A241A] transition-colors"
              >
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            {currentStep < 5 ? (
              <button
                type="button"
                onClick={handleNext}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#D97706] hover:bg-[#F5EDE4] text-[#0A0706] text-xs font-bold rounded-xl transition-all shadow-[0_0_15px_rgba(217,119,6,0.3)] hover:scale-[1.02]"
              >
                Continue <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleComplete}
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-[#D97706] to-[#A8551F] hover:from-[#F5EDE4] hover:to-[#F5EDE4] text-[#0A0706] text-xs font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(217,119,6,0.4)] hover:scale-[1.02] disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>Saving Profile...</>
                ) : (
                  <>
                    Complete Comeback Setup & Go to Dashboard <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
