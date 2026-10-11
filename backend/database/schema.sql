-- GFG PLATFORM MODULE 2: PRODUCTION POSTGRESQL / SUPABASE SCHEMA
-- Enables UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Clean drop for re-runs if needed (careful in production)
-- DROP SCHEMA public CASCADE; CREATE SCHEMA public;

-- 1. PROFILES
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_user_id UUID UNIQUE,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(50),
    profile_photo_url TEXT,
    location VARCHAR(255),
    role VARCHAR(50) NOT NULL CHECK (role IN ('candidate', 'employer', 'admin')),
    bio TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. CANDIDATE PROFILES
CREATE TABLE IF NOT EXISTS candidate_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    headline VARCHAR(255),
    highest_qualification VARCHAR(255),
    years_experience DECIMAL(4, 1) DEFAULT 0,
    previous_job_title VARCHAR(255),
    previous_company VARCHAR(255),
    preferred_work_mode VARCHAR(50) DEFAULT 'remote' CHECK (preferred_work_mode IN ('remote', 'hybrid', 'onsite', 'flexible')),
    preferred_location VARCHAR(255),
    available_hours_per_day INTEGER DEFAULT 4 CHECK (available_hours_per_day BETWEEN 1 AND 12),
    current_status VARCHAR(50) DEFAULT 'ready_to_return',
    resume_url TEXT,
    linkedin_url TEXT,
    github_url TEXT,
    portfolio_url TEXT,
    return_readiness_status VARCHAR(50) DEFAULT 'active',
    career_break_visibility VARCHAR(50) DEFAULT 'employers' CHECK (career_break_visibility IN ('private', 'employers', 'public')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. CAREER BREAKS
CREATE TABLE IF NOT EXISTS career_breaks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID NOT NULL REFERENCES candidate_profiles(id) ON DELETE CASCADE,
    break_type VARCHAR(50) NOT NULL CHECK (break_type IN ('maternity', 'caregiving', 'health', 'education', 'relocation', 'sabbatical', 'personal', 'other')),
    start_date DATE NOT NULL,
    end_date DATE,
    currently_on_break BOOLEAN DEFAULT false,
    description TEXT, -- Always optional for user privacy
    expected_return_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT valid_break_dates CHECK (end_date IS NULL OR start_date <= end_date)
);

-- 4. SKILLS
CREATE TABLE IF NOT EXISTS skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    category VARCHAR(100) NOT NULL
);

-- 5. CANDIDATE SKILLS
CREATE TABLE IF NOT EXISTS candidate_skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID NOT NULL REFERENCES candidate_profiles(id) ON DELETE CASCADE,
    skill_id UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
    proficiency VARCHAR(50) NOT NULL CHECK (proficiency IN ('beginner', 'intermediate', 'advanced', 'expert')),
    years_experience DECIMAL(4, 1),
    last_used_date DATE,
    UNIQUE(candidate_id, skill_id)
);

-- 6. INTERESTS
CREATE TABLE IF NOT EXISTS interests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    category VARCHAR(100) NOT NULL
);

-- 7. CANDIDATE INTERESTS
CREATE TABLE IF NOT EXISTS candidate_interests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID NOT NULL REFERENCES candidate_profiles(id) ON DELETE CASCADE,
    interest_id UUID NOT NULL REFERENCES interests(id) ON DELETE CASCADE,
    priority INTEGER DEFAULT 1,
    UNIQUE(candidate_id, interest_id)
);

-- 8. COMPANIES
CREATE TABLE IF NOT EXISTS companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    logo_url TEXT,
    industry VARCHAR(150),
    description TEXT,
    website VARCHAR(255),
    location VARCHAR(255),
    company_size VARCHAR(50),
    verified BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. JOBS / RETURNSHIPS
CREATE TABLE IF NOT EXISTS jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    employment_type VARCHAR(50) NOT NULL CHECK (employment_type IN ('returnship', 'internship', 'part_time', 'full_time', 'contract', 'freelance')),
    work_mode VARCHAR(50) NOT NULL CHECK (work_mode IN ('remote', 'hybrid', 'onsite')),
    location VARCHAR(255) NOT NULL,
    minimum_experience DECIMAL(4, 1) DEFAULT 0,
    minimum_break_months INTEGER DEFAULT 0,
    maximum_break_months INTEGER,
    salary_min DECIMAL(12, 2),
    salary_max DECIMAL(12, 2),
    salary_currency VARCHAR(10) DEFAULT 'INR',
    duration_months INTEGER,
    hours_per_day INTEGER,
    permanent_conversion_possible BOOLEAN DEFAULT true,
    application_deadline DATE,
    status VARCHAR(50) NOT NULL DEFAULT 'active' CHECK (status IN ('draft', 'active', 'paused', 'closed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT valid_salary_range CHECK (salary_min IS NULL OR salary_max IS NULL OR salary_min <= salary_max)
);

-- 10. JOB SKILLS
CREATE TABLE IF NOT EXISTS job_skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    skill_id UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
    importance VARCHAR(50) DEFAULT 'preferred',
    required BOOLEAN DEFAULT false,
    UNIQUE(job_id, skill_id)
);

-- 11. APPLICATIONS (Enforces Section 33 duplicate application prevention)
CREATE TABLE IF NOT EXISTS applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID NOT NULL REFERENCES candidate_profiles(id) ON DELETE CASCADE,
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'under_review', 'shortlisted', 'interview', 'selected', 'rejected', 'withdrawn')),
    cover_note TEXT,
    resume_url TEXT,
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_candidate_job_application UNIQUE(candidate_id, job_id)
);

-- 12. CANDIDATE PROJECTS
CREATE TABLE IF NOT EXISTS candidate_projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID NOT NULL REFERENCES candidate_profiles(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    technologies VARCHAR(255),
    project_url TEXT,
    github_url TEXT,
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 13. CERTIFICATES
CREATE TABLE IF NOT EXISTS certificates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID NOT NULL REFERENCES candidate_profiles(id) ON DELETE CASCADE,
    certificate_name VARCHAR(255) NOT NULL,
    issuer VARCHAR(255) NOT NULL,
    issue_date DATE,
    credential_url TEXT,
    certificate_file_url TEXT
);

-- 14. LEARNING PROGRESS
CREATE TABLE IF NOT EXISTS learning_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID NOT NULL REFERENCES candidate_profiles(id) ON DELETE CASCADE,
    course_name VARCHAR(255) NOT NULL,
    provider VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage BETWEEN 0 AND 100),
    status VARCHAR(50) DEFAULT 'in_progress' CHECK (status IN ('not_started', 'in_progress', 'completed')),
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- 15. RECOMMENDATIONS (Prepared for Module 3 AI Expansion)
CREATE TABLE IF NOT EXISTS recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID NOT NULL REFERENCES candidate_profiles(id) ON DELETE CASCADE,
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    match_score DECIMAL(5, 2) NOT NULL,
    skill_score DECIMAL(5, 2) NOT NULL,
    experience_score DECIMAL(5, 2) NOT NULL,
    eligibility_score DECIMAL(5, 2) NOT NULL,
    availability_score DECIMAL(5, 2) NOT NULL,
    location_score DECIMAL(5, 2) NOT NULL,
    ai_score DECIMAL(5, 2),
    explanation TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(candidate_id, job_id)
);

-- INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_employment_type ON jobs(employment_type);
CREATE INDEX IF NOT EXISTS idx_jobs_work_mode ON jobs(work_mode);
CREATE INDEX IF NOT EXISTS idx_applications_candidate ON applications(candidate_id);
CREATE INDEX IF NOT EXISTS idx_applications_job ON applications(job_id);

-- SUPABASE ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidate_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE career_breaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

-- 1. Public read for active jobs, skills, interests
CREATE POLICY "Public can view active jobs" ON jobs FOR SELECT USING (status = 'active');
CREATE POLICY "Public can view skills" ON skills FOR SELECT USING (true);
CREATE POLICY "Public can view interests" ON interests FOR SELECT USING (true);
CREATE POLICY "Public can view companies" ON companies FOR SELECT USING (true);

-- 2. Candidates can view and manage their own profile & applications
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = auth_user_id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = auth_user_id);

CREATE POLICY "Candidates can view own candidate profile" ON candidate_profiles FOR SELECT 
USING (user_id IN (SELECT id FROM profiles WHERE auth_user_id = auth.uid()));
CREATE POLICY "Candidates can update own candidate profile" ON candidate_profiles FOR UPDATE 
USING (user_id IN (SELECT id FROM profiles WHERE auth_user_id = auth.uid()));

CREATE POLICY "Candidates can manage own career break" ON career_breaks FOR ALL 
USING (candidate_id IN (SELECT id FROM candidate_profiles WHERE user_id IN (SELECT id FROM profiles WHERE auth_user_id = auth.uid())));

CREATE POLICY "Candidates can manage own applications" ON applications FOR ALL 
USING (candidate_id IN (SELECT id FROM candidate_profiles WHERE user_id IN (SELECT id FROM profiles WHERE auth_user_id = auth.uid())));

-- 3. Employers can manage their company, their jobs, and view applications for their jobs
CREATE POLICY "Employers can manage own company" ON companies FOR ALL 
USING (owner_user_id IN (SELECT id FROM profiles WHERE auth_user_id = auth.uid()));

CREATE POLICY "Employers can manage own jobs" ON jobs FOR ALL 
USING (company_id IN (SELECT id FROM companies WHERE owner_user_id IN (SELECT id FROM profiles WHERE auth_user_id = auth.uid())));

CREATE POLICY "Employers can view applications to their jobs" ON applications FOR SELECT 
USING (job_id IN (SELECT id FROM jobs WHERE company_id IN (SELECT id FROM companies WHERE owner_user_id IN (SELECT id FROM profiles WHERE auth_user_id = auth.uid()))));

CREATE POLICY "Employers can update application status for their jobs" ON applications FOR UPDATE 
USING (job_id IN (SELECT id FROM jobs WHERE company_id IN (SELECT id FROM companies WHERE owner_user_id IN (SELECT id FROM profiles WHERE auth_user_id = auth.uid()))));
