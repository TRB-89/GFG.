import uuid
from datetime import datetime, timezone
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_, func

from backend.app.database.database import get_db
from backend.app.models.user import Profile
from backend.app.models.learning import (
    Course,
    CourseModule,
    Lesson,
    CourseEnrollment,
    LessonProgress,
    Assessment,
    AssessmentQuestion,
    AssessmentAttempt,
    PracticalAssignment,
    AssignmentSubmission,
    LmsCertificate,
    CertificateAuditLog,
)
from backend.app.schemas.learning import (
    CourseResponse,
    CourseDetailResponse,
    CourseCreate,
    CourseUpdate,
    LessonCreate,
    LessonDetailResponse,
    MarkLessonCompleteRequest,
    MarkLessonCompleteResponse,
    AssessmentResponse,
    PublicAssessmentQuestion,
    QuestionOption,
    AssessmentSubmitRequest,
    AssessmentResultResponse,
    PracticalAssignmentResponse,
    AssignmentSubmitRequest,
    AssignmentReviewRequest,
    CertificateResponse,
    PublicVerificationResponse,
    RevokeCertificateRequest,
    AIChatRequest,
    AIChatResponse,
    AIStudyPlanRequest,
    AIStudyPlanResponse,
)
from backend.app.schemas.common import success_response, error_response
from backend.app.middleware.auth_middleware import get_current_user, get_optional_user, require_role
from backend.app.services.learning.assessment_service import grade_assessment_submission
from backend.app.services.learning.certificate_service import (
    check_course_eligibility,
    issue_course_certificate,
    get_public_certificate_verification,
    revoke_certificate_by_admin,
)
from backend.app.services.learning.pdf_certificate_service import generate_certificate_pdf
from backend.app.services.learning.lms_ai_service import answer_learner_question, generate_personalized_study_plan

router = APIRouter(prefix="/api/learning", tags=["Learning Management System"])


# =============================================================================
# 1. COURSE CATALOGUE & DETAIL ENDPOINTS
# =============================================================================

@router.get("/courses")
def list_courses(
    search: Optional[str] = None,
    category: Optional[str] = None,
    difficulty: Optional[str] = None,
    current_user: Optional[Profile] = Depends(get_optional_user),
    db: Session = Depends(get_db)
):
    """
    Returns public course catalogue with search, category/difficulty filters,
    and user enrollment status if logged in.
    """
    query = db.query(Course).filter(Course.status == "published")

    if search:
        term = f"%{search.strip()}%"
        query = query.filter(or_(Course.title.ilike(term), Course.description.ilike(term)))

    if category and category.lower() != "all":
        query = query.filter(Course.category.ilike(f"%{category.strip()}%"))

    if difficulty and difficulty.lower() != "all":
        query = query.filter(Course.difficulty.ilike(f"%{difficulty.strip()}%"))

    courses = query.order_by(Course.created_at.asc()).all()

    # If logged in, fetch user's enrollments and certificates
    user_enrollments = {}
    user_certs = {}
    if current_user:
        enrollments = db.query(CourseEnrollment).filter(CourseEnrollment.user_id == current_user.id).all()
        user_enrollments = {e.course_id: e for e in enrollments}
        certs = db.query(LmsCertificate).filter(
            LmsCertificate.user_id == current_user.id,
            LmsCertificate.status == "valid"
        ).all()
        user_certs = {c.course_id: c for c in certs}

    result = []
    for c in courses:
        enr = user_enrollments.get(c.id)
        cert = user_certs.get(c.id)
        module_count = len(c.modules)
        lesson_count = sum(len(m.lessons) for m in c.modules)

        result.append({
            "id": c.id,
            "slug": c.slug,
            "title": c.title,
            "subtitle": c.subtitle,
            "description": c.description,
            "category": c.category,
            "difficulty": c.difficulty,
            "estimated_duration_hours": c.estimated_duration_hours,
            "thumbnail_url": c.thumbnail_url,
            "status": c.status,
            "learning_outcomes": c.learning_outcomes or [],
            "prerequisites": c.prerequisites or [],
            "target_audience": c.target_audience,
            "language_primary": c.language_primary,
            "language_available": c.language_available or ["en", "ta"],
            "passing_score_percentage": c.passing_score_percentage,
            "attempt_limit": c.attempt_limit,
            "version": c.version,
            "module_count": module_count,
            "lesson_count": lesson_count,
            "is_enrolled": enr is not None,
            "enrollment_progress": enr.progress_percentage if enr else 0,
            "enrollment_status": enr.status if enr else None,
            "certificate_earned": cert is not None,
            "certificate_credential_id": cert.credential_id if cert else None,
            "created_at": c.created_at.isoformat() if c.created_at else None,
            "updated_at": c.updated_at.isoformat() if c.updated_at else None,
        })

    return success_response(result)


@router.get("/courses/{course_id_or_slug}")
def get_course_detail(
    course_id_or_slug: str,
    current_user: Optional[Profile] = Depends(get_optional_user),
    db: Session = Depends(get_db)
):
    """
    Returns full course detail, structured modules, lessons, and eligibility status.
    """
    course = db.query(Course).filter(
        or_(Course.id == course_id_or_slug, Course.slug == course_id_or_slug)
    ).first()

    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"code": "COURSE_NOT_FOUND", "message": "Course not found."}
        )

    # Check user enrollment & completed lessons
    enr = None
    completed_lesson_ids = set()
    cert = None
    can_claim = False
    checklist = None

    if current_user:
        enr = db.query(CourseEnrollment).filter(
            CourseEnrollment.course_id == course.id,
            CourseEnrollment.user_id == current_user.id
        ).first()

        completed_records = db.query(LessonProgress).filter(
            LessonProgress.course_id == course.id,
            LessonProgress.user_id == current_user.id,
            LessonProgress.is_completed == True
        ).all()
        completed_lesson_ids = {lp.lesson_id for lp in completed_records}

        cert = db.query(LmsCertificate).filter(
            LmsCertificate.course_id == course.id,
            LmsCertificate.user_id == current_user.id
        ).first()

        if enr and not cert:
            can_claim, checklist = check_course_eligibility(db, course.id, current_user.id)
        elif cert:
            can_claim = False
            checklist = {"status": "certificate_already_issued", "credential_id": cert.credential_id}

    # Format modules and lessons
    modules_data = []
    for m in course.modules:
        lessons_data = []
        for l in m.lessons:
            lessons_data.append({
                "id": l.id,
                "module_id": l.module_id,
                "title": l.title,
                "slug": l.slug,
                "order_index": l.order_index,
                "content_type": l.content_type,
                "estimated_minutes": l.estimated_minutes,
                "is_mandatory": l.is_mandatory,
                "is_completed": l.id in completed_lesson_ids
            })
        modules_data.append({
            "id": m.id,
            "course_id": m.course_id,
            "title": m.title,
            "description": m.description,
            "order_index": m.order_index,
            "duration_minutes": m.duration_minutes,
            "lessons": lessons_data
        })

    assessment = db.query(Assessment).filter(Assessment.course_id == course.id).first()
    assignment = db.query(PracticalAssignment).filter(PracticalAssignment.course_id == course.id).first()

    return success_response({
        "id": course.id,
        "slug": course.slug,
        "title": course.title,
        "subtitle": course.subtitle,
        "description": course.description,
        "category": course.category,
        "difficulty": course.difficulty,
        "estimated_duration_hours": course.estimated_duration_hours,
        "thumbnail_url": course.thumbnail_url,
        "status": course.status,
        "learning_outcomes": course.learning_outcomes or [],
        "prerequisites": course.prerequisites or [],
        "target_audience": course.target_audience,
        "language_primary": course.language_primary,
        "language_available": course.language_available or ["en", "ta"],
        "passing_score_percentage": course.passing_score_percentage,
        "attempt_limit": course.attempt_limit,
        "version": course.version,
        "modules": modules_data,
        "assessment_id": assessment.id if assessment else None,
        "assignment_id": assignment.id if assignment else None,
        "is_enrolled": enr is not None,
        "enrollment_progress": enr.progress_percentage if enr else 0,
        "enrollment_status": enr.status if enr else None,
        "current_lesson_id": enr.current_lesson_id if enr else None,
        "certificate_earned": cert is not None,
        "certificate_credential_id": cert.credential_id if cert else None,
        "can_claim_certificate": can_claim,
        "eligibility_checklist": checklist,
        "created_at": course.created_at.isoformat() if course.created_at else None,
        "updated_at": course.updated_at.isoformat() if course.updated_at else None,
    })


@router.post("/courses/{course_id}/enroll")
def enroll_in_course(
    course_id: str,
    current_user: Profile = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Enrolls the authenticated learner in the specified course.
    """
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"code": "COURSE_NOT_FOUND", "message": "Course not found."}
        )

    existing = db.query(CourseEnrollment).filter(
        CourseEnrollment.course_id == course_id,
        CourseEnrollment.user_id == current_user.id
    ).first()

    if existing:
        return success_response({
            "message": "Already enrolled.",
            "enrollment_id": existing.id,
            "status": existing.status,
            "progress_percentage": existing.progress_percentage,
            "current_lesson_id": existing.current_lesson_id
        })

    # Pick first lesson as starting point
    first_lesson_id = None
    if course.modules and len(course.modules) > 0 and len(course.modules[0].lessons) > 0:
        first_lesson_id = course.modules[0].lessons[0].id

    enrollment = CourseEnrollment(
        user_id=current_user.id,
        course_id=course.id,
        status="active",
        progress_percentage=0,
        current_lesson_id=first_lesson_id,
        enrolled_at=datetime.now(timezone.utc),
        last_accessed_at=datetime.now(timezone.utc)
    )
    db.add(enrollment)
    db.commit()
    db.refresh(enrollment)

    return success_response({
        "message": f"Successfully enrolled in {course.title}.",
        "enrollment_id": enrollment.id,
        "status": enrollment.status,
        "progress_percentage": 0,
        "current_lesson_id": first_lesson_id
    })


# =============================================================================
# 2. LEARNER DASHBOARD
# =============================================================================

@router.get("/dashboard")
def get_learner_dashboard(
    current_user: Profile = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Personalized learner dashboard displaying active enrollments, completed courses,
    resume-learning links, assessment history, and earned certificates.
    """
    enrollments = db.query(CourseEnrollment).filter(
        CourseEnrollment.user_id == current_user.id
    ).order_by(CourseEnrollment.last_accessed_at.desc()).all()

    enrolled_courses = []
    total_lessons_completed = db.query(LessonProgress).filter(
        LessonProgress.user_id == current_user.id,
        LessonProgress.is_completed == True
    ).count()

    for e in enrollments:
        c = e.course
        cert = db.query(LmsCertificate).filter(
            LmsCertificate.course_id == c.id,
            LmsCertificate.user_id == current_user.id,
            LmsCertificate.status == "valid"
        ).first()

        # Find current lesson title for resume-learning
        resume_lesson_title = None
        if e.current_lesson_id:
            lesson_obj = db.query(Lesson).filter(Lesson.id == e.current_lesson_id).first()
            if lesson_obj:
                resume_lesson_title = lesson_obj.title

        enrolled_courses.append({
            "enrollment_id": e.id,
            "course_id": c.id,
            "course_slug": c.slug,
            "course_title": c.title,
            "category": c.category,
            "thumbnail_url": c.thumbnail_url,
            "status": e.status,
            "progress_percentage": e.progress_percentage,
            "enrolled_at": e.enrolled_at.isoformat() if e.enrolled_at else None,
            "last_accessed_at": e.last_accessed_at.isoformat() if e.last_accessed_at else None,
            "current_lesson_id": e.current_lesson_id,
            "resume_lesson_title": resume_lesson_title,
            "certificate_earned": cert is not None,
            "certificate_credential_id": cert.credential_id if cert else None,
        })

    # Earned certificates
    certificates = db.query(LmsCertificate).filter(
        LmsCertificate.user_id == current_user.id
    ).order_by(LmsCertificate.issued_at.desc()).all()

    certs_data = [
        {
            "id": cert.id,
            "credential_id": cert.credential_id,
            "course_title": cert.course_title,
            "course_version": cert.course_version,
            "issued_at": cert.issued_at.isoformat() if cert.issued_at else None,
            "status": cert.status,
            "verification_url": cert.verification_url,
            "qr_code_svg": cert.qr_code_svg,
            "pdf_download_url": f"/api/learning/certificates/{cert.credential_id}/download-pdf",
        }
        for cert in certificates
    ]

    # Recent assessment attempts
    attempts = db.query(AssessmentAttempt).filter(
        AssessmentAttempt.user_id == current_user.id
    ).order_by(AssessmentAttempt.submitted_at.desc()).limit(5).all()

    attempts_data = []
    for a in attempts:
        assess = a.assessment
        attempts_data.append({
            "attempt_id": a.id,
            "assessment_id": a.assessment_id,
            "assessment_title": assess.title if assess else "Assessment",
            "course_id": assess.course_id if assess else None,
            "attempt_number": a.attempt_number,
            "score_percentage": a.score_percentage,
            "passed": a.passed,
            "submitted_at": a.submitted_at.isoformat() if a.submitted_at else None,
        })

    return success_response({
        "learner_name": current_user.full_name,
        "total_enrolled": len(enrolled_courses),
        "total_completed": len([e for e in enrolled_courses if e["status"] == "completed"]),
        "total_lessons_completed": total_lessons_completed,
        "total_certificates_earned": len([c for c in certs_data if c["status"] == "valid"]),
        "enrolled_courses": enrolled_courses,
        "certificates": certs_data,
        "recent_assessment_attempts": attempts_data
    })


# =============================================================================
# 3. LESSON READER & PROGRESS TRACKING
# =============================================================================

@router.get("/courses/{course_id}/lessons/{lesson_id}")
def get_lesson_detail(
    course_id: str,
    lesson_id: str,
    current_user: Optional[Profile] = Depends(get_optional_user),
    db: Session = Depends(get_db)
):
    """
    Returns complete lesson text, downloadable resources, knowledge check,
    completion status, and next/previous navigation pointers.
    """
    lesson = db.query(Lesson).filter(
        Lesson.id == lesson_id,
        Lesson.course_id == course_id
    ).first()

    if not lesson:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"code": "LESSON_NOT_FOUND", "message": "Lesson not found in this course."}
        )

    # Find next and previous lessons in the course sequence
    all_lessons = db.query(Lesson).join(CourseModule).filter(
        Lesson.course_id == course_id
    ).order_by(CourseModule.order_index.asc(), Lesson.order_index.asc()).all()

    lesson_ids = [l.id for l in all_lessons]
    curr_idx = lesson_ids.index(lesson.id) if lesson.id in lesson_ids else -1

    prev_id = lesson_ids[curr_idx - 1] if curr_idx > 0 else None
    next_id = lesson_ids[curr_idx + 1] if (curr_idx >= 0 and curr_idx < len(lesson_ids) - 1) else None

    is_completed = False
    if current_user:
        # Check completion
        lp = db.query(LessonProgress).filter(
            LessonProgress.lesson_id == lesson.id,
            LessonProgress.user_id == current_user.id
        ).first()
        is_completed = lp.is_completed if lp else False

        # Update current lesson pointer in enrollment for resume-learning
        enr = db.query(CourseEnrollment).filter(
            CourseEnrollment.course_id == course_id,
            CourseEnrollment.user_id == current_user.id
        ).first()
        if enr:
            enr.current_lesson_id = lesson.id
            enr.last_accessed_at = datetime.now(timezone.utc)
            db.commit()

    return success_response({
        "id": lesson.id,
        "module_id": lesson.module_id,
        "course_id": lesson.course_id,
        "title": lesson.title,
        "slug": lesson.slug,
        "order_index": lesson.order_index,
        "content_type": lesson.content_type,
        "content_markdown": lesson.content_markdown,
        "video_url": lesson.video_url,
        "estimated_minutes": lesson.estimated_minutes,
        "is_mandatory": lesson.is_mandatory,
        "downloadable_resources": lesson.downloadable_resources or [],
        "knowledge_check": lesson.knowledge_check,
        "is_completed": is_completed,
        "next_lesson_id": next_id,
        "prev_lesson_id": prev_id,
        "module_title": lesson.module.title if lesson.module else None,
        "course_title": lesson.module.course.title if lesson.module and lesson.module.course else None,
    })


@router.post("/lessons/{lesson_id}/complete")
def mark_lesson_complete(
    lesson_id: str,
    req: MarkLessonCompleteRequest,
    current_user: Profile = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Marks lesson as completed in database, calculates updated course progress percentage,
    and returns next lesson ID for seamless navigation.
    """
    lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
    if not lesson:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"code": "LESSON_NOT_FOUND", "message": "Lesson not found."}
        )

    # Ensure enrollment exists
    enrollment = db.query(CourseEnrollment).filter(
        CourseEnrollment.course_id == lesson.course_id,
        CourseEnrollment.user_id == current_user.id
    ).first()

    if not enrollment:
        # Auto-enroll if accessing lesson directly
        enrollment = CourseEnrollment(
            user_id=current_user.id,
            course_id=lesson.course_id,
            status="active",
            current_lesson_id=lesson.id,
            enrolled_at=datetime.now(timezone.utc),
            last_accessed_at=datetime.now(timezone.utc)
        )
        db.add(enrollment)
        db.flush()

    # Record or update lesson progress
    lp = db.query(LessonProgress).filter(
        LessonProgress.lesson_id == lesson.id,
        LessonProgress.user_id == current_user.id
    ).first()

    if not lp:
        lp = LessonProgress(
            enrollment_id=enrollment.id,
            user_id=current_user.id,
            course_id=lesson.course_id,
            lesson_id=lesson.id,
            is_completed=True,
            completed_at=datetime.now(timezone.utc),
            time_spent_seconds=req.time_spent_seconds
        )
        db.add(lp)
    else:
        lp.is_completed = True
        lp.completed_at = datetime.now(timezone.utc)
        lp.time_spent_seconds += req.time_spent_seconds

    db.flush()

    # Recalculate course progress
    total_mandatory = db.query(Lesson).filter(
        Lesson.course_id == lesson.course_id,
        Lesson.is_mandatory == True
    ).count()

    completed_mandatory = db.query(LessonProgress).join(
        Lesson, LessonProgress.lesson_id == Lesson.id
    ).filter(
        LessonProgress.course_id == lesson.course_id,
        LessonProgress.user_id == current_user.id,
        LessonProgress.is_completed == True,
        Lesson.is_mandatory == True
    ).count()

    pct = round((completed_mandatory / total_mandatory) * 100) if total_mandatory > 0 else 100
    enrollment.progress_percentage = min(100, max(1, pct) if completed_mandatory > 0 else 0)
    enrollment.last_accessed_at = datetime.now(timezone.utc)

    # Next lesson
    all_lessons = db.query(Lesson).join(CourseModule).filter(
        Lesson.course_id == lesson.course_id
    ).order_by(CourseModule.order_index.asc(), Lesson.order_index.asc()).all()
    lesson_ids = [l.id for l in all_lessons]
    curr_idx = lesson_ids.index(lesson.id) if lesson.id in lesson_ids else -1
    next_id = lesson_ids[curr_idx + 1] if (curr_idx >= 0 and curr_idx < len(lesson_ids) - 1) else None

    if next_id:
        enrollment.current_lesson_id = next_id

    db.commit()

    return success_response({
        "lesson_id": lesson.id,
        "is_completed": True,
        "completed_at": lp.completed_at.isoformat() if lp.completed_at else None,
        "course_progress_percentage": enrollment.progress_percentage,
        "all_mandatory_completed": completed_mandatory >= total_mandatory,
        "next_lesson_id": next_id
    })


# =============================================================================
# 4. ASSESSMENT & QUIZ ENGINE
# =============================================================================

@router.get("/assessments/{assessment_id}")
def get_assessment(
    assessment_id: str,
    current_user: Profile = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Returns assessment questions without leaking correct answers,
    alongside candidate's attempts history and highest score.
    """
    assessment = db.query(Assessment).filter(Assessment.id == assessment_id).first()
    if not assessment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"code": "ASSESSMENT_NOT_FOUND", "message": "Assessment not found."}
        )

    # Fetch attempts taken by this user
    attempts = db.query(AssessmentAttempt).filter(
        AssessmentAttempt.assessment_id == assessment_id,
        AssessmentAttempt.user_id == current_user.id
    ).order_by(AssessmentAttempt.attempt_number.desc()).all()

    attempts_taken = len(attempts)
    attempts_remaining = max(0, assessment.max_attempts - attempts_taken)
    has_passed = any(a.passed for a in attempts)
    highest_score = max([a.score_percentage for a in attempts], default=None)

    # Format public questions (stripping correct_option_ids!)
    public_questions = []
    for q in assessment.questions:
        options = [QuestionOption(id=opt["id"], text=opt["text"]) for opt in (q.options or [])]
        public_questions.append({
            "id": q.id,
            "question_text": q.question_text,
            "question_type": q.question_type,
            "options": [opt.model_dump() for opt in options],
            "points": q.points,
            "order_index": q.order_index
        })

    return success_response({
        "id": assessment.id,
        "course_id": assessment.course_id,
        "title": assessment.title,
        "description": assessment.description,
        "assessment_type": assessment.assessment_type,
        "passing_score_percentage": assessment.passing_score_percentage,
        "max_attempts": assessment.max_attempts,
        "time_limit_minutes": assessment.time_limit_minutes,
        "questions": public_questions,
        "attempts_taken": attempts_taken,
        "attempts_remaining": attempts_remaining,
        "has_passed": has_passed,
        "highest_score": highest_score,
        "recent_attempts": [
            {
                "attempt_number": a.attempt_number,
                "score_percentage": a.score_percentage,
                "passed": a.passed,
                "submitted_at": a.submitted_at.isoformat() if a.submitted_at else None,
                "feedback": a.feedback
            }
            for a in attempts
        ]
    })


@router.post("/assessments/{assessment_id}/submit")
def submit_assessment(
    assessment_id: str,
    req: AssessmentSubmitRequest,
    current_user: Profile = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Submits user answers for server-side scoring and persistence.
    """
    result = grade_assessment_submission(
        db=db,
        assessment_id=assessment_id,
        user_id=current_user.id,
        submitted_answers=req.answers
    )
    return success_response(result.model_dump())


# =============================================================================
# 5. PRACTICAL ASSIGNMENT PORTAL
# =============================================================================

@router.get("/assignments/{assignment_id}")
def get_assignment_detail(
    assignment_id: str,
    current_user: Optional[Profile] = Depends(get_optional_user),
    db: Session = Depends(get_db)
):
    """
    Returns practical assignment instructions, published rubrics,
    and learner's active submission status if logged in.
    """
    assignment = db.query(PracticalAssignment).filter(PracticalAssignment.id == assignment_id).first()
    if not assignment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"code": "ASSIGNMENT_NOT_FOUND", "message": "Assignment not found."}
        )

    user_sub = None
    if current_user:
        sub = db.query(AssignmentSubmission).filter(
            AssignmentSubmission.assignment_id == assignment_id,
            AssignmentSubmission.user_id == current_user.id
        ).order_by(AssignmentSubmission.submitted_at.desc()).first()

        if sub:
            user_sub = {
                "id": sub.id,
                "status": sub.status,
                "submission_content": sub.submission_content,
                "external_url": sub.external_url,
                "grade_score": sub.grade_score,
                "evaluator_feedback": sub.evaluator_feedback,
                "submitted_at": sub.submitted_at.isoformat() if sub.submitted_at else None,
                "evaluated_at": sub.evaluated_at.isoformat() if sub.evaluated_at else None,
            }

    return success_response({
        "id": assignment.id,
        "course_id": assignment.course_id,
        "title": assignment.title,
        "instructions_markdown": assignment.instructions_markdown,
        "rubric": assignment.rubric,
        "submission_type": assignment.submission_type,
        "is_mandatory_for_certificate": assignment.is_mandatory_for_certificate,
        "user_submission": user_sub
    })


@router.post("/assignments/{assignment_id}/submit")
def submit_assignment(
    assignment_id: str,
    req: AssignmentSubmitRequest,
    current_user: Profile = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Submits practical project writeup and links for administrative review.
    """
    assignment = db.query(PracticalAssignment).filter(PracticalAssignment.id == assignment_id).first()
    if not assignment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"code": "ASSIGNMENT_NOT_FOUND", "message": "Assignment not found."}
        )

    # Check existing submission
    sub = db.query(AssignmentSubmission).filter(
        AssignmentSubmission.assignment_id == assignment_id,
        AssignmentSubmission.user_id == current_user.id
    ).first()

    if not sub:
        sub = AssignmentSubmission(
            assignment_id=assignment.id,
            user_id=current_user.id,
            submission_content=req.submission_content,
            external_url=req.external_url,
            file_url=req.file_url,
            status="submitted",
            submitted_at=datetime.now(timezone.utc)
        )
        db.add(sub)
    else:
        # Re-submission
        sub.submission_content = req.submission_content
        sub.external_url = req.external_url
        sub.file_url = req.file_url
        sub.status = "submitted"
        sub.submitted_at = datetime.now(timezone.utc)

    db.commit()
    db.refresh(sub)

    return success_response({
        "message": "Assignment submitted successfully for administrative review.",
        "submission_id": sub.id,
        "status": sub.status,
        "submitted_at": sub.submitted_at.isoformat()
    })


# =============================================================================
# 6. CERTIFICATE ISSUANCE & VERIFICATION
# =============================================================================

@router.get("/courses/{course_id}/eligibility")
def get_certificate_eligibility(
    course_id: str,
    current_user: Profile = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Checks real-time certificate eligibility conditions server-side.
    """
    is_eligible, checklist = check_course_eligibility(db, course_id, current_user.id)
    return success_response({
        "is_eligible": is_eligible,
        "checklist": checklist
    })


@router.post("/courses/{course_id}/claim-certificate")
def claim_certificate(
    course_id: str,
    current_user: Profile = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Issues authentic GFG Certificate of Achievement after verifying all eligibility criteria.
    Enforces duplicate prevention.
    """
    cert = issue_course_certificate(db, course_id, current_user.id)

    return success_response({
        "id": cert.id,
        "credential_id": cert.credential_id,
        "recipient_name": cert.recipient_name,
        "course_title": cert.course_title,
        "course_version": cert.course_version,
        "learning_outcomes": cert.learning_outcomes,
        "issued_at": cert.issued_at.isoformat() if cert.issued_at else None,
        "status": cert.status,
        "issuer_name": cert.issuer_name,
        "issuer_signatory": cert.issuer_signatory,
        "verification_url": cert.verification_url,
        "qr_code_svg": cert.qr_code_svg,
        "pdf_download_url": f"/api/learning/certificates/{cert.credential_id}/download-pdf",
        "is_public_directory_consented": cert.is_public_directory_consented
    })


@router.get("/certificates/{credential_id}")
def get_certificate_by_id(
    credential_id: str,
    db: Session = Depends(get_db)
):
    """
    Retrieves full certificate model by credential ID.
    """
    cert = db.query(LmsCertificate).filter(
        LmsCertificate.credential_id == credential_id.strip().upper()
    ).first()

    if not cert:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"code": "CERTIFICATE_NOT_FOUND", "message": "Certificate not found."}
        )

    return success_response({
        "id": cert.id,
        "credential_id": cert.credential_id,
        "recipient_name": cert.recipient_name,
        "course_title": cert.course_title,
        "course_version": cert.course_version,
        "learning_outcomes": cert.learning_outcomes,
        "issued_at": cert.issued_at.isoformat() if cert.issued_at else None,
        "status": cert.status,
        "revocation_reason": cert.revocation_reason,
        "revoked_at": cert.revoked_at.isoformat() if cert.revoked_at else None,
        "issuer_name": cert.issuer_name,
        "issuer_signatory": cert.issuer_signatory,
        "verification_url": cert.verification_url,
        "qr_code_svg": cert.qr_code_svg,
        "pdf_download_url": f"/api/learning/certificates/{cert.credential_id}/download-pdf",
        "is_public_directory_consented": cert.is_public_directory_consented
    })


@router.get("/certificates/verify/{credential_id}")
def verify_certificate_public(
    credential_id: str,
    db: Session = Depends(get_db)
):
    """
    Public verification route (`GET /verify/:certificateId`).
    Retrieves certificate details according to DPDP privacy settings.
    Never exposes emails, internal user IDs or private learning logs.
    """
    verification_data = get_public_certificate_verification(db, credential_id)
    return success_response(verification_data)


@router.get("/certificates/{credential_id}/download-pdf")
def download_certificate_pdf(
    credential_id: str,
    db: Session = Depends(get_db)
):
    """
    Generates and downloads authentic A4 landscape PDF certificate.
    """
    cert = db.query(LmsCertificate).filter(
        LmsCertificate.credential_id == credential_id.strip().upper()
    ).first()

    if not cert:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"code": "CERTIFICATE_NOT_FOUND", "message": "Certificate not found."}
        )

    pdf_buffer = generate_certificate_pdf(cert)

    filename = f"GFG_Certificate_{cert.credential_id}.pdf"
    return StreamingResponse(
        pdf_buffer,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"'
        }
    )


# =============================================================================
# 7. AI LEARNING ASSISTANT
# =============================================================================

@router.post("/ai/chat")
async def ai_learning_chat(
    req: AIChatRequest,
    current_user: Profile = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    AI Learning Assistant explaining lesson concepts, providing practical hints,
    and answering learner queries. Routed through backend to protect API keys.
    """
    response_data = await answer_learner_question(
        db=db,
        course_id=req.course_id,
        question=req.question,
        lesson_id=req.lesson_id
    )
    return success_response(response_data)


@router.post("/ai/study-plan")
def ai_study_plan(
    req: AIStudyPlanRequest,
    current_user: Profile = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Generates a realistic, personalized weekly study schedule based on candidate's availability.
    """
    course = db.query(Course).filter(Course.id == req.course_id).first()
    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"code": "COURSE_NOT_FOUND", "message": "Course not found."}
        )

    plan = generate_personalized_study_plan(
        course=course,
        available_hours_per_week=req.available_hours_per_week,
        target_weeks=req.target_completion_weeks
    )
    return success_response(plan)


# =============================================================================
# 8. ADMINISTRATION (RBAC: require_role(["admin"]))
# =============================================================================

@router.get("/admin/courses")
def admin_list_courses(
    current_user: Profile = Depends(require_role(["admin"])),
    db: Session = Depends(get_db)
):
    """Admin: list all courses including drafts & archived with enrollment statistics."""
    courses = db.query(Course).order_by(Course.created_at.desc()).all()
    results = []
    for c in courses:
        enrolled_count = db.query(CourseEnrollment).filter(CourseEnrollment.course_id == c.id).count()
        cert_count = db.query(LmsCertificate).filter(LmsCertificate.course_id == c.id, LmsCertificate.status == "valid").count()
        results.append({
            "id": c.id,
            "slug": c.slug,
            "title": c.title,
            "category": c.category,
            "difficulty": c.difficulty,
            "status": c.status,
            "version": c.version,
            "module_count": len(c.modules),
            "lesson_count": sum(len(m.lessons) for m in c.modules),
            "enrolled_count": enrolled_count,
            "certificates_issued": cert_count,
            "created_at": c.created_at.isoformat() if c.created_at else None,
            "updated_at": c.updated_at.isoformat() if c.updated_at else None,
        })
    return success_response(results)


@router.post("/admin/courses")
def admin_create_course(
    req: CourseCreate,
    current_user: Profile = Depends(require_role(["admin"])),
    db: Session = Depends(get_db)
):
    """Admin: create a new course."""
    existing = db.query(Course).filter(Course.slug == req.slug).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"code": "SLUG_EXISTS", "message": "A course with this slug already exists."}
        )

    course = Course(**req.model_dump())
    db.add(course)
    db.commit()
    db.refresh(course)
    return success_response({"id": course.id, "slug": course.slug, "title": course.title})


@router.put("/admin/courses/{course_id}")
def admin_update_course(
    course_id: str,
    req: CourseUpdate,
    current_user: Profile = Depends(require_role(["admin"])),
    db: Session = Depends(get_db)
):
    """Admin: update course metadata, publish, or archive."""
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"code": "COURSE_NOT_FOUND", "message": "Course not found."}
        )

    for key, value in req.model_dump(exclude_unset=True).items():
        setattr(course, key, value)

    course.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(course)
    return success_response({"id": course.id, "status": course.status, "message": "Course updated successfully."})


@router.get("/admin/submissions")
def admin_list_submissions(
    status_filter: Optional[str] = Query("submitted", description="submitted, under_review, approved, rejected, all"),
    current_user: Profile = Depends(require_role(["admin"])),
    db: Session = Depends(get_db)
):
    """Admin: list student practical assignments for review."""
    query = db.query(AssignmentSubmission)
    if status_filter and status_filter.lower() != "all":
        query = query.filter(AssignmentSubmission.status == status_filter.lower())

    submissions = query.order_by(AssignmentSubmission.submitted_at.desc()).all()
    results = []
    for s in submissions:
        assign = s.assignment
        course = assign.course if assign else None
        user = s.user
        results.append({
            "id": s.id,
            "assignment_id": s.assignment_id,
            "assignment_title": assign.title if assign else "Practical Assignment",
            "course_id": course.id if course else None,
            "course_title": course.title if course else "Course",
            "user_id": s.user_id,
            "learner_name": user.full_name if user else "Learner",
            "learner_email": user.email if user else "",
            "submission_content": s.submission_content,
            "external_url": s.external_url,
            "status": s.status,
            "grade_score": s.grade_score,
            "evaluator_feedback": s.evaluator_feedback,
            "rubric": assign.rubric if assign else [],
            "submitted_at": s.submitted_at.isoformat() if s.submitted_at else None,
            "evaluated_at": s.evaluated_at.isoformat() if s.evaluated_at else None,
        })
    return success_response(results)


@router.post("/admin/submissions/{submission_id}/review")
def admin_review_submission(
    submission_id: str,
    req: AssignmentReviewRequest,
    current_user: Profile = Depends(require_role(["admin"])),
    db: Session = Depends(get_db)
):
    """Admin: approve or reject practical assignment submission with score & feedback."""
    sub = db.query(AssignmentSubmission).filter(AssignmentSubmission.id == submission_id).first()
    if not sub:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"code": "SUBMISSION_NOT_FOUND", "message": "Submission not found."}
        )

    review_status = req.status.lower()
    if review_status not in ["approved", "rejected"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"code": "INVALID_STATUS", "message": "Status must be 'approved' or 'rejected'."}
        )

    sub.status = review_status
    sub.grade_score = req.grade_score
    sub.evaluator_feedback = req.evaluator_feedback
    sub.evaluated_by_user_id = current_user.id
    sub.evaluated_at = datetime.now(timezone.utc)

    db.commit()
    db.refresh(sub)

    # Dispatch feedback notification to learner via Resend
    try:
        learner = db.query(Profile).filter(Profile.id == sub.user_id).first()
        assign = sub.assignment
        course = assign.course if assign else None
        if learner and course:
            import asyncio
            from backend.app.services.email_service import email_service
            try:
                loop = asyncio.get_running_loop()
                loop.create_task(
                    email_service.send_assignment_feedback_email(
                        to_email=learner.email,
                        recipient_name=learner.full_name,
                        course_title=course.title,
                        status=sub.status,
                        feedback=sub.evaluator_feedback or "Your project has been reviewed."
                    )
                )
            except RuntimeError:
                pass
    except Exception:
        pass

    return success_response({
        "submission_id": sub.id,
        "status": sub.status,
        "grade_score": sub.grade_score,
        "message": f"Submission marked as {sub.status}."
    })


@router.post("/admin/certificates/{credential_id}/revoke")
def admin_revoke_certificate(
    credential_id: str,
    req: RevokeCertificateRequest,
    current_user: Profile = Depends(require_role(["admin"])),
    db: Session = Depends(get_db)
):
    """Admin: revokes issued certificate with formal audit trail."""
    cert = revoke_certificate_by_admin(
        db=db,
        credential_id=credential_id,
        admin_user=current_user,
        reason=req.revocation_reason
    )
    return success_response({
        "credential_id": cert.credential_id,
        "status": cert.status,
        "revocation_reason": cert.revocation_reason,
        "revoked_at": cert.revoked_at.isoformat() if cert.revoked_at else None,
        "message": "Certificate successfully revoked."
    })


@router.get("/admin/analytics")
def admin_get_analytics(
    current_user: Profile = Depends(require_role(["admin"])),
    db: Session = Depends(get_db)
):
    """Admin: learner progress, enrollment engagement, and credential distribution."""
    total_courses = db.query(Course).count()
    total_enrollments = db.query(CourseEnrollment).count()
    completed_enrollments = db.query(CourseEnrollment).filter(CourseEnrollment.status == "completed").count()
    total_certificates_issued = db.query(LmsCertificate).filter(LmsCertificate.status == "valid").count()
    total_revoked = db.query(LmsCertificate).filter(LmsCertificate.status == "revoked").count()
    total_submissions = db.query(AssignmentSubmission).count()
    pending_submissions = db.query(AssignmentSubmission).filter(AssignmentSubmission.status == "submitted").count()

    course_stats = []
    for c in db.query(Course).all():
        enr_cnt = db.query(CourseEnrollment).filter(CourseEnrollment.course_id == c.id).count()
        comp_cnt = db.query(CourseEnrollment).filter(CourseEnrollment.course_id == c.id, CourseEnrollment.status == "completed").count()
        cert_cnt = db.query(LmsCertificate).filter(LmsCertificate.course_id == c.id, LmsCertificate.status == "valid").count()
        course_stats.append({
            "course_id": c.id,
            "title": c.title,
            "category": c.category,
            "enrolled": enr_cnt,
            "completed": comp_cnt,
            "completion_rate": round((comp_cnt / enr_cnt) * 100, 1) if enr_cnt > 0 else 0.0,
            "certificates_issued": cert_cnt
        })

    return success_response({
        "total_courses": total_courses,
        "total_enrollments": total_enrollments,
        "completed_enrollments": completed_enrollments,
        "overall_completion_rate": round((completed_enrollments / total_enrollments) * 100, 1) if total_enrollments > 0 else 0.0,
        "total_certificates_issued": total_certificates_issued,
        "total_revoked": total_revoked,
        "total_submissions": total_submissions,
        "pending_submissions": pending_submissions,
        "courses": course_stats
    })


@router.get("/admin/audit-logs")
def admin_get_audit_logs(
    limit: int = Query(50, ge=1, le=200),
    current_user: Profile = Depends(require_role(["admin"])),
    db: Session = Depends(get_db)
):
    """Admin: view audit logs for grading and certificate issuance."""
    logs = db.query(CertificateAuditLog).order_by(CertificateAuditLog.timestamp.desc()).limit(limit).all()
    results = []
    for l in logs:
        results.append({
            "id": l.id,
            "certificate_id": l.certificate_id,
            "action": l.action,
            "actor_id": l.actor_id,
            "details": l.details,
            "timestamp": l.timestamp.isoformat() if l.timestamp else None
        })
    return success_response(results)


# =============================================================================
# 9. YOUTUBE DATA API V3 INTEGRATION
# =============================================================================

@router.get("/youtube/video-info")
async def get_youtube_video_info(
    video_url_or_id: str = Query(..., description="YouTube video URL or 11-char ID")
):
    """
    Fetches real video metadata, duration, title, channel and high-res thumbnails
    using the YouTube Data API v3.
    """
    from backend.app.services.learning.youtube_service import youtube_service
    data = await youtube_service.get_video_details(video_url_or_id)
    return success_response(data)


@router.get("/youtube/search")
async def search_youtube_videos(
    query: str = Query(..., min_length=2, description="Search query for educational videos"),
    limit: int = Query(5, ge=1, le=10)
):
    """
    Searches YouTube Data API v3 for embeddable educational video resources.
    """
    from backend.app.services.learning.youtube_service import youtube_service
    results = await youtube_service.search_videos(query=query, max_results=limit)
    return success_response(results)

