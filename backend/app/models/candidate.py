from sqlalchemy import Column, String, Text, Integer, Float, Boolean, Date, DateTime, ForeignKey, UniqueConstraint, JSON
from sqlalchemy.orm import relationship
from backend.app.models.base import Base, generate_uuid, utc_now

class CandidateProfile(Base):
    __tablename__ = "candidate_profiles"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("profiles.id", ondelete="CASCADE"), nullable=False, unique=True)
    headline = Column(String(255), nullable=True)
    highest_qualification = Column(String(255), nullable=True)
    years_experience = Column(Float, default=0.0)
    previous_job_title = Column(String(255), nullable=True)
    previous_company = Column(String(255), nullable=True)
    preferred_work_mode = Column(String(50), default="remote") # remote, hybrid, onsite, flexible
    preferred_location = Column(String(255), nullable=True)
    available_hours_per_day = Column(Integer, default=4)
    current_status = Column(String(50), default="ready_to_return")
    industry = Column(String(255), nullable=True)
    career_goals = Column(String(255), nullable=True)
    languages = Column(String(255), nullable=True)
    salary_expectation = Column(String(100), nullable=True)
    onboarding_completed = Column(Boolean, default=False)
    resume_url = Column(Text, nullable=True)
    linkedin_url = Column(Text, nullable=True)
    github_url = Column(Text, nullable=True)
    portfolio_url = Column(Text, nullable=True)
    return_readiness_status = Column(String(50), default="active")
    career_break_visibility = Column(String(50), default="private") # private, employers, public
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    # Relationships
    user = relationship("Profile", back_populates="candidate_profile")
    career_breaks = relationship("CareerBreak", back_populates="candidate", cascade="all, delete-orphan")
    skills = relationship("CandidateSkill", back_populates="candidate", cascade="all, delete-orphan")
    interests = relationship("CandidateInterest", back_populates="candidate", cascade="all, delete-orphan")
    projects = relationship("CandidateProject", back_populates="candidate", cascade="all, delete-orphan")
    certificates = relationship("Certificate", back_populates="candidate", cascade="all, delete-orphan")
    learning_progress = relationship("LearningProgress", back_populates="candidate", cascade="all, delete-orphan")
    applications = relationship("Application", back_populates="candidate", cascade="all, delete-orphan")
    recommendations = relationship("Recommendation", back_populates="candidate", cascade="all, delete-orphan")
    digital_twin_events = relationship("DigitalTwinEvent", back_populates="candidate", cascade="all, delete-orphan")
    saved_simulations = relationship("SavedSimulation", back_populates="candidate", cascade="all, delete-orphan")

class CareerBreak(Base):
    __tablename__ = "career_breaks"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    candidate_id = Column(String(36), ForeignKey("candidate_profiles.id", ondelete="CASCADE"), nullable=False)
    break_type = Column(String(50), nullable=False) # maternity, caregiving, health, education, relocation, sabbatical, personal, other
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=True)
    currently_on_break = Column(Boolean, default=False)
    description = Column(Text, nullable=True) # Always optional for sensitive health/medical privacy
    expected_return_date = Column(Date, nullable=True)
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    candidate = relationship("CandidateProfile", back_populates="career_breaks")

class Skill(Base):
    __tablename__ = "skills"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(100), unique=True, nullable=False, index=True)
    category = Column(String(100), nullable=False)

    candidate_skills = relationship("CandidateSkill", back_populates="skill")
    job_skills = relationship("JobSkill", back_populates="skill")

class CandidateSkill(Base):
    __tablename__ = "candidate_skills"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    candidate_id = Column(String(36), ForeignKey("candidate_profiles.id", ondelete="CASCADE"), nullable=False)
    skill_id = Column(String(36), ForeignKey("skills.id", ondelete="CASCADE"), nullable=False)
    proficiency = Column(String(50), default="intermediate") # beginner, intermediate, advanced, expert
    years_experience = Column(Float, nullable=True)
    last_used_date = Column(Date, nullable=True)
    provenance = Column(String(50), default="self_reported") # self_reported, ai_inferred, assessment_supported, independently_verified
    confidence_score = Column(Float, default=1.0)
    source_detail = Column(String(100), default="User Profile")

    __table_args__ = (UniqueConstraint("candidate_id", "skill_id", name="uq_candidate_skill"),)

    candidate = relationship("CandidateProfile", back_populates="skills")
    skill = relationship("Skill", back_populates="candidate_skills")

class Interest(Base):
    __tablename__ = "interests"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(100), unique=True, nullable=False, index=True)
    category = Column(String(100), nullable=False)

    candidate_interests = relationship("CandidateInterest", back_populates="interest")

class CandidateInterest(Base):
    __tablename__ = "candidate_interests"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    candidate_id = Column(String(36), ForeignKey("candidate_profiles.id", ondelete="CASCADE"), nullable=False)
    interest_id = Column(String(36), ForeignKey("interests.id", ondelete="CASCADE"), nullable=False)
    priority = Column(Integer, default=1)

    __table_args__ = (UniqueConstraint("candidate_id", "interest_id", name="uq_candidate_interest"),)

    candidate = relationship("CandidateProfile", back_populates="interests")
    interest = relationship("Interest", back_populates="candidate_interests")

class CandidateProject(Base):
    __tablename__ = "candidate_projects"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    candidate_id = Column(String(36), ForeignKey("candidate_profiles.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    technologies = Column(String(255), nullable=True)
    project_url = Column(Text, nullable=True)
    github_url = Column(Text, nullable=True)
    start_date = Column(Date, nullable=True)
    end_date = Column(Date, nullable=True)
    created_at = Column(DateTime, default=utc_now)

    candidate = relationship("CandidateProfile", back_populates="projects")

class Certificate(Base):
    __tablename__ = "certificates"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    candidate_id = Column(String(36), ForeignKey("candidate_profiles.id", ondelete="CASCADE"), nullable=False)
    certificate_name = Column(String(255), nullable=False)
    issuer = Column(String(255), nullable=False)
    issue_date = Column(Date, nullable=True)
    credential_url = Column(Text, nullable=True)
    certificate_file_url = Column(Text, nullable=True)

    candidate = relationship("CandidateProfile", back_populates="certificates")

class LearningProgress(Base):
    __tablename__ = "learning_progress"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    candidate_id = Column(String(36), ForeignKey("candidate_profiles.id", ondelete="CASCADE"), nullable=False)
    course_name = Column(String(255), nullable=False)
    provider = Column(String(255), nullable=False)
    category = Column(String(100), nullable=True)
    progress_percentage = Column(Integer, default=0)
    status = Column(String(50), default="in_progress") # not_started, in_progress, completed
    started_at = Column(DateTime, default=utc_now)
    completed_at = Column(DateTime, nullable=True)

    candidate = relationship("CandidateProfile", back_populates="learning_progress")

class Recommendation(Base):
    __tablename__ = "recommendations"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    candidate_id = Column(String(36), ForeignKey("candidate_profiles.id", ondelete="CASCADE"), nullable=False)
    job_id = Column(String(36), ForeignKey("jobs.id", ondelete="CASCADE"), nullable=False)
    match_score = Column(Float, nullable=False)
    skill_score = Column(Float, nullable=False)
    experience_score = Column(Float, nullable=False)
    eligibility_score = Column(Float, nullable=False)
    availability_score = Column(Float, nullable=False)
    location_score = Column(Float, nullable=False)
    ai_score = Column(Float, nullable=True)
    explanation = Column(Text, nullable=True)
    created_at = Column(DateTime, default=utc_now)

    __table_args__ = (UniqueConstraint("candidate_id", "job_id", name="uq_candidate_job_recommendation"),)

    candidate = relationship("CandidateProfile", back_populates="recommendations")
    job = relationship("Job", back_populates="recommendations")

class OnboardingDraft(Base):
    __tablename__ = "onboarding_drafts"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("profiles.id", ondelete="CASCADE"), nullable=False, unique=True)
    current_step = Column(Integer, default=1)
    draft_data = Column(Text, nullable=False) # JSON encoded data
    is_completed = Column(Boolean, default=False)
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    user = relationship("Profile")

class DigitalTwinEvent(Base):
    __tablename__ = "digital_twin_events"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    candidate_id = Column(String(36), ForeignKey("candidate_profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    event_type = Column(String(50), nullable=False) # skill_confirmed, skill_added, skill_corrected, skill_removed, assessment_completed, certificate_added, project_added, goal_updated, preferences_updated, twin_refreshed
    summary = Column(String(255), nullable=False)
    details = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=utc_now)

    candidate = relationship("CandidateProfile", back_populates="digital_twin_events")

class SavedSimulation(Base):
    __tablename__ = "saved_simulations"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    candidate_id = Column(String(36), ForeignKey("candidate_profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    scenario_name = Column(String(255), nullable=False)
    scenario_type = Column(String(50), nullable=False) # learn_skill, earn_qualification, change_industry, switch_remote, adjust_availability, complete_project, start_returnship
    parameters = Column(JSON, nullable=False)
    results = Column(JSON, nullable=False)
    created_at = Column(DateTime, default=utc_now)

    candidate = relationship("CandidateProfile", back_populates="saved_simulations")
