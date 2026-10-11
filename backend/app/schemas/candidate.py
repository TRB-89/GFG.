from typing import Optional, List
from datetime import date, datetime
from pydantic import BaseModel, Field, HttpUrl

class CareerBreakBase(BaseModel):
    break_type: str = Field(..., pattern="^(maternity|caregiving|health|education|relocation|sabbatical|personal|other)$")
    start_date: date
    end_date: Optional[date] = None
    currently_on_break: bool = False
    description: Optional[str] = None
    expected_return_date: Optional[date] = None

class CareerBreakCreate(CareerBreakBase):
    pass

class CareerBreakUpdate(BaseModel):
    break_type: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    currently_on_break: Optional[bool] = None
    description: Optional[str] = None
    expected_return_date: Optional[date] = None

class CareerBreakResponse(CareerBreakBase):
    id: str
    candidate_id: str
    duration_months: Optional[int] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class SkillItem(BaseModel):
    id: str
    name: str
    category: str

    class Config:
        from_attributes = True

class CandidateSkillCreate(BaseModel):
    skill_id: str
    proficiency: str = Field("intermediate", pattern="^(beginner|intermediate|advanced|expert)$")
    years_experience: Optional[float] = None
    last_used_date: Optional[date] = None

class CandidateSkillResponse(BaseModel):
    id: str
    skill_id: str
    name: str
    category: str
    proficiency: str
    years_experience: Optional[float] = None

class InterestItem(BaseModel):
    id: str
    name: str
    category: str

    class Config:
        from_attributes = True

class CandidateInterestCreate(BaseModel):
    interest_id: str
    priority: int = 1

class CandidateInterestResponse(BaseModel):
    id: str
    interest_id: str
    name: str
    category: str
    priority: int

class CandidateProfileUpdate(BaseModel):
    headline: Optional[str] = None
    highest_qualification: Optional[str] = None
    years_experience: Optional[float] = None
    previous_job_title: Optional[str] = None
    previous_company: Optional[str] = None
    preferred_work_mode: Optional[str] = Field(None, pattern="^(remote|hybrid|onsite|flexible)$")
    preferred_location: Optional[str] = None
    available_hours_per_day: Optional[int] = Field(None, ge=1, le=12)
    current_status: Optional[str] = None
    resume_url: Optional[str] = None
    linkedin_url: Optional[str] = None
    github_url: Optional[str] = None
    portfolio_url: Optional[str] = None
    return_readiness_status: Optional[str] = None
    career_break_visibility: Optional[str] = Field(None, pattern="^(private|employers|public)$")

class CandidateProfileResponse(BaseModel):
    id: str
    user_id: str
    full_name: str
    email: str
    phone: Optional[str] = None
    location: Optional[str] = None
    profile_photo_url: Optional[str] = None
    headline: Optional[str] = None
    highest_qualification: Optional[str] = None
    years_experience: float = 0.0
    previous_job_title: Optional[str] = None
    previous_company: Optional[str] = None
    preferred_work_mode: str = "remote"
    preferred_location: Optional[str] = None
    available_hours_per_day: int = 4
    current_status: str = "ready_to_return"
    resume_url: Optional[str] = None
    linkedin_url: Optional[str] = None
    github_url: Optional[str] = None
    portfolio_url: Optional[str] = None
    return_readiness_status: str = "active"
    career_break_visibility: str = "employers"
    profile_completion: int = 0
    career_breaks: List[CareerBreakResponse] = []
    skills: List[CandidateSkillResponse] = []
    interests: List[CandidateInterestResponse] = []

    class Config:
        from_attributes = True

class ProjectCreate(BaseModel):
    title: str
    description: Optional[str] = None
    technologies: Optional[str] = None
    project_url: Optional[str] = None
    github_url: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None

class ProjectResponse(ProjectCreate):
    id: str
    candidate_id: str
    created_at: datetime

    class Config:
        from_attributes = True

class CertificateCreate(BaseModel):
    certificate_name: str
    issuer: str
    issue_date: Optional[date] = None
    credential_url: Optional[str] = None
    certificate_file_url: Optional[str] = None

class CertificateResponse(CertificateCreate):
    id: str
    candidate_id: str

    class Config:
        from_attributes = True

class LearningProgressCreate(BaseModel):
    course_name: str
    provider: str
    category: Optional[str] = None
    progress_percentage: int = Field(0, ge=0, le=100)
    status: str = "in_progress"

class LearningProgressUpdate(BaseModel):
    progress_percentage: Optional[int] = Field(None, ge=0, le=100)
    status: Optional[str] = None

class LearningProgressResponse(LearningProgressCreate):
    id: str
    candidate_id: str
    started_at: datetime
    completed_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class CareerGapPassportResponse(BaseModel):
    candidate: CandidateProfileResponse
    career_continuity_summary: str
    total_break_duration_months: int
    verified_skills: List[str]
    completed_certifications: List[str]
    recent_projects: List[str]
    readiness_tier: str
