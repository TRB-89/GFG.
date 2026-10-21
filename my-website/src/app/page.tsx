"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  X,
  ExternalLink,
  BookOpen,
  Brain,
  Target,
  Sparkles,
  Sliders,
  Layers,
  Zap,
  UserCheck,
  Building2,
  Clock,
  Briefcase,
  Download,
  Calendar,
  ChevronRight,
  AlertCircle,
  MessageSquare,
  Users,
  Compass,
  BarChart3,
  Globe,
} from "lucide-react";
import { api } from "@/lib/api";
import { DEMO_PERSONA, DEMO_METRICS, DEMO_MENTOR, DEMO_EMPLOYER } from "@/lib/demoPersona";
import { BackgroundGeometry } from "@/components/BackgroundGeometry";
import { EditorialNavigation, PlatformRole } from "@/components/EditorialNavigation";
import { AuthModal } from "@/components/AuthModal";
import { UserDashboardModal } from "@/components/UserDashboardModal";
import { DemoModeBanner } from "@/components/DemoModeBanner";
import { DataClassificationBadge } from "@/components/DataClassificationBadge";
import { ScoringExplanationModal } from "@/components/ScoringExplanationModal";
import { MentorshipCommunityModal } from "@/components/MentorshipCommunityModal";
import { StoryDetailModal } from "@/components/StoryDetailModal";
import { AlumniDirectoryModal } from "@/components/AlumniDirectoryModal";
import { AdminModal } from "@/components/AdminModal";
import { IntelligentOnboardingModal } from "@/components/IntelligentOnboardingModal";
import { DigitalTwinModal } from "@/components/DigitalTwinModal";
import { CareerSimulatorModal } from "@/components/CareerSimulatorModal";
import { AdaptiveRoadmapModal } from "@/components/AdaptiveRoadmapModal";
import { CareerPassportModal } from "@/components/CareerPassportModal";
import { SmartOpportunityEngineModal } from "@/components/SmartOpportunityEngineModal";
import { AccessibilityToolbar } from "@/components/AccessibilityToolbar";
import { VoiceAssistantModal } from "@/components/VoiceAssistantModal";
import { EntrepreneurshipHubModal } from "@/components/EntrepreneurshipHubModal";
import { WorkLifeSupportModal, WorkLifeFilters } from "@/components/WorkLifeSupportModal";
import EmployerIntelligenceModal from "@/components/EmployerIntelligenceModal";
import { GovernmentPilotModal } from "@/components/GovernmentPilotModal";
import { GuidedAssistanceSection } from "@/components/GuidedAssistanceSection";
import { LearningHubModal } from "@/components/learning/LearningHubModal";
import { useTranslation, AiTranslationDisclaimer } from "@/lib/i18n/LanguageContext";
import { useBandwidth } from "@/lib/bandwidth/BandwidthContext";
import { useAccessibility } from "@/lib/accessibility/AccessibilityContext";

// Career Comeback Pathways (Section 10)
const PATHWAYS = [
  {
    id: "01",
    tag: "PATHWAY / 01",
    name: "Restarting After Maternity",
    headline: "PRESERVE YOUR TENURE. REGAIN YOUR MOMENTUM.",
    desc: "A tailored return-to-work program acknowledging maternal sabbaticals as periods of vital life leadership, with fast-tracked skill calibrations in modern cloud and data architectures.",
    skills: ["SQL Data Modeling", "Python Refresher", "Power BI Dashboards"],
    action: "Explore Maternity Track",
    timeframe: "8–12 Weeks",
    readinessBoost: "+16%",
    image: "/images/editorial-hero.jpg",
  },
  {
    id: "02",
    tag: "PATHWAY / 02",
    name: "Returning After Caregiving",
    headline: "RESILIENT LEADERSHIP MEETS MODERN RE-ENTRY.",
    desc: "Structured asynchronous learning and flexible returnship tracks designed around family caregiving priorities, emphasizing high-autonomy engineering and systems analysis.",
    skills: ["Cloud Architecture", "Distributed Systems", "Agile Management"],
    action: "Explore Caregiving Track",
    timeframe: "10–14 Weeks",
    readinessBoost: "+18%",
    image: "/images/editorial-story.jpg",
  },
  {
    id: "03",
    tag: "PATHWAY / 03",
    name: "Career Switch",
    headline: "TRANSLATE PRIOR MASTERY INTO NEW HORIZONS.",
    desc: "Pivot from legacy stacks or adjacent fields into high-demand product analytics, machine learning operations, and technical program management with zero stigma.",
    skills: ["Exploratory Data Analysis", "Product Metrics", "A/B Testing"],
    action: "Explore Switch Track",
    timeframe: "12–16 Weeks",
    readinessBoost: "+22%",
    image: "/images/editorial-mentor.jpg",
  },
  {
    id: "04",
    tag: "PATHWAY / 04",
    name: "Upskilling After Long Break",
    headline: "BRIDGING MULTI-YEAR PAUSES WITH CONFIDENCE.",
    desc: "Deep-dive refreshed curriculums crafted for breaks over 24 months. Focuses on foundational modernization, hands-on capstone repositories, and verified portfolio proof.",
    skills: ["Modern Web Ecosystems", "Microservices", "CI/CD Pipelines"],
    action: "Explore Upskilling Track",
    timeframe: "14–18 Weeks",
    readinessBoost: "+25%",
    image: "/images/editorial-hero.jpg",
  },
  {
    id: "05",
    tag: "PATHWAY / 05",
    name: "Returning to Tech",
    headline: "CODE AND ARCHITECTURE DO NOT EXPIRE.",
    desc: "Re-ignite your core algorithmic and backend muscle memory with focused modern frameworks, container orchestration, and returnship placements in tier-one engineering firms.",
    skills: ["FastAPI & Python", "PostgreSQL Optimization", "System Design"],
    action: "Explore Tech Track",
    timeframe: "8–10 Weeks",
    readinessBoost: "+20%",
    image: "/images/editorial-mentor.jpg",
  },
  {
    id: "06",
    tag: "PATHWAY / 06",
    name: "Leadership Comeback",
    headline: "STEPPING BACK INTO STRATEGIC IMPACT.",
    desc: "Executive refresher modules for returning engineering managers, staff architects, and director-level leaders leading cross-functional AI-enabled organizations.",
    skills: ["AI Engineering Strategy", "Executive Influence", "Team Scaling"],
    action: "Explore Leadership Track",
    timeframe: "6–8 Weeks",
    readinessBoost: "+15%",
    image: "/images/editorial-story.jpg",
  },
  {
    id: "07",
    tag: "PATHWAY / 07",
    name: "Flexible Work Journey",
    headline: "HIGH-IMPACT CONTRIBUTIONS ON YOUR SCHEDULE.",
    desc: "Curated fractional, remote, and part-time returnships with verified employers providing high compensation, mentorship, and transparent paths to full tenure.",
    skills: ["Async Communication", "Sprint Delivery", "Independent QA"],
    action: "Explore Flexible Track",
    timeframe: "6–10 Weeks",
    readinessBoost: "+14%",
    image: "/images/editorial-hero.jpg",
  },
];

export default function Home() {
  // Session & Role state
  const [currentRole, setCurrentRole] = useState<PlatformRole>("candidate");
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Data state
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [candidateProfile, setCandidateProfile] = useState<any>(null);
  const [jobs, setJobs] = useState<any[]>([]);
  const [selectedJob, setSelectedJob] = useState<any>({
    id: "job-demo-1",
    title: "Data Analyst Returnship",
    company_name: "Nova Technologies",
    location: "Bengaluru, IN",
    work_mode: "Hybrid",
    salary_min: 35000,
    compatibility: { match_score: 89 },
  });
  const [myApplications, setMyApplications] = useState<any[]>([]);
  const [employerApplications, setEmployerApplications] = useState<any[]>([]);

  // Module 3 AI State
  const [skillGapData, setSkillGapData] = useState<any>(null);
  const [roadmapData, setRoadmapData] = useState<any>(null);
  const [readinessData, setReadinessData] = useState<any>(null);
  const [aiMatches, setAiMatches] = useState<any[]>([]);
  const [isSimulated, setIsSimulated] = useState<boolean>(false);
  const [simulationResult, setSimulationResult] = useState<any>(null);
  const [isAnalyzingCareer, setIsAnalyzingCareer] = useState<boolean>(false);
  const [isGeneratingRoadmap, setIsGeneratingRoadmap] = useState<boolean>(false);
  const [isSimulatingSkill, setIsSimulatingSkill] = useState<boolean>(false);
  const [showSkillGapModal, setShowSkillGapModal] = useState<boolean>(false);
  const [showRoadmapModal, setShowRoadmapModal] = useState<boolean>(false);
  const [showInterviewModal, setShowInterviewModal] = useState<boolean>(false);
  const [interviewData, setInterviewData] = useState<any>(null);
  const [isLoadingInterview, setIsLoadingInterview] = useState<boolean>(false);

  // Interactive UI tuning
  const [availableHours, setAvailableHours] = useState<number>(4);
  const [selectedBreakType, setSelectedBreakType] = useState<string>("MATERNITY");
  const [selectedSkills, setSelectedSkills] = useState<string[]>(["SQL", "PYTHON", "JAVA", "POWER BI"]);
  const [activePathwayIndex, setActivePathwayIndex] = useState<number>(0);

  // Modals (including GFG Module 1 Credibility & Transparency Modals)
  const [showPassportModal, setShowPassportModal] = useState<boolean>(false);
  const [passportData, setPassportData] = useState<any>(null);
  const [passportConsent, setPassportConsent] = useState<boolean>(false);
  const [showJobsModal, setShowJobsModal] = useState<boolean>(false);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [showDashboardModal, setShowDashboardModal] = useState<boolean>(false);
  const [showScoringModal, setShowScoringModal] = useState<boolean>(false);
  const [scoringDefaultTab, setScoringDefaultTab] = useState<"readiness" | "matching" | "simulation" | "confidence">("readiness");
  const [showMentorshipModal, setShowMentorshipModal] = useState<boolean>(false);
  const [mentorshipInitialTab, setMentorshipInitialTab] = useState<"mentors" | "sessions" | "circles" | "interview" | "safety">("mentors");
  const [showStoryModal, setShowStoryModal] = useState<boolean>(false);
  const [showAlumniModal, setShowAlumniModal] = useState<boolean>(false);
  const [showAdminModal, setShowAdminModal] = useState<boolean>(false);
  const [showOnboardingModal, setShowOnboardingModal] = useState<boolean>(false);
  const [showDigitalTwinModal, setShowDigitalTwinModal] = useState<boolean>(false);
  const [showSimulatorModal, setShowSimulatorModal] = useState<boolean>(false);
  const [applyingJobId, setApplyingJobId] = useState<string | null>(null);

  // Module 9: Inclusivity, Accessibility & Financial Independence State
  const { t, locale } = useTranslation();
  const { lowBandwidthMode } = useBandwidth();
  const { highContrast } = useAccessibility();

  const [showA11yModal, setShowA11yModal] = useState<boolean>(false);
  const [showVoiceModal, setShowVoiceModal] = useState<boolean>(false);
  const [showEntrepreneurshipModal, setShowEntrepreneurshipModal] = useState<boolean>(false);
  const [entrepreneurshipInitialTab, setEntrepreneurshipInitialTab] = useState<"pricing" | "planner" | "expenses" | "proposals" | "sectors">("pricing");
  const [showWorkLifeModal, setShowWorkLifeModal] = useState<boolean>(false);
  const [workLifeFilters, setWorkLifeFilters] = useState<WorkLifeFilters>({
    workMode: "all",
    partTimeOnly: false,
    flexibleHoursOnly: false,
    maxCommuteKm: 25,
    childcareRequired: false,
    returnshipCohortOnly: false,
  });

  // Module 10: Employer Intelligence & Returnship Toolkit
  const [showEmployerModal, setShowEmployerModal] = useState<boolean>(false);
  const [employerInitialTab, setEmployerInitialTab] = useState<
    "dashboard" | "candidates" | "builder" | "toolkit" | "analytics" | "verification"
  >("dashboard");

  const handleOpenEmployerDesk = (
    tab: "dashboard" | "candidates" | "builder" | "toolkit" | "analytics" | "verification" = "dashboard"
  ) => {
    setEmployerInitialTab(tab);
    setShowEmployerModal(true);
  };

  // Module 11: Government Pilot & Impact Analytics
  const [showGovernmentModal, setShowGovernmentModal] = useState<boolean>(false);
  const [governmentInitialTab, setGovernmentInitialTab] = useState<
    "dashboard" | "design" | "schemes" | "sdg" | "reporting" | "presentation"
  >("dashboard");

  // GFG Learning Hub & Verified Certificate System
  const [showLearningModal, setShowLearningModal] = useState<boolean>(false);

  const handleOpenGovernmentPilot = (
    tab: "dashboard" | "design" | "schemes" | "sdg" | "reporting" | "presentation" = "dashboard"
  ) => {
    setGovernmentInitialTab(tab);
    setShowGovernmentModal(true);
  };

  const handleGuidedRoute = (action: string) => {
    switch (action) {
      case "open_onboarding":
        setShowOnboardingModal(true);
        break;
      case "open_roadmap":
        handleGenerateRoadmap();
        break;
      case "open_opportunities":
        setShowJobsModal(true);
        break;
      case "open_flexible_filter":
        setShowWorkLifeModal(true);
        break;
      case "open_entrepreneurship":
        setEntrepreneurshipInitialTab("planner");
        setShowEntrepreneurshipModal(true);
        break;
      case "open_mentorship":
        setMentorshipInitialTab("mentors");
        setShowMentorshipModal(true);
        break;
      case "open_learning_hub":
        setShowLearningModal(true);
        break;
      default:
        setShowOnboardingModal(true);
    }
  };

  const handleOnboardingSuccess = async () => {
    setFeedbackMsg({
      type: "success",
      text: "Onboarding completed! Your personalized comeback plan is now live.",
    });
    await refreshCandidateData();
    setShowDashboardModal(true);
  };

  // Auto-authenticate as default demo user on mount
  useEffect(() => {
    switchDemoAccount("candidate");
  }, []);

  // Switch demo account helper supporting 4 roles
  const switchDemoAccount = async (role: PlatformRole) => {
    setIsLoading(true);
    setFeedbackMsg(null);
    setCurrentRole(role);

    try {
      let email = "ananya.raman@example.com";
      if (role === "employer") email = "hr@novatech.com";
      else if (role === "mentor") email = "mentor@gfg.com";
      else if (role === "admin") email = "admin@gfg.com";

      const loginRes = await api.login(email, "Password@123");
      setCurrentUser(loginRes.user);

      if (role === "candidate") {
        await refreshCandidateData();
      } else if (role === "employer") {
        await refreshEmployerData();
      }
    } catch (err: any) {
      console.warn("Using demo session:", err);
      if (role === "candidate") {
        setCurrentUser({
          id: DEMO_PERSONA.id,
          full_name: DEMO_PERSONA.full_name,
          email: DEMO_PERSONA.email,
          role: "candidate",
        });
      } else if (role === "employer") {
        setCurrentUser({
          id: DEMO_EMPLOYER.id,
          full_name: "Nova Tech HR",
          email: "hr@novatech.com",
          role: "employer",
        });
      } else if (role === "mentor") {
        setCurrentUser({
          id: DEMO_MENTOR.id,
          full_name: DEMO_MENTOR.name,
          email: "mentor@gfg.com",
          role: "mentor",
        });
      } else {
        setCurrentUser({
          id: "admin-gfg-01",
          full_name: "Platform Administrator",
          email: "admin@gfg.com",
          role: "admin",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const refreshCandidateData = async () => {
    try {
      const [dash, prof, jobsRes, apps, read, aiJobs] = await Promise.all([
        api.getCandidateDashboard().catch(() => null),
        api.getCandidateProfile().catch(() => null),
        api.getJobs({ limit: 10 }).catch(() => ({ data: [] })),
        api.getMyApplications().catch(() => []),
        api.getReadiness().catch(() => null),
        api.getAIJobMatches().catch(() => []),
      ]);

      if (dash) setDashboardData(dash);
      if (prof) setCandidateProfile(prof);
      setJobs(jobsRes.data || []);
      setMyApplications(apps || []);
      if (read) setReadinessData(read);
      if (aiJobs && aiJobs.length > 0) setAiMatches(aiJobs);

      if ((prof as any)?.available_hours_per_day) {
        setAvailableHours((prof as any).available_hours_per_day);
      }

      // Pick Data Analyst Returnship by Nova Technologies as the default featured job
      const demoJob =
        (jobsRes.data || []).find(
          (j: any) => j.title?.includes("Data Analyst") && j.company_name?.includes("Nova")
        ) || jobsRes.data?.[0];
      if (demoJob) {
        setSelectedJob(demoJob);
      }
    } catch (err: any) {
      console.error("Error refreshing candidate data:", err);
    }
  };

  const refreshEmployerData = async () => {
    try {
      const [dash, apps] = await Promise.all([
        api.getEmployerDashboard().catch(() => null),
        api.getEmployerApplications().catch(() => []),
      ]);
      if (dash) setDashboardData(dash);
      setEmployerApplications(apps || []);
    } catch (err: any) {
      console.error("Error refreshing employer data:", err);
    }
  };

  // Candidate Apply to Returnship
  const handleApplyToJob = async (jobId: string) => {
    setApplyingJobId(jobId);
    setFeedbackMsg(null);
    try {
      await api.applyToJob(
        jobId,
        "Enthusiastic returning professional ready to contribute to this returnship track."
      );
      setFeedbackMsg({
        type: "success",
        text: "Application successfully submitted. Status updated to SUBMITTED.",
      });
      await refreshCandidateData();
    } catch (err: any) {
      setFeedbackMsg({
        type: "error",
        text: err.message || "Unable to submit application.",
      });
    } finally {
      setApplyingJobId(null);
    }
  };

  // Employer Shortlist Candidate
  const handleShortlistCandidate = async (appId: string) => {
    try {
      await api.updateApplicationStatus(appId, "shortlisted");
      setFeedbackMsg({
        type: "success",
        text: "Candidate shortlisted. Status synchronized in real-time.",
      });
      await refreshEmployerData();
    } catch (err: any) {
      setFeedbackMsg({
        type: "error",
        text: err.message || "Failed to update candidate status.",
      });
    }
  };

  // Module 3: AI Career Analysis
  const handleAnalyzeCareer = async () => {
    setIsAnalyzingCareer(true);
    setFeedbackMsg(null);
    try {
      const [gap, read] = await Promise.all([
        api.getSkillGap("Data Analyst"),
        api.getReadiness(),
      ]);
      setSkillGapData(gap);
      setReadinessData(read);
      setShowSkillGapModal(true);
      setFeedbackMsg({
        type: "success",
        text: "Career Intelligence successfully synthesized by AI layer.",
      });
    } catch (err: any) {
      setFeedbackMsg({
        type: "error",
        text: err.message || "Failed to analyze career skills.",
      });
    } finally {
      setIsAnalyzingCareer(false);
    }
  };

  // Module 5: Adaptive Career Learning Engine
  const handleGenerateRoadmap = () => {
    setShowRoadmapModal(true);
  };

  // Module 3: "What if I learn this skill?" Simulation
  const handleSimulateSkill = async (skillName: string = "Power BI") => {
    if (!selectedJob) return;
    if (isSimulated) {
      setIsSimulated(false);
      setSimulationResult(null);
      return;
    }
    setIsSimulatingSkill(true);
    try {
      const sim = await api.simulateSkill(selectedJob.id, skillName);
      setSimulationResult(sim);
      setIsSimulated(true);
      setFeedbackMsg({
        type: "success",
        text: `Simulation: Adding ${skillName} elevates estimated match to ${sim.projected_score}%.`,
      });
    } catch (err: any) {
      setFeedbackMsg({
        type: "error",
        text: err.message || "Simulation failed.",
      });
    } finally {
      setIsSimulatingSkill(false);
    }
  };

  // Module 3: AI Interview Coach
  const handleOpenInterviewPrep = async () => {
    if (!selectedJob) return;
    setIsLoadingInterview(true);
    setShowInterviewModal(true);
    try {
      const data = await api.getInterviewQuestions(selectedJob.id);
      setInterviewData(data);
    } catch (err: any) {
      console.error("Failed to load interview prep:", err);
    } finally {
      setIsLoadingInterview(false);
    }
  };

  // Open Career Continuity Passport
  const handleOpenPassport = async () => {
    try {
      const data = await api.getAIPassport();
      setPassportData(data);
      setShowPassportModal(true);
    } catch (err) {
      setShowPassportModal(true);
    }
  };

  // Update candidate availability hours
  const handleUpdateHours = async (hours: number) => {
    setAvailableHours(hours);
    try {
      await api.updateCandidateProfile({ available_hours_per_day: hours });
      setFeedbackMsg({ type: "success", text: `Availability set to ${hours} hours/day.` });
      await refreshCandidateData();
    } catch (err) {
      console.error(err);
    }
  };

  const toggleSkill = (skill: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const isAppliedToSelectedJob =
    selectedJob && myApplications.some((a) => a.job_id === selectedJob.id);
  const activePathway = PATHWAYS[activePathwayIndex];

  return (
    <div className="min-h-screen bg-[#111111] text-[#F1E7DB] font-sans antialiased selection:bg-[#A56F7C] selection:text-[#F1E7DB] relative">
      {/* Background Architectural Geometry (Section 7) */}
      <BackgroundGeometry />

      {/* Global Demonstration Environment Banner (Task 2) */}
      <DemoModeBanner
        onOpenPolicyModal={() => {
          setScoringDefaultTab("readiness");
          setShowScoringModal(true);
        }}
      />

      {/* Minimal Editorial Navigation (Section 5 & Module 9) */}
      <EditorialNavigation
        currentUser={currentUser}
        currentRole={currentRole}
        onOpenAuth={() => setShowAuthModal(true)}
        onOpenDashboard={() => {
          if (currentRole === "employer") {
            handleOpenEmployerDesk("dashboard");
          } else {
            setShowDashboardModal(true);
          }
        }}
        onOpenPassport={handleOpenPassport}
        onOpenAdmin={() => setShowAdminModal(true)}
        onOpenOnboarding={() => setShowOnboardingModal(true)}
        onOpenDigitalTwin={() => setShowDigitalTwinModal(true)}
        onOpenSimulator={() => setShowSimulatorModal(true)}
        onOpenRoadmap={handleGenerateRoadmap}
        onOpenCommunity={(tab) => {
          setMentorshipInitialTab(tab || "mentors");
          setShowMentorshipModal(true);
        }}
        onOpenA11y={() => setShowA11yModal(true)}
        onOpenVoice={() => setShowVoiceModal(true)}
        onOpenEntrepreneurship={() => {
          setEntrepreneurshipInitialTab("pricing");
          setShowEntrepreneurshipModal(true);
        }}
        onOpenWorkLife={() => setShowWorkLifeModal(true)}
        onOpenEmployerDesk={handleOpenEmployerDesk}
        onOpenGovernmentPilot={handleOpenGovernmentPilot}
        onOpenLearningHub={() => setShowLearningModal(true)}
        onSwitchRole={switchDemoAccount}
      />

      <main id="main-content" tabIndex={-1} className="focus:outline-none">

      {/* Notification Toast Strip */}
      {feedbackMsg && (
        <div
          className={`fixed top-28 left-1/2 -translate-x-1/2 z-50 py-3 px-6 rounded-full border flex items-center gap-3 text-xs tracking-wider uppercase backdrop-blur-md shadow-lg transition-all animate-in fade-in ${
            feedbackMsg.type === "success"
              ? "bg-[#181818]/95 border-[#D8C2A6]/40 text-[#F1E7DB]"
              : "bg-red-950/90 border-red-500/40 text-red-200"
          }`}
        >
          {feedbackMsg.type === "success" ? (
            <Check className="w-3.5 h-3.5 text-[#D8C2A6]" />
          ) : (
            <AlertCircle className="w-3.5 h-3.5 text-red-400" />
          )}
          <span>{feedbackMsg.text}</span>
          <button
            onClick={() => setFeedbackMsg(null)}
            className="p-1 hover:text-white transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* ============================================================ */}
      {/* 6. HOMEPAGE HERO (95–100vh Full Screen Editorial Impact)     */}
      {/* ============================================================ */}
      <section
        id="home"
        className="relative min-h-[96vh] flex flex-col justify-between pt-28 pb-12 px-6 md:px-12 lg:px-16 max-w-7xl mx-auto z-10"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center my-auto">
          {/* LEFT SIDE: Confident Editorial Typography */}
          <div className="lg:col-span-7 space-y-8 lg:pr-8">
            {/* Micro label with Data Classification & AI Translation Disclaimer */}
            <div className="flex flex-wrap items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-[#A56F7C]" />
              <span className="micro-label">01 / BEGIN AGAIN // GFG PLATFORM</span>
              <DataClassificationBadge type="simulated_demonstration" size="sm" />
              <AiTranslationDisclaimer />
            </div>

            {/* Headline: RETURN. REBUILD. RISE. */}
            <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-light tracking-tighter leading-[0.9] text-[#F1E7DB] uppercase">
              RETURN. <br />
              REBUILD. <br />
              <span className="text-[#D8C2A6] italic font-serif">RISE.</span>
            </h1>

            {/* Supporting description */}
            <p className="text-base sm:text-lg text-[#9A9A9A] max-w-xl font-normal leading-relaxed">
              {t("hero.subtitle")}
            </p>

            {/* Small elegant CTAs (Section 6 & 25 & Module 9) */}
            <div className="pt-4 flex flex-wrap items-center gap-3 sm:gap-4">
              <a
                href="#guided-assistance"
                className="btn-editorial-primary"
              >
                <span>{t("hero.cta_primary")}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>

              <button
                type="button"
                onClick={() => {
                  setEntrepreneurshipInitialTab("pricing");
                  setShowEntrepreneurshipModal(true);
                }}
                className="btn-editorial-rose"
              >
                <span>{t("hero.cta_entrepreneurship")}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>

              <a
                href="#pathways"
                className="btn-editorial-secondary"
              >
                <span>{t("hero.cta_secondary")}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </a>

              <button
                type="button"
                onClick={() => setShowLearningModal(true)}
                className="btn-editorial-secondary flex items-center gap-2 border-[#D8C2A6]/40 text-[#D8C2A6] hover:bg-[#D8C2A6]/10"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>{t("nav.learning_hub")}</span>
              </button>
            </div>

            {/* Micro supporting metadata */}
            <div className="pt-8 border-t border-[#D8C2A6]/10 flex items-center justify-between text-[11px] font-mono tracking-widest text-[#9A9A9A] uppercase">
              <span>TENURE PRESERVED • SKILLS VERIFIED</span>
              <span className="text-[#A56F7C]">TIER 1 RETURN PARTNERS</span>
            </div>
          </div>

          {/* RIGHT SIDE: One Dominant Focal Editorial Portrait */}
          <div className="lg:col-span-5 relative flex justify-center">
            <div className="relative w-full max-w-md aspect-[3/4] rounded-2xl overflow-hidden border border-[#D8C2A6]/20 shadow-2xl group">
              <Image
                src={activePathway.image}
                alt="Editorial Portrait — Ambition, Growth, Returning Professional"
                fill
                priority
                className="object-cover object-center grayscale contrast-110 group-hover:scale-102 transition-transform duration-700"
                sizes="(max-width: 768px) 100vw, 500px"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#111111]/90 via-transparent to-transparent" />

              {/* Minimal Focal Label on Image */}
              <div className="absolute bottom-6 left-6 right-6 p-4 rounded-xl bg-[#181818]/85 backdrop-blur-md border border-[#D8C2A6]/15 text-[#F1E7DB]">
                <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-widest text-[#A56F7C] mb-1">
                  <span>{activePathway.tag}</span>
                  <span className="text-[#D8C2A6]">{activePathway.readinessBoost} MATCH</span>
                </div>
                <div className="text-sm font-semibold tracking-wide text-[#F1E7DB]">
                  {activePathway.name}
                </div>
                <div className="text-[11px] text-[#9A9A9A] mt-0.5">
                  Target: {activePathway.timeframe} • Asynchronous & Mentored
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 10. BOTTOM HORIZONTAL PATHWAY SELECTOR STRIP (Inspired by Reference Image) */}
        <div className="w-full pt-8 border-t border-[#D8C2A6]/10 mt-8">
          <div className="flex items-center justify-between mb-3 text-[11px] font-mono uppercase tracking-widest text-[#9A9A9A]">
            <span>SELECT COMEBACK TRACK</span>
            <span className="text-[#A56F7C]">0{activePathwayIndex + 1} / 07 ACTIVE</span>
          </div>

          <div className="flex items-stretch gap-2 overflow-x-auto pb-2 scrollbar-none">
            {PATHWAYS.map((p, idx) => {
              const isActive = idx === activePathwayIndex;
              return (
                <button
                  key={p.id}
                  onClick={() => setActivePathwayIndex(idx)}
                  className={`px-4 py-3 rounded-lg border text-left shrink-0 transition-all font-mono text-xs flex flex-col gap-1 min-w-[170px] ${
                    isActive
                      ? "bg-[#181818] border-[#D8C2A6] text-[#F1E7DB]"
                      : "bg-[#111111]/60 border-[#D8C2A6]/10 text-[#9A9A9A] hover:border-[#D8C2A6]/30 hover:text-[#F1E7DB]"
                  }`}
                >
                  <span className={`text-[10px] ${isActive ? "text-[#A56F7C]" : "text-[#9A9A9A]"}`}>
                    {p.id} //
                  </span>
                  <span className="font-sans font-medium text-xs truncate">
                    {p.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* PART 7: TELL US WHAT YOU NEED (Guided Assistance Module 9)   */}
      {/* ============================================================ */}
      <GuidedAssistanceSection onRoute={handleGuidedRoute} />

      {/* ============================================================ */}
      {/* 9. STATEMENT: YOUR BREAK DOES NOT DEFINE YOUR CAREER          */}
      {/* ============================================================ */}
      <section
        id="about"
        className="py-28 px-6 md:px-12 lg:px-16 max-w-7xl mx-auto border-t border-[#D8C2A6]/10 relative z-10"
      >
        <div className="max-w-4xl space-y-8">
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-[#D8C2A6]" />
            <span className="micro-label">CAREER / RESTART // STATEMENT OF MERIT</span>
          </div>

          <h2 className="text-4xl sm:text-6xl md:text-7xl font-light tracking-tight leading-[0.98] text-[#F1E7DB]">
            YOUR BREAK DOES NOT DEFINE YOUR CAREER.
          </h2>

          <p className="font-serif italic text-xl md:text-2xl text-[#D8C2A6] leading-relaxed max-w-3xl">
            Hard-won engineering acumen, architecture decisions, and strategic problem-solving do not evaporate.
            We treat career breaks respectfully as chapters of life, not professional deficits.
          </p>

          <p className="text-sm md:text-base text-[#9A9A9A] leading-relaxed max-w-2xl font-light">
            Through verified Career Passports, calibrated refresh modules, and curated returnship
            tracks, GFG bridges the transition from pause back into full technical leadership.
          </p>
        </div>

        {/* Editorial Pillars (Generous negative space, thin structural lines) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20 pt-10 border-t border-[#D8C2A6]/10">
          <div className="space-y-3">
            <span className="micro-label text-[#A56F7C]">01 / TENURE PRESERVATION</span>
            <div className="text-lg font-medium text-[#F1E7DB]">Pre-Break Seniority Counts</div>
            <p className="text-xs text-[#9A9A9A] leading-relaxed">
              Your 4.5+ years of software design are formally credited, preventing demotion or entry-level reset.
            </p>
          </div>

          <div className="space-y-3">
            <span className="micro-label text-[#D8C2A6]">02 / TARGETED CALIBRATION</span>
            <div className="text-lg font-medium text-[#F1E7DB]">Precision Upskilling</div>
            <p className="text-xs text-[#9A9A9A] leading-relaxed">
              AI maps exactly which micro-competencies have shifted so you learn only what you need.
            </p>
          </div>

          <div className="space-y-3">
            <span className="micro-label text-[#A56F7C]">03 / DIRECT RETURNSHIPS</span>
            <div className="text-lg font-medium text-[#F1E7DB]">Equitable Corporate Rails</div>
            <p className="text-xs text-[#9A9A9A] leading-relaxed">
              Partner employers offer 4-month transition contracts designed specifically for returning talent.
            </p>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 10. CHOOSE YOUR COMEBACK PATHWAY SHOWCASE                     */}
      {/* ============================================================ */}
      <section
        id="pathways"
        className="py-24 px-6 md:px-12 lg:px-16 max-w-7xl mx-auto border-t border-[#D8C2A6]/10 relative z-10"
      >
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="space-y-2">
            <span className="micro-label text-[#A56F7C]">PATHWAY / 04 // FOCUS</span>
            <h2 className="text-4xl sm:text-6xl font-light tracking-tight text-[#F1E7DB]">
              CHOOSE YOUR COMEBACK PATH.
            </h2>
          </div>
          <span className="text-xs font-mono uppercase tracking-widest text-[#9A9A9A]">
            SMOOTH TRANSITIONAL RAILS
          </span>
        </div>

        {/* Active Pathway Detail Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center p-8 md:p-12 rounded-2xl bg-[#181818]/60 border border-[#D8C2A6]/15">
          <div className="lg:col-span-7 space-y-6">
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-[#D8C2A6]">{activePathway.tag}</span>
              <span className="text-xs text-[#9A9A9A]">•</span>
              <span className="text-xs font-mono text-[#A56F7C]">{activePathway.timeframe}</span>
            </div>

            <h3 className="text-2xl sm:text-4xl font-light text-[#F1E7DB] tracking-tight">
              {activePathway.headline}
            </h3>

            <p className="text-sm text-[#9A9A9A] leading-relaxed font-light">
              {activePathway.desc}
            </p>

            <div className="space-y-3 pt-4 border-t border-[#D8C2A6]/10">
              <span className="micro-label-muted text-[10px]">RECOMMENDED SKILL ACCELERATORS:</span>
              <div className="flex flex-wrap gap-2">
                {activePathway.skills.map((sk) => (
                  <span
                    key={sk}
                    className="px-3 py-1 rounded-full text-xs font-mono bg-[#111111] border border-[#D8C2A6]/20 text-[#D8C2A6]"
                  >
                    {sk}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-4 flex items-center gap-4">
              <button
                onClick={handleGenerateRoadmap}
                className="btn-editorial-primary text-xs"
              >
                <span>Generate {activePathway.name} Plan</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="lg:col-span-5 relative aspect-[4/3] rounded-xl overflow-hidden border border-[#D8C2A6]/15">
            <Image
              src={activePathway.image}
              alt={activePathway.name}
              fill
              className="object-cover object-center grayscale contrast-115"
            />
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 11. REBUILD YOUR SKILLS (Focused Category & Simulation)       */}
      {/* ============================================================ */}
      <section
        id="skills"
        className="py-24 px-6 md:px-12 lg:px-16 max-w-7xl mx-auto border-t border-[#D8C2A6]/10 relative z-10"
      >
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="space-y-2">
            <span className="micro-label text-[#A56F7C]">SKILLS / ACTIVE // FOCUS CATEGORY</span>
            <h2 className="text-4xl sm:text-6xl font-light tracking-tight text-[#F1E7DB]">
              REBUILD YOUR SKILLS.
            </h2>
          </div>
          <span className="text-xs font-mono uppercase tracking-widest text-[#9A9A9A]">
            ONE FOCUSED DISCIPLINE AT A TIME
          </span>
        </div>

        {/* Editorial Single Category Spotlight (Section 11) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left: Skill Metric Card */}
          <div className="lg:col-span-6 space-y-6">
            <div className="space-y-1">
              <span className="micro-label text-[#D8C2A6]">SKILL / 03 // DISCIPLINE</span>
              <h3 className="text-3xl sm:text-5xl font-light text-[#F1E7DB] tracking-tight">
                DATA ANALYTICS
              </h3>
            </div>

            {/* Linear Progress Indicator */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-[#9A9A9A]">CURRENT READINESS</span>
                <span className="text-[#F1E7DB] font-semibold">62%</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-[#181818] overflow-hidden">
                <div className="h-full bg-[#D8C2A6] w-[62%] transition-all duration-700" />
              </div>
            </div>

            <div className="space-y-3 pt-2 text-xs font-mono text-[#9A9A9A]">
              <div className="flex justify-between py-2 border-b border-[#D8C2A6]/10">
                <span>NEXT MILESTONE</span>
                <span className="text-[#F1E7DB]">Advanced Excel & Power BI</span>
              </div>
              <div className="flex justify-between py-2 border-b border-[#D8C2A6]/10">
                <span>RECOMMENDED LEARNING</span>
                <span className="text-[#F1E7DB]">3 Focused Modules (12 Hours)</span>
              </div>
              <div className="flex justify-between py-2 border-b border-[#D8C2A6]/10">
                <span>PROJECTED MATCH BOOST</span>
                <span className="text-[#A56F7C] font-semibold">+7% Alignment</span>
              </div>
            </div>

            <div className="pt-2 flex items-center gap-4">
              <button
                onClick={handleGenerateRoadmap}
                className="btn-editorial-primary text-xs"
              >
                <span>Continue Learning →</span>
              </button>
            </div>
          </div>

          {/* Right: Interactive Skill Simulation Box (Section 52 AI) */}
          <div className="lg:col-span-6 p-8 rounded-2xl bg-[#181818] border border-[#D8C2A6]/15 space-y-6">
            <div className="flex items-center justify-between">
              <span className="micro-label text-[#A56F7C]">SIMULATION ENGINE</span>
              <Zap className="w-4 h-4 text-[#D8C2A6]" />
            </div>

            <div className="space-y-2">
              <h4 className="text-xl font-medium text-[#F1E7DB]">
                &ldquo;What if I learn Power BI?&rdquo;
              </h4>
              <p className="text-xs text-[#9A9A9A] leading-relaxed font-light">
                Test how completing Power BI DAX modeling elevates your compatibility for the featured
                Data Analyst Returnship at Nova Technologies.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#111111] border border-[#D8C2A6]/10 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono text-[#9A9A9A] uppercase block">
                  PROJECTED SCORE
                </span>
                <span className="text-2xl font-light text-[#D8C2A6]">
                  {isSimulated ? `${simulationResult?.projected_score || 94}%` : "87%"}
                </span>
              </div>

              <button
                onClick={() => handleSimulateSkill("Power BI")}
                disabled={isSimulatingSkill}
                className={`px-4 py-2 rounded-full font-mono text-xs uppercase tracking-wider transition-all ${
                  isSimulated
                    ? "bg-[#A56F7C] text-[#F1E7DB]"
                    : "bg-[#D8C2A6] text-[#111111] hover:bg-[#F1E7DB]"
                }`}
              >
                {isSimulatingSkill
                  ? "Computing..."
                  : isSimulated
                  ? "Active (+7% Boost)"
                  : "Simulate Power BI"}
              </button>
            </div>

            <div className="text-[11px] font-mono text-[#9A9A9A] flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#A56F7C]" />
              <span>Synthesized using real employer returnship rubrics</span>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 12. LEARNING ROADMAP (Vertical Career Roadmap)                */}
      {/* ============================================================ */}
      <section
        id="roadmap"
        className="py-24 px-6 md:px-12 lg:px-16 max-w-7xl mx-auto border-t border-[#D8C2A6]/10 relative z-10"
      >
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="space-y-2">
            <span className="micro-label text-[#A56F7C]">PROGRESS / 72% // ROADMAP</span>
            <h2 className="text-4xl sm:text-6xl font-light tracking-tight text-[#F1E7DB]">
              LEARNING ROADMAP.
            </h2>
          </div>

          {/* Daily Hours Capacity Tuner */}
          <div className="flex items-center gap-3 text-xs font-mono">
            <span className="text-[#9A9A9A]">DAILY CAPACITY:</span>
            <div className="flex gap-1.5">
              {[2, 4, 6, 8].map((h) => (
                <button
                  key={h}
                  onClick={() => handleUpdateHours(h)}
                  className={`px-3 py-1 rounded-full text-xs font-mono transition-all ${
                    availableHours === h
                      ? "bg-[#D8C2A6] text-[#111111] font-semibold"
                      : "bg-[#181818] text-[#9A9A9A] hover:text-[#F1E7DB]"
                  }`}
                >
                  {h}h
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Vertical Career Roadmap Steps (Section 12: Active step dominant, typography, lines) */}
        <div className="relative pl-6 md:pl-10 space-y-12 border-l border-[#D8C2A6]/20">
          {[
            {
              num: "01",
              title: "Foundation",
              desc: "SQL relational architecture, schema optimization, and window functions.",
              state: "COMPLETED",
              active: false,
            },
            {
              num: "02",
              title: "Skill Refresh",
              desc: "Python for Data Analysis: vector computation, pandas manipulation, and exploratory reporting.",
              state: "COMPLETED",
              active: false,
            },
            {
              num: "03",
              title: "Practical Project",
              desc: "Customer churn analytics capstone deployed with automated data ingestion pipelines.",
              state: "IN PROGRESS",
              active: true,
            },
            {
              num: "04",
              title: "Interview Preparation",
              desc: "Role-specific behavioral framing for career breaks and technical coding case studies.",
              state: "UPCOMING",
              active: false,
            },
            {
              num: "05",
              title: "Return-to-Work Ready",
              desc: "Verified Career Passport generation and direct employer interview scheduling.",
              state: "UPCOMING",
              active: false,
            },
          ].map((step) => (
            <div key={step.num} className="relative group">
              {/* Bullet Node on Vertical Line */}
              <div
                className={`absolute -left-[31px] md:-left-[47px] top-1.5 w-3.5 h-3.5 rounded-full border-2 transition-all ${
                  step.active
                    ? "bg-[#D8C2A6] border-[#111111] shadow-[0_0_12px_rgba(216,194,166,0.6)]"
                    : step.state === "COMPLETED"
                    ? "bg-[#A56F7C] border-[#111111]"
                    : "bg-[#181818] border-[#9A9A9A]/30"
                }`}
              />

              <div
                className={`transition-all ${
                  step.active
                    ? "p-6 rounded-xl bg-[#181818] border border-[#D8C2A6]/25 shadow-lg"
                    : "opacity-75 hover:opacity-100"
                }`}
              >
                <div className="flex items-center gap-3 text-xs font-mono uppercase tracking-widest mb-1">
                  <span className={step.active ? "text-[#A56F7C] font-semibold" : "text-[#9A9A9A]"}>
                    STEP {step.num}
                  </span>
                  <span className="text-[#9A9A9A]">•</span>
                  <span className="text-[10px] text-[#D8C2A6]">{step.state}</span>
                </div>

                <div
                  className={`text-2xl sm:text-3xl font-light tracking-tight ${
                    step.active ? "text-[#F1E7DB]" : "text-[#9A9A9A]"
                  }`}
                >
                  {step.title}
                </div>

                <p className="text-xs sm:text-sm text-[#9A9A9A] mt-2 max-w-2xl font-light leading-relaxed">
                  {step.desc}
                </p>

                {step.active && (
                  <div className="pt-4 flex items-center gap-3">
                    <button
                      onClick={handleGenerateRoadmap}
                      className="btn-editorial-primary text-xs py-2 px-4"
                    >
                      <span>Open Full 8-Week Schedule</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ============================================================ */}
      {/* 13. PERSONAL DASHBOARD (Minimal numbers & telemetry)          */}
      {/* ============================================================ */}
      <section
        id="dashboard"
        className="py-24 px-6 md:px-12 lg:px-16 max-w-7xl mx-auto border-t border-[#D8C2A6]/10 relative z-10"
      >
        <div className="border-b border-[#D8C2A6]/10 pb-8 mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="micro-label text-[#A56F7C]">
                {currentRole === "candidate" ? "CANDIDATE INTELLIGENCE" : "EMPLOYER RECRUITER DESK"}
              </span>
              <DataClassificationBadge classification="simulated" label="SAMPLE PERSONA DATA" />
            </div>
            <h2 className="text-4xl sm:text-6xl font-light tracking-tight text-[#F1E7DB]">
              WELCOME BACK. <br />
              <span className="text-[#D8C2A6] italic font-serif">
                {currentRole === "candidate"
                  ? `${(currentUser?.full_name || DEMO_PERSONA.full_name).toUpperCase()}.`
                  : "NOVA TECHNOLOGIES."}
              </span>
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => switchDemoAccount(currentRole === "candidate" ? "employer" : "candidate")}
              className="btn-editorial-secondary text-xs"
            >
              <span>Switch to {currentRole === "candidate" ? "Nova Tech (Employer)" : "Ananya (Candidate)"}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => {
                setScoringDefaultTab("readiness");
                setShowScoringModal(true);
              }}
              className="px-3 py-1.5 rounded-lg border border-[#D8C2A6]/20 bg-[#181818] text-[#D8C2A6] hover:bg-[#222222] text-xs font-mono transition-colors"
            >
              How are scores calculated?
            </button>
          </div>
        </div>

        {/* Calm Big Numbers Grid (Section 13) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-6">
          <div className="space-y-1">
            <div className="flex items-baseline justify-between">
              <span className="text-5xl md:text-6xl font-light text-[#F1E7DB] tracking-tight">
                {readinessData?.readiness_score || 82}%
              </span>
            </div>
            <div className="micro-label-muted flex items-center justify-between">
              <span>CAREER READINESS</span>
              <button
                onClick={() => {
                  setScoringDefaultTab("readiness");
                  setShowScoringModal(true);
                }}
                className="text-[10px] text-[#A56F7C] underline hover:text-[#D8C2A6] font-mono lowercase"
              >
                disclosure
              </button>
            </div>
            <p className="text-xs text-[#9A9A9A]">Top tier • Returnship qualified</p>
          </div>

          <div className="space-y-1">
            <div className="flex items-baseline justify-between">
              <span className="text-5xl md:text-6xl font-light text-[#D8C2A6] tracking-tight">
                {isSimulated ? (simulationResult?.projected_score || 94) : 89}%
              </span>
            </div>
            <div className="micro-label-muted flex items-center justify-between">
              <span>TOP MATCH SCORE</span>
              <button
                onClick={() => {
                  setScoringDefaultTab("matching");
                  setShowScoringModal(true);
                }}
                className="text-[10px] text-[#A56F7C] underline hover:text-[#D8C2A6] font-mono lowercase"
              >
                disclosure
              </button>
            </div>
            <p className="text-xs text-[#9A9A9A]">Nova Technologies Data Track</p>
          </div>

          <div className="space-y-1">
            <span className="text-5xl md:text-6xl font-light text-[#A56F7C] tracking-tight">
              03
            </span>
            <div className="micro-label-muted">MENTOR SESSIONS</div>
            <p className="text-xs text-[#9A9A9A]">1 Upcoming with Dr. Meera Iyer</p>
          </div>

          <div className="space-y-1">
            <span className="text-5xl md:text-6xl font-light text-[#F1E7DB] tracking-tight">
              {myApplications.length || 1}
            </span>
            <div className="micro-label-muted">MATCHED OPPORTUNITIES</div>
            <p className="text-xs text-[#9A9A9A]">Active applications tracked</p>
          </div>
        </div>

        {/* Next Recommended Action Card */}
        <div className="mt-8 p-6 rounded-xl bg-[#181818] border border-[#D8C2A6]/15 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="micro-label text-[#A56F7C]">NEXT RECOMMENDED ACTION</span>
              <DataClassificationBadge classification="simulated" label="ACTION TARGET" />
            </div>
            <div className="text-base text-[#F1E7DB] font-medium">
              Review Capstone Project & Export Verified Career Continuity Passport
            </div>
            <div className="text-xs text-[#9A9A9A] mt-0.5 font-mono">
              Tenure: {DEMO_METRICS.preBreakFormatted} ({DEMO_PERSONA.past_experience}) • Pause: {DEMO_METRICS.breakDurationFormatted} ({DEMO_PERSONA.break_reason})
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0 self-start sm:self-auto">
            <button
              onClick={() => setShowDigitalTwinModal(true)}
              className="btn-editorial-secondary text-xs border-blue-500/30 text-blue-200 hover:border-blue-400"
            >
              <span>AI Digital Twin ↗</span>
            </button>
            <button
              onClick={() => setShowSimulatorModal(true)}
              className="btn-editorial-secondary text-xs border-cyan-500/30 text-cyan-200 hover:border-cyan-400"
            >
              <span>Future Simulator ↗</span>
            </button>
            <button
              onClick={handleOpenPassport}
              className="btn-editorial-primary text-xs"
            >
              <span>View Passport Protocol</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 14. AI CAREER GUIDANCE (Structured Blocks, Not Generic Chat) */}
      {/* ============================================================ */}
      <section
        id="ai-guidance"
        className="py-24 px-6 md:px-12 lg:px-16 max-w-7xl mx-auto border-t border-[#D8C2A6]/10 relative z-10"
      >
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="micro-label text-[#A56F7C]">INTELLIGENCE // SYNTHESIS</span>
              <DataClassificationBadge classification="simulated" label="AI INFERENCE" />
            </div>
            <h2 className="text-4xl sm:text-6xl font-light tracking-tight text-[#F1E7DB]">
              AI CAREER RECOMMENDATION.
            </h2>
          </div>
          <button
            onClick={() => {
              setScoringDefaultTab("confidence");
              setShowScoringModal(true);
            }}
            className="flex items-center gap-2 text-xs font-mono text-[#D8C2A6] hover:text-white px-3 py-1.5 rounded-lg border border-[#D8C2A6]/20 bg-[#181818]"
          >
            <span className="w-2 h-2 rounded-full bg-[#A56F7C]" />
            <span>CONFIDENCE: HIGH MATCH (88.4%)</span>
            <span className="text-[10px] text-[#A56F7C] underline ml-1 font-sans">Method</span>
          </button>
        </div>

        {/* Structured Recommendation Blocks (Section 14) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 rounded-xl bg-[#181818]/60 border border-[#D8C2A6]/10 space-y-3">
            <span className="micro-label text-[#9A9A9A]">YOUR PROFILE</span>
            <div className="text-xl font-light text-[#F1E7DB]">{DEMO_PERSONA.full_name}</div>
            <p className="text-xs text-[#9A9A9A] leading-relaxed">
              {DEMO_METRICS.preBreakFormatted} in {DEMO_PERSONA.past_experience}. Core strength in SQL, Python, and statistical ETL pipelines.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-[#181818]/60 border border-[#D8C2A6]/10 space-y-3">
            <span className="micro-label text-[#A56F7C]">CAREER GAP CONTEXT</span>
            <div className="text-xl font-light text-[#F1E7DB]">{DEMO_METRICS.breakDurationFormatted} ({DEMO_METRICS.breakDurationMonths} Mo) Pause</div>
            <p className="text-xs text-[#9A9A9A] leading-relaxed">
              {DEMO_PERSONA.break_reason} classified with zero tenure-depreciation penalty in scoring models.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-[#181818]/60 border border-[#D8C2A6]/10 space-y-3">
            <span className="micro-label text-[#D8C2A6]">RECOMMENDED PATH</span>
            <div className="text-xl font-light text-[#F1E7DB]">{DEMO_PERSONA.target_role} Track</div>
            <p className="text-xs text-[#9A9A9A] leading-relaxed">
              Pivoting algorithmic data manipulation into corporate BI, executive dashboards, and SQL analytics.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-[#181818]/60 border border-[#D8C2A6]/10 space-y-3">
            <span className="micro-label text-[#A56F7C]">NEXT ACTION</span>
            <div className="text-xl font-light text-[#F1E7DB]">Interview Coach</div>
            <button
              onClick={handleOpenInterviewPrep}
              className="mt-2 text-xs font-mono uppercase tracking-wider text-[#D8C2A6] hover:text-white flex items-center gap-1"
            >
              <span>Launch Prep Terminal →</span>
            </button>
          </div>
        </div>

        {/* AI Career Digital Twin Intelligence Banner */}
        <div className="mt-8 p-6 sm:p-8 rounded-2xl bg-[#181818] border border-blue-500/25 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-400" />
              <span className="micro-label text-blue-300 font-mono">03 // AI CAREER DIGITAL TWIN</span>
              <span className="px-2 py-0.5 rounded text-[10px] bg-blue-950 text-blue-300 border border-blue-500/30">
                DYNAMIC REASONING ENGINE
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-light text-[#F1E7DB]">
              Your Personal Career-Planning Intelligence Model
            </h3>
            <p className="text-xs text-[#9A9A9A] leading-relaxed">
              Inspect your 4-tier skill provenance inventory, verified industry gap benchmark against 5 occupations, explainable pathway matching, and interactive accessible Career Knowledge Graph.
            </p>
          </div>
          <button
            onClick={() => setShowDigitalTwinModal(true)}
            className="btn-editorial-primary text-xs py-3 px-6 shrink-0 bg-blue-600 hover:bg-blue-500 border-blue-400 text-white flex items-center gap-2"
          >
            <span>Launch Digital Twin</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* AI Career Future Simulator Spotlight Banner (Module 4) */}
        <div className="mt-4 p-6 sm:p-8 rounded-2xl bg-[#181818] border border-cyan-500/25 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              <span className="micro-label text-cyan-300 font-mono">04 // AI CAREER FUTURE SIMULATOR</span>
              <span className="px-2 py-0.5 rounded text-[10px] bg-cyan-950 text-cyan-300 border border-cyan-500/30">
                SCENARIO MODELING & OUTCOMES
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-light text-[#F1E7DB]">
              "What could change in my career if I take this step?"
            </h3>
            <p className="text-xs text-[#9A9A9A] leading-relaxed">
              Explore interactive split-screen projections across 7 scenarios: learn skills like Power BI, earn accredited certifications, pivot industries, adjust weekly hours, or start short-term returnships.
            </p>
          </div>
          <button
            onClick={() => setShowSimulatorModal(true)}
            className="btn-editorial-primary text-xs py-3 px-6 shrink-0 bg-cyan-600 hover:bg-cyan-500 border-cyan-400 text-white flex items-center gap-2"
          >
            <span>Launch Career Simulator</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 15. MENTORSHIP (Large Photography, Human Layout)             */}
      {/* ============================================================ */}
      <section
        id="mentorship"
        className="py-24 px-6 md:px-12 lg:px-16 max-w-7xl mx-auto border-t border-[#D8C2A6]/10 relative z-10"
      >
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="micro-label text-[#A56F7C]">MENTOR / AVAILABLE</span>
              <DataClassificationBadge classification="simulated" label="SAMPLE MENTOR PROFILE" />
            </div>
            <h2 className="text-4xl sm:text-6xl font-light tracking-tight text-[#F1E7DB]">
              GUIDED MENTORSHIP.
            </h2>
          </div>
          <span className="text-xs font-mono uppercase tracking-widest text-[#9A9A9A]">
            EXECUTIVE ALLIES WHO WALKED THE PATH
          </span>
        </div>

        {/* Editorial Mentor Profile Showcase (Section 15) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center p-8 md:p-12 rounded-2xl bg-[#181818]/60 border border-[#D8C2A6]/15">
          <div className="lg:col-span-5 relative aspect-[3/4] max-w-sm mx-auto rounded-xl overflow-hidden border border-[#D8C2A6]/20">
            <Image
              src="/images/editorial-mentor.jpg"
              alt={`Mentor ${DEMO_MENTOR.name}`}
              fill
              className="object-cover object-center grayscale contrast-110"
              sizes="(max-width: 768px) 100vw, 400px"
            />
          </div>

          <div className="lg:col-span-7 space-y-6">
            <div className="space-y-1">
              <span className="micro-label text-[#A56F7C]">MENTOR // VERIFIED GUIDE</span>
              <h3 className="text-3xl sm:text-5xl font-light text-[#F1E7DB] tracking-tight">
                {DEMO_MENTOR.name.toUpperCase()}
              </h3>
              <div className="text-sm font-mono text-[#D8C2A6] uppercase tracking-wider">
                {DEMO_MENTOR.title.toUpperCase()}
              </div>
            </div>

            <p className="text-base text-[#9A9A9A] leading-relaxed font-light">
              &ldquo;{DEMO_MENTOR.bio}&rdquo;
            </p>

            <div className="grid grid-cols-2 gap-4 py-4 border-y border-[#D8C2A6]/10 font-mono text-xs">
              <div>
                <span className="text-[#9A9A9A] block">ALUMNA</span>
                <span className="text-[#F1E7DB]">{DEMO_MENTOR.alumna}</span>
              </div>
              <div>
                <span className="text-[#9A9A9A] block">COMEBACK COHORT</span>
                <span className="text-[#A56F7C]">{DEMO_MENTOR.stats}</span>
              </div>
            </div>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                onClick={() => {
                  setMentorshipInitialTab("mentors");
                  setShowMentorshipModal(true);
                }}
                className="btn-editorial-primary text-xs"
              >
                <span>Find a Mentor (Directory & Matching)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => {
                  setMentorshipInitialTab("circles");
                  setShowMentorshipModal(true);
                }}
                className="btn-editorial-secondary text-xs border-emerald-500/30 text-emerald-300 hover:border-emerald-400"
              >
                <Users className="w-3.5 h-3.5 text-emerald-400" />
                <span>Comeback Circles (Peer Cohorts)</span>
              </button>
              <button
                onClick={() => {
                  setMentorshipInitialTab("interview");
                  setShowMentorshipModal(true);
                }}
                className="btn-editorial-secondary text-xs border-sky-500/30 text-sky-200 hover:border-sky-400"
              >
                <Brain className="w-3.5 h-3.5 text-sky-400" />
                <span>AI Interview Practice</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 16. JOBS / OPPORTUNITIES (Clean Vertical Feed)               */}
      {/* ============================================================ */}
      <section
        id="opportunities"
        className="py-24 px-6 md:px-12 lg:px-16 max-w-7xl mx-auto border-t border-[#D8C2A6]/10 relative z-10"
      >
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="micro-label text-[#A56F7C]">OPPORTUNITY / MATCHED</span>
              <DataClassificationBadge classification="simulated" label="SAMPLE OPPORTUNITY" />
            </div>
            <h2 className="text-4xl sm:text-6xl font-light tracking-tight text-[#F1E7DB]">
              DISCOVER OPPORTUNITIES.
            </h2>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => handleOpenEmployerDesk("dashboard")}
              className="px-4 py-2 rounded-full bg-[#2A1E22] hover:bg-[#38262C] text-[#E7C1C9] border border-[#523A40] text-xs font-mono uppercase tracking-wider transition-all flex items-center gap-1.5"
              title="Launch Module 10 Employer Intelligence Desk"
            >
              <Building2 className="w-3.5 h-3.5 text-[#E7C1C9]" />
              <span>Recruiter Desk & Toolkit</span>
            </button>
            <button
              onClick={() => setShowJobsModal(true)}
              className="btn-editorial-secondary text-xs"
            >
              <span>View Full Directory ({jobs.length})</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Clean Vertical Opportunity Feed (Section 16: Not dense card grids) */}
        <div className="divide-y divide-[#D8C2A6]/10 border-y border-[#D8C2A6]/10">
          {(jobs.length > 0
            ? jobs.slice(0, 4)
            : [
                {
                  id: "job-1",
                  title: "Data Analyst Returnship",
                  company_name: "Nova Technologies",
                  location: "Bengaluru, IN",
                  work_mode: "Hybrid",
                  compatibility: { match_score: 89 },
                },
              ]
          ).map((job, idx) => {
            const isApplied = myApplications.some((a) => a.job_id === job.id);
            return (
              <div
                key={job.id}
                className="py-8 flex flex-col md:flex-row md:items-center justify-between gap-6 group hover:bg-[#181818]/40 px-4 -mx-4 rounded-xl transition-all"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-3 text-xs font-mono uppercase tracking-wider">
                    <span className="text-[#A56F7C]">OPPORTUNITY / 0{idx + 1}</span>
                    <span className="text-[#9A9A9A]">•</span>
                    <span className="text-[#D8C2A6]">{job.company_name}</span>
                    <span className="text-[#9A9A9A]">•</span>
                    <span className="text-[#9A9A9A]">Returnship Friendly</span>
                  </div>

                  <h3 className="text-2xl sm:text-3xl font-light text-[#F1E7DB] group-hover:text-[#D8C2A6] transition-colors">
                    {job.title}
                  </h3>

                  <div className="text-xs font-mono text-[#9A9A9A] flex items-center gap-4">
                    <span>{job.location || "Bengaluru, IN"}</span>
                    <span>•</span>
                    <span>{job.work_mode?.toUpperCase() || "REMOTE"}</span>
                    <span>•</span>
                    <button
                      onClick={() => {
                        setScoringDefaultTab("matching");
                        setShowScoringModal(true);
                      }}
                      className="text-[#D8C2A6] hover:underline"
                    >
                      Match: {job.compatibility?.match_score || 89}% ⓘ
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <button
                    onClick={() => {
                      setSelectedJob(job);
                      handleOpenInterviewPrep();
                    }}
                    className="btn-editorial-secondary text-xs py-2.5 px-4"
                  >
                    <span>Interview Coach</span>
                  </button>

                  {currentRole === "candidate" && (
                    <button
                      onClick={() => handleApplyToJob(job.id)}
                      disabled={isApplied || applyingJobId === job.id}
                      className={`btn-editorial-primary text-xs py-2.5 px-5 ${
                        isApplied ? "opacity-60 cursor-not-allowed bg-[#242424] text-[#9A9A9A]" : ""
                      }`}
                    >
                      <span>
                        {isApplied
                          ? "Submitted ✓"
                          : applyingJobId === job.id
                          ? "Applying..."
                          : "Apply to Returnship →"}
                      </span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ============================================================ */}
      {/* 17. COMPANY / EMPLOYER PAGE & SHORTLISTING                   */}
      {/* ============================================================ */}
      <section
        id="employer-profile"
        className="py-24 px-6 md:px-12 lg:px-16 max-w-7xl mx-auto border-t border-[#D8C2A6]/10 relative z-10"
      >
        <div className="p-8 md:p-12 rounded-2xl bg-[#181818]/60 border border-[#D8C2A6]/15 space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#D8C2A6]/10 pb-6">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <span className="micro-label text-[#A56F7C]">PILOT EMPLOYER PARTNER</span>
                <DataClassificationBadge classification="simulated" label="SAMPLE PROFILE" />
              </div>
              <h3 className="text-3xl sm:text-5xl font-light text-[#F1E7DB] tracking-tight">
                {DEMO_EMPLOYER.name.toUpperCase()}
              </h3>
              <p className="text-xs text-[#9A9A9A] font-mono mt-1">
                {DEMO_EMPLOYER.industry}
              </p>
            </div>

            <div className="text-left md:text-right">
              <div className="flex items-baseline justify-end gap-2">
                <span className="text-3xl font-light text-[#D8C2A6]">{DEMO_EMPLOYER.breakFriendlyScore} / 100</span>
              </div>
              <div className="micro-label-muted text-[10px]">CAREER BREAK FRIENDLY SCORE</div>
              <button
                onClick={() => {
                  setScoringDefaultTab("matching");
                  setShowScoringModal(true);
                }}
                className="text-[10px] text-[#A56F7C] underline hover:text-[#D8C2A6] font-mono mt-1 block"
              >
                Rubric: 4 Verified Pillars
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 font-mono text-xs">
            <div>
              <span className="text-[#9A9A9A] block uppercase">FLEXIBLE WORK</span>
              <span className="text-[#F1E7DB] mt-1 block">Hybrid & Core-Hours Policy</span>
            </div>
            <div>
              <span className="text-[#9A9A9A] block uppercase">RETURNSHIP PROGRAM</span>
              <span className="text-[#F1E7DB] mt-1 block">4-Month Paid Cohort with Mentors</span>
            </div>
            <div>
              <span className="text-[#9A9A9A] block uppercase">SUPPORT POLICIES</span>
              <span className="text-[#F1E7DB] mt-1 block">Tenure Credit & Childcare Stipend</span>
            </div>
          </div>

          {/* Employer Shortlist Telemetry Table */}
          <div className="pt-6 border-t border-[#D8C2A6]/10">
            <div className="flex items-center justify-between mb-4">
              <span className="micro-label text-[#D8C2A6]">
                ACTIVE RETURN APPLICANTS ({employerApplications.length || 3})
              </span>
              <span className="text-[11px] font-mono text-[#9A9A9A]">
                REAL-TIME DATABASE RECRUITER DESK
              </span>
            </div>

            <div className="divide-y divide-[#D8C2A6]/10 text-xs font-mono">
              {[
                {
                  id: "app-1",
                  name: DEMO_PERSONA.full_name,
                  gap: `${DEMO_METRICS.breakDurationFormatted} (${DEMO_METRICS.breakDurationMonths} Mo) Family Leadership`,
                  exp: `${DEMO_METRICS.preBreakFormatted} (${DEMO_PERSONA.past_experience})`,
                  score: 89,
                },
                {
                  id: "app-2",
                  name: "Pooja Hegde",
                  gap: "18 Mo Elder Care Break",
                  exp: "5.0 Yrs (QA Automation)",
                  score: 84,
                },
                {
                  id: "app-3",
                  name: "Neha Verma",
                  gap: "12 Mo Relocation Break",
                  exp: "3.5 Yrs (Frontend)",
                  score: 81,
                },
              ].map((cand) => (
                <div
                  key={cand.id}
                  className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div>
                    <span className="font-sans font-medium text-sm text-[#F1E7DB] block">
                      {cand.name}
                    </span>
                    <span className="text-[#9A9A9A] text-[11px]">
                      {cand.exp} • {cand.gap}
                    </span>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="text-base font-light text-[#D8C2A6]">
                      {cand.score}% Match
                    </span>
                    <button
                      onClick={() => handleShortlistCandidate(cand.id)}
                      className="btn-editorial-rose text-xs py-1.5 px-4"
                    >
                      <span>Shortlist</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 18. REAL COMEBACK STORIES (Cinematic Editorial Storytelling)  */}
      {/* ============================================================ */}
      <section
        id="stories"
        className="py-24 px-6 md:px-12 lg:px-16 max-w-7xl mx-auto border-t border-[#D8C2A6]/10 relative z-10"
      >
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="micro-label text-[#A56F7C]">STORIES / 06 // CINEMATIC PROOF</span>
              <DataClassificationBadge classification="simulated" label="EDITORIAL CASE STUDY" />
            </div>
            <h2 className="text-4xl sm:text-6xl font-light tracking-tight text-[#F1E7DB]">
              REAL COMEBACK STORIES.
            </h2>
          </div>
          <span className="text-xs font-mono uppercase tracking-widest text-[#9A9A9A]">
            EVIDENCE OF TRANSFORMATION
          </span>
        </div>

        {/* Storytelling Focal Block (Section 18) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 relative aspect-[3/4] rounded-2xl overflow-hidden border border-[#D8C2A6]/20">
            <Image
              src="/images/editorial-story.jpg"
              alt="Elena Rostova Success Story"
              fill
              className="object-cover object-center grayscale contrast-110"
              sizes="(max-width: 768px) 100vw, 550px"
            />
          </div>

          <div className="lg:col-span-6 space-y-8">
            <div className="space-y-3">
              <span className="micro-label text-[#D8C2A6]">STORY / 06</span>
              <h3 className="text-3xl sm:text-5xl font-serif italic text-[#F1E7DB] leading-tight">
                &ldquo;I returned to technology after a four-year career break.&rdquo;
              </h3>
            </div>

            <p className="text-sm md:text-base text-[#9A9A9A] leading-relaxed font-light">
              After stepping away from engineering to raise two children, the thought of returning
              felt daunting. GFG mapped my past four years of Java foundations directly to modern
              cloud pipelines and placed me in a paid returnship at Nova Technologies.
            </p>

            <div className="grid grid-cols-2 gap-6 pt-6 border-t border-[#D8C2A6]/10 font-mono text-xs">
              <div>
                <span className="text-[#9A9A9A] block uppercase">CAREER BEFORE BREAK</span>
                <span className="text-[#F1E7DB] mt-1 block">Junior Backend Developer</span>
              </div>
              <div>
                <span className="text-[#9A9A9A] block uppercase">CAREER AFTER RETURN</span>
                <span className="text-[#D8C2A6] mt-1 block">Senior Data Analyst</span>
              </div>
              <div>
                <span className="text-[#9A9A9A] block uppercase">SKILLS REBUILT</span>
                <span className="text-[#F1E7DB] mt-1 block">SQL, Pandas, Power BI</span>
              </div>
              <div>
                <span className="text-[#9A9A9A] block uppercase">TIME TAKEN</span>
                <span className="text-[#A56F7C] mt-1 block">14 Weeks</span>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setShowStoryModal(true)}
                className="btn-editorial-secondary text-xs"
              >
                <span>Read Her Story →</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 19. PROFILE / CAREER TIMELINE & PASSPORT                     */}
      {/* ============================================================ */}
      <section
        id="passport-section"
        className="py-24 px-6 md:px-12 lg:px-16 max-w-7xl mx-auto border-t border-[#D8C2A6]/10 relative z-10"
      >
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="micro-label text-[#A56F7C]">VERIFICATION // CONTINUITY</span>
              <DataClassificationBadge classification="simulated" label="SAMPLE TIMELINE" />
            </div>
            <h2 className="text-4xl sm:text-6xl font-light tracking-tight text-[#F1E7DB]">
              CAREER TIMELINE.
            </h2>
          </div>
          <button
            onClick={handleOpenPassport}
            className="btn-editorial-primary text-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Verified Passport PDF</span>
          </button>
        </div>

        {/* Vertical Career Timeline (Section 19: Career breaks respectfully framed) */}
        <div className="relative pl-6 md:pl-10 space-y-10 border-l border-[#D8C2A6]/20 max-w-3xl">
          {[
            {
              year: "2018 – 2022",
              title: "Data Analyst",
              company: "Enterprise Information Systems",
              note: `${DEMO_METRICS.preBreakFormatted} verified tenure. SQL reporting, ETL pipelines, and data warehouse modeling.`,
            },
            {
              year: "2022 – 2025",
              title: "Career Break",
              company: "Family Leadership & Caregiving",
              note: `${DEMO_METRICS.breakDurationFormatted} (${DEMO_METRICS.breakDurationMonths} Months) intentional pause. Preserved tenure with zero algorithmic penalty.`,
              isBreak: true,
            },
            {
              year: "2025",
              title: "Skill Rebuilding",
              company: "GFG Calibrated Learning Track",
              note: "Completed Power BI executive dashboards, Advanced SQL CTEs, and Python Pandas.",
            },
            {
              year: "2025",
              title: "Returnship Cohort",
              company: "Nova Technologies Returnship",
              note: "4-Month paid return cohort with dedicated mentorship under Dr. Meera Iyer.",
            },
            {
              year: "2026",
              title: "Target Placement",
              company: "Lead Data Analytics Consultant",
              note: "Secured high-flexibility role with full tenure recognition.",
            },
          ].map((item) => (
            <div key={item.year} className="relative">
              <div
                className={`absolute -left-[31px] md:-left-[47px] top-1.5 w-3.5 h-3.5 rounded-full border-2 ${
                  item.isBreak
                    ? "bg-[#A56F7C] border-[#111111]"
                    : "bg-[#D8C2A6] border-[#111111]"
                }`}
              />

              <div className="space-y-1">
                <span className="text-xs font-mono text-[#D8C2A6]">{item.year}</span>
                <div className="text-xl font-medium text-[#F1E7DB]">{item.title}</div>
                <div className="text-xs font-mono text-[#9A9A9A]">{item.company}</div>
                <p className="text-xs text-[#9A9A9A] pt-1 leading-relaxed font-light">
                  {item.note}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ============================================================ */}
      {/* 21. COMMUNITY (Curated Editorial Blocks)                     */}
      {/* ============================================================ */}
      <section
        id="community"
        className="py-24 px-6 md:px-12 lg:px-16 max-w-7xl mx-auto border-t border-[#D8C2A6]/10 relative z-10"
      >
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="micro-label text-[#A56F7C]">COALITION // CIRCLES</span>
              <DataClassificationBadge classification="actual" label="ACTIVE DIRECTORY" />
            </div>
            <h2 className="text-4xl sm:text-6xl font-light tracking-tight text-[#F1E7DB]">
              CURATED COMMUNITY.
            </h2>
          </div>
          <span className="text-xs font-mono uppercase tracking-widest text-[#9A9A9A]">
            AUTHENTIC PILOT PROFILES
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 rounded-xl bg-[#181818]/60 border border-[#D8C2A6]/10 space-y-4">
            <span className="micro-label text-[#D8C2A6]">LEARNING CIRCLES</span>
            <h4 className="text-xl font-medium text-[#F1E7DB]">Weekly SQL & Python Labs</h4>
            <p className="text-xs text-[#9A9A9A] leading-relaxed font-light">
              Collaborative coding sessions hosted by returning professionals working on capstone data sets together.
            </p>
            <span className="text-[11px] font-mono text-[#A56F7C] block pt-2">
              Every Tuesday • Virtual
            </span>
          </div>

          <div className="p-8 rounded-xl bg-[#181818]/60 border border-[#D8C2A6]/10 space-y-4">
            <span className="micro-label text-[#A56F7C]">MENTOR Q&A</span>
            <h4 className="text-xl font-medium text-[#F1E7DB]">Negotiating From Strength</h4>
            <p className="text-xs text-[#9A9A9A] leading-relaxed font-light">
              Executive roundtables addressing salary negotiation, tenure continuity, and remote work arrangements.
            </p>
            <span className="text-[11px] font-mono text-[#D8C2A6] block pt-2">
              Monthly Spotlight
            </span>
          </div>

          <div
            onClick={() => setShowAlumniModal(true)}
            className="p-8 rounded-xl bg-[#181818]/60 border border-[#D8C2A6]/10 space-y-4 cursor-pointer hover:border-[#D8C2A6]/40 transition-all group"
          >
            <div className="flex items-center justify-between">
              <span className="micro-label text-[#D8C2A6]">COMEBACK SPOTLIGHT</span>
              <span className="text-xs text-[#A56F7C] group-hover:translate-x-0.5 transition-transform">Browse →</span>
            </div>
            <h4 className="text-xl font-medium text-[#F1E7DB] group-hover:text-[#D8C2A6] transition-colors">
              Returnee Alumni Directory
            </h4>
            <p className="text-xs text-[#9A9A9A] leading-relaxed font-light">
              Direct access to pilot members who successfully completed returnships and are now hiring in their teams.
            </p>
            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] font-mono text-[#A56F7C] font-semibold">
                4 Pilot Profiles Indexed
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#111111] text-[#9A9A9A] border border-[#D8C2A6]/10">
                VERIFIED PILOT
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 22. STEP ONBOARDING / CAREER BREAK TAXONOMY                  */}
      {/* ============================================================ */}
      <section
        id="onboarding"
        className="py-24 px-6 md:px-12 lg:px-16 max-w-7xl mx-auto border-t border-[#D8C2A6]/10 relative z-10"
      >
        <div className="max-w-4xl space-y-12">
          <div className="space-y-2">
            <span className="micro-label text-[#A56F7C]">ONBOARDING // CALIBRATION</span>
            <h2 className="text-4xl sm:text-6xl font-light tracking-tight text-[#F1E7DB]">
              BUILD YOUR COMEBACK PLAN.
            </h2>
            <p className="text-sm text-[#9A9A9A] font-light">
              Select your career break reason (optional) to map targeted upskilling modules. Your privacy is protected by default.
            </p>
          </div>

          {/* Break Taxonomy Buttons */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="micro-label-muted text-[10px]">01 // CAREER BREAK REASON (OPTIONAL)</span>
              <span className="text-[11px] font-mono text-[#D8C2A6]">🔒 Never shared without consent</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {[
                "MATERNITY",
                "CAREGIVING",
                "EDUCATION",
                "HEALTH",
                "RELOCATION",
                "SABBATICAL",
                "PERSONAL",
                "PREFER NOT TO SAY",
              ].map((brk) => {
                const isSelected = selectedBreakType === brk;
                return (
                  <button
                    key={brk}
                    onClick={() => setSelectedBreakType(brk)}
                    className={`p-3.5 rounded-xl border text-center font-mono text-xs uppercase tracking-wider transition-all ${
                      isSelected
                        ? "bg-[#D8C2A6] text-[#111111] border-[#D8C2A6] font-semibold"
                        : "bg-[#181818] text-[#9A9A9A] border-[#D8C2A6]/10 hover:border-[#D8C2A6]/30 hover:text-[#F1E7DB]"
                    }`}
                  >
                    {brk}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Core Skill Selector */}
          <div className="space-y-4 pt-4 border-t border-[#D8C2A6]/10">
            <span className="micro-label-muted text-[10px]">02 // CORE STRENGTHS TO REFRESH</span>
            <div className="flex flex-wrap gap-2.5">
              {[
                "SQL",
                "PYTHON",
                "JAVA",
                "POWER BI",
                "AWS",
                "DATA ANALYTICS",
                "UI/UX",
                "PANDAS",
                "DOCKER",
                "SYSTEM DESIGN",
              ].map((skill) => {
                const isSelected = selectedSkills.includes(skill);
                return (
                  <button
                    key={skill}
                    onClick={() => toggleSkill(skill)}
                    className={`px-4 py-2 rounded-full font-mono text-xs uppercase tracking-wider transition-all border ${
                      isSelected
                        ? "bg-[#A56F7C] text-[#F1E7DB] border-[#A56F7C] font-semibold"
                        : "bg-[#181818] text-[#9A9A9A] border-[#D8C2A6]/10 hover:border-[#D8C2A6]/30"
                    }`}
                  >
                    {skill}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-6">
            <button
              onClick={() => setShowOnboardingModal(true)}
              className="btn-editorial-primary text-xs"
            >
              <span>Synthesize My Comeback Plan →</span>
            </button>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* MODULE 11: GOVERNMENT PILOT & IMPACT ANALYTICS SHOWCASE      */}
      {/* ============================================================ */}
      <section className="py-20 px-6 md:px-12 lg:px-16 max-w-7xl mx-auto border-t border-[#D8C2A6]/10 relative z-10">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-[#1A1816] via-[#161413] to-[#121212] border border-[#D8C2A6]/25 shadow-2xl flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="space-y-4 max-w-2xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#D8C2A6] px-2.5 py-1 rounded bg-[#D8C2A6]/10 border border-[#D8C2A6]/20">
                Module 11 • Government & Institutional Testbed
              </span>
              <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                <Check className="w-3 h-3" /> Strictly Segregated Metrics
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#F1E7DB] leading-tight">
              Evidence-Driven Public Pilot & Impact Analytics
            </h2>
            <p className="text-xs sm:text-sm text-[#C5B8AB] leading-relaxed">
              Designed for state skill development agencies and multilateral partners. Explore the 100-fellow demonstration pilot proposal, verified public scheme directory (NCS, Skill India, Naan Mudhalvan), de-identified longitudinal outcomes, and SDG 4/5/8/10 alignment.
            </p>
            <div className="flex flex-wrap gap-2 text-[11px] font-mono text-[#9A9A9A] pt-1">
              <span className="px-2.5 py-1 rounded-md bg-black/40 border border-white/10">100 Target Fellows</span>
              <span className="px-2.5 py-1 rounded-md bg-black/40 border border-white/10">6-Month Runway</span>
              <span className="px-2.5 py-1 rounded-md bg-black/40 border border-white/10">Zero Unapproved Endorsement Claims</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
            <button
              type="button"
              onClick={() => handleOpenGovernmentPilot("dashboard")}
              className="px-6 py-3.5 rounded-xl bg-[#D8C2A6] hover:bg-[#E5D5C1] text-[#111111] font-mono text-xs font-bold uppercase tracking-wider transition-all shadow-lg flex items-center justify-center gap-2"
            >
              <BarChart3 className="w-4 h-4" />
              <span>Launch Pilot Dashboard</span>
            </button>
            <button
              type="button"
              onClick={() => handleOpenGovernmentPilot("schemes")}
              className="px-6 py-3.5 rounded-xl bg-[#202020] hover:bg-[#282828] border border-[#D8C2A6]/25 text-[#D8C2A6] hover:text-[#F1E7DB] font-mono text-xs font-semibold uppercase tracking-wider transition-all flex items-center justify-center gap-2"
            >
              <Globe className="w-4 h-4" />
              <span>Public Scheme Navigator</span>
            </button>
            <button
              type="button"
              onClick={() => handleOpenGovernmentPilot("presentation")}
              className="px-6 py-3.5 rounded-xl bg-transparent hover:bg-white/5 border border-purple-400/30 text-purple-300 font-mono text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2"
            >
              <Layers className="w-4 h-4" />
              <span>View Presentation Deck</span>
            </button>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* FINAL CTA: CINEMATIC CONCLUSION                              */}
      {/* ============================================================ */}
      <section className="py-28 px-6 md:px-12 lg:px-16 max-w-7xl mx-auto border-t border-[#D8C2A6]/10 text-center relative z-10">
        <div className="max-w-3xl mx-auto space-y-8">
          <span className="micro-label text-[#A56F7C]">BEGIN YOUR RETURN</span>
          <h2 className="text-5xl sm:text-7xl font-light tracking-tight text-[#F1E7DB]">
            READY TO RESTART?
          </h2>
          <p className="font-serif italic text-xl text-[#D8C2A6] max-w-xl mx-auto">
            Your career break is not a gap on your resume. It is a chapter of strength.
          </p>
          <div className="pt-4 flex justify-center gap-4">
            <button
              onClick={() => setShowOnboardingModal(true)}
              className="btn-editorial-primary text-xs py-3.5 px-8"
            >
              <span>Start Your Comeback</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* MINIMAL EDITORIAL FOOTER                                     */}
      {/* ============================================================ */}
      <footer className="w-full border-t border-[#D8C2A6]/10 py-12 px-6 md:px-12 lg:px-16 bg-[#111111] relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-xs font-mono text-[#9A9A9A]">
          <div className="flex items-center gap-2">
            <span className="text-[#F1E7DB] font-semibold tracking-wider">GFG</span>
            <span>//</span>
            <span>CAREER COMEBACK PLATFORM</span>
          </div>

          <div className="flex flex-wrap items-center gap-6 uppercase tracking-wider text-[11px]">
            <button
              onClick={() => {
                setScoringDefaultTab("readiness");
                setShowScoringModal(true);
              }}
              className="hover:text-[#F1E7DB] transition-colors"
            >
              Scoring Disclosures
            </button>
            <span>•</span>
            <button
              onClick={() => setShowAdminModal(true)}
              className="hover:text-[#F1E7DB] transition-colors"
            >
              Platform Governance
            </button>
            <span>•</span>
            <button
              onClick={() => handleOpenGovernmentPilot("dashboard")}
              className="hover:text-[#F1E7DB] text-[#D8C2A6] transition-colors"
            >
              Government Pilot & Impact
            </button>
            <span>•</span>
            <span className="text-[#A56F7C]">Profiles Private By Default</span>
          </div>

          <div className="text-[11px]">© 2026 GFG. ALL RIGHTS RESERVED.</div>
        </div>
      </footer>

      {/* ============================================================ */}
      {/* MODALS                                                       */}
      {/* ============================================================ */}
      {/* 1. Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={(u) => {
          setCurrentUser(u);
          setFeedbackMsg({ type: "success", text: "Successfully authenticated." });
        }}
      />

      {/* 2. User Dashboard Modal */}
      <UserDashboardModal
        isOpen={showDashboardModal}
        onClose={() => setShowDashboardModal(false)}
        currentUser={currentUser}
        currentRole={currentRole}
        onLogout={() => {
          api.logout();
          setCurrentUser(null);
          setShowDashboardModal(false);
          setFeedbackMsg({ type: "success", text: "Signed out." });
        }}
        applications={myApplications}
        readinessScore={readinessData?.readiness_score || 82}
        onViewPassport={handleOpenPassport}
        onOpenOnboarding={() => setShowOnboardingModal(true)}
        onOpenDigitalTwin={() => setShowDigitalTwinModal(true)}
        onOpenSimulator={() => setShowSimulatorModal(true)}
      />

      {/* 3. Verified Career Passport 2.0 Modal (Module 6) */}
      <CareerPassportModal
        isOpen={showPassportModal}
        onClose={() => setShowPassportModal(false)}
      />


      {/* 4. Smart Opportunity and Returnship Engine Modal (Module 7) */}
      <SmartOpportunityEngineModal
        isOpen={showJobsModal}
        onClose={() => setShowJobsModal(false)}
        onViewPassport={handleOpenPassport}
        onOpenWorkLife={() => setShowWorkLifeModal(true)}
        activeWorkLifeSummary={
          workLifeFilters.workMode !== "all" || workLifeFilters.partTimeOnly || workLifeFilters.childcareRequired
            ? "Work-Life Filtered ✓"
            : undefined
        }
      />


      {/* 5. AI Interview Coach Modal */}
      {showInterviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 bg-black/80 backdrop-blur-sm overflow-y-auto animate-in fade-in">
          <div className="w-full max-w-3xl bg-[#181818] text-[#F1E7DB] rounded-xl border border-[#D8C2A6]/20 p-8 relative max-h-[85vh] overflow-y-auto">
            <button
              onClick={() => setShowInterviewModal(false)}
              className="absolute top-6 right-6 p-2 rounded-full hover:bg-white/10 text-[#F1E7DB]"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="border-b border-[#D8C2A6]/10 pb-4 mb-6">
              <span className="micro-label text-[#A56F7C] block mb-1">AI INTERVIEW COACH</span>
              <h3 className="text-3xl font-light text-[#F1E7DB]">
                INTERVIEW PREPARATION TERMINAL
              </h3>
              <p className="text-xs font-mono text-[#9A9A9A] mt-1">
                Target: {selectedJob?.title || "Data Analyst"} • Nova Technologies
              </p>
            </div>

            <div className="space-y-6 font-mono text-xs">
              <div className="p-4 rounded-xl bg-[#111111] border border-[#D8C2A6]/15 space-y-2">
                <span className="text-[#A56F7C] font-semibold uppercase block">
                  CAREER BREAK FRAMING STRATEGY
                </span>
                <p className="text-[#F1E7DB] font-sans leading-relaxed text-xs">
                  Frame your {DEMO_METRICS.breakDurationFormatted} ({DEMO_METRICS.breakDurationMonths} Mo) {DEMO_PERSONA.break_reason?.toLowerCase() || "career pause"} with clarity and strength: emphasize {DEMO_METRICS.preBreakFormatted} of solid background in {DEMO_PERSONA.past_experience || "Data Analytics"}, deliberate self-directed coursework in SQL and Power BI, and current readiness to deliver high impact in remote analytics tracks.
                </p>
              </div>

              <div>
                <span className="text-[#D8C2A6] font-semibold uppercase block mb-3">
                  TOP TECHNICAL QUESTIONS
                </span>
                <div className="space-y-2">
                  {(interviewData?.technical_questions || [
                    {
                      topic: "SQL",
                      question:
                        "Explain the difference between ROW_NUMBER(), RANK(), and DENSE_RANK() with a practical example.",
                    },
                    {
                      topic: "Python / Pandas",
                      question:
                        "How do you handle duplicate rows and impute missing numerical data in large dataframes?",
                    },
                    {
                      topic: "Power BI",
                      question:
                        "Explain how DAX measures differ from calculated columns in terms of memory cache and query execution.",
                    },
                  ]).map((q: any, i: number) => (
                    <div
                      key={i}
                      className="p-3 rounded-lg bg-[#111111] border border-[#D8C2A6]/10 flex items-start gap-3"
                    >
                      <span className="text-[#A56F7C] font-semibold shrink-0">[{q.topic}]</span>
                      <span className="text-[#F1E7DB] font-sans">{q.question}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. Adaptive Learning Engine Roadmap Modal (Module 5) */}
      <AdaptiveRoadmapModal
        isOpen={showRoadmapModal}
        onClose={() => setShowRoadmapModal(false)}
        initialSector="Data Analyst"
        initialHours={Math.max(5, (availableHours || 3) * 5)}
      />

      {/* 7. Skill Gap Modal */}
      {showSkillGapModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 bg-black/80 backdrop-blur-sm overflow-y-auto animate-in fade-in">
          <div className="w-full max-w-3xl bg-[#181818] text-[#F1E7DB] rounded-xl border border-[#D8C2A6]/20 p-8 relative max-h-[85vh] overflow-y-auto">
            <button
              onClick={() => setShowSkillGapModal(false)}
              className="absolute top-6 right-6 p-2 rounded-full hover:bg-white/10 text-[#F1E7DB]"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="border-b border-[#D8C2A6]/10 pb-4 mb-6">
              <span className="micro-label text-[#A56F7C] block mb-1">
                AI ANALYSIS // QUANTIFIED AUDIT
              </span>
              <h3 className="text-3xl font-light text-[#F1E7DB]">
                CAREER INTELLIGENCE & SKILL GAP SYNTHESIS
              </h3>
              <p className="text-xs font-mono text-[#9A9A9A] mt-1">
                {DEMO_PERSONA.full_name} → Target: {DEMO_PERSONA.target_role}
              </p>
            </div>

            <div className="space-y-6 font-mono text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-[#D8C2A6]/10 bg-[#111111]">
                  <span className="text-[#D8C2A6] font-semibold uppercase block mb-2">
                    VERIFIED STRENGTHS
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {["SQL", "PROGRAMMING LOGIC", "DATA HANDLING", "PYTHON"].map((s) => (
                      <span
                        key={s}
                        className="px-2.5 py-0.5 rounded-full bg-[#181818] text-[#F1E7DB] text-[10px]"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-[#D8C2A6]/10 bg-[#111111]">
                  <span className="text-[#A56F7C] font-semibold uppercase block mb-2">
                    REFRESH NEEDED
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {["WINDOW FUNCTIONS", "CTEs", "SCHEMA MODELING"].map((s) => (
                      <span
                        key={s}
                        className="px-2.5 py-0.5 rounded-full bg-[#181818] text-[#D8C2A6] text-[10px]"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <span className="text-[#F1E7DB] font-semibold uppercase block mb-3">
                  TARGET SKILL GAPS
                </span>
                <div className="space-y-2">
                  {[
                    {
                      skill: "Python",
                      importance: "CRITICAL",
                      hours: 20,
                      reason: "Required for automated data ingestion and pandas transformation",
                    },
                    {
                      skill: "Power BI",
                      importance: "CRITICAL",
                      hours: 20,
                      reason: "Essential for corporate reporting and DAX calculations",
                    },
                    {
                      skill: "Statistics",
                      importance: "HIGH",
                      hours: 15,
                      reason: "Required for hypothesis testing and metric decomposition",
                    },
                  ].map((gap) => (
                    <div
                      key={gap.skill}
                      className="p-3 rounded-lg border border-[#D8C2A6]/10 bg-[#111111] flex items-center justify-between"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-[#F1E7DB]">{gap.skill}</span>
                          <span className="px-2 py-0.5 rounded-full bg-[#181818] text-[#A56F7C] text-[10px] font-semibold">
                            {gap.importance}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#9A9A9A] font-sans mt-0.5">{gap.reason}</p>
                      </div>
                      <span className="text-[#D8C2A6]">~{gap.hours} HRS</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 flex flex-wrap items-center justify-between gap-3">
                <span className="text-[#9A9A9A]">Est. Recovery: 8-10 Weeks</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setShowSkillGapModal(false);
                      setShowDigitalTwinModal(true);
                    }}
                    className="btn-editorial-secondary text-xs border-blue-500/30 text-blue-200 hover:border-blue-400"
                  >
                    <span>Launch Career Digital Twin ↗</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowSkillGapModal(false);
                      handleGenerateRoadmap();
                    }}
                    className="btn-editorial-primary text-xs"
                  >
                    <span>Generate Full Roadmap →</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 8. Scoring Explanation Modal (Transparency Disclosures) */}
      <ScoringExplanationModal
        isOpen={showScoringModal}
        onClose={() => setShowScoringModal(false)}
        defaultTab={scoringDefaultTab}
      />

      {/* 9. Mentorship and Community Ecosystem Modal (Module 8) */}
      <MentorshipCommunityModal
        isOpen={showMentorshipModal}
        onClose={() => setShowMentorshipModal(false)}
        initialTab={mentorshipInitialTab}
      />

      {/* 10. Real Comeback Story Modal (Elena Rostova Case Study) */}
      <StoryDetailModal
        isOpen={showStoryModal}
        onClose={() => setShowStoryModal(false)}
      />

      {/* 11. Alumni Directory Modal (4 Pilot Profiles Indexed) */}
      <AlumniDirectoryModal
        isOpen={showAlumniModal}
        onClose={() => setShowAlumniModal(false)}
      />

      {/* 12. Admin Governance Desk Modal */}
      <AdminModal
        isOpen={showAdminModal}
        onClose={() => setShowAdminModal(false)}
        currentUser={currentUser}
      />

      {/* 13. Intelligent Onboarding and Profile System Modal (Module 2) */}
      <IntelligentOnboardingModal
        isOpen={showOnboardingModal}
        onClose={() => setShowOnboardingModal(false)}
        onSuccess={handleOnboardingSuccess}
      />

      {/* 14. AI Career Digital Twin Modal (Module 3) */}
      <DigitalTwinModal
        isOpen={showDigitalTwinModal}
        onClose={() => setShowDigitalTwinModal(false)}
        onViewPassport={handleOpenPassport}
        onOpenSimulator={() => setShowSimulatorModal(true)}
      />

      {/* 15. AI Career Future Simulator Modal (Module 4) */}
      <CareerSimulatorModal
        isOpen={showSimulatorModal}
        onClose={() => setShowSimulatorModal(false)}
        onOpenRoadmap={handleGenerateRoadmap}
        onOpenDigitalTwin={() => setShowDigitalTwinModal(true)}
      />

      </main>

      {/* ============================================================ */}
      {/* MODULE 9 MODALS: ACCESSIBILITY, VOICE, ENTREPRENEURSHIP,     */}
      {/* AND WORK-LIFE SUPPORT                                        */}
      {/* ============================================================ */}

      {/* Part 2: Accessibility Toolbar (WCAG 2.2 AA) */}
      <AccessibilityToolbar
        isOpen={showA11yModal}
        onClose={() => setShowA11yModal(false)}
      />

      {/* Part 4: Voice Assistant Guidance Modal */}
      <VoiceAssistantModal
        isOpen={showVoiceModal}
        onClose={() => setShowVoiceModal(false)}
        onNavigateTo={handleGuidedRoute}
      />

      {/* Part 5: Entrepreneurship & Freelance Hub */}
      <EntrepreneurshipHubModal
        isOpen={showEntrepreneurshipModal}
        onClose={() => setShowEntrepreneurshipModal(false)}
        initialTab={entrepreneurshipInitialTab}
      />

      {/* Part 6: Work-Life Flexibility & Caregiver-Protected Settings */}
      <WorkLifeSupportModal
        isOpen={showWorkLifeModal}
        onClose={() => setShowWorkLifeModal(false)}
        currentFilters={workLifeFilters}
        onApplyFilters={(filters) => {
          setWorkLifeFilters(filters);
          setShowJobsModal(true);
          setFeedbackMsg({
            type: "success",
            text: "Work-life preferences applied to opportunity matching.",
          });
        }}
      />

      {/* ============================================================ */}
      {/* MODULE 10: EMPLOYER INTELLIGENCE & RETURNSHIP TOOLKIT MODAL */}
      {/* ============================================================ */}
      <EmployerIntelligenceModal
        isOpen={showEmployerModal}
        onClose={() => setShowEmployerModal(false)}
        initialTab={employerInitialTab}
      />

      {/* ============================================================ */}
      {/* MODULE 11: GOVERNMENT PILOT & IMPACT ANALYTICS MODAL         */}
      {/* ============================================================ */}
      <GovernmentPilotModal
        isOpen={showGovernmentModal}
        onClose={() => setShowGovernmentModal(false)}
        initialTab={governmentInitialTab}
      />

      {/* ============================================================ */}
      {/* GFG LEARNING MANAGEMENT SYSTEM & CERTIFICATE SYSTEM          */}
      {/* ============================================================ */}
      <LearningHubModal
        isOpen={showLearningModal}
        onClose={() => setShowLearningModal(false)}
        currentUser={currentUser}
      />
    </div>
  );
}
