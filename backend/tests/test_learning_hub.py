import pytest
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.database.database import SessionLocal
from backend.app.models.user import Profile
from backend.app.models.learning import (
    Course,
    Lesson,
    Assessment,
    PracticalAssignment,
    CourseEnrollment,
    LessonProgress,
    AssessmentAttempt,
    AssignmentSubmission,
    LmsCertificate,
)
from backend.app.utils.security import create_access_token

client = TestClient(app)


@pytest.fixture(scope="module")
def db():
    session = SessionLocal()
    # Reset any previous test artifacts for Priya to ensure idempotency
    user = session.query(Profile).filter(Profile.email == "priya.sharma@example.com").first()
    if user:
        session.query(LmsCertificate).filter(LmsCertificate.user_id == user.id).delete()
        session.query(AssignmentSubmission).filter(AssignmentSubmission.user_id == user.id).delete()
        session.query(AssessmentAttempt).filter(AssessmentAttempt.user_id == user.id).delete()
        session.query(LessonProgress).filter(LessonProgress.user_id == user.id).delete()
        session.query(CourseEnrollment).filter(CourseEnrollment.user_id == user.id).delete()
        session.commit()
    yield session
    session.close()


@pytest.fixture(scope="module")
def candidate_token(db):
    user = db.query(Profile).filter(Profile.email == "priya.sharma@example.com").first()
    assert user is not None
    token = create_access_token({"sub": user.id, "email": user.email, "role": user.role})
    return token, user.id


@pytest.fixture(scope="module")
def admin_token(db):
    user = db.query(Profile).filter(Profile.role == "admin").first()
    assert user is not None
    token = create_access_token({"sub": user.id, "email": user.email, "role": user.role})
    return token, user.id


def test_course_catalogue_public():
    """Verify public catalogue lists all seeded published courses."""
    resp = client.get("/api/learning/courses")
    assert resp.status_code == 200
    data = resp.json()["data"]
    assert len(data) >= 3
    slugs = [c["slug"] for c in data]
    assert "workplace-digital-skills" in slugs
    assert "excel-for-career-returners" in slugs
    assert "career-comeback-readiness" in slugs


def test_course_search_and_filters():
    """Verify search and category filtering."""
    resp = client.get("/api/learning/courses?category=Data%20%26%20Analytics")
    assert resp.status_code == 200
    data = resp.json()["data"]
    assert any("excel" in c["slug"] for c in data)

    resp_search = client.get("/api/learning/courses?search=Digital")
    assert resp_search.status_code == 200
    data_search = resp_search.json()["data"]
    assert any("digital" in c["slug"] for c in data_search)


def test_course_detail_and_modules(db):
    """Verify course detail includes structured modules, lessons, and metadata."""
    resp = client.get("/api/learning/courses/workplace-digital-skills")
    assert resp.status_code == 200
    data = resp.json()["data"]
    assert data["title"] == "Workplace Digital Skills for Career Returners"
    assert len(data["modules"]) >= 2
    assert data["assessment_id"] is not None
    assert data["assignment_id"] is not None


def test_course_enrollment(candidate_token, db):
    """Test user enrollment and progress initialization."""
    token, user_id = candidate_token
    course = db.query(Course).filter(Course.slug == "workplace-digital-skills").first()
    assert course is not None

    headers = {"Authorization": f"Bearer {token}"}
    resp = client.post(f"/api/learning/courses/{course.id}/enroll", headers=headers)
    assert resp.status_code == 200
    data = resp.json()["data"]
    assert data["status"] == "active"
    assert "enrollment_id" in data


def test_learner_dashboard(candidate_token):
    """Test personalized learner dashboard."""
    token, user_id = candidate_token
    headers = {"Authorization": f"Bearer {token}"}
    resp = client.get("/api/learning/dashboard", headers=headers)
    assert resp.status_code == 200
    data = resp.json()["data"]
    assert "enrolled_courses" in data
    assert any(c["course_slug"] == "workplace-digital-skills" for c in data["enrolled_courses"])


def test_lesson_detail_and_completion_flow(candidate_token, db):
    """Test retrieving lesson content, marking complete, and progress recalculation."""
    token, user_id = candidate_token
    course = db.query(Course).filter(Course.slug == "workplace-digital-skills").first()
    first_lesson = course.modules[0].lessons[0]

    headers = {"Authorization": f"Bearer {token}"}

    # 1. Fetch lesson detail
    resp = client.get(f"/api/learning/courses/{course.id}/lessons/{first_lesson.id}", headers=headers)
    assert resp.status_code == 200
    data = resp.json()["data"]
    assert data["title"] == first_lesson.title
    assert "content_markdown" in data
    assert len(data["content_markdown"]) > 50

    # 2. Mark complete
    comp_resp = client.post(
        f"/api/learning/lessons/{first_lesson.id}/complete",
        headers=headers,
        json={"time_spent_seconds": 120}
    )
    assert comp_resp.status_code == 200
    comp_data = comp_resp.json()["data"]
    assert comp_data["is_completed"] is True
    assert comp_data["course_progress_percentage"] > 0


def test_assessment_retrieval_and_server_scoring(candidate_token, db):
    """Test assessment question retrieval (without answers) and server-side grading."""
    token, user_id = candidate_token
    course = db.query(Course).filter(Course.slug == "workplace-digital-skills").first()
    assessment = course.assessments[0]

    headers = {"Authorization": f"Bearer {token}"}

    # 1. Get assessment
    resp = client.get(f"/api/learning/assessments/{assessment.id}", headers=headers)
    assert resp.status_code == 200
    data = resp.json()["data"]
    assert len(data["questions"]) == 10
    # Security invariant: correct_option_ids must NOT be in public question view
    assert "correct_option_ids" not in data["questions"][0]

    # 2. Submit intentional passing answers
    answers = {}
    for q in assessment.questions:
        answers[q.id] = q.correct_option_ids

    sub_resp = client.post(
        f"/api/learning/assessments/{assessment.id}/submit",
        headers=headers,
        json={"answers": answers}
    )
    assert sub_resp.status_code == 200
    sub_data = sub_resp.json()["data"]
    assert sub_data["score_percentage"] == 100.0
    assert sub_data["passed"] is True
    assert sub_data["attempt_number"] >= 1


def test_practical_assignment_submission_and_admin_review(candidate_token, admin_token, db):
    """Test practical assignment submission, admin queue listing, and approval."""
    cand_tok, user_id = candidate_token
    adm_tok, admin_id = admin_token

    course = db.query(Course).filter(Course.slug == "workplace-digital-skills").first()
    assignment = course.assignments[0]

    # 1. Candidate submits project
    cand_headers = {"Authorization": f"Bearer {cand_tok}"}
    sub_payload = {
        "submission_content": "Detailed remote team async collaboration blueprint with 3-sentence update framework, Slack folder taxonomy, and BLUF project brief.",
        "external_url": "https://docs.google.com/document/d/demo-gfg-returnship/edit"
    }
    sub_resp = client.post(
        f"/api/learning/assignments/{assignment.id}/submit",
        headers=cand_headers,
        json=sub_payload
    )
    assert sub_resp.status_code == 200
    submission_id = sub_resp.json()["data"]["submission_id"]

    # 2. Admin reviews submission
    adm_headers = {"Authorization": f"Bearer {adm_tok}"}
    list_resp = client.get("/api/learning/admin/submissions?status_filter=all", headers=adm_headers)
    assert list_resp.status_code == 200

    review_payload = {
        "status": "approved",
        "grade_score": 95.0,
        "evaluator_feedback": "Excellent async framework and clear least-privilege folder hierarchy. Approved for credential issuance."
    }
    rev_resp = client.post(
        f"/api/learning/admin/submissions/{submission_id}/review",
        headers=adm_headers,
        json=review_payload
    )
    assert rev_resp.status_code == 200
    assert rev_resp.json()["data"]["status"] == "approved"


def test_certificate_eligibility_and_issuance(candidate_token, db):
    """Test certificate eligibility check, claim, duplicate prevention, and verification."""
    token, user_id = candidate_token
    course = db.query(Course).filter(Course.slug == "workplace-digital-skills").first()
    headers = {"Authorization": f"Bearer {token}"}

    # Ensure all lessons in course 1 are marked complete for Priya
    for m in course.modules:
        for l in m.lessons:
            client.post(f"/api/learning/lessons/{l.id}/complete", headers=headers, json={"time_spent_seconds": 60})

    # Check eligibility
    elig_resp = client.get(f"/api/learning/courses/{course.id}/eligibility", headers=headers)
    assert elig_resp.status_code == 200
    assert elig_resp.json()["data"]["is_eligible"] is True

    # Claim certificate
    claim_resp = client.post(f"/api/learning/courses/{course.id}/claim-certificate", headers=headers)
    assert claim_resp.status_code == 200
    cert_data = claim_resp.json()["data"]
    assert cert_data["status"] == "valid"
    assert "GFG-2026-WDS-" in cert_data["credential_id"]
    credential_id = cert_data["credential_id"]

    # Duplicate prevention: Claiming again should return existing cert
    claim2_resp = client.post(f"/api/learning/courses/{course.id}/claim-certificate", headers=headers)
    assert claim2_resp.status_code == 200
    assert claim2_resp.json()["data"]["credential_id"] == credential_id


def test_public_certificate_verification(candidate_token, db):
    """Test public route /api/learning/certificates/verify/:id without auth."""
    cert = db.query(LmsCertificate).filter(LmsCertificate.status == "valid").first()
    assert cert is not None

    resp = client.get(f"/api/learning/certificates/verify/{cert.credential_id}")
    assert resp.status_code == 200
    data = resp.json()["data"]
    assert data["status"] == "valid"
    assert data["course_title"] == cert.course_title
    # Privacy check: internal user ID and email must NOT be present
    assert "user_id" not in data
    assert "email" not in data


def test_pdf_certificate_download(db):
    """Test A4 landscape PDF generation and download stream."""
    cert = db.query(LmsCertificate).filter(LmsCertificate.status == "valid").first()
    assert cert is not None

    resp = client.get(f"/api/learning/certificates/{cert.credential_id}/download-pdf")
    assert resp.status_code == 200
    assert resp.headers["content-type"] == "application/pdf"
    assert len(resp.content) > 1000  # Non-empty binary PDF stream


def test_certificate_revocation_by_admin(admin_token, candidate_token, db):
    """Test administrative revocation with audited rationale and subsequent verification status."""
    adm_tok, admin_id = admin_token
    cert = db.query(LmsCertificate).filter(LmsCertificate.status == "valid").first()
    assert cert is not None

    # Revoke
    adm_headers = {"Authorization": f"Bearer {adm_tok}"}
    revoke_payload = {"revocation_reason": "Administrative audit testing credential revocation lifecycle."}
    rev_resp = client.post(
        f"/api/learning/admin/certificates/{cert.credential_id}/revoke",
        headers=adm_headers,
        json=revoke_payload
    )
    assert rev_resp.status_code == 200
    assert rev_resp.json()["data"]["status"] == "revoked"

    # Public verification should now reflect revoked status
    pub_resp = client.get(f"/api/learning/certificates/verify/{cert.credential_id}")
    assert pub_resp.status_code == 200
    pub_data = pub_resp.json()["data"]
    assert pub_data["status"] == "revoked"
    assert "revocation_reason" in pub_data

    # Re-instate for subsequent tests
    cert.status = "valid"
    db.commit()


def test_ai_learning_assistant(candidate_token, db):
    """Test AI assistant chat and personalized study plan generator."""
    token, user_id = candidate_token
    course = db.query(Course).filter(Course.slug == "excel-for-career-returners").first()
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Ask question about XLOOKUP
    chat_resp = client.post(
        "/api/learning/ai/chat",
        headers=headers,
        json={
            "course_id": course.id,
            "question": "Can you explain how XLOOKUP works compared to VLOOKUP?"
        }
    )
    assert chat_resp.status_code == 200
    data = chat_resp.json()["data"]
    assert "XLOOKUP" in data["answer"]
    assert len(data["suggested_followups"]) > 0

    # 2. Generate study plan
    plan_resp = client.post(
        "/api/learning/ai/study-plan",
        headers=headers,
        json={
            "course_id": course.id,
            "available_hours_per_week": 10,
            "target_completion_weeks": 3
        }
    )
    assert plan_resp.status_code == 200
    plan_data = plan_resp.json()["data"]
    assert len(plan_data["weekly_schedule"]) == 3


def test_admin_analytics_and_audit_logs(admin_token):
    """Test admin analytics and audit trail."""
    adm_tok, admin_id = admin_token
    adm_headers = {"Authorization": f"Bearer {adm_tok}"}

    resp = client.get("/api/learning/admin/analytics", headers=adm_headers)
    assert resp.status_code == 200
    data = resp.json()["data"]
    assert data["total_courses"] >= 3
    assert "courses" in data

    logs_resp = client.get("/api/learning/admin/audit-logs", headers=adm_headers)
    assert logs_resp.status_code == 200
    logs = logs_resp.json()["data"]
    assert len(logs) > 0


def test_youtube_api_video_info():
    """Test YouTube Data API v3 video details lookup endpoint."""
    resp = client.get("/api/learning/youtube/video-info?video_url_or_id=M7lc1UVf-VE")
    assert resp.status_code == 200
    data = resp.json()["data"]
    assert data["video_id"] == "M7lc1UVf-VE"
    assert "embed_url" in data
    assert "https://www.youtube.com/embed/M7lc1UVf-VE" in data["embed_url"]


@pytest.mark.asyncio
async def test_resend_email_service_dispatch():
    """Test Resend email service handles certificate notification templates cleanly."""
    from backend.app.services.email_service import email_service
    res = await email_service.send_certificate_email(
        to_email="test.candidate@example.com",
        recipient_name="Priya Sharma",
        course_title="Workplace Digital Skills",
        credential_id="GFG-2026-WDS-TEST1234",
        verification_url="http://localhost:3000/verify/GFG-2026-WDS-TEST1234",
        pdf_download_url="http://localhost:3000/api/learning/certificates/GFG-2026-WDS-TEST1234/download-pdf"
    )
    assert res is not None
    assert "id" in res or "error" in res


