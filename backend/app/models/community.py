import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, Text, JSON, ForeignKey
from sqlalchemy.orm import relationship
from backend.app.models.base import Base

def generate_uuid():
    return str(uuid.uuid4())

class MentorProfile(Base):
    __tablename__ = "mentor_profiles"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("profiles.id"), nullable=True)
    name = Column(String(255), nullable=False)
    title = Column(String(255), nullable=False)
    company = Column(String(255), nullable=False)
    field = Column(String(100), nullable=False)  # e.g., data_analytics, software_it, etc.
    years_of_experience = Column(Integer, default=5)
    bio = Column(Text, nullable=False)
    expertise = Column(JSON, default=list)  # list of skill/topic strings
    languages = Column(JSON, default=list)  # e.g., ["English", "Hindi"]
    availability = Column(String(255), nullable=False)  # e.g., "Weekends & Tuesday Evenings"
    verification_status = Column(String(50), default="verified")  # verified, pending_review
    mentorship_formats = Column(JSON, default=list)  # ["1:1 Video", "Async Resume Review", "Portfolio Critique"]
    is_demo = Column(Boolean, default=True)  # True = prominent demonstration badge
    rating = Column(Float, default=4.9)
    review_count = Column(Integer, default=12)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    sessions = relationship("MentorshipSession", back_populates="mentor", cascade="all, delete-orphan")


class MentorshipSession(Base):
    __tablename__ = "mentorship_sessions"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    candidate_id = Column(String(36), ForeignKey("candidate_profiles.id"), nullable=False)
    mentor_id = Column(String(36), ForeignKey("mentor_profiles.id"), nullable=False)
    topic = Column(String(255), nullable=False)
    goals = Column(Text, nullable=False)
    scheduled_at = Column(DateTime, nullable=False)
    format = Column(String(100), default="1:1 Video")
    status = Column(String(50), default="pending_confirmation")  # pending_confirmation, confirmed, declined, rescheduled, cancelled, completed
    meeting_link = Column(String(500), nullable=True)
    candidate_private_notes = Column(Text, nullable=True)
    mentor_notes = Column(Text, nullable=True)
    feedback_rating = Column(Integer, nullable=True)
    feedback_comment = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    mentor = relationship("MentorProfile", back_populates="sessions")
    candidate = relationship("CandidateProfile")


class ComebackCircle(Base):
    __tablename__ = "comeback_circles"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(255), nullable=False)
    industry = Column(String(100), nullable=False)
    career_objective = Column(String(255), nullable=False)
    learning_goals = Column(JSON, default=list)
    language = Column(String(100), default="English")
    max_members = Column(Integer, default=15)
    current_member_count = Column(Integer, default=1)
    milestones = Column(JSON, default=list)  # [{"id": 1, "title": "Milestone", "completed": False}]
    scheduled_sessions = Column(JSON, default=list)  # [{"title": "Weekly AMA", "time": "Sat 11:00 AM"}]
    portfolio_activities = Column(JSON, default=list)  # [{"title": "Resume Swap", "description": "..."}]
    is_demo = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    posts = relationship("CircleDiscussionPost", back_populates="circle", cascade="all, delete-orphan")
    memberships = relationship("CircleMembership", back_populates="circle", cascade="all, delete-orphan")


class CircleMembership(Base):
    __tablename__ = "circle_memberships"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    circle_id = Column(String(36), ForeignKey("comeback_circles.id"), nullable=False)
    candidate_id = Column(String(36), ForeignKey("candidate_profiles.id"), nullable=False)
    role = Column(String(50), default="member")  # member, facilitator
    joined_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    circle = relationship("ComebackCircle", back_populates="memberships")
    candidate = relationship("CandidateProfile")


class CircleDiscussionPost(Base):
    __tablename__ = "circle_discussion_posts"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    circle_id = Column(String(36), ForeignKey("comeback_circles.id"), nullable=False)
    author_id = Column(String(36), nullable=False)
    author_name = Column(String(255), nullable=False)
    author_role = Column(String(50), default="Candidate")
    title = Column(String(255), nullable=False)
    content = Column(Text, nullable=False)
    category = Column(String(100), default="General")
    likes_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    circle = relationship("ComebackCircle", back_populates="posts")


class InterviewPracticeSession(Base):
    __tablename__ = "interview_practice_sessions"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    candidate_id = Column(String(36), ForeignKey("candidate_profiles.id"), nullable=False)
    track = Column(String(100), nullable=False)  # experience_intro, career_break, technical_prep, salary_negotiation, remote_work
    question = Column(Text, nullable=False)
    candidate_answer = Column(Text, nullable=False)
    clarity_score = Column(Integer, default=80)
    structure_score = Column(Integer, default=80)
    content_score = Column(Integer, default=80)
    overall_score = Column(Integer, default=80)
    clarity_feedback = Column(Text, nullable=False)
    structure_feedback = Column(Text, nullable=False)
    content_feedback = Column(Text, nullable=False)
    recommended_refinements = Column(JSON, default=list)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    candidate = relationship("CandidateProfile")


class CommunityModerationReport(Base):
    __tablename__ = "community_moderation_reports"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    reporter_id = Column(String(36), nullable=False)
    target_type = Column(String(50), nullable=False)  # mentor, circle_post, user
    target_id = Column(String(36), nullable=False)
    reason = Column(String(100), nullable=False)
    description = Column(Text, nullable=False)
    status = Column(String(50), default="pending_review")  # pending_review, resolved, dismissed
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))


class UserBlock(Base):
    __tablename__ = "user_blocks"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    blocker_id = Column(String(36), nullable=False)
    blocked_id = Column(String(36), nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
