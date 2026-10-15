from sqlalchemy import Column, String, Text, Float, DateTime, ForeignKey, JSON, Boolean
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
    status = Column(String(50), default="active") # active, archived, completed
    generated_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

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
    visibility_settings = Column(JSON, nullable=True) # candidate privacy controls
    sharing_token = Column(String(64), nullable=True, unique=True, index=True)
    sharing_expires_at = Column(DateTime, nullable=True)
    is_public_share_enabled = Column(Boolean, default=False)
    generated_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

class PassportAccessGrant(Base):
    __tablename__ = "passport_access_grants"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    candidate_id = Column(String(36), ForeignKey("candidate_profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    employer_company_id = Column(String(36), ForeignKey("companies.id", ondelete="SET NULL"), nullable=True)
    grantee_email = Column(String(255), nullable=False)
    grantee_organization = Column(String(255), nullable=True)
    access_token = Column(String(64), nullable=False, unique=True, index=True)
    status = Column(String(50), default="active") # active, revoked, expired
    permissions = Column(JSON, nullable=False) # {"show_career_break": "dates_only", "show_portfolio": true, "show_skills": true, "show_education": true}
    expires_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=utc_now)
    revoked_at = Column(DateTime, nullable=True)

class PassportAccessLog(Base):
    __tablename__ = "passport_access_logs"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    candidate_id = Column(String(36), ForeignKey("candidate_profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    grant_id = Column(String(36), ForeignKey("passport_access_grants.id", ondelete="SET NULL"), nullable=True)
    viewer_identity = Column(String(255), nullable=False)
    viewer_role = Column(String(50), default="employer")
    ip_address = Column(String(100), nullable=True)
    user_agent = Column(String(255), nullable=True)
    sections_viewed = Column(JSON, nullable=True)
    viewed_at = Column(DateTime, default=utc_now)

class VerificationRecord(Base):
    __tablename__ = "verification_records"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    candidate_id = Column(String(36), ForeignKey("candidate_profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    item_type = Column(String(50), nullable=False) # employment, certificate, project, assessment, skill
    item_id = Column(String(36), nullable=True)
    title = Column(String(255), nullable=False)
    issuer_or_employer = Column(String(255), nullable=False)
    document_url = Column(String(255), nullable=True) # PRIVATE: NEVER EXPOSED PUBLICLY
    verification_level = Column(String(50), default="self_reported") # self_reported, pending_review, assessment_supported, verified
    verification_source = Column(String(255), nullable=True) # e.g. "HR Verification Letter", "Credential URL Verified"
    reviewer_id = Column(String(36), ForeignKey("profiles.id", ondelete="SET NULL"), nullable=True)
    reviewer_name = Column(String(100), nullable=True)
    reviewed_at = Column(DateTime, nullable=True)
    outcome = Column(String(50), default="pending") # pending, approved, rejected, revoked
    notes = Column(Text, nullable=True)
    expires_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)
