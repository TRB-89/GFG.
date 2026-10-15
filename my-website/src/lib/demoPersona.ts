// GFG Centralized Demonstration Persona: Ananya Raman
// All tenure, break durations, and prep timelines are computed dynamically from sample dates.

import { DataClassificationMeta } from "./dataClassification";

export interface PersonaProfile {
  id: string;
  full_name: string;
  email: string;
  role: "candidate";
  headline: string;
  target_role: string;
  previous_company: string;
  previous_job_title: string;
  location: string;
  preferred_work_mode: "remote" | "hybrid" | "onsite";
  available_hours_per_day: number;
  employment_start_date: string; // ISO date string: 2018-01-01
  employment_end_date: string;   // ISO date string: 2022-06-30
  career_break_start_date: string; // ISO date string: 2022-07-01
  career_break_end_date: string;   // ISO date string: 2025-06-30
  career_prep_start_date: string;  // ISO date string: 2025-07-01
  break_type: string;
  break_reason_optional: string;
  past_experience?: string;
  break_reason?: string;
  primary_domain?: string;
  skills: { name: string; level: string; years: number }[];
  capstone_projects: { title: string; tech: string; description: string; url: string }[];
  certifications: { name: string; issuer: string; date: string }[];
  privacy: {
    profile_visibility: "private" | "employers" | "public";
    passport_sharing_consent: boolean;
    career_break_optional_shared: boolean;
  };
  meta: DataClassificationMeta;
}

export function calculateMonthsBetween(startDateStr: string, endDateStr: string): number {
  const start = new Date(startDateStr);
  const end = new Date(endDateStr);
  const years = end.getFullYear() - start.getFullYear();
  const months = end.getMonth() - start.getMonth() + 1; // inclusive of end month
  return Math.max(1, years * 12 + months);
}

export function formatDurationFromMonths(totalMonths: number): string {
  const years = Math.floor(totalMonths / 12);
  const remainingMonths = totalMonths % 12;

  if (years > 0 && remainingMonths > 0) {
    return `${years} ${years === 1 ? "year" : "years"}, ${remainingMonths} ${remainingMonths === 1 ? "month" : "months"}`;
  } else if (years > 0) {
    return `${years} ${years === 1 ? "year" : "years"}`;
  }
  return `${totalMonths} ${totalMonths === 1 ? "month" : "months"}`;
}

export const DEMO_PERSONA: PersonaProfile = {
  id: "cand-demo-ananya",
  full_name: "Ananya Raman",
  email: "ananya.raman@example.com",
  role: "candidate",
  headline: "Experienced Data Analyst & Systems Specialist | Returning Professional",
  target_role: "Data Analyst",
  previous_company: "Infosys Limited",
  previous_job_title: "Software Engineer / Analytics Lead",
  location: "Bengaluru, IN (Open to Remote & Hybrid)",
  preferred_work_mode: "hybrid",
  available_hours_per_day: 4,

  // Factual sample dates specified by prompt
  employment_start_date: "2018-01-01",
  employment_end_date: "2022-06-30",
  career_break_start_date: "2022-07-01",
  career_break_end_date: "2025-06-30",
  career_prep_start_date: "2025-07-01",

  break_type: "Maternity & Family Leadership",
  break_reason_optional:
    "Intentional sabbatical for maternity and full-time family caregiving, coupled with self-paced data analytics and business intelligence upskilling.",
  past_experience: "Software Engineer / Analytics Lead",
  break_reason: "Family Leadership & Caregiving",
  primary_domain: "Data Analytics & Engineering",

  skills: [
    { name: "SQL", level: "Advanced", years: 4.5 },
    { name: "Python", level: "Intermediate", years: 2.0 },
    { name: "Power BI", level: "Intermediate", years: 1.5 },
    { name: "Pandas", level: "Intermediate", years: 2.0 },
    { name: "Java", level: "Advanced", years: 4.0 },
    { name: "Data Modeling", level: "Advanced", years: 4.0 },
  ],

  capstone_projects: [
    {
      title: "Customer Churn Predictive Pipeline",
      tech: "Python, Pandas & Automated Telemetry",
      description: "End-to-end data pipeline evaluating retention drivers across 50,000 synthetic records.",
      url: "https://github.com/ananya-raman/customer-churn-analytics",
    },
    {
      title: "Enterprise Executive BI Dashboard",
      tech: "Power BI, Star Schema & DAX Calculations",
      description: "Executive decision suite analyzing revenue velocity, cohort retention, and department KPIs.",
      url: "https://github.com/ananya-raman/enterprise-bi-suite",
    },
  ],

  certifications: [
    {
      name: "Google Advanced Data Analytics Professional Certificate",
      issuer: "Coursera / Google",
      date: "2025-09-15",
    },
    {
      name: "Microsoft Power BI Data Analyst Associate (PL-300)",
      issuer: "Microsoft",
      date: "2025-11-20",
    },
  ],

  privacy: {
    profile_visibility: "private", // Private by default per Task 7
    passport_sharing_consent: false, // Requires explicit user consent before sharing
    career_break_optional_shared: true,
  },

  meta: {
    source_type: "simulated_demonstration",
    is_demo: true,
    verification_status: "Illustrative Primary Persona (Demonstration Model)",
    created_at: "2026-01-15T09:00:00Z",
    last_verified_at: "2026-10-14",
    limitations: "Synthesized persona data for platform demonstration; not a real candidate record.",
  },
};

// Derived dynamic metrics
export const DEMO_METRICS = {
  preBreakMonths: calculateMonthsBetween(DEMO_PERSONA.employment_start_date, DEMO_PERSONA.employment_end_date),
  preBreakFormatted: formatDurationFromMonths(
    calculateMonthsBetween(DEMO_PERSONA.employment_start_date, DEMO_PERSONA.employment_end_date)
  ), // e.g. "4 years, 6 months"
  breakDurationMonths: calculateMonthsBetween(DEMO_PERSONA.career_break_start_date, DEMO_PERSONA.career_break_end_date),
  breakDurationFormatted: formatDurationFromMonths(
    calculateMonthsBetween(DEMO_PERSONA.career_break_start_date, DEMO_PERSONA.career_break_end_date)
  ), // e.g. "3 years"
  prepMonths: calculateMonthsBetween(DEMO_PERSONA.career_prep_start_date, new Date().toISOString().slice(0, 10)),
  prepFormatted: formatDurationFromMonths(
    calculateMonthsBetween(DEMO_PERSONA.career_prep_start_date, new Date().toISOString().slice(0, 10))
  ),
};

// Fictional Advisory Mentor Persona
export const DEMO_MENTOR = {
  id: "mentor-demo-meera",
  name: "Dr. Meera Iyer",
  title: "Executive Technical Director & Alumna Mentor",
  background: "Ex-Google, Microsoft Leadership Fellow",
  alumna: "Ex-Google, Microsoft Leadership Fellow",
  stats: "34 Pilot Sessions Completed [ILLUSTRATIVE]",
  experience_years: 14,
  focus_areas: ["Career Gap Framing", "Executive Presence", "Tenure Negotiation", "Data Leadership"],
  bio: "Guiding returning women professionals in translating prior engineering mastery into high-impact leadership with zero career-depreciation penalty.",
  sessions_completed: 34,
  meta: {
    source_type: "simulated_demonstration" as const,
    is_demo: true,
    verification_status: "Illustrative Advisory Mentor Profile",
    created_at: "2026-02-01T10:00:00Z",
    last_verified_at: "2026-10-14",
  },
};

// Fictional Employer Partner Persona
export const DEMO_EMPLOYER = {
  id: "emp-demo-nova",
  name: "Nova Technologies",
  industry: "Global Cloud Infrastructure & Data Systems",
  location: "Bengaluru, IN (Remote-First)",
  size: "500–1,000 Employees",
  returnship_program: "4-Month Paid Returnship Cohort with 1-on-1 Mentorship",
  break_friendly_score: 96,
  breakFriendlyScore: 96,
  break_friendly_rubric: {
    core_hours_flexibility: "25/25 pts",
    structured_return_cohort: "25/25 pts",
    tenure_preservation_policy: "25/25 pts",
    stipend_and_mentor_support: "21/25 pts",
  },
  meta: {
    source_type: "simulated_demonstration" as const,
    is_demo: true,
    verification_status: "Illustrative Partner Model (Simulation Cohort)",
    created_at: "2026-01-10T12:00:00Z",
    last_verified_at: "2026-10-14",
    limitations: "Demonstration profile for returnship matching preview; not an endorsement by an external company.",
  },
};
