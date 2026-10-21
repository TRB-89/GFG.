from datetime import datetime, timezone
import uuid
from sqlalchemy import (
    Column,
    String,
    Text,
    Integer,
    Float,
    Boolean,
    DateTime,
    ForeignKey,
    UniqueConstraint,
    JSON,
)
from sqlalchemy.orm import relationship
from backend.app.models.base import Base, generate_uuid, utc_now


class Course(Base):
    __tablename__ = "courses"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    slug = Column(String(100), unique=True, nullable=False, index=True)
    title = Column(String(255), nullable=False)
    subtitle = Column(String(255), nullable=True)
    description = Column(Text, nullable=False)
    category = Column(String(100), nullable=False, default="Career Readiness")  # Digital Literacy, Data & Analytics, Career Readiness
    difficulty = Column(String(50), nullable=False, default="Beginner")  # Beginner, Intermediate, Advanced, All Levels
    estimated_duration_hours = Column(Integer, default=10)
    thumbnail_url = Column(Text, nullable=True)
    status = Column(String(50), default="published")  # draft, published, archived
    learning_outcomes = Column(JSON, default=list)
    prerequisites = Column(JSON, default=list)
    target_audience = Column(String(255), nullable=True)
    language_primary = Column(String(10), default="en")
    language_available = Column(JSON, default=lambda: ["en", "ta"])
    passing_score_percentage = Column(Integer, default=70)
    attempt_limit = Column(Integer, default=3)
    version = Column(String(20), default="v1.0")
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    # Relationships
    modules = relationship("CourseModule", back_populates="course", cascade="all, delete-orphan", order_by="CourseModule.order_index")
    enrollments = relationship("CourseEnrollment", back_populates="course", cascade="all, delete-orphan")
    assessments = relationship("Assessment", back_populates="course", cascade="all, delete-orphan")
    assignments = relationship("PracticalAssignment", back_populates="course", cascade="all, delete-orphan")
    certificates = relationship("LmsCertificate", back_populates="course", cascade="all, delete-orphan")


class CourseModule(Base):
    __tablename__ = "course_modules"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    course_id = Column(String(36), ForeignKey("courses.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    order_index = Column(Integer, default=1)
    duration_minutes = Column(Integer, default=60)
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    # Relationships
    course = relationship("Course", back_populates="modules")
    lessons = relationship("Lesson", back_populates="module", cascade="all, delete-orphan", order_by="Lesson.order_index")


class Lesson(Base):
    __tablename__ = "lessons"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    module_id = Column(String(36), ForeignKey("course_modules.id", ondelete="CASCADE"), nullable=False, index=True)
    course_id = Column(String(36), ForeignKey("courses.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    slug = Column(String(100), nullable=False)
    order_index = Column(Integer, default=1)
    content_type = Column(String(50), default="text")  # text, video, interactive, resource
    content_markdown = Column(Text, nullable=False)
    video_url = Column(Text, nullable=True)
    estimated_minutes = Column(Integer, default=15)
    is_mandatory = Column(Boolean, default=True)
    downloadable_resources = Column(JSON, default=list)  # list of {title, url, file_type, size_kb, description}
    knowledge_check = Column(JSON, nullable=True)  # quick 1-2 question inline knowledge check
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    # Relationships
    module = relationship("CourseModule", back_populates="lessons")
    progress_records = relationship("LessonProgress", back_populates="lesson", cascade="all, delete-orphan")


class CourseEnrollment(Base):
    __tablename__ = "course_enrollments"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    course_id = Column(String(36), ForeignKey("courses.id", ondelete="CASCADE"), nullable=False, index=True)
    status = Column(String(50), default="active")  # active, completed, paused
    enrolled_at = Column(DateTime, default=utc_now)
    last_accessed_at = Column(DateTime, default=utc_now)
    completed_at = Column(DateTime, nullable=True)
    progress_percentage = Column(Integer, default=0)
    current_lesson_id = Column(String(36), nullable=True)

    __table_args__ = (UniqueConstraint("user_id", "course_id", name="uq_user_course_enrollment"),)

    # Relationships
    course = relationship("Course", back_populates="enrollments")
    user = relationship("Profile")
    lesson_progress = relationship("LessonProgress", back_populates="enrollment", cascade="all, delete-orphan")


class LessonProgress(Base):
    __tablename__ = "lesson_progress"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    enrollment_id = Column(String(36), ForeignKey("course_enrollments.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(String(36), ForeignKey("profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    course_id = Column(String(36), ForeignKey("courses.id", ondelete="CASCADE"), nullable=False, index=True)
    lesson_id = Column(String(36), ForeignKey("lessons.id", ondelete="CASCADE"), nullable=False, index=True)
    is_completed = Column(Boolean, default=False)
    completed_at = Column(DateTime, nullable=True)
    time_spent_seconds = Column(Integer, default=0)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    __table_args__ = (UniqueConstraint("user_id", "lesson_id", name="uq_user_lesson_progress"),)

    # Relationships
    enrollment = relationship("CourseEnrollment", back_populates="lesson_progress")
    lesson = relationship("Lesson", back_populates="progress_records")
    user = relationship("Profile")


class Assessment(Base):
    __tablename__ = "assessments"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    course_id = Column(String(36), ForeignKey("courses.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    assessment_type = Column(String(50), default="quiz")  # quiz, final_exam
    passing_score_percentage = Column(Integer, default=70)
    max_attempts = Column(Integer, default=3)
    time_limit_minutes = Column(Integer, default=30)
    randomize_questions = Column(Boolean, default=True)
    is_mandatory_for_certificate = Column(Boolean, default=True)
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    # Relationships
    course = relationship("Course", back_populates="assessments")
    questions = relationship("AssessmentQuestion", back_populates="assessment", cascade="all, delete-orphan", order_by="AssessmentQuestion.order_index")
    attempts = relationship("AssessmentAttempt", back_populates="assessment", cascade="all, delete-orphan")


class AssessmentQuestion(Base):
    __tablename__ = "assessment_questions"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    assessment_id = Column(String(36), ForeignKey("assessments.id", ondelete="CASCADE"), nullable=False, index=True)
    question_text = Column(Text, nullable=False)
    question_type = Column(String(50), default="single_choice")  # single_choice, multiple_choice
    options = Column(JSON, nullable=False)  # list of {id, text}
    correct_option_ids = Column(JSON, nullable=False)  # list of ids, kept server-side
    explanation = Column(Text, nullable=True)  # provided after submission
    points = Column(Integer, default=1)
    order_index = Column(Integer, default=1)

    # Relationships
    assessment = relationship("Assessment", back_populates="questions")


class AssessmentAttempt(Base):
    __tablename__ = "assessment_attempts"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    assessment_id = Column(String(36), ForeignKey("assessments.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(String(36), ForeignKey("profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    attempt_number = Column(Integer, default=1)
    score_percentage = Column(Float, nullable=False)
    passed = Column(Boolean, default=False)
    answers = Column(JSON, nullable=False)  # map of question_id -> list of selected option ids
    feedback = Column(JSON, nullable=True)  # detailed results with correct answers & explanations
    started_at = Column(DateTime, default=utc_now)
    submitted_at = Column(DateTime, default=utc_now)

    # Relationships
    assessment = relationship("Assessment", back_populates="attempts")
    user = relationship("Profile")


class PracticalAssignment(Base):
    __tablename__ = "practical_assignments"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    course_id = Column(String(36), ForeignKey("courses.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    instructions_markdown = Column(Text, nullable=False)
    rubric = Column(JSON, nullable=False)  # list of {criterion, weight_percentage, description}
    submission_type = Column(String(50), default="text_and_link")  # text_and_link, file_upload
    is_mandatory_for_certificate = Column(Boolean, default=True)
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    # Relationships
    course = relationship("Course", back_populates="assignments")
    submissions = relationship("AssignmentSubmission", back_populates="assignment", cascade="all, delete-orphan")


class AssignmentSubmission(Base):
    __tablename__ = "assignment_submissions"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    assignment_id = Column(String(36), ForeignKey("practical_assignments.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(String(36), ForeignKey("profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    submission_content = Column(Text, nullable=False)
    external_url = Column(Text, nullable=True)
    file_url = Column(Text, nullable=True)
    status = Column(String(50), default="submitted")  # submitted, under_review, approved, rejected
    grade_score = Column(Float, nullable=True)
    evaluator_feedback = Column(Text, nullable=True)
    evaluated_by_user_id = Column(String(36), ForeignKey("profiles.id", ondelete="SET NULL"), nullable=True)
    submitted_at = Column(DateTime, default=utc_now)
    evaluated_at = Column(DateTime, nullable=True)

    # Relationships
    assignment = relationship("PracticalAssignment", back_populates="submissions")
    user = relationship("Profile", foreign_keys=[user_id])
    evaluator = relationship("Profile", foreign_keys=[evaluated_by_user_id])


class LmsCertificate(Base):
    __tablename__ = "lms_certificates"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    credential_id = Column(String(64), unique=True, nullable=False, index=True)
    user_id = Column(String(36), ForeignKey("profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    course_id = Column(String(36), ForeignKey("courses.id", ondelete="CASCADE"), nullable=False, index=True)
    recipient_name = Column(String(255), nullable=False)
    course_title = Column(String(255), nullable=False)
    course_version = Column(String(50), default="v1.0")
    learning_outcomes = Column(JSON, default=list)
    issued_at = Column(DateTime, default=utc_now)
    status = Column(String(50), default="valid")  # valid, revoked
    revocation_reason = Column(Text, nullable=True)
    revoked_at = Column(DateTime, nullable=True)
    issuer_name = Column(String(255), default="GFG — Gap For Good Credential Governance Board")
    issuer_signatory = Column(String(255), default="Dr. Meera Iyer, Academic Director & Returnship Dean")
    verification_url = Column(Text, nullable=False)
    qr_code_svg = Column(Text, nullable=True)
    is_public_directory_consented = Column(Boolean, default=True)  # DPDP compliance
    created_at = Column(DateTime, default=utc_now)

    __table_args__ = (UniqueConstraint("user_id", "course_id", name="uq_user_course_lms_certificate"),)

    # Relationships
    course = relationship("Course", back_populates="certificates")
    user = relationship("Profile")
    audit_logs = relationship("CertificateAuditLog", back_populates="certificate", cascade="all, delete-orphan")


class CertificateAuditLog(Base):
    __tablename__ = "certificate_audit_logs"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    certificate_id = Column(String(36), ForeignKey("lms_certificates.id", ondelete="CASCADE"), nullable=False, index=True)
    action = Column(String(50), nullable=False)  # issued, revoked, reinstated, verified_publicly, privacy_updated
    actor_id = Column(String(36), nullable=True)  # admin user_id, 'system', or 'public_verifier'
    details = Column(JSON, default=dict)
    timestamp = Column(DateTime, default=utc_now)

    # Relationships
    certificate = relationship("LmsCertificate", back_populates="audit_logs")
