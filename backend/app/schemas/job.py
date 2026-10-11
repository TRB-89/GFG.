from typing import Optional, List, Dict, Any
from datetime import date, datetime
from pydantic import BaseModel, Field

class JobSkillItem(BaseModel):
    skill_id: str
    name: str
    importance: str = "preferred"
    required: bool = False

class JobBase(BaseModel):
    title: str = Field(..., min_length=2, max_length=255)
    description: str
    employment_type: str = Field("returnship", pattern="^(returnship|internship|part_time|full_time|contract|freelance)$")
    work_mode: str = Field("remote", pattern="^(remote|hybrid|onsite)$")
    location: str
    minimum_experience: float = 0.0
    minimum_break_months: Optional[int] = 0
    maximum_break_months: Optional[int] = None
    salary_min: Optional[float] = None
    salary_max: Optional[float] = None
    salary_currency: str = "INR"
    duration_months: Optional[int] = None
    hours_per_day: Optional[int] = None
    permanent_conversion_possible: bool = True
    application_deadline: Optional[date] = None
    status: str = Field("active", pattern="^(draft|active|paused|closed)$")

class JobCreate(JobBase):
    required_skill_ids: List[str] = []
    preferred_skill_ids: List[str] = []

class JobUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    employment_type: Optional[str] = None
    work_mode: Optional[str] = None
    location: Optional[str] = None
    minimum_experience: Optional[float] = None
    minimum_break_months: Optional[int] = None
    maximum_break_months: Optional[int] = None
    salary_min: Optional[float] = None
    salary_max: Optional[float] = None
    duration_months: Optional[int] = None
    hours_per_day: Optional[int] = None
    permanent_conversion_possible: Optional[bool] = None
    application_deadline: Optional[date] = None
    status: Optional[str] = None

class JobResponse(JobBase):
    id: str
    company_id: str
    company_name: str
    company_logo_url: Optional[str] = None
    skills: List[JobSkillItem] = []
    applications_count: int = 0
    compatibility: Optional[Dict[str, Any]] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class CompatibilityBreakdown(BaseModel):
    skills: int
    experience: int
    eligibility: int
    availability: int
    work_mode: int
    location: int

class CompatibilityScoreResponse(BaseModel):
    job_id: str
    match_score: int
    breakdown: CompatibilityBreakdown
    reasons: List[str]
