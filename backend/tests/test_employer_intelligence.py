import pytest
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

def test_employer_registration_unverified_by_default():
    """Employer registration must NEVER automatically grant verified status."""
    payload = {
        "company_name": "Apex Global Systems",
        "official_website": "https://apexglobal.example.com",
        "authorized_representative": "Rajeshwari Iyer (Director of Talent)",
        "business_contact_email": "talent@apexglobal.example.com",
        "business_contact_phone": "+91 98765 43210",
        "location": "Bengaluru, India",
        "hiring_charter_accepted": True
    }
    response = client.post("/api/employer/register", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    company = data["company"]
    assert company["verified"] is False
    assert company["verification_status"] == "pending_review"
    assert company["hiring_charter_accepted"] is True
    assert "verification_notice" in data
    assert "manual compliance review" in data["verification_notice"].lower()

def test_employer_registration_rejects_without_charter():
    """Employer registration must fail if hiring charter is not accepted."""
    payload = {
        "company_name": "Uncommitted Corp",
        "official_website": "https://uncommitted.example.com",
        "authorized_representative": "Unknown Rep",
        "business_contact_email": "info@uncommitted.example.com",
        "hiring_charter_accepted": False
    }
    response = client.post("/api/employer/register", json=payload)
    err_json = response.json()
    err_msg = err_json.get("error", {}).get("message") or err_json.get("message", "")
    assert "charter" in err_msg.lower()

def test_employer_profile():
    response = client.get("/api/employer/profile?company_name=Nova%20Technologies")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert data["profile"]["name"] == "Nova Technologies"

def test_employer_dashboard_metrics():
    response = client.get("/api/employer/dashboard?company_name=Nova%20Technologies")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    metrics = data["dashboard_metrics"]
    assert metrics["active_opportunities"] >= 0
    assert metrics["applications_received"] >= 0
    assert metrics["interviews_scheduled"] >= 0
    assert metrics["offers_made"] >= 0
    assert metrics["candidates_onboarded"] >= 0
    assert "returnship_cohorts" in data
    assert len(data["returnship_cohorts"]) > 0

def test_consented_candidates_discovery():
    """Verify candidate discovery respects consent, masks undisclosed break reasons, and provides revocation rights."""
    response = client.get("/api/employer/candidates/consented?company_name=Nova%20Technologies")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert "candidates" in data
    assert len(data["candidates"]) > 0
    assert "consent_policy" in data
    assert "revoke" in data["consent_policy"]["revocation_right"].lower()

    for cand in data["candidates"]:
        assert "evidence_categories" in cand
        evidence = cand["evidence_categories"]
        assert "self_reported_experience" in evidence
        assert "assessment_supported_skills" in evidence
        assert "verified_credentials" in evidence
        assert "portfolio_projects" in evidence
        # Check that undisclosed break reasons are masked
        if not cand.get("break_reason_disclosed"):
            assert cand.get("break_reason_masked") is True
            assert "raw" not in cand.get("break_display_summary", "").lower()

def test_skill_first_matching_explanation():
    """Match explanation must break down evidence categories without personality or discriminatory scoring."""
    payload = {
        "candidate_id": "cand_demo_01",
        "candidate_name": "Priya Sharma",
        "candidate_skills": ["Python", "FastAPI", "PostgreSQL", "System Design"],
        "job_title": "Senior Backend Returnship Fellow",
        "job_required_skills": ["Python", "FastAPI", "SQL", "Docker"],
        "job_preferred_skills": ["System Design", "AWS", "CI/CD"],
        "years_pre_break_experience": 5,
        "assessment_score": 88.5,
        "verified_credentials": ["AWS Certified Developer", "FastAPI Mastery Certificate"],
        "portfolio_projects": ["Distributed Task Queue (GitHub: priya/async-task-engine)", "Healthcare Appointment Booking System"]
    }
    response = client.post("/api/employer/candidates/explain-match", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    analysis = data["match_analysis"]
    assert analysis["overall_match_score"] > 0
    assert "evidence_breakdown" in analysis
    breakdown = analysis["evidence_breakdown"]
    assert "assessment_supported_skills" in breakdown
    assert "verified_credentials" in breakdown
    assert "portfolio_projects" in breakdown
    assert "self_reported_experience" in breakdown
    # Verify non-discriminatory guarantee
    assert "fair_hiring_guarantee" in analysis
    assert "no personality scoring" in analysis["fair_hiring_guarantee"].lower()

def test_returnship_builder_creation():
    payload = {
        "company_name": "Nova Technologies",
        "program_title": "Cloud Platform Returnship Cohort 2026",
        "job_function": "DevOps & Cloud Infrastructure",
        "duration_months": 6,
        "compensation_stipend": "INR 85,000 / month with full health coverage",
        "working_arrangement": "Hybrid (2 days in Bengaluru office, 3 days remote)",
        "eligibility_criteria": "Professionals with 3+ years prior experience returning after a 1+ year career pause",
        "learning_objectives": [
            "Modern Kubernetes and container orchestration",
            "Terraform infrastructure as code",
            "Production observability with Prometheus and Grafana"
        ],
        "mentor_assignment": "Sunita Rao (Principal Site Reliability Engineer)",
        "evaluation_criteria": [
            "Milestone project delivery at week 12",
            "Peer code review quality and architecture adherence",
            "Production on-call shadowing readiness at week 20"
        ],
        "potential_progression_options": "Direct transition to Senior SRE / Staff Infrastructure Engineer upon completion"
    }
    response = client.post("/api/employer/returnships/create", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    prog = data["program"]
    assert prog["program_title"] == payload["program_title"]
    assert prog["duration_months"] == 6
    assert len(prog["learning_objectives"]) == 3
    assert "AUDIT_PROGRAM_CREATED" in str(data)

def test_hr_toolkit_templates():
    response = client.get("/api/employer/hr-toolkit/templates")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    templates = data["templates"]
    expected_templates = [
        "skills_based_interview_rubric",
        "career_break_inclusive_hiring_guide",
        "structured_candidate_evaluation_scorecard",
        "returnship_onboarding_checklist",
        "mentor_checkin_cadence",
        "first_100_days_support_roadmap"
    ]
    for key in expected_templates:
        assert key in templates
        assert len(templates[key]["sections"]) > 0
        assert templates[key]["title"] != ""

def test_employer_analytics_with_formulas():
    response = client.get("/api/employer/analytics?company_name=Nova%20Technologies")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    analytics = data["analytics"]
    assert analytics["total_applications"] > 0
    assert analytics["interview_conversion_rate_percent"] >= 0
    assert analytics["offer_conversion_rate_percent"] >= 0
    assert analytics["time_to_fill_median_days"] > 0
    assert analytics["returnship_completion_rate_percent"] >= 0
    assert analytics["post_returnship_retention_12m_percent"] >= 0
    assert "metric_formulas" in analytics
    assert "Total Applications" in analytics["metric_formulas"]["interview_conversion_rate"]
    # Verify non-speculative claim disclaimer
    assert "data_integrity_statement" in analytics
    assert "empirical" in analytics["data_integrity_statement"].lower()

def test_application_advance_and_audit_logs():
    advance_payload = {
        "company_name": "Nova Technologies",
        "application_id": 1,
        "new_status": "interview_scheduled",
        "reviewer_name": "Ananya Sen (Talent Lead)",
        "notes": "Candidate passed portfolio review with outstanding system design evidence."
    }
    response = client.post("/api/employer/applications/1/advance", json=advance_payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert data["new_status"] == "interview_scheduled"

    # Check audit log
    audit_resp = client.get("/api/employer/audit-logs?company_name=Nova%20Technologies")
    assert audit_resp.status_code == 200
    logs = audit_resp.json()["audit_logs"]
    assert len(logs) > 0
    assert any("STAGE_ADVANCE" in log["action"] for log in logs)
