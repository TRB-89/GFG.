"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  BookOpen,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Award,
  ChevronRight,
  ChevronDown,
  X,
  Play,
  FileText,
  Download,
  Brain,
  HelpCircle,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  RefreshCw,
  AlertCircle,
  Lock,
  UserCheck,
  Send,
  Sliders,
  BarChart2,
  Calendar,
  Check,
  Copy,
} from "lucide-react";
import {
  learningApi,
  CourseSummary,
  CourseDetail,
  LessonDetail,
  AssessmentData,
  PracticalAssignmentData,
  LearnerDashboardData,
} from "@/lib/learningApi";
import { YouTubePlayer } from "./YouTubePlayer";

interface LearningHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: any;
  initialCourseSlug?: string;
}

type TabType = "catalogue" | "course_detail" | "classroom" | "assessment" | "assignment" | "dashboard" | "admin";

export function LearningHubModal({
  isOpen,
  onClose,
  currentUser,
  initialCourseSlug,
}: LearningHubModalProps) {
  // Navigation State
  const [activeTab, setActiveTab] = useState<TabType>("catalogue");
  const [selectedCourseSlug, setSelectedCourseSlug] = useState<string>(initialCourseSlug || "workplace-digital-skills");
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);

  // Data State
  const [courses, setCourses] = useState<CourseSummary[]>([]);
  const [courseDetail, setCourseDetail] = useState<CourseDetail | null>(null);
  const [lessonDetail, setLessonDetail] = useState<LessonDetail | null>(null);
  const [assessmentData, setAssessmentData] = useState<AssessmentData | null>(null);
  const [assignmentData, setAssignmentData] = useState<PracticalAssignmentData | null>(null);
  const [dashboardData, setDashboardData] = useState<LearnerDashboardData | null>(null);

  // Filter State
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  // Interaction State
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Quiz submission state
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string[]>>({});
  const [quizResult, setQuizResult] = useState<any>(null);
  const [isSubmittingQuiz, setIsSubmittingQuiz] = useState<boolean>(false);

  // Assignment submission state
  const [assignmentText, setAssignmentText] = useState<string>("");
  const [assignmentUrl, setAssignmentUrl] = useState<string>("");
  const [isSubmittingAssignment, setIsSubmittingAssignment] = useState<boolean>(false);

  // Knowledge check state
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState<boolean>(false);

  // AI Assistant State
  const [showAiDrawer, setShowAiDrawer] = useState<boolean>(false);
  const [aiQuestion, setAiQuestion] = useState<string>("");
  const [aiResponse, setAiResponse] = useState<{ answer: string; resources: any[]; followups: string[] } | null>(null);
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const [aiStudyPlanHours, setAiStudyPlanHours] = useState<number>(8);
  const [aiStudyPlanWeeks, setAiStudyPlanWeeks] = useState<number>(3);
  const [aiStudyPlan, setAiStudyPlan] = useState<any>(null);

  // Admin state
  const [adminSubmissions, setAdminSubmissions] = useState<any[]>([]);
  const [adminAnalytics, setAdminAnalytics] = useState<any>(null);
  const [adminReviewStatus, setAdminReviewStatus] = useState<"approved" | "rejected">("approved");
  const [adminReviewScore, setAdminReviewScore] = useState<number>(90);
  const [adminReviewFeedback, setAdminReviewFeedback] = useState<string>("");
  const [selectedSubmissionId, setSelectedSubmissionId] = useState<string | null>(null);

  const isAdmin = currentUser?.role === "admin";

  // Load course catalogue
  const loadCatalogue = () => {
    setIsLoading(true);
    learningApi
      .getCourses({
        search: searchQuery || undefined,
        category: selectedCategory !== "All" ? selectedCategory : undefined,
      })
      .then((res) => {
        setCourses(res);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load courses:", err);
        setIsLoading(false);
      });
  };

  // Load course detail
  const loadCourseDetail = (slugOrId: string) => {
    setIsLoading(true);
    learningApi
      .getCourseDetail(slugOrId)
      .then((res) => {
        setCourseDetail(res);
        setSelectedCourseSlug(res.slug);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load course detail:", err);
        setIsLoading(false);
      });
  };

  // Load lesson detail
  const loadLesson = (courseId: string, lessonId: string) => {
    setIsLoading(true);
    setSelectedOptionIndex(null);
    setShowExplanation(false);
    learningApi
      .getLessonDetail(courseId, lessonId)
      .then((res) => {
        setLessonDetail(res);
        setSelectedLessonId(res.id);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load lesson:", err);
        setIsLoading(false);
      });
  };

  // Load assessment
  const loadAssessment = (assessmentId: string) => {
    setIsLoading(true);
    setSelectedAnswers({});
    setQuizResult(null);
    learningApi
      .getAssessment(assessmentId)
      .then((res) => {
        setAssessmentData(res);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load assessment:", err);
        setIsLoading(false);
      });
  };

  // Load assignment
  const loadAssignment = (assignmentId: string) => {
    setIsLoading(true);
    learningApi
      .getAssignment(assignmentId)
      .then((res) => {
        setAssignmentData(res);
        if (res.user_submission) {
          setAssignmentText(res.user_submission.submission_content || "");
          setAssignmentUrl(res.user_submission.external_url || "");
        }
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load assignment:", err);
        setIsLoading(false);
      });
  };

  // Load dashboard
  const loadDashboard = () => {
    setIsLoading(true);
    learningApi
      .getDashboard()
      .then((res) => {
        setDashboardData(res);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load dashboard:", err);
        setIsLoading(false);
      });
  };

  // Load Admin Data
  const loadAdminData = () => {
    if (!isAdmin) return;
    setIsLoading(true);
    Promise.all([learningApi.adminGetSubmissions("all"), learningApi.adminGetAnalytics()])
      .then(([subs, analytics]) => {
        setAdminSubmissions(subs);
        setAdminAnalytics(analytics);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load admin data:", err);
        setIsLoading(false);
      });
  };

  useEffect(() => {
    if (isOpen) {
      loadCatalogue();
    }
  }, [isOpen, searchQuery, selectedCategory]);

  useEffect(() => {
    if (initialCourseSlug && isOpen) {
      loadCourseDetail(initialCourseSlug);
      setActiveTab("course_detail");
    }
  }, [initialCourseSlug, isOpen]);

  // Handle Enrollment
  const handleEnroll = async (courseId: string) => {
    try {
      setIsLoading(true);
      const res = await learningApi.enrollInCourse(courseId);
      setFeedbackMsg({ type: "success", text: res.message });
      loadCourseDetail(courseId);
      loadCatalogue();
      setTimeout(() => setFeedbackMsg(null), 3000);
    } catch (err: any) {
      setFeedbackMsg({ type: "error", text: err.message || "Enrollment failed. Please log in." });
      setIsLoading(false);
    }
  };

  // Handle Mark Lesson Complete
  const handleCompleteLesson = async () => {
    if (!lessonDetail) return;
    try {
      setIsLoading(true);
      const res = await learningApi.completeLesson(lessonDetail.id, 90);
      setFeedbackMsg({
        type: "success",
        text: `Lesson completed! Course progress: ${res.course_progress_percentage}%`,
      });

      // Refresh lesson detail & course detail
      loadLesson(lessonDetail.course_id, lessonDetail.id);
      loadCourseDetail(lessonDetail.course_id);

      setTimeout(() => setFeedbackMsg(null), 3000);
    } catch (err: any) {
      setFeedbackMsg({ type: "error", text: err.message || "Failed to mark lesson complete." });
      setIsLoading(false);
    }
  };

  // Handle Quiz Submission
  const handleSubmitQuiz = async () => {
    if (!assessmentData) return;
    try {
      setIsSubmittingQuiz(true);
      const res = await learningApi.submitAssessment(assessmentData.id, selectedAnswers);
      setQuizResult(res);
      setIsSubmittingQuiz(false);
      if (res.passed) {
        setFeedbackMsg({
          type: "success",
          text: `Passed! Score: ${res.score_percentage}% (${res.passing_score_percentage}% required). Assessment requirement met!`,
        });
      } else {
        setFeedbackMsg({
          type: "error",
          text: `Score: ${res.score_percentage}%. Passing score is ${res.passing_score_percentage}%. You have ${res.attempts_remaining} attempt(s) remaining.`,
        });
      }
      // Refresh course detail eligibility
      if (courseDetail) {
        loadCourseDetail(courseDetail.id);
      }
    } catch (err: any) {
      setFeedbackMsg({ type: "error", text: err.message || "Assessment submission failed." });
      setIsSubmittingQuiz(false);
    }
  };

  // Handle Practical Assignment Submission
  const handleSubmitAssignment = async () => {
    if (!assignmentData) return;
    if (assignmentText.trim().length < 20) {
      setFeedbackMsg({
        type: "error",
        text: "Please provide a detailed project writeup (minimum 20 characters).",
      });
      return;
    }

    try {
      setIsSubmittingAssignment(true);
      const res = await learningApi.submitAssignment(assignmentData.id, {
        submission_content: assignmentText,
        external_url: assignmentUrl.trim() || undefined,
      });
      setFeedbackMsg({ type: "success", text: res.message });
      setIsSubmittingAssignment(false);
      loadAssignment(assignmentData.id);
      if (courseDetail) {
        loadCourseDetail(courseDetail.id);
      }
    } catch (err: any) {
      setFeedbackMsg({ type: "error", text: err.message || "Assignment submission failed." });
      setIsSubmittingAssignment(false);
    }
  };

  // Handle Claim Certificate
  const handleClaimCertificate = async (courseId: string) => {
    try {
      setIsLoading(true);
      const cert = await learningApi.claimCertificate(courseId);
      setFeedbackMsg({
        type: "success",
        text: `Congratulations! Official GFG Certificate issued: ${cert.credential_id}`,
      });
      loadCourseDetail(courseId);
      loadDashboard();
      setActiveTab("dashboard");
    } catch (err: any) {
      setFeedbackMsg({
        type: "error",
        text: err.message || "Certificate requirements not fully satisfied yet.",
      });
      setIsLoading(false);
    }
  };

  // Handle Ask AI Assistant
  const handleAskAi = async () => {
    if (!aiQuestion.trim() || !courseDetail) return;
    try {
      setIsAiLoading(true);
      const res = await learningApi.askAiAssistant(
        courseDetail.id,
        aiQuestion,
        lessonDetail?.id
      );
      setAiResponse({
        answer: res.answer,
        resources: res.recommended_resources || [],
        followups: res.suggested_followups || [],
      });
      setIsAiLoading(false);
    } catch (err: any) {
      setAiResponse({
        answer: "Could not retrieve response from AI assistant right now.",
        resources: [],
        followups: [],
      });
      setIsAiLoading(false);
    }
  };

  // Handle Generate Study Plan
  const handleGenerateStudyPlan = async () => {
    if (!courseDetail) return;
    try {
      setIsAiLoading(true);
      const res = await learningApi.generateStudyPlan(
        courseDetail.id,
        aiStudyPlanHours,
        aiStudyPlanWeeks
      );
      setAiStudyPlan(res);
      setIsAiLoading(false);
    } catch (err: any) {
      setIsAiLoading(false);
    }
  };

  // Handle Admin Review Submission
  const handleAdminReview = async (subId: string) => {
    try {
      setIsLoading(true);
      await learningApi.adminReviewSubmission(subId, {
        status: adminReviewStatus,
        grade_score: adminReviewScore,
        evaluator_feedback: adminReviewFeedback || "Reviewed by GFG Credential Evaluator.",
      });
      setFeedbackMsg({
        type: "success",
        text: `Submission successfully marked as ${adminReviewStatus.toUpperCase()}.`,
      });
      setSelectedSubmissionId(null);
      loadAdminData();
    } catch (err: any) {
      setFeedbackMsg({ type: "error", text: err.message || "Failed to submit review." });
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="learning-hub-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-300"
    >
      <div className="relative w-full max-w-7xl h-[92vh] max-h-[900px] bg-[#141414] border border-[#D8C2A6]/25 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-[#F1E7DB]">
        {/* ================================================================= */}
        {/* MODAL HEADER                                                      */}
        {/* ================================================================= */}
        <header className="px-6 py-4 border-b border-[#D8C2A6]/15 bg-[#181818] flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#A56F7C]/20 border border-[#A56F7C]/40 flex items-center justify-center text-[#D8C2A6]">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-[0.22em] text-[#A56F7C] font-semibold">
                  GFG LEARNING HUB & ACADEMY
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span className="text-[10px] font-mono text-[#888888]">FREE & AUTHENTIC CREDENTIALS</span>
              </div>
              <h2 id="learning-hub-title" className="font-serif text-lg sm:text-xl text-[#F1E7DB] leading-tight">
                Practical Skills & Verified Returnship Certificates
              </h2>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav aria-label="Learning Hub Sections" className="hidden lg:flex items-center gap-1 bg-[#111111] p-1 rounded-xl border border-white/5 text-xs font-mono">
            <button
              type="button"
              onClick={() => setActiveTab("catalogue")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === "catalogue" ? "bg-[#D8C2A6] text-[#111111] font-bold" : "text-[#A8A8A8] hover:text-[#F1E7DB]"
              }`}
            >
              Course Catalogue
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab("dashboard");
                loadDashboard();
              }}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === "dashboard" ? "bg-[#D8C2A6] text-[#111111] font-bold" : "text-[#A8A8A8] hover:text-[#F1E7DB]"
              }`}
            >
              My Learning & Credentials
            </button>
            {isAdmin && (
              <button
                type="button"
                onClick={() => {
                  setActiveTab("admin");
                  loadAdminData();
                }}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  activeTab === "admin" ? "bg-[#A56F7C] text-[#F1E7DB] font-bold" : "text-[#E7C1C9] hover:text-[#F1E7DB]"
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Admin Governance</span>
              </button>
            )}
          </nav>

          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Learning Hub"
            className="w-9 h-9 rounded-full bg-[#202020] hover:bg-[#2c2c2c] border border-white/10 flex items-center justify-center text-[#B5A99B] hover:text-[#F1E7DB] transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </header>

        {/* Feedback Alert Bar */}
        {feedbackMsg && (
          <div
            className={`px-6 py-2.5 text-xs font-mono flex items-center justify-between border-b ${
              feedbackMsg.type === "success"
                ? "bg-emerald-950/80 border-emerald-500/30 text-emerald-300"
                : "bg-red-950/80 border-red-500/30 text-red-300"
            }`}
          >
            <span>{feedbackMsg.text}</span>
            <button
              type="button"
              onClick={() => setFeedbackMsg(null)}
              className="text-xs opacity-70 hover:opacity-100"
            >
              ✕
            </button>
          </div>
        )}

        {/* ================================================================= */}
        {/* MAIN BODY AREA                                                    */}
        {/* ================================================================= */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 bg-[#121212]">
          {/* TAB 1: CATALOGUE VIEW */}
          {activeTab === "catalogue" && (
            <div className="space-y-6 max-w-6xl mx-auto">
              {/* Search & Category Filter Bar */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#181818] p-4 rounded-2xl border border-white/5">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#777777]" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search courses, skills, or curriculum..."
                    className="w-full bg-[#111111] border border-[#D8C2A6]/20 rounded-xl pl-10 pr-4 py-2 text-xs text-[#F1E7DB] placeholder-[#666666] focus:outline-none focus:border-[#D8C2A6]"
                  />
                </div>

                {/* Categories */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                  {["All", "Digital Literacy", "Data & Analytics", "Career Readiness"].map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono whitespace-nowrap transition-all ${
                        selectedCategory === cat
                          ? "bg-[#D8C2A6] text-[#111111] font-semibold shadow-sm"
                          : "bg-[#202020] text-[#999999] hover:text-[#F1E7DB] hover:bg-[#282828]"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Course Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map((c) => (
                  <div
                    key={c.id}
                    className="bg-[#181818] border border-[#D8C2A6]/20 hover:border-[#D8C2A6]/45 rounded-2xl p-6 flex flex-col justify-between transition-all hover:shadow-xl group"
                  >
                    <div>
                      {/* Category & Difficulty Header */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className="px-2.5 py-0.5 rounded-full bg-[#A56F7C]/20 border border-[#A56F7C]/30 text-[10px] font-mono text-[#E2D4C3] tracking-wide uppercase">
                          {c.category}
                        </span>
                        <span className="text-[10px] font-mono text-[#888888]">
                          {c.difficulty} • {c.estimated_duration_hours}h
                        </span>
                      </div>

                      {/* Course Title */}
                      <h3 className="font-serif text-lg text-[#F1E7DB] group-hover:text-[#D8C2A6] transition-colors leading-snug mb-2">
                        {c.title}
                      </h3>

                      {/* Description */}
                      <p className="text-xs text-[#A8A8A8] line-clamp-3 leading-relaxed mb-4">
                        {c.description}
                      </p>

                      {/* Learning Outcomes Sneak Peek */}
                      {c.learning_outcomes && c.learning_outcomes.length > 0 && (
                        <div className="p-3 rounded-xl bg-[#1F1F1F] border border-white/5 mb-4 text-[11px] text-[#CCCCCC] space-y-1.5">
                          <div className="text-[10px] font-mono uppercase text-[#A56F7C] tracking-wider font-semibold">
                            Core Outcomes:
                          </div>
                          {c.learning_outcomes.slice(0, 2).map((outcome, idx) => (
                            <div key={idx} className="flex items-start gap-1.5">
                              <CheckCircle2 className="w-3 h-3 text-emerald-400 flex-shrink-0 mt-0.5" />
                              <span className="line-clamp-1">{outcome}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Progress Bar (if enrolled) */}
                      {c.is_enrolled && (
                        <div className="mb-4 space-y-1">
                          <div className="flex items-center justify-between text-[10px] font-mono text-[#999999]">
                            <span>Progress</span>
                            <span className="text-[#D8C2A6] font-bold">{c.enrollment_progress}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-[#252525] rounded-full overflow-hidden">
                            <div
                              className="h-full bg-[#D8C2A6] transition-all duration-500 rounded-full"
                              style={{ width: `${c.enrollment_progress}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Action Bar */}
                    <div className="pt-4 border-t border-white/5 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          loadCourseDetail(c.slug);
                          setActiveTab("course_detail");
                        }}
                        className="text-xs font-mono text-[#D8C2A6] hover:text-[#F1E7DB] flex items-center gap-1 transition-colors"
                      >
                        <span>Syllabus</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>

                      {c.certificate_earned ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-[10px] font-mono text-emerald-300 font-semibold uppercase">
                          <Award className="w-3.5 h-3.5" />
                          <span>Certified</span>
                        </span>
                      ) : c.is_enrolled ? (
                        <button
                          type="button"
                          onClick={() => {
                            loadCourseDetail(c.slug);
                            setActiveTab("course_detail");
                          }}
                          className="px-3.5 py-1.5 rounded-lg bg-[#D8C2A6] text-[#111111] font-semibold text-xs font-mono uppercase tracking-wider hover:bg-[#E2D4C3] transition-all"
                        >
                          Resume
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleEnroll(c.id)}
                          className="px-3.5 py-1.5 rounded-lg bg-[#A56F7C] text-[#F1E7DB] font-semibold text-xs font-mono uppercase tracking-wider hover:bg-[#B67E8B] transition-all"
                        >
                          Enroll Free
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: COURSE DETAIL VIEW */}
          {activeTab === "course_detail" && courseDetail && (
            <div className="space-y-6 max-w-5xl mx-auto">
              {/* Back to catalogue breadcrumb */}
              <button
                type="button"
                onClick={() => setActiveTab("catalogue")}
                className="text-xs font-mono text-[#D8C2A6] hover:text-[#F1E7DB] flex items-center gap-1.5 transition-colors"
              >
                <ArrowRight className="w-3.5 h-3.5 rotate-180" />
                <span>Back to Catalogue</span>
              </button>

              {/* Course Hero Banner */}
              <div className="bg-[#181818] border border-[#D8C2A6]/20 rounded-3xl p-6 sm:p-8 shadow-xl">
                <div className="flex flex-col md:flex-row items-start justify-between gap-6">
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-[#A56F7C]/20 border border-[#A56F7C]/30 text-[10px] font-mono text-[#E2D4C3] tracking-wide uppercase">
                        {courseDetail.category}
                      </span>
                      <span className="text-[10px] font-mono text-[#888888]">
                        {courseDetail.difficulty} • {courseDetail.estimated_duration_hours} Hours Total
                      </span>
                    </div>

                    <h1 className="font-serif text-2xl sm:text-3xl text-[#F1E7DB] leading-snug">
                      {courseDetail.title}
                    </h1>

                    <p className="text-xs sm:text-sm text-[#A8A8A8] leading-relaxed max-w-2xl">
                      {courseDetail.description}
                    </p>

                    {/* Meta tags */}
                    <div className="pt-2 flex flex-wrap items-center gap-3 text-xs text-[#CCCCCC] font-mono">
                      <span>Version: {courseDetail.version}</span>
                      <span>•</span>
                      <span>Languages: English (Primary), தமிழ் (Planned)</span>
                      <span>•</span>
                      <span>Passing Score: {courseDetail.passing_score_percentage}%</span>
                    </div>
                  </div>

                  {/* Enrollment / Action Card */}
                  <div className="w-full md:w-72 bg-[#1F1F1F] border border-white/5 rounded-2xl p-5 flex flex-col justify-between space-y-4 flex-shrink-0">
                    <div>
                      <div className="text-[10px] font-mono uppercase text-[#A56F7C] tracking-widest font-semibold mb-1">
                        Course Enrollment
                      </div>
                      <div className="text-xs text-[#999999]">
                        {courseDetail.is_enrolled
                          ? `Enrolled (Progress: ${courseDetail.enrollment_progress}%)`
                          : "Free open enrollment for all career returners"}
                      </div>
                    </div>

                    {courseDetail.certificate_earned ? (
                      <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs font-mono space-y-1">
                        <div className="font-bold flex items-center gap-1.5">
                          <Award className="w-4 h-4 text-emerald-400" />
                          <span>Certificate Issued!</span>
                        </div>
                        <div className="text-[10px] text-emerald-400/80">
                          Credential: {courseDetail.certificate_credential_id}
                        </div>
                        <a
                          href={`/verify/${courseDetail.certificate_credential_id}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[10px] underline block pt-1 text-emerald-200"
                        >
                          View Public Verification →
                        </a>
                      </div>
                    ) : courseDetail.can_claim_certificate ? (
                      <button
                        type="button"
                        onClick={() => handleClaimCertificate(courseDetail.id)}
                        className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs font-mono uppercase tracking-wider transition-all shadow-lg animate-pulse"
                      >
                        Claim Authentic Certificate
                      </button>
                    ) : courseDetail.is_enrolled ? (
                      <button
                        type="button"
                        onClick={() => {
                          const firstLesson = courseDetail.modules?.[0]?.lessons?.[0];
                          const targetLessonId = courseDetail.current_lesson_id || firstLesson?.id;
                          if (targetLessonId) {
                            loadLesson(courseDetail.id, targetLessonId);
                            setActiveTab("classroom");
                          }
                        }}
                        className="w-full py-2.5 rounded-xl bg-[#D8C2A6] text-[#111111] font-semibold text-xs font-mono uppercase tracking-wider hover:bg-[#E2D4C3] transition-all"
                      >
                        Resume Learning
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleEnroll(courseDetail.id)}
                        className="w-full py-2.5 rounded-xl bg-[#A56F7C] text-[#F1E7DB] font-semibold text-xs font-mono uppercase tracking-wider hover:bg-[#B67E8B] transition-all shadow-md"
                      >
                        Enroll Now — Free
                      </button>
                    )}

                    {/* AI Study Plan Button */}
                    <button
                      type="button"
                      onClick={() => {
                        setShowAiDrawer(true);
                        handleGenerateStudyPlan();
                      }}
                      className="w-full py-2 rounded-xl bg-[#111111] hover:bg-[#252525] border border-[#D8C2A6]/20 text-[#D8C2A6] text-xs font-mono flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Brain className="w-3.5 h-3.5 text-[#A56F7C]" />
                      <span>Generate AI Study Plan</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Syllabus: Modules & Lessons Accordion */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-serif text-lg text-[#F1E7DB]">Curriculum & Structured Syllabus</h2>
                  <span className="text-xs font-mono text-[#888888]">
                    {courseDetail.modules.length} Modules • {courseDetail.lesson_count} Lessons
                  </span>
                </div>

                <div className="space-y-3">
                  {courseDetail.modules.map((m, mIdx) => (
                    <div
                      key={m.id}
                      className="bg-[#181818] border border-white/5 rounded-2xl p-5 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-[10px] font-mono uppercase text-[#A56F7C] tracking-wider block">
                            Module {mIdx + 1}
                          </span>
                          <h3 className="font-serif text-base text-[#F1E7DB]">{m.title}</h3>
                          {m.description && <p className="text-xs text-[#888888]">{m.description}</p>}
                        </div>
                        <span className="text-[11px] font-mono text-[#666666]">
                          {m.duration_minutes} mins
                        </span>
                      </div>

                      {/* Lessons inside module */}
                      <div className="space-y-1.5 pt-2">
                        {m.lessons.map((l) => (
                          <div
                            key={l.id}
                            onClick={() => {
                              loadLesson(courseDetail.id, l.id);
                              setActiveTab("classroom");
                            }}
                            className="flex items-center justify-between p-3 rounded-xl bg-[#141414] hover:bg-[#222222] border border-white/5 cursor-pointer transition-all group"
                          >
                            <div className="flex items-center gap-3">
                              {l.is_completed ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                              ) : (
                                <div className="w-4 h-4 rounded-full border border-white/20 group-hover:border-[#D8C2A6]" />
                              )}
                              <span className="text-xs text-[#CCCCCC] group-hover:text-[#F1E7DB] transition-colors">
                                {l.title}
                              </span>
                            </div>

                            <div className="flex items-center gap-3 text-[11px] font-mono text-[#777777]">
                              <span>{l.estimated_minutes}m</span>
                              <ChevronRight className="w-3.5 h-3.5 text-[#555555] group-hover:text-[#D8C2A6]" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Final Assessment & Practical Assignment Links */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  {courseDetail.assessment_id && (
                    <div
                      onClick={() => {
                        loadAssessment(courseDetail.assessment_id!);
                        setActiveTab("assessment");
                      }}
                      className="p-5 rounded-2xl bg-[#181818] border border-[#D8C2A6]/20 hover:border-[#D8C2A6]/50 cursor-pointer transition-all flex items-center justify-between group"
                    >
                      <div className="space-y-1">
                        <div className="text-[10px] font-mono uppercase text-[#A56F7C] tracking-wider">
                          Certification Assessment
                        </div>
                        <h4 className="font-serif text-sm text-[#F1E7DB] group-hover:text-[#D8C2A6]">
                          Final Comprehensive Quiz
                        </h4>
                        <div className="text-[11px] text-[#888888]">10 Questions • 70% to Pass</div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-[#777777] group-hover:text-[#D8C2A6]" />
                    </div>
                  )}

                  {courseDetail.assignment_id && (
                    <div
                      onClick={() => {
                        loadAssignment(courseDetail.assignment_id!);
                        setActiveTab("assignment");
                      }}
                      className="p-5 rounded-2xl bg-[#181818] border border-[#D8C2A6]/20 hover:border-[#D8C2A6]/50 cursor-pointer transition-all flex items-center justify-between group"
                    >
                      <div className="space-y-1">
                        <div className="text-[10px] font-mono uppercase text-[#A56F7C] tracking-wider">
                          Practical Capstone Project
                        </div>
                        <h4 className="font-serif text-sm text-[#F1E7DB] group-hover:text-[#D8C2A6]">
                          Published Rubric & Submission
                        </h4>
                        <div className="text-[11px] text-[#888888]">Evaluated by GFG Mentors</div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-[#777777] group-hover:text-[#D8C2A6]" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CLASSROOM / LESSON READER VIEW */}
          {activeTab === "classroom" && lessonDetail && (
            <div className="max-w-4xl mx-auto space-y-6">
              {/* Classroom header breadcrumb */}
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <button
                  type="button"
                  onClick={() => setActiveTab("course_detail")}
                  className="text-xs font-mono text-[#D8C2A6] hover:text-[#F1E7DB] flex items-center gap-1.5"
                >
                  <ArrowRight className="w-3.5 h-3.5 rotate-180" />
                  <span>Exit Classroom to Syllabus</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAiDrawer(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#A56F7C]/20 border border-[#A56F7C]/40 text-[11px] font-mono text-[#F1E7DB] hover:bg-[#A56F7C]/30 transition-colors"
                  >
                    <Brain className="w-3.5 h-3.5 text-[#D8C2A6]" />
                    <span>Ask AI Assistant</span>
                  </button>
                </div>
              </div>

              {/* Lesson Card */}
              <article className="bg-[#181818] border border-[#D8C2A6]/20 rounded-3xl p-6 sm:p-10 shadow-xl space-y-6">
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-widest text-[#A56F7C] mb-1">
                    {lessonDetail.module_title}
                  </div>
                  <h1 className="font-serif text-2xl sm:text-3xl text-[#F1E7DB] leading-tight">
                    {lessonDetail.title}
                  </h1>
                  <div className="flex items-center gap-3 text-xs font-mono text-[#777777] mt-2">
                    <span>Estimated time: {lessonDetail.estimated_minutes} minutes</span>
                    <span>•</span>
                    <span>Status: {lessonDetail.is_completed ? "Completed" : "In Progress"}</span>
                  </div>
                </div>

                {/* Embedded Video Lesson (YouTube IFrame API) */}
                {lessonDetail.video_url && (
                  <div className="pt-2 pb-2">
                    <YouTubePlayer
                      videoUrlOrId={lessonDetail.video_url}
                      title={`Video Lesson: ${lessonDetail.title}`}
                    />
                  </div>
                )}

                {/* Markdown Prose Reader */}
                <div className="prose prose-invert prose-sm max-w-none text-[#CCCCCC] leading-relaxed space-y-4 border-t border-b border-white/5 py-6">
                  {lessonDetail.content_markdown.split("\n\n").map((para, pIdx) => {
                    if (para.startsWith("# ")) {
                      return (
                        <h2 key={pIdx} className="font-serif text-xl text-[#F1E7DB] pt-2">
                          {para.replace("# ", "")}
                        </h2>
                      );
                    }
                    if (para.startsWith("### ")) {
                      return (
                        <h3 key={pIdx} className="font-serif text-base text-[#D8C2A6] pt-1">
                          {para.replace("### ", "")}
                        </h3>
                      );
                    }
                    if (para.startsWith("```")) {
                      const lines = para.split("\n").filter((l) => !l.startsWith("```"));
                      return (
                        <pre key={pIdx} className="bg-[#111111] p-4 rounded-xl border border-white/10 font-mono text-xs overflow-x-auto text-[#E2D4C3]">
                          <code>{lines.join("\n")}</code>
                        </pre>
                      );
                    }
                    return (
                      <p key={pIdx} className="text-xs sm:text-sm">
                        {para}
                      </p>
                    );
                  })}
                </div>

                {/* Downloadable Resources */}
                {lessonDetail.downloadable_resources && lessonDetail.downloadable_resources.length > 0 && (
                  <div className="bg-[#1F1F1F] border border-white/5 rounded-2xl p-4 space-y-3">
                    <div className="text-[10px] font-mono uppercase tracking-widest text-[#D8C2A6] flex items-center gap-2">
                      <Download className="w-3.5 h-3.5 text-[#A56F7C]" />
                      <span>Downloadable Learning Assets & Worksheets</span>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-2">
                      {lessonDetail.downloadable_resources.map((res, rIdx) => (
                        <a
                          key={rIdx}
                          href={res.url}
                          download
                          className="flex items-center justify-between p-3 rounded-xl bg-[#141414] hover:bg-[#252525] border border-white/5 transition-colors group"
                        >
                          <div className="space-y-0.5">
                            <div className="text-xs text-[#F1E7DB] font-medium group-hover:text-[#D8C2A6]">
                              {res.title}
                            </div>
                            <div className="text-[10px] font-mono text-[#777777]">
                              {res.file_type.toUpperCase()} • {res.size_kb} KB
                            </div>
                          </div>
                          <Download className="w-3.5 h-3.5 text-[#666666] group-hover:text-[#D8C2A6]" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Interactive Inline Knowledge Check */}
                {lessonDetail.knowledge_check && (
                  <div className="bg-[#1A1A1A] border border-[#A56F7C]/30 rounded-2xl p-5 space-y-3">
                    <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-[#E2D4C3]">
                      <HelpCircle className="w-3.5 h-3.5 text-[#A56F7C]" />
                      <span>Quick Knowledge Check</span>
                    </div>

                    <div className="text-xs sm:text-sm font-medium text-[#F1E7DB]">
                      {lessonDetail.knowledge_check.question}
                    </div>

                    <div className="space-y-2 pt-1">
                      {lessonDetail.knowledge_check.options.map((opt, oIdx) => (
                        <button
                          key={oIdx}
                          type="button"
                          onClick={() => {
                            setSelectedOptionIndex(oIdx);
                            setShowExplanation(true);
                          }}
                          className={`w-full text-left p-3 rounded-xl text-xs font-mono transition-all flex items-center justify-between ${
                            selectedOptionIndex === oIdx
                              ? oIdx === lessonDetail.knowledge_check?.correct_index
                                ? "bg-emerald-950/60 border border-emerald-500/50 text-emerald-200"
                                : "bg-red-950/60 border border-red-500/50 text-red-200"
                              : "bg-[#141414] border border-white/5 hover:border-white/20 text-[#CCCCCC]"
                          }`}
                        >
                          <span>{opt}</span>
                          {selectedOptionIndex === oIdx && (
                            <span>
                              {oIdx === lessonDetail.knowledge_check?.correct_index ? "✓ Correct" : "✕ Try again"}
                            </span>
                          )}
                        </button>
                      ))}
                    </div>

                    {showExplanation && (
                      <div className="p-3 rounded-xl bg-[#222222] border border-white/5 text-xs text-[#A8A8A8] font-mono pt-2">
                        <strong>Explanation:</strong> {lessonDetail.knowledge_check.explanation}
                      </div>
                    )}
                  </div>
                )}

                {/* Lesson Navigation & Completion Bar */}
                <div className="pt-4 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div>
                    {lessonDetail.prev_lesson_id ? (
                      <button
                        type="button"
                        onClick={() => loadLesson(lessonDetail.course_id, lessonDetail.prev_lesson_id!)}
                        className="text-xs font-mono text-[#D8C2A6] hover:text-[#F1E7DB] flex items-center gap-1.5"
                      >
                        <ArrowRight className="w-3.5 h-3.5 rotate-180" />
                        <span>Previous Lesson</span>
                      </button>
                    ) : (
                      <span className="text-xs font-mono text-[#555555]">First lesson</span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    {!lessonDetail.is_completed ? (
                      <button
                        type="button"
                        onClick={handleCompleteLesson}
                        className="flex-1 sm:flex-initial px-5 py-2 rounded-xl bg-[#D8C2A6] text-[#111111] font-semibold text-xs font-mono uppercase tracking-wider hover:bg-[#E2D4C3] transition-all shadow-md"
                      >
                        Mark as Complete
                      </button>
                    ) : (
                      <span className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-mono">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Completed</span>
                      </span>
                    )}

                    {lessonDetail.next_lesson_id && (
                      <button
                        type="button"
                        onClick={() => loadLesson(lessonDetail.course_id, lessonDetail.next_lesson_id!)}
                        className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-[#252525] hover:bg-[#303030] text-[#D8C2A6] text-xs font-mono flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <span>Next Lesson</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </article>
            </div>
          )}

          {/* TAB 4: ASSESSMENT / QUIZ VIEW */}
          {activeTab === "assessment" && assessmentData && (
            <div className="max-w-3xl mx-auto space-y-6">
              <button
                type="button"
                onClick={() => setActiveTab("course_detail")}
                className="text-xs font-mono text-[#D8C2A6] hover:text-[#F1E7DB] flex items-center gap-1.5"
              >
                <ArrowRight className="w-3.5 h-3.5 rotate-180" />
                <span>Return to Course Detail</span>
              </button>

              <div className="bg-[#181818] border border-[#D8C2A6]/20 rounded-3xl p-6 sm:p-10 shadow-xl space-y-6">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#A56F7C] block mb-1">
                    PROCTORED ASSESSMENT ENGINE
                  </span>
                  <h1 className="font-serif text-2xl sm:text-3xl text-[#F1E7DB]">
                    {assessmentData.title}
                  </h1>
                  <p className="text-xs text-[#999999] mt-1">
                    {assessmentData.description}
                  </p>
                  <div className="flex flex-wrap items-center gap-3 pt-3 text-xs font-mono text-[#D8C2A6]">
                    <span>Passing Threshold: {assessmentData.passing_score_percentage}%</span>
                    <span>•</span>
                    <span>Remaining Attempts: {assessmentData.attempts_remaining} of {assessmentData.max_attempts}</span>
                    <span>•</span>
                    <span>Time Limit: {assessmentData.time_limit_minutes} minutes</span>
                  </div>
                </div>

                {/* Question List */}
                <div className="space-y-6 pt-4 border-t border-white/5">
                  {assessmentData.questions.map((q, idx) => (
                    <div key={q.id} className="p-5 rounded-2xl bg-[#141414] border border-white/5 space-y-3">
                      <div className="flex items-start justify-between gap-4">
                        <span className="font-medium text-xs sm:text-sm text-[#F1E7DB]">
                          {idx + 1}. {q.question_text}
                        </span>
                        <span className="text-[10px] font-mono text-[#777777] flex-shrink-0">
                          {q.points} pt
                        </span>
                      </div>

                      {/* Options */}
                      <div className="space-y-1.5 pt-1">
                        {q.options.map((opt) => {
                          const isSelected = (selectedAnswers[q.id] || []).includes(opt.id);
                          return (
                            <label
                              key={opt.id}
                              className={`flex items-center gap-3 p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                                isSelected
                                  ? "bg-[#D8C2A6]/10 border-[#D8C2A6] text-[#F1E7DB]"
                                  : "bg-[#181818] border-white/5 hover:border-white/20 text-[#A8A8A8]"
                              }`}
                            >
                              <input
                                type="radio"
                                name={`q_${q.id}`}
                                checked={isSelected}
                                onChange={() => {
                                  setSelectedAnswers({ ...selectedAnswers, [q.id]: [opt.id] });
                                }}
                                className="accent-[#D8C2A6]"
                              />
                              <span>{opt.text}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Submit Quiz Action */}
                <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                  <div className="text-xs font-mono text-[#888888]">
                    {Object.keys(selectedAnswers).length} of {assessmentData.questions.length} answered
                  </div>

                  <button
                    type="button"
                    disabled={isSubmittingQuiz || Object.keys(selectedAnswers).length === 0}
                    onClick={handleSubmitQuiz}
                    className="px-6 py-2.5 rounded-xl bg-[#D8C2A6] text-[#111111] font-semibold text-xs font-mono uppercase tracking-wider hover:bg-[#E2D4C3] disabled:opacity-40 transition-all shadow-md"
                  >
                    {isSubmittingQuiz ? "Scoring on Server..." : "Submit Answers for Grading"}
                  </button>
                </div>

                {/* Scoring Result Display */}
                {quizResult && (
                  <div className={`p-6 rounded-2xl border space-y-4 animate-in fade-in ${
                    quizResult.passed
                      ? "bg-emerald-950/40 border-emerald-500/40"
                      : "bg-amber-950/40 border-amber-500/40"
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {quizResult.passed ? (
                          <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                        ) : (
                          <AlertCircle className="w-8 h-8 text-amber-400" />
                        )}
                        <div>
                          <h4 className="font-serif text-lg text-[#F1E7DB]">
                            {quizResult.passed ? "Assessment Passed!" : "Passing Threshold Not Reached"}
                          </h4>
                          <span className="text-xs font-mono text-[#CCCCCC]">
                            Score: {quizResult.score_percentage}% • Passing requirement: {quizResult.passing_score_percentage}%
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Explanations & Review */}
                    <div className="space-y-2 pt-2">
                      <div className="text-[10px] font-mono uppercase tracking-wider text-[#D8C2A6]">
                        Answer Review & Pedagogical Explanations:
                      </div>
                      {quizResult.feedback?.map((fb: any, fbIdx: number) => (
                        <div key={fbIdx} className="p-3 rounded-xl bg-[#111111] border border-white/5 text-xs space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-[#CCCCCC] font-medium">{fbIdx + 1}. {fb.question_text}</span>
                            <span className={`text-[10px] font-mono uppercase ${fb.is_correct ? "text-emerald-400" : "text-red-400"}`}>
                              {fb.is_correct ? "Correct" : "Incorrect"}
                            </span>
                          </div>
                          {fb.explanation && (
                            <p className="text-[11px] text-[#888888] font-mono italic">
                              {fb.explanation}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 5: PRACTICAL ASSIGNMENT VIEW */}
          {activeTab === "assignment" && assignmentData && (
            <div className="max-w-4xl mx-auto space-y-6">
              <button
                type="button"
                onClick={() => setActiveTab("course_detail")}
                className="text-xs font-mono text-[#D8C2A6] hover:text-[#F1E7DB] flex items-center gap-1.5"
              >
                <ArrowRight className="w-3.5 h-3.5 rotate-180" />
                <span>Return to Course Detail</span>
              </button>

              <div className="bg-[#181818] border border-[#D8C2A6]/20 rounded-3xl p-6 sm:p-10 shadow-xl space-y-6">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#A56F7C] block mb-1">
                    HANDS-ON CAPSTONE PORTFOLIO PROJECT
                  </span>
                  <h1 className="font-serif text-2xl sm:text-3xl text-[#F1E7DB]">
                    {assignmentData.title}
                  </h1>
                </div>

                {/* Instructions */}
                <div className="prose prose-invert prose-sm text-[#CCCCCC] leading-relaxed border-t border-b border-white/5 py-4 space-y-3">
                  {assignmentData.instructions_markdown.split("\n\n").map((para, idx) => (
                    <p key={idx} className="text-xs sm:text-sm">
                      {para}
                    </p>
                  ))}
                </div>

                {/* Published Rubric Table */}
                <div className="space-y-3">
                  <div className="text-xs font-mono uppercase text-[#D8C2A6] tracking-wider font-semibold">
                    Published Evaluation Rubric
                  </div>
                  <div className="border border-white/10 rounded-2xl overflow-hidden bg-[#141414]">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#1F1F1F] text-[#888888] font-mono uppercase text-[10px]">
                        <tr>
                          <th className="p-3">Criterion</th>
                          <th className="p-3">Weight</th>
                          <th className="p-3">Description</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 text-[#CCCCCC]">
                        {assignmentData.rubric.map((r, rIdx) => (
                          <tr key={rIdx} className="hover:bg-white/[0.02]">
                            <td className="p-3 font-medium text-[#F1E7DB]">{r.criterion}</td>
                            <td className="p-3 font-mono text-[#D8C2A6]">{r.weight_percentage}%</td>
                            <td className="p-3 text-[#A8A8A8]">{r.description}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Current Submission Status (if any) */}
                {assignmentData.user_submission && (
                  <div className="p-4 rounded-2xl bg-[#1C1C1C] border border-white/10 space-y-2 text-xs font-mono">
                    <div className="flex items-center justify-between">
                      <span className="text-[#888888]">Submission Status:</span>
                      <span className={`px-2.5 py-0.5 rounded-full uppercase text-[10px] font-bold ${
                        assignmentData.user_submission.status === "approved"
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                          : assignmentData.user_submission.status === "rejected"
                          ? "bg-red-500/20 text-red-300 border border-red-500/30"
                          : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                      }`}>
                        {assignmentData.user_submission.status.replace("_", " ")}
                      </span>
                    </div>

                    {assignmentData.user_submission.grade_score !== undefined && assignmentData.user_submission.grade_score !== null && (
                      <div className="flex items-center justify-between text-[#CCCCCC]">
                        <span>Assigned Grade:</span>
                        <span className="text-[#D8C2A6] font-bold">{assignmentData.user_submission.grade_score}/100</span>
                      </div>
                    )}

                    {assignmentData.user_submission.evaluator_feedback && (
                      <div className="pt-2 border-t border-white/5 text-[#AAAAAA]">
                        <span className="text-[#D8C2A6] block mb-1">Evaluator Feedback:</span>
                        <p className="italic font-sans">"{assignmentData.user_submission.evaluator_feedback}"</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Submission Form */}
                <div className="space-y-4 pt-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono text-[#D8C2A6] block">
                      Project Write-Up & Executive Summary *
                    </label>
                    <textarea
                      rows={5}
                      value={assignmentText}
                      onChange={(e) => setAssignmentText(e.target.value)}
                      placeholder="Detail your methodology, findings, and key takeaways (minimum 20 characters)..."
                      className="w-full bg-[#111111] border border-white/10 rounded-xl p-3 text-xs text-[#F1E7DB] placeholder-[#666666] focus:outline-none focus:border-[#D8C2A6]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-mono text-[#D8C2A6] block">
                      External Deliverable URL (GitHub, Google Docs, Figma, or Portfolio)
                    </label>
                    <input
                      type="url"
                      value={assignmentUrl}
                      onChange={(e) => setAssignmentUrl(e.target.value)}
                      placeholder="https://docs.google.com/... or https://github.com/..."
                      className="w-full bg-[#111111] border border-white/10 rounded-xl px-3 py-2 text-xs text-[#F1E7DB] placeholder-[#666666] focus:outline-none focus:border-[#D8C2A6]"
                    />
                  </div>

                  <button
                    type="button"
                    disabled={isSubmittingAssignment || assignmentText.trim().length < 20}
                    onClick={handleSubmitAssignment}
                    className="px-6 py-2.5 rounded-xl bg-[#D8C2A6] text-[#111111] font-semibold text-xs font-mono uppercase tracking-wider hover:bg-[#E2D4C3] disabled:opacity-40 transition-all shadow-md"
                  >
                    {isSubmittingAssignment ? "Submitting..." : "Submit Practical Assignment"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: LEARNER DASHBOARD VIEW */}
          {activeTab === "dashboard" && dashboardData && (
            <div className="space-y-8 max-w-6xl mx-auto">
              {/* Summary Metric Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-[#181818] border border-white/5 space-y-1">
                  <span className="text-[10px] font-mono uppercase text-[#888888]">Courses Enrolled</span>
                  <div className="font-serif text-2xl text-[#F1E7DB]">{dashboardData.total_enrolled}</div>
                </div>
                <div className="p-4 rounded-2xl bg-[#181818] border border-white/5 space-y-1">
                  <span className="text-[10px] font-mono uppercase text-[#888888]">Completed Courses</span>
                  <div className="font-serif text-2xl text-emerald-400">{dashboardData.total_completed}</div>
                </div>
                <div className="p-4 rounded-2xl bg-[#181818] border border-white/5 space-y-1">
                  <span className="text-[10px] font-mono uppercase text-[#888888]">Lessons Mastered</span>
                  <div className="font-serif text-2xl text-[#D8C2A6]">{dashboardData.total_lessons_completed}</div>
                </div>
                <div className="p-4 rounded-2xl bg-[#181818] border border-white/5 space-y-1">
                  <span className="text-[10px] font-mono uppercase text-[#888888]">Certificates Earned</span>
                  <div className="font-serif text-2xl text-[#E2D4C3]">{dashboardData.total_certificates_earned}</div>
                </div>
              </div>

              {/* Enrolled Courses */}
              <div className="space-y-4">
                <h3 className="font-serif text-lg text-[#F1E7DB]">My Active Courses</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {dashboardData.enrolled_courses.map((ec) => (
                    <div
                      key={ec.enrollment_id}
                      className="p-5 rounded-2xl bg-[#181818] border border-white/5 hover:border-[#D8C2A6]/40 transition-all flex flex-col justify-between space-y-3"
                    >
                      <div>
                        <div className="flex items-center justify-between text-[10px] font-mono uppercase text-[#A56F7C] mb-1">
                          <span>{ec.category}</span>
                          <span className="text-[#888888]">{ec.progress_percentage}% completed</span>
                        </div>
                        <h4 className="font-serif text-base text-[#F1E7DB]">{ec.course_title}</h4>
                        {ec.resume_lesson_title && (
                          <p className="text-xs text-[#888888] pt-1">
                            Up Next: <span className="text-[#D8C2A6]">{ec.resume_lesson_title}</span>
                          </p>
                        )}
                      </div>

                      <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                        <button
                          type="button"
                          onClick={() => {
                            loadCourseDetail(ec.course_slug);
                            setActiveTab("course_detail");
                          }}
                          className="px-3 py-1.5 rounded-lg bg-[#D8C2A6] text-[#111111] text-xs font-mono font-semibold uppercase hover:bg-[#E2D4C3] transition-colors"
                        >
                          Resume Course
                        </button>

                        {ec.certificate_earned && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-mono text-emerald-400">
                            <Award className="w-3.5 h-3.5" />
                            <span>Certificate Ready</span>
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Earned Certificates Gallery */}
              <div className="space-y-4">
                <h3 className="font-serif text-lg text-[#F1E7DB]">Earned GFG Certificates</h3>
                {dashboardData.certificates.length === 0 ? (
                  <div className="p-8 rounded-2xl bg-[#181818] border border-white/5 text-center text-xs text-[#888888]">
                    No certificates earned yet. Complete all lessons, achieve 70%+ on final quizzes, and pass the practical assignment to earn verified credentials!
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {dashboardData.certificates.map((cert) => (
                      <div
                        key={cert.id}
                        className="p-6 rounded-2xl bg-[#181818] border border-[#D8C2A6]/30 shadow-xl space-y-4 relative overflow-hidden"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="text-[10px] font-mono uppercase tracking-widest text-[#A56F7C] block">
                              AUTHENTIC CREDENTIAL
                            </span>
                            <h4 className="font-serif text-lg text-[#F1E7DB]">{cert.course_title}</h4>
                            <span className="font-mono text-xs text-[#D8C2A6] block mt-0.5">
                              ID: {cert.credential_id}
                            </span>
                          </div>
                          <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                            <Award className="w-5 h-5" />
                          </div>
                        </div>

                        <div className="flex items-center gap-3 pt-3 border-t border-white/5">
                          <a
                            href={cert.pdf_download_url}
                            download
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#D8C2A6] text-[#111111] text-xs font-mono font-semibold uppercase hover:bg-[#E2D4C3] transition-colors"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Download A4 PDF</span>
                          </a>

                          <a
                            href={`/verify/${cert.credential_id}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#252525] hover:bg-[#303030] text-[#D8C2A6] text-xs font-mono transition-colors"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>Verify URL</span>
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 7: ADMIN GOVERNANCE VIEW (ADMIN ROLE ONLY) */}
          {activeTab === "admin" && isAdmin && (
            <div className="space-y-8 max-w-6xl mx-auto">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#A56F7C] block">
                  ADMINISTRATIVE CREDENTIAL & COURSE DESK
                </span>
                <h3 className="font-serif text-xl text-[#F1E7DB]">LMS Governance & Submissions Queue</h3>
              </div>

              {/* Analytics summary */}
              {adminAnalytics && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="p-4 rounded-2xl bg-[#181818] border border-white/5 space-y-1">
                    <span className="text-[10px] font-mono text-[#888888] uppercase">Total Enrollments</span>
                    <div className="font-serif text-2xl text-[#F1E7DB]">{adminAnalytics.total_enrollments}</div>
                  </div>
                  <div className="p-4 rounded-2xl bg-[#181818] border border-white/5 space-y-1">
                    <span className="text-[10px] font-mono text-[#888888] uppercase">Completion Rate</span>
                    <div className="font-serif text-2xl text-emerald-400">{adminAnalytics.overall_completion_rate}%</div>
                  </div>
                  <div className="p-4 rounded-2xl bg-[#181818] border border-white/5 space-y-1">
                    <span className="text-[10px] font-mono text-[#888888] uppercase">Certificates Issued</span>
                    <div className="font-serif text-2xl text-[#D8C2A6]">{adminAnalytics.total_certificates_issued}</div>
                  </div>
                  <div className="p-4 rounded-2xl bg-[#181818] border border-white/5 space-y-1">
                    <span className="text-[10px] font-mono text-[#888888] uppercase">Pending Reviews</span>
                    <div className="font-serif text-2xl text-amber-400">{adminAnalytics.pending_submissions}</div>
                  </div>
                </div>
              )}

              {/* Submissions Review Queue */}
              <div className="space-y-4">
                <h4 className="font-serif text-base text-[#F1E7DB]">Student Practical Submissions Queue</h4>
                {adminSubmissions.length === 0 ? (
                  <div className="p-6 rounded-2xl bg-[#181818] text-center text-xs text-[#888888]">
                    No student submissions currently pending review.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {adminSubmissions.map((sub) => (
                      <div
                        key={sub.id}
                        className="p-5 rounded-2xl bg-[#181818] border border-white/5 space-y-3"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div>
                            <span className="text-[10px] font-mono uppercase text-[#A56F7C] tracking-wide">
                              {sub.course_title}
                            </span>
                            <h5 className="font-serif text-base text-[#F1E7DB]">
                              Learner: {sub.learner_name} ({sub.learner_email})
                            </h5>
                          </div>
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase font-bold self-start sm:self-auto ${
                            sub.status === "approved"
                              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                              : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                          }`}>
                            {sub.status}
                          </span>
                        </div>

                        {/* Submission Content */}
                        <div className="p-4 rounded-xl bg-[#111111] text-xs text-[#CCCCCC] space-y-2">
                          <p className="leading-relaxed">"{sub.submission_content}"</p>
                          {sub.external_url && (
                            <a
                              href={sub.external_url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[#D8C2A6] underline text-[11px] block flex items-center gap-1"
                            >
                              <span>View Student Project URL</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>

                        {/* Evaluation Form */}
                        {selectedSubmissionId === sub.id ? (
                          <div className="p-4 rounded-xl bg-[#202020] border border-[#D8C2A6]/30 space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="text-[10px] font-mono text-[#888888] uppercase block mb-1">Decision</label>
                                <select
                                  value={adminReviewStatus}
                                  onChange={(e) => setAdminReviewStatus(e.target.value as any)}
                                  className="w-full bg-[#111111] border border-white/10 rounded-lg p-2 text-xs text-[#F1E7DB]"
                                >
                                  <option value="approved">Approve (Award Credit)</option>
                                  <option value="rejected">Reject (Request Revisions)</option>
                                </select>
                              </div>
                              <div>
                                <label className="text-[10px] font-mono text-[#888888] uppercase block mb-1">Grade Score (0-100)</label>
                                <input
                                  type="number"
                                  min={0}
                                  max={100}
                                  value={adminReviewScore}
                                  onChange={(e) => setAdminReviewScore(Number(e.target.value))}
                                  className="w-full bg-[#111111] border border-white/10 rounded-lg p-2 text-xs text-[#F1E7DB]"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="text-[10px] font-mono text-[#888888] uppercase block mb-1">Evaluator Feedback</label>
                              <input
                                type="text"
                                value={adminReviewFeedback}
                                onChange={(e) => setAdminReviewFeedback(e.target.value)}
                                placeholder="Constructive feedback for learner..."
                                className="w-full bg-[#111111] border border-white/10 rounded-lg p-2 text-xs text-[#F1E7DB]"
                              />
                            </div>

                            <div className="flex items-center gap-2 pt-1">
                              <button
                                type="button"
                                onClick={() => handleAdminReview(sub.id)}
                                className="px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-mono font-semibold uppercase"
                              >
                                Save Review
                              </button>
                              <button
                                type="button"
                                onClick={() => setSelectedSubmissionId(null)}
                                className="px-3 py-1.5 rounded-lg bg-[#333333] text-[#888888] text-xs font-mono uppercase"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="pt-1 flex items-center justify-between">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedSubmissionId(sub.id);
                                setAdminReviewScore(sub.grade_score || 90);
                                setAdminReviewFeedback(sub.evaluator_feedback || "");
                              }}
                              className="px-3.5 py-1.5 rounded-lg bg-[#252525] hover:bg-[#333333] border border-white/10 text-xs font-mono text-[#D8C2A6]"
                            >
                              Grade / Review Submission
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ================================================================= */}
        {/* AI LEARNING ASSISTANT SLIDE-OVER DRAWER                           */}
        {/* ================================================================= */}
        {showAiDrawer && (
          <div className="absolute right-0 top-0 bottom-0 w-full sm:w-96 bg-[#181818] border-l border-[#D8C2A6]/25 shadow-2xl z-50 flex flex-col p-6 animate-in slide-in-from-right duration-300">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-[#D8C2A6]" />
                <span className="font-serif text-base text-[#F1E7DB]">AI Learning Assistant</span>
              </div>
              <button
                type="button"
                onClick={() => setShowAiDrawer(false)}
                className="w-7 h-7 rounded-full bg-[#242424] flex items-center justify-center text-[#888888] hover:text-[#F1E7DB]"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4 space-y-4">
              <p className="text-xs text-[#A8A8A8] leading-relaxed">
                Powered by GFG authorized intelligence. Ask concept questions, get study plans,
                or clarify practical project steps. (AI does not alter scores or grant certificates).
              </p>

              {/* Question input */}
              <div className="space-y-2">
                <textarea
                  rows={3}
                  value={aiQuestion}
                  onChange={(e) => setAiQuestion(e.target.value)}
                  placeholder="Ask a question about this lesson or concept..."
                  className="w-full bg-[#111111] border border-white/10 rounded-xl p-3 text-xs text-[#F1E7DB] placeholder-[#666666] focus:outline-none focus:border-[#D8C2A6]"
                />
                <button
                  type="button"
                  disabled={isAiLoading || !aiQuestion.trim()}
                  onClick={handleAskAi}
                  className="w-full py-2 rounded-xl bg-[#D8C2A6] text-[#111111] font-semibold text-xs font-mono uppercase tracking-wider hover:bg-[#E2D4C3] disabled:opacity-40 transition-all flex items-center justify-center gap-1.5"
                >
                  {isAiLoading ? "Consulting AI..." : "Ask Assistant"}
                </button>
              </div>

              {/* AI Answer Display */}
              {aiResponse && (
                <div className="p-4 rounded-xl bg-[#1F1F1F] border border-white/10 space-y-2 text-xs text-[#CCCCCC]">
                  <div className="font-serif font-bold text-[#F1E7DB]">Explanation:</div>
                  <p className="leading-relaxed whitespace-pre-line">{aiResponse.answer}</p>
                </div>
              )}

              {/* Generated Study Plan */}
              {aiStudyPlan && (
                <div className="p-4 rounded-xl bg-[#1C1C1C] border border-[#D8C2A6]/20 space-y-3 text-xs">
                  <div className="font-mono text-[#D8C2A6] uppercase text-[10px] font-bold">
                    Personalized Study Plan ({aiStudyPlan.course_title})
                  </div>
                  {aiStudyPlan.weekly_schedule?.map((item: any) => (
                    <div key={item.week} className="p-2.5 rounded-lg bg-[#111111] space-y-1">
                      <div className="font-medium text-[#F1E7DB]">{item.title}</div>
                      <div className="text-[11px] text-[#888888]">Pace: {item.suggested_daily_pace}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
