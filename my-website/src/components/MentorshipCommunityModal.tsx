"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Users,
  Compass,
  Calendar,
  Clock,
  Sparkles,
  Shield,
  MessageSquare,
  CheckCircle2,
  AlertTriangle,
  Send,
  Lock,
  ChevronRight,
  BookOpen,
  Filter,
  Star,
  RefreshCw,
  Video,
  FileText,
  UserPlus,
  UserCheck,
  Check,
  Award,
  HelpCircle,
  Flag,
  Ban,
  ThumbsUp,
  BrainCircuit,
  MessageCircleQuestion,
  ExternalLink,
} from "lucide-react";
import { communityEcosystemApi } from "@/lib/api";
import { DataClassificationBadge } from "./DataClassificationBadge";

interface MentorshipCommunityModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: "mentors" | "sessions" | "circles" | "interview" | "safety";
}

export function MentorshipCommunityModal({
  isOpen,
  onClose,
  initialTab = "mentors",
}: MentorshipCommunityModalProps) {
  const [activeTab, setActiveTab] = useState<"mentors" | "sessions" | "circles" | "interview" | "safety">(initialTab);

  // Mentor directory state
  const [mentors, setMentors] = useState<any[]>([]);
  const [recommendedMentors, setRecommendedMentors] = useState<any[]>([]);
  const [fieldFilter, setFieldFilter] = useState("all");
  const [languageFilter, setLanguageFilter] = useState("all");
  const [formatFilter, setFormatFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMentorForBooking, setSelectedMentorForBooking] = useState<any | null>(null);
  const [bookingTopic, setBookingTopic] = useState("Career Break Transition Strategy & Resume Review");
  const [bookingGoals, setBookingGoals] = useState("Discuss how to frame my 3-year gap and review SQL portfolio.");
  const [bookingDate, setBookingDate] = useState("2026-10-24T11:00");
  const [bookingFormat, setBookingFormat] = useState("1:1 Video");
  const [bookingSubmitting, setBookingSubmitting] = useState(false);
  const [bookingSuccessMsg, setBookingSuccessMsg] = useState<string | null>(null);

  // Sessions state
  const [sessions, setSessions] = useState<any[]>([]);
  const [editingNotesSessionId, setEditingNotesSessionId] = useState<string | null>(null);
  const [privateNotesText, setPrivateNotesText] = useState("");
  const [feedbackSessionId, setFeedbackSessionId] = useState<string | null>(null);
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackComment, setFeedbackComment] = useState("");

  // Comeback Circles state
  const [circles, setCircles] = useState<any[]>([]);
  const [circleIndustryFilter, setCircleIndustryFilter] = useState("all");
  const [selectedCircle, setSelectedCircle] = useState<any | null>(null);
  const [circleDiscussions, setCircleDiscussions] = useState<any[]>([]);
  const [newDiscussionTitle, setNewDiscussionTitle] = useState("");
  const [newDiscussionContent, setNewDiscussionContent] = useState("");
  const [newDiscussionCategory, setNewDiscussionCategory] = useState("General");
  const [joinedCircleIds, setJoinedCircleIds] = useState<string[]>(["circle-1"]);

  // AI Interview Practice state
  const [interviewTracks, setInterviewTracks] = useState<any[]>([]);
  const [ethicalDisclaimer, setEthicalDisclaimer] = useState("");
  const [selectedTrackId, setSelectedTrackId] = useState("career_break");
  const [selectedQuestion, setSelectedQuestion] = useState("I noticed a gap on your resume between 2022 and 2024. Could you provide context on that period?");
  const [candidateAnswer, setCandidateAnswer] = useState(
    "I intentionally paused my full-time career for two years to care for my young family. During this sabbatical, I refreshed my technical toolkit by completing an advanced PostgreSQL course and building an interactive Power BI sales dashboard. I am now fully prepared and energized to bring my analytical rigor and problem-solving skills to this returnship role."
  );
  const [evaluating, setEvaluating] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState<any | null>(null);
  const [interviewHistory, setInterviewHistory] = useState<any[]>([]);

  // Safety & Moderation state
  const [guidelines, setGuidelines] = useState<any | null>(null);
  const [reportTargetType, setReportTargetType] = useState("mentor");
  const [reportTargetId, setReportTargetId] = useState("");
  const [reportReason, setReportReason] = useState("Commercial solicitation");
  const [reportDescription, setReportDescription] = useState("");
  const [reportSubmittedMsg, setReportSubmittedMsg] = useState<string | null>(null);
  const [blockedUserIds, setBlockedUserIds] = useState<string[]>([]);
  const [blockUserIdInput, setBlockUserIdInput] = useState("");

  // Data loading
  useEffect(() => {
    if (!isOpen) return;

    // Load mentors
    communityEcosystemApi.getMentors({ field: fieldFilter, language: languageFilter, format: formatFilter, search: searchQuery })
      .then(res => setMentors(res.mentors || []))
      .catch(() => {});

    communityEcosystemApi.getRecommendedMentors()
      .then(res => setRecommendedMentors(res.recommendations || []))
      .catch(() => {});

    // Load sessions
    communityEcosystemApi.getSessions()
      .then(res => setSessions(res.sessions || []))
      .catch(() => {});

    // Load circles
    communityEcosystemApi.getCircles({ industry: circleIndustryFilter })
      .then(res => {
        const list = res.circles || [];
        setCircles(list);
        if (list.length > 0 && !selectedCircle) {
          setSelectedCircle(list[0]);
          loadDiscussions(list[0].id);
        }
      })
      .catch(() => {});

    // Load interview tracks
    communityEcosystemApi.getInterviewTracks()
      .then(res => {
        setInterviewTracks(res.tracks || []);
        setEthicalDisclaimer(res.ethical_disclaimer || "");
      })
      .catch(() => {});

    // Load conduct guidelines
    communityEcosystemApi.getConductGuidelines()
      .then(res => setGuidelines(res.guidelines))
      .catch(() => {});
  }, [isOpen, fieldFilter, languageFilter, formatFilter, searchQuery, circleIndustryFilter]);

  const loadDiscussions = (circleId: string) => {
    communityEcosystemApi.getCircleDiscussions(circleId)
      .then(res => setCircleDiscussions(res.discussions || []))
      .catch(() => {});
  };

  if (!isOpen) return null;

  // Handle Session Booking Request
  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMentorForBooking) return;
    setBookingSubmitting(true);
    try {
      const res = await communityEcosystemApi.requestSession({
        candidate_id: "demo-candidate-priya",
        mentor_id: selectedMentorForBooking.id,
        topic: bookingTopic,
        goals: bookingGoals,
        scheduled_at: new Date(bookingDate).toISOString(),
        format: bookingFormat,
      });
      setBookingSuccessMsg(res.message || "Request submitted! Awaiting mentor confirmation.");
      // Refresh sessions
      const sessRes = await communityEcosystemApi.getSessions();
      setSessions(sessRes.sessions || []);
      setTimeout(() => {
        setSelectedMentorForBooking(null);
        setBookingSuccessMsg(null);
        setActiveTab("sessions");
      }, 1800);
    } catch {
      setBookingSuccessMsg("Request registered locally for demonstration.");
    } finally {
      setBookingSubmitting(false);
    }
  };

  // Handle Session Response (Accept/Decline simulation)
  const handleSessionAction = async (sessionId: string, action: "confirm" | "decline") => {
    await communityEcosystemApi.respondToSession(sessionId, action);
    const updated = await communityEcosystemApi.getSessions();
    setSessions(updated.sessions || []);
  };

  // Save private notes
  const handleSavePrivateNotes = async (sessionId: string) => {
    await communityEcosystemApi.updateSessionNotes(sessionId, privateNotesText);
    const updated = await communityEcosystemApi.getSessions();
    setSessions(updated.sessions || []);
    setEditingNotesSessionId(null);
  };

  // Submit feedback
  const handleSubmitFeedback = async (sessionId: string) => {
    await communityEcosystemApi.submitSessionFeedback(sessionId, feedbackRating, feedbackComment);
    const updated = await communityEcosystemApi.getSessions();
    setSessions(updated.sessions || []);
    setFeedbackSessionId(null);
  };

  // Join/Leave Circle
  const handleToggleJoinCircle = async (circleId: string) => {
    if (joinedCircleIds.includes(circleId)) {
      await communityEcosystemApi.leaveCircle(circleId, "demo-candidate-priya");
      setJoinedCircleIds(joinedCircleIds.filter(id => id !== circleId));
    } else {
      await communityEcosystemApi.joinCircle(circleId, "demo-candidate-priya");
      setJoinedCircleIds([...joinedCircleIds, circleId]);
    }
    const res = await communityEcosystemApi.getCircles({ industry: circleIndustryFilter });
    setCircles(res.circles || []);
  };

  // Post Discussion
  const handlePostDiscussion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCircle || !newDiscussionTitle.trim() || !newDiscussionContent.trim()) return;
    await communityEcosystemApi.createCircleDiscussion(selectedCircle.id, {
      candidate_id: "demo-candidate-priya",
      title: newDiscussionTitle,
      content: newDiscussionContent,
      category: newDiscussionCategory,
    });
    setNewDiscussionTitle("");
    setNewDiscussionContent("");
    loadDiscussions(selectedCircle.id);
  };

  // Evaluate AI Interview
  const handleEvaluateInterview = async () => {
    setEvaluating(true);
    try {
      const res = await communityEcosystemApi.evaluateInterview({
        candidate_id: "demo-candidate-priya",
        track: selectedTrackId,
        question: selectedQuestion,
        candidate_answer: candidateAnswer,
      });
      setEvaluationResult(res);
      setInterviewHistory([res, ...interviewHistory]);
    } catch (err: any) {
      alert(err.message || "Evaluation failed. Please provide a detailed response.");
    } finally {
      setEvaluating(false);
    }
  };

  // Submit moderation report
  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportTargetId.trim() || !reportDescription.trim()) return;
    const res = await communityEcosystemApi.submitReport({
      reporter_id: "demo-candidate-priya",
      target_type: reportTargetType,
      target_id: reportTargetId,
      reason: reportReason,
      description: reportDescription,
    });
    setReportSubmittedMsg(res.message);
    setReportTargetId("");
    setReportDescription("");
    setTimeout(() => setReportSubmittedMsg(null), 4000);
  };

  // Block user
  const handleBlockUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!blockUserIdInput.trim()) return;
    await communityEcosystemApi.blockUser({
      blocker_id: "demo-candidate-priya",
      blocked_id: blockUserIdInput.trim(),
    });
    setBlockedUserIds([...blockedUserIds, blockUserIdInput.trim()]);
    setBlockUserIdInput("");
  };

  const currentTrack = interviewTracks.find(t => t.id === selectedTrackId);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="community-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 md:p-8 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in"
    >
      <div className="w-full max-w-6xl bg-[#141414] text-[#F1E7DB] rounded-3xl border border-[#333333] shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* MODAL HEADER */}
        <div className="p-5 sm:p-6 border-b border-[#282828] bg-gradient-to-r from-[#171717] via-[#1A1A1A] to-[#171717] flex items-center justify-between relative">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] uppercase tracking-wider font-mono px-2.5 py-0.5 rounded-full bg-[#A56F7C]/20 text-[#D8C2A6] border border-[#A56F7C]/30">
                GFG Module 8 Ecosystem
              </span>
              <DataClassificationBadge type="simulated_demonstration" size="sm" />
              <span className="text-xs text-[#8A8A8A] font-mono flex items-center gap-1">
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
                Moderated & Safe Community
              </span>
            </div>
            <h2 id="community-modal-title" className="text-2xl sm:text-3xl font-light tracking-wide text-[#F1E7DB]">
              Mentorship, Circles & Interview Readiness
            </h2>
            <p className="text-xs text-[#9E9E9E] max-w-2xl">
              Connect with verified career mentors, collaborate in small peer comeback cohorts, and hone your returnship interview readiness in a supportive environment.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2.5 rounded-full hover:bg-white/10 text-[#C4B5A5] hover:text-[#F1E7DB] transition-colors"
            aria-label="Close community modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* NAVIGATION TABS */}
        <div className="flex border-b border-[#262626] bg-[#121212] overflow-x-auto scrollbar-none px-6">
          <button
            onClick={() => setActiveTab("mentors")}
            className={`flex items-center gap-2 px-4 py-3.5 text-xs sm:text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
              activeTab === "mentors"
                ? "border-[#D8C2A6] text-[#F1E7DB] bg-white/[0.03]"
                : "border-transparent text-[#888888] hover:text-[#D8C2A6]"
            }`}
          >
            <Compass className="w-4 h-4 text-[#D8C2A6]" />
            Find a Mentor
          </button>
          <button
            onClick={() => setActiveTab("sessions")}
            className={`flex items-center gap-2 px-4 py-3.5 text-xs sm:text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
              activeTab === "sessions"
                ? "border-[#D8C2A6] text-[#F1E7DB] bg-white/[0.03]"
                : "border-transparent text-[#888888] hover:text-[#D8C2A6]"
            }`}
          >
            <Calendar className="w-4 h-4 text-[#A56F7C]" />
            My Sessions
            {sessions.filter(s => s.status === "pending_confirmation").length > 0 && (
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            )}
          </button>
          <button
            onClick={() => setActiveTab("circles")}
            className={`flex items-center gap-2 px-4 py-3.5 text-xs sm:text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
              activeTab === "circles"
                ? "border-[#D8C2A6] text-[#F1E7DB] bg-white/[0.03]"
                : "border-transparent text-[#888888] hover:text-[#D8C2A6]"
            }`}
          >
            <Users className="w-4 h-4 text-emerald-400" />
            Comeback Circles
          </button>
          <button
            onClick={() => setActiveTab("interview")}
            className={`flex items-center gap-2 px-4 py-3.5 text-xs sm:text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
              activeTab === "interview"
                ? "border-[#D8C2A6] text-[#F1E7DB] bg-white/[0.03]"
                : "border-transparent text-[#888888] hover:text-[#D8C2A6]"
            }`}
          >
            <BrainCircuit className="w-4 h-4 text-sky-400" />
            AI Interview Practice
          </button>
          <button
            onClick={() => setActiveTab("safety")}
            className={`flex items-center gap-2 px-4 py-3.5 text-xs sm:text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
              activeTab === "safety"
                ? "border-[#D8C2A6] text-[#F1E7DB] bg-white/[0.03]"
                : "border-transparent text-[#888888] hover:text-[#D8C2A6]"
            }`}
          >
            <Shield className="w-4 h-4 text-[#A56F7C]" />
            Community Safety & Charter
          </button>
        </div>

        {/* MODAL BODY CONTENT */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-8 space-y-6">

          {/* ========================================================================= */}
          {/* TAB 1: FIND A MENTOR */}
          {/* ========================================================================= */}
          {activeTab === "mentors" && (
            <div className="space-y-8">
              {/* RECOMMENDED MENTORS ACCORDION / HIGHLIGHT */}
              {recommendedMentors.length > 0 && (
                <div className="p-5 rounded-2xl bg-gradient-to-br from-[#1E1B18] via-[#181615] to-[#121212] border border-[#D8C2A6]/30 shadow-lg">
                  <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-300" />
                      <h3 className="text-sm font-medium tracking-wide uppercase font-mono text-[#D8C2A6]">
                        Personalized Mentor Recommendations
                      </h3>
                      <span className="text-[11px] text-[#A89886] font-mono">
                        (Matched against Priya Sharma&apos;s Data Analytics target & skills)
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {recommendedMentors.slice(0, 2).map((rm) => (
                      <div
                        key={`rec-${rm.id}`}
                        className="p-4 rounded-xl bg-black/40 border border-[#D8C2A6]/20 flex flex-col justify-between hover:border-[#D8C2A6]/50 transition-all"
                      >
                        <div className="space-y-2">
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="text-base font-semibold text-[#F1E7DB]">{rm.name}</h4>
                                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                  {rm.match_score}% Match
                                </span>
                              </div>
                              <p className="text-xs text-[#D8C2A6]">{rm.title} • {rm.company}</p>
                            </div>
                            <div className="flex items-center gap-1 text-xs text-amber-300">
                              <Star className="w-3.5 h-3.5 fill-current" />
                              <span>{rm.rating}</span>
                              <span className="text-[#777]">({rm.review_count})</span>
                            </div>
                          </div>

                          <div className="p-2.5 rounded-lg bg-[#181615] border border-[#2B2825] text-xs text-[#C4B5A5]">
                            <p className="font-mono text-[11px] text-amber-200/90 mb-1 flex items-center gap-1">
                              <Compass className="w-3 h-3 text-amber-400" />
                              Why this is a strong match:
                            </p>
                            <p className="text-[12px] leading-relaxed">{rm.match_explanation}</p>
                          </div>

                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {rm.expertise.slice(0, 4).map((exp: string, idx: number) => (
                              <span
                                key={idx}
                                className="px-2 py-0.5 rounded text-[11px] bg-[#222] text-[#D8C2A6] border border-[#333]"
                              >
                                {exp}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="pt-3 mt-3 border-t border-[#222] flex items-center justify-between">
                          <span className="text-[11px] text-[#888] font-mono">
                            {rm.availability}
                          </span>
                          <button
                            onClick={() => setSelectedMentorForBooking(rm)}
                            className="px-3.5 py-1.5 rounded-lg text-xs font-medium bg-[#D8C2A6] text-black hover:bg-[#EADBC8] transition-colors flex items-center gap-1.5 shadow"
                          >
                            <Calendar className="w-3.5 h-3.5" />
                            Request Session
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SEARCH & FILTERS */}
              <div className="p-4 rounded-xl bg-[#181818] border border-[#2A2A2A] space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-2 text-xs font-mono text-[#D8C2A6]">
                    <Filter className="w-3.5 h-3.5" />
                    <span>Filter Directory:</span>
                  </div>
                  <div className="relative flex-1 min-w-[220px]">
                    <input
                      type="text"
                      placeholder="Search mentor by name, company, or skill..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-[#111] border border-[#333] rounded-lg px-3 py-1.5 text-xs text-[#F1E7DB] placeholder-[#666] focus:outline-none focus:border-[#D8C2A6]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 text-xs">
                  <div>
                    <label className="block text-[11px] text-[#888] font-mono mb-1">Professional Field</label>
                    <select
                      value={fieldFilter}
                      onChange={(e) => setFieldFilter(e.target.value)}
                      className="w-full bg-[#111] border border-[#333] rounded-lg px-2.5 py-1.5 text-xs text-[#F1E7DB] focus:outline-none focus:border-[#D8C2A6]"
                    >
                      <option value="all">All Fields</option>
                      <option value="data_analytics">Data Analytics & BI</option>
                      <option value="software_it">Software & Cloud IT</option>
                      <option value="banking_finance">Banking & Risk Finance</option>
                      <option value="marketing">Growth Marketing</option>
                      <option value="human_resources">Human Resources</option>
                      <option value="teaching_education">Teaching & EdTech</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] text-[#888] font-mono mb-1">Language</label>
                    <select
                      value={languageFilter}
                      onChange={(e) => setLanguageFilter(e.target.value)}
                      className="w-full bg-[#111] border border-[#333] rounded-lg px-2.5 py-1.5 text-xs text-[#F1E7DB] focus:outline-none focus:border-[#D8C2A6]"
                    >
                      <option value="all">All Languages</option>
                      <option value="Hindi">Hindi</option>
                      <option value="English">English</option>
                      <option value="Tamil">Tamil</option>
                      <option value="Kannada">Kannada</option>
                      <option value="Bengali">Bengali</option>
                      <option value="Marathi">Marathi</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] text-[#888] font-mono mb-1">Session Format</label>
                    <select
                      value={formatFilter}
                      onChange={(e) => setFormatFilter(e.target.value)}
                      className="w-full bg-[#111] border border-[#333] rounded-lg px-2.5 py-1.5 text-xs text-[#F1E7DB] focus:outline-none focus:border-[#D8C2A6]"
                    >
                      <option value="all">All Formats</option>
                      <option value="1:1 Video">1:1 Video Call</option>
                      <option value="Portfolio Critique">Portfolio Critique</option>
                      <option value="Resume Deep Dive">Resume Deep Dive</option>
                      <option value="Salary Strategy">Salary Strategy</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* MENTORS GRID */}
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs text-[#888] font-mono">
                  <span>SHOWING {mentors.length} MENTORS</span>
                  <span className="text-amber-400/80">
                    *Fictional profiles labeled prominently per Section 1 requirements
                  </span>
                </div>

                {mentors.length === 0 ? (
                  <div className="p-12 text-center border border-dashed border-[#333] rounded-2xl space-y-2">
                    <Compass className="w-8 h-8 mx-auto text-[#666]" />
                    <p className="text-sm text-[#888]">No mentors found matching your specific filter criteria.</p>
                    <button
                      onClick={() => {
                        setFieldFilter("all");
                        setLanguageFilter("all");
                        setFormatFilter("all");
                        setSearchQuery("");
                      }}
                      className="text-xs text-[#D8C2A6] underline hover:text-white"
                    >
                      Reset filters
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {mentors.map((m) => (
                      <div
                        key={m.id}
                        className="rounded-2xl bg-[#171717] border border-[#2B2B2B] p-5 flex flex-col justify-between hover:border-[#D8C2A6]/40 transition-all shadow-md group"
                      >
                        <div className="space-y-3">
                          {/* Demo badge label */}
                          {m.is_demo && (
                            <div className="px-2.5 py-1 rounded bg-[#A56F7C]/15 border border-[#A56F7C]/30 text-[10px] font-mono text-[#D8C2A6] flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#A56F7C]" />
                              {m.demo_badge_label}
                            </div>
                          )}

                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="text-lg font-light text-[#F1E7DB] group-hover:text-[#D8C2A6] transition-colors">
                                {m.name}
                              </h4>
                              <p className="text-xs text-[#C4B5A5] font-medium">{m.title}</p>
                              <p className="text-[11px] text-[#7A7A7A]">{m.company} • {m.years_of_experience} yrs exp</p>
                            </div>
                            <div className="flex items-center gap-1 text-xs text-amber-300 bg-black/40 px-2 py-0.5 rounded border border-white/5">
                              <Star className="w-3.5 h-3.5 fill-current" />
                              <span>{m.rating}</span>
                            </div>
                          </div>

                          <p className="text-xs text-[#9E9E9E] leading-relaxed line-clamp-3">
                            {m.bio}
                          </p>

                          <div className="space-y-1.5 pt-1">
                            <div className="text-[11px] font-mono text-[#777]">Expertise:</div>
                            <div className="flex flex-wrap gap-1">
                              {m.expertise.slice(0, 4).map((exp: string, idx: number) => (
                                <span
                                  key={idx}
                                  className="px-2 py-0.5 rounded text-[10px] bg-[#202020] text-[#D8C2A6] border border-[#333]"
                                >
                                  {exp}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div className="text-[11px] text-[#888] font-mono space-y-0.5 pt-2 border-t border-[#242424]">
                            <div>Languages: <span className="text-[#C4B5A5]">{m.languages.join(", ")}</span></div>
                            <div>Availability: <span className="text-[#C4B5A5]">{m.availability}</span></div>
                          </div>
                        </div>

                        <div className="pt-4 mt-4 border-t border-[#262626] flex items-center justify-between">
                          <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            {m.verification_status === "verified" ? "Identity Verified" : "Review Pending"}
                          </span>
                          <button
                            onClick={() => setSelectedMentorForBooking(m)}
                            className="px-3.5 py-1.5 rounded-lg text-xs font-medium bg-[#D8C2A6] text-black hover:bg-[#EADBC8] transition-colors flex items-center gap-1.5"
                          >
                            <Calendar className="w-3.5 h-3.5" />
                            Book Session
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: MY SESSIONS */}
          {/* ========================================================================= */}
          {activeTab === "sessions" && (
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-[#1A1816] border border-amber-900/30 text-xs text-[#D8C2A6] flex items-start gap-3">
                <Clock className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-semibold text-amber-200">
                    Transparent Booking Status & Calendar Integration Rule (Section 3):
                  </p>
                  <p className="text-[#BBAEA0] leading-relaxed">
                    Bookings start as <strong>Pending Confirmation</strong> and require mentor acceptance. We never simulate confirmed calendar invites until authorized by the mentor.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-light text-[#F1E7DB]">Scheduled & Requested Sessions</h3>
                  <span className="text-xs font-mono text-[#888]">{sessions.length} RECORDED</span>
                </div>

                {sessions.length === 0 ? (
                  <div className="p-12 text-center border border-dashed border-[#333] rounded-2xl space-y-3">
                    <Calendar className="w-8 h-8 mx-auto text-[#666]" />
                    <p className="text-sm text-[#888]">No mentorship sessions requested yet.</p>
                    <button
                      onClick={() => setActiveTab("mentors")}
                      className="px-4 py-2 rounded-lg text-xs bg-[#D8C2A6] text-black hover:bg-[#EADBC8] font-medium transition-colors"
                    >
                      Browse Mentor Directory
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {sessions.map((sess) => (
                      <div
                        key={sess.id}
                        className="p-5 rounded-2xl bg-[#171717] border border-[#292929] space-y-4"
                      >
                        <div className="flex items-start justify-between flex-wrap gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-base font-semibold text-[#F1E7DB]">{sess.topic}</h4>
                              <span
                                className={`px-2 py-0.5 rounded text-[11px] font-mono uppercase tracking-wider ${
                                  sess.status === "confirmed"
                                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                                    : sess.status === "pending_confirmation"
                                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                                    : sess.status === "completed"
                                    ? "bg-sky-500/20 text-sky-300 border border-sky-500/30"
                                    : "bg-red-500/20 text-red-300 border border-red-500/30"
                                }`}
                              >
                                {sess.status.replace("_", " ")}
                              </span>
                            </div>
                            <p className="text-xs text-[#D8C2A6] mt-0.5">
                              Mentor: <span className="text-[#F1E7DB]">{sess.mentor_name}</span> ({sess.mentor_title})
                            </p>
                          </div>
                          <div className="text-right text-xs font-mono text-[#888]">
                            <div>Format: <span className="text-[#F1E7DB]">{sess.format}</span></div>
                            <div>Scheduled: <span className="text-amber-200">{sess.scheduled_at ? new Date(sess.scheduled_at).toLocaleString() : "TBD"}</span></div>
                          </div>
                        </div>

                        <p className="text-xs text-[#B0B0B0] bg-[#111] p-3 rounded-xl border border-[#222]">
                          <strong>Goals:</strong> {sess.goals}
                        </p>

                        {/* Meeting link if confirmed */}
                        {sess.status === "confirmed" && sess.meeting_link && (
                          <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-800/40 flex items-center justify-between flex-wrap gap-2">
                            <div className="flex items-center gap-2 text-xs text-emerald-300">
                              <Video className="w-4 h-4 text-emerald-400" />
                              <span>Virtual Meeting Room Authorized:</span>
                            </div>
                            <a
                              href={sess.meeting_link}
                              target="_blank"
                              rel="noreferrer"
                              className="px-3 py-1 rounded text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-medium flex items-center gap-1 transition-colors"
                            >
                              Join Call <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        )}

                        {/* Private Progress Notes */}
                        <div className="p-3.5 rounded-xl bg-[#121212] border border-[#222] space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-mono text-[#D8C2A6] flex items-center gap-1.5">
                              <Lock className="w-3 h-3 text-[#A56F7C]" />
                              Private Candidate Progress Notes (Visible only to you):
                            </span>
                            {editingNotesSessionId !== sess.id && (
                              <button
                                onClick={() => {
                                  setEditingNotesSessionId(sess.id);
                                  setPrivateNotesText(sess.candidate_private_notes || "");
                                }}
                                className="text-[11px] text-[#A56F7C] hover:underline"
                              >
                                Edit Notes
                              </button>
                            )}
                          </div>

                          {editingNotesSessionId === sess.id ? (
                            <div className="space-y-2 pt-1">
                              <textarea
                                value={privateNotesText}
                                onChange={(e) => setPrivateNotesText(e.target.value)}
                                className="w-full bg-[#1A1A1A] border border-[#444] rounded-lg p-2.5 text-xs text-[#F1E7DB] focus:outline-none focus:border-[#D8C2A6]"
                                rows={3}
                                placeholder="Jot down questions or takeaways from this mentorship session..."
                              />
                              <div className="flex gap-2 justify-end">
                                <button
                                  onClick={() => setEditingNotesSessionId(null)}
                                  className="px-3 py-1 rounded text-xs bg-[#222] text-[#888] hover:text-white"
                                >
                                  Cancel
                                </button>
                                <button
                                  onClick={() => handleSavePrivateNotes(sess.id)}
                                  className="px-3 py-1 rounded text-xs bg-[#D8C2A6] text-black font-medium hover:bg-[#EADBC8]"
                                >
                                  Save Notes
                                </button>
                              </div>
                            </div>
                          ) : (
                            <p className="text-xs text-[#999] italic">
                              {sess.candidate_private_notes || "No notes recorded yet."}
                            </p>
                          )}
                        </div>

                        {/* Post-session feedback */}
                        {sess.status === "completed" && sess.feedback_rating && (
                          <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-900/30 text-xs text-[#D8C2A6] space-y-1">
                            <div className="flex items-center gap-1 text-amber-300">
                              <span className="font-mono">Your Rating:</span>
                              {Array.from({ length: sess.feedback_rating }).map((_, i) => (
                                <Star key={i} className="w-3.5 h-3.5 fill-current" />
                              ))}
                            </div>
                            {sess.feedback_comment && (
                              <p className="text-xs text-[#BBAEA0] italic">&ldquo;{sess.feedback_comment}&rdquo;</p>
                            )}
                          </div>
                        )}

                        {/* Action buttons */}
                        <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#222] text-xs">
                          {sess.status === "pending_confirmation" && (
                            <>
                              <button
                                onClick={() => handleSessionAction(sess.id, "confirm")}
                                className="px-3 py-1.5 rounded-lg text-xs bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-600/50 transition-colors"
                              >
                                Mentor Confirm (Simulate)
                              </button>
                              <button
                                onClick={() => handleSessionAction(sess.id, "decline")}
                                className="px-3 py-1.5 rounded-lg text-xs bg-red-600/20 text-red-300 border border-red-500/30 hover:bg-red-600/40 transition-colors"
                              >
                                Decline
                              </button>
                            </>
                          )}

                          {sess.status === "confirmed" && (
                            <button
                              onClick={() => setFeedbackSessionId(sess.id)}
                              className="px-3 py-1.5 rounded-lg text-xs bg-[#D8C2A6] text-black font-medium hover:bg-[#EADBC8] transition-colors"
                            >
                              Mark Completed & Give Feedback
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 3: COMEBACK CIRCLES */}
          {/* ========================================================================= */}
          {activeTab === "circles" && (
            <div className="space-y-6">
              {/* FILTER BAR */}
              <div className="flex items-center justify-between flex-wrap gap-3 p-4 rounded-xl bg-[#181818] border border-[#2A2A2A]">
                <div className="flex items-center gap-2 text-xs font-mono text-[#D8C2A6]">
                  <Users className="w-4 h-4 text-emerald-400" />
                  <span>Small Cohort Peer Circles (Max 15 members):</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-[#777]">Industry:</span>
                  <select
                    value={circleIndustryFilter}
                    onChange={(e) => setCircleIndustryFilter(e.target.value)}
                    className="bg-[#111] border border-[#333] rounded-lg px-2.5 py-1 text-xs text-[#F1E7DB]"
                  >
                    <option value="all">All Cohorts</option>
                    <option value="data_analytics">Data Analytics</option>
                    <option value="software_it">Software & Tech</option>
                    <option value="administration">Administration & PM</option>
                  </select>
                </div>
              </div>

              {/* CIRCLES SPLIT VIEW */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* CIRCLE SELECTOR LIST */}
                <div className="space-y-3">
                  <h4 className="text-xs font-mono uppercase tracking-wider text-[#888]">Available Circles</h4>
                  {circles.map((c) => {
                    const isSelected = selectedCircle?.id === c.id;
                    const isJoined = joinedCircleIds.includes(c.id);
                    return (
                      <div
                        key={c.id}
                        onClick={() => {
                          setSelectedCircle(c);
                          loadDiscussions(c.id);
                        }}
                        className={`p-4 rounded-xl border cursor-pointer transition-all space-y-2 ${
                          isSelected
                            ? "bg-[#201D1A] border-[#D8C2A6] shadow-md"
                            : "bg-[#171717] border-[#2A2A2A] hover:border-[#444]"
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <h5 className="text-sm font-semibold text-[#F1E7DB]">{c.name}</h5>
                          {isJoined && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                              <UserCheck className="w-3 h-3" />
                              Joined
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[#999] line-clamp-2">{c.career_objective}</p>
                        <div className="flex items-center justify-between text-[11px] font-mono text-[#888] pt-1">
                          <span>{c.language}</span>
                          <span className="text-[#D8C2A6]">{c.current_member_count} / {c.max_members} Members</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* SELECTED CIRCLE DETAILS & DISCUSSIONS */}
                {selectedCircle ? (
                  <div className="lg:col-span-2 space-y-6">
                    <div className="p-6 rounded-2xl bg-[#181818] border border-[#2B2B2B] space-y-4">
                      <div className="flex items-start justify-between flex-wrap gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-xl font-light text-[#F1E7DB]">{selectedCircle.name}</h3>
                            <DataClassificationBadge type="simulated_demonstration" size="sm" />
                          </div>
                          <p className="text-xs text-[#D8C2A6] mt-0.5">{selectedCircle.career_objective}</p>
                        </div>
                        <button
                          onClick={() => handleToggleJoinCircle(selectedCircle.id)}
                          className={`px-4 py-2 rounded-xl text-xs font-medium transition-colors flex items-center gap-1.5 ${
                            joinedCircleIds.includes(selectedCircle.id)
                              ? "bg-red-950/40 text-red-300 border border-red-800/50 hover:bg-red-900/40"
                              : "bg-emerald-600 text-white hover:bg-emerald-500"
                          }`}
                        >
                          {joinedCircleIds.includes(selectedCircle.id) ? (
                            <>
                              <X className="w-3.5 h-3.5" />
                              Leave Cohort
                            </>
                          ) : (
                            <>
                              <UserPlus className="w-3.5 h-3.5" />
                              Join Peer Circle
                            </>
                          )}
                        </button>
                      </div>

                      {/* Milestones and Sessions */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                        <div className="p-3.5 rounded-xl bg-[#111] border border-[#222] space-y-2">
                          <span className="text-[11px] font-mono uppercase tracking-wider text-amber-200/90 flex items-center gap-1">
                            <Award className="w-3.5 h-3.5 text-amber-400" />
                            Group Milestones
                          </span>
                          <ul className="space-y-1.5 text-xs">
                            {selectedCircle.milestones.map((m: any) => (
                              <li key={m.id} className="flex items-center gap-2">
                                <CheckCircle2 className={`w-3.5 h-3.5 ${m.completed ? "text-emerald-400" : "text-[#444]"}`} />
                                <span className={m.completed ? "text-[#E0E0E0]" : "text-[#777]"}>{m.title}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="p-3.5 rounded-xl bg-[#111] border border-[#222] space-y-2">
                          <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-200/90 flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-emerald-400" />
                            Scheduled Cohort Sessions
                          </span>
                          <div className="space-y-1 text-xs">
                            {selectedCircle.scheduled_sessions.map((s: any, idx: number) => (
                              <div key={idx} className="p-1.5 rounded bg-[#181818] border border-white/5">
                                <p className="font-medium text-[#F1E7DB]">{s.title}</p>
                                <p className="text-[11px] text-[#A89886] font-mono">{s.time}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* DISCUSSION BOARD */}
                      <div className="pt-4 border-t border-[#262626] space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-medium text-[#F1E7DB] flex items-center gap-2">
                            <MessageSquare className="w-4 h-4 text-[#D8C2A6]" />
                            Circle Discussion Board
                          </h4>
                          <span className="text-[11px] text-[#888] font-mono">
                            Protected contact info: emails/phones are masked
                          </span>
                        </div>

                        {/* Compose Post */}
                        <form onSubmit={handlePostDiscussion} className="p-3.5 rounded-xl bg-[#121212] border border-[#262626] space-y-2.5">
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              placeholder="Discussion topic title..."
                              value={newDiscussionTitle}
                              onChange={(e) => setNewDiscussionTitle(e.target.value)}
                              className="flex-1 bg-[#1A1A1A] border border-[#333] rounded-lg px-3 py-1.5 text-xs text-[#F1E7DB] focus:outline-none focus:border-[#D8C2A6]"
                            />
                            <select
                              value={newDiscussionCategory}
                              onChange={(e) => setNewDiscussionCategory(e.target.value)}
                              className="bg-[#1A1A1A] border border-[#333] rounded-lg px-2.5 py-1.5 text-xs text-[#F1E7DB]"
                            >
                              <option value="General">General</option>
                              <option value="Learning Goal">Learning Goal</option>
                              <option value="Wins & Encouragement">Wins & Encouragement</option>
                              <option value="Resource Share">Resource Share</option>
                              <option value="Portfolio Feedback">Portfolio Feedback</option>
                            </select>
                          </div>
                          <textarea
                            placeholder="Share a question, win, or portfolio item with your peers (keep communications respectful & safe)..."
                            value={newDiscussionContent}
                            onChange={(e) => setNewDiscussionContent(e.target.value)}
                            rows={2}
                            className="w-full bg-[#1A1A1A] border border-[#333] rounded-lg p-2.5 text-xs text-[#F1E7DB] focus:outline-none focus:border-[#D8C2A6]"
                          />
                          <div className="flex justify-between items-center pt-1">
                            <span className="text-[10px] text-[#666] font-mono flex items-center gap-1">
                              <Shield className="w-3 h-3 text-emerald-400" />
                              Automated moderation & spam prevention active
                            </span>
                            <button
                              type="submit"
                              disabled={!newDiscussionTitle.trim() || !newDiscussionContent.trim()}
                              className="px-4 py-1.5 rounded-lg text-xs bg-[#D8C2A6] text-black font-medium hover:bg-[#EADBC8] transition-colors disabled:opacity-50"
                            >
                              Post Topic
                            </button>
                          </div>
                        </form>

                        {/* Discussion Posts Feed */}
                        <div className="space-y-3">
                          {circleDiscussions.map((p) => (
                            <div key={p.id} className="p-4 rounded-xl bg-[#141414] border border-[#242424] space-y-2">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-semibold text-[#F1E7DB]">{p.author_name}</span>
                                  <span className="text-[10px] px-2 py-0.5 rounded bg-[#222] text-[#888] font-mono">
                                    {p.category}
                                  </span>
                                </div>
                                <span className="text-[10px] text-[#666] font-mono">
                                  {p.created_at ? new Date(p.created_at).toLocaleDateString() : "Just now"}
                                </span>
                              </div>
                              <h5 className="text-xs font-semibold text-[#D8C2A6]">{p.title}</h5>
                              <p className="text-xs text-[#B5B5B5] leading-relaxed">{p.content}</p>
                              <div className="flex items-center gap-4 pt-1 text-[11px] text-[#777]">
                                <span className="flex items-center gap-1">
                                  <ThumbsUp className="w-3 h-3 text-[#A56F7C]" /> {p.likes_count} likes
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-8 text-center text-xs text-[#777]">Select a circle to view details.</div>
                )}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 4: AI INTERVIEW PRACTICE */}
          {/* ========================================================================= */}
          {activeTab === "interview" && (
            <div className="space-y-6">
              {/* ETHICAL DISCLAIMER BANNER (CRITICAL REQUIREMENT) */}
              <div className="p-4 rounded-2xl bg-[#1B1917] border border-[#D8C2A6]/30 text-xs space-y-1.5 shadow">
                <div className="flex items-center gap-2 text-amber-200 font-semibold font-mono text-xs">
                  <Shield className="w-4 h-4 text-emerald-400" />
                  ETHICAL AI EVALUATION GUARANTEE (Section 5 Standard):
                </div>
                <p className="text-[#C4B5A5] leading-relaxed">
                  {ethicalDisclaimer || "AI Interview Practice evaluates clarity, structure (STAR methodology), and content substance strictly from your typed responses. The platform never evaluates voice characteristics, personality, mental health, or subjective tone."}
                </p>
              </div>

              {/* TRACK SELECTOR */}
              <div className="space-y-2">
                <label className="text-xs font-mono uppercase tracking-wider text-[#888]">
                  Select Practice Track (5 Returnship Competency Areas):
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2.5">
                  {interviewTracks.map((t) => {
                    const isSelected = selectedTrackId === t.id;
                    return (
                      <button
                        key={t.id}
                        onClick={() => {
                          setSelectedTrackId(t.id);
                          if (t.sample_questions && t.sample_questions.length > 0) {
                            setSelectedQuestion(t.sample_questions[0]);
                          }
                          setEvaluationResult(null);
                        }}
                        className={`p-3 rounded-xl border text-left transition-all space-y-1.5 ${
                          isSelected
                            ? "bg-[#2A241F] border-[#D8C2A6] text-[#F1E7DB] shadow-md"
                            : "bg-[#161616] border-[#262626] text-[#888] hover:text-[#C4B5A5] hover:border-[#333]"
                        }`}
                      >
                        <p className="text-xs font-semibold leading-tight">{t.title}</p>
                        <p className="text-[10px] text-[#A89886] line-clamp-2 leading-relaxed">{t.description}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* QUESTION SELECTION & ANSWER INPUT */}
              <div className="p-6 rounded-2xl bg-[#181818] border border-[#2B2B2B] space-y-4">
                {currentTrack && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono text-[#D8C2A6]">
                        Track Focus: {currentTrack.title}
                      </span>
                      <span className="text-[11px] font-mono text-[#777]">
                        Rubric: {currentTrack.rubric_focus}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs text-[#888]">Choose Sample Interviewer Prompt:</label>
                      <select
                        value={selectedQuestion}
                        onChange={(e) => setSelectedQuestion(e.target.value)}
                        className="w-full bg-[#111] border border-[#333] rounded-lg p-2.5 text-xs text-[#F1E7DB] focus:outline-none focus:border-[#D8C2A6]"
                      >
                        {currentTrack.sample_questions.map((q: string, idx: number) => (
                          <option key={idx} value={q}>{q}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <label className="text-[#888]">Your Spoken Response (Type or dictate your answer):</label>
                    <span className="font-mono text-[11px] text-[#666]">
                      {candidateAnswer.trim().split(/\s+/).filter(Boolean).length} words (Recommended: 70 - 140 words)
                    </span>
                  </div>
                  <textarea
                    value={candidateAnswer}
                    onChange={(e) => setCandidateAnswer(e.target.value)}
                    rows={6}
                    placeholder="Type your response here using the STAR format (Situation, Task, Action, Result)..."
                    className="w-full bg-[#111] border border-[#333] rounded-xl p-3.5 text-xs text-[#F1E7DB] leading-relaxed focus:outline-none focus:border-[#D8C2A6]"
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-[11px] text-[#777] font-mono">
                    Constructive feedback on clarity, structure, & content.
                  </span>
                  <button
                    onClick={handleEvaluateInterview}
                    disabled={evaluating || candidateAnswer.trim().length < 20}
                    className="px-6 py-2 rounded-xl text-xs font-semibold bg-[#D8C2A6] text-black hover:bg-[#EADBC8] transition-colors flex items-center gap-2 shadow-md disabled:opacity-50"
                  >
                    {evaluating ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        Analyzing Structure...
                      </>
                    ) : (
                      <>
                        <BrainCircuit className="w-3.5 h-3.5" />
                        Evaluate My Answer
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* EVALUATION RESULTS CARD */}
              {evaluationResult && (
                <div className="p-6 rounded-2xl bg-gradient-to-br from-[#1C1A17] via-[#161514] to-[#121212] border border-[#D8C2A6]/40 space-y-6 shadow-xl animate-in fade-in">
                  <div className="flex items-start justify-between flex-wrap gap-2">
                    <div>
                      <span className="text-[10px] uppercase font-mono px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        Readiness Scorecard
                      </span>
                      <h4 className="text-xl font-light text-[#F1E7DB] mt-1">Answer Diagnostics</h4>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-light text-[#D8C2A6]">{evaluationResult.overall_score} / 100</div>
                      <span className="text-[11px] font-mono text-[#888]">Overall Structural Rating</span>
                    </div>
                  </div>

                  {/* 3 Metric Pills */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-[#888] font-mono">Clarity & Pacing</span>
                        <span className="text-emerald-400 font-bold">{evaluationResult.clarity_score}%</span>
                      </div>
                      <p className="text-[11px] text-[#A89886] leading-relaxed">{evaluationResult.clarity_feedback}</p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-[#888] font-mono">Structure (STAR)</span>
                        <span className="text-sky-400 font-bold">{evaluationResult.structure_score}%</span>
                      </div>
                      <p className="text-[11px] text-[#A89886] leading-relaxed">{evaluationResult.structure_feedback}</p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-[#888] font-mono">Content & Substance</span>
                        <span className="text-amber-300 font-bold">{evaluationResult.content_score}%</span>
                      </div>
                      <p className="text-[11px] text-[#A89886] leading-relaxed">{evaluationResult.content_feedback}</p>
                    </div>
                  </div>

                  {/* Refinement Recommendations */}
                  <div className="p-4 rounded-xl bg-[#141414] border border-[#2B2825] space-y-2">
                    <span className="text-xs font-mono uppercase tracking-wider text-amber-200/90 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      Actionable Refinements for Next Practice Run:
                    </span>
                    <ul className="space-y-1.5 text-xs text-[#C4B5A5]">
                      {evaluationResult.recommended_refinements.map((ref: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-amber-400 mt-0.5">•</span>
                          <span>{ref}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <p className="text-[10px] text-[#666] font-mono italic">
                    {evaluationResult.ethical_note}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 5: COMMUNITY SAFETY & CHARTER */}
          {/* ========================================================================= */}
          {activeTab === "safety" && (
            <div className="space-y-8">
              {/* CHARTER PRINCIPLES */}
              {guidelines && (
                <div className="p-6 rounded-2xl bg-[#171717] border border-[#2B2B2B] space-y-4">
                  <div className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-emerald-400" />
                    <h3 className="text-lg font-light text-[#F1E7DB]">{guidelines.title}</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    {guidelines.principles.map((pr: any, idx: number) => (
                      <div key={idx} className="p-4 rounded-xl bg-[#121212] border border-[#242424] space-y-1">
                        <h4 className="text-xs font-semibold text-[#D8C2A6]">{pr.heading}</h4>
                        <p className="text-xs text-[#999] leading-relaxed">{pr.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* REPORT USER OR CONTENT */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <form onSubmit={handleReportSubmit} className="p-6 rounded-2xl bg-[#171717] border border-[#2B2B2B] space-y-4">
                  <div className="flex items-center gap-2">
                    <Flag className="w-4 h-4 text-amber-400" />
                    <h4 className="text-sm font-semibold text-[#F1E7DB]">Report Inappropriate Conduct</h4>
                  </div>
                  <p className="text-xs text-[#888]">
                    All submissions are reviewed by platform governance officers within 24 hours.
                  </p>

                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="block text-[#888] font-mono mb-1">Target Type</label>
                      <select
                        value={reportTargetType}
                        onChange={(e) => setReportTargetType(e.target.value)}
                        className="w-full bg-[#111] border border-[#333] rounded-lg p-2 text-xs text-[#F1E7DB]"
                      >
                        <option value="mentor">Mentor Profile</option>
                        <option value="circle_post">Circle Discussion Post</option>
                        <option value="user">Platform User</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[#888] font-mono mb-1">Target ID / Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Mentor name or Post topic"
                        value={reportTargetId}
                        onChange={(e) => setReportTargetId(e.target.value)}
                        className="w-full bg-[#111] border border-[#333] rounded-lg p-2 text-xs text-[#F1E7DB]"
                      />
                    </div>

                    <div>
                      <label className="block text-[#888] font-mono mb-1">Reason</label>
                      <select
                        value={reportReason}
                        onChange={(e) => setReportReason(e.target.value)}
                        className="w-full bg-[#111] border border-[#333] rounded-lg p-2 text-xs text-[#F1E7DB]"
                      >
                        <option value="Commercial solicitation">Commercial solicitation / Third-party paid course pitch</option>
                        <option value="Unsolicited contact request">Unsolicited personal contact or phone request</option>
                        <option value="Inappropriate language">Inappropriate or discouraging language</option>
                        <option value="Confidentiality breach">Confidentiality breach</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[#888] font-mono mb-1">Incident Description</label>
                      <textarea
                        rows={3}
                        placeholder="Provide details about what happened..."
                        value={reportDescription}
                        onChange={(e) => setReportDescription(e.target.value)}
                        className="w-full bg-[#111] border border-[#333] rounded-lg p-2 text-xs text-[#F1E7DB]"
                      />
                    </div>
                  </div>

                  {reportSubmittedMsg && (
                    <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800 text-xs text-emerald-300">
                      {reportSubmittedMsg}
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full py-2 rounded-xl text-xs font-semibold bg-[#A56F7C] hover:bg-[#8D5B68] text-white transition-colors"
                  >
                    Submit Report to Governance Team
                  </button>
                </form>

                {/* USER BLOCKING */}
                <div className="p-6 rounded-2xl bg-[#171717] border border-[#2B2B2B] space-y-4">
                  <div className="flex items-center gap-2">
                    <Ban className="w-4 h-4 text-red-400" />
                    <h4 className="text-sm font-semibold text-[#F1E7DB]">Block User</h4>
                  </div>
                  <p className="text-xs text-[#888]">
                    Blocked members cannot send mentorship session requests, direct messages, or interact with you in Comeback Circles.
                  </p>

                  <form onSubmit={handleBlockUser} className="space-y-3 text-xs">
                    <div>
                      <label className="block text-[#888] font-mono mb-1">User Identifier</label>
                      <input
                        type="text"
                        placeholder="Enter user ID or handle..."
                        value={blockUserIdInput}
                        onChange={(e) => setBlockUserIdInput(e.target.value)}
                        className="w-full bg-[#111] border border-[#333] rounded-lg p-2 text-xs text-[#F1E7DB]"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full py-2 rounded-xl text-xs font-semibold bg-red-900/40 hover:bg-red-800/60 text-red-200 border border-red-700/50 transition-colors"
                    >
                      Block User
                    </button>
                  </form>

                  <div className="pt-2 border-t border-[#242424] space-y-2">
                    <span className="text-[11px] font-mono text-[#777]">Currently Blocked Users:</span>
                    {blockedUserIds.length === 0 ? (
                      <p className="text-xs text-[#555] italic">No users currently blocked.</p>
                    ) : (
                      <div className="space-y-1">
                        {blockedUserIds.map((uid, idx) => (
                          <div key={idx} className="p-2 rounded bg-[#111] border border-white/5 text-xs text-[#F1E7DB] flex justify-between items-center">
                            <span>{uid}</span>
                            <span className="text-[10px] text-red-400 font-mono">Blocked</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* MODAL FOOTER */}
        <div className="p-4 sm:p-5 border-t border-[#262626] bg-[#121212] flex items-center justify-between text-xs text-[#7A7A7A] font-mono">
          <span>GFG RETURN-TO-WORK PLATFORM • MODULE 8 MENTORSHIP & COMMUNITY</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-[#222] hover:bg-[#333] text-[#F1E7DB] transition-colors"
          >
            Close
          </button>
        </div>
      </div>

      {/* BOOKING REQUEST MODAL DRAWER */}
      {selectedMentorForBooking && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-[#181818] border border-[#D8C2A6]/40 rounded-2xl p-6 text-[#F1E7DB] space-y-4 shadow-2xl">
            <div className="flex items-start justify-between border-b border-[#282828] pb-3">
              <div>
                <span className="text-[10px] font-mono uppercase text-[#A56F7C]">Mentorship Session Request</span>
                <h3 className="text-xl font-light text-[#F1E7DB] mt-0.5">
                  Connect with {selectedMentorForBooking.name}
                </h3>
                <p className="text-xs text-[#C4B5A5]">{selectedMentorForBooking.title} • {selectedMentorForBooking.company}</p>
              </div>
              <button
                onClick={() => setSelectedMentorForBooking(null)}
                className="p-1.5 rounded-full hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleBookingSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[#999] font-mono mb-1">Session Topic</label>
                <input
                  type="text"
                  value={bookingTopic}
                  onChange={(e) => setBookingTopic(e.target.value)}
                  className="w-full bg-[#111] border border-[#333] rounded-lg p-2 text-xs text-[#F1E7DB]"
                  required
                />
              </div>

              <div>
                <label className="block text-[#999] font-mono mb-1">Specific Goals or Questions</label>
                <textarea
                  rows={3}
                  value={bookingGoals}
                  onChange={(e) => setBookingGoals(e.target.value)}
                  className="w-full bg-[#111] border border-[#333] rounded-lg p-2 text-xs text-[#F1E7DB]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#999] font-mono mb-1">Preferred Date & Time</label>
                  <input
                    type="datetime-local"
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    className="w-full bg-[#111] border border-[#333] rounded-lg p-2 text-xs text-[#F1E7DB]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[#999] font-mono mb-1">Format</label>
                  <select
                    value={bookingFormat}
                    onChange={(e) => setBookingFormat(e.target.value)}
                    className="w-full bg-[#111] border border-[#333] rounded-lg p-2 text-xs text-[#F1E7DB]"
                  >
                    <option value="1:1 Video">1:1 Video Call</option>
                    <option value="Portfolio Critique">Portfolio Critique</option>
                    <option value="Resume Deep Dive">Resume Deep Dive</option>
                    <option value="Salary Strategy">Salary Strategy</option>
                  </select>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-900/30 text-[11px] text-[#D8C2A6] space-y-1">
                <p className="font-semibold text-amber-300">Platform Booking Policy (Section 3):</p>
                <p className="text-[#BBAEA0]">
                  Your request is submitted as <strong>Pending Confirmation</strong>. Calendar invites are only sent upon mutual authorization.
                </p>
              </div>

              {bookingSuccessMsg && (
                <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800 text-xs text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  {bookingSuccessMsg}
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedMentorForBooking(null)}
                  className="px-4 py-2 rounded-xl bg-[#222] text-[#888] hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={bookingSubmitting}
                  className="px-5 py-2 rounded-xl bg-[#D8C2A6] text-black font-semibold hover:bg-[#EADBC8] transition-colors"
                >
                  {bookingSubmitting ? "Submitting..." : "Submit Mentorship Request"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* POST-SESSION FEEDBACK MODAL */}
      {feedbackSessionId && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#181818] border border-amber-500/40 rounded-2xl p-6 text-[#F1E7DB] space-y-4 shadow-2xl">
            <div className="flex items-start justify-between border-b border-[#282828] pb-3">
              <div>
                <span className="text-[10px] font-mono uppercase text-amber-400">Post-Session Reflection</span>
                <h3 className="text-lg font-light text-[#F1E7DB]">Provide Mentor Feedback</h3>
              </div>
              <button onClick={() => setFeedbackSessionId(null)} className="p-1 rounded-full hover:bg-white/10">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[#888] mb-1 font-mono">Rating (1 to 5 Stars):</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFeedbackRating(star)}
                      className={`p-1.5 rounded transition-colors ${
                        star <= feedbackRating ? "text-amber-400" : "text-[#444]"
                      }`}
                    >
                      <Star className="w-6 h-6 fill-current" />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[#888] mb-1 font-mono">Key Takeaways or Constructive Comments (Optional):</label>
                <textarea
                  rows={3}
                  value={feedbackComment}
                  onChange={(e) => setFeedbackComment(e.target.value)}
                  placeholder="What was most helpful during this session? Any suggestions for the mentor?"
                  className="w-full bg-[#111] border border-[#333] rounded-lg p-2.5 text-xs text-[#F1E7DB]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setFeedbackSessionId(null)}
                  className="px-4 py-1.5 rounded-xl bg-[#222] text-[#888] hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleSubmitFeedback(feedbackSessionId)}
                  className="px-5 py-1.5 rounded-xl bg-[#D8C2A6] text-black font-semibold hover:bg-[#EADBC8]"
                >
                  Submit Feedback
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
