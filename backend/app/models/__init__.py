from backend.app.models.base import Base
from backend.app.models.user import Profile
from backend.app.models.candidate import (
    CandidateProfile,
    CareerBreak,
    Skill,
    CandidateSkill,
    Interest,
    CandidateInterest,
    CandidateProject,
    Certificate,
    LearningProgress,
    Recommendation,
)
from backend.app.models.company import Company
from backend.app.models.job import Job, JobSkill
from backend.app.models.application import Application
from backend.app.models.ai import (
    ResumeAnalysis,
    SkillGapAnalysis,
    LearningRoadmap,
    CandidateEmbedding,
    JobEmbedding,
    AIRecommendation,
    CareerPassport,
)

__all__ = [
    "Base",
    "Profile",
    "CandidateProfile",
    "CareerBreak",
    "Skill",
    "CandidateSkill",
    "Interest",
    "CandidateInterest",
    "CandidateProject",
    "Certificate",
    "LearningProgress",
    "Recommendation",
    "Company",
    "Job",
    "JobSkill",
    "Application",
    "ResumeAnalysis",
    "SkillGapAnalysis",
    "LearningRoadmap",
    "CandidateEmbedding",
    "JobEmbedding",
    "AIRecommendation",
    "CareerPassport",
]
