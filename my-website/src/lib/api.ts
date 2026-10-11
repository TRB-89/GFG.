// GFG Module 2 Frontend API Client

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || (typeof window !== "undefined" ? "" : "http://localhost:8000");

let authToken: string | null = null;
if (typeof window !== "undefined") {
  authToken = localStorage.getItem("gfg_auth_token");
}

export const setAuthToken = (token: string | null) => {
  authToken = token;
  if (typeof window !== "undefined") {
    if (token) {
      localStorage.setItem("gfg_auth_token", token);
    } else {
      localStorage.removeItem("gfg_auth_token");
    }
  }
};

export const getAuthToken = (): string | null => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("gfg_auth_token");
  }
  return authToken;
};

async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const json = await response.json();
  if (!response.ok || json.success === false) {
    const errorMsg = json.error?.message || `Request failed with status ${response.status}`;
    const err = new Error(errorMsg) as any;
    err.code = json.error?.code || "REQUEST_FAILED";
    err.details = json.error?.details;
    throw err;
  }

  return json.data;
}

export const api = {
  // Authentication
  login: async (email: string, password: string) => {
    const res = await apiRequest<any>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    if (res.access_token) {
      setAuthToken(res.access_token);
    }
    return res;
  },

  register: async (full_name: string, email: string, password: string, account_type: "candidate" | "employer") => {
    const res = await apiRequest<any>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ full_name, email, password, account_type }),
    });
    if (res.access_token) {
      setAuthToken(res.access_token);
    }
    return res;
  },

  logout: async () => {
    try {
      await apiRequest<any>("/api/auth/logout", { method: "POST" });
    } finally {
      setAuthToken(null);
    }
  },

  getMe: async () => {
    return apiRequest<any>("/api/auth/me");
  },

  // Candidate
  getCandidateDashboard: async () => {
    return apiRequest<any>("/api/dashboard/candidate");
  },

  getCandidateProfile: async () => {
    return apiRequest<any>("/api/candidates/me");
  },

  updateCandidateProfile: async (data: any) => {
    return apiRequest<any>("/api/candidates/me", {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  getPassport: async () => {
    return apiRequest<any>("/api/candidates/me/passport");
  },

  // Career Breaks
  getCareerBreaks: async () => {
    return apiRequest<any[]>("/api/career-break");
  },

  createCareerBreak: async (data: any) => {
    return apiRequest<any>("/api/career-break", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  // Skills
  getAllSkills: async () => {
    return apiRequest<any[]>("/api/skills");
  },

  getCandidateSkills: async () => {
    return apiRequest<any[]>("/api/candidates/me/skills");
  },

  addCandidateSkill: async (skill_id: string, proficiency: string, years_experience?: number) => {
    return apiRequest<any>("/api/candidates/me/skills", {
      method: "POST",
      body: JSON.stringify({ skill_id, proficiency, years_experience }),
    });
  },

  // Jobs
  getJobs: async (params?: Record<string, string | number>) => {
    const query = params ? "?" + new URLSearchParams(params as any).toString() : "";
    return apiRequest<{
      data: any[];
      page: number;
      limit: number;
      total: number;
      total_pages: number;
    }>(`/api/jobs${query}`);
  },

  getJobDetail: async (job_id: string) => {
    return apiRequest<any>(`/api/jobs/${job_id}`);
  },

  createJob: async (jobData: any) => {
    return apiRequest<any>("/api/jobs", {
      method: "POST",
      body: JSON.stringify(jobData),
    });
  },

  // Applications
  applyToJob: async (job_id: string, cover_note?: string, resume_url?: string) => {
    return apiRequest<any>(`/api/jobs/${job_id}/apply`, {
      method: "POST",
      body: JSON.stringify({ cover_note, resume_url }),
    });
  },

  getMyApplications: async () => {
    return apiRequest<any[]>("/api/candidates/me/applications");
  },

  // Employer
  getEmployerDashboard: async () => {
    return apiRequest<any>("/api/dashboard/employer");
  },

  getEmployerApplications: async () => {
    return apiRequest<any[]>("/api/employers/applications");
  },

  updateApplicationStatus: async (application_id: string, status: string) => {
    return apiRequest<any>(`/api/applications/${application_id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
  },

  // Uploads
  uploadResume: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const token = getAuthToken();
    const res = await fetch(`${API_BASE_URL}/api/upload/resume`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });
    const json = await res.json();
    if (!res.ok || json.success === false) {
      throw new Error(json.error?.message || "Resume upload failed");
    }
    return json.data;
  },

  // Module 3: AI, Matching Engine & Career Intelligence
  getSkillGap: async (target_role: string = "Data Analyst") => {
    return apiRequest<any>("/api/ai/skill-gap", {
      method: "POST",
      body: JSON.stringify({ target_role }),
    });
  },

  getRoadmap: async (target_role: string = "Data Analyst", available_hours_per_day?: number, skills_to_learn?: string[]) => {
    return apiRequest<any>("/api/ai/roadmap", {
      method: "POST",
      body: JSON.stringify({ target_role, available_hours_per_day, skills_to_learn }),
    });
  },

  getAIJobMatches: async () => {
    return apiRequest<any[]>("/api/ai/job-matches");
  },

  getAIJobMatchDetail: async (job_id: string) => {
    return apiRequest<any>(`/api/ai/job-matches/${job_id}`);
  },

  getReadiness: async () => {
    return apiRequest<any>("/api/ai/readiness");
  },

  getAIPassport: async () => {
    return apiRequest<any>("/api/ai/passport");
  },

  simulateSkill: async (job_id: string, skill_name: string) => {
    return apiRequest<any>("/api/ai/simulate-skill", {
      method: "POST",
      body: JSON.stringify({ job_id, skill_name }),
    });
  },

  improveResume: async (original_text: string) => {
    return apiRequest<any>("/api/ai/resume/improve", {
      method: "POST",
      body: JSON.stringify({ original_text }),
    });
  },

  getInterviewQuestions: async (job_id: string) => {
    return apiRequest<any>("/api/ai/interview/questions", {
      method: "POST",
      body: JSON.stringify({ job_id }),
    });
  },

  getInterviewFeedback: async (question: string, candidate_answer: string) => {
    return apiRequest<any>("/api/ai/interview/feedback", {
      method: "POST",
      body: JSON.stringify({ question, candidate_answer }),
    });
  },
};
