import os
import io
import secrets
import qrcode
from datetime import datetime, timezone
from typing import Dict, Any, Tuple, Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from backend.app.config.settings import settings
from backend.app.models.user import Profile
from backend.app.models.learning import (
    Course,
    Lesson,
    CourseEnrollment,
    LessonProgress,
    Assessment,
    AssessmentAttempt,
    PracticalAssignment,
    AssignmentSubmission,
    LmsCertificate,
    CertificateAuditLog,
)
from backend.app.models.candidate import CandidateProfile, LearningProgress
from backend.app.services.ai.digital_twin_engine import record_digital_twin_event


def generate_credential_id(course_slug: str) -> str:
    """
    Generate an authentic, non-guessable unique credential identifier.
    Format: GFG-2026-<COURSE_PREFIX>-<CRYPTOGRAPHIC_TOKEN>
    Example: GFG-2026-WDS-9F4B2E81
    """
    prefix_map = {
        "workplace-digital-skills": "WDS",
        "excel-for-career-returners": "EXL",
        "career-comeback-readiness": "CCR",
    }
    course_prefix = prefix_map.get(course_slug, course_slug[:3].upper())
    random_token = secrets.token_hex(4).upper()
    year = datetime.now(timezone.utc).year
    return f"GFG-{year}-{course_prefix}-{random_token}"


def generate_qr_code_svg(verification_url: str) -> str:
    """
    Generate clean, vector-embeddable QR Code SVG pointing to verification URL.
    """
    import qrcode.image.svg
    factory = qrcode.image.svg.SvgPathImage
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_M,
        box_size=10,
        border=2,
        image_factory=factory
    )
    qr.add_data(verification_url)
    qr.make(fit=True)
    svg_img = qr.make_image()
    stream = io.BytesIO()
    svg_img.save(stream)
    return stream.getvalue().decode("utf-8")


def check_course_eligibility(
    db: Session,
    course_id: str,
    user_id: str
) -> Tuple[bool, Dict[str, Any]]:
    """
    Evaluates server-side completion invariants for certificate issuance:
    1. 100% of mandatory lessons marked completed in lesson_progress
    2. Final assessment attempt passed (>= 70% passing threshold)
    3. Practical assignment submission reviewed and marked 'approved'
    """
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"code": "COURSE_NOT_FOUND", "message": "Course does not exist."}
        )

    # 1. Mandatory lessons check
    mandatory_lessons = db.query(Lesson).filter(
        Lesson.course_id == course_id,
        Lesson.is_mandatory == True
    ).all()
    mandatory_lesson_ids = [l.id for l in mandatory_lessons]
    total_mandatory = len(mandatory_lesson_ids)

    completed_progress = db.query(LessonProgress).filter(
        LessonProgress.course_id == course_id,
        LessonProgress.user_id == user_id,
        LessonProgress.lesson_id.in_(mandatory_lesson_ids),
        LessonProgress.is_completed == True
    ).all()
    completed_mandatory_count = len(completed_progress)
    lessons_eligible = (completed_mandatory_count >= total_mandatory) and (total_mandatory > 0)

    # 2. Assessment check
    assessment = db.query(Assessment).filter(Assessment.course_id == course_id).first()
    assessment_passed = False
    highest_score = 0.0
    if assessment:
        passed_attempt = db.query(AssessmentAttempt).filter(
            AssessmentAttempt.assessment_id == assessment.id,
            AssessmentAttempt.user_id == user_id,
            AssessmentAttempt.passed == True
        ).order_by(AssessmentAttempt.score_percentage.desc()).first()
        if passed_attempt:
            assessment_passed = True
            highest_score = passed_attempt.score_percentage
    else:
        # If no assessment attached, treated as satisfied
        assessment_passed = True
        highest_score = 100.0

    # 3. Practical assignment check
    assignment = db.query(PracticalAssignment).filter(
        PracticalAssignment.course_id == course_id
    ).first()
    assignment_approved = False
    submission_status = "none"
    if assignment and assignment.is_mandatory_for_certificate:
        submission = db.query(AssignmentSubmission).filter(
            AssignmentSubmission.assignment_id == assignment.id,
            AssignmentSubmission.user_id == user_id
        ).order_by(AssignmentSubmission.submitted_at.desc()).first()
        if submission:
            submission_status = submission.status
            if submission.status == "approved":
                assignment_approved = True
        else:
            submission_status = "not_submitted"
    else:
        assignment_approved = True
        submission_status = "not_required"

    all_eligible = lessons_eligible and assessment_passed and assignment_approved

    checklist = {
        "course_id": course.id,
        "course_title": course.title,
        "is_eligible": all_eligible,
        "lessons": {
            "total_mandatory": total_mandatory,
            "completed": completed_mandatory_count,
            "is_satisfied": lessons_eligible,
        },
        "assessment": {
            "required": assessment is not None,
            "passing_threshold": assessment.passing_score_percentage if assessment else 70,
            "highest_score": highest_score,
            "is_satisfied": assessment_passed,
        },
        "assignment": {
            "required": assignment is not None and assignment.is_mandatory_for_certificate,
            "status": submission_status,
            "is_satisfied": assignment_approved,
        }
    }

    return all_eligible, checklist


def issue_course_certificate(
    db: Session,
    course_id: str,
    user_id: str
) -> LmsCertificate:
    """
    Issues authentic GFG Certificate of Achievement after verifying all eligibility criteria.
    Enforces duplicate prevention.
    """
    # Check if certificate already exists for this learner & course
    existing_cert = db.query(LmsCertificate).filter(
        LmsCertificate.user_id == user_id,
        LmsCertificate.course_id == course_id
    ).first()
    if existing_cert:
        return existing_cert

    user = db.query(Profile).filter(Profile.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"code": "USER_NOT_FOUND", "message": "User not found."}
        )

    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"code": "COURSE_NOT_FOUND", "message": "Course not found."}
        )

    # Verify eligibility server-side
    is_eligible, checklist = check_course_eligibility(db, course_id, user_id)
    if not is_eligible:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "code": "INELIGIBLE_FOR_CERTIFICATE",
                "message": "Certificate requirements not met. Please complete all mandatory lessons, pass the assessment, and obtain approval on your practical assignment.",
                "checklist": checklist
            }
        )

    # Base frontend verification URL
    frontend_base = settings.cors_origins[0] if settings.cors_origins else "http://localhost:3000"
    credential_id = generate_credential_id(course.slug)
    verification_url = f"{frontend_base}/verify/{credential_id}"
    qr_svg = generate_qr_code_svg(verification_url)

    certificate = LmsCertificate(
        credential_id=credential_id,
        user_id=user.id,
        course_id=course.id,
        recipient_name=user.full_name,
        course_title=course.title,
        course_version=course.version,
        learning_outcomes=course.learning_outcomes or [],
        issued_at=datetime.now(timezone.utc),
        status="valid",
        issuer_name="GFG — Gap For Good Credential Governance Board",
        issuer_signatory="Dr. Meera Iyer, Academic Director & Returnship Dean",
        verification_url=verification_url,
        qr_code_svg=qr_svg,
        is_public_directory_consented=True,
    )
    db.add(certificate)
    db.flush()

    # Create audit log
    audit_log = CertificateAuditLog(
        certificate_id=certificate.id,
        action="issued",
        actor_id=user.id,
        details={
            "credential_id": credential_id,
            "recipient_name": user.full_name,
            "course_title": course.title,
            "checklist": checklist
        },
        timestamp=datetime.now(timezone.utc)
    )
    db.add(audit_log)

    # Update enrollment to completed
    enrollment = db.query(CourseEnrollment).filter(
        CourseEnrollment.course_id == course.id,
        CourseEnrollment.user_id == user.id
    ).first()
    if enrollment:
        enrollment.status = "completed"
        enrollment.completed_at = datetime.now(timezone.utc)
        enrollment.progress_percentage = 100

    # Also sync with candidate profile learning progress & digital twin
    if user.candidate_profile:
        cand_id = user.candidate_profile.id
        # Update or add to Candidate LearningProgress
        cand_lp = db.query(LearningProgress).filter(
            LearningProgress.candidate_id == cand_id,
            LearningProgress.course_name == course.title
        ).first()
        if not cand_lp:
            cand_lp = LearningProgress(
                candidate_id=cand_id,
                course_name=course.title,
                provider="GFG Learning Hub",
                category=course.category,
                progress_percentage=100,
                status="completed",
                started_at=enrollment.enrolled_at if enrollment else datetime.now(timezone.utc),
                completed_at=datetime.now(timezone.utc)
            )
            db.add(cand_lp)
        else:
            cand_lp.progress_percentage = 100
            cand_lp.status = "completed"
            cand_lp.completed_at = datetime.now(timezone.utc)

        # Record Digital Twin event
        try:
            record_digital_twin_event(
                db=db,
                candidate_id=cand_id,
                event_type="certificate_added",
                summary=f"Earned authentic verified certificate: {course.title}",
                details={
                    "credential_id": credential_id,
                    "course_id": course.id,
                    "category": course.category
                }
            )
        except Exception:
            pass

    db.commit()
    db.refresh(certificate)

    # Dispatch official Certificate notification email via Resend
    try:
        import asyncio
        from backend.app.services.email_service import email_service
        download_url = f"{frontend_base}/api/learning/certificates/{certificate.credential_id}/download-pdf"
        try:
            loop = asyncio.get_running_loop()
            loop.create_task(
                email_service.send_certificate_email(
                    to_email=user.email,
                    recipient_name=user.full_name,
                    course_title=course.title,
                    credential_id=certificate.credential_id,
                    verification_url=certificate.verification_url,
                    pdf_download_url=download_url
                )
            )
        except RuntimeError:
            pass
    except Exception:
        pass

    return certificate


def get_public_certificate_verification(
    db: Session,
    credential_id: str
) -> Dict[str, Any]:
    """
    Public certificate verification endpoint.
    Retrieves certificate details without leaking sensitive user information (DPDP compliance).
    """
    cert = db.query(LmsCertificate).filter(
        LmsCertificate.credential_id == credential_id.strip().upper()
    ).first()

    if not cert:
        return {
            "status": "not_found",
            "credential_id": credential_id,
            "compliance_statement": "No authentic credential found in GFG Registry matching this identifier."
        }

    # Log public verification action in audit trail
    try:
        audit = CertificateAuditLog(
            certificate_id=cert.id,
            action="verified_publicly",
            actor_id="public_verifier",
            details={"credential_id": cert.credential_id},
            timestamp=datetime.now(timezone.utc)
        )
        db.add(audit)
        db.commit()
    except Exception:
        pass

    if cert.status == "revoked":
        return {
            "status": "revoked",
            "credential_id": cert.credential_id,
            "course_title": cert.course_title,
            "recipient_name": cert.recipient_name if cert.is_public_directory_consented else "Verified Learner [Privacy Protected]",
            "issued_at": cert.issued_at,
            "revocation_reason": cert.revocation_reason or "Credential administratively revoked.",
            "revoked_at": cert.revoked_at,
            "issuer_name": cert.issuer_name,
            "compliance_statement": "Notice: This credential was revoked and is no longer valid."
        }

    return {
        "status": "valid",
        "credential_id": cert.credential_id,
        "course_title": cert.course_title,
        "recipient_name": cert.recipient_name if cert.is_public_directory_consented else "Verified Learner [Privacy Protected]",
        "issued_at": cert.issued_at,
        "issuer_name": cert.issuer_name,
        "issuer_signatory": cert.issuer_signatory,
        "learning_outcomes": cert.learning_outcomes,
        "verification_url": cert.verification_url,
        "qr_code_svg": cert.qr_code_svg,
        "compliance_statement": "Authentic credential verified directly against GFG Credential Transparency Registry."
    }


def revoke_certificate_by_admin(
    db: Session,
    credential_id: str,
    admin_user: Profile,
    reason: str
) -> LmsCertificate:
    """
    Administratively revokes an issued certificate with audited rationale.
    """
    cert = db.query(LmsCertificate).filter(
        LmsCertificate.credential_id == credential_id.strip().upper()
    ).first()
    if not cert:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"code": "CERTIFICATE_NOT_FOUND", "message": "Certificate not found."}
        )

    cert.status = "revoked"
    cert.revocation_reason = reason
    cert.revoked_at = datetime.now(timezone.utc)

    audit = CertificateAuditLog(
        certificate_id=cert.id,
        action="revoked",
        actor_id=admin_user.id,
        details={
            "admin_name": admin_user.full_name,
            "admin_email": admin_user.email,
            "reason": reason
        },
        timestamp=datetime.now(timezone.utc)
    )
    db.add(audit)
    db.commit()
    db.refresh(cert)
    return cert
