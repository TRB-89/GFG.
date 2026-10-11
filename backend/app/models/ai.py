from sqlalchemy import Column, String, Text, Float, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from backend.app.models.base import Base, generate_uuid, utc_now

class ResumeAnalysis(Base):
    __tablename__ = "resume_analysis"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    candidate_id = Column(String(36), ForeignKey("candidate_profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    parsed_data = Column(JSON, nullable=False)
    generated_at = Column(DateTime, default=utc_now)

class SkillGapAnalysis(Base):
    __tablename__ = "skill_gap_analysis"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    candidate_id = Column(String(36), ForeignKey("candidate_profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    target_role = Column(String(100), nullable=False)
    analysis = Column(JSON, nullable=False)
    generated_at = Column(DateTime, default=utc_now)

class LearningRoadmap(Base):
    __tablename__ = "learning_roadmaps"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    candidate_id = Column(String(36), ForeignKey("candidate_profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    target_role = Column(String(100), nullable=False)
    roadmap = Column(JSON, nullable=False)
    generated_at = Column(DateTime, default=utc_now)

class CandidateEmbedding(Base):
    __tablename__ = "candidate_embeddings"

    candidate_id = Column(String(36), ForeignKey("candidate_profiles.id", ondelete="CASCADE"), primary_key=True)
    embedding = Column(JSON, nullable=False) # Float list representation compatible with pgvector/sqlite
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

class JobEmbedding(Base):
    __tablename__ = "job_embeddings"

    job_id = Column(String(36), ForeignKey("jobs.id", ondelete="CASCADE"), primary_key=True)
    embedding = Column(JSON, nullable=False)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

class AIRecommendation(Base):
    __tablename__ = "ai_recommendations"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    candidate_id = Column(String(36), ForeignKey("candidate_profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    job_id = Column(String(36), ForeignKey("jobs.id", ondelete="CASCADE"), nullable=False, index=True)
    match_score = Column(Float, nullable=False)
    alignment = Column(String(50), default="Strong Alignment")
    breakdown = Column(JSON, nullable=False)
    explanation = Column(Text, nullable=False)
    skills_to_improve = Column(JSON, nullable=True)
    generated_at = Column(DateTime, default=utc_now)

class CareerPassport(Base):
    __tablename__ = "career_passports"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    candidate_id = Column(String(36), ForeignKey("candidate_profiles.id", ondelete="CASCADE"), nullable=False, unique=True)
    passport_data = Column(JSON, nullable=False)
    generated_at = Column(DateTime, default=utc_now)
