from typing import List, Dict, Any, Optional
from pydantic import BaseModel
from backend.app.schemas.job import JobResponse
from backend.app.schemas.application import ApplicationResponse

class CandidateApplicationStats(BaseModel):
    total: int = 0
    submitted: int = 0
    under_review: int = 0
    shortlisted: int = 0
    interview: int = 0
    selected: int = 0
    rejected: int = 0

class CandidateDashboardResponse(BaseModel):
    profile_completion: int
    application_stats: CandidateApplicationStats
    learning_progress: int
    skills_count: int
    recommended_jobs: List[JobResponse] = []
    recent_applications: List[ApplicationResponse] = []
    career_break_status: Optional[str] = None
    career_break_months: Optional[int] = None

class EmployerDashboardResponse(BaseModel):
    active_jobs: int
    total_applications: int
    shortlisted: int
    new_applications: int
    jobs: List[JobResponse] = []
    recent_candidates: List[ApplicationResponse] = []
