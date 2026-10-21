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
import { CinematicBackground } from "@/components/editorial/CinematicBackground";
import { CinematicHero } from "@/components/editorial/CinematicHero";
import { MissionStorySection } from "@/components/editorial/MissionStorySection";
import { CinematicFeaturesSection } from "@/components/editorial/CinematicFeaturesSection";
import { LearningHubShowcase } from "@/components/editorial/LearningHubShowcase";
import { ImpactStatsSection } from "@/components/editorial/ImpactStatsSection";
import { TestimonialsSection } from "@/components/editorial/TestimonialsSection";
import { CinematicFinalCTA } from "@/components/editorial/CinematicFinalCTA";
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
    if (typeof window !== "undefined") {
      localStorage.setItem("gfg_candidate_onboarded", "true");
    }
    await refreshCandidateData();
    setShowOnboardingModal(false);
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
    <div className="min-h-screen bg-[#090705] text-[#fef3c7] font-sans antialiased selection:bg-[#ea580c] selection:text-[#ffffff] relative overflow-x-hidden">
      {/* Background Architectural & Cinematic Mouse Glow System */}
      <CinematicBackground />

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
            const hasCompleted =
              (currentUser as any)?.onboarding_completed ||
              (typeof window !== "undefined" &&
                localStorage.getItem("gfg_candidate_onboarded") === "true");
            if (!hasCompleted) {
              setShowOnboardingModal(true);
            } else {
              setShowDashboardModal(true);
            }
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
        {/* SECTION 1: CINEMATIC EDITORIAL HERO (FULL SCREEN)           */}
        {/* ============================================================ */}
        <CinematicHero
          onStartComeback={() => setShowOnboardingModal(true)}
          onOpenLearningHub={() => setShowLearningModal(true)}
          onOpenRoadmap={handleGenerateRoadmap}
          onOpenPassport={handleOpenPassport}
        />

        {/* ============================================================ */}
        {/* SECTION 2: PROBLEM & MISSION STORYTELLING (FULL SCREEN)      */}
        {/* ============================================================ */}
        <MissionStorySection
          onExploreSolutions={() => {
            const el = document.getElementById("features");
            if (el) el.scrollIntoView({ behavior: "smooth" });
          }}
          onStartComeback={() => setShowOnboardingModal(true)}
        />

        {/* ============================================================ */}
        {/* SECTION 3: 6-PILLAR FEATURES ECOSYSTEM (SPACIOUS EDITORIAL)  */}
        {/* ============================================================ */}
        <CinematicFeaturesSection
          onOpenRoadmap={handleGenerateRoadmap}
          onOpenLearningHub={() => setShowLearningModal(true)}
          onOpenPassport={handleOpenPassport}
          onOpenJobs={() => setShowJobsModal(true)}
          onOpenCommunity={(tab) => {
            setMentorshipInitialTab(tab || "mentors");
            setShowMentorshipModal(true);
          }}
        />

        {/* ============================================================ */}
        {/* SECTION 4: LEARNING HUB & VERIFIED CERTIFICATES SHOWCASE     */}
        {/* ============================================================ */}
        <LearningHubShowcase
          onOpenLearningHub={() => setShowLearningModal(true)}
        />

        {/* ============================================================ */}
        {/* SECTION 5: IMPACT IN NUMBERS & ANIMATED COUNTERS            */}
        {/* ============================================================ */}
        <ImpactStatsSection />

        {/* ============================================================ */}
        {/* SECTION 6: COMEBACK STORIES & TESTIMONIALS                  */}
        {/* ============================================================ */}
        <TestimonialsSection
          onOpenCommunity={() => {
            setMentorshipInitialTab("circles");
            setShowMentorshipModal(true);
          }}
        />

        {/* ============================================================ */}
        {/* SECTION 7: FINAL EMOTIONAL CTA & EDITORIAL FOOTER           */}
        {/* ============================================================ */}
        <CinematicFinalCTA
          onStartComeback={() => setShowOnboardingModal(true)}
          onOpenLearningHub={() => setShowLearningModal(true)}
          onOpenOpportunities={() => setShowJobsModal(true)}
          onOpenRoadmap={handleGenerateRoadmap}
          onOpenScoring={() => {
            setScoringDefaultTab("readiness");
            setShowScoringModal(true);
          }}
          onOpenAdmin={() => setShowAdminModal(true)}
          onOpenGovernmentPilot={() => handleOpenGovernmentPilot("dashboard")}
        />
      </main>

      {/* ============================================================ */}
      {/* MODALS                                                       */}
      {/* ============================================================ */}
      {/* 1. Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={async (u: any) => {
          setCurrentUser(u);
          setFeedbackMsg({ type: "success", text: "Successfully authenticated." });
          await refreshCandidateData();
          setShowAuthModal(false);
          const hasCompleted =
            u?.onboarding_completed ||
            (typeof window !== "undefined" &&
              localStorage.getItem("gfg_candidate_onboarded") === "true");
          if (!hasCompleted) {
            setShowOnboardingModal(true);
          } else {
            setShowDashboardModal(true);
          }
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
