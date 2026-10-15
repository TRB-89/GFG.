import pytest
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

def get_candidate_token():
    res = client.post("/api/auth/login", json={
        "email": "ananya.raman@example.com",
        "password": "Password@123"
    })
    assert res.status_code == 200
    res_json = res.json()
    if "data" in res_json and "access_token" in res_json["data"]:
        return res_json["data"]["access_token"]
    return res_json.get("access_token")

def get_employer_token():
    res = client.post("/api/auth/login", json={
        "email": "hr@novatech.com",
        "password": "Password@123"
    })
    assert res.status_code == 200
    res_json = res.json()
    if "data" in res_json and "access_token" in res_json["data"]:
        return res_json["data"]["access_token"]
    return res_json.get("access_token")


def test_get_all_sectors_and_opportunity_types():
    res = client.get("/api/jobs/sectors/all")
    assert res.status_code == 200
    data = res.json()["data"]
    assert "sectors" in data
    assert "opportunity_types" in data
    assert len(data["sectors"]) >= 12
    # Verify specific sectors exist
    sector_ids = [s["id"] for s in data["sectors"]]
    for expected in ["software_it", "data_analytics", "teaching_education", "healthcare", "banking_finance", "human_resources"]:
        assert expected in sector_ids

def test_list_jobs_with_sector_and_type_filters():
    token = get_candidate_token()
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Filter by data_analytics
    res = client.get("/api/jobs?sector=data_analytics", headers=headers)
    assert res.status_code == 200
    items = res.json()["data"]["data"]
    assert len(items) > 0
    for it in items:
        assert it["sector"] == "data_analytics"

    # 2. Filter returnships only
    res = client.get("/api/jobs?is_returnship=true", headers=headers)
    assert res.status_code == 200
    r_items = res.json()["data"]["data"]
    assert len(r_items) > 0

    # 3. Filter verified only
    res = client.get("/api/jobs?is_verified_only=true", headers=headers)
    assert res.status_code == 200
    v_items = res.json()["data"]["data"]
    assert len(v_items) > 0
    for v in v_items:
        assert v["is_verified_employer"] is True

def test_smart_matching_and_explanation():
    token = get_candidate_token()
    headers = {"Authorization": f"Bearer {token}"}

    res = client.get("/api/jobs", headers=headers)
    assert res.status_code == 200
    jobs = res.json()["data"]["data"]
    assert len(jobs) > 0

    first_job = jobs[0]
    assert "compatibility" in first_job
    compat = first_job["compatibility"]
    assert compat is not None
    assert "match_score" in compat
    assert 20 <= compat["match_score"] <= 100

    assert "match_explanation" in compat
    expl = compat["match_explanation"]
    assert "requirements_satisfied" in expl
    assert "important_missing_skills" in expl
    assert "working_arrangement_compatibility" in expl
    assert "areas_for_improvement" in expl
    assert "disclaimer" in expl
    assert "Do not imply" in expl["disclaimer"]

def test_curated_returnships_endpoint():
    res = client.get("/api/jobs/returnships/curated")
    assert res.status_code == 200
    data = res.json()["data"]
    assert "returnships" in data
    assert len(data["returnships"]) > 0
    sample = data["returnships"][0]
    assert "learning_objectives" in sample
    assert "mentorship_available" in sample
    assert sample["mentorship_available"] is True
    assert "stipend_amount_description" in sample

def test_saved_opportunity_lifecycle():
    token = get_candidate_token()
    headers = {"Authorization": f"Bearer {token}"}

    # Get a job ID
    res = client.get("/api/jobs", headers=headers)
    jobs = res.json()["data"]["data"]
    job_id = jobs[0]["id"]

    # 1. Save opportunity
    save_res = client.post(f"/api/jobs/{job_id}/save", headers=headers)
    assert save_res.status_code == 200
    assert save_res.json()["data"]["is_saved"] is True

    # 2. Verify it appears in candidate's saved list
    list_res = client.get("/api/jobs/candidate/saved", headers=headers)
    assert list_res.status_code == 200
    saved_jobs = list_res.json()["data"]
    saved_ids = [s["id"] for s in saved_jobs]
    assert job_id in saved_ids

    # 3. Unsave opportunity
    del_res = client.delete(f"/api/jobs/{job_id}/save", headers=headers)
    assert del_res.status_code == 200
    assert del_res.json()["data"]["is_saved"] is False

    # 4. Confirm it is removed
    list_res2 = client.get("/api/jobs/candidate/saved", headers=headers)
    saved_ids2 = [s["id"] for s in list_res2.json()["data"]]
    assert job_id not in saved_ids2

def test_report_opportunity():
    res = client.get("/api/jobs")
    jobs = res.json()["data"]["data"]
    job_id = jobs[0]["id"]

    report_res = client.post(f"/api/jobs/{job_id}/report", json={
        "reason": "suspicious_listing",
        "details": "Checking community safety reporting workflow."
    })
    assert report_res.status_code == 200
    assert "report_id" in report_res.json()["data"]

def test_application_withdraw_flow():
    token = get_candidate_token()
    headers = {"Authorization": f"Bearer {token}"}

    # Find a job candidate has not applied to yet
    apps_res = client.get("/api/candidates/me/applications", headers=headers)
    applied_ids = [a["job_id"] for a in apps_res.json()["data"]]

    jobs_res = client.get("/api/jobs", headers=headers)
    all_jobs = jobs_res.json()["data"]["data"]

    target_job = None
    for j in all_jobs:
        if j["id"] not in applied_ids:
            target_job = j
            break

    if target_job:
        # Apply
        app_res = client.post(f"/api/jobs/{target_job['id']}/apply", json={
            "cover_note": "Testing candidate withdrawal workflow."
        }, headers=headers)
        assert app_res.status_code == 200
        app_id = app_res.json()["data"]["id"]

        # Withdraw
        withdraw_res = client.post(f"/api/applications/{app_id}/withdraw", headers=headers)
        assert withdraw_res.status_code == 200
        assert withdraw_res.json()["data"]["status"] == "withdrawn"
