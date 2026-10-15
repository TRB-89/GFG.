import pytest
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

import uuid

def test_public_registration_role_restriction():
    # 1. Admin registration via public endpoint must be rejected
    res_admin = client.post("/api/auth/register", json={
        "full_name": "Infiltrator Admin",
        "email": f"infiltrator_{uuid.uuid4().hex[:6]}@test.com",
        "password": "Password@123",
        "account_type": "admin"
    })
    assert res_admin.status_code == 200
    assert res_admin.json()["success"] is False
    assert res_admin.json()["error"]["code"] == "RESTRICTED_ROLE"

    # 2. Employer registration sets approval_status to pending_approval
    res_emp = client.post("/api/auth/register", json={
        "full_name": "Self Sign Employer",
        "email": f"employer_{uuid.uuid4().hex[:6]}@test.com",
        "password": "Password@123",
        "account_type": "employer"
    })
    assert res_emp.status_code == 200
    assert res_emp.json()["success"] is True

def test_onboarding_unauthorized():
    # Attempting to fetch draft without authentication must fail
    res = client.get("/api/candidates/onboarding/draft")
    assert res.status_code == 401

def test_onboarding_draft_lifecycle():
    # 1. Authenticate as candidate
    login_res = client.post("/api/auth/login", json={
        "email": "ananya.raman@example.com",
        "password": "Password@123"
    }).json()
    token = login_res["data"]["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Fetch initial draft
    draft_res = client.get("/api/candidates/onboarding/draft", headers=headers)
    assert draft_res.status_code == 200
    assert draft_res.json()["success"] is True

    # 3. Save draft at step 3
    draft_payload = {
        "current_step": 3,
        "draft_data": {
            "previous_job_title": "Data Analyst",
            "industry": "Technology",
            "experience_years": 4.5,
            "career_break_start_date": "2022-07-01",
            "career_break_end_date": "2025-06-30",
            "career_break_reason": "Maternity",
            "skills": ["SQL", "Python", "Power BI"]
        }
    }
    save_res = client.post("/api/candidates/onboarding/draft", json=draft_payload, headers=headers)
    assert save_res.status_code == 200
    assert save_res.json()["data"]["current_step"] == 3

    # 4. Resume draft
    resume_res = client.get("/api/candidates/onboarding/draft", headers=headers)
    assert resume_res.status_code == 200
    res_data = resume_res.json()["data"]
    assert res_data["current_step"] == 3
    assert res_data["draft_data"]["previous_job_title"] == "Data Analyst"

    # 5. Reset / clear draft
    del_res = client.delete("/api/candidates/onboarding/draft", headers=headers)
    assert del_res.status_code == 200
    assert del_res.json()["success"] is True

def test_onboarding_complete_flow():
    # Authenticate as candidate
    login_res = client.post("/api/auth/login", json={
        "email": "ananya.raman@example.com",
        "password": "Password@123"
    }).json()
    token = login_res["data"]["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    complete_payload = {
        "previous_job_title": "Lead Analytics Specialist",
        "industry": "Financial Technology",
        "experience_years": 4.5,
        "qualifications": "Master of Computer Applications",
        "existing_skills": ["SQL", "Python", "Pandas", "Power BI", "AWS"],
        "career_break_start_date": "2022-07-01",
        "career_break_end_date": "2025-06-30",
        "currently_on_break": False,
        "career_break_reason": "Maternity",
        "career_goals": ["Return to the same profession", "Work remotely"],
        "weekly_learning_hours": 20,
        "preferred_work_mode": "hybrid",
        "preferred_location": "Bengaluru, IN",
        "language_preference": "English",
        "salary_expectation": "₹45,000 / month",
        "profile_visibility": "private",
        "opt_into_employer_sharing": True
    }

    res = client.post("/api/candidates/onboarding/complete", json=complete_payload, headers=headers)
    assert res.status_code == 200
    data = res.json()["data"]
    assert data["candidate"]["previous_job_title"] == "Lead Analytics Specialist"
    assert "personalized_plan" in data
    assert len(data["personalized_plan"]["learning_modules"]) == 8
    assert data["personalized_plan"]["passport_preview"]["sharing_consent_granted"] is True
