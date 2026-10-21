import { getAuthToken } from "./api";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  (typeof window !== "undefined"
    ? ""
    : process.env.NODE_ENV === "development"
    ? "http://localhost:8000"
    : "");

async function learningFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((options.headers as Record<string, string>) || {}),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const errorMsg = data?.message || data?.detail?.message || `Request failed with status ${response.status}`;
    const err = new Error(errorMsg) as Error & { status?: number; data?: any };
    err.status = response.status;
    err.data = data;
    throw err;
  }

  return (data?.data !== undefined ? data.data : data) as T;
}

export interface CourseSummary {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  description: string;
  category: string;
  difficulty: string;
  estimated_duration_hours: number;
  thumbnail_url?: string;
  status: string;
  learning_outcomes: string[];
  prerequisites: string[];
  target_audience?: string;
  language_primary: string;
  language_available: string[];
  passing_score_percentage: number;
  attempt_limit: number;
  version: string;
  module_count: number;
  lesson_count: number;
  is_enrolled: boolean;
  enrollment_progress: number;
  enrollment_status?: string;
  certificate_earned: boolean;
  certificate_credential_id?: string;
}

export interface LessonSummaryItem {
  id: string;
  module_id: string;
  title: string;
  slug: string;
  order_index: number;
  content_type: string;
  estimated_minutes: number;
  is_mandatory: boolean;
  is_completed: boolean;
}

export interface ModuleItem {
  id: string;
  course_id: string;
  title: string;
  description?: string;
  order_index: number;
  duration_minutes: number;
  lessons: LessonSummaryItem[];
}

export interface CourseDetail extends CourseSummary {
  modules: ModuleItem[];
  assessment_id?: string;
  assignment_id?: string;
  current_lesson_id?: string;
  can_claim_certificate: boolean;
  eligibility_checklist?: {
    is_eligible: boolean;
    lessons: { total_mandatory: number; completed: number; is_satisfied: boolean };
    assessment: { required: boolean; passing_threshold: number; highest_score: number; is_satisfied: boolean };
    assignment: { required: boolean; status: string; is_satisfied: boolean };
  };
}

export interface LessonDetail {
  id: string;
  module_id: string;
  course_id: string;
  title: string;
  slug: string;
  order_index: number;
  content_type: string;
  content_markdown: string;
  video_url?: string;
  estimated_minutes: number;
  is_mandatory: boolean;
  downloadable_resources: Array<{
    title: string;
    url: string;
    file_type: string;
    size_kb: number;
    description?: string;
  }>;
  knowledge_check?: {
    question: string;
    options: string[];
    correct_index: number;
    explanation: string;
  };
  is_completed: boolean;
  next_lesson_id?: string;
  prev_lesson_id?: string;
  module_title?: string;
  course_title?: string;
}

export interface AssessmentData {
  id: string;
  course_id: string;
  title: string;
  description?: string;
  assessment_type: string;
  passing_score_percentage: number;
  max_attempts: number;
  time_limit_minutes: number;
  questions: Array<{
    id: string;
    question_text: string;
    question_type: string;
    options: Array<{ id: string; text: string }>;
    points: number;
    order_index: number;
  }>;
  attempts_taken: number;
  attempts_remaining: number;
  has_passed: boolean;
  highest_score?: number;
  recent_attempts?: Array<{
    attempt_number: number;
    score_percentage: number;
    passed: boolean;
    submitted_at?: string;
    feedback?: any[];
  }>;
}

export interface PracticalAssignmentData {
  id: string;
  course_id: string;
  title: string;
  instructions_markdown: string;
  rubric: Array<{
    criterion: string;
    weight_percentage: number;
    description: string;
  }>;
  submission_type: string;
  is_mandatory_for_certificate: boolean;
  user_submission?: {
    id: string;
    status: string;
    submission_content: string;
    external_url?: string;
    grade_score?: number;
    evaluator_feedback?: string;
    submitted_at?: string;
    evaluated_at?: string;
  };
}

export interface LearnerDashboardData {
  learner_name: string;
  total_enrolled: number;
  total_completed: number;
  total_lessons_completed: number;
  total_certificates_earned: number;
  enrolled_courses: Array<{
    enrollment_id: string;
    course_id: string;
    course_slug: string;
    course_title: string;
    category: string;
    thumbnail_url?: string;
    status: string;
    progress_percentage: number;
    enrolled_at?: string;
    last_accessed_at?: string;
    current_lesson_id?: string;
    resume_lesson_title?: string;
    certificate_earned: boolean;
    certificate_credential_id?: string;
  }>;
  certificates: Array<{
    id: string;
    credential_id: string;
    course_title: string;
    course_version: string;
    issued_at?: string;
    status: string;
    verification_url: string;
    qr_code_svg?: string;
    pdf_download_url: string;
  }>;
  recent_assessment_attempts: Array<{
    attempt_id: string;
    assessment_id: string;
    assessment_title: string;
    course_id?: string;
    attempt_number: number;
    score_percentage: number;
    passed: boolean;
    submitted_at?: string;
  }>;
}

export interface PublicVerificationResult {
  status: "valid" | "revoked" | "not_found";
  credential_id: string;
  course_title?: string;
  recipient_name?: string;
  issued_at?: string;
  issuer_name?: string;
  issuer_signatory?: string;
  learning_outcomes?: string[];
  revocation_reason?: string;
  revoked_at?: string;
  verification_url?: string;
  qr_code_svg?: string;
  compliance_statement: string;
}

export const learningApi = {
  // Course catalogue & details
  getCourses: (params?: { search?: string; category?: string; difficulty?: string }) => {
    const query = new URLSearchParams();
    if (params?.search) query.set("search", params.search);
    if (params?.category) query.set("category", params.category);
    if (params?.difficulty) query.set("difficulty", params.difficulty);
    const qs = query.toString() ? `?${query.toString()}` : "";
    return learningFetch<CourseSummary[]>(`/api/learning/courses${qs}`);
  },

  getCourseDetail: (courseIdOrSlug: string) => {
    return learningFetch<CourseDetail>(`/api/learning/courses/${courseIdOrSlug}`);
  },

  enrollInCourse: (courseId: string) => {
    return learningFetch<{
      message: string;
      enrollment_id: string;
      status: string;
      progress_percentage: number;
      current_lesson_id?: string;
    }>(`/api/learning/courses/${courseId}/enroll`, {
      method: "POST",
    });
  },

  // Learner dashboard
  getDashboard: () => {
    return learningFetch<LearnerDashboardData>("/api/learning/dashboard");
  },

  // Lessons & progress
  getLessonDetail: (courseId: string, lessonId: string) => {
    return learningFetch<LessonDetail>(`/api/learning/courses/${courseId}/lessons/${lessonId}`);
  },

  completeLesson: (lessonId: string, timeSpentSeconds: number = 60) => {
    return learningFetch<{
      lesson_id: string;
      is_completed: boolean;
      completed_at: string;
      course_progress_percentage: number;
      all_mandatory_completed: boolean;
      next_lesson_id?: string;
    }>(`/api/learning/lessons/${lessonId}/complete`, {
      method: "POST",
      body: JSON.stringify({ time_spent_seconds: timeSpentSeconds }),
    });
  },

  // Assessments
  getAssessment: (assessmentId: string) => {
    return learningFetch<AssessmentData>(`/api/learning/assessments/${assessmentId}`);
  },

  submitAssessment: (assessmentId: string, answers: Record<string, string[]>) => {
    return learningFetch<{
      attempt_id: string;
      assessment_id: string;
      attempt_number: number;
      score_percentage: number;
      passed: boolean;
      passing_score_percentage: number;
      feedback: Array<{
        question_id: string;
        question_text: string;
        user_answers: string[];
        correct_answers: string[];
        is_correct: boolean;
        explanation?: string;
      }>;
      attempts_remaining: number;
      can_retry: boolean;
      submitted_at: string;
    }>(`/api/learning/assessments/${assessmentId}/submit`, {
      method: "POST",
      body: JSON.stringify({ answers }),
    });
  },

  // Practical assignments
  getAssignment: (assignmentId: string) => {
    return learningFetch<PracticalAssignmentData>(`/api/learning/assignments/${assignmentId}`);
  },

  submitAssignment: (assignmentId: string, data: { submission_content: string; external_url?: string; file_url?: string }) => {
    return learningFetch<{
      message: string;
      submission_id: string;
      status: string;
      submitted_at: string;
    }>(`/api/learning/assignments/${assignmentId}/submit`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  // Certificates
  getCertificateEligibility: (courseId: string) => {
    return learningFetch<{
      is_eligible: boolean;
      checklist: any;
    }>(`/api/learning/courses/${courseId}/eligibility`);
  },

  claimCertificate: (courseId: string) => {
    return learningFetch<{
      id: string;
      credential_id: string;
      recipient_name: string;
      course_title: string;
      course_version: string;
      learning_outcomes: string[];
      issued_at: string;
      status: string;
      issuer_name: string;
      issuer_signatory: string;
      verification_url: string;
      qr_code_svg?: string;
      pdf_download_url: string;
      is_public_directory_consented: boolean;
    }>(`/api/learning/courses/${courseId}/claim-certificate`, {
      method: "POST",
    });
  },

  getCertificateById: (credentialId: string) => {
    return learningFetch<any>(`/api/learning/certificates/${credentialId}`);
  },

  verifyCertificatePublic: (credentialId: string) => {
    return learningFetch<PublicVerificationResult>(`/api/learning/certificates/verify/${credentialId}`);
  },

  getDownloadPdfUrl: (credentialId: string) => {
    return `${API_BASE_URL}/api/learning/certificates/${credentialId}/download-pdf`;
  },

  // AI Assistant
  askAiAssistant: (courseId: string, question: string, lessonId?: string) => {
    return learningFetch<{
      answer: string;
      recommended_resources: Array<{ title: string; url: string }>;
      suggested_followups: string[];
    }>("/api/learning/ai/chat", {
      method: "POST",
      body: JSON.stringify({ course_id: courseId, question, lesson_id: lessonId }),
    });
  },

  generateStudyPlan: (courseId: string, hoursPerWeek: number = 8, targetWeeks: number = 3) => {
    return learningFetch<{
      course_title: string;
      weekly_schedule: Array<{
        week: number;
        title: string;
        recommended_study_hours: number;
        suggested_daily_pace: string;
        goals: string[];
      }>;
      tips: string[];
    }>("/api/learning/ai/study-plan", {
      method: "POST",
      body: JSON.stringify({
        course_id: courseId,
        available_hours_per_week: hoursPerWeek,
        target_completion_weeks: targetWeeks,
      }),
    });
  },

  // Admin
  adminGetCourses: () => {
    return learningFetch<any[]>("/api/learning/admin/courses");
  },

  adminUpdateCourse: (courseId: string, data: any) => {
    return learningFetch<any>(`/api/learning/admin/courses/${courseId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  adminGetSubmissions: (statusFilter: string = "submitted") => {
    return learningFetch<any[]>(`/api/learning/admin/submissions?status_filter=${statusFilter}`);
  },

  adminReviewSubmission: (submissionId: string, data: { status: "approved" | "rejected"; grade_score: number; evaluator_feedback: string }) => {
    return learningFetch<any>(`/api/learning/admin/submissions/${submissionId}/review`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  adminRevokeCertificate: (credentialId: string, reason: string) => {
    return learningFetch<any>(`/api/learning/admin/certificates/${credentialId}/revoke`, {
      method: "POST",
      body: JSON.stringify({ revocation_reason: reason }),
    });
  },

  adminGetAnalytics: () => {
    return learningFetch<any>("/api/learning/admin/analytics");
  },

  adminGetAuditLogs: (limit: number = 50) => {
    return learningFetch<any[]>(`/api/learning/admin/audit-logs?limit=${limit}`);
  },
};
