import pytest
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.database.database import SessionLocal
from backend.app.models.user import Profile
from backend.app.models.candidate import CandidateProfile, CareerBreak, Skill, CandidateSkill
from backend.app.models.job import Job
from backend.app.models.company import Company
from backend.app.services.matching_service import compute_compatibility_score
from datetime import date

client = TestClient(app)

def get_auth_token(email: str, password: str = "Password@123") -> str:
    res = client.post("/api/auth/login", json={"email": email, "password": password})
    assert res.status_code == 200
    data = res.json()
    if "data" in data and "access_token" in data["data"]:
        return data["data"]["access_token"]
    if "access_token" in data:
        return data["access_token"]
    if "token" in data:
        return data["token"]
    raise KeyError(f"No token found in response: {data}")

def test_security_audit_endpoint():
    """Verify system-level security audit endpoint enforces admin role and reports hardening posture."""
    # Unauthorized attempt
    unauth_res = client.get("/api/admin/security-audit")
    assert unauth_res.status_code == 401

    # Candidate attempt (should be forbidden)
    cand_token = get_auth_token("ananya.raman@example.com")
    cand_res = client.get("/api/admin/security-audit", headers={"Authorization": f"Bearer {cand_token}"})
    assert cand_res.status_code == 403

    # Admin attempt
    admin_token = get_auth_token("admin@gfg.com")
    admin_res = client.get("/api/admin/security-audit", headers={"Authorization": f"Bearer {admin_token}"})
    assert admin_res.status_code == 200
    data = admin_res.json()["data"]
    assert data["security_posture"]["authentication"]["server_side_verification"] is True
    assert data["security_posture"]["role_based_access_control"]["client_side_only_reliance"] is False
    assert data["security_posture"]["document_storage_hardening"]["public_resume_scraping_prevented"] is True
    assert "DPDP Act" in data["security_posture"]["privacy_compliance"]["framework"]
    assert data["security_posture"]["responsible_ai"]["autonomous_rejection_allowed"] is False

def test_resume_authorization_enforced():
    """Verify uploaded resumes cannot be scraped by unauthenticated or unauthorized users."""
    # Unauthenticated download attempt
    res = client.get("/api/upload/resumes/sample_candidate_resume.pdf")
    assert res.status_code == 401

    # Candidate accessing another candidate's private resume
    # Candidate Priya trying to access Ananya's resume
    priya_token = get_auth_token("priya.sharma@example.com")
    priya_res = client.get(
        "/api/upload/resumes/ananya_raman_resume_v2.pdf",
        headers={"Authorization": f"Bearer {priya_token}"}
    )
    # Should either be 403 Forbidden or 404 if file not found, but NOT 200 bypass
    assert priya_res.status_code in [403, 404]

    # Admin access check
    admin_token = get_auth_token("admin@gfg.com")
    admin_res = client.get(
        "/api/upload/resumes/nonexistent_file.pdf",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    # Admin reaches file existence check (404 instead of 403)
    assert admin_res.status_code in [200, 404]

def test_dpdp_privacy_policy_and_consent_management():
    """Verify formal DPDP Act privacy disclosures, consent configuration, and one-click revocation."""
    # Policy check
    policy_res = client.get("/api/privacy/policy")
    assert policy_res.status_code == 200
    pdata = policy_res.json()["data"]
    assert "DPDP Act 2023" in pdata["jurisdiction"]
    assert "grievance_officer" in pdata["data_fiduciary"]
    assert len(pdata["lawful_purposes"]) >= 3
    assert len(pdata["prohibited_collections"]) >= 3
    assert "right_to_erasure" in pdata["data_principal_rights"]

    # Candidate consent retrieval
    cand_token = get_auth_token("ananya.raman@example.com")
    consent_res = client.get("/api/privacy/consent-settings", headers={"Authorization": f"Bearer {cand_token}"})
    assert consent_res.status_code == 200
    cdata = consent_res.json()["data"]
    assert "career_break_visibility" in cdata

    # Update consent
    update_res = client.post(
        "/api/privacy/consent-settings",
        json={
            "employer_discovery_opt_in": True,
            "career_break_visibility": "employers",
            "ai_personalization_opt_in": True,
            "anonymized_research_opt_in": True
        },
        headers={"Authorization": f"Bearer {cand_token}"}
    )
    assert update_res.status_code == 200
    assert update_res.json()["data"]["career_break_visibility"] == "employers"

    # Revoke all consent
    revoke_res = client.post("/api/privacy/revoke-all-consent", headers={"Authorization": f"Bearer {cand_token}"})
    assert revoke_res.status_code == 200
    rdata = revoke_res.json()["data"]
    assert rdata["career_break_visibility"] == "private"
    assert rdata["employer_discovery_opt_in"] is False

def test_dpdp_data_portability_export():
    """Verify complete personal data export bundle per DPDP Act Data Portability standard."""
    cand_token = get_auth_token("ananya.raman@example.com")
    export_res = client.get("/api/privacy/export-data", headers={"Authorization": f"Bearer {cand_token}"})
    assert export_res.status_code == 200
    bundle = export_res.json()["data"]
    assert "DPDP-EXPORT" in bundle["export_id"]
    assert bundle["account"]["email"] == "ananya.raman@example.com"
    assert "candidate_profile" in bundle
    assert "skills" in bundle["candidate_profile"]
    assert "career_breaks" in bundle["candidate_profile"]
    assert "applications" in bundle["candidate_profile"]

def test_responsible_ai_dossier_and_oversight():
    """Verify algorithmic transparency dossier documents formulas, sources, limitations, and no autonomous rejection."""
    res = client.get("/api/responsible-ai/dossier")
    assert res.status_code == 200
    dossier = res.json()["data"]
    assert "GFG-RAI" in dossier["framework_version"]
    assert len(dossier["modules"]) >= 3

    module_names = [m["module_name"] for m in dossier["modules"]]
    assert any("Compatibility" in name for name in module_names)
    assert any("Roadmap" in name for name in module_names)
    assert any("Passport" in name for name in module_names)

    for m in dossier["modules"]:
        assert len(m["inputs_used"]) >= 3
        assert len(m["scoring_formula"]) > 10
        assert len(m["known_limitations"]) >= 1
        assert "human" in m["human_oversight"].lower()

    # Prohibited practices check
    assert any("autonomous" in p.lower() for p in dossier["prohibited_algorithmic_practices"])
    assert any("facial" in p.lower() for p in dossier["prohibited_algorithmic_practices"])

def test_responsible_ai_challenge_and_opt_out():
    """Verify candidate can challenge algorithmic recommendations and opt out of automated ranking."""
    cand_token = get_auth_token("ananya.raman@example.com")

    # Challenge submission
    chal_res = client.post(
        "/api/responsible-ai/challenge-recommendation",
        json={
            "module_name": "Smart Opportunity Compatibility Scoring",
            "recommendation_id": "job-novatech-data-01",
            "reason_for_challenge": "Scoring did not adequately account for my recently completed Python Data Pipelines capstone project.",
            "corrected_input_data": {"verified_capstone": "Python Data Pipelines passed with distinction"}
        },
        headers={"Authorization": f"Bearer {cand_token}"}
    )
    assert chal_res.status_code == 200
    chal_data = chal_res.json()["data"]
    assert "DISP-" in chal_data["dispute"]["dispute_id"]
    assert chal_data["dispute"]["status"] == "QUEUED_FOR_HUMAN_REVIEW"

    # List my challenges
    my_chal_res = client.get("/api/responsible-ai/challenges/my", headers={"Authorization": f"Bearer {cand_token}"})
    assert my_chal_res.status_code == 200
    assert len(my_chal_res.json()["data"]) >= 1

    # Opt out of automated ranking
    opt_res = client.post(
        "/api/responsible-ai/opt-out",
        json={"opt_out_of_algorithmic_ranking": True, "opt_out_of_future_simulation": False},
        headers={"Authorization": f"Bearer {cand_token}"}
    )
    assert opt_res.status_code == 200
    assert opt_res.json()["data"]["active_browsing_mode"] == "CHRONOLOGICAL_UNFILTERED"

def test_bias_audit_career_break_duration_fairness():
    """
    Empirical bias test:
    Verify that an extended career break (e.g. 5-year break) does NOT artificially downgrade
    a candidate's compatibility score compared to a 1-year break with identical skills.
    """
    db = SessionLocal()
    try:
        # Load sample job
        job = db.query(Job).filter(Job.employment_type == "returnship").first()
        if not job:
            job = db.query(Job).first()

        # Synthetic Candidate A (1-year break)
        cand_short = CandidateProfile(
            user_id="test-user-short",
            headline="Data Analyst",
            years_experience=4.0,
            available_hours_per_day=4,
            preferred_work_mode="remote"
        )
        cb_short = CareerBreak(
            candidate=cand_short,
            break_type="maternity",
            start_date=date(2025, 1, 1),
            end_date=date(2026, 1, 1)
        )
        cand_short.career_breaks.append(cb_short)

        # Synthetic Candidate B (5-year break, identical experience and hours)
        cand_long = CandidateProfile(
            user_id="test-user-long",
            headline="Data Analyst",
            years_experience=4.0,
            available_hours_per_day=4,
            preferred_work_mode="remote"
        )
        cb_long = CareerBreak(
            candidate=cand_long,
            break_type="maternity",
            start_date=date(2021, 1, 1),
            end_date=date(2026, 1, 1)
        )
        cand_long.career_breaks.append(cb_long)

        score_short = compute_compatibility_score(cand_short, job)["match_score"]
        score_long = compute_compatibility_score(cand_long, job)["match_score"]

        # Assert no unfair discrimination: score difference must be <= 6 points
        diff = abs(score_short - score_long)
        assert diff <= 6.0, f"Break duration bias detected! Difference is {diff} points."

        # Public bias audit endpoint
        audit_res = client.get("/api/responsible-ai/bias-audit-report")
        assert audit_res.status_code == 200
        assert audit_res.json()["data"]["status"] == "VERIFIED_BIAS_FREE"
    finally:
        db.close()

def test_demo_reset_restricted_and_functional():
    """Verify demo reset is restricted to authorized admin and restores sample accounts."""
    # Candidate cannot trigger reset
    cand_token = get_auth_token("ananya.raman@example.com")
    res_forbidden = client.post("/api/admin/demo-reset", headers={"Authorization": f"Bearer {cand_token}"})
    assert res_forbidden.status_code == 403

    # Admin triggers reset
    admin_token = get_auth_token("admin@gfg.com")
    res_ok = client.post("/api/admin/demo-reset", headers={"Authorization": f"Bearer {admin_token}"})
    assert res_ok.status_code == 200
    data = res_ok.json()["data"]
    assert "Ananya Raman" in data["sample_candidate"]
    assert "Nova Tech" in data["sample_employer"]
