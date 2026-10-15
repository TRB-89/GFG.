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
    employment_type: str = Field("returnship") # returnship, internship, part_time, full_time, contract, freelance, short_term_project
    work_mode: str = Field("remote") # remote, hybrid, onsite
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
    status: str = Field("active") # draft, active, paused, closed

    # Module 7: Smart Opportunity & Returnship Engine fields
    sector: Optional[str] = "software_it"
    opportunity_type: Optional[str] = "returnship"
    employer_verification_status: Optional[str] = "verified" # verified, unverified_external, pending
    is_verified_employer: bool = True
    data_source: Optional[str] = "verified_partner" # verified_partner, partner_api, simulated_demo
    last_verified_at: Optional[datetime] = None
    external_application_url: Optional[str] = None
    learning_objectives: Optional[str] = None
    mentorship_available: bool = True
    stipend_or_salary_type: Optional[str] = "paid" # paid, unpaid, stipend
    stipend_amount_description: Optional[str] = None
    eligibility_criteria: Optional[str] = None
    conversion_rate_percentage: Optional[int] = None

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
    sector: Optional[str] = None
    opportunity_type: Optional[str] = None
    learning_objectives: Optional[str] = None
    mentorship_available: Optional[bool] = None
    stipend_or_salary_type: Optional[str] = None
    stipend_amount_description: Optional[str] = None
    eligibility_criteria: Optional[str] = None
    conversion_rate_percentage: Optional[int] = None

class JobResponse(JobBase):
    id: str
    company_id: str
    company_name: str
    company_logo_url: Optional[str] = None
    skills: List[JobSkillItem] = []
    applications_count: int = 0
    compatibility: Optional[Dict[str, Any]] = None
    is_saved: bool = False
    is_applied: bool = False
    application_status: Optional[str] = None
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

class MatchExplanation(BaseModel):
    requirements_satisfied: List[str] = []
    important_missing_skills: List[str] = []
    working_arrangement_compatibility: str = ""
    areas_for_improvement: List[str] = []
    disclaimer: str = "Do not imply that a match score predicts hiring probability. Match scores assess qualification alignment only."

class CompatibilityScoreResponse(BaseModel):
    job_id: str
    match_score: int
    breakdown: CompatibilityBreakdown
    reasons: List[str]
    match_explanation: Optional[MatchExplanation] = None

class JobReportCreate(BaseModel):
    reason: str = Field(..., description="suspicious_listing, scam_fee_requested, expired, misleading_salary, other")
    details: Optional[str] = None
