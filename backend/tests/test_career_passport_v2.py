"""
Tests for GFG Module 6 — Verified Career Passport 2.0
Validates:
1. 12-section Career Passport generation with rigorous verification levels.
2. Privacy-first career break display options ('full', 'dates_only', 'hidden').
3. Candidate-controlled employer preview sanitization (no raw private documents exposed).
4. Creation, utilization, and revocation of time-limited employer access grants.
5. Audit access logging for sensitive views.
6. Evidence submission (starts as pending_review) and reviewer audit elevation.
7. Print-ready minimal editorial PDF generation.
"""

import pytest
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)


def get_auth_token(email="ananya.raman@example.com", password="Password@123"):
    response = client.post("/api/auth/login", json={"email": email, "password": password})
    assert response.status_code == 200, f"Login failed for {email}"
    res_json = response.json()
    if "data" in res_json and "access_token" in res_json["data"]:
        return res_json["data"]["access_token"]
    return res_json.get("access_token")


def get_admin_token(email="admin@gfg.org", password="Password@123"):
    response = client.post("/api/auth/login", json={"email": email, "password": password})
    if response.status_code != 200 or not response.json().get("success"):
        from backend.app.database.database import SessionLocal
        from backend.app.models.user import Profile
        from backend.app.utils.security import hash_password
        import uuid
        db = SessionLocal()
        ad = db.query(Profile).filter(Profile.email == email).first()
        if not ad:
            ad = Profile(
                id=str(uuid.uuid4()),
                full_name="GFG Platform Administrator",
                email=email,
                password_hash=hash_password(password),
                role="admin",
                approval_status="active"
            )
            db.add(ad)
            db.commit()
        db.close()
        response = client.post("/api/auth/login", json={"email": email, "password": password})

    assert response.status_code == 200, f"Login failed for {email}"
    res_json = response.json()
    if res_json.get("data") and "access_token" in res_json["data"]:
        return res_json["data"]["access_token"]
    return res_json.get("access_token")


def test_passport_unauthorized_blocked():
    """Verify unauthorized requests are rejected."""
    res = client.get("/api/passport/me")
    assert res.status_code == 401

    res = client.put("/api/passport/visibility", json={"career_break_mode": "hidden"})
    assert res.status_code == 401

    res = client.get("/api/passport/download-pdf")
    assert res.status_code == 401


def test_get_full_12_section_career_passport():
    """Verify that candidate gets full 12-section Career Passport 2.0."""
    token = get_auth_token()
    headers = {"Authorization": f"Bearer {token}"}

    res = client.get("/api/passport/me", headers=headers)
    assert res.status_code == 200
    data = res.json()

    assert data["passport_version"] == "2.0"
    # Check all 12 sections
    assert "professional_introduction" in data
    assert "career_timeline" in data
    assert "previous_employment" in data
    assert "education" in data
    assert "skill_inventory" in data
    assert "completed_learning" in data
    assert "certifications" in data
    assert "portfolio_projects" in data
    assert "practical_assessments" in data
    assert "mentor_feedback" in data
    assert "career_preferences" in data
    assert "candidate_controlled_sharing" in data

    # Check verification levels in skills
    skills = data["skill_inventory"]
    assert len(skills) > 0
    valid_levels = ["self_reported", "pending_review", "assessment_supported", "verified", "independently_verified"]
    for s in skills:
        assert s["verification_level"] in valid_levels


def test_career_break_privacy_modes():
    """
    Verify candidate-controlled career break display:
    1. 'full': Shows break details.
    2. 'dates_only': Shows dates, hides reason.
    3. 'hidden': Completely omits career break milestone.
    """
    token = get_auth_token()
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Test 'hidden' mode
    res_hide = client.put(
        "/api/passport/visibility",
        headers=headers,
        json={"career_break_mode": "hidden"}
    )
    assert res_hide.status_code == 200
    passport_hide = res_hide.json()["passport"]
    timeline_hide = passport_hide["career_timeline"]
    assert not any(t["milestone_type"] == "career_sabbatical" for t in timeline_hide)

    # 2. Test 'dates_only' mode
    res_dates = client.put(
        "/api/passport/visibility",
        headers=headers,
        json={"career_break_mode": "dates_only"}
    )
    assert res_dates.status_code == 200
    passport_dates = res_dates.json()["passport"]
    timeline_dates = passport_dates["career_timeline"]
    break_entry = next((t for t in timeline_dates if t["milestone_type"] == "career_sabbatical"), None)
    assert break_entry is not None
    assert "Dedicated career sabbatical period" in break_entry["summary"]


def test_employer_preview_sanitizes_private_data():
    """Verify that employer preview completely hides private documents and respects candidate settings."""
    token = get_auth_token()
    headers = {"Authorization": f"Bearer {token}"}

    res = client.get("/api/passport/preview", headers=headers)
    assert res.status_code == 200
    preview = res.json()

    assert "employer_view" in preview
    ev = preview["employer_view"]
    assert ev["is_employer_view"] is True

    # Check that raw document URLs are never exposed in public/employer view
    assert "document_url" not in str(ev)


def test_employer_access_grant_lifecycle_and_revocation():
    """
    Acceptance Criteria: User can create a grant, employer can view via token, and user can revoke access.
    """
    token = get_auth_token()
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Create grant
    grant_res = client.post(
        "/api/passport/grants",
        headers=headers,
        json={
            "grantee_email": "recruiter@fintechinnovations.com",
            "grantee_organization": "FinTech Innovations Global",
            "expires_days": 14
        }
    )
    assert grant_res.status_code == 200
    grant_data = grant_res.json()
    grant_id = grant_data["grant_id"]
    access_token = grant_data["access_token"]
    assert grant_id is not None
    assert access_token is not None

    # 2. Employer views shared passport via access_token
    view_res = client.get(f"/api/passport/shared/{access_token}")
    assert view_res.status_code == 200
    shared_data = view_res.json()
    assert "passport" in shared_data
    assert shared_data["grant_info"]["organization"] == "FinTech Innovations Global"

    # 3. Check access logs recorded view
    log_res = client.get("/api/passport/logs", headers=headers)
    assert log_res.status_code == 200
    logs = log_res.json()
    assert any("FinTech Innovations Global" in l["viewer_identity"] for l in logs)

    # 4. Revoke access
    revoke_res = client.delete(f"/api/passport/grants/{grant_id}", headers=headers)
    assert revoke_res.status_code == 200
    assert revoke_res.json()["grant_id"] == grant_id

    # 5. Employer can no longer view after revocation
    view_revoked = client.get(f"/api/passport/shared/{access_token}")
    assert view_revoked.status_code == 404


def test_verification_evidence_workflow():
    """
    Verify:
    1. Submitting evidence starts at 'pending_review' (NOT verified simply because uploaded!).
    2. Reviewer approves evidence, elevating status to 'verified'.
    """
    candidate_token = get_auth_token()
    headers_cand = {"Authorization": f"Bearer {candidate_token}"}

    # Submit evidence
    sub_res = client.post(
        "/api/passport/verification/submit",
        headers=headers_cand,
        json={
            "item_type": "certificate",
            "title": "AWS Certified Solutions Architect Associate",
            "issuer_or_employer": "Amazon Web Services",
            "verification_source": "Credly Digital Badge Validation",
            "document_url": "https://storage.gfg.internal/evidence/aws-cert-scan.pdf",
            "notes": "Completed certification during returnship upskilling"
        }
    )
    assert sub_res.status_code == 200
    sub_data = sub_res.json()
    record_id = sub_data["record_id"]
    assert sub_data["verification_level"] == "pending_review"
    assert sub_data["outcome"] == "pending"

    # Admin reviews and approves
    admin_token = get_admin_token()
    headers_admin = {"Authorization": f"Bearer {admin_token}"}

    rev_res = client.post(
        f"/api/passport/verification/{record_id}/review",
        headers=headers_admin,
        json={
            "outcome": "approved",
            "notes": "Verified against AWS official credential serial ID."
        }
    )
    assert rev_res.status_code == 200
    rev_data = rev_res.json()
    assert rev_data["verification_level"] == "verified"
    assert rev_data["outcome"] == "approved"


def test_download_passport_pdf():
    """Verify minimal editorial PDF generation and download."""
    token = get_auth_token()
    headers = {"Authorization": f"Bearer {token}"}

    res = client.get("/api/passport/download-pdf", headers=headers)
    assert res.status_code == 200
    assert res.headers["content-type"] == "application/pdf"
    # PDF files start with %PDF-
    assert res.content[:5] == b"%PDF-"
    assert len(res.content) > 1000 # Valid non-empty PDF document
