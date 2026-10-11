from typing import Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field

class ApplicationCreate(BaseModel):
    cover_note: Optional[str] = None
    resume_url: Optional[str] = None

class ApplicationStatusUpdate(BaseModel):
    status: str = Field(..., pattern="^(submitted|under_review|shortlisted|interview|selected|rejected|withdrawn)$")

class ApplicationResponse(BaseModel):
    id: str
    job_id: str
    job_title: str
    job_location: str
    job_work_mode: str
    employment_type: str
    company_id: str
    company_name: str
    candidate_id: str
    candidate_name: str
    candidate_headline: Optional[str] = None
    candidate_experience: float = 0.0
    status: str
    cover_note: Optional[str] = None
    resume_url: Optional[str] = None
    compatibility_score: Optional[int] = None
    applied_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
