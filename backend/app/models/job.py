from sqlalchemy import Column, String, Text, Integer, Float, Boolean, Date, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from backend.app.models.base import Base, generate_uuid, utc_now

class Job(Base):
    __tablename__ = "jobs"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    company_id = Column(String(36), ForeignKey("companies.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=False)
    employment_type = Column(String(50), nullable=False, default="returnship") # returnship, internship, part_time, full_time, contract, freelance
    work_mode = Column(String(50), nullable=False, default="remote") # remote, hybrid, onsite
    location = Column(String(255), nullable=False)
    minimum_experience = Column(Float, default=0.0)
    minimum_break_months = Column(Integer, default=0)
    maximum_break_months = Column(Integer, nullable=True)
    salary_min = Column(Float, nullable=True)
    salary_max = Column(Float, nullable=True)
    salary_currency = Column(String(10), default="INR")
    duration_months = Column(Integer, nullable=True)
    hours_per_day = Column(Integer, nullable=True)
    permanent_conversion_possible = Column(Boolean, default=True)
    application_deadline = Column(Date, nullable=True)
    status = Column(String(50), nullable=False, default="active") # draft, active, paused, closed
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    company = relationship("Company", back_populates="jobs")
    job_skills = relationship("JobSkill", back_populates="job", cascade="all, delete-orphan")
    applications = relationship("Application", back_populates="job", cascade="all, delete-orphan")
    recommendations = relationship("Recommendation", back_populates="job", cascade="all, delete-orphan")

class JobSkill(Base):
    __tablename__ = "job_skills"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    job_id = Column(String(36), ForeignKey("jobs.id", ondelete="CASCADE"), nullable=False)
    skill_id = Column(String(36), ForeignKey("skills.id", ondelete="CASCADE"), nullable=False)
    importance = Column(String(50), default="preferred")
    required = Column(Boolean, default=False)

    __table_args__ = (UniqueConstraint("job_id", "skill_id", name="uq_job_skill"),)

    job = relationship("Job", back_populates="job_skills")
    skill = relationship("Skill", back_populates="job_skills")
