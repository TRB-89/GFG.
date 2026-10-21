from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field, ConfigDict


# ==========================================
# COURSE SCHEMAS
# ==========================================

class CourseBase(BaseModel):
    title: str = Field(..., max_length=255)
    slug: str = Field(..., max_length=100)
    subtitle: Optional[str] = None
    description: str
    category: str = Field(default="Career Readiness")
    difficulty: str = Field(default="Beginner")
    estimated_duration_hours: int = Field(default=10, ge=1)
    thumbnail_url: Optional[str] = None
    status: str = Field(default="published")  # draft, published, archived
    learning_outcomes: List[str] = Field(default_factory=list)
    prerequisites: List[str] = Field(default_factory=list)
    target_audience: Optional[str] = None
    language_primary: str = "en"
    language_available: List[str] = Field(default_factory=lambda: ["en", "ta"])
    passing_score_percentage: int = Field(default=70, ge=1, le=100)
    attempt_limit: int = Field(default=3, ge=1)
    version: str = "v1.0"


class CourseCreate(CourseBase):
    pass


class CourseUpdate(BaseModel):
    title: Optional[str] = None
    subtitle: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    difficulty: Optional[str] = None
    estimated_duration_hours: Optional[int] = None
    thumbnail_url: Optional[str] = None
    status: Optional[str] = None
    learning_outcomes: Optional[List[str]] = None
    prerequisites: Optional[List[str]] = None
    target_audience: Optional[str] = None
    passing_score_percentage: Optional[int] = None
    attempt_limit: Optional[int] = None
    version: Optional[str] = None


class LessonSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    module_id: str
    title: str
    slug: str
    order_index: int
    content_type: str
    estimated_minutes: int
    is_mandatory: bool
    is_completed: Optional[bool] = False


class ModuleWithLessons(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    course_id: str
    title: str
    description: Optional[str] = None
    order_index: int
    duration_minutes: int
    lessons: List[LessonSummary] = Field(default_factory=list)


class CourseResponse(CourseBase):
    model_config = ConfigDict(from_attributes=True)

    id: str
    created_at: datetime
    updated_at: datetime
    module_count: int = 0
    lesson_count: int = 0
    is_enrolled: bool = False
    enrollment_progress: Optional[int] = None
    enrollment_status: Optional[str] = None
    certificate_earned: bool = False
    certificate_credential_id: Optional[str] = None


class CourseDetailResponse(CourseResponse):
    modules: List[ModuleWithLessons] = Field(default_factory=list)
    assessment_id: Optional[str] = None
    assignment_id: Optional[str] = None
    can_claim_certificate: bool = False
    eligibility_checklist: Optional[Dict[str, Any]] = None


# ==========================================
# LESSON SCHEMAS
# ==========================================

class DownloadableResource(BaseModel):
    title: str
    url: str
    file_type: str = "pdf"  # pdf, xlsx, docx, zip, md
    size_kb: int = 250
    description: Optional[str] = None


class KnowledgeCheck(BaseModel):
    question: str
    options: List[str]
    correct_index: int
    explanation: str


class LessonCreate(BaseModel):
    module_id: str
    course_id: str
    title: str
    slug: str
    order_index: int = 1
    content_type: str = "text"
    content_markdown: str
    video_url: Optional[str] = None
    estimated_minutes: int = 15
    is_mandatory: bool = True
    downloadable_resources: List[DownloadableResource] = Field(default_factory=list)
    knowledge_check: Optional[KnowledgeCheck] = None


class LessonDetailResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    module_id: str
    course_id: str
    title: str
    slug: str
    order_index: int
    content_type: str
    content_markdown: str
    video_url: Optional[str] = None
    estimated_minutes: int
    is_mandatory: bool
    downloadable_resources: List[Dict[str, Any]] = Field(default_factory=list)
    knowledge_check: Optional[Dict[str, Any]] = None
    is_completed: bool = False
    next_lesson_id: Optional[str] = None
    prev_lesson_id: Optional[str] = None
    module_title: Optional[str] = None
    course_title: Optional[str] = None


# ==========================================
# ENROLLMENT & PROGRESS SCHEMAS
# ==========================================

class EnrollmentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    course_id: str
    status: str
    enrolled_at: datetime
    last_accessed_at: datetime
    completed_at: Optional[datetime] = None
    progress_percentage: int
    current_lesson_id: Optional[str] = None
    course: Optional[CourseResponse] = None


class MarkLessonCompleteRequest(BaseModel):
    time_spent_seconds: int = Field(default=60, ge=0)


class MarkLessonCompleteResponse(BaseModel):
    lesson_id: str
    is_completed: bool
    completed_at: datetime
    course_progress_percentage: int
    all_mandatory_completed: bool
    next_lesson_id: Optional[str] = None


# ==========================================
# ASSESSMENT & QUIZ SCHEMAS
# ==========================================

class QuestionOption(BaseModel):
    id: str
    text: str


class PublicAssessmentQuestion(BaseModel):
    id: str
    question_text: str
    question_type: str = "single_choice"
    options: List[QuestionOption]
    points: int = 1
    order_index: int = 1


class AssessmentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    course_id: str
    title: str
    description: Optional[str] = None
    assessment_type: str
    passing_score_percentage: int
    max_attempts: int
    time_limit_minutes: int
    questions: List[PublicAssessmentQuestion]
    attempts_taken: int = 0
    attempts_remaining: int = 3
    has_passed: bool = False
    highest_score: Optional[float] = None


class AssessmentSubmitRequest(BaseModel):
    # Map of question_id -> list of selected option IDs (or single option ID)
    answers: Dict[str, List[str]]


class QuestionFeedback(BaseModel):
    question_id: str
    question_text: str
    user_answers: List[str]
    correct_answers: List[str]
    is_correct: bool
    explanation: Optional[str] = None


class AssessmentResultResponse(BaseModel):
    attempt_id: str
    assessment_id: str
    attempt_number: int
    score_percentage: float
    passed: bool
    passing_score_percentage: int
    feedback: List[QuestionFeedback]
    attempts_remaining: int
    can_retry: bool
    submitted_at: datetime


# ==========================================
# PRACTICAL ASSIGNMENT SCHEMAS
# ==========================================

class RubricCriterion(BaseModel):
    criterion: str
    weight_percentage: int
    description: str


class PracticalAssignmentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    course_id: str
    title: str
    instructions_markdown: str
    rubric: List[Dict[str, Any]]
    submission_type: str
    is_mandatory_for_certificate: bool
    user_submission: Optional[Dict[str, Any]] = None


class AssignmentSubmitRequest(BaseModel):
    submission_content: str = Field(..., min_length=20, description="Project summary, methodology, and key takeaways")
    external_url: Optional[str] = Field(None, description="GitHub repository, Figma link, Google Drive / OneDrive link, or live portfolio URL")
    file_url: Optional[str] = None


class AssignmentReviewRequest(BaseModel):
    status: str = Field(..., description="approved or rejected")
    grade_score: float = Field(..., ge=0, le=100)
    evaluator_feedback: str = Field(..., min_length=5, description="Constructive feedback from administrative evaluator")


# ==========================================
# CERTIFICATE SCHEMAS
# ==========================================

class CertificateResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    credential_id: str
    recipient_name: str
    course_title: str
    course_version: str
    learning_outcomes: List[str]
    issued_at: datetime
    status: str
    issuer_name: str
    issuer_signatory: str
    verification_url: str
    qr_code_svg: Optional[str] = None
    pdf_download_url: str
    is_public_directory_consented: bool


class PublicVerificationResponse(BaseModel):
    status: str  # valid, revoked, not_found
    credential_id: str
    course_title: Optional[str] = None
    recipient_name: Optional[str] = None
    issued_at: Optional[datetime] = None
    issuer_name: Optional[str] = None
    issuer_signatory: Optional[str] = None
    learning_outcomes: Optional[List[str]] = None
    revocation_reason: Optional[str] = None
    revoked_at: Optional[datetime] = None
    verification_url: Optional[str] = None
    qr_code_svg: Optional[str] = None
    compliance_statement: str = "Verified credential issued under GFG Credential Governance Standards."


class RevokeCertificateRequest(BaseModel):
    revocation_reason: str = Field(..., min_length=5, description="Audited rationale for certificate revocation")


# ==========================================
# AI ASSISTANT SCHEMAS
# ==========================================

class AIChatRequest(BaseModel):
    course_id: str
    lesson_id: Optional[str] = None
    question: str
    context: Optional[str] = None


class AIChatResponse(BaseModel):
    answer: str
    recommended_resources: List[Dict[str, str]] = Field(default_factory=list)
    suggested_followups: List[str] = Field(default_factory=list)


class AIStudyPlanRequest(BaseModel):
    course_id: str
    available_hours_per_week: int = Field(default=8, ge=2, le=40)
    target_completion_weeks: int = Field(default=3, ge=1, le=12)


class AIStudyPlanResponse(BaseModel):
    course_title: str
    weekly_schedule: List[Dict[str, Any]]
    tips: List[str]
