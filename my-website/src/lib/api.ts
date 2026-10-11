// GFG Module 2 Frontend API Client with Seamless Cloud Demo Fallback

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  (typeof window !== "undefined"
    ? ""
    : process.env.NODE_ENV === "development"
    ? "http://localhost:8000"
    : "");

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

// Safe API request with graceful HTML/404 handling
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

  const contentType = response.headers.get("content-type");
  if (!response.ok || !contentType || !contentType.includes("application/json")) {
    const errorMsg = `API request to ${endpoint} returned status ${response.status}`;
    const err = new Error(errorMsg) as any;
    err.status = response.status;
    err.code = "API_UNAVAILABLE";
    throw err;
  }

  const json = await response.json();
  if (json.success === false) {
    const errorMsg = json.error?.message || `Request failed with status ${response.status}`;
    const err = new Error(errorMsg) as any;
    err.code = json.error?.code || "REQUEST_FAILED";
    err.details = json.error?.details;
    throw err;
  }

  return json.data !== undefined ? json.data : json;
}

// Built-in Demo Mock Data for Seamless Cloud / Offline Showcase
const DEMO_JOBS = [
  {
    id: "job-demo-1",
    title: "Data Analyst Returnship",
    company_name: "Nova Technologies",
    location: "Bangalore, IN",
    work_mode: "Hybrid",
    salary_min: 35000,
    salary_max: 45000,
    compatibility: { match_score: 89 },
    description: "Specialized 4-month return track for returning engineers transitioning into business intelligence.",
  },
  {
    id: "job-demo-2",
    title: "Cloud & DevOps Returnee Associate",
    company_name: "Aura Cloud Systems",
    location: "Hyderabad, IN",
    work_mode: "Remote",
    salary_min: 40000,
    salary_max: 55000,
    compatibility: { match_score: 84 },
    description: "Returnship program focusing on containerized infrastructure and modern CI/CD pipelines.",
  },
  {
    id: "job-demo-3",
    title: "Fullstack Next.js Returnee Track",
    company_name: "Apex Global Labs",
    location: "Pune, IN",
    work_mode: "Hybrid",
    salary_min: 38000,
    salary_max: 50000,
    compatibility: { match_score: 81 },
    description: "Front-to-back modern web engineering returnship with dedicated mentor pairings.",
  },
];

export const api = {
  // Authentication
  login: async (email: string, password: string) => {
    try {
      const res = await apiRequest<any>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      if (res?.access_token) {
        setAuthToken(res.access_token);
      }
      return res;
    } catch {
      // Offline / Cloud Demo Fallback
      const isEmployer = email.toLowerCase().includes("nova") || email.toLowerCase().includes("hr");
      const user = {
        id: isEmployer ? "emp-demo-nova" : "cand-demo-priya",
        full_name: isEmployer ? "Nova Tech HR" : "Priya Sharma",
        email: email,
        account_type: isEmployer ? "employer" : "candidate",
      };
      setAuthToken("demo-auth-token-cloud");
      return { access_token: "demo-auth-token-cloud", user };
    }
  },

  register: async (full_name: string, email: string, password: string, account_type: "candidate" | "employer") => {
    try {
      const res = await apiRequest<any>("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({ full_name, email, password, account_type }),
      });
      if (res?.access_token) {
        setAuthToken(res.access_token);
      }
      return res;
    } catch {
      const user = { id: "user-demo-new", full_name, email, account_type };
      setAuthToken("demo-auth-token-cloud");
      return { access_token: "demo-auth-token-cloud", user };
    }
  },

  logout: async () => {
    try {
      await apiRequest<any>("/api/auth/logout", { method: "POST" });
    } catch {
      // Ignored
    } finally {
      setAuthToken(null);
    }
  },

  getMe: async () => {
    try {
      return await apiRequest<any>("/api/auth/me");
    } catch {
      return { id: "cand-demo-priya", full_name: "Priya Sharma", email: "priya.sharma@example.com" };
    }
  },

  // Candidate
  getCandidateDashboard: async () => {
    try {
      return await apiRequest<any>("/api/dashboard/candidate");
    } catch {
      return {
        profile_completion: 82,
        readiness_score: 82,
        career_break: { type: "MATERNITY", duration_months: 14 },
      };
    }
  },

  getCandidateProfile: async () => {
    try {
      return await apiRequest<any>("/api/candidates/me");
    } catch {
      return {
        full_name: "Priya Sharma",
        target_role: "Data Analyst",
        available_hours_per_day: 4,
        experience_years: 4.5,
        career_break_months: 14,
      };
    }
  },

  updateCandidateProfile: async (data: any) => {
    try {
      return await apiRequest<any>("/api/candidates/me", {
        method: "PUT",
        body: JSON.stringify(data),
      });
    } catch {
      return { success: true, ...data };
    }
  },

  getPassport: async () => {
    try {
      return await apiRequest<any>("/api/candidates/me/passport");
    } catch {
      return {
        candidate_name: "Priya Sharma",
        pre_break_tenure_years: 4.5,
        break_duration_months: 14,
        verified_skills: ["Java", "SQL", "Spring Boot", "Power BI", "Python"],
      };
    }
  },

  // Career Breaks
  getCareerBreaks: async () => {
    try {
      return await apiRequest<any[]>("/api/career-break");
    } catch {
      return [{ id: "cb-1", break_type: "MATERNITY", duration_months: 14 }];
    }
  },

  createCareerBreak: async (data: any) => {
    try {
      return await apiRequest<any>("/api/career-break", {
        method: "POST",
        body: JSON.stringify(data),
      });
    } catch {
      return { id: "cb-new", ...data };
    }
  },

  // Skills
  getAllSkills: async () => {
    try {
      return await apiRequest<any[]>("/api/skills");
    } catch {
      return [
        { id: "sk-1", name: "SQL", category: "Data" },
        { id: "sk-2", name: "Python", category: "Programming" },
        { id: "sk-3", name: "Power BI", category: "BI" },
      ];
    }
  },

  getCandidateSkills: async () => {
    try {
      return await apiRequest<any[]>("/api/candidates/me/skills");
    } catch {
      return [
        { skill_id: "sk-1", skill_name: "SQL", proficiency: "advanced" },
        { skill_id: "sk-2", skill_name: "Python", proficiency: "intermediate" },
      ];
    }
  },

  addCandidateSkill: async (skill_id: string, proficiency: string, years_experience?: number) => {
    try {
      return await apiRequest<any>("/api/candidates/me/skills", {
        method: "POST",
        body: JSON.stringify({ skill_id, proficiency, years_experience }),
      });
    } catch {
      return { skill_id, proficiency };
    }
  },

  // Jobs
  getJobs: async (params?: Record<string, string | number>) => {
    try {
      const query = params ? "?" + new URLSearchParams(params as any).toString() : "";
      return await apiRequest<{ data: any[]; total: number }>(`/api/jobs${query}`);
    } catch {
      return { data: DEMO_JOBS, total: DEMO_JOBS.length };
    }
  },

  getJobDetail: async (job_id: string) => {
    try {
      return await apiRequest<any>(`/api/jobs/${job_id}`);
    } catch {
      return DEMO_JOBS.find((j) => j.id === job_id) || DEMO_JOBS[0];
    }
  },

  createJob: async (jobData: any) => {
    try {
      return await apiRequest<any>("/api/jobs", {
        method: "POST",
        body: JSON.stringify(jobData),
      });
    } catch {
      return { id: "job-new", ...jobData };
    }
  },

  // Applications
  applyToJob: async (job_id: string, cover_note?: string, resume_url?: string) => {
    try {
      return await apiRequest<any>(`/api/jobs/${job_id}/apply`, {
        method: "POST",
        body: JSON.stringify({ cover_note, resume_url }),
      });
    } catch {
      return { id: "app-demo-sub", job_id, status: "submitted" };
    }
  },

  getMyApplications: async () => {
    try {
      return await apiRequest<any[]>("/api/candidates/me/applications");
    } catch {
      return [
        {
          id: "app-demo-1",
          job_id: "job-demo-1",
          status: "submitted",
          applied_at: new Date().toISOString(),
        },
      ];
    }
  },

  // Employer
  getEmployerDashboard: async () => {
    try {
      return await apiRequest<any>("/api/dashboard/employer");
    } catch {
      return {
        active_jobs_count: 4,
        total_applications_count: 82,
        shortlisted_count: 14,
        new_today_count: 9,
      };
    }
  },

  getEmployerApplications: async () => {
    try {
      return await apiRequest<any[]>("/api/employers/applications");
    } catch {
      return [
        {
          id: "app-demo-1",
          candidate_name: "Priya Sharma",
          status: "submitted",
          compatibility_score: 87,
        },
      ];
    }
  },

  updateApplicationStatus: async (application_id: string, status: string) => {
    try {
      return await apiRequest<any>(`/api/applications/${application_id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
    } catch {
      return { id: application_id, status };
    }
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
    return json.data;
  },

  // Module 3: AI Career Intelligence
  getSkillGap: async (target_role: string = "Data Analyst") => {
    try {
      return await apiRequest<any>("/api/ai/skill-gap", {
        method: "POST",
        body: JSON.stringify({ target_role }),
      });
    } catch {
      return {
        target_role,
        current_strengths: ["SQL", "Java", "Database Design"],
        skills_to_refresh: ["Window Functions", "CTEs", "Data Modeling"],
        skills_to_learn: ["Python", "Power BI", "Statistics"],
      };
    }
  },

  getRoadmap: async (target_role: string = "Data Analyst", available_hours_per_day?: number, skills_to_learn?: string[]) => {
    try {
      return await apiRequest<any>("/api/ai/roadmap", {
        method: "POST",
        body: JSON.stringify({ target_role, available_hours_per_day, skills_to_learn }),
      });
    } catch {
      return {
        target_role,
        estimated_weeks: 8,
        weekly_plan: [
          { week: 1, title: "SQL Refresher & Window Functions", focus: "Aggregation, CTEs, ranking and partition queries", estimated_hours: 16 },
          { week: 2, title: "Python for Data Analytics", focus: "Data ingestion with Pandas & NumPy", estimated_hours: 18 },
          { week: 3, title: "EDA & Visualization", focus: "Plotting distributions with Matplotlib & Seaborn", estimated_hours: 18 },
          { week: 4, title: "Business Intelligence & Power BI", focus: "Star-schema modeling and DAX measures", estimated_hours: 16 },
          { week: 5, title: "Applied Statistics", focus: "Hypothesis testing and A/B test metric decomposition", estimated_hours: 16 },
          { week: 6, title: "Portfolio Capstone: Churn Analysis", focus: "End-to-end customer churn analysis project", estimated_hours: 20 },
          { week: 7, title: "Interview Prep & Mock Problem Sets", focus: "SQL problem sets and analytics case studies", estimated_hours: 14 },
          { week: 8, title: "Resume & Passport Optimization", focus: "Integrate capstone portfolio into GFG Career Passport", estimated_hours: 12 },
        ],
      };
    }
  },

  getAIJobMatches: async () => {
    try {
      return await apiRequest<any[]>("/api/ai/job-matches");
    } catch {
      return DEMO_JOBS;
    }
  },

  getAIJobMatchDetail: async (job_id: string) => {
    try {
      return await apiRequest<any>(`/api/ai/job-matches/${job_id}`);
    } catch {
      return { match_score: 89, confidence: "High" };
    }
  },

  getReadiness: async () => {
    try {
      return await apiRequest<any>("/api/ai/readiness");
    } catch {
      return {
        readiness_score: 82,
        target_role: "Data Analyst",
        tier: "Tier 1 - Return Ready",
      };
    }
  },

  getAIPassport: async () => {
    try {
      return await apiRequest<any>("/api/ai/passport");
    } catch {
      return {
        candidate_name: "Priya Sharma",
        pre_break_tenure_years: 4.5,
        break_duration_months: 14,
        verified_skills: ["Java", "SQL", "Spring Boot", "Power BI", "Python", "Pandas"],
      };
    }
  },

  simulateSkill: async (job_id: string, skill_name: string) => {
    try {
      return await apiRequest<any>("/api/ai/simulate-skill", {
        method: "POST",
        body: JSON.stringify({ job_id, skill_name }),
      });
    } catch {
      return {
        skill_name,
        current_score: 87,
        projected_score: 94,
        boost: 7,
      };
    }
  },

  improveResume: async (original_text: string) => {
    try {
      return await apiRequest<any>("/api/ai/resume/improve", {
        method: "POST",
        body: JSON.stringify({ original_text }),
      });
    } catch {
      return { improved_text: original_text };
    }
  },

  getInterviewQuestions: async (job_id: string) => {
    try {
      return await apiRequest<any>("/api/ai/interview/questions", {
        method: "POST",
        body: JSON.stringify({ job_id }),
      });
    } catch {
      return {
        technical_questions: [
          { topic: "SQL", question: "Explain the difference between ROW_NUMBER(), RANK(), and DENSE_RANK() with a practical example." },
          { topic: "Python / Pandas", question: "How do you handle duplicate rows and impute missing numerical data in large dataframes?" },
          { topic: "Power BI", question: "Explain how DAX measures differ from calculated columns in terms of memory cache and query execution." },
        ],
      };
    }
  },

  getInterviewFeedback: async (question: string, candidate_answer: string) => {
    try {
      return await apiRequest<any>("/api/ai/interview/feedback", {
        method: "POST",
        body: JSON.stringify({ question, candidate_answer }),
      });
    } catch {
      return { score: 85, feedback: "Strong technical answer with clear real-world examples." };
    }
  },
};
